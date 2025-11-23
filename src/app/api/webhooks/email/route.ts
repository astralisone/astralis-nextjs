import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { IntakeSource, IntakeStatus } from '@prisma/client';
import { queueIntakeRouting } from '@/workers/queues/intakeRouting.queue';
import {
  EmailInputHandler,
  EmailProvider,
  type EmailHandlerConfig,
} from '@/lib/agent/inputs';
import { emitAgentEvent } from '@/lib/agent/inputs';

/**
 * Email Webhook Configuration
 *
 * Environment variables:
 * - EMAIL_WEBHOOK_SECRET: HMAC secret for signature verification
 * - DEFAULT_ORG_ID: Fallback organization ID when domain lookup fails
 */
const EMAIL_WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || '';
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '';
const ENABLE_AGENT_PROCESSING = process.env.ENABLE_AGENT_EMAIL_PROCESSING === 'true';

// Maximum description length for intake request
const MAX_DESCRIPTION_LENGTH = 2000;

// Signature validation window (5 minutes)
const SIGNATURE_VALIDITY_WINDOW_MS = 5 * 60 * 1000;

/**
 * Email webhook payload interface
 * Compatible with SendGrid/Postmark inbound parse formats
 */
interface EmailWebhookPayload {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
  }>;
  headers?: Record<string, string>;
  timestamp?: string;
  messageId?: string;
  spamScore?: number;
  spf?: string;
  dkim?: string;
}

/**
 * Verify webhook signature using HMAC-SHA256
 *
 * @param signature - The signature from the webhook header
 * @param timestamp - The timestamp from the webhook header
 * @param body - The raw request body
 * @returns boolean indicating if signature is valid
 */
function verifyWebhookSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  if (!EMAIL_WEBHOOK_SECRET) {
    console.error('[Email Webhook] EMAIL_WEBHOOK_SECRET not configured');
    return false;
  }

  if (!signature || !timestamp) {
    console.error('[Email Webhook] Missing signature or timestamp');
    return false;
  }

  // Validate timestamp is within acceptable window
  const timestampMs = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > SIGNATURE_VALIDITY_WINDOW_MS) {
    console.error('[Email Webhook] Timestamp outside validity window');
    return false;
  }

  // Compute expected signature
  const payload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', EMAIL_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('[Email Webhook] Signature comparison error:', error);
    return false;
  }
}

/**
 * Extract domain from email address
 *
 * @param email - Email address (e.g., "user@example.com")
 * @returns Domain portion (e.g., "example.com") or null if invalid
 */
function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // Handle format: "Name <email@domain.com>" or plain "email@domain.com"
  const match = email.match(/<([^>]+)>/) || [null, email];
  const cleanEmail = (match[1] || email).trim().toLowerCase();

  const atIndex = cleanEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === cleanEmail.length - 1) {
    return null;
  }

  return cleanEmail.substring(atIndex + 1);
}

/**
 * Extract email address from various formats
 *
 * @param email - Email string (may include display name)
 * @returns Clean email address
 */
function extractEmailAddress(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const match = email.match(/<([^>]+)>/);
  return (match ? match[1] : email).trim().toLowerCase();
}

/**
 * Truncate text to maximum length, preserving word boundaries
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Find last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Parse email body, preferring plain text over HTML
 *
 * @param text - Plain text body
 * @param html - HTML body
 * @returns Parsed text content
 */
