import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  WebhookInputHandler,
  type WebhookSource,
  type ProcessingResult,
} from '@/lib/agent/inputs';
import { AgentInputSource } from '@/lib/agent/types/agent.types';

/**
 * Form Webhook Configuration
 *
 * Environment variables:
 * - FORM_WEBHOOK_SECRET: HMAC secret for signature verification (optional)
 * - DEFAULT_ORG_ID: Fallback organization ID
 */
const FORM_WEBHOOK_SECRET = process.env.FORM_WEBHOOK_SECRET || '';
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '';

// Signature validation window (5 minutes)
const SIGNATURE_VALIDITY_WINDOW_MS = 5 * 60 * 1000;

// Valid form source types
const VALID_SOURCES: WebhookSource[] = [
  'contact_form',
  'booking_form',
  'intake_form',
  'survey_form',
  'newsletter_signup',
  'callback_request',
  'generic',
];

/**
 * Logger utility for consistent log formatting
 */
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[Form Webhook] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[Form Webhook] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(`[Form Webhook] ${message}`, error, data ?? '');
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Form Webhook] ${message}`, data ?? '');
    }
  },
};

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(
  signature: string,
  timestamp: string,
  body: string
): { valid: boolean; error?: string } {
  if (!FORM_WEBHOOK_SECRET) {
    // Skip verification if secret not configured
    return { valid: true };
  }

  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature or timestamp' };
  }

  // Validate timestamp is within acceptable window
  const timestampMs = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > SIGNATURE_VALIDITY_WINDOW_MS) {
    return { valid: false, error: 'Timestamp outside validity window' };
  }

  // Compute expected signature
  const payload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', FORM_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' };
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return { valid: isValid, error: isValid ? undefined : 'Invalid signature' };
  } catch (error) {
    return { valid: false, error: 'Signature comparison error' };
  }
}

/**
 * Parse source from query parameter
 */
function parseSource(sourceParam: string | null): WebhookSource {
  if (!sourceParam) {
    return 'generic';
  }

  const normalizedSource = sourceParam.toLowerCase().replace(/-/g, '_') as WebhookSource;

  if (VALID_SOURCES.includes(normalizedSource)) {
    return normalizedSource;
  }

  return 'generic';
}

/**
 * Create webhook handler instance with configuration
 */
function createHandler(orgId: string): WebhookInputHandler {
  return new WebhookInputHandler({
    orgId,
    requireSignature: false, // Handled at route level
    logger,
  });
}

/**
 * POST /api/webhooks/form
 *
 * Receive and process form submissions.
 *
 * Query Parameters:
 * - source: contact_form | booking_form | intake_form | survey_form | newsletter_signup | callback_request | generic
 *
 * Headers (optional):
 * - X-Webhook-Signature: HMAC-SHA256 signature
 * - X-Webhook-Timestamp: Unix timestamp
 * - X-Org-ID: Organization ID (optional, falls back to DEFAULT_ORG_ID)
 *
 * Body: JSON form data
 *
 * Returns 200 quickly, processes through WebhookInputHandler
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  logger.info('Received form webhook', { correlationId });

  try {
    // 1. Parse query parameters
    const { searchParams } = new URL(req.url);
    const sourceParam = searchParams.get('source');
    const source = parseSource(sourceParam);

    logger.debug('Parsed source', { source, sourceParam, correlationId });

    // 2. Read raw body for signature verification
    const rawBody = await req.text();

    if (!rawBody) {
      logger.warn('Empty request body', { correlationId });
      return NextResponse.json(
        { error: 'Bad Request', details: 'Empty request body' },
        { status: 400 }
      );
    }

    // 3. Verify webhook signature (if configured)
    const signature = req.headers.get('X-Webhook-Signature') || req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('X-Webhook-Timestamp') || req.headers.get('x-webhook-timestamp') || '';

    const signatureCheck = verifyWebhookSignature(signature, timestamp, rawBody);
    if (!signatureCheck.valid) {
      logger.warn('Signature verification failed', { error: signatureCheck.error, correlationId });
      return NextResponse.json(
        { error: 'Unauthorized', details: signatureCheck.error },
        { status: 401 }
      );
    }

    // 4. Parse JSON body
    let formData: Record<string, unknown>;
    try {
      formData = JSON.parse(rawBody);
    } catch (parseError) {
      logger.error('Failed to parse JSON', parseError, { correlationId });
      return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 5. Get organization ID
    const orgId = req.headers.get('X-Org-ID') || req.headers.get('x-org-id') || DEFAULT_ORG_ID;

    if (!orgId) {
      logger.error('No organization ID available', { correlationId });
      return NextResponse.json(
        { error: 'Configuration Error', details: 'No organization configured' },
        { status: 500 }
      );
    }

    // 6. Return 200 immediately, process async
    // This ensures webhook providers don't timeout waiting for processing
    const responsePromise = processFormAsync(source, formData, orgId, correlationId, startTime);

    // For webhook reliability, we return immediately
    // The async processing will continue in the background
    if (process.env.WEBHOOK_SYNC_MODE === 'true') {
      // In sync mode (for testing), wait for processing
      const result = await responsePromise;
      return createResponse(result, correlationId, startTime);
    }

    // Fire and forget for webhook reliability
    responsePromise.catch((error) => {
      logger.error('Async processing failed', error, { correlationId });
    });

    return NextResponse.json(
      {
        success: true,
        correlationId,
        status: 'accepted',
        message: 'Form submission received and queued for processing',
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error processing form webhook', error, { correlationId });

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        correlationId,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process form submission asynchronously through the agent
 */
async function processFormAsync(
  source: WebhookSource,
  data: Record<string, unknown>,
  orgId: string,
  correlationId: string,
  startTime: number
): Promise<ProcessingResult> {
  logger.info('Processing form submission', { source, orgId, correlationId });

  const handler = createHandler(orgId);

  // Build webhook payload
  const payload = {
    source,
    timestamp: new Date(),
    data,
    headers: {
      'X-Correlation-ID': correlationId,
    },
  };

  // Process through handler
  const result = await handler.handleInput(payload);

  const processingTime = Date.now() - startTime;

  if (result.success) {
    logger.info('Form processed successfully', {
      correlationId,
      processingTimeMs: processingTime,
      eventEmitted: result.eventEmitted,
    });
  } else {
    logger.error('Form processing failed', result.error, {
      correlationId,
      processingTimeMs: processingTime,
    });
  }

  return result;
}

/**
 * Create response from processing result
 */
function createResponse(
  result: ProcessingResult,
  correlationId: string,
  startTime: number
): NextResponse {
  const processingTime = Date.now() - startTime;

  if (result.success) {
    return NextResponse.json(
      {
        success: true,
        correlationId,
        status: 'processed',
        processingTimeMs: processingTime,
        eventEmitted: result.eventEmitted,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      correlationId,
      error: result.error?.message || 'Processing failed',
      processingTimeMs: processingTime,
    },
    { status: 422 }
  );
}

/**
 * GET /api/webhooks/form
 *
 * Health check endpoint for form webhook.
 * Used to verify webhook URL is valid.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'form-webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
    supportedSources: VALID_SOURCES,
    config: {
      signatureVerification: !!FORM_WEBHOOK_SECRET,
      defaultOrgConfigured: !!DEFAULT_ORG_ID,
    },
  });
}
