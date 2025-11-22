/**
 * Scheduling Agent Delivery Service
 *
 * Handles the actual delivery of generated responses to users through
 * multiple channels: email, SMS, and webhooks.
 *
 * Features:
 * - Multi-channel delivery (email, SMS, webhook)
 * - Fallback to alternative channels if primary fails
 * - Delivery logging and tracking
 * - ICS calendar file attachments for scheduling responses
 *
 * Reference: docs/phase/AIAGENTS.md
 */

import { prisma } from '@/lib/prisma';
import { agentLogger } from '@/lib/services/agentLogger.service';
import { sendEmail as sendSmtpEmail } from '@/lib/email';
import { generateBookingCalendarEvent } from '@/lib/calendar';
import crypto from 'crypto';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported response delivery channels
 */
export type ResponseChannel = 'email' | 'sms' | 'webhook' | 'chat';

/**
 * Response types that can be generated and delivered
 */
export type ResponseType = 'confirmation' | 'alternatives' | 'clarification' | 'error' | 'reminder';

/**
 * Generated response structure from the response generation service
 */
export interface GeneratedResponse {
  /** Unique identifier for this response */
  id: string;
  /** Task ID this response is associated with */
  taskId: string;
  /** Type of response */
  responseType: ResponseType;
  /** Subject line for email delivery */
  subject: string;
  /** Plain text version of the response */
  textContent: string;
  /** HTML version of the response (for email) */
  htmlContent: string;
  /** Short version for SMS delivery (160 chars recommended) */
  shortContent?: string;
  /** Structured data for webhook/API delivery */
  jsonPayload?: Record<string, unknown>;
  /** Calendar event data for ICS attachment */
  calendarEvent?: {
    title: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail: string;
    attendeeName: string;
  };
  /** Additional metadata about the response */
  metadata?: Record<string, unknown>;
}

/**
 * Recipient information for response delivery
 */
export interface RecipientInfo {
  /** User ID in the system */
  userId?: string;
  /** Email address for email delivery */
  email?: string;
  /** Phone number for SMS delivery (E.164 format preferred) */
  phone?: string;
  /** Webhook URL for API delivery */
  webhookUrl?: string;
  /** User's preferred delivery channel */
  preferredChannel?: ResponseChannel;
  /** User's display name */
  name?: string;
}

/**
 * Result of a delivery attempt
 */
export interface DeliveryResult {
  /** Whether the delivery was successful */
  success: boolean;
  /** Channel that was used for delivery */
  channel: ResponseChannel;
  /** External message ID if available (e.g., Twilio SID, email message ID) */
  messageId?: string;
  /** Error message if delivery failed */
  error?: string;
  /** Timestamp of the delivery attempt */
  timestamp: Date;
  /** Number of segments for SMS (if applicable) */
  segments?: number;
  /** HTTP status code for webhook delivery */
  httpStatus?: number;
}

/**
 * SMS delivery options
 */
interface SmsOptions {
  /** Maximum number of segments to send */
  maxSegments?: number;
  /** Whether to wait for delivery receipt */
  waitForReceipt?: boolean;
}

/**
 * Webhook delivery options
 */
interface WebhookOptions {
  /** Custom headers to include */
  headers?: Record<string, string>;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

// ============================================================================
// Constants
// ============================================================================

const SMS_MAX_LENGTH = 160;
const SMS_CONCAT_MAX_LENGTH = 1600; // 10 segments max
const WEBHOOK_DEFAULT_TIMEOUT = 30000; // 30 seconds
const WEBHOOK_MAX_RETRIES = 3;

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Scheduling Agent Delivery Service
 *
 * Handles delivery of generated responses to recipients through
 * multiple channels with fallback support.
 */
class SchedulingAgentDeliveryService {
  /**
   * Deliver a response to a recipient through their preferred channel
   *
   * @param response - The generated response to deliver
   * @param recipient - Recipient information
   * @returns DeliveryResult with success status and metadata
   *
   * @example
   * ```typescript
   * const result = await deliveryService.deliverResponse(response, {
   *   userId: 'user-123',
   *   email: 'user@example.com',
   *   preferredChannel: 'email'
   * });
   * ```
   */
  async deliverResponse(
    response: GeneratedResponse,
    recipient: RecipientInfo
  ): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      // Determine preferred channel
      const preferredChannel = recipient.preferredChannel || await this.getPreferredChannel(recipient.userId);

