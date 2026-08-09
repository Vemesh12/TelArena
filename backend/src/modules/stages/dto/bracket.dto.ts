import { IsArray, IsOptional, IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class GenerateBracketDto {
  @ApiPropertyOptional({ type: [String], description: 'Optional seed order of team IDs; random shuffle if omitted' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seededTeamIds?: string[];
}

export class ReportBracketResultDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  scoreA?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  scoreB?: number;
}
