/**
 * Webhook Utilities
 *
 * Shared utilities for webhook signature verification and processing.
 *
 * @module agent/webhooks/utils
 */

import crypto from 'crypto';

// =============================================================================
// Configuration
// =============================================================================

/** Default signature validity window (5 minutes) */
export const DEFAULT_SIGNATURE_VALIDITY_WINDOW_MS = 5 * 60 * 1000;

// =============================================================================
// Types
// =============================================================================

/**
 * Supported webhook providers
 */
export type WebhookProvider =
  | 'sendgrid'
  | 'mailgun'
  | 'postmark'
  | 'twilio'
  | 'stripe'
  | 'n8n'
  | 'zapier'
  | 'make'
  | 'custom'
  | 'generic';

/**
 * Signature verification result
 */
export interface SignatureVerificationResult {
  /** Whether the signature is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Provider-specific details */
  details?: Record<string, unknown>;
}

/**
 * Signature verification options
 */
export interface SignatureVerificationOptions {
  /** The secret/key used for signature verification */
  secret: string;
  /** The signature from the request headers */
  signature: string;
  /** The timestamp from the request headers (for replay attack prevention) */
  timestamp?: string;
  /** The raw request body */
  body: string;
  /** Signature validity window in milliseconds (default: 5 minutes) */
  validityWindowMs?: number;
  /** Provider type for provider-specific verification */
  provider?: WebhookProvider;
}

// =============================================================================
// Generic HMAC Verification
// =============================================================================

/**
 * Verify a webhook signature using HMAC-SHA256
 *
 * Standard format: timestamp.body -> HMAC-SHA256 -> hex
 *
 * @param options - Verification options
 * @returns Verification result
 */
export function verifyHmacSignature(
  options: SignatureVerificationOptions
): SignatureVerificationResult {
  const {
    secret,
    signature,
    timestamp,
    body,
    validityWindowMs = DEFAULT_SIGNATURE_VALIDITY_WINDOW_MS,
  } = options;

  // Skip verification if no secret configured
  if (!secret) {
    return { valid: true, details: { reason: 'No secret configured, skipping verification' } };
  }

  // Check required fields
  if (!signature) {
    return { valid: false, error: 'Missing signature' };
  }

  // Validate timestamp if provided
  if (timestamp) {
    const timestampMs = parseInt(timestamp, 10) * 1000;
    const now = Date.now();

    if (isNaN(timestampMs)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    if (Math.abs(now - timestampMs) > validityWindowMs) {
      return {
        valid: false,
        error: 'Timestamp outside validity window',
        details: {
          timestampMs,
          nowMs: now,
          differenceMs: Math.abs(now - timestampMs),
          maxDifferenceMs: validityWindowMs,
        },
      };
    }
  }

  // Compute expected signature
  const payload = timestamp ? `${timestamp}.${body}` : body;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature.replace(/^v\d+=/, '')); // Strip version prefix if present
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' };
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid signature',
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Signature comparison error',
      details: { message: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// =============================================================================
// Provider-Specific Verification
// =============================================================================

/**
 * Verify a SendGrid Inbound Parse webhook
 *
 * SendGrid uses a simple auth token in the URL or custom header
 */
export function verifySendGridSignature(
  authToken: string,
  expectedToken: string
): SignatureVerificationResult {
  if (!expectedToken) {
    return { valid: true, details: { reason: 'No expected token configured' } };
  }

  if (!authToken) {
    return { valid: false, error: 'Missing auth token' };
  }

  try {
    const tokenBuffer = Buffer.from(authToken);
    const expectedBuffer = Buffer.from(expectedToken);

    if (tokenBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid token' };
    }

    const isValid = crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid auth token',
    };
  } catch {
    return { valid: false, error: 'Token comparison error' };
  }
}

/**
 * Verify a Mailgun webhook signature
 *
 * Mailgun uses: timestamp + token -> SHA256 -> compare with signature
 */
export function verifyMailgunSignature(
  secret: string,
  timestamp: string,
  token: string,
  signature: string
): SignatureVerificationResult {
  if (!secret) {
    return { valid: true, details: { reason: 'No secret configured' } };
  }

  if (!timestamp || !token || !signature) {
    return { valid: false, error: 'Missing timestamp, token, or signature' };
  }

  // Mailgun's signature format
  const payload = timestamp + token;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' };
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid signature',
    };
  } catch {
    return { valid: false, error: 'Signature comparison error' };
  }
}

