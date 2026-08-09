import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async raise(data: {
    matchId?: string;
    teamId: string;
    raisedById: string;
    category: string;
    description: string;
    evidenceUrl?: string;
  }) {
    return this.prisma.dispute.create({
      data: {
        matchId: data.matchId,
        teamId: data.teamId,
        raisedById: data.raisedById,
        category: data.category as any,
        description: data.description,
        evidenceUrl: data.evidenceUrl,
      },
      include: { team: true, raisedBy: true, match: true },
    });
  }

  async getQueue(status?: string) {
    return this.prisma.dispute.findMany({
      where: status ? { status: status as any } : {},
      include: { team: true, raisedBy: true, match: { include: { results: { include: { team: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getEscalated() {
    return this.prisma.dispute.findMany({
      where: { status: 'escalated' },
      include: { team: true, raisedBy: true, match: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolve(disputeId: string, data: { resolution: string; upheld: boolean }, actorId?: string, actorRole?: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const status = data.upheld ? 'resolved_upheld' : 'resolved_rejected';
    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: status as any, resolution: data.resolution, resolvedAt: new Date() },
    });

    if (actorId) {
      await this.auditService.log({
        actorId,
        actorRole: actorRole || 'moderator',
        action: `DISPUTE_${status.toUpperCase()}`,
        entityType: 'Dispute',
        entityId: disputeId,
        before: { status: dispute.status },
        after: { status, resolution: data.resolution },
      });
    }

    return updated;
  }

  async escalate(disputeId: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'escalated' },
    });
  }

  async requestEvidence(disputeId: string) {
    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'more_evidence_requested' },
    });
  }

  async getMyDisputes(teamId: string) {
    return this.prisma.dispute.findMany({
      where: { teamId },
      include: { match: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
