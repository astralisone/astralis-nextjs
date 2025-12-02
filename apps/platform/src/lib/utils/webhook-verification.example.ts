/**
 * Webhook Signature Verification - Usage Examples
 *
 * This file demonstrates how to use webhook signature verification
 * in different scenarios within the Astralis platform.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  extractSignatureFromHeaders,
  computeWebhookSignature,
} from './webhook-verification';

// =============================================================================
// Example 1: Next.js API Route with Webhook Verification
// =============================================================================

/**
 * Example webhook endpoint with signature verification
 * Path: /api/webhooks/intake
 */
export async function POST_Example_IntakeWebhook(req: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Extract signature from headers
    const headersObj = Object.fromEntries(req.headers.entries());
    const signature = extractSignatureFromHeaders(headersObj);

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Get raw body for verification
    const body = await req.text();

    // Verify signature
    const verificationResult = verifyWebhookSignature({
      secret: webhookSecret,
      signature,
      payload: body,
    });

    if (!verificationResult.isValid) {
      console.warn('[Webhook] Signature verification failed:', verificationResult.error);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse body after verification succeeds
    const data = JSON.parse(body);

    // Process webhook data
    console.log('[Webhook] Verified webhook received:', {
      type: data.type,
      algorithm: verificationResult.algorithm,
    });

    // Your business logic here
    // ...

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// Example 2: Webhook Handler with Optional Signature
// =============================================================================

/**
 * Example webhook handler that makes signature verification optional
 * based on environment configuration
 */
export async function POST_Example_FlexibleWebhook(req: NextRequest) {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const requireSignature = process.env.WEBHOOK_REQUIRE_SIGNATURE === 'true';

  const body = await req.text();
  const headersObj = Object.fromEntries(req.headers.entries());
  const signature = extractSignatureFromHeaders(headersObj);

  // Verify signature if required or if signature is present
  if (requireSignature || signature) {
    if (!signature) {
      return NextResponse.json(
        { error: 'Webhook signature required but not provided' },
        { status: 401 }
      );
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const result = verifyWebhookSignature({
      secret: webhookSecret,
      signature,
      payload: body,
    });

    if (!result.isValid) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
  }

  // Process webhook
  const data = JSON.parse(body);
  // ... business logic

  return NextResponse.json({ success: true });
}

// =============================================================================
// Example 3: Webhook Client - Sending Signed Webhooks
// =============================================================================

/**
 * Example function for sending webhooks with signatures
 * Useful for outgoing webhooks to external systems
 */
export async function sendSignedWebhook(
  url: string,
  payload: Record<string, unknown>,
  options: {
    secret: string;
    algorithm?: 'sha256' | 'sha512';
  }
): Promise<Response> {
  const { secret, algorithm = 'sha256' } = options;

  // Serialize payload
  const payloadString = JSON.stringify(payload);

  // Compute signature
  const signature = computeWebhookSignature(secret, payloadString, {
    algorithm,
    includePrefix: true,
  });

  // Send webhook with signature header
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Astralis-Signature': signature,
      'User-Agent': 'Astralis-Webhook/1.0',
    },
    body: payloadString,
  });

  return response;
}

// =============================================================================
// Example 4: Testing Webhook Signatures
// =============================================================================

/**
 * Example test helper for generating valid webhook requests
 */
export function createTestWebhookRequest(
  payload: Record<string, unknown>,
  secret: string
): {
  body: string;
  headers: Record<string, string>;
  signature: string;
} {
  const body = JSON.stringify(payload);
  const signature = computeWebhookSignature(secret, body);

  return {
    body,
    signature,
    headers: {
      'Content-Type': 'application/json',
      'X-Astralis-Signature': signature,
    },
  };
}

// =============================================================================
// Example 5: Middleware for Automatic Verification
// =============================================================================

/**
 * Example middleware function that verifies webhook signatures
 * Can be used to wrap webhook handlers
 */
