import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Module L — Calculate and create payout records on tournament finalization.
   */
  async finalizeTournamentPayouts(tournamentId: string) {
    const existingPayouts = await this.prisma.payout.findMany({ where: { tournamentId } });
    if (existingPayouts.length > 0) {
      return existingPayouts;
    }

    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { stages: { orderBy: { order: 'desc' }, take: 1 } },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    const prizeDist = tournament.prizeDist as Record<string, number>;
    const prizePool = tournament.prizePool;

    // Get final standings from last stage
    const lastStage = tournament.stages[0];
    if (!lastStage) throw new NotFoundException('No stages found');

    const standings = await this.prisma.stageStanding.findMany({
      where: { stageId: lastStage.id },
      orderBy: [{ rank: 'asc' }],
    });

    // Get team members for each team (captain gets payout record)
    const payouts = [];
    for (const standing of standings) {
      const rank = standing.rank || 99;
      const pct = prizeDist?.[String(rank)] || 0;
      if (pct <= 0) continue;

      const amount = (prizePool * pct) / 100;
      const team = await this.prisma.team.findUnique({ where: { id: standing.teamId } });
      if (!team) continue;

      const payout = await this.prisma.payout.create({
        data: {
          tournamentId,
          teamId: standing.teamId,
          playerId: team.captainId,
          amount,
          placement: rank,
          status: 'pending',
        },
      });
      payouts.push(payout);
    }

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: 'completed' },
    });

    return payouts;
  }

  async getPayouts(tournamentId: string) {
    return this.prisma.payout.findMany({
      where: { tournamentId },
      include: { team: true, player: true },
      orderBy: { placement: 'asc' },
    });
  }

  async getMyPayouts(playerId: string) {
    return this.prisma.payout.findMany({
      where: { playerId },
      include: { tournament: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePayoutStatus(payoutId: string, data: { status: string; txRef?: string }) {
    return this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: data.status as any,
        txRef: data.txRef,
        paidAt: data.status === 'paid' ? new Date() : undefined,
      },
    });
  }

  // Module O — Payout ledger export
  async exportPayoutsCsv(tournamentId: string): Promise<string> {
    const payouts = await this.getPayouts(tournamentId);

    const rows = payouts.map((p) => ({
      teamName: p.team?.name || '',
      captain: p.player?.discordUsername || '',
      placement: p.placement,
      amount: p.amount,
      status: p.status,
      txRef: p.txRef || '',
      paidAt: p.paidAt ? p.paidAt.toISOString() : '',
    }));

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'teamName', title: 'Squad Name' },
        { id: 'captain', title: 'Captain' },
        { id: 'placement', title: 'Placement' },
        { id: 'amount', title: 'Amount (INR)' },
        { id: 'status', title: 'Status' },
        { id: 'txRef', title: 'Transaction Reference' },
        { id: 'paidAt', title: 'Paid At' },
      ],
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
  }
}
