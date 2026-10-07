import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStandings(stageId: string) {
    return this.prisma.stageStanding.findMany({
      where: { stageId },
      orderBy: [{ rank: 'asc' }],
      include: {
        // We join manually since StageStanding doesn't use Prisma relations directly
      },
    });
  }

  async getTournamentLeaderboard(tournamentId: string, stageId?: string) {
    if (stageId) {
      const standings = await this.prisma.stageStanding.findMany({
        where: { stageId },
        orderBy: [{ rank: 'asc' }, { totalPts: 'desc' }, { totalKills: 'desc' }],
      });
      const teamIds = [...new Set(standings.map((s) => s.teamId))];
      const teams = await this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        include: { captain: true },
      });
      const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

      return standings.map((s, i) => ({
        rank: s.rank || i + 1,
        team: teamMap[s.teamId],
        totalPts: s.totalPts,
        totalKills: s.totalKills,
        matchesPlayed: s.matchesPlayed,
        bestPlacement: s.bestPlacement,
      }));
    }

    // Get all stage IDs for tournament
    const stages = await this.prisma.stage.findMany({
      where: { tournamentId },
      select: { id: true },
    });
    const stageIds = stages.map((s) => s.id);

    const standings = await this.prisma.stageStanding.findMany({
      where: { stageId: { in: stageIds } },
    });

    // Aggregate across all stages so each team appears exactly once
    const byTeam = new Map<string, { totalPts: number; totalKills: number; matchesPlayed: number; bestPlacement: number | null }>();
    for (const s of standings) {
      const prev = byTeam.get(s.teamId) || { totalPts: 0, totalKills: 0, matchesPlayed: 0, bestPlacement: null };
      prev.totalPts += s.totalPts;
      prev.totalKills += s.totalKills;
      prev.matchesPlayed += s.matchesPlayed;
      if (s.bestPlacement != null) {
        prev.bestPlacement = prev.bestPlacement != null ? Math.min(prev.bestPlacement, s.bestPlacement) : s.bestPlacement;
      }
      byTeam.set(s.teamId, prev);
    }

    const teamIds = [...byTeam.keys()];
    const teams = await this.prisma.team.findMany({
      where: { id: { in: teamIds } },
      include: { captain: true },
    });
    const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

    return [...byTeam.entries()]
      .map(([teamId, stats]) => ({
        team: teamMap[teamId],
        ...stats,
      }))
      .filter((r) => r.team)
      .sort((a, b) => b.totalPts - a.totalPts || b.totalKills - a.totalKills)
      .map((r, i) => ({ rank: i + 1, ...r }));
  }

  // Module J — Overall team rating aggregated across every tournament/stage played.
  async getGlobalTeamRankings(limit = 50) {
    const standings = await this.prisma.stageStanding.findMany();

    const byTeam = new Map<string, { totalPts: number; totalKills: number; matchesPlayed: number; bestPlacement: number | null }>();
    for (const s of standings) {
      const agg = byTeam.get(s.teamId) || { totalPts: 0, totalKills: 0, matchesPlayed: 0, bestPlacement: null };
      agg.totalPts += s.totalPts;
      agg.totalKills += s.totalKills;
      agg.matchesPlayed += s.matchesPlayed;
      if (s.bestPlacement != null) {
        agg.bestPlacement = agg.bestPlacement != null ? Math.min(agg.bestPlacement, s.bestPlacement) : s.bestPlacement;
      }
      byTeam.set(s.teamId, agg);
    }

    if (byTeam.size === 0) {
      const allTeams = await this.prisma.team.findMany({
        take: limit,
        include: { captain: true },
        orderBy: { createdAt: 'asc' },
      });
      return allTeams.map((team, i) => ({
        rank: i + 1,
        team,
        totalPts: 0,
        totalKills: 0,
        matchesPlayed: 0,
        bestPlacement: null,
      }));
    }

    const teamIds = [...byTeam.keys()];
    const teams = await this.prisma.team.findMany({
      where: { id: { in: teamIds } },
      include: { captain: true },
    });
    const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

    return [...byTeam.entries()]
      .map(([teamId, agg]) => ({ team: teamMap[teamId], ...agg }))
      .filter((r) => r.team)
      .sort((a, b) => b.totalPts - a.totalPts || b.totalKills - a.totalKills)
      .slice(0, limit)
      .map((r, i) => ({ rank: i + 1, ...r }));
  }

  async getRecentWinners(limit = 5) {
    const payouts = await this.prisma.payout.findMany({
      where: {
        placement: { lte: 3 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        team: true,
        tournament: true,
      },
    });

    if (payouts.length > 0) {
      return payouts.map((p) => ({
        team: p.team.name,
        event: p.tournament.name,
        prize: p.amount,
        placement: p.placement === 1 ? '1st Place' : p.placement === 2 ? '2nd Place' : `${p.placement}rd Place`,
      }));
    }

    const topStandings = await this.prisma.stageStanding.findMany({
      where: {
        bestPlacement: { in: [1, 2, 3] },
      },
      take: limit,
      include: {
        team: true,
        stage: { include: { tournament: true } },
      },
      orderBy: { totalPts: 'desc' },
    });

    return topStandings.map((s) => ({
      team: s.team.name,
      event: s.stage?.tournament?.name || 'Pro Series',
      prize: s.stage?.tournament?.prizePool
        ? Math.round(s.stage.tournament.prizePool * (s.bestPlacement === 1 ? 0.5 : s.bestPlacement === 2 ? 0.3 : 0.2))
        : 0,
      placement: s.bestPlacement === 1 ? '1st Place' : s.bestPlacement === 2 ? '2nd Place' : `${s.bestPlacement}rd Place`,
    }));
  }

  async getTeamOverallRating(teamId: string) {
    const standings = await this.prisma.stageStanding.findMany({ where: { teamId } });
    const totalPts = standings.reduce((sum, s) => sum + s.totalPts, 0);
    const totalKills = standings.reduce((sum, s) => sum + s.totalKills, 0);
    const matchesPlayed = standings.reduce((sum, s) => sum + s.matchesPlayed, 0);
    const bestPlacement = standings.reduce<number | null>(
      (best, s) => (s.bestPlacement != null ? (best != null ? Math.min(best, s.bestPlacement) : s.bestPlacement) : best),
      null,
    );
    return { teamId, totalPts, totalKills, matchesPlayed, bestPlacement, stagesPlayed: standings.length };
  }

  async exportCsv(tournamentId: string, stageId?: string): Promise<string> {
    const data = await this.getTournamentLeaderboard(tournamentId, stageId);
    const rows = data.map((d) => ({
      rank: d.rank,
      teamName: d.team?.name || '',
      teamTag: d.team?.tag || '',
      totalPts: d.totalPts,
      totalKills: d.totalKills,
      matchesPlayed: d.matchesPlayed,
      bestPlacement: d.bestPlacement || '',
    }));

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'rank', title: 'Rank' },
        { id: 'teamName', title: 'Squad Name' },
        { id: 'teamTag', title: 'Tag' },
        { id: 'totalPts', title: 'Total Points' },
        { id: 'totalKills', title: 'Total Kills' },
        { id: 'matchesPlayed', title: 'Matches Played' },
        { id: 'bestPlacement', title: 'Best Placement' },
      ],
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
  }
}