export function withWebhookVerification(
  handler: (req: NextRequest, data: unknown) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook Middleware] WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook verification not configured' },
        { status: 500 }
      );
    }

    // Extract signature
    const headersObj = Object.fromEntries(req.headers.entries());
    const signature = extractSignatureFromHeaders(headersObj);

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Get body
    const body = await req.text();

    // Verify
    const result = verifyWebhookSignature({
      secret: webhookSecret,
      signature,
      payload: body,
    });

    if (!result.isValid) {
      console.warn('[Webhook Middleware] Verification failed:', result.error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and call handler
    try {
      const data = JSON.parse(body);
      return await handler(req, data);
    } catch (error) {
      console.error('[Webhook Middleware] Error parsing body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
  };
}

/**
 * Usage of middleware:
 *
 * ```typescript
 * // src/app/api/webhooks/my-webhook/route.ts
 * const handler = async (req: NextRequest, data: unknown) => {
 *   // Handle verified webhook data
 *   return NextResponse.json({ success: true });
 * };
 *
 * export const POST = withWebhookVerification(handler);
 * ```
 */

// =============================================================================
// Example 6: Multi-Provider Webhook Handler
// =============================================================================

/**
 * Example handler that supports webhooks from multiple providers
 * with different signature formats
 */
export async function POST_Example_MultiProvider(req: NextRequest) {
  const body = await req.text();
  const headersObj = Object.fromEntries(req.headers.entries());

  // Determine provider based on headers
  const provider = determineWebhookProvider(headersObj);

  switch (provider) {
    case 'github': {
      // GitHub uses x-hub-signature-256
      const signature = headersObj['x-hub-signature-256'];
      const secret = process.env.GITHUB_WEBHOOK_SECRET;

      if (!signature || !secret) {
        return NextResponse.json({ error: 'Invalid GitHub webhook' }, { status: 401 });
      }

      const result = verifyWebhookSignature({
        secret,
        signature,
        payload: body,
      });

      if (!result.isValid) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }

      // Handle GitHub webhook
      break;
    }

    case 'stripe': {
      // Stripe uses Stripe-Signature header (custom format)
      // Would need custom verification logic
      break;
    }

    case 'astralis':
    default: {
      // Astralis internal webhooks
      const signature = extractSignatureFromHeaders(headersObj);
      const secret = process.env.WEBHOOK_SECRET;

      if (!signature || !secret) {
        return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
      }

      const result = verifyWebhookSignature({
        secret,
        signature,
        payload: body,
      });

      if (!result.isValid) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }

      break;
    }
  }

  const data = JSON.parse(body);
  // Process webhook...

  return NextResponse.json({ success: true });
}

function determineWebhookProvider(headers: Record<string, string>): string {
  if (headers['x-github-event']) return 'github';
  if (headers['stripe-signature']) return 'stripe';
  if (headers['x-astralis-signature']) return 'astralis';
  return 'unknown';
}

// =============================================================================
// Example 7: Webhook Signature Rotation
// =============================================================================

/**
 * Example handler that supports signature rotation
 * Tries multiple secrets for gradual migration
 */
export async function POST_Example_SignatureRotation(req: NextRequest) {
  const body = await req.text();
  const headersObj = Object.fromEntries(req.headers.entries());
  const signature = extractSignatureFromHeaders(headersObj);

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 401 }
    );
  }

  // Try current secret first
  const secrets = [
    process.env.WEBHOOK_SECRET_CURRENT,
    process.env.WEBHOOK_SECRET_PREVIOUS, // Allow previous for grace period
  ].filter(Boolean) as string[];

  let verified = false;
  let usedSecret = '';

  for (const secret of secrets) {
    const result = verifyWebhookSignature({
      secret,
      signature,
      payload: body,
    });

    if (result.isValid) {
      verified = true;
      usedSecret = secret === secrets[0] ? 'current' : 'previous';
      break;
    }
  }

  if (!verified) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Log if using old secret (for monitoring rotation)
  if (usedSecret === 'previous') {
    console.warn('[Webhook] Request verified with previous secret - consider notifying sender');
  }

  const data = JSON.parse(body);
  // Process webhook...

  return NextResponse.json({ success: true });
}
