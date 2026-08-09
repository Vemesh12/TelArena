import {
  IsString, IsOptional, IsNotEmpty, IsNumber, IsInt, IsBoolean, IsIn, IsDateString, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const FORMATS = ['solo', 'duo', 'squad'];
const STATUSES = ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'];

export class CreateTournamentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(FORMATS)
  format?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationOpen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationClose?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  maxTeams?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligibilityEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prizePool?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  prizeDist?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  entryFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rulebook?: string;
}

export class UpdateTournamentDto extends CreateTournamentDto {}

export class UpdateTournamentStatusDto {
  @ApiProperty()
  @IsIn(STATUSES)
  status: string;
}

export class UpdateScoringConfigDto {
  @ApiProperty()
  @IsObject()
  placementTable: any;

  @ApiProperty()
  @IsNumber()
  killPoints: number;
}

export class RegisterTeamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}
