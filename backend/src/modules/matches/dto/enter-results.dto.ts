import { IsString, IsOptional, IsNotEmpty, IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatchResultEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  placement: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  kills: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}

export class EnterResultsDto {
  @ApiProperty({ type: [MatchResultEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchResultEntryDto)
  results: MatchResultEntryDto[];
}
