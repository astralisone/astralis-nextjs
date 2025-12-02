/**
 * SMS Service
 *
 * Handles SMS sending via Twilio with graceful fallback when credentials are not configured.
 * Supports message templates for scheduling confirmations, reminders, and cancellations.
 *
 * Environment Variables:
 * - TWILIO_ACCOUNT_SID: Twilio account SID
 * - TWILIO_AUTH_TOKEN: Twilio auth token
 * - TWILIO_PHONE_NUMBER: Twilio phone number (E.164 format, e.g., +15551234567)
 *
 * Usage:
 * ```typescript
 * import { smsService } from '@/lib/services/sms.service';
 *
 * // Send confirmation SMS
 * await smsService.sendSms('+15551234567', 'Your meeting is confirmed for 2pm today!');
 *
 * // Use template
 * await smsService.sendConfirmation('+15551234567', {
 *   meetingTitle: 'Project Review',
 *   startTime: new Date('2025-01-15T14:00:00'),
 * });
 * ```
 */

import * as TwilioSDK from 'twilio';

// SMS character limit (standard SMS is 160 characters)
const SMS_CHAR_LIMIT = 160;

/**
 * SMS sending options
 */
export interface SmsOptions {
  /**
   * Override the from phone number (defaults to TWILIO_PHONE_NUMBER)
   */
  from?: string;

  /**
   * Custom status callback URL for delivery receipts
   */
  statusCallback?: string;

  /**
   * Maximum number of characters (default: 160)
   */
  maxLength?: number;
}

/**
 * Meeting details for SMS templates
 */
export interface MeetingDetails {
  meetingTitle: string;
  startTime: Date;
  location?: string;
  duration?: number;
}

/**
 * SMS Service Result
 */
export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * SMS Service Class
 *
 * Provides SMS sending capabilities via Twilio with graceful degradation
 * when credentials are not configured.
 */
