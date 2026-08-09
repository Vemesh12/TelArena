import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { title: string; body: string; tournamentId?: string; published?: boolean }) {
    return this.prisma.announcement.create({ data: { ...data } });
  }

  async getPublic(tournamentId?: string) {
    return this.prisma.announcement.findMany({
      where: { published: true, tournamentId: tournamentId || undefined },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAll() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, data: { title?: string; body?: string; published?: boolean }) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }
}
