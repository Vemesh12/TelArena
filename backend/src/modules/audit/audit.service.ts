import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Module P — Append-only audit log entry.
   * Call this from every significant write action.
   */
  async log(data: {
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

  async getLogs(filters: {
    entityType?: string;
    actorId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { entityType, actorId, from, to, page = 1, limit = 50 } = filters;
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, discordUsername: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }
}
