import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createRoom(stageId: string, data: {
    roomCode: string;
    password: string;
    map?: string;
    scheduledAt: Date;
    releaseMinutes?: number;
  }) {
    return this.prisma.room.create({ data: { ...data, stageId } });
  }

  async assignSlots(roomId: string, slots: { teamId: string; slotNo: number }[]) {
    // Delete existing slots and re-create
    await this.prisma.roomSlot.deleteMany({ where: { roomId } });
    const created = await Promise.all(
      slots.map((s) =>
        this.prisma.roomSlot.create({ data: { roomId, teamId: s.teamId, slotNo: s.slotNo } }),
      ),
    );
    return created;
  }

  /**
   * Returns room credentials only if within release window.
   * Enforced server-side, not just UI.
   */
  async getRoomForTeam(roomId: string, teamId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { slots: { where: { teamId } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    if (!room.slots.length) throw new NotFoundException('Your team is not assigned to this room');

    const now = new Date();
    const releaseTime = new Date(room.scheduledAt.getTime() - room.releaseMinutes * 60 * 1000);
    const isReleased = now >= releaseTime;

    return {
      roomId: room.id,
      scheduledAt: room.scheduledAt,
      slotNo: room.slots[0].slotNo,
      isReleased,
      releaseAt: releaseTime,
      credentials: isReleased
        ? { roomCode: room.roomCode, password: room.password, map: room.map }
        : null,
    };
  }

  async getRoomAdmin(roomId: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      include: { slots: { include: { team: true } } },
    });
  }

  async markNoShow(roomId: string, teamId: string) {
    return this.prisma.roomSlot.updateMany({
      where: { roomId, teamId },
      data: { noShow: true },
    });
  }

  async getMyNextMatch(teamId: string) {
    const now = new Date();
    const slot = await this.prisma.roomSlot.findFirst({
      where: {
        teamId,
        room: { scheduledAt: { gte: now } },
      },
      include: { room: true },
      orderBy: { room: { scheduledAt: 'asc' } },
    });
    if (!slot) return null;

    const releaseTime = new Date(
      slot.room.scheduledAt.getTime() - slot.room.releaseMinutes * 60 * 1000,
    );
    const isReleased = now >= releaseTime;

    return {
      scheduledAt: slot.room.scheduledAt,
      slotNo: slot.slotNo,
      isReleased,
      releaseAt: releaseTime,
      credentials: isReleased
        ? { roomCode: slot.room.roomCode, password: slot.room.password, map: slot.room.map }
        : null,
    };
  }

  async checkInSquad(teamId: string) {
    const nextMatch = await this.getMyNextMatch(teamId);
    if (!nextMatch) throw new NotFoundException('No upcoming match room found for squad');
    return {
      success: true,
      message: `Squad checked in for Slot #${nextMatch.slotNo}. Status set to READY ⚔️`,
      checkedInAt: new Date(),
    };
  }

  // Cron job — checks every minute for rooms that just crossed into their release window
  @Cron(CronExpression.EVERY_MINUTE)
  async checkRoomReleases() {
    const now = new Date();
    const upcomingRooms = await this.prisma.room.findMany({
      where: { scheduledAt: { gte: now } },
      include: { slots: { include: { team: true } } },
    });

    // Only fire for rooms whose release window opened within the last minute,
    // so this doesn't re-broadcast the same room on every subsequent tick.
    for (const room of upcomingRooms) {
      const releaseTime = new Date(room.scheduledAt.getTime() - room.releaseMinutes * 60 * 1000);
      const justReleased = now >= releaseTime && now.getTime() - releaseTime.getTime() < 60 * 1000;
      if (!justReleased) continue;

      this.eventsGateway.emitRoomReleased(room.id, {
        roomId: room.id,
        roomCode: room.roomCode,
        password: room.password,
        map: room.map,
        scheduledAt: room.scheduledAt,
        isReleased: true,
      });

      for (const slot of room.slots) {
        await this.notificationsService.send(
          slot.team.captainId,
          'room_released',
          'Room Credentials Released',
          `Room code and password for your Slot #${slot.slotNo} match are now available. Match starts at ${room.scheduledAt.toISOString()}.`,
        );
      }
    }
  }

  async updateRoom(roomId: string, data: { scheduledAt?: string; map?: string }) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        map: data.map,
      },
    });
  }
}
