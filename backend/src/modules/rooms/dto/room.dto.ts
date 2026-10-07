import { IsString, IsOptional, IsNotEmpty, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  map?: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  releaseMinutes?: number;
}

export class RoomSlotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty()
  @IsInt()
  slotNo: number;
}

export class AssignSlotsDto {
  @ApiProperty({ type: [RoomSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomSlotDto)
  slots: RoomSlotDto[];
}

export class UpdateRoomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  map?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  releaseMinutes?: number;
}