class SmsService {
  private client: TwilioSDK.Twilio | null = null;
  private fromPhoneNumber: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Twilio client if credentials are available
   */
  private initialize(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn(
        '[SmsService] Twilio credentials not configured. SMS sending will be skipped. ' +
        'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local'
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.client = TwilioSDK.default(accountSid, authToken);
      this.fromPhoneNumber = phoneNumber;
      this.isConfigured = true;
      console.log('[SmsService] Initialized successfully with Twilio');
    } catch (error) {
      console.error('[SmsService] Failed to initialize Twilio client:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if SMS service is configured and ready
   */
  public isReady(): boolean {
    return this.isConfigured && this.client !== null && this.fromPhoneNumber !== null;
  }

  /**
   * Send SMS message via Twilio
   *
   * @param to - Recipient phone number in E.164 format (e.g., +15551234567)
   * @param message - SMS message body (max 160 characters recommended)
   * @param options - Additional SMS options
   * @returns Promise<SmsResult> - Result of SMS sending operation
   */
  public async sendSms(
    to: string,
    message: string,
    options: SmsOptions = {}
  ): Promise<SmsResult> {
    // Check if service is configured
    if (!this.isReady()) {
      console.warn(
        `[SmsService] Skipping SMS to ${to} - Twilio not configured. Message: "${message.substring(0, 50)}..."`
      );
      return {
        success: false,
        skipped: true,
        error: 'Twilio credentials not configured',
      };
    }

    // Validate phone number format
    if (!this.isValidPhoneNumber(to)) {
      console.error(`[SmsService] Invalid phone number format: ${to}`);
      return {
        success: false,
        error: `Invalid phone number format: ${to}. Must be in E.164 format (e.g., +15551234567)`,
      };
    }

    // Truncate message if needed
    const maxLength = options.maxLength || SMS_CHAR_LIMIT;
    let finalMessage = message;
    if (message.length > maxLength) {
      finalMessage = message.substring(0, maxLength - 3) + '...';
      console.warn(
        `[SmsService] Message truncated from ${message.length} to ${maxLength} characters`
      );
    }

    // Send SMS via Twilio
    try {
      const result = await this.client!.messages.create({
        to,
        from: options.from || this.fromPhoneNumber!,
        body: finalMessage,
        statusCallback: options.statusCallback,
      });

      console.log(
        `[SmsService] SMS sent successfully to ${to} (SID: ${result.sid}, Status: ${result.status})`
      );

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      console.error(`[SmsService] Failed to send SMS to ${to}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS',
      };
    }
  }

  /**
   * Send confirmation SMS for a scheduled meeting
   *
   * @param to - Recipient phone number
   * @param details - Meeting details
   * @param options - Additional SMS options
   * @returns Promise<SmsResult>
   */
  public async sendConfirmation(
    to: string,
    details: MeetingDetails,
    options: SmsOptions = {}
  ): Promise<SmsResult> {
    const message = this.formatConfirmationMessage(details);
    return this.sendSms(to, message, options);
  }

  /**
   * Send reminder SMS for an upcoming meeting
   *
   * @param to - Recipient phone number
   * @param details - Meeting details
   * @param options - Additional SMS options
   * @returns Promise<SmsResult>
   */
  public async sendReminder(
    to: string,
    details: MeetingDetails,
    options: SmsOptions = {}
  ): Promise<SmsResult> {
    const message = this.formatReminderMessage(details);
    return this.sendSms(to, message, options);
  }

  /**
   * Send cancellation SMS for a cancelled meeting
   *
   * @param to - Recipient phone number
   * @param details - Meeting details
   * @param options - Additional SMS options
   * @returns Promise<SmsResult>
   */
  public async sendCancellation(
    to: string,
    details: MeetingDetails,
    options: SmsOptions = {}
  ): Promise<SmsResult> {
    const message = this.formatCancellationMessage(details);
    return this.sendSms(to, message, options);
  }

  /**
   * Validate phone number format (E.164)
   *
   * E.164 format: +[country code][subscriber number]
   * Example: +15551234567 (US), +442071234567 (UK)
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic E.164 validation: starts with +, followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  }

  /**
   * Format confirmation message (under 160 chars)
   */
  private formatConfirmationMessage(details: MeetingDetails): string {
    const time = this.formatTime(details.startTime);
    const date = this.formatDate(details.startTime);

    // Build message with title, date, time
    let message = `✓ ${details.meetingTitle} confirmed for ${date} at ${time}`;

    // Add location if present and space allows
    if (details.location && message.length + details.location.length + 3 < SMS_CHAR_LIMIT) {
      message += ` @ ${details.location}`;
    }

    return this.truncateToLimit(message);
  }

  /**
   * Format reminder message (under 160 chars)
   */
  private formatReminderMessage(details: MeetingDetails): string {
    const time = this.formatTime(details.startTime);
    const date = this.formatDate(details.startTime);

    let message = `⏰ Reminder: ${details.meetingTitle} ${date} at ${time}`;

    if (details.location && message.length + details.location.length + 3 < SMS_CHAR_LIMIT) {
      message += ` @ ${details.location}`;
    }

    return this.truncateToLimit(message);
  }

  /**
   * Format cancellation message (under 160 chars)
   */
  private formatCancellationMessage(details: MeetingDetails): string {
    const time = this.formatTime(details.startTime);
    const date = this.formatDate(details.startTime);

    const message = `✗ ${details.meetingTitle} on ${date} at ${time} has been cancelled.`;
    return this.truncateToLimit(message);
  }

  /**
   * Format time for SMS (12-hour format)
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format date for SMS (short format)
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateOnly.getTime() === today.getTime()) {
      return 'today';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return 'tomorrow';
    } else {
      // Format as "Jan 15" or "1/15"
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  /**
   * Truncate message to SMS character limit
   */
  private truncateToLimit(message: string, limit: number = SMS_CHAR_LIMIT): string {
    if (message.length <= limit) {
      return message;
    }
    return message.substring(0, limit - 3) + '...';
  }
}

// Export singleton instance
export const smsService = new SmsService();
