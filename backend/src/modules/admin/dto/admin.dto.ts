import { IsString, IsOptional, IsNotEmpty, IsInt, IsIn, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class SeedGroupsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stageId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  groupCount?: number;
}

export class BatchRoomsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stageId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  releaseMinutes?: number;
}

export class SuspendPlayerDto {
  @ApiProperty()
  @IsBoolean()
  suspended: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ResolveDisputeAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @ApiProperty()
  @IsIn(['resolved_upheld', 'resolved_rejected'])
  status: 'resolved_upheld' | 'resolved_rejected';
}
