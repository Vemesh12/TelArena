import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TesService } from './tes.service';
import { OtpService } from './otp.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [VerificationController],
  providers: [VerificationService, TesService, OtpService],
  exports: [VerificationService, TesService],
})
export class VerificationModule {}
