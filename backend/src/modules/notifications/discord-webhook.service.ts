import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Discord webhook notification service.
 * Currently stubbed — wire in discord.js or HTTP webhook calls here.
 * Critical alerts: room_released, match_starting_soon
 */
@Injectable()
export class DiscordWebhookService {
  private readonly logger = new Logger(DiscordWebhookService.name);
  private readonly webhookUrl: string;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = config.get('DISCORD_WEBHOOK_URL') || '';
  }

  async sendWebhook(message: string, embed?: any): Promise<void> {
    if (!this.webhookUrl || this.webhookUrl.includes('YOUR_WEBHOOK')) {
      this.logger.log(`[DISCORD WEBHOOK LOG] ${message}`);
      return;
    }

    try {
      this.logger.log(`[DISCORD WEBHOOK] Posting alert to Discord...`);
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          embeds: embed ? [embed] : undefined,
        }),
      });
    } catch (err: any) {
      this.logger.error('Discord webhook failed', err?.message);
    }
  }

  async notifyRoomReleased(teamName: string, roomCode: string, scheduledAt: Date) {
    await this.sendWebhook(
      `🎮 Room credentials released for **${teamName}**!`,
      {
        title: 'Room Released',
        description: `Your room is ready. Match starts at ${scheduledAt.toISOString()}`,
        color: 0xe31c3d,
        fields: [{ name: 'Room Code', value: roomCode }],
      },
    );
  }

  async notifyMatchResult(teamName: string, placement: number, points: number) {
    await this.sendWebhook(
      `📊 Match result posted for **${teamName}**: Placement #${placement}, ${points} pts`,
    );
  }
}
