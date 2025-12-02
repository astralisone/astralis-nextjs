/**
 * Webhook Signature Verification Utility
 *
 * Provides secure HMAC-SHA256 signature verification for incoming webhooks.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @module webhook-verification
 */

import crypto from 'crypto';

/**
 * Supported signature header names
 */
export const SIGNATURE_HEADERS = [
  'x-astralis-signature',
  'x-webhook-signature',
  'x-hub-signature-256', // GitHub-style
] as const;

/**
 * Configuration options for webhook verification
 */
export interface WebhookVerificationOptions {
  /** The webhook secret key */
  secret: string;
  /** The signature from the webhook headers */
  signature: string;
  /** The raw payload to verify (as string or buffer) */
  payload: string | Buffer;
  /** Optional custom hash algorithm (default: 'sha256') */
  algorithm?: 'sha256' | 'sha512';
  /** Whether to allow signatures without version prefix (default: true) */
  allowUnprefixed?: boolean;
}

/**
 * Result of signature verification
 */
export interface VerificationResult {
  /** Whether the signature is valid */
  isValid: boolean;
  /** Error message if verification failed */
  error?: string;
  /** The algorithm used for verification */
  algorithm?: string;
}

/**
 * Verify webhook signature using HMAC-SHA256
 *
 * Supports multiple signature formats:
 * - `sha256=<hex_signature>` (prefixed, recommended)
 * - `<hex_signature>` (unprefixed)
 *
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param options - Verification options
 * @returns Verification result with validity status
 *
 * @example
 * ```typescript
 * const result = verifyWebhookSignature({
 *   secret: process.env.WEBHOOK_SECRET!,
 *   signature: req.headers['x-astralis-signature'],
 *   payload: JSON.stringify(req.body),
 * });
 *
 * if (!result.isValid) {
 *   return res.status(401).json({ error: result.error });
 * }
 * ```
 */
export function verifyWebhookSignature(
  options: WebhookVerificationOptions
): VerificationResult {
  const {
    secret,
    signature,
    payload,
    algorithm = 'sha256',
    allowUnprefixed = true,
  } = options;

  // Validate inputs
  if (!secret) {
    return { isValid: false, error: 'Webhook secret is required' };
  }

  if (!signature) {
    return { isValid: false, error: 'Webhook signature is required' };
  }

  if (!payload) {
    return { isValid: false, error: 'Webhook payload is required' };
  }

  try {
    // Parse the signature format
    const { version, hexSignature } = parseSignature(signature, algorithm, allowUnprefixed);

    if (!hexSignature) {
      return {
        isValid: false,
        error: `Invalid signature format. Expected "${algorithm}=<hex>" or raw hex string`,
      };
    }

    // Compute the expected signature
    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf-8');
    const expectedSignature = crypto.createHmac(version, secret)
      .update(payloadString, 'utf-8')
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const isValid = timingSafeCompare(expectedSignature, hexSignature);

    return {
      isValid,
      algorithm: version,
      error: isValid ? undefined : 'Signature verification failed',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isValid: false,
      error: `Signature verification error: ${errorMessage}`,
    };
  }
}

/**
 * Parse signature format and extract hex signature
 *
 * Supports:
 * - `sha256=<hex>` (GitHub-style)
 * - `sha512=<hex>`
 * - `<hex>` (raw hex, if allowUnprefixed is true)
 *
 * @param signature - The signature string
 * @param defaultAlgorithm - Default algorithm if not prefixed
 * @param allowUnprefixed - Whether to allow unprefixed signatures
 * @returns Parsed version and hex signature
 */
function parseSignature(
  signature: string,
  defaultAlgorithm: string,
  allowUnprefixed: boolean
): { version: string; hexSignature: string | null } {
  const trimmed = signature.trim();

  // Try to parse prefixed format (e.g., "sha256=abc123")
  const prefixMatch = trimmed.match(/^(sha256|sha512)=([a-fA-F0-9]+)$/);
  if (prefixMatch) {
    return {
      version: prefixMatch[1],
      hexSignature: prefixMatch[2].toLowerCase(),
    };
  }

  // Try unprefixed format if allowed (e.g., "abc123")
  if (allowUnprefixed && /^[a-fA-F0-9]+$/.test(trimmed)) {
    return {
      version: defaultAlgorithm,
      hexSignature: trimmed.toLowerCase(),
    };
  }

  return { version: defaultAlgorithm, hexSignature: null };
}

/**
 * Timing-safe string comparison to prevent timing attacks
 *
 * Compares two hex strings in constant time using Node.js built-in
 * crypto.timingSafeEqual function.
 *
 * @param expected - Expected signature (hex string)
 * @param actual - Actual signature (hex string)
 * @returns True if strings match
 */
function timingSafeCompare(expected: string, actual: string): boolean {
  // Convert hex strings to buffers
  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(actual, 'hex');

  // Length mismatch - not equal (but still constant-time)
  if (expectedBuffer.length !== actualBuffer.length) {
    // Use a dummy comparison to maintain constant time
    const dummyBuffer = Buffer.alloc(expectedBuffer.length);
    try {
      crypto.timingSafeEqual(expectedBuffer, dummyBuffer);
    } catch {
      // Intentionally ignore - we know they're different lengths
    }
    return false;
  }

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    // Should not happen if lengths match, but handle gracefully
    return false;
  }
}

/**
 * Extract webhook signature from request headers
 *
 * Checks common signature header names in order of preference:
 * 1. x-astralis-signature
 * 2. x-webhook-signature
 * 3. x-hub-signature-256 (GitHub-style)
 *
 * @param headers - Request headers object (case-insensitive)
 * @returns Signature string or undefined
 *
 * @example
 * ```typescript
 * const signature = extractSignatureFromHeaders(req.headers);
 * if (!signature) {
 *   return res.status(401).json({ error: 'Missing signature' });
 * }
 * ```
 */
export function extractSignatureFromHeaders(
  headers: Record<string, string | string[] | undefined>
): string | undefined {
  // Normalize headers to lowercase for case-insensitive lookup
  const normalizedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      normalizedHeaders[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
    }
  }

  // Check each supported header in order
  for (const headerName of SIGNATURE_HEADERS) {
    const value = normalizedHeaders[headerName];
    if (value && typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}

/**
 * Compute HMAC-SHA256 signature for a payload
 *
 * Useful for testing or generating signatures for outgoing webhooks.
 *
 * @param secret - The secret key
 * @param payload - The payload to sign
 * @param options - Optional configuration
 * @returns The signature in the specified format
 *
 * @example
 * ```typescript
 * const signature = computeWebhookSignature(
 *   process.env.WEBHOOK_SECRET!,
 *   JSON.stringify(payload),
 *   { includePrefix: true }
 * );
 * // Returns: "sha256=abc123..."
 * ```
 */
export function computeWebhookSignature(
  secret: string,
  payload: string | Buffer,
  options: {
    algorithm?: 'sha256' | 'sha512';
    includePrefix?: boolean;
  } = {}
): string {
  const { algorithm = 'sha256', includePrefix = true } = options;

  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf-8');
  const signature = crypto.createHmac(algorithm, secret)
    .update(payloadString, 'utf-8')
    .digest('hex');

  return includePrefix ? `${algorithm}=${signature}` : signature;
}
