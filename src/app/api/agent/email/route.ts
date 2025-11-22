import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AgentTaskSource, AgentTaskStatus, AgentTaskType, Prisma } from "@prisma/client";
import {
  queueProcessInbox,
  queueProcessInboxUrgent,
  ProcessInboxJobData,
} from "@/workers/queues/schedulingAgent.queue";
import {
  stripHtmlTags,
  stripEmailSignature,
  parseIcsAttachment,
  extractEmailIntent,
  extractEmailAddress,
  extractDomain,
  cleanEmailContent,
  ParsedEvent,
} from "@/lib/utils/emailParser";
import { agentLogger } from "@/lib/services/agentLogger.service";

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN = 30; // 30 requests per minute per sender domain

// In-memory rate limiter by domain (use Redis in production)
const domainRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkDomainRateLimit(domain: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const key = `rate:domain:${domain}`;
  const record = domainRateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    domainRateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN - 1,
      reset: Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000),
      limit: RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN,
    };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      limit: RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN - record.count,
    reset: Math.ceil(record.resetTime / 1000),
    limit: RATE_LIMIT_MAX_REQUESTS_PER_DOMAIN,
  };
}

function addRateLimitHeaders(
  response: NextResponse,
  rateLimit: { remaining: number; reset: number; limit: number }
): NextResponse {
  response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
  return response;
}

// ============================================================================
// Spam Detection
// ============================================================================

const SPAM_PATTERNS = [
  // Empty or very short content
  /^.{0,10}$/,
  // Common spam phrases
  /click here to unsubscribe/i,
  /you have won/i,
  /congratulations.*winner/i,
  /million dollars/i,
  /nigerian prince/i,
  /lottery/i,
  // Suspicious patterns
  /^[\s\n]*$/,
];

const SUSPICIOUS_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'fakeinbox.com',
];

function isSpam(content: string, senderDomain: string | null): boolean {
  // Check for empty content
  if (!content || content.trim().length < 5) {
    return true;
  }

  // Check suspicious domains
  if (senderDomain && SUSPICIOUS_DOMAINS.includes(senderDomain.toLowerCase())) {
    return true;
  }

  // Check spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Webhook Signature Verification
// ============================================================================

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | null
): boolean {
  // If no signature or secret provided, skip verification
  if (!signature || !secret) {
    return true;
  }

  try {
    // Support multiple signature formats
    // Format 1: sha256=<hex>
    // Format 2: t=<timestamp>,v1=<hex>
    // Format 3: <hex> (raw)

    let expectedSignature: string;

    if (signature.startsWith('sha256=')) {
      // SendGrid format
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      expectedSignature = 'sha256=' + hmac.digest('hex');
    } else if (signature.includes('v1=')) {
      // Stripe-like format
      const signatureMatch = signature.match(/v1=([a-f0-9]+)/);
      if (!signatureMatch) {
        return false;
      }
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      expectedSignature = hmac.digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signatureMatch[1]),
        Buffer.from(expectedSignature)
      );
    } else {
      // Raw hex format (Postmark, etc.)
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      expectedSignature = hmac.digest('hex');
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature.replace('sha256=', '')),
      Buffer.from(expectedSignature.replace('sha256=', ''))
    );
  } catch (error) {
    console.error('[Agent Email] Signature verification error:', error);
    return false;
  }
}

// ============================================================================
// Validation Schemas
// ============================================================================

const emailAttachmentSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  content: z.string().optional(), // Base64 encoded
  size: z.number(),
});

const incomingEmailSchema = z.object({
  from: z.string().email("Invalid sender email"),
  to: z.string(),
  subject: z.string(),
  textBody: z.string().optional(),
  htmlBody: z.string().optional(),
  date: z.string().optional(),
  messageId: z.string().optional(),
  inReplyTo: z.string().optional(),
  attachments: z.array(emailAttachmentSchema).optional(),
  headers: z.record(z.string()).optional(),
});

type IncomingEmail = z.infer<typeof incomingEmailSchema>;