      // Start delivery timing and log attempt
      const recipientMasked = recipient.email ? agentLogger.maskEmail(recipient.email) :
                              recipient.phone ? this.maskPhone(recipient.phone) : 'unknown';
      const timerHandle = agentLogger.startTimer('delivery', response.taskId, 'delivery');
      agentLogger.log('info', 'delivery', 'delivery.started',
        `Starting delivery via ${preferredChannel}`, {
        taskId: response.taskId,
        metadata: { channel: preferredChannel, recipientMasked },
      });

      // Attempt delivery through preferred channel
      let result: DeliveryResult;

      switch (preferredChannel) {
        case 'email':
          if (recipient.email) {
            result = await this.sendEmail(response, recipient.email, recipient.name);
          } else {
            result = {
              success: false,
              channel: 'email',
              error: 'No email address provided',
              timestamp: new Date(),
            };
          }
          break;

        case 'sms':
          if (recipient.phone) {
            result = await this.sendSms(response, recipient.phone);
          } else {
            result = {
              success: false,
              channel: 'sms',
              error: 'No phone number provided',
              timestamp: new Date(),
            };
          }
          break;

        case 'webhook':
          if (recipient.webhookUrl) {
            result = await this.sendWebhook(response, recipient.webhookUrl);
          } else {
            result = {
              success: false,
              channel: 'webhook',
              error: 'No webhook URL provided',
              timestamp: new Date(),
            };
          }
          break;

        case 'chat':
          // Chat delivery would integrate with a real-time messaging system
          result = {
            success: false,
            channel: 'chat',
            error: 'Chat delivery not yet implemented',
            timestamp: new Date(),
          };
          break;

        default:
          result = {
            success: false,
            channel: preferredChannel,
            error: `Unsupported channel: ${preferredChannel}`,
            timestamp: new Date(),
          };
      }

      // If primary channel failed, try fallback channels
      if (!result.success) {
        // Log primary failure
        const durationMs = agentLogger.endTimer(timerHandle);
        agentLogger.log('error', 'delivery', 'delivery.failed',
          `Delivery failed via ${preferredChannel}: ${result.error}`, {
          taskId: response.taskId,
          duration: durationMs,
          metadata: { channel: preferredChannel, error: result.error },
        });
        result = await this.attemptFallbackDelivery(response, recipient, preferredChannel);
      } else {
        // Log successful delivery
        const durationMs = agentLogger.endTimer(timerHandle);
        agentLogger.log('info', 'delivery', 'delivery.succeeded',
          `Delivery successful via ${preferredChannel}`, {
          taskId: response.taskId,
          duration: durationMs,
          metadata: { channel: preferredChannel, messageId: result.messageId },
        });
      }

      // Log the delivery attempt
      await this.logDeliveryAttempt(response, recipient, result, Date.now() - startTime);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Log delivery error
      agentLogger.logError('delivery', error instanceof Error ? error : new Error(errorMessage), {
        taskId: response.taskId,
        metadata: { channel: recipient.preferredChannel || 'email' },
      });

