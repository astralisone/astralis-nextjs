/**
 * Webhook Service
 *
 * Handles HTTP webhook notifications with:
 * - HMAC-SHA256 signatures for security
 * - Retry logic with exponential backoff
 * - 30-second timeout per request
 * - Comprehensive error handling and logging
 *
 * @module webhook.service
 */

import { computeWebhookSignature } from '@/lib/utils/webhook-verification';

/**
 * Webhook event types for scheduling operations
 */
export type WebhookEventType =
  | 'scheduling.confirmed'
  | 'scheduling.cancelled'
  | 'scheduling.rescheduled'
  | 'scheduling.conflict_detected'
  | 'scheduling.awaiting_input';

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  /** Event type identifier */
  event: WebhookEventType;
  /** Event-specific data */
  data: {
    /** Task ID from SchedulingAgentTask */
    taskId: string;
    /** Event details (meeting info, conflicts, etc.) */
    eventDetails?: Record<string, unknown>;
    /** ISO timestamp of the event */
    timestamp: string;
    /** User ID associated with the task */
    userId?: string;
    /** Organization ID */
    orgId?: string;
  };
  /** HMAC-SHA256 signature for verification */
  signature?: string;
}

/**
 * Configuration options for webhook delivery
 */
export interface WebhookOptions {
  /** Target webhook URL */
  url: string;
  /** Secret key for HMAC signature (optional but recommended) */
  secret?: string;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30000 = 30s) */
  timeout?: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in milliseconds (default: 1000 = 1s) */
  initialRetryDelay?: number;
}

/**
 * Result of webhook delivery attempt
 */
export interface WebhookDeliveryResult {
  /** Whether delivery was successful */
  success: boolean;
  /** HTTP status code (if request completed) */
  statusCode?: number;
  /** Response body (if any) */
  responseBody?: unknown;
  /** Error message (if failed) */
  error?: string;
  /** Number of attempts made */
  attempts: number;
  /** Total time taken in milliseconds */
  duration: number;
}

/**
 * Webhook Service
 *
 * Provides methods for sending webhook notifications with retries,
 * timeouts, and HMAC signature generation.
 */
export class WebhookService {
  /**
   * Send a webhook notification with retry logic
   *
   * @param payload - The webhook payload to send
   * @param options - Delivery configuration options
   * @returns Delivery result with success status and metadata
   *
   * @example
   * ```typescript
   * const result = await webhookService.sendWebhook(
   *   {
   *     event: 'scheduling.confirmed',
   *     data: {
   *       taskId: 'task-123',
   *       eventDetails: { title: 'Team Meeting' },
   *       timestamp: new Date().toISOString(),
   *     },
   *   },
   *   {
   *     url: 'https://example.com/webhooks',
   *     secret: process.env.WEBHOOK_SECRET,
   *     maxRetries: 3,
   *   }
   * );
   *
   * if (!result.success) {
   *   console.error('Webhook delivery failed:', result.error);
   * }
   * ```
   */
  async sendWebhook(
    payload: Omit<WebhookPayload, 'signature'>,
    options: WebhookOptions
  ): Promise<WebhookDeliveryResult> {
    const {
      url,
      secret,
      headers = {},
      timeout = 30000,
      maxRetries = 3,
      initialRetryDelay = 1000,
    } = options;

    const startTime = Date.now();
    let lastError: string | undefined;
    let attempts = 0;

    // Validate URL
    if (!url || !this.isValidUrl(url)) {
      return {
        success: false,
        error: 'Invalid webhook URL',
        attempts: 0,
        duration: Date.now() - startTime,
      };
    }

    // Generate HMAC signature if secret provided
    let finalPayload: WebhookPayload = payload;
    if (secret) {
      const payloadString = JSON.stringify(payload);
      const signature = computeWebhookSignature(secret, payloadString, {
        algorithm: 'sha256',
        includePrefix: true,
      });
      finalPayload = { ...payload, signature };
    }

    console.log(`[WebhookService] Sending webhook to ${url}: ${payload.event}`);

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      attempts = attempt;

      try {
        console.log(`[WebhookService] Attempt ${attempt}/${maxRetries} for ${url}`);

        const result = await this.makeRequest(url, finalPayload, headers, timeout);

        if (result.success) {
          const duration = Date.now() - startTime;
          console.log(
            `[WebhookService] Webhook delivered successfully to ${url} ` +
            `(${attempts} attempt${attempts > 1 ? 's' : ''}, ${duration}ms)`
          );

          return {
            success: true,
            statusCode: result.statusCode,
            responseBody: result.responseBody,
            attempts,
            duration,
          };
        }

        // Request completed but returned error status
        lastError = result.error || `HTTP ${result.statusCode}`;
        console.warn(
          `[WebhookService] Attempt ${attempt} failed: ${lastError}`
        );

        // Don't retry on 4xx errors (except 429 Rate Limit and 408 Timeout)
        if (
          result.statusCode &&
          result.statusCode >= 400 &&
          result.statusCode < 500 &&
          result.statusCode !== 429 &&
          result.statusCode !== 408
        ) {
          console.log(
            `[WebhookService] Not retrying 4xx error (${result.statusCode})`
          );
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error(
          `[WebhookService] Attempt ${attempt} exception:`,
          lastError
        );
      }

      // Calculate exponential backoff delay (if not last attempt)
      if (attempt < maxRetries) {
        const delay = this.calculateBackoffDelay(attempt, initialRetryDelay);
        console.log(
          `[WebhookService] Waiting ${delay}ms before retry ${attempt + 1}`
        );
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    const duration = Date.now() - startTime;
    const error = `Webhook delivery failed after ${attempts} attempts: ${lastError}`;

    console.error(`[WebhookService] ${error} (${duration}ms total)`);

    return {
      success: false,
      error,
      attempts,
      duration,
    };
  }

  /**
   * Make HTTP POST request with timeout
   *
   * @param url - Target URL
   * @param payload - JSON payload
   * @param headers - Custom headers
   * @param timeout - Request timeout in ms
   * @returns Request result
   */
  private async makeRequest(
    url: string,
    payload: WebhookPayload,
    headers: Record<string, string>,
    timeout: number
  ): Promise<{
    success: boolean;
    statusCode?: number;
    responseBody?: unknown;
    error?: string;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Astralis-Webhook/1.0',
          'X-Astralis-Signature': payload.signature || '',
          ...headers,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body (if any)
      let responseBody: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }
      } else {
        responseBody = await response.text();
      }

      // Check if response indicates success (2xx status codes)
      const success = response.ok;

      return {
        success,
        statusCode: response.status,
        responseBody,
        error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if error was due to abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${timeout}ms`,
        };
      }

      // Network error or other exception
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Calculate exponential backoff delay
   *
   * Formula: initialDelay * (2 ^ (attempt - 1))
   * With jitter to prevent thundering herd
   *
   * @param attempt - Current attempt number (1-indexed)
   * @param initialDelay - Initial delay in ms
   * @returns Delay in milliseconds
   */
  private calculateBackoffDelay(attempt: number, initialDelay: number): number {
    // Exponential: 1s, 2s, 4s, 8s, 16s...
    const exponentialDelay = initialDelay * Math.pow(2, attempt - 1);

    // Add jitter (±20%) to prevent synchronized retries
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    const finalDelay = exponentialDelay + jitter;

    // Cap at 30 seconds max
    return Math.min(finalDelay, 30000);
  }

  /**
   * Sleep for specified duration
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate URL format
   *
   * @param url - URL string to validate
   * @returns True if valid HTTP/HTTPS URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

/**
 * Singleton instance of WebhookService
 */
export const webhookService = new WebhookService();