// ============================================================================
// Priority Detection
// ============================================================================

function detectEmailPriority(
  subject: string,
  content: string,
  headers?: Record<string, string>
): number {
  let priority = 3; // Default

  // Check headers for priority indicators
  if (headers) {
    const importance = headers['importance'] || headers['X-Priority'] || headers['x-priority'];
    if (importance) {
      const importanceLower = importance.toLowerCase();
      if (importanceLower === 'high' || importanceLower === '1') {
        priority = 5;
      } else if (importanceLower === 'low' || importanceLower === '5') {
        priority = 1;
      }
    }
  }

  // Use subject intent extraction
  const intent = extractEmailIntent(subject);
  if (intent.priority > priority) {
    priority = intent.priority;
  }

  // Check content for urgency indicators
  const lowerContent = (content + ' ' + subject).toLowerCase();
  const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'critical'];
  const importantKeywords = ['important', 'priority', 'deadline', 'today'];

  if (urgentKeywords.some((kw) => lowerContent.includes(kw))) {
    priority = Math.max(priority, 5);
  } else if (importantKeywords.some((kw) => lowerContent.includes(kw))) {
    priority = Math.max(priority, 4);
  }

  return Math.min(Math.max(priority, 1), 5); // Clamp between 1-5
}

// ============================================================================
// Email Processing
// ============================================================================

interface ProcessedEmail {
  senderEmail: string;
  senderDomain: string | null;
  cleanedContent: string;
  subject: string;
  messageId: string | null;
  inReplyTo: string | null;
  priority: number;
  intent: string;
  parsedEvent: ParsedEvent | null;
  userId: string | null;
  orgId: string | null;
}

async function processIncomingEmail(email: IncomingEmail): Promise<ProcessedEmail> {
  // Extract sender email address
  const senderEmail = extractEmailAddress(email.from) || email.from;
  const senderDomain = extractDomain(email.from);

  // Clean and process email content
  const cleanedContent = cleanEmailContent(email.textBody, email.htmlBody);

  // Extract intent from subject
  const intent = extractEmailIntent(email.subject);

  // Detect priority
  const priority = detectEmailPriority(email.subject, cleanedContent, email.headers);

  // Process ICS attachments if present
  let parsedEvent: ParsedEvent | null = null;
  if (email.attachments && email.attachments.length > 0) {
    for (const attachment of email.attachments) {
      if (
        attachment.contentType.includes('calendar') ||
        attachment.filename.endsWith('.ics')
      ) {
        if (attachment.content) {
          parsedEvent = parseIcsAttachment(attachment.content);
          if (parsedEvent) {
            break; // Use first valid ICS
          }
        }
      }
    }
  }

  // Try to find user by email
  let userId: string | null = null;
  let orgId: string | null = null;

  try {
    const user = await prisma.users.findUnique({
      where: { email: senderEmail.toLowerCase() },
      select: { id: true, orgId: true },
    });

    if (user) {
      userId = user.id;
      orgId = user.orgId;
    }
  } catch (error) {
    console.error('[Agent Email] Error looking up user:', error);
  }

  return {
    senderEmail,
    senderDomain,
    cleanedContent,
    subject: email.subject,
    messageId: email.messageId || null,
    inReplyTo: email.inReplyTo || null,
    priority,
    intent: intent.intent,
    parsedEvent,
    userId,
    orgId,
  };
}

// ============================================================================
// Thread Handling
// ============================================================================

