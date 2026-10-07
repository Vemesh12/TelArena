import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createStage(tournamentId: string, data: {
    name: string; order: number; date?: Date; advancementRule?: any;
  }) {
    return this.prisma.stage.create({
      data: { ...data, tournamentId },
    });
  }

  async getStages(tournamentId: string) {
    return this.prisma.stage.findMany({
      where: { tournamentId },
      include: {
        groups: { include: { teams: { include: { team: true } }, matches: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Module G — Generate groups for a stage.
   * Randomly assigns registered teams into N groups.
   */
  async generateGroups(stageId: string, groupCount: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        tournament: {
          include: {
            registrations: {
              where: { status: { in: ['confirmed', 'registered'] } },
              include: { team: true },
            },
          },
        },
      },
    });
    if (!stage) throw new NotFoundException('Stage not found');

    let teams: any[] = [];

    // If this is stage > 1, check if previous stage had advancing teams
    if (stage.order > 1) {
      const prevStage = await this.prisma.stage.findFirst({
        where: { tournamentId: stage.tournamentId, order: stage.order - 1 },
      });
      if (prevStage) {
        const advRule = (prevStage.advancementRule as any) || {};
        const topN = advRule.topN || 12;
        const prevStandings = await this.prisma.stageStanding.findMany({
          where: { stageId: prevStage.id },
          orderBy: [{ totalPts: 'desc' }, { totalKills: 'desc' }],
          take: topN,
          include: { team: true },
        });
        if (prevStandings.length > 0) {
          teams = prevStandings.map((s) => s.team);
        }
      }
    }

    if (teams.length === 0) {
      teams = stage.tournament.registrations.map((r: any) => r.team);
    }

    if (teams.length === 0) {
      throw new BadRequestException('No teams found to seed into groups for this stage.');
    }

    // Shuffle teams randomly
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    // Delete existing groups for this stage
    await this.prisma.group.deleteMany({ where: { stageId } });

    // Create groups
    const groups = [];
    for (let i = 0; i < groupCount; i++) {
      const groupTeams = shuffled.filter((_, idx) => idx % groupCount === i);
      const group = await this.prisma.group.create({
        data: {
          stageId,
          name: `Group ${String.fromCharCode(65 + i)}`,
          teams: {
            create: groupTeams.map((t) => ({ teamId: t.id })),
          },
        },
        include: { teams: { include: { team: true } } },
      });
      groups.push(group);
    }

    return groups;
  }

  /**
   * Module G — Generate a single-elimination bracket for a stage.
   * Seeds confirmed/registered teams (optionally in a caller-supplied order), pads the
   * field to the next power of two with byes, and auto-advances any bye winners.
   */
  async generateBracket(stageId: string, seededTeamIds?: string[]) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        tournament: {
          include: {
            registrations: {
              where: { status: { in: ['confirmed', 'registered'] } },
              include: { team: true },
            },
          },
        },
      },
    });
    if (!stage) throw new NotFoundException('Stage not found');

    let registeredIds: string[] = [];

    // If stage > 1, check if previous stage had advancing teams
    if (stage.order > 1) {
      const prevStage = await this.prisma.stage.findFirst({
        where: { tournamentId: stage.tournamentId, order: stage.order - 1 },
      });
      if (prevStage) {
        const advRule = (prevStage.advancementRule as any) || {};
        const topN = advRule.topN || 16;
        const prevStandings = await this.prisma.stageStanding.findMany({
          where: { stageId: prevStage.id },
          orderBy: [{ totalPts: 'desc' }, { totalKills: 'desc' }],
          take: topN,
        });
        if (prevStandings.length > 0) {
          registeredIds = prevStandings.map((s) => s.teamId);
        }
      }
    }

    if (registeredIds.length === 0) {
      registeredIds = stage.tournament.registrations.map((r) => r.teamId);
    }

    let teamIds = seededTeamIds?.length
      ? seededTeamIds.filter((id) => registeredIds.includes(id))
      : [...registeredIds].sort(() => Math.random() - 0.5);

    if (teamIds.length < 2) {
      throw new BadRequestException('Need at least 2 teams to generate a bracket');
    }

    const rounds = Math.ceil(Math.log2(teamIds.length));
    const bracketSize = 2 ** rounds;
    // Standard tournament bracket seeding: distributes byes one-per-match
    // (seed 1 vs lowest seed, etc.) instead of stacking them all at the tail,
    // which would otherwise produce unresolvable bye-vs-bye matches.
    const seedOrder = this.standardBracketSeedOrder(bracketSize);
    const seeded: (string | null)[] = seedOrder.map((seed) => teamIds[seed - 1] ?? null);

    await this.prisma.bracketMatch.deleteMany({ where: { bracket: { stageId } } });
    await this.prisma.bracket.deleteMany({ where: { stageId } });

    const bracket = await this.prisma.bracket.create({
      data: { stageId, rounds, type: 'single_elimination' },
    });

    // Create every round's matches up front so nextMatchId links can be wired.
    const matchesByRound: any[][] = [];
    for (let round = 1; round <= rounds; round++) {
      const matchCount = bracketSize / 2 ** round;
      const roundMatches = [];
      for (let position = 0; position < matchCount; position++) {
        const match = await this.prisma.bracketMatch.create({
          data: { bracketId: bracket.id, round, position, status: 'pending' },
        });
        roundMatches.push(match);
      }
      matchesByRound.push(roundMatches);
    }

    // Wire nextMatchId pointers (round N match `p` feeds round N+1 match `floor(p/2)`).
    for (let round = 0; round < rounds - 1; round++) {
      for (const match of matchesByRound[round]) {
        const nextMatch = matchesByRound[round + 1][Math.floor(match.position / 2)];
        await this.prisma.bracketMatch.update({ where: { id: match.id }, data: { nextMatchId: nextMatch.id } });
      }
    }

    // Seed round 1 with teams (byes get a null opponent).
    for (let position = 0; position < matchesByRound[0].length; position++) {
      const teamAId = seeded[position * 2];
      const teamBId = seeded[position * 2 + 1];
      await this.prisma.bracketMatch.update({
        where: { id: matchesByRound[0][position].id },
        data: { teamAId, teamBId, status: teamAId && teamBId ? 'ready' : 'pending' },
      });
      // Auto-advance byes immediately.
      if (teamAId && !teamBId) {
        await this.reportBracketResult(matchesByRound[0][position].id, teamAId);
      } else if (!teamAId && teamBId) {
        await this.reportBracketResult(matchesByRound[0][position].id, teamBId);
      }
    }

    return this.getBracket(stageId);
  }

  /**
   * Generates the standard power-of-two seed ordering (e.g. size 8 -> [1,8,4,5,2,7,3,6])
   * so that when high seed numbers are byes, each match gets at most one bye.
   */
  private standardBracketSeedOrder(size: number): number[] {
    if (size === 1) return [1];
    const prev = this.standardBracketSeedOrder(size / 2);
    const result: number[] = [];
    for (const s of prev) {
      result.push(s, size + 1 - s);
    }
    return result;
  }

  /**
   * Report the winner of a bracket match and propagate them into the next round.
   */
  async reportBracketResult(matchId: string, winnerId: string, scoreA?: number, scoreB?: number) {
    const match = await this.prisma.bracketMatch.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Bracket match not found');
    if (match.teamAId !== winnerId && match.teamBId !== winnerId) {
      throw new BadRequestException('Winner must be one of the two teams in this match');
    }

    const updated = await this.prisma.bracketMatch.update({
      where: { id: matchId },
      data: { winnerId, scoreA, scoreB, status: 'completed' },
    });

    if (updated.nextMatchId) {
      const nextMatch = await this.prisma.bracketMatch.findUnique({ where: { id: updated.nextMatchId } });
      if (nextMatch) {
        // The parent match's teamA/teamB slot is determined by whether this
        // match was the even-numbered (first) or odd-numbered (second) child.
        const isFirstChild = match.position % 2 === 0;
        const data: any = isFirstChild ? { teamAId: winnerId } : { teamBId: winnerId };
        const bothFilled = isFirstChild ? nextMatch.teamBId : nextMatch.teamAId;
        if (bothFilled) data.status = 'ready';
        await this.prisma.bracketMatch.update({ where: { id: nextMatch.id }, data });
      }
    }

    return updated;
  }

  async getBracket(stageId: string) {
    const bracket = await this.prisma.bracket.findUnique({
      where: { stageId },
      include: { matches: { orderBy: [{ round: 'asc' }, { position: 'asc' }] } },
    });
    if (!bracket) return null;

    const teamIds = [...new Set(bracket.matches.flatMap((m) => [m.teamAId, m.teamBId, m.winnerId]).filter(Boolean))] as string[];
    const teams = await this.prisma.team.findMany({ where: { id: { in: teamIds } } });
    const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));

    return {
      ...bracket,
      matches: bracket.matches.map((m) => ({
        ...m,
        teamA: m.teamAId ? teamMap[m.teamAId] : null,
        teamB: m.teamBId ? teamMap[m.teamBId] : null,
        winner: m.winnerId ? teamMap[m.winnerId] : null,
      })),
    };
  }

  async publishStage(stageId: string) {
    return this.prisma.stage.update({ where: { id: stageId }, data: { published: true } });
  }

  async completeStage(stageId: string) {
    const stage = await this.prisma.stage.findUnique({
      where: { id: stageId },
      include: { tournament: true },
    });
    if (!stage) throw new NotFoundException('Stage not found');

    await this.prisma.stage.update({ where: { id: stageId }, data: { status: 'completed' } });

    // Find next stage and seed top teams based on advancementRule
    const advRule = stage.advancementRule as any;
    if (!advRule?.topN) return { message: 'Stage completed' };

    const standings = await this.prisma.stageStanding.findMany({
      where: { stageId },
      orderBy: { totalPts: 'desc' },
      take: advRule.topN,
    });

    const nextStage = await this.prisma.stage.findFirst({
      where: { tournamentId: stage.tournamentId, order: stage.order + 1 },
    });

    if (nextStage) {
      // Confirm registrations for advancing teams
      await Promise.all(
        standings.map((s) =>
          this.prisma.tournamentRegistration.updateMany({
            where: { tournamentId: stage.tournamentId, teamId: s.teamId },
            data: { status: 'confirmed' },
          }),
        ),
      );
    }

    return { message: 'Stage completed', advancingTeams: standings.length };
  }
}
