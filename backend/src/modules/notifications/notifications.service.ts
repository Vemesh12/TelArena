import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class NotificationsService {
  // Critical notification types that always send regardless of prefs
  private readonly CRITICAL_TYPES = ['room_released', 'match_result'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async send(playerId: string, type: string, title: string, body: string) {
    // Check prefs — critical types always send
    const prefs = await this.prisma.notificationPref.findUnique({ where: { playerId } });
    const isCritical = this.CRITICAL_TYPES.includes(type);

    if (!isCritical && prefs) {
      const prefKey = this.getPrefKey(type);
      if (prefKey && !prefs[prefKey]) return; // Player opted out
    }

    const notif = await this.prisma.notification.create({
      data: { playerId, type: type as any, title, body },
    });

    // Push via WebSocket in real-time
    this.eventsGateway.emitNotification(playerId, notif);

    // Critical types also go out to the Discord channel webhook, dispatched
    // asynchronously via the notifications queue so a slow/failed webhook
    // call never blocks the request that triggered it.
    if (isCritical) {
      await this.notificationsQueue.add('discord-webhook', { message: `**${title}**\n${body}` }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
    }

    return notif;
  }

  async getMyNotifications(playerId: string) {
    return this.prisma.notification.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(playerId: string) {
    return this.prisma.notification.count({ where: { playerId, read: false } });
  }

  async markRead(notificationId: string, playerId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, playerId },
      data: { read: true },
    });
  }

  async markAllRead(playerId: string) {
    return this.prisma.notification.updateMany({
      where: { playerId, read: false },
      data: { read: true },
    });
  }

  async getPrefs(playerId: string) {
    return this.prisma.notificationPref.upsert({
      where: { playerId },
      update: {},
      create: { playerId },
    });
  }

  async updatePrefs(playerId: string, prefs: any) {
    return this.prisma.notificationPref.upsert({
      where: { playerId },
      update: prefs,
      create: { playerId, ...prefs },
    });
  }

  private getPrefKey(type: string): string | null {
    const map: Record<string, string> = {
      registration_confirmed: 'registrationConfirmed',
      verification_status: 'verificationStatus',
      team_confirmed: 'teamConfirmed',
      match_result: 'matchResult',
      dispute_update: 'disputeUpdate',
      payout_update: 'payoutUpdate',
      announcement: 'announcement',
    };
    return map[type] || null;
  }
}