async function findExistingThreadTask(
  inReplyTo: string | null,
  senderEmail: string
): Promise<{ id: string; userId: string; orgId: string | null } | null> {
  if (!inReplyTo) {
    return null;
  }

  try {
    // Find task with matching sourceId (messageId of original email)
    const existingTask = await prisma.schedulingAgentTask.findFirst({
      where: {
        source: AgentTaskSource.EMAIL,
        sourceId: inReplyTo,
      },
      select: {
        id: true,
        userId: true,
        orgId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return existingTask;
  } catch (error) {
    console.error('[Agent Email] Error finding thread task:', error);
    return null;
  }
}

// ============================================================================
// POST /api/agent/email - Email Webhook Handler
// ============================================================================

/**
 * POST /api/agent/email
 *
 * Webhook endpoint for incoming emails from email service providers
 * (SendGrid, Postmark, Mailgun, etc.)
 *
 * Accepts structured email data:
 * - from: Sender email address
 * - to: Recipient email address
 * - subject: Email subject line
 * - textBody: Plain text body (optional)
 * - htmlBody: HTML body (optional, will be converted to text)
 * - date: ISO date string (optional)
 * - messageId: Email message ID for threading
 * - inReplyTo: Parent message ID for threading
 * - attachments: Array of attachments (optional)
 * - headers: Email headers (optional)
 *
 * Returns:
 * - 201: Task created successfully
 * - 200: Thread reply processed
 * - 400: Validation error
 * - 403: Invalid webhook signature
 * - 422: Spam detected
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  const logCtx = agentLogger.createContext("/api/agent/email", "POST");

  try {
    agentLogger.requestReceived(logCtx, {
      source: "EMAIL_WEBHOOK",
      contentType: req.headers.get("content-type") || undefined,
    });

    // Get raw body for signature verification
    const rawBody = await req.text();
    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      agentLogger.validationError(logCtx, "Invalid JSON in request body");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          details: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // Verify webhook signature if provided
    const signature = req.headers.get('X-Webhook-Signature') ||
      req.headers.get('X-Postmark-Signature') ||
      req.headers.get('X-SendGrid-Signature');

    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET;

    if (signature && webhookSecret) {
      const signatureValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      agentLogger.signatureValidation(logCtx, signatureValid, "webhook");
      if (!signatureValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            details: "Invalid webhook signature",
          },
          { status: 403 }
        );
      }
    }

    // Validate request body
    const parsed = incomingEmailSchema.safeParse(body);

    if (!parsed.success) {
      agentLogger.validationError(logCtx, parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const email = parsed.data;

    // Process the email
    const processed = await processIncomingEmail(email);

    // Log email received with domain and subject preview
    agentLogger.emailReceived(logCtx, {
      fromDomain: processed.senderDomain,
      subjectPreview: agentLogger.truncate(email.subject, 50),
      hasAttachments: (email.attachments?.length || 0) > 0,
    });

    if (processed.userId) {
      agentLogger.setUser(logCtx, processed.userId, processed.orgId || undefined);
    }

    // Rate limit by sender domain
    if (processed.senderDomain) {
      const rateLimit = checkDomainRateLimit(processed.senderDomain);
      if (!rateLimit.allowed) {
        agentLogger.rateLimitExceeded(logCtx, processed.senderDomain);
        const response = NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded",
            details: `Too many requests from domain ${processed.senderDomain}. Try again after ${new Date(rateLimit.reset * 1000).toISOString()}`,
          },
          { status: 429 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }
    }

    // Check for spam
    if (isSpam(processed.cleanedContent, processed.senderDomain)) {
      agentLogger.spamDetected(logCtx, `from ${processed.senderEmail}`);
      return NextResponse.json(
        {
          success: false,
          error: "Message rejected",
          details: "Message appears to be spam or contains invalid content",
        },
        { status: 422 }
      );
    }

    // Check for thread reply
    let isThreadReply = false;
    let existingTask: { id: string; userId: string; orgId: string | null } | null = null;

    if (processed.inReplyTo) {
      existingTask = await findExistingThreadTask(
        processed.inReplyTo,
        processed.senderEmail
      );
      isThreadReply = existingTask !== null;
      if (isThreadReply && existingTask) {
        agentLogger.threadDetected(logCtx, existingTask.id);
      }
    }

    // Build raw content for task
    const rawContent = [
      `Subject: ${processed.subject}`,
      `From: ${processed.senderEmail}`,
      processed.parsedEvent ? `Calendar Event: ${processed.parsedEvent.summary || 'Meeting'}` : '',
      '',
      processed.cleanedContent,
    ]
      .filter(Boolean)
      .join('\n');

    // Determine task type based on parsed ICS if present
    let taskType: AgentTaskType = AgentTaskType.UNKNOWN;
    if (processed.parsedEvent) {
      const method = processed.parsedEvent.method?.toUpperCase();
      if (method === 'REQUEST') {
        taskType = AgentTaskType.SCHEDULE_MEETING as AgentTaskType;
      } else if (method === 'CANCEL') {
        taskType = AgentTaskType.CANCEL_MEETING as AgentTaskType;
      } else if (method === 'COUNTER' || method === 'DECLINECOUNTER') {
        taskType = AgentTaskType.RESCHEDULE_MEETING as AgentTaskType;
      }
    }

    if (isThreadReply && existingTask) {
      // Update existing task with new content
      // Build aiMetadata with serializable types
      const threadReplyMetadata: Record<string, unknown> = {
        threadReply: true,
        originalMessageId: processed.inReplyTo,
        newMessageId: processed.messageId,
        senderEmail: processed.senderEmail,
        updatedAt: new Date().toISOString(),
      };
      if (processed.parsedEvent) {
        threadReplyMetadata.parsedEvent = {
          uid: processed.parsedEvent.uid,
          summary: processed.parsedEvent.summary,
          description: processed.parsedEvent.description,
          dtstart: processed.parsedEvent.dtstart?.toISOString(),
          dtend: processed.parsedEvent.dtend?.toISOString(),
          location: processed.parsedEvent.location,
          organizer: processed.parsedEvent.organizer,
          attendees: processed.parsedEvent.attendees,
          status: processed.parsedEvent.status,
          sequence: processed.parsedEvent.sequence,
          method: processed.parsedEvent.method,
        };
      }

      await prisma.schedulingAgentTask.update({
        where: { id: existingTask.id },
        data: {
          rawContent: rawContent,
          updatedAt: new Date(),
          aiMetadata: JSON.parse(JSON.stringify(threadReplyMetadata)),
        },
      });

      // Re-queue for processing
      try {
        const jobData: ProcessInboxJobData = {
          taskId: existingTask.id,
          userId: existingTask.userId,
          orgId: existingTask.orgId || undefined,
          priority: processed.priority,
        };

        if (processed.priority >= 4) {
          const jobId = await queueProcessInboxUrgent(jobData);
          agentLogger.queueJobAdded(logCtx, jobId || "unknown", "urgent");
        } else {
          const jobId = await queueProcessInbox(jobData);
          agentLogger.queueJobAdded(logCtx, jobId || "unknown", "standard");
        }
      } catch (queueError) {
        agentLogger.queueJobFailed(
          logCtx,
          existingTask.id,
          queueError instanceof Error ? queueError.message : "Unknown error"
        );
      }

      agentLogger.taskUpdated(logCtx, existingTask.id, { threadReply: true });
      agentLogger.requestCompleted(logCtx, 200, `Thread reply to ${existingTask.id}`);

      return NextResponse.json(
        {
          success: true,
          taskId: existingTask.id,
          isThreadReply: true,
          message: "Thread reply processed successfully",
        },
        { status: 200 }
      );
    }

    // Determine user ID for new task
    let taskUserId = processed.userId;

    // If no user found and we need one, create a system task
    // For now, we'll require a user to exist or use a default system user
    if (!taskUserId) {
      // Try to find a system/admin user for orphan emails
      const systemUser = await prisma.users.findFirst({
        where: {
          role: 'ADMIN',
          isActive: true,
        },
        select: { id: true, orgId: true },
      });

      if (systemUser) {
        taskUserId = systemUser.id;
        if (!processed.orgId && systemUser.orgId) {
          processed.orgId = systemUser.orgId;
        }
      } else {
        // Cannot process email without a user
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
            details: `No user found for email ${processed.senderEmail} and no system user available`,
          },
          { status: 422 }
        );
      }
    }

    // Build entities and aiMetadata with serializable types
    const entitiesData: Record<string, unknown> | null = processed.parsedEvent
      ? {
          calendarEvent: {
            summary: processed.parsedEvent.summary,
            dtstart: processed.parsedEvent.dtstart?.toISOString(),
            dtend: processed.parsedEvent.dtend?.toISOString(),
            location: processed.parsedEvent.location,
            organizer: processed.parsedEvent.organizer,
            attendees: processed.parsedEvent.attendees,
          },
        }
      : null;

    const aiMetadataData: Record<string, unknown> = {
      sourceMetadata: {
        from: processed.senderEmail,
        to: email.to,
        subject: email.subject,
        date: email.date || null,
        messageId: processed.messageId,
        inReplyTo: processed.inReplyTo,
        hasAttachments: (email.attachments?.length || 0) > 0,
        attachmentCount: email.attachments?.length || 0,
      },
      processingInfo: {
        createdAt: new Date().toISOString(),
        detectedIntent: processed.intent,
        detectedPriority: processed.priority,
        senderDomain: processed.senderDomain,
        userMatched: processed.userId !== null,
      },
    };

    if (processed.parsedEvent) {
      aiMetadataData.parsedIcsEvent = {
        uid: processed.parsedEvent.uid,
        summary: processed.parsedEvent.summary,
        description: processed.parsedEvent.description,
        dtstart: processed.parsedEvent.dtstart?.toISOString(),
        dtend: processed.parsedEvent.dtend?.toISOString(),
        location: processed.parsedEvent.location,
        organizer: processed.parsedEvent.organizer,
        attendees: processed.parsedEvent.attendees,
        status: processed.parsedEvent.status,
        sequence: processed.parsedEvent.sequence,
        method: processed.parsedEvent.method,
      };
    }

    // Create new agent task
    const task = await prisma.schedulingAgentTask.create({
      data: {
        userId: taskUserId,
        orgId: processed.orgId,
        source: AgentTaskSource.EMAIL,
        sourceId: processed.messageId,
        rawContent,
        taskType,
        priority: processed.priority,
        status: AgentTaskStatus.PENDING,
        intent: processed.intent,
        entities: entitiesData ? JSON.parse(JSON.stringify(entitiesData)) : Prisma.DbNull,
        aiMetadata: JSON.parse(JSON.stringify(aiMetadataData)),
      },
    });

    // Log task creation
    agentLogger.taskCreated(logCtx, task.id, {
      source: "EMAIL",
      priority: processed.priority,
      taskType: taskType,
    });

    // Queue for AI processing
    let jobId: string | null = null;
    try {
      const jobData: ProcessInboxJobData = {
        taskId: task.id,
        userId: taskUserId,
        orgId: processed.orgId || undefined,
        priority: processed.priority,
      };

      if (processed.priority >= 4) {
        jobId = await queueProcessInboxUrgent(jobData);
        agentLogger.queueJobAdded(logCtx, jobId || "unknown", "urgent");
      } else {
        jobId = await queueProcessInbox(jobData);
        agentLogger.queueJobAdded(logCtx, jobId || "unknown", "standard");
      }
    } catch (queueError) {
      agentLogger.queueJobFailed(
        logCtx,
        task.id,
        queueError instanceof Error ? queueError.message : "Unknown error"
      );
    }

    agentLogger.requestCompleted(logCtx, 201, `Task ${task.id} created from email`);

    const response = NextResponse.json(
      {
        success: true,
        taskId: task.id,
        isThreadReply: false,
        message: "Email processed successfully",
        ...(jobId && { jobId }),
      },
      { status: 201 }
    );

    // Add rate limit headers if we have domain info
    if (processed.senderDomain) {
      const rateLimit = checkDomainRateLimit(processed.senderDomain);
      return addRateLimitHeaders(response, rateLimit);
    }

    return response;
  } catch (error) {
    agentLogger.error(logCtx, "Error processing email", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
