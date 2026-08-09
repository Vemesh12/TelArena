import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Module O — Admin dashboard summary statistics
   */
  async getDashboardStats() {
    const [
      totalPlayers,
      totalTournaments,
      activeTournaments,
      pendingVerifications,
      openDisputes,
      pendingPayouts,
      registrationFunnel,
    ] = await Promise.all([
      this.prisma.player.count(),
      this.prisma.tournament.count(),
      this.prisma.tournament.count({ where: { status: 'ongoing' } }),
      this.prisma.verification.count({ where: { status: 'manual_review' } }),
      this.prisma.dispute.count({ where: { status: 'open' } }),
      this.prisma.payout.count({ where: { status: 'pending' } }),
      this.getRegistrationFunnel(),
    ]);

    return {
      totalPlayers,
      totalTournaments,
      activeTournaments,
      pendingVerifications,
      openDisputes,
      pendingPayouts,
      registrationFunnel,
    };
  }

  private async getRegistrationFunnel() {
    const [autoApproved, manualReview, autoRejected, notStarted] = await Promise.all([
      this.prisma.verification.count({ where: { status: 'auto_approved' } }),
      this.prisma.verification.count({ where: { status: 'manual_review' } }),
      this.prisma.verification.count({ where: { status: 'auto_rejected' } }),
      this.prisma.verification.count({ where: { status: 'not_started' } }),
    ]);
    return { autoApproved, manualReview, autoRejected, notStarted };
  }

  async getUpcomingRoomReleases() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return this.prisma.room.findMany({
      where: { scheduledAt: { gte: now, lte: oneHourFromNow } },
      include: { stage: { include: { tournament: true } }, slots: { include: { team: true } } },
    });
  }

  async getPendingResultEntry() {
    return this.prisma.match.findMany({
      where: { results: { none: {} } },
      include: {
        group: { include: { stage: { include: { tournament: true } } } },
        room: true,
      },
    });
  }

  async getPlayerList() {
    return this.prisma.player.findMany({
      include: { verification: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlayerById(id: string) {
    return this.prisma.player.findUnique({ where: { id } });
  }

  // Module O — Player registry export
  async exportPlayersCsv(): Promise<string> {
    const players = await this.getPlayerList();

    const rows = players.map((p: any) => ({
      discordUsername: p.discordUsername,
      fullName: p.fullName || '',
      phone: p.phone || '',
      freefireUid: p.freefireUid || '',
      role: p.role,
      suspended: p.suspended ? 'Yes' : 'No',
      verificationStatus: p.verification?.status || 'not_started',
      tesScore: p.verification?.tesScore ?? '',
      createdAt: p.createdAt.toISOString(),
    }));

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'discordUsername', title: 'Username' },
        { id: 'fullName', title: 'Full Name' },
        { id: 'phone', title: 'Phone' },
        { id: 'freefireUid', title: 'FF UID' },
        { id: 'role', title: 'Role' },
        { id: 'suspended', title: 'Suspended' },
        { id: 'verificationStatus', title: 'Verification Status' },
        { id: 'tesScore', title: 'TES Score' },
        { id: 'createdAt', title: 'Registered At' },
      ],
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
  }

  async updatePlayerRole(playerId: string, role: string, actorId?: string, actorRole?: string) {
    const before = await this.prisma.player.findUnique({ where: { id: playerId } });
    const updated = await this.prisma.player.update({ where: { id: playerId }, data: { role: role as any } });
    if (actorId) {
      await this.logAction({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'PLAYER_ROLE_UPDATE',
        entityType: 'Player',
        entityId: playerId,
        before: { role: before?.role },
        after: { role },
      });
    }
    return updated;
  }

  async setSuspended(playerId: string, suspended: boolean, reason?: string, actorId?: string, actorRole?: string) {
    const before = await this.prisma.player.findUnique({ where: { id: playerId } });
    const updated = await this.prisma.player.update({
      where: { id: playerId },
      data: { suspended, suspendedReason: suspended ? reason || null : null },
    });
    if (actorId) {
      await this.logAction({
        actorId,
        actorRole: actorRole || 'admin',
        action: suspended ? 'PLAYER_SUSPEND' : 'PLAYER_UNSUSPEND',
        entityType: 'Player',
        entityId: playerId,
        before: { suspended: before?.suspended },
        after: { suspended, reason },
      });
    }
    return updated;
  }

  async approveVerification(id: string, actorId?: string, actorRole?: string) {
    const verif = await this.prisma.verification.findFirst({
      where: { OR: [{ id }, { playerId: id }] },
    });
    if (verif) {
      await this.prisma.verification.update({
        where: { id: verif.id },
        data: { status: 'approved' },
      });
      if (actorId) {
        await this.logAction({
          actorId,
          actorRole: actorRole || 'admin',
          action: 'VERIFICATION_APPROVE',
          entityType: 'Verification',
          entityId: verif.id,
          before: { status: verif.status },
          after: { status: 'approved' },
        });
      }
    }
    return { success: true };
  }

  async rejectVerification(id: string, actorId?: string, actorRole?: string) {
    const verif = await this.prisma.verification.findFirst({
      where: { OR: [{ id }, { playerId: id }] },
    });
    if (verif) {
      await this.prisma.verification.update({
        where: { id: verif.id },
        data: { status: 'rejected' },
      });
      if (actorId) {
        await this.logAction({
          actorId,
          actorRole: actorRole || 'admin',
          action: 'VERIFICATION_REJECT',
          entityType: 'Verification',
          entityId: verif.id,
          before: { status: verif.status },
          after: { status: 'rejected' },
        });
      }
    }
    return { success: true };
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async seedGroups(tournamentId: string, stageId: string, groupCount: number = 4) {
    const registrations = await this.prisma.tournamentRegistration.findMany({
      where: { tournamentId, status: { in: ['confirmed', 'registered'] } },
      include: { team: true },
    });

    if (registrations.length === 0) {
      throw new Error('No registered teams found to seed.');
    }

    const groupNames = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'].slice(0, groupCount);
    
    // Clear old group teams for this stage if existing
    const existingGroups = await this.prisma.group.findMany({ where: { stageId } });
    if (existingGroups.length > 0) {
      await this.prisma.groupTeam.deleteMany({
        where: { groupId: { in: existingGroups.map((g) => g.id) } },
      });
    }

    const groups: any[] = [];
    for (let i = 0; i < groupCount; i++) {
      const gName = groupNames[i] || `Group ${i + 1}`;
      let group = existingGroups.find((g) => g.name === gName);
      if (!group) {
        group = await this.prisma.group.create({
          data: { stageId, name: gName },
        });
      }
      groups.push(group);
    }

    // Distribute teams evenly into groups
    const createdGroupTeams = [];
    for (let i = 0; i < registrations.length; i++) {
      const targetGroup = groups[i % groupCount];
      const gt = await this.prisma.groupTeam.create({
        data: {
          groupId: targetGroup.id,
          teamId: registrations[i].teamId,
        },
        include: { team: true, group: true },
      });
      createdGroupTeams.push(gt);
    }

    return {
      message: `Successfully seeded ${registrations.length} teams into ${groupCount} groups.`,
      groupCount,
      teamsSeeded: registrations.length,
      groups,
    };
  }

  async batchCreateRooms(stageId: string, scheduledAt?: string, releaseMinutes: number = 15) {
    const groups = await this.prisma.group.findMany({
      where: { stageId },
      include: { teams: { include: { team: true } } },
    });

    if (groups.length === 0) {
      throw new Error('No groups found for this stage. Seed groups first.');
    }

    const createdRooms = [];
    const matchTime = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 30 * 60 * 1000);

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const roomCode = `TEL-${Math.floor(100000 + Math.random() * 900000)}`;
      const password = `${Math.floor(1000 + Math.random() * 9000)}`;

      const room = await this.prisma.room.create({
        data: {
          stageId,
          roomCode,
          password,
          map: 'Bermuda',
          scheduledAt: matchTime,
          releaseMinutes,
          slots: {
            create: g.teams.map((gt, slotIdx) => ({
              teamId: gt.teamId,
              slotNo: slotIdx + 1,
            })),
          },
        },
        include: { slots: true },
      });

      const match = await this.prisma.match.create({
        data: {
          groupId: g.id,
          roomId: room.id,
        },
      });

      createdRooms.push({ room, match, groupName: g.name });
    }

    return {
      message: `Created ${createdRooms.length} rooms & matches for stage.`,
      rooms: createdRooms,
    };
  }

  async resolveDispute(
    disputeId: string,
    resolution: string,
    status: 'resolved_upheld' | 'resolved_rejected',
    actorId: string,
  ) {
    const dispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
      },
      include: { team: true, raisedBy: true, match: true },
    });

    await this.logAction({
      actorId,
      actorRole: 'admin',
      action: `DISPUTE_${status.toUpperCase()}`,
      entityType: 'Dispute',
      entityId: disputeId,
      after: { status, resolution },
    });

    return dispute;
  }

  async logAction(data: {
    actorId: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: any;
    after?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actorRole: data.actorRole as any,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        before: data.before,
        after: data.after,
      },
    });
  }
}

