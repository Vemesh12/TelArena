import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByDiscordId(discordId: string) {
    return this.prisma.player.findUnique({ where: { discordId } });
  }

  async findByDiscordUsername(discordUsername: string) {
    return this.prisma.player.findFirst({ where: { discordUsername } });
  }

  async findByPhone(phone: string) {
    return this.prisma.player.findFirst({ where: { phone } });
  }

  async findById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        verification: true,
        teamMemberships: {
          include: { team: { include: { captain: true, members: { include: { player: true } } } } },
        },
        notifPrefs: true,
      },
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async create(data: { discordId: string; discordUsername: string; discordAvatar?: string }) {
    return this.prisma.player.create({ data });
  }

  async updateOnboarding(id: string, data: any) {
    const { fullName, age, primaryLanguage, freefireUid, phone } = data;
    return this.prisma.player.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(age !== undefined && age !== null && age !== "" && { age: Number(age) }),
        ...(primaryLanguage !== undefined && { primaryLanguage }),
        ...(freefireUid !== undefined && { freefireUid }),
        ...(phone !== undefined && { phone }),
      },
    });
  }

  async updateProfile(id: string, data: { freefireUid?: string; phone?: string }) {
    return this.prisma.player.update({ where: { id }, data });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [players, total] = await Promise.all([
      this.prisma.player.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.player.count(),
    ]);
    return { players, total, page, limit };
  }

  async updateRole(id: string, role: string) {
    return this.prisma.player.update({ where: { id }, data: { role: role as any } });
  }

  async updatePassword(id: string, password: string) {
    return this.prisma.player.update({ where: { id }, data: { password } });
  }
}
