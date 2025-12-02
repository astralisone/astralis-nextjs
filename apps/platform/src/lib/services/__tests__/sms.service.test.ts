/**
 * SMS Service Tests
 *
 * Unit tests for the SMS service to verify functionality
 * without requiring Twilio credentials.
 */

import { smsService } from '../sms.service';

describe('SmsService', () => {
  describe('isReady', () => {
    it('should return false when Twilio credentials are not configured', () => {
      // In test environment, credentials are not set
      expect(smsService.isReady()).toBe(false);
    });
  });

  describe('sendSms', () => {
    it('should skip sending when Twilio is not configured', async () => {
      const result = await smsService.sendSms('+15551234567', 'Test message');

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.error).toContain('not configured');
    });

    it('should validate phone number format', async () => {
      const result = await smsService.sendSms('invalid-phone', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });
  });

  describe('Message Templates', () => {
    const meetingDetails = {
      meetingTitle: 'Project Review',
      startTime: new Date('2025-01-15T14:00:00'),
      location: 'Conference Room A',
      duration: 60,
    };

    it('should skip sending confirmation SMS when not configured', async () => {
      const result = await smsService.sendConfirmation('+15551234567', meetingDetails);

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
    });

    it('should skip sending reminder SMS when not configured', async () => {
      const result = await smsService.sendReminder('+15551234567', meetingDetails);

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
    });

    it('should skip sending cancellation SMS when not configured', async () => {
      const result = await smsService.sendCancellation('+15551234567', meetingDetails);

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
    });
  });
});
