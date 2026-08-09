import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RaiseDisputeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

export class ResolveDisputeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resolution: string;

  @ApiProperty()
  @IsBoolean()
  upheld: boolean;
}
