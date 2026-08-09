import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  SubmitScreenshotDto, SendOtpDto, VerifyOtpDto, SubmitAppealDto, UpdateVerificationConfigDto,
  SubmitDigilockerDto,
} from './dto/verification.dto';

@ApiTags('Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('status')
  getStatus(@CurrentUser() user: any) {
    return this.verificationService.getStatus(user.sub);
  }

  @Post('freefire/initiate')
  initiateFF(@CurrentUser() user: any) {
    return this.verificationService.initiateFreefireCheck(user.sub);
  }

  @Post('freefire/screenshot')
  @UseInterceptors(FileInterceptor('file'))
  submitFFScreenshot(@CurrentUser() user: any, @Body() body: SubmitScreenshotDto) {
    return this.verificationService.submitFreefireScreenshot(user.sub, body.screenshotUrl);
  }

  @Post('otp/send')
  sendOtp(@CurrentUser() user: any, @Body() body: SendOtpDto) {
    return this.verificationService.sendOtp(user.sub, body.phone);
  }

  @Post('otp/verify')
  verifyOtp(@CurrentUser() user: any, @Body() body: VerifyOtpDto) {
    return this.verificationService.verifyOtp(user.sub, body.phone, body.otp);
  }

  @Post('appeal')
  submitAppeal(@CurrentUser() user: any, @Body() body: SubmitAppealDto) {
    return this.verificationService.submitAppeal(user.sub, body.note);
  }

  @Post('digilocker')
  submitDigilocker(@CurrentUser() user: any, @Body() body: SubmitDigilockerDto) {
    return this.verificationService.submitDigilocker(user.sub, body.digilockerUrl);
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getPendingReviews() {
    return this.verificationService.getPendingReviews();
  }

  @Get('admin/digilocker/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getDigilockerQueue() {
    return this.verificationService.getDigilockerQueue();
  }

  @Patch('admin/digilocker/:id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  verifyDigilocker(@CurrentUser() user: any, @Param('id') id: string) {
    return this.verificationService.adminVerifyDigilocker(id, user.sub, user.role);
  }

  @Patch('admin/approve/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  approve(@CurrentUser() user: any, @Param('id') id: string) {
    return this.verificationService.adminApprove(id, user.sub, user.role);
  }

  @Patch('admin/reject/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  reject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.verificationService.adminReject(id, user.sub, user.role);
  }

  @Get('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  getConfig() {
    return this.verificationService.getConfig();
  }

  @Patch('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  updateConfig(@Body() body: UpdateVerificationConfigDto) {
    return this.verificationService.updateConfig(body);
  }
}
