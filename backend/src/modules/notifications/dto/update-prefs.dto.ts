import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPrefsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  registrationConfirmed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verificationStatus?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  teamConfirmed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  matchResult?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disputeUpdate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  payoutUpdate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  announcement?: boolean;
}
