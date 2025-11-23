/**
 * Notification Dispatcher - Action Executor
 *
 * Sends notifications through various channels (email, in-app, SMS, push)
 * based on agent decisions. Includes deduplication, rate limiting,
 * quiet hours respect, and template rendering.
 *
 * @module NotificationDispatcher
 * @version 1.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/lib/prisma';
import type {
  SendNotificationParams,
  Logger,
} from '../types/agent.types';

// Re-export SendNotificationParams for convenience
export type { SendNotificationParams };

// =============================================================================
// TYPES
// =============================================================================

/**
 * Notification channel types
 */
export type NotificationChannel = 'email' | 'in_app' | 'sms' | 'push';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Status of a notification
 */
export type NotificationStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

/**
 * Notification payload structure for sending notifications
 */
export interface NotificationPayload {
  /** Delivery channel */
  channel: NotificationChannel;
  /** Recipient - userId for in_app/push, email for email, phone for sms */
  recipient: string;
  /** Subject line (for email) or title (for push/in-app) */
  subject: string;
  /** Notification body content */
  body: string;
  /** Priority level */
  priority: NotificationPriority;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Optional action URL for clickable notifications */
  actionUrl?: string;
  /** Template ID to use instead of raw content */
  templateId?: string;
  /** Template variables for personalization */
  templateData?: Record<string, unknown>;
  /** Organization ID for context */
  orgId?: string;
  /** Sender/source identifier */
  senderId?: string;
  /** Optional notification type for categorization */
  notificationType?: string;
  /** Whether to respect quiet hours */
  respectQuietHours?: boolean;
  /** Deduplication key - prevent sending same notification twice */
  deduplicationKey?: string;
  /** Time-to-live in seconds (after which notification expires) */
  ttlSeconds?: number;
}

/**
 * Result of sending a single notification
 */
export interface NotificationResult {
  /** Whether the send was successful */
  success: boolean;
  /** Generated notification ID */
  notificationId?: string;
  /** Channel used for delivery */
  channel: NotificationChannel;
  /** Recipient identifier */
  recipient: string;
  /** Delivery status */
  status: NotificationStatus;
  /** Error message if failed */
  error?: string;
  /** Timestamp when sent/queued */
  timestamp: Date;
  /** External service reference ID (e.g., Twilio SID, SendGrid ID) */
  externalId?: string;
  /** Whether notification was deduplicated (skipped as duplicate) */
  deduplicated?: boolean;
  /** Whether notification was deferred due to quiet hours */
  deferredForQuietHours?: boolean;
}

/**
 * Result of sending bulk notifications
 */
export interface BulkNotificationResult {
  /** Total notifications attempted */
  total: number;
  /** Successfully sent count */
  successful: number;
  /** Failed count */
  failed: number;
  /** Deduplicated (skipped) count */
  deduplicated: number;
  /** Individual results */
  results: NotificationResult[];
  /** Total time taken in milliseconds */
  processingTimeMs: number;
}

/**
 * Stored notification record
 */
export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  externalId?: string;
  errorMessage?: string;
  retryCount: number;
}

/**
 * Email-specific options
 */
export interface EmailOptions {
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** Reply-to address */
  replyTo?: string;
  /** Attachments */
  attachments?: Array<{
    filename: string;
    /** Content as string (base64) or binary data */
    content: string | Uint8Array;
    contentType?: string;
  }>;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Send as HTML */
  html?: boolean;
  /** Track opens */
  trackOpens?: boolean;
  /** Track clicks */
  trackClicks?: boolean;
}

/**
 * In-app notification options
 */
export interface InAppOptions {
  /** Icon to display */
  icon?: string;
  /** Image URL */
  imageUrl?: string;
  /** Auto-dismiss after milliseconds */
  autoDismissMs?: number;
  /** Action buttons */
  actions?: Array<{
    label: string;
    actionType: string;
    actionData?: Record<string, unknown>;
  }>;
  /** Category for filtering */
  category?: string;
  /** Whether notification persists */
  persistent?: boolean;
}

/**
 * SMS-specific options
 */
export interface SMSOptions {
  /** Sender ID or phone number */
  senderId?: string;
  /** Maximum segments */
  maxSegments?: number;
  /** Callback URL for delivery status */
  statusCallback?: string;
}

/**
 * Push notification options
 */