      return {
        success: false,
        channel: recipient.preferredChannel || 'email',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send response via email
   *
   * @param response - The generated response
   * @param email - Recipient email address
   * @param name - Optional recipient name
   * @returns DeliveryResult
   */
  async sendEmail(
    response: GeneratedResponse,
    email: string,
    name?: string
  ): Promise<DeliveryResult> {
    try {

      // Prepare attachments (ICS calendar file if applicable)
      const attachments: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
      }> = [];

      if (response.calendarEvent) {
        try {
          const icsContent = await generateBookingCalendarEvent({
            title: response.calendarEvent.title,
            description: response.calendarEvent.description,
            location: response.calendarEvent.location,
            startDate: response.calendarEvent.startTime,
            duration: Math.round(
              (response.calendarEvent.endTime.getTime() - response.calendarEvent.startTime.getTime()) /
                60000
            ),
            attendeeEmail: response.calendarEvent.attendeeEmail,
            attendeeName: response.calendarEvent.attendeeName,
            organizerEmail: process.env.SMTP_FROM_EMAIL || 'support@astralisone.com',
            organizerName: process.env.SMTP_FROM_NAME || 'Astralis',
          });

          attachments.push({
            filename: 'event.ics',
            content: icsContent,
            contentType: 'text/calendar; method=REQUEST',
          });
        } catch (icsError) {
          console.error('[DeliveryService:Email] Failed to generate ICS attachment:', icsError);
          // Continue without attachment
        }
      }

      // Send the email using existing email service
      await sendSmtpEmail({
        to: email,
        subject: response.subject,
        html: response.htmlContent,
        text: response.textContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      return {
        success: true,
        channel: 'email',
        messageId: `email-${response.id}-${Date.now()}`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email delivery failed';
      return {
        success: false,
        channel: 'email',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send response via SMS using Twilio
   *
   * @param response - The generated response
   * @param phone - Recipient phone number (E.164 format preferred)
   * @param options - SMS delivery options
   * @returns DeliveryResult
   */
  async sendSms(
    response: GeneratedResponse,
    phone: string,
    options: SmsOptions = {}
  ): Promise<DeliveryResult> {
    try {

      // Validate Twilio configuration
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio configuration missing. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
      }

      // Use short content if available, otherwise truncate text content
      let messageBody = response.shortContent || response.textContent;

      // Calculate segments and truncate if necessary
      const maxLength = options.maxSegments
        ? Math.min(options.maxSegments * SMS_MAX_LENGTH, SMS_CONCAT_MAX_LENGTH)
        : SMS_CONCAT_MAX_LENGTH;

      const segments = Math.ceil(messageBody.length / SMS_MAX_LENGTH);

      if (messageBody.length > maxLength) {
        messageBody = messageBody.substring(0, maxLength - 3) + '...';
      }

      // Normalize phone number (ensure E.164 format)
      const normalizedPhone = this.normalizePhoneNumber(phone);

      // Call Twilio API
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: normalizedPhone,
          Body: messageBody,
        }),
      });

      if (!twilioResponse.ok) {
        const errorData = await twilioResponse.json().catch(() => ({}));
        throw new Error(
          `Twilio API error: ${twilioResponse.status} - ${JSON.stringify(errorData)}`
        );
      }

      const twilioData = await twilioResponse.json();

      return {
        success: true,
        channel: 'sms',
        messageId: twilioData.sid,
        segments,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'SMS delivery failed';
      return {
        success: false,
        channel: 'sms',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send response via webhook
   *
   * @param response - The generated response
   * @param url - Webhook URL
   * @param options - Webhook delivery options
   * @returns DeliveryResult
   */
  async sendWebhook(
    response: GeneratedResponse,
    url: string,
    options: WebhookOptions = {}
  ): Promise<DeliveryResult> {
    const maxRetries = options.maxRetries || WEBHOOK_MAX_RETRIES;
    const timeout = options.timeout || WEBHOOK_DEFAULT_TIMEOUT;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {

        // Prepare webhook payload
        const payload = {
          id: response.id,
          taskId: response.taskId,
          responseType: response.responseType,
          subject: response.subject,
          content: {
            text: response.textContent,
            html: response.htmlContent,
            json: response.jsonPayload,
          },
          calendarEvent: response.calendarEvent
            ? {
                title: response.calendarEvent.title,
                startTime: response.calendarEvent.startTime.toISOString(),
                endTime: response.calendarEvent.endTime.toISOString(),
                location: response.calendarEvent.location,
              }
            : undefined,
          metadata: response.metadata,
          timestamp: new Date().toISOString(),
        };

        // Generate signature for webhook verification
        const signature = this.generateWebhookSignature(JSON.stringify(payload));

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': Date.now().toString(),
          'X-Response-ID': response.id,
          ...(options.headers || {}),
        };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const webhookResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!webhookResponse.ok) {
            throw new Error(`Webhook returned status ${webhookResponse.status}`);
          }

          return {
            success: true,
            channel: 'webhook',
            messageId: `webhook-${response.id}-${Date.now()}`,
            httpStatus: webhookResponse.status,
            timestamp: new Date(),
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Webhook delivery failed');
        attempt++;

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      channel: 'webhook',
      error: lastError?.message || 'Webhook delivery failed',
      timestamp: new Date(),
    };
  }

  /**
   * Get user's preferred delivery channel from their settings
   *
   * @param userId - User ID to look up
   * @returns Preferred channel or 'email' as default
   */
  async getPreferredChannel(userId?: string): Promise<ResponseChannel> {
    if (!userId) {
      return 'email';
    }

    try {
      // Try to fetch user preferences from the database
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          // Note: Add preferredNotificationChannel to User model if needed
        },
      });

      if (!user) {
        return 'email';
      }

      // For now, default to email since we don't have the preference field yet
      // In the future, check user.preferredNotificationChannel
      return 'email';
    } catch (error) {
      return 'email';
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Attempt delivery through fallback channels
   */
  private async attemptFallbackDelivery(
    response: GeneratedResponse,
    recipient: RecipientInfo,
    failedChannel: ResponseChannel
  ): Promise<DeliveryResult> {
    // Define fallback order
    const channelPriority: ResponseChannel[] = ['email', 'sms', 'webhook'];

    // Filter out the failed channel and channels without required info
    const availableChannels = channelPriority.filter((channel) => {
      if (channel === failedChannel) return false;
      switch (channel) {
        case 'email':
          return !!recipient.email;
        case 'sms':
          return !!recipient.phone;
        case 'webhook':
          return !!recipient.webhookUrl;
        default:
          return false;
      }
    });

    // Try each available channel
    for (const channel of availableChannels) {
      // Log fallback attempt
      agentLogger.log('warn', 'delivery', 'delivery.fallback',
        `Attempting fallback from ${failedChannel} to ${channel}`, {
        metadata: { failedChannel, fallbackChannel: channel },
      });

      let result: DeliveryResult;

      switch (channel) {
        case 'email':
          result = await this.sendEmail(response, recipient.email!, recipient.name);
          break;
        case 'sms':
          result = await this.sendSms(response, recipient.phone!);
          break;
        case 'webhook':
          result = await this.sendWebhook(response, recipient.webhookUrl!);
          break;
        default:
          continue;
      }

      if (result.success) {
        return result;
      }
    }

    // All fallbacks failed
    return {
      success: false,
      channel: failedChannel,
      error: 'All delivery channels failed',
      timestamp: new Date(),
    };
  }

  /**
   * Log delivery attempt to the database
   */
  private async logDeliveryAttempt(
    response: GeneratedResponse,
    recipient: RecipientInfo,
    result: DeliveryResult,
    durationMs: number
  ): Promise<void> {
    try {
      // Update the task with delivery information
      const task = await prisma.schedulingAgentTask.findUnique({
        where: { id: response.taskId },
        select: { aiMetadata: true },
      });

      if (task) {
        const existingMetadata = (task.aiMetadata as Record<string, unknown>) || {};
        const deliveryHistory = Array.isArray(existingMetadata.deliveryHistory)
          ? existingMetadata.deliveryHistory
          : [];

        deliveryHistory.push({
          responseId: response.id,
          responseType: response.responseType,
          channel: result.channel,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
          durationMs,
          timestamp: result.timestamp.toISOString(),
          recipient: {
            userId: recipient.userId,
            email: recipient.email ? this.maskEmail(recipient.email) : undefined,
            phone: recipient.phone ? this.maskPhone(recipient.phone) : undefined,
          },
        });

        await prisma.schedulingAgentTask.update({
          where: { id: response.taskId },
          data: {
            aiMetadata: {
              ...existingMetadata,
              deliveryHistory,
              lastDelivery: {
                responseId: response.id,
                channel: result.channel,
                success: result.success,
                timestamp: result.timestamp.toISOString(),
              },
            },
          },
        });
      }

      // Log delivery result with full context
      agentLogger.logDelivery(
        response.taskId,
        result.channel as 'email' | 'sms' | 'webhook' | 'api' | 'chat' | 'push',
        result.success,
        {
          recipientMasked: recipient.email ? agentLogger.maskEmail(recipient.email) :
                           recipient.phone ? this.maskPhone(recipient.phone) : undefined,
          messageId: result.messageId,
          error: result.error,
          durationMs,
        }
      );
    } catch (error) {
      // Don't fail the delivery if logging fails - silent fallback
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateWebhookSignature(payload: string): string {
    const secret = process.env.WEBHOOK_SIGNING_SECRET || 'default-webhook-secret';
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const digits = phone.replace(/\D/g, '');

    // If already has country code (11+ digits starting with 1 for US)
    if (digits.length === 11 && digits.startsWith('1')) {
      return '+' + digits;
    }

    // If 10 digits, assume US and add +1
    if (digits.length === 10) {
      return '+1' + digits;
    }

    // Otherwise, return with + prefix if not already present
    if (phone.startsWith('+')) {
      return phone;
    }

    return '+' + digits;
  }

  /**
   * Mask email for logging (privacy)
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    const maskedLocal = local.length > 2 ? local.substring(0, 2) + '***' : '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask phone for logging (privacy)
   */
  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return '***' + phone.slice(-4);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of SchedulingAgentDeliveryService
 */
export const schedulingAgentDeliveryService = new SchedulingAgentDeliveryService();

/**
 * Export the class for testing or custom instantiation
 */
export { SchedulingAgentDeliveryService };
