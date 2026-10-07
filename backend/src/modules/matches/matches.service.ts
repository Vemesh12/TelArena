import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { EventsGateway } from '../../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

const REVIEW_WINDOW_MINUTES = 30;

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async createMatch(groupId: string, roomId: string) {
    return this.prisma.match.create({
      data: { groupId, roomId },
      include: { group: true, room: true },
    });
  }

  /**
   * Module I — Enter match results.
   * Auto-calculates placement pts + kill pts from tournament scoring config.
   */
  async enterResults(
    matchId: string,
    results: { teamId: string; placement: number; kills: number; evidenceUrl?: string }[],
    actorId?: string,
    actorRole?: string,
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        group: {
          include: {
            stage: { include: { tournament: { include: { scoringConfig: true } } } },
          },
        },
        room: { include: { slots: true } },
      },
    });
    if (!match) throw new NotFoundException('Match not found');

    const scoringConfig = match.group.stage.tournament.scoringConfig;
    const placementTable: any = scoringConfig?.placementTable || {};
    const killPoints = scoringConfig?.killPoints || 1;

    // Module H — teams that no-showed forfeit the match: last placement, zero points.
    const noShowTeamIds = new Set(
      (match.room?.slots || []).filter((s) => s.noShow).map((s) => s.teamId),
    );
    const lastPlacement = match.room?.slots?.length || 12;

    const upserts = results.map((r) => {
      const isForfeit = noShowTeamIds.has(r.teamId);
      const placement = isForfeit ? lastPlacement : r.placement;
      const kills = isForfeit ? 0 : r.kills;
      const placementKey = placement <= 10 ? String(placement) : '10+';
      const placementPts = isForfeit ? 0 : (placementTable[placementKey] || 0);
      const killPts = isForfeit ? 0 : kills * killPoints;
      const totalPts = placementPts + killPts;
      const status = isForfeit ? 'forfeited' : 'provisional';

      return this.prisma.matchResult.upsert({
        where: { matchId_teamId: { matchId, teamId: r.teamId } },
        update: {
          placement,
          kills,
          placementPts,
          killPts,
          totalPts,
          evidenceUrl: r.evidenceUrl,
          status: status as any,
        },
        create: {
          matchId,
          teamId: r.teamId,
          placement,
          kills,
          placementPts,
          killPts,
          totalPts,
          evidenceUrl: r.evidenceUrl,
          status: status as any,
        },
      });
    });

    const saved = await Promise.all(upserts);

    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'MATCH_RESULTS_ENTER',
        entityType: 'Match',
        entityId: matchId,
        after: { results },
      });
    }

    return saved;
  }

  async flagDisputed(matchResultId: string) {
    return this.prisma.matchResult.update({
      where: { id: matchResultId },
      data: { status: 'disputed' },
    });
  }

  async getAllMatches() {
    return this.prisma.match.findMany({
      include: {
        group: { include: { stage: { include: { tournament: true } } } },
        room: { include: { slots: { include: { team: true } } } },
        results: { include: { team: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getMatch(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        results: { include: { team: true } },
        room: { include: { slots: { include: { team: true } } } },
      },
    });
  }

  async getGroupMatches(groupId: string) {
    return this.prisma.match.findMany({
      where: { groupId },
      include: { results: { include: { team: true } }, room: true },
    });
  }

  /**
   * Finalize a provisional result — updates cumulative standings deterministically.
   */
  async finalizeResult(matchResultId: string, actorId?: string, actorRole?: string) {
    const existing = await this.prisma.matchResult.findUnique({
      where: { id: matchResultId },
    });
    if (!existing) throw new NotFoundException('Match result not found');
    if (existing.status === 'finalized') {
      throw new BadRequestException('This match result has already been finalized');
    }

    const result = await this.prisma.matchResult.update({
      where: { id: matchResultId },
      data: { status: 'finalized', finalizedAt: new Date() },
      include: {
        team: true,
        match: {
          include: {
            group: {
              include: {
                stage: true,
              },
            },
          },
        },
      },
    });

    const stageId = result.match.group.stageId;
    await this.recalculateStageStandings(stageId);

    // Fetch tournament ID and trigger real-time WebSocket leaderboard broadcast
    const tournamentId = result.match.group.stage.tournamentId;
    const standings = await this.prisma.stageStanding.findMany({
      where: { stageId },
      orderBy: [{ rank: 'asc' }],
    });
    this.eventsGateway.emitLeaderboardUpdate(tournamentId, standings);

    await this.notificationsService.send(
      result.team.captainId,
      'match_result',
      'Match Result Finalized',
      `${result.team.name} placed #${result.placement} with ${result.kills} kills (${result.totalPts} pts). Standings updated.`,
    );

    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'MATCH_RESULT_FINALIZE',
        entityType: 'MatchResult',
        entityId: matchResultId,
        after: { placement: result.placement, kills: result.kills, totalPts: result.totalPts },
      });
    }

    return result;
  }

  /**
   * Recompute full stage standings from finalized match results deterministically.
   * Eliminates score duplication and mathematical drift.
   */
  async recalculateStageStandings(stageId: string) {
    // Find all groups in this stage
    const groups = await this.prisma.group.findMany({
      where: { stageId },
      select: { id: true },
    });
    const groupIds = groups.map((g) => g.id);

    // Fetch all finalized match results across this stage
    const finalizedResults = await this.prisma.matchResult.findMany({
      where: {
        match: { groupId: { in: groupIds } },
        status: 'finalized',
      },
    });

    // Aggregate stats per team
    const teamMap = new Map<string, { totalPts: number; totalKills: number; matchesPlayed: number; bestPlacement: number }>();
    for (const r of finalizedResults) {
      const prev = teamMap.get(r.teamId) || {
        totalPts: 0,
        totalKills: 0,
        matchesPlayed: 0,
        bestPlacement: r.placement,
      };
      teamMap.set(r.teamId, {
        totalPts: prev.totalPts + r.totalPts,
        totalKills: prev.totalKills + r.kills,
        matchesPlayed: prev.matchesPlayed + 1,
        bestPlacement: Math.min(prev.bestPlacement, r.placement),
      });
    }

    // Upsert aggregated standings
    for (const [teamId, stats] of teamMap.entries()) {
      await this.prisma.stageStanding.upsert({
        where: { stageId_teamId: { stageId, teamId } },
        update: {
          totalPts: stats.totalPts,
          totalKills: stats.totalKills,
          matchesPlayed: stats.matchesPlayed,
          bestPlacement: stats.bestPlacement,
        },
        create: {
          stageId,
          teamId,
          totalPts: stats.totalPts,
          totalKills: stats.totalKills,
          matchesPlayed: stats.matchesPlayed,
          bestPlacement: stats.bestPlacement,
        },
      });
    }

    await this.rerank(stageId);
  }

  private async rerank(stageId: string) {
    const standings = await this.prisma.stageStanding.findMany({
      where: { stageId },
      orderBy: [{ totalPts: 'desc' }, { totalKills: 'desc' }],
    });
    await Promise.all(
      standings.map((s, i) =>
        this.prisma.stageStanding.update({
          where: { id: s.id },
          data: { rank: i + 1 },
        }),
      ),
    );
  }

  // Auto-finalize provisional results after 30 minutes, skipping any with open disputes
  @Cron('*/5 * * * *')
  async autoFinalizeResults() {
    const cutoff = new Date(Date.now() - REVIEW_WINDOW_MINUTES * 60 * 1000);
    const provisional = await this.prisma.matchResult.findMany({
      where: {
        status: { in: ['provisional', 'forfeited'] },
        createdAt: { lte: cutoff },
        match: {
          disputes: {
            none: { status: { in: ['open', 'more_evidence_requested', 'escalated'] } },
          },
        },
      },
      include: { match: { include: { group: true } } },
    });
    for (const r of provisional) {
      try {
        await this.finalizeResult(r.id);
      } catch (err: any) {
        // Skip already-finalized or locked results
      }
    }
  }
}
