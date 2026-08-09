import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TesService } from './tes.service';
import { OtpService } from './otp.service';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tesService: TesService,
    private readonly otpService: OtpService,
    private readonly auditService: AuditService,
  ) {}

  async getStatus(playerId: string) {
    let verif = await this.prisma.verification.findUnique({ where: { playerId } });
    if (!verif) {
      verif = await this.prisma.verification.create({ data: { playerId } });
    }
    return verif;
  }

  async initiateFreefireCheck(playerId: string) {
    const code = `MBG-${uuidv4().slice(0, 8).toUpperCase()}`;
    await this.prisma.verification.upsert({
      where: { playerId },
      update: { freefireCode: code, status: 'in_progress' },
      create: { playerId, freefireCode: code, status: 'in_progress' },
    });
    return { code, instructions: `Set "${code}" as your Free Fire username temporarily, then upload a screenshot.` };
  }

  async submitFreefireScreenshot(playerId: string, screenshotUrl: string) {
    await this.prisma.verification.update({
      where: { playerId },
      data: { freefireScreenshot: screenshotUrl, freefireVerified: true },
    });
    return this.recomputeTes(playerId);
  }

  async sendOtp(playerId: string, phone: string) {
    const result = await this.otpService.sendOtp(phone);
    return result;
  }

  async verifyOtp(playerId: string, phone: string, otp: string) {
    const verified = await this.otpService.verifyOtp(phone, otp);
    if (!verified) return { success: false, message: 'Invalid OTP' };

    const circle = await this.otpService.lookupTelecomCircle(phone);
    const isTeluguCircle = circle.toLowerCase().includes('ap') || circle.toLowerCase().includes('telangana');

    await this.prisma.verification.update({
      where: { playerId },
      data: { otpVerified: true, telecomCircle: circle },
    });

    await this.prisma.player.update({ where: { id: playerId }, data: { phone } });

    const result = await this.recomputeTes(playerId);
    return { success: true, telecomCircle: circle, isTeluguCircle, ...result };
  }

  async submitAppeal(playerId: string, note: string) {
    await this.prisma.verification.update({
      where: { playerId },
      data: { appealNote: note },
    });
    return { success: true, message: 'Appeal submitted. Our team will review within 48 hours.' };
  }

  // Module C — DigiLocker e-KYC. There is no live DigiLocker API integration
  // configured for this deployment, so a player submits their DigiLocker share
  // URL and an admin manually reviews the document before marking it verified.
  async submitDigilocker(playerId: string, digilockerUrl: string) {
    await this.prisma.verification.upsert({
      where: { playerId },
      update: { digilockerUrl, digilockerVerified: false },
      create: { playerId, digilockerUrl },
    });
    return { success: true, message: 'DigiLocker document submitted for manual review.' };
  }

  async adminVerifyDigilocker(id: string, actorId: string, actorRole: string) {
    const verif = await this.prisma.verification.findFirst({
      where: { OR: [{ id }, { playerId: id }] },
    });
    if (!verif) throw new NotFoundException('Verification record not found');

    await this.prisma.verification.update({
      where: { id: verif.id },
      data: { digilockerVerified: true },
    });

    await this.auditService.log({
      actorId,
      actorRole,
      action: 'VERIFICATION_DIGILOCKER_VERIFY',
      entityType: 'Verification',
      entityId: verif.id,
    });

    return this.recomputeTes(verif.playerId);
  }

  async getDigilockerQueue() {
    return this.prisma.verification.findMany({
      where: { digilockerUrl: { not: null }, digilockerVerified: false },
      include: { player: true },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async adminApprove(id: string, actorId: string, actorRole: string) {
    const verif = await this.prisma.verification.findFirst({
      where: { OR: [{ id }, { playerId: id }] },
    });
    if (verif) {
      await this.prisma.verification.update({
        where: { id: verif.id },
        data: { status: 'approved' },
      });
      await this.auditService.log({
        actorId,
        actorRole,
        action: 'VERIFICATION_APPROVE',
        entityType: 'Verification',
        entityId: verif.id,
        before: { status: verif.status },
        after: { status: 'approved' },
      });
    }
    return { success: true };
  }

  async adminReject(id: string, actorId: string, actorRole: string) {
    const verif = await this.prisma.verification.findFirst({
      where: { OR: [{ id }, { playerId: id }] },
    });
    if (verif) {
      await this.prisma.verification.update({
        where: { id: verif.id },
        data: { status: 'rejected' },
      });
      await this.auditService.log({
        actorId,
        actorRole,
        action: 'VERIFICATION_REJECT',
        entityType: 'Verification',
        entityId: verif.id,
        before: { status: verif.status },
        after: { status: 'rejected' },
      });
    }
    return { success: true };
  }

  private async recomputeTes(playerId: string) {
    const verif = await this.prisma.verification.findUnique({ where: { playerId } });
    if (!verif) throw new NotFoundException('Verification record not found');

    const { score, decision, signals, friendlyMessage } = await this.tesService.computeScore({
      freefireVerified: verif.freefireVerified,
      otpVerified: verif.otpVerified,
      telecomCircleMatch: verif.telecomCircle?.toLowerCase().includes('ap') ||
        verif.telecomCircle?.toLowerCase().includes('telangana') || false,
      digilockerVerified: verif.digilockerVerified,
    });

    const updated = await this.prisma.verification.update({
      where: { playerId },
      data: {
        tesScore: score,
        tesDecision: friendlyMessage,
        status: decision as any,
        signals,
      },
    });

    return { score, decision, friendlyMessage, verification: updated };
  }

  async getPendingReviews() {
    return this.prisma.verification.findMany({
      where: { status: 'manual_review' },
      include: { player: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getConfig() {
    return this.tesService.getConfig();
  }

  async updateConfig(data: { autoApproveMin?: number; manualReviewMin?: number }) {
    return this.tesService.updateConfig(data);
  }
}