function parseEmailBody(text?: string, html?: string): string {
  // Prefer plain text
  if (text && text.trim()) {
    return text.trim();
  }

  // Fall back to HTML with basic tag stripping
  if (html) {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

/**
 * Process email through the orchestration agent system
 *
 * @param emailPayload - The email webhook payload
 * @param orgId - Organization ID
 */
async function processEmailThroughAgent(
  emailPayload: EmailWebhookPayload,
  orgId: string
): Promise<void> {
  if (!ENABLE_AGENT_PROCESSING) {
    return;
  }

  try {
    // Create email handler with agent configuration
    const handlerConfig: EmailHandlerConfig = {
      orgId,
      skipSpam: true,
      skipBounces: true,
      skipAutoReplies: false, // We want to track auto-replies for context
      logger: {
        debug: (msg, data) => console.debug(`[Email Agent] ${msg}`, data ?? ''),
        info: (msg, data) => console.info(`[Email Agent] ${msg}`, data ?? ''),
        warn: (msg, data) => console.warn(`[Email Agent] ${msg}`, data ?? ''),
        error: (msg, err, data) => console.error(`[Email Agent] ${msg}`, err, data ?? ''),
      },
    };

    const emailHandler = new EmailInputHandler(handlerConfig);

    // Process email through agent handler
    // This will emit 'email:received' event for the orchestration agent
    const result = await emailHandler.handleInput(emailPayload);

    if (result.success) {
      console.log('[Email Webhook] Agent processing completed', {
        correlationId: result.input.correlationId,
        eventEmitted: result.eventEmitted,
      });
    } else {
      console.warn('[Email Webhook] Agent processing failed', {
        error: result.error?.message,
      });
    }
  } catch (error) {
    // Log but don't fail the request - agent processing is supplementary
    console.error('[Email Webhook] Agent processing error:', error);
  }
}

/**
 * Look up organization by recipient email domain
 *
 * @param recipientEmail - The recipient email address
 * @returns Organization ID or DEFAULT_ORG_ID
 */
async function lookupOrgByDomain(recipientEmail: string): Promise<string> {
  const domain = extractDomain(recipientEmail);

  if (!domain) {
    console.log('[Email Webhook] Could not extract domain, using default org');
    return DEFAULT_ORG_ID;
  }

  try {
    // Look for organization with matching domain in name or metadata
    // This is a simplified lookup - in production, you might have a dedicated
    // domain mapping table
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { contains: domain, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    if (org) {
      console.log(`[Email Webhook] Found org for domain ${domain}: ${org.id}`);
      return org.id;
    }
  } catch (error) {
    console.error('[Email Webhook] Error looking up organization:', error);
  }

  console.log(`[Email Webhook] No org found for domain ${domain}, using default`);
  return DEFAULT_ORG_ID;
}

/**
 * POST /api/webhooks/email
 *
 * Email webhook endpoint for inbound email parsing.
 * Compatible with SendGrid/Postmark inbound parse webhooks.
 *
 * Headers:
 * - X-Webhook-Signature: HMAC-SHA256 signature
 * - X-Webhook-Timestamp: Unix timestamp
 *
 * Process:
 * 1. Verify webhook signature using HMAC-SHA256
 * 2. Parse email data (from, subject, text, html, attachments)
 * 3. Look up organization by recipient email domain
 * 4. Create intakeRequest with source='EMAIL'
 * 5. Queue for AI routing
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let rawBody: string;

  try {
    // 1. Read raw body for signature verification
    rawBody = await req.text();

    if (!rawBody) {
      console.error('[Email Webhook] Empty request body');
      return NextResponse.json(
        { error: 'Bad Request', details: 'Empty request body' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    const signature = req.headers.get('X-Webhook-Signature') || req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('X-Webhook-Timestamp') || req.headers.get('x-webhook-timestamp') || '';

    // Skip signature verification in development if secret not configured
    const isDevelopment = process.env.NODE_ENV === 'development';
    const shouldVerifySignature = EMAIL_WEBHOOK_SECRET && !isDevelopment;

    if (shouldVerifySignature && !verifyWebhookSignature(signature, timestamp, rawBody)) {
      console.error('[Email Webhook] Invalid webhook signature');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // 3. Parse email payload
    let emailPayload: EmailWebhookPayload;
    try {
      emailPayload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[Email Webhook] Failed to parse JSON:', parseError);
      return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Validate required fields
    if (!emailPayload.from) {
      console.error('[Email Webhook] Missing from address');
      return NextResponse.json(
        { error: 'Bad Request', details: 'Missing required field: from' },
        { status: 400 }
      );
    }

    if (!emailPayload.to) {
      console.error('[Email Webhook] Missing to address');
      return NextResponse.json(
        { error: 'Bad Request', details: 'Missing required field: to' },
        { status: 400 }
      );
    }

    // 5. Extract and process email data
    const fromEmail = extractEmailAddress(emailPayload.from);
    const toEmail = extractEmailAddress(emailPayload.to);
    const subject = emailPayload.subject || '(No Subject)';
    const bodyText = parseEmailBody(emailPayload.text, emailPayload.html);
    const bodyPreview = truncateText(bodyText, MAX_DESCRIPTION_LENGTH);
    const hasAttachments = Array.isArray(emailPayload.attachments) && emailPayload.attachments.length > 0;
    const attachmentCount = hasAttachments ? emailPayload.attachments!.length : 0;

    // 6. Look up organization by recipient domain
    const orgId = await lookupOrgByDomain(toEmail);

    if (!orgId) {
      console.error('[Email Webhook] No organization ID available (DEFAULT_ORG_ID not set)');
      return NextResponse.json(
        { error: 'Configuration Error', details: 'No default organization configured' },
        { status: 500 }
      );
    }

    // 7. Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      console.error(`[Email Webhook] Organization not found: ${orgId}`);
      return NextResponse.json(
        { error: 'Configuration Error', details: 'Organization not found' },
        { status: 500 }
      );
    }

    // 8. Build request data for intake
    const requestData = {
      fromEmail,
      toEmail,
      subject,
      bodyPreview: bodyPreview.substring(0, 500), // Short preview for quick view
      bodyFull: bodyPreview, // Full truncated body
      hasAttachments,
      attachmentCount,
      attachments: hasAttachments
        ? emailPayload.attachments!.map((att) => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
          }))
        : [],
      receivedAt: new Date().toISOString(),
      messageId: emailPayload.messageId || null,
      headers: emailPayload.headers || {},
      spamScore: emailPayload.spamScore,
      spf: emailPayload.spf,
      dkim: emailPayload.dkim,
    };

    // 9. Create intake request
    const intakeRequest = await prisma.intakeRequest.create({
      data: {
        source: IntakeSource.EMAIL,
        status: IntakeStatus.NEW,
        title: subject,
        description: bodyPreview,
        requestData,
        priority: 2, // Default medium priority for emails
        orgId: org.id,
        aiRoutingMeta: {
          source: 'email_webhook',
          fromDomain: extractDomain(fromEmail),
          toDomain: extractDomain(toEmail),
          hasAttachments,
          attachmentCount,
          receivedAt: new Date().toISOString(),
          processingStartedAt: new Date(startTime).toISOString(),
        },
      },
    });

    console.log(`[Email Webhook] Created intake request: ${intakeRequest.id}`);

    // 10. Queue for AI routing
    try {
      await queueIntakeRouting({
        intakeRequestId: intakeRequest.id,
        orgId: org.id,
        source: 'EMAIL',
        title: subject,
        description: bodyPreview,
        requestData,
        priority: 2,
      });
      console.log(`[Email Webhook] Queued for AI routing: ${intakeRequest.id}`);
    } catch (queueError) {
      // Log but don't fail the request - the intake is created, just not queued
      console.error('[Email Webhook] Failed to queue for routing:', queueError);
      // Update intake with queue error
      await prisma.intakeRequest.update({
        where: { id: intakeRequest.id },
        data: {
          aiRoutingMeta: {
            ...intakeRequest.aiRoutingMeta as object,
            queueError: queueError instanceof Error ? queueError.message : 'Unknown queue error',
          },
        },
      });
    }

    // 10b. Process through orchestration agent (async, non-blocking)
    // This supplements the existing queue-based routing with LLM-powered decisions
    processEmailThroughAgent(emailPayload, org.id).catch((error) => {
      console.error('[Email Webhook] Agent processing failed:', error);
    });

    // 11. Return success response
    const processingTime = Date.now() - startTime;
    console.log(`[Email Webhook] Processed in ${processingTime}ms`);

    return NextResponse.json(
      {
        success: true,
        intakeRequestId: intakeRequest.id,
        status: 'queued',
        message: 'Email received and queued for processing',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Email Webhook] Error processing webhook:', error);

    // Return appropriate error response
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/email
 *
 * Health check endpoint for email webhook.
 * Used by email providers to verify webhook URL is valid.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'email-webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
    config: {
      signatureVerification: !!EMAIL_WEBHOOK_SECRET,
      defaultOrgConfigured: !!DEFAULT_ORG_ID,
      agentProcessingEnabled: ENABLE_AGENT_PROCESSING,
    },
    supportedProviders: ['sendgrid', 'mailgun', 'postmark', 'generic'],
  });
}
