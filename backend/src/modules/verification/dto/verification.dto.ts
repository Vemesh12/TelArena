import { IsString, IsOptional, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitScreenshotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  screenshotUrl: string;
}

export class SendOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SubmitDigilockerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  digilockerUrl: string;
}

export class SubmitAppealDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class UpdateVerificationConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  autoApproveMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  manualReviewMin?: number;
}
