import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_CONFIG_ID = 'default_config';

/**
 * TES (Telugu Eligibility Score) Scoring Engine
 * Computes a weighted score from player verification signals.
 * Thresholds are configurable via DB (VerificationConfig table).
 * Default: >=60 Auto-Approved, 40-59 Manual Review, <40 Auto-Rejected
 */
@Injectable()
export class TesService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getConfig() {
    return this.prisma.verificationConfig.upsert({
      where: { id: DEFAULT_CONFIG_ID },
      update: {},
      create: { id: DEFAULT_CONFIG_ID, autoApproveMin: 60, manualReviewMin: 40 },
    });
  }

  async updateConfig(data: { autoApproveMin?: number; manualReviewMin?: number }) {
    return this.prisma.verificationConfig.upsert({
      where: { id: DEFAULT_CONFIG_ID },
      update: data,
      create: { id: DEFAULT_CONFIG_ID, autoApproveMin: 60, manualReviewMin: 40, ...data },
    });
  }

  /**
   * Compute TES score from verification signals against the admin-tunable
   * auto-approve / manual-review thresholds stored in VerificationConfig.
   */
  async computeScore(signals: {
    telecomCircleMatch: boolean;  // Telugu state SIM: +30 pts
    otpVerified: boolean;          // Mobile OTP verified: +20 pts
    freefireVerified: boolean;     // FF UID ownership: +25 pts
    accountAgeMonths?: number;     // FF account age: up to +15 pts
    captainVouched?: boolean;      // Team captain vouch: +10 pts
    digilockerVerified?: boolean;  // DigiLocker eKYC: +20 pts
  }): Promise<{ score: number; decision: string; signals: any; friendlyMessage: string }> {
    let score = 0;
    const breakdown: any = {};

    if (signals.freefireVerified) {
      score += 25;
      breakdown.freefireVerified = 25;
    }
    if (signals.otpVerified) {
      score += 20;
      breakdown.otpVerified = 20;
    }
    if (signals.telecomCircleMatch) {
      score += 30;
      breakdown.telecomCircleMatch = 30;
    }
    if (signals.accountAgeMonths) {
      const agePts = Math.min(15, Math.floor(signals.accountAgeMonths / 3));
      score += agePts;
      breakdown.accountAge = agePts;
    }
    if (signals.captainVouched) {
      score += 10;
      breakdown.captainVouched = 10;
    }
    if (signals.digilockerVerified) {
      score += 20;
      breakdown.digilockerVerified = 20;
    }

    // Cap at 100
    score = Math.min(100, score);

    const { autoApproveMin, manualReviewMin } = await this.getConfig();

    let decision: string;
    let friendlyMessage: string;

    if (score >= autoApproveMin) {
      decision = 'auto_approved';
      friendlyMessage = "You're verified! Welcome to MBG Arena. You can now register for tournaments.";
    } else if (score >= manualReviewMin) {
      decision = 'manual_review';
      friendlyMessage = "You're under review — our team will check your details shortly. This usually takes 24–48 hours.";
    } else {
      decision = 'auto_rejected';
      friendlyMessage = "You don't meet the eligibility criteria yet. You can complete DigiLocker verification or appeal for manual review.";
    }

    return { score, decision, signals: breakdown, friendlyMessage };
  }
}