/**
 * Verify a Stripe webhook signature
 *
 * Stripe uses: v1=signature format with timestamp
 */
export function verifyStripeSignature(
  secret: string,
  signatureHeader: string,
  body: string
): SignatureVerificationResult {
  if (!secret) {
    return { valid: true, details: { reason: 'No secret configured' } };
  }

  if (!signatureHeader) {
    return { valid: false, error: 'Missing signature header' };
  }

  // Parse Stripe signature header: t=timestamp,v1=signature
  const elements = signatureHeader.split(',');
  const sigParts: Record<string, string> = {};

  for (const element of elements) {
    const [key, value] = element.split('=');
    if (key && value) {
      sigParts[key] = value;
    }
  }

  const timestamp = sigParts['t'];
  const signature = sigParts['v1'];

  if (!timestamp || !signature) {
    return { valid: false, error: 'Invalid signature header format' };
  }

  // Check timestamp
  const timestampMs = parseInt(timestamp, 10) * 1000;
  const now = Date.now();

  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > DEFAULT_SIGNATURE_VALIDITY_WINDOW_MS) {
    return { valid: false, error: 'Timestamp outside validity window' };
  }

  // Compute expected signature
  const payload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' };
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid signature',
    };
  } catch {
    return { valid: false, error: 'Signature comparison error' };
  }
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Generate a webhook signature for testing
 *
 * @param secret - The secret key
 * @param body - The request body
 * @param timestamp - Optional timestamp (defaults to now)
 * @returns Object with signature and timestamp
 */
export function generateWebhookSignature(
  secret: string,
  body: string,
  timestamp?: number
): { signature: string; timestamp: string } {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const payload = `${ts}.${body}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return {
    signature,
    timestamp: ts.toString(),
  };
}

/**
 * Extract common webhook headers
 *
 * @param headers - Headers object or Map
 * @returns Normalized headers object
 */
export function extractWebhookHeaders(
  headers: Headers | Record<string, string>
): {
  signature?: string;
  timestamp?: string;
  provider?: string;
  correlationId?: string;
  userAgent?: string;
} {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? undefined;
    }
    // Case-insensitive lookup for Record<string, string>
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    return undefined;
  };

  return {
    signature: get('X-Webhook-Signature') || get('X-Signature'),
    timestamp: get('X-Webhook-Timestamp') || get('X-Timestamp'),
    provider: get('X-Webhook-Provider'),
    correlationId: get('X-Correlation-ID') || get('X-Request-ID'),
    userAgent: get('User-Agent'),
  };
}

/**
 * Generate a unique correlation ID
 *
 * @returns UUID v4 string
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Create a webhook response object
 *
 * @param success - Whether the webhook was processed successfully
 * @param correlationId - The correlation ID for tracking
 * @param data - Additional data to include in the response
 * @returns Response object
 */
export function createWebhookResponse(
  success: boolean,
  correlationId: string,
  data?: Record<string, unknown>
): Record<string, unknown> {
  return {
    success,
    correlationId,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

// =============================================================================
// Exports
// =============================================================================

export default {
  verifyHmacSignature,
  verifySendGridSignature,
  verifyMailgunSignature,
  verifyStripeSignature,
  generateWebhookSignature,
  extractWebhookHeaders,
  generateCorrelationId,
  createWebhookResponse,
};
