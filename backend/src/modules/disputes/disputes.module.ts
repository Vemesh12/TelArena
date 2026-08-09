import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { TeamsModule } from '../teams/teams.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TeamsModule, AuditModule],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
