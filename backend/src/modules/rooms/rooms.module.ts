import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { TeamsModule } from '../teams/teams.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ScheduleModule.forRoot(), TeamsModule, NotificationsModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