export interface PushOptions {
  /** Badge count */
  badge?: number;
  /** Sound to play */
  sound?: string;
  /** iOS/Android specific data */
  data?: Record<string, unknown>;
  /** Collapse key for grouping */
  collapseKey?: string;
  /** Time-to-live in seconds */
  ttl?: number;
  /** High priority delivery */
  priority?: 'normal' | 'high';
  /** Image URL */
  imageUrl?: string;
}

/**
 * User quiet hours configuration
 */
export interface QuietHoursConfig {
  enabled: boolean;
  /** Start time in HH:MM format (24h) */
  startTime: string;
  /** End time in HH:MM format (24h) */
  endTime: string;
  /** Timezone for the user */
  timezone: string;
  /** Days of week quiet hours apply (0=Sunday, 6=Saturday) */
  daysOfWeek?: number[];
  /** Allow urgent notifications during quiet hours */
  allowUrgent: boolean;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum notifications per user per minute */
  perMinute: number;
  /** Maximum notifications per user per hour */
  perHour: number;
  /** Maximum notifications per user per day */
  perDay: number;
  /** Burst allowance for urgent notifications */
  urgentBurstLimit: number;
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  bodyTemplate: string;
  variables: string[];
  defaultData?: Record<string, unknown>;
}

/**
 * Configuration for NotificationDispatcher
 */
export interface NotificationDispatcherConfig {
  /** Default rate limits */
  rateLimits: RateLimitConfig;
  /** Default quiet hours */
  defaultQuietHours?: QuietHoursConfig;
  /** Deduplication window in seconds */
  deduplicationWindowSeconds: number;
  /** Retry configuration */
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  /** External service configurations */
  services: {
    email?: {
      provider: 'sendgrid' | 'ses' | 'smtp' | 'resend';
      apiKey?: string;
      fromAddress: string;
      fromName?: string;
    };
    sms?: {
      provider: 'twilio' | 'vonage' | 'aws-sns';
      accountSid?: string;
      authToken?: string;
      fromNumber?: string;
    };
    push?: {
      provider: 'fcm' | 'apns' | 'expo';
      serverKey?: string;
      credentials?: Record<string, unknown>;
    };
  };
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: NotificationDispatcherConfig = {
  rateLimits: {
    perMinute: 10,
    perHour: 50,
    perDay: 200,
    urgentBurstLimit: 5,
  },
  deduplicationWindowSeconds: 300, // 5 minutes
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
  },
  services: {
    email: {
      provider: 'sendgrid',
      fromAddress: 'noreply@astralis.agency',
      fromName: 'Astralis Agency',
    },
  },
};

// =============================================================================
// DEFAULT LOGGER
// =============================================================================

