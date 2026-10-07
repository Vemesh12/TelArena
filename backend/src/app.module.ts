import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
import { VerificationModule } from './modules/verification/verification.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { StagesModule } from './modules/stages/stages.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { MatchesModule } from './modules/matches/matches.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get('REDIS_URL') || 'redis://localhost:6379';
        try {
          const redisUrl = new URL(raw);
          const isTls = redisUrl.protocol === 'rediss:';
          return {
            redis: {
              host: redisUrl.hostname,
              port: Number(redisUrl.port) || (isTls ? 6380 : 6379),
              username: redisUrl.username || undefined,
              password: redisUrl.password || undefined,
              tls: isTls ? { rejectUnauthorized: false } : undefined,
            },
          };
        } catch {
          // Malformed REDIS_URL — fail soft to localhost defaults rather than
          // crashing app bootstrap over a bad env var.
          return { redis: { host: 'localhost', port: 6379 } };
        }
      },
    }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    VerificationModule,
    TeamsModule,
    TournamentsModule,
    StagesModule,
    RoomsModule,
    MatchesModule,
    LeaderboardModule,
    DisputesModule,
    PayoutsModule,
    AnnouncementsModule,
    NotificationsModule,
    AdminModule,
    AuditModule,
    UploadsModule,
    EventsModule,
  ],
})
export class AppModule {}
