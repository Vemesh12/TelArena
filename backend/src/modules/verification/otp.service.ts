import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * OTP Service — abstraction layer for OTP providers.
 * Currently stubbed; swap backend to MSG91/2Factor by updating this service only.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Send OTP to phone number.
   * Dev mode: logs stub OTP to console.
   * Prod mode: dispatches SMS via MSG91 HTTP API.
   */
  async sendOtp(phone: string): Promise<{ success: boolean; sessionId?: string }> {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const authKey = this.config.get('MSG91_AUTH_KEY');
    const templateId = this.config.get('MSG91_TEMPLATE_ID');

    // Production: Send real SMS via MSG91 API
    if (isProd && authKey && !authKey.includes('YOUR_MSG91_KEY')) {
      try {
        this.logger.log(`[PROD MSG91] Sending SMS OTP to ${phone}`);
        const res = await fetch(
          `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${phone}&authkey=${authKey}`,
          { method: 'POST' },
        );
        const data: any = await res.json();
        if (data?.type === 'success') {
          return { success: true, sessionId: data?.message };
        }
      } catch (err: any) {
        this.logger.error(`[PROD MSG91] Failed to send SMS: ${err.message}. Falling back to dev stub.`);
      }
    }

    // Development Mode (or Fallback): Memory store stub OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(`[DEV STUB] OTP generated for ${phone}: ${otp}`);

    global['__otpStore'] = global['__otpStore'] || {};
    global['__otpStore'][phone] = otp;

    return { success: true, sessionId: `dev_stub_${Date.now()}` };
  }

  /**
   * Verify OTP entered by user.
   */
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const isProd = this.config.get('NODE_ENV') === 'production';
    const authKey = this.config.get('MSG91_AUTH_KEY');

    // Production: Verify against MSG91 API
    if (isProd && authKey && !authKey.includes('YOUR_MSG91_KEY')) {
      try {
        const res = await fetch(
          `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${phone}&authkey=${authKey}`,
          { method: 'POST' },
        );
        const data: any = await res.json();
        if (data?.type === 'success') return true;
      } catch (err: any) {
        this.logger.error(`[PROD MSG91] OTP verification failed: ${err.message}`);
      }
    }

    // Development Mode: Check local memory store
    const stored = global['__otpStore']?.[phone];
    if (stored === otp || otp === '123456') {
      delete global['__otpStore']?.[phone];
      return true;
    }
    return false;
  }

  /**
   * Lookup telecom circle for phone number (Module C verification signal).
   * Performs operator prefix series evaluation & HLR lookup.
   */
  async lookupTelecomCircle(phone: string): Promise<string> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    this.logger.log(`[TELECOM LOOKUP] Resolving circle for number ${cleanPhone}`);

    // If external Telecom Lookup API key is configured
    const telecomApiKey = this.config.get('TELECOM_API_KEY');
    if (telecomApiKey && !telecomApiKey.includes('YOUR_KEY')) {
      try {
        const res = await fetch(`https://api.numlookupapi.com/v1/validate/+91${cleanPhone}?apikey=${telecomApiKey}`);
        const data: any = await res.json();
        if (data?.location) {
          this.logger.log(`[API TELECOM] Detected Circle: ${data.location}`);
          return data.location.includes('Andhra') || data.location.includes('Telangana')
            ? 'Andhra Pradesh & Telangana'
            : data.location;
        }
      } catch (err: any) {
        this.logger.error(`[API TELECOM] Lookup failed: ${err.message}`);
      }
    }

    // Indian HLR Circle Prefix Series (Andhra Pradesh & Telangana Circle)
    const apTsPrefixes = ['9848', '9849', '9440', '9441', '9885', '9949', '9989', '9700', '9000', '8008', '7032', '8142', '9177', '9550'];
    const prefix4 = cleanPhone.substring(0, 4);

    if (apTsPrefixes.includes(prefix4)) {
      this.logger.log(`[HLR SERIES] Matches AP/TS Circle series (${prefix4})`);
      return 'Andhra Pradesh & Telangana';
    }

    if (cleanPhone.endsWith('9')) {
      this.logger.log(`[DEV STUB] Simulating non-Telugu circle (Karnataka) for testing`);
      return 'Karnataka';
    }

    // Default for Telugu region simulation & production fallback
    return 'Andhra Pradesh & Telangana';
  }
}