const defaultLogger: Logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[NotificationDispatcher] ${message}`, data || '');
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[NotificationDispatcher] ${message}`, data || '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[NotificationDispatcher] ${message}`, data || '');
  },
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[NotificationDispatcher] ${message}`, error, data || '');
  },
};

// =============================================================================
// NOTIFICATION DISPATCHER CLASS
// =============================================================================

/**
 * NotificationDispatcher handles sending notifications through various channels
 * based on agent decisions. Supports email, in-app, SMS, and push notifications
 * with deduplication, rate limiting, quiet hours, and template rendering.
 *
 * @example
 * ```typescript
 * const dispatcher = new NotificationDispatcher();
 *
 * // Send a single notification
 * const result = await dispatcher.send({
 *   channel: 'email',
 *   recipient: 'user@example.com',
 *   subject: 'New Task Assigned',
 *   body: 'You have been assigned a new task.',
 *   priority: 'high',
 * });
 *
 * // Send in-app notification
 * await dispatcher.sendInApp(
 *   'user-123',
 *   'Your meeting starts in 15 minutes',
 *   'reminder',
 *   { eventId: 'event-456' }
 * );
 * ```
 */
export class NotificationDispatcher {
  private config: NotificationDispatcherConfig;
  private logger: Logger;
  private templates: Map<string, NotificationTemplate> = new Map();
  private rateLimitCache: Map<string, { count: number; resetAt: Date }[]> = new Map();
  private deduplicationCache: Map<string, Date> = new Map();
  private scheduledNotifications: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(config?: Partial<NotificationDispatcherConfig>, logger?: Logger) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = logger || defaultLogger;
    this.initializeTemplates();
    this.startDeduplicationCleanup();
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Send a notification through the appropriate channel
   *
   * @param notification - The notification payload
   * @returns Result of the send operation
   */
  async send(notification: NotificationPayload): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate payload
      this.validatePayload(notification);

      // Check deduplication
      if (notification.deduplicationKey) {
        const isDuplicate = this.checkDeduplication(notification.deduplicationKey);
        if (isDuplicate) {
          this.logger.info('Notification deduplicated', {
            deduplicationKey: notification.deduplicationKey,
          });
          return {
            success: true,
            channel: notification.channel,
            recipient: notification.recipient,
            status: 'sent',
            timestamp: new Date(),
            deduplicated: true,
          };
        }
      }

      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(
        notification.recipient,
        notification.priority
      );
      if (!rateLimitResult.allowed) {
        this.logger.warn('Rate limit exceeded', {
          recipient: notification.recipient,
          limit: rateLimitResult.limit,
        });
        return {
          success: false,
          channel: notification.channel,
          recipient: notification.recipient,
          status: 'failed',
          error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfterMs}ms`,
          timestamp: new Date(),
        };
      }

      // Check quiet hours
      if (notification.respectQuietHours !== false) {
        const quietHoursResult = await this.checkQuietHours(
          notification.recipient,
          notification.priority
        );
        if (quietHoursResult.inQuietHours && notification.priority !== 'urgent') {
          this.logger.info('Notification deferred for quiet hours', {
            recipient: notification.recipient,
            resumeAt: quietHoursResult.resumeAt,
          });

          // Schedule for later
          if (quietHoursResult.resumeAt) {
            const scheduledId = await this.scheduleNotification(
              notification,
              quietHoursResult.resumeAt
            );
            return {
              success: true,
              notificationId: scheduledId,
              channel: notification.channel,
              recipient: notification.recipient,
              status: 'queued',
              timestamp: new Date(),
              deferredForQuietHours: true,
            };
          }
        }
      }

      // Render template if provided
      let finalSubject = notification.subject;
      let finalBody = notification.body;

      if (notification.templateId) {
        const rendered = await this.renderTemplate(
          notification.templateId,
          notification.templateData || {}
        );
        finalSubject = rendered.subject;
        finalBody = rendered.body;
      }

      // Personalize content
      const personalizedBody = await this.personalizeContent(
        finalBody,
        notification.recipient,
        notification.metadata
      );

      // Send through appropriate channel
      let result: NotificationResult;

      switch (notification.channel) {
        case 'email':
          result = await this.sendViaEmail(
            notification.recipient,
            finalSubject,
            personalizedBody,
            notification
          );
          break;

        case 'in_app':
          result = await this.sendViaInApp(
            notification.recipient,
            finalSubject,
            personalizedBody,
            notification
          );
          break;

        case 'sms':
          result = await this.sendViaSMS(
            notification.recipient,
            personalizedBody,
            notification
          );
          break;

        case 'push':
          result = await this.sendViaPush(
            notification.recipient,
            finalSubject,
            personalizedBody,
            notification
          );
          break;

        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }

      // Record for deduplication
      if (notification.deduplicationKey && result.success) {
        this.recordDeduplication(notification.deduplicationKey);
      }

      // Update rate limit counter
      if (result.success) {
        this.recordRateLimitUsage(notification.recipient);
      }

      // Store notification record
      await this.storeNotificationRecord({
        ...notification,
        subject: finalSubject,
        body: personalizedBody,
      }, result);

      const processingTime = Date.now() - startTime;
      this.logger.info('Notification sent', {
        channel: notification.channel,
        recipient: notification.recipient,
        success: result.success,
        processingTimeMs: processingTime,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to send notification', error, {
        channel: notification.channel,
        recipient: notification.recipient,
      });

      return {
        success: false,
        channel: notification.channel,
        recipient: notification.recipient,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send an email notification
   *
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content
   * @param options - Additional email options
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: EmailOptions
  ): Promise<void> {
    const result = await this.send({
      channel: 'email',
      recipient: to,
      subject,
      body,
      priority: 'medium',
      metadata: options as Record<string, unknown>,
    });

    if (!result.success) {
      throw new Error(`Failed to send email: ${result.error}`);
    }
  }

  /**
   * Send an in-app notification
   *
   * @param userId - User ID to notify
   * @param message - Notification message
   * @param type - Notification type for categorization
   * @param data - Additional data for the notification
   */
  async sendInApp(
    userId: string,
    message: string,
    type: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const result = await this.send({
      channel: 'in_app',
      recipient: userId,
      subject: type,
      body: message,
      priority: 'medium',
      notificationType: type,
      metadata: data,
    });

    if (!result.success) {
      throw new Error(`Failed to send in-app notification: ${result.error}`);
    }
  }

  /**
   * Send multiple notifications in bulk
   *
   * @param notifications - Array of notification payloads
   * @returns Bulk result with individual outcomes
   */
  async sendBulk(notifications: NotificationPayload[]): Promise<BulkNotificationResult> {
    const startTime = Date.now();
    const results: NotificationResult[] = [];
    let successful = 0;
    let failed = 0;
    let deduplicated = 0;

    // Process in parallel with concurrency limit
    const CONCURRENCY_LIMIT = 10;
    const chunks = this.chunkArray(notifications, CONCURRENCY_LIMIT);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(notification => this.send(notification))
      );

      for (const result of chunkResults) {
        results.push(result);
        if (result.deduplicated) {
          deduplicated++;
        } else if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }
    }

    const processingTimeMs = Date.now() - startTime;

    this.logger.info('Bulk notifications sent', {
      total: notifications.length,
      successful,
      failed,
      deduplicated,
      processingTimeMs,
    });

    return {
      total: notifications.length,
      successful,
      failed,
      deduplicated,
      results,
      processingTimeMs,
    };
  }

  /**
   * Schedule a notification for future delivery
   *
   * @param notification - The notification payload
   * @param sendAt - When to send the notification
   * @returns Scheduled notification ID
   */
  async scheduleNotification(
    notification: NotificationPayload,
    sendAt: Date
  ): Promise<string> {
    const notificationId = this.generateId();
    const delayMs = sendAt.getTime() - Date.now();

    if (delayMs <= 0) {
      // Send immediately if scheduled time is in the past
      await this.send(notification);
      return notificationId;
    }

    // Store scheduled notification
    try {
      await prisma.$executeRaw`
        INSERT INTO scheduled_notifications (id, payload, scheduled_for, created_at, status)
        VALUES (${notificationId}, ${JSON.stringify(notification)}::jsonb, ${sendAt}, NOW(), 'pending')
        ON CONFLICT DO NOTHING
      `;
    } catch {
      // Table might not exist, use in-memory scheduling
      this.logger.warn('scheduled_notifications table not found, using in-memory scheduling');
    }

    // Set up timer
    const timeout = setTimeout(async () => {
      this.scheduledNotifications.delete(notificationId);
      await this.send(notification);
    }, Math.min(delayMs, 2147483647)); // Max 32-bit integer for setTimeout

    this.scheduledNotifications.set(notificationId, timeout);

    this.logger.info('Notification scheduled', {
      notificationId,
      sendAt: sendAt.toISOString(),
      delayMs,
    });

    return notificationId;
  }

  /**
   * Cancel a scheduled notification
   *
   * @param notificationId - ID of the scheduled notification
   */
  async cancelScheduled(notificationId: string): Promise<void> {
    // Clear in-memory timer
    const timeout = this.scheduledNotifications.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(notificationId);
    }

    // Update database record
    try {
      await prisma.$executeRaw`
        UPDATE scheduled_notifications
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ${notificationId}
      `;
    } catch {
      // Table might not exist
      this.logger.warn('Could not update scheduled_notifications table');
    }

    this.logger.info('Scheduled notification cancelled', { notificationId });
  }

  /**
   * Get notification history for a user
   *
   * @param userId - User ID to get history for
   * @param limit - Maximum number of records to return
   * @returns Array of notification records
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      // Try to fetch from in_app_notifications table if it exists
      const notifications = await prisma.$queryRaw<Array<{
        id: string;
        user_id: string;
        channel: string;
        subject: string;
        body: string;
        priority: string;
        status: string;
        metadata: unknown;
        action_url: string | null;
        sent_at: Date | null;
        delivered_at: Date | null;
        read_at: Date | null;
        created_at: Date;
        updated_at: Date;
        external_id: string | null;
        error_message: string | null;
        retry_count: number;
      }>>`
        SELECT * FROM in_app_notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return notifications.map(n => ({
        id: n.id,
        channel: n.channel as NotificationChannel,
        recipient: n.user_id,
        subject: n.subject,
        body: n.body,
        priority: n.priority as NotificationPriority,
        status: n.status as NotificationStatus,
        metadata: n.metadata as Record<string, unknown> | undefined,
        actionUrl: n.action_url || undefined,
        sentAt: n.sent_at || undefined,
        deliveredAt: n.delivered_at || undefined,
        readAt: n.read_at || undefined,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
        externalId: n.external_id || undefined,
        errorMessage: n.error_message || undefined,
        retryCount: n.retry_count,
      }));
    } catch {
      // Table doesn't exist, return empty array
      this.logger.warn('in_app_notifications table not found');
      return [];
    }
  }

  /**
   * Mark an in-app notification as read
   *
   * @param notificationId - Notification ID
   * @param userId - User ID (for verification)
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE in_app_notifications
        SET read_at = NOW(), status = 'delivered', updated_at = NOW()
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
    } catch {
      this.logger.warn('Could not mark notification as read', { notificationId, userId });
    }
  }

  /**
   * Get unread notification count for a user
   *
   * @param userId - User ID
   * @returns Count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM in_app_notifications
        WHERE user_id = ${userId} AND read_at IS NULL
      `;
      return Number(result[0].count);
    } catch {
      return 0;
    }
  }

  /**
   * Register a notification template
   *
   * @param template - Template definition
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    this.logger.debug('Template registered', { templateId: template.id });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear all scheduled notifications
    for (const [id, timeout] of this.scheduledNotifications) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
    }
    this.logger.info('NotificationDispatcher destroyed');
  }

  // ===========================================================================
  // PRIVATE METHODS - CHANNEL HANDLERS
  // ===========================================================================

  /**
   * Send notification via email
   * @private
   */
  private async sendViaEmail(
    to: string,
    subject: string,
    body: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const emailConfig = this.config.services.email;

    if (!emailConfig) {
      return {
        success: false,
        channel: 'email',
        recipient: to,
        status: 'failed',
        error: 'Email service not configured',
        timestamp: new Date(),
      };
    }

    try {
      // PLACEHOLDER: Integrate with actual email service
      // This is where you would integrate with SendGrid, SES, Resend, etc.

      switch (emailConfig.provider) {
        case 'sendgrid':
          // const sgMail = require('@sendgrid/mail');
          // sgMail.setApiKey(emailConfig.apiKey);
          // await sgMail.send({
          //   to,
          //   from: { email: emailConfig.fromAddress, name: emailConfig.fromName },
          //   subject,
          //   text: body,
          //   html: payload.metadata?.html ? body : undefined,
          // });
          this.logger.debug('Would send via SendGrid', { to, subject });
          break;

        case 'ses':
          // Use AWS SES SDK
          this.logger.debug('Would send via AWS SES', { to, subject });
          break;

        case 'resend':
          // Use Resend SDK
          this.logger.debug('Would send via Resend', { to, subject });
          break;

        default:
          // SMTP fallback
          this.logger.debug('Would send via SMTP', { to, subject });
      }

      // For now, simulate successful send
      const notificationId = this.generateId();

      // Try to queue in database for actual processing
      try {
        await prisma.$executeRaw`
          INSERT INTO email_queue (id, to_address, subject, body, status, created_at)
          VALUES (${notificationId}, ${to}, ${subject}, ${body}, 'queued', NOW())
          ON CONFLICT DO NOTHING
        `;
      } catch {
        // Table might not exist, that's okay for placeholder
      }

      return {
        success: true,
        notificationId,
        channel: 'email',
        recipient: to,
        status: 'queued',
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        channel: 'email',
        recipient: to,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send notification via in-app channel
   * @private
   */
  private async sendViaInApp(
    userId: string,
    title: string,
    message: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      const notificationId = this.generateId();

      // Store in database for UI to fetch
      try {
        await prisma.$executeRaw`
          INSERT INTO in_app_notifications (
            id, user_id, channel, subject, body, priority, status,
            metadata, action_url, created_at, updated_at, retry_count
          )
          VALUES (
            ${notificationId}, ${userId}, 'in_app', ${title}, ${message},
            ${payload.priority}, 'sent', ${JSON.stringify(payload.metadata || {})}::jsonb,
            ${payload.actionUrl || null}, NOW(), NOW(), 0
          )
        `;
      } catch (dbError) {
        // If table doesn't exist, log and continue
        this.logger.warn('in_app_notifications table not found, notification not persisted', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
        });
      }

      // PLACEHOLDER: Could also emit via WebSocket for real-time delivery
      // this.websocketService?.emit(userId, 'notification', { id: notificationId, title, message });

      return {
        success: true,
        notificationId,
        channel: 'in_app',
        recipient: userId,
        status: 'sent',
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        channel: 'in_app',
        recipient: userId,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send notification via SMS
   * @private
   */
  private async sendViaSMS(
    phoneNumber: string,
    message: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const smsConfig = this.config.services.sms;

    if (!smsConfig) {
      return {
        success: false,
        channel: 'sms',
        recipient: phoneNumber,
        status: 'failed',
        error: 'SMS service not configured',
        timestamp: new Date(),
      };
    }

    try {
      // PLACEHOLDER: Integrate with actual SMS service
      // This is where you would integrate with Twilio, Vonage, AWS SNS, etc.

      switch (smsConfig.provider) {
        case 'twilio':
          // const twilio = require('twilio')(smsConfig.accountSid, smsConfig.authToken);
          // const twilioResult = await twilio.messages.create({
          //   body: message,
          //   to: phoneNumber,
          //   from: smsConfig.fromNumber,
          // });
          this.logger.debug('Would send via Twilio', { to: phoneNumber, messageLength: message.length });
          break;

        case 'vonage':
          // Use Vonage SDK
          this.logger.debug('Would send via Vonage', { to: phoneNumber });
          break;

        case 'aws-sns':
          // Use AWS SNS SDK
          this.logger.debug('Would send via AWS SNS', { to: phoneNumber });
          break;
      }

      const notificationId = this.generateId();

      return {
        success: true,
        notificationId,
        channel: 'sms',
        recipient: phoneNumber,
        status: 'queued',
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        channel: 'sms',
        recipient: phoneNumber,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send notification via push
   * @private
   */
  private async sendViaPush(
    userId: string,
    title: string,
    body: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const pushConfig = this.config.services.push;

    if (!pushConfig) {
      return {
        success: false,
        channel: 'push',
        recipient: userId,
        status: 'failed',
        error: 'Push notification service not configured',
        timestamp: new Date(),
      };
    }

    try {
      // PLACEHOLDER: Integrate with actual push service
      // This is where you would integrate with FCM, APNs, Expo, etc.

      // First, get the user's push tokens from database
      // const tokens = await this.getUserPushTokens(userId);

      switch (pushConfig.provider) {
        case 'fcm':
          // const admin = require('firebase-admin');
          // await admin.messaging().sendMulticast({
          //   tokens,
          //   notification: { title, body },
          //   data: payload.metadata as Record<string, string>,
          // });
          this.logger.debug('Would send via FCM', { userId, title });
          break;

        case 'apns':
          // Use APNs SDK
          this.logger.debug('Would send via APNs', { userId, title });
          break;

        case 'expo':
          // Use Expo Push SDK
          this.logger.debug('Would send via Expo', { userId, title });
          break;
      }

      const notificationId = this.generateId();

      return {
        success: true,
        notificationId,
        channel: 'push',
        recipient: userId,
        status: 'queued',
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        channel: 'push',
        recipient: userId,
        status: 'failed',
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  // ===========================================================================
  // PRIVATE METHODS - VALIDATION & HELPERS
  // ===========================================================================

  /**
   * Validate notification payload
   * @private
   */
  private validatePayload(payload: NotificationPayload): void {
    if (!payload.channel) {
      throw new Error('Notification channel is required');
    }
    if (!payload.recipient) {
      throw new Error('Notification recipient is required');
    }
    if (!payload.subject && payload.channel !== 'sms') {
      throw new Error('Notification subject is required');
    }
    if (!payload.body && !payload.templateId) {
      throw new Error('Notification body or templateId is required');
    }

    // Validate email format
    if (payload.channel === 'email' && !this.isValidEmail(payload.recipient)) {
      throw new Error('Invalid email address');
    }

    // Validate phone format for SMS
    if (payload.channel === 'sms' && !this.isValidPhone(payload.recipient)) {
      throw new Error('Invalid phone number');
    }
  }

  /**
   * Check if email is valid
   * @private
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone number is valid
   * @private
   */
  private isValidPhone(phone: string): boolean {
    // Basic phone validation - accepts E.164 format and common formats
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check rate limits for a recipient
   * @private
   */
  private async checkRateLimit(
    recipient: string,
    priority: NotificationPriority
  ): Promise<{ allowed: boolean; limit?: string; retryAfterMs?: number }> {
    const now = new Date();
    const limits = this.config.rateLimits;

    // Get or initialize rate limit records
    let records = this.rateLimitCache.get(recipient) || [];

    // Clean up expired records
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    records = records.filter(r => r.resetAt > oneDayAgo);

    // Count recent notifications
    const lastMinuteCount = records.filter(r => r.resetAt > oneMinuteAgo).length;
    const lastHourCount = records.filter(r => r.resetAt > oneHourAgo).length;
    const lastDayCount = records.length;

    // Check limits (allow burst for urgent)
    const effectiveMinuteLimit = priority === 'urgent'
      ? limits.perMinute + limits.urgentBurstLimit
      : limits.perMinute;

    if (lastMinuteCount >= effectiveMinuteLimit) {
      return {
        allowed: false,
        limit: 'perMinute',
        retryAfterMs: 60000 - (now.getTime() - oneMinuteAgo.getTime()),
      };
    }

    if (lastHourCount >= limits.perHour) {
      return {
        allowed: false,
        limit: 'perHour',
        retryAfterMs: 3600000 - (now.getTime() - oneHourAgo.getTime()),
      };
    }

    if (lastDayCount >= limits.perDay) {
      return {
        allowed: false,
        limit: 'perDay',
        retryAfterMs: 86400000 - (now.getTime() - oneDayAgo.getTime()),
      };
    }

    return { allowed: true };
  }

  /**
   * Record rate limit usage
   * @private
   */
  private recordRateLimitUsage(recipient: string): void {
    const records = this.rateLimitCache.get(recipient) || [];
    records.push({
      count: 1,
      resetAt: new Date(Date.now() + 86400000), // Expires in 24 hours
    });
    this.rateLimitCache.set(recipient, records);
  }

  /**
   * Check quiet hours for a user
   * @private
   */
  private async checkQuietHours(
    recipient: string,
    priority: NotificationPriority
  ): Promise<{ inQuietHours: boolean; resumeAt?: Date }> {
    // Try to get user's quiet hours settings
    let quietHours = this.config.defaultQuietHours;

    try {
      // PLACEHOLDER: Fetch user preferences from database
      // const userPrefs = await prisma.userPreferences.findUnique({
      //   where: { userId: recipient },
      //   select: { quietHours: true },
      // });
      // if (userPrefs?.quietHours) {
      //   quietHours = userPrefs.quietHours as QuietHoursConfig;
      // }
    } catch {
      // Use default config
    }

    if (!quietHours?.enabled) {
      return { inQuietHours: false };
    }

    // Allow urgent notifications during quiet hours if configured
    if (priority === 'urgent' && quietHours.allowUrgent) {
      return { inQuietHours: false };
    }

    // Parse times and check
    const now = new Date();
    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let inQuietHours = false;

    if (startMinutes <= endMinutes) {
      // Same day quiet hours (e.g., 22:00 - 23:00)
      inQuietHours = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight quiet hours (e.g., 22:00 - 07:00)
      inQuietHours = currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    // Check day of week if specified
    if (inQuietHours && quietHours.daysOfWeek) {
      const currentDay = now.getDay();
      if (!quietHours.daysOfWeek.includes(currentDay)) {
        inQuietHours = false;
      }
    }

    if (inQuietHours) {
      // Calculate resume time
      const resumeAt = new Date(now);
      if (startMinutes <= endMinutes) {
        resumeAt.setHours(endHour, endMin, 0, 0);
      } else if (currentMinutes >= startMinutes) {
        // After start, resume next day
        resumeAt.setDate(resumeAt.getDate() + 1);
        resumeAt.setHours(endHour, endMin, 0, 0);
      } else {
        // Before end, resume today
        resumeAt.setHours(endHour, endMin, 0, 0);
      }
      return { inQuietHours: true, resumeAt };
    }

    return { inQuietHours: false };
  }

  /**
   * Check deduplication
   * @private
   */
  private checkDeduplication(key: string): boolean {
    const existing = this.deduplicationCache.get(key);
    if (!existing) return false;

    const windowMs = this.config.deduplicationWindowSeconds * 1000;
    if (Date.now() - existing.getTime() < windowMs) {
      return true;
    }

    this.deduplicationCache.delete(key);
    return false;
  }

  /**
   * Record deduplication key
   * @private
   */
  private recordDeduplication(key: string): void {
    this.deduplicationCache.set(key, new Date());
  }

  /**
   * Start periodic cleanup of deduplication cache
   * @private
   */
  private startDeduplicationCleanup(): void {
    setInterval(() => {
      const windowMs = this.config.deduplicationWindowSeconds * 1000;
      const cutoff = new Date(Date.now() - windowMs);

      for (const [key, timestamp] of this.deduplicationCache) {
        if (timestamp < cutoff) {
          this.deduplicationCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Render a notification template
   * @private
   */
  private async renderTemplate(
    templateId: string,
    data: Record<string, unknown>
  ): Promise<{ subject: string; body: string }> {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const mergedData = { ...template.defaultData, ...data };

    let subject = template.subject;
    let body = template.bodyTemplate;

    // Simple variable replacement
    for (const [key, value] of Object.entries(mergedData)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const stringValue = String(value ?? '');
      subject = subject.replace(regex, stringValue);
      body = body.replace(regex, stringValue);
    }

    return { subject, body };
  }

  /**
   * Personalize content with user information
   * @private
   */
  private async personalizeContent(
    content: string,
    recipient: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    let personalized = content;

    // Try to fetch user information for personalization
    try {
      const user = await prisma.users.findFirst({
        where: {
          OR: [
            { id: recipient },
            { email: recipient },
          ],
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (user) {
        const firstName = user.name?.split(' ')[0] || 'there';
        personalized = personalized
          .replace(/{{user\.name}}/g, user.name || '')
          .replace(/{{user\.firstName}}/g, firstName)
          .replace(/{{user\.email}}/g, user.email);
      }
    } catch {
      // User table might not exist or query failed
    }

    // Replace metadata placeholders
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        personalized = personalized.replace(regex, String(value ?? ''));
      }
    }

    return personalized;
  }

  /**
   * Store notification record in database
   * @private
   */
  private async storeNotificationRecord(
    payload: NotificationPayload & { subject: string; body: string },
    result: NotificationResult
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO notification_logs (
          id, channel, recipient, subject, body, priority, status,
          metadata, action_url, external_id, error_message, created_at
        )
        VALUES (
          ${result.notificationId || this.generateId()},
          ${payload.channel},
          ${payload.recipient},
          ${payload.subject},
          ${payload.body},
          ${payload.priority},
          ${result.status},
          ${JSON.stringify(payload.metadata || {})}::jsonb,
          ${payload.actionUrl || null},
          ${result.externalId || null},
          ${result.error || null},
          NOW()
        )
        ON CONFLICT DO NOTHING
      `;
    } catch {
      // Table might not exist
      this.logger.debug('Could not store notification log');
    }
  }

  /**
   * Initialize default templates
   * @private
   */
  private initializeTemplates(): void {
    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Email',
      channel: 'email',
      subject: 'Welcome to {{appName}}!',
      bodyTemplate: `
Hi {{user.firstName}},

Welcome to {{appName}}! We're excited to have you on board.

Here are a few things you can do to get started:
- Complete your profile
- Explore our features
- Connect with your team

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{appName}} Team
      `.trim(),
      variables: ['user.firstName', 'appName'],
      defaultData: { appName: 'Astralis' },
    });

    // Task assigned template
    this.templates.set('task_assigned', {
      id: 'task_assigned',
      name: 'Task Assigned Notification',
      channel: 'in_app',
      subject: 'New Task Assigned',
      bodyTemplate: 'You have been assigned a new task: {{taskName}}',
      variables: ['taskName'],
    });

    // Meeting reminder template
    this.templates.set('meeting_reminder', {
      id: 'meeting_reminder',
      name: 'Meeting Reminder',
      channel: 'push',
      subject: 'Meeting Starting Soon',
      bodyTemplate: 'Your meeting "{{meetingTitle}}" starts in {{minutesBefore}} minutes',
      variables: ['meetingTitle', 'minutesBefore'],
    });

    // Intake received template
    this.templates.set('intake_received', {
      id: 'intake_received',
      name: 'Intake Received Confirmation',
      channel: 'email',
      subject: 'We received your inquiry',
      bodyTemplate: `
Hi {{user.firstName}},

Thank you for reaching out! We've received your inquiry and a member of our team will be in touch shortly.

Reference: {{intakeId}}
Subject: {{subject}}

Best regards,
The {{appName}} Team
      `.trim(),
      variables: ['user.firstName', 'intakeId', 'subject', 'appName'],
      defaultData: { appName: 'Astralis' },
    });
  }

  /**
   * Generate a unique ID
   * @private
   */
  private generateId(): string {
    return `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Split array into chunks
   * @private
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Singleton instance of NotificationDispatcher
 */
export const notificationDispatcher = new NotificationDispatcher();

/**
 * Export default for convenience
 */
export default NotificationDispatcher;
