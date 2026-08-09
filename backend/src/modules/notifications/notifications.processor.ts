import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DiscordWebhookService } from './discord-webhook.service';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly discordWebhook: DiscordWebhookService) {}

  @Process('discord-webhook')
  async handleDiscordWebhook(job: Job<{ message: string }>) {
    try {
      await this.discordWebhook.sendWebhook(job.data.message);
    } catch (err: any) {
      this.logger.error(`Failed to dispatch queued Discord webhook: ${err.message}`);
      throw err;
    }
  }
}
