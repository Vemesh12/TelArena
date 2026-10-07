import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

// Default Free Fire placement points table
const DEFAULT_PLACEMENT_TABLE = {
  '1': 12, '2': 9, '3': 8, '4': 7, '5': 6,
  '6': 5, '7': 4, '8': 3, '9': 2, '10+': 1,
};

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(data: {
    name: string;
    bannerUrl?: string;
    description?: string;
    format?: string;
    registrationOpen?: Date;
    registrationClose?: Date;
    maxTeams?: number;
    eligibilityEnabled?: boolean;
    prizePool?: number;
    entryFee?: number;
    prizeDist?: any;
    rulebook?: string;
  }, actorId?: string, actorRole?: string) {
    const tournament = await this.prisma.tournament.create({
      data: {
        ...data,
        format: data.format as any || 'squad',
        status: 'draft',
        scoringConfig: {
          create: {
            placementTable: DEFAULT_PLACEMENT_TABLE,
            killPoints: 1,
          },
        },
      },
      include: { scoringConfig: true, stages: true },
    });

    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'TOURNAMENT_CREATE',
        entityType: 'Tournament',
        entityId: tournament.id,
        after: { name: tournament.name, format: tournament.format },
      });
    }

    return tournament;
  }

  async findAll(status?: string) {
    return this.prisma.tournament.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        scoringConfig: true,
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const t = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        scoringConfig: true,
        stages: { orderBy: { order: 'asc' }, include: { groups: true } },
        _count: { select: { registrations: true } },
        announcements: { where: { published: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!t) throw new NotFoundException('Tournament not found');
    return t;
  }

  async update(id: string, data: any, actorId?: string, actorRole?: string) {
    if (data.rulebook) data.rulebookUpdatedAt = new Date();
    const updated = await this.prisma.tournament.update({ where: { id }, data });
    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'TOURNAMENT_UPDATE',
        entityType: 'Tournament',
        entityId: id,
        after: data,
      });
    }
    return updated;
  }

  async updateStatus(id: string, status: string, actorId?: string, actorRole?: string) {
    const before = await this.prisma.tournament.findUnique({ where: { id } });
    const updated = await this.prisma.tournament.update({
      where: { id },
      data: { status: status as any },
    });
    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'TOURNAMENT_STATUS_UPDATE',
        entityType: 'Tournament',
        entityId: id,
        before: { status: before?.status },
        after: { status },
      });
    }
    return updated;
  }

  async updateScoringConfig(id: string, config: { placementTable: any; killPoints: number }, actorId?: string, actorRole?: string) {
    const updated = await this.prisma.scoringConfig.upsert({
      where: { tournamentId: id },
      update: config,
      create: { tournamentId: id, ...config },
    });
    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'TOURNAMENT_SCORING_UPDATE',
        entityType: 'Tournament',
        entityId: id,
        after: config,
      });
    }
    return updated;
  }

  // Module E — Clone an existing tournament (settings + scoring config, no registrations/stages/results)
  async clone(id: string, actorId?: string, actorRole?: string) {
    const source = await this.findById(id);

    const cloned = await this.prisma.tournament.create({
      data: {
        name: `${source.name} (Copy)`,
        bannerUrl: source.bannerUrl,
        description: source.description,
        format: source.format,
        maxTeams: source.maxTeams,
        eligibilityEnabled: source.eligibilityEnabled,
        prizePool: source.prizePool,
        prizeDist: source.prizeDist as any,
        rulebook: source.rulebook,
        status: 'draft',
        scoringConfig: source.scoringConfig
          ? {
              create: {
                placementTable: source.scoringConfig.placementTable as any,
                killPoints: source.scoringConfig.killPoints,
              },
            }
          : { create: { placementTable: DEFAULT_PLACEMENT_TABLE, killPoints: 1 } },
      },
      include: { scoringConfig: true, stages: true },
    });

    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'admin',
        action: 'TOURNAMENT_CLONE',
        entityType: 'Tournament',
        entityId: cloned.id,
        before: { sourceId: id },
        after: { name: cloned.name },
      });
    }

    return cloned;
  }

  // Module F — Player Registration
  async registerTeam(tournamentId: string, teamId: string, metadata?: any) {
    const tournament = await this.findById(tournamentId);

    if (tournament.status !== 'registration_open') {
      throw new BadRequestException('Tournament registration is not open');
    }

    if (tournament.eligibilityEnabled) {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { members: { include: { player: { include: { verification: true } } } } },
      });
      if (!team) throw new NotFoundException('Team not found');

      const coreMembers = team.members.filter((m) => m.isCore);
      if (coreMembers.length < 4) {
        throw new BadRequestException(
          `Squad roster must have 4 core members to register (currently ${coreMembers.length}/4). Complete your roster on the Teams page.`,
        );
      }

      const approvedCount = coreMembers.filter(
        (m) =>
          m.player?.verification?.status === 'auto_approved' ||
          m.player?.verification?.status === 'approved',
      ).length;

      if (approvedCount < 3) {
        throw new BadRequestException(
          `Squad does not meet TES eligibility requirements: at least 3 of 4 core players must be TES-verified (currently ${approvedCount}/4).`,
        );
      }
    }

    const count = await this.prisma.tournamentRegistration.count({
      where: { tournamentId, status: { not: 'cancelled' } },
    });

    const status = count >= tournament.maxTeams ? 'waitlisted' : 'registered';

    return this.prisma.tournamentRegistration.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId } },
      update: { metadata },
      create: { tournamentId, teamId, status: status as any, metadata },
    });
  }

  async getMyRegistrations(teamId: string) {
    return this.prisma.tournamentRegistration.findMany({
      where: { teamId },
      include: { tournament: { include: { scoringConfig: true } } },
    });
  }

  async getRegistrations(tournamentId: string) {
    return this.prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      include: { team: { include: { captain: true } } },
    });
  }

  async updateRegistrationStatus(regId: string, status: string) {
    return this.prisma.tournamentRegistration.update({
      where: { id: regId },
      data: { status: status as any },
    });
  }

  async confirmAllEligibleRegistrations(tournamentId: string) {
    const updated = await this.prisma.tournamentRegistration.updateMany({
      where: {
        tournamentId,
        status: 'registered',
      },
      data: { status: 'confirmed' },
    });
    return { success: true, count: updated.count, message: `Confirmed ${updated.count} registrations.` };
  }
}
