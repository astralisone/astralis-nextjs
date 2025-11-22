import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AgentTaskSource, AgentTaskStatus, AgentTaskType, Prisma } from "@prisma/client";
import {
  queueProcessInbox,
  queueProcessInboxUrgent,
  ProcessInboxJobData,
} from "@/workers/queues/schedulingAgent.queue";
import {
  validateTwilioSignature,
  parsePhoneNumber,
  detectQuickReply,
  extractSMSContent,
  generateTwiMLResponse,
  generateEmptyTwiMLResponse,
  validateTwilioWebhookParams,
  type QuickReply,
} from "@/lib/utils/smsParser";
import { agentLogger } from "@/lib/services/agentLogger.service";

// ============================================================================
// Environment Variables
// ============================================================================

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const SKIP_SIGNATURE_VALIDATION = process.env.SKIP_TWILIO_SIGNATURE_VALIDATION === "true";

// ============================================================================
// Rate Limiting for SMS (per phone number)
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 messages per minute per phone number

const smsRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkSMSRateLimit(phoneNumber: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const key = `sms:${phoneNumber}`;
  const record = smsRateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    smsRateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, reset: now + RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, reset: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, reset: record.resetTime };
}

// ============================================================================
// Priority Detection for SMS
// ============================================================================

/**
 * Detect priority from SMS content.
 * SMS messages are typically concise, so we look for specific keywords.
 */
function detectSMSPriority(content: string): number {
  const lowerContent = content.toLowerCase();

  // High priority keywords (5)
  const urgentKeywords = ["urgent", "asap", "emergency", "immediately", "911", "help now"];
  if (urgentKeywords.some((kw) => lowerContent.includes(kw))) {
    return 5;
  }

  // Medium-high priority (4)
  const importantKeywords = ["important", "today", "now", "soon"];
  if (importantKeywords.some((kw) => lowerContent.includes(kw))) {
    return 4;
  }

  // Default SMS priority (slightly higher than email since SMS is more immediate)
  return 3;
}

// ============================================================================
// Quick Reply Processing
// ============================================================================

/**
 * Find the most recent pending task for a user to apply quick reply to.
 */
async function findPendingTaskForQuickReply(userId: string): Promise<{
  id: string;
  status: AgentTaskStatus;
  taskType: AgentTaskType;
} | null> {
  const task = await prisma.schedulingAgentTask.findFirst({
    where: {
      userId,
      status: {
        in: [AgentTaskStatus.AWAITING_INPUT, AgentTaskStatus.PENDING],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      taskType: true,
    },
  });

  return task;
}

/**
 * Generate an acknowledgment message based on quick reply type.
 */
function getQuickReplyAcknowledgment(quickReply: QuickReply): string {
  switch (quickReply.type) {
    case "confirm":
      return "Got it! Confirming your request now.";
    case "cancel":
      return "Understood. Cancelling as requested.";
    case "select":
      return `Got it! Processing option ${quickReply.value}.`;
    case "reschedule":
      return "Understood. Let me help you reschedule. What time works better for you?";
    case "help":
      return "Available commands: YES to confirm, NO to cancel, RESCHEDULE to change time, or send 1-9 to select from options.";
    default:
      return "Got it! Processing your request...";
  }
}

/**
 * Map quick reply to appropriate task type for processing.
 */
function mapQuickReplyToTaskType(quickReply: QuickReply): AgentTaskType {
  switch (quickReply.type) {
    case "confirm":
      return AgentTaskType.SCHEDULE_MEETING;
    case "cancel":
      return AgentTaskType.CANCEL_MEETING;
    case "reschedule":
      return AgentTaskType.RESCHEDULE_MEETING;
    case "select":
      return AgentTaskType.SCHEDULE_MEETING;
    default:
      return AgentTaskType.UNKNOWN;
  }
}

// ============================================================================
// POST /api/agent/sms - Twilio SMS Webhook Handler
// ============================================================================

/**
 * POST /api/agent/sms
 *
 * Handles incoming SMS messages from Twilio webhook.
 * Validates signature, processes message, creates agent task, and returns TwiML.
 *
 * Expected Twilio webhook format (form-urlencoded):
 * - MessageSid: Unique message identifier
 * - AccountSid: Twilio account SID
 * - From: Sender phone number (+1234567890)
 * - To: Recipient phone number (your Twilio number)
 * - Body: Message content
 * - NumMedia: Number of media attachments
 * - MediaUrl0, MediaContentType0, etc.: Media attachment details
 *
 * Returns:
 * - 200: TwiML response with acknowledgment
 * - 400: Invalid request (bad TwiML response)
 * - 403: Invalid Twilio signature
 * - 429: Rate limit exceeded
 * - 500: Server error (bad TwiML response)
 */
export async function POST(req: NextRequest) {
  const logCtx = agentLogger.createContext("/api/agent/sms", "POST");

  try {
    agentLogger.requestReceived(logCtx, {
      source: "TWILIO_SMS",
      contentType: req.headers.get("content-type") || undefined,
    });

    // ========================================================================
    // 1. Validate Twilio Signature
    // ========================================================================

    if (!SKIP_SIGNATURE_VALIDATION) {
      if (!TWILIO_AUTH_TOKEN) {
        agentLogger.error(logCtx, "TWILIO_AUTH_TOKEN not configured");
        return new NextResponse(
          generateTwiMLResponse("System configuration error. Please try again later."),
          {
            status: 200,
            headers: { "Content-Type": "text/xml" },
          }
        );
      }

      const twilioSignature = req.headers.get("X-Twilio-Signature") || "";
      const requestUrl = req.url;

      // Parse form data
      const formData = await req.formData();
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      const signatureValid = validateTwilioSignature(twilioSignature, requestUrl, params, TWILIO_AUTH_TOKEN);
      agentLogger.signatureValidation(logCtx, signatureValid, "twilio");
      if (!signatureValid) {
        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Forbidden</Message></Response>`,
          {
            status: 403,
            headers: { "Content-Type": "text/xml" },
          }
        );
      }
    }

    // ========================================================================
    // 2. Parse Request Body
    // ========================================================================

    let params: Record<string, string>;

    // Handle both form-encoded (Twilio default) and JSON (for testing)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      params = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    } else if (contentType.includes("application/json")) {
      params = await req.json();
    } else {
      // Try to parse as form data by default (Twilio's format)
      try {
        const formData = await req.formData();
        params = {};
        formData.forEach((value, key) => {
          params[key] = value.toString();
        });
      } catch {
        console.error("[SMS Webhook] Could not parse request body");
        return new NextResponse(
          generateTwiMLResponse("Invalid request format."),
          {
            status: 200,
            headers: { "Content-Type": "text/xml" },
          }
        );
      }
    }

    // Validate required parameters
    if (!validateTwilioWebhookParams(params)) {
      console.error("[SMS Webhook] Missing required Twilio parameters", { params });
      return new NextResponse(
        generateTwiMLResponse("Invalid message format."),
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    const { MessageSid, AccountSid, From, To, Body } = params;

    // Verify account SID matches if configured
    if (TWILIO_ACCOUNT_SID && AccountSid !== TWILIO_ACCOUNT_SID) {
      console.error("[SMS Webhook] Account SID mismatch");
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Forbidden</Message></Response>`,
        {
          status: 403,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    console.log(`[SMS Webhook] Received message: ${MessageSid} from ${From}`);

    // Log SMS received with masked phone
    agentLogger.smsReceived(logCtx, {
      fromMasked: agentLogger.maskPhone(From),
      hasMedia: false,
      isQuickReply: false, // Will update after parsing
    });

    // ========================================================================
    // 3. Rate Limiting
    // ========================================================================

    const rateLimit = checkSMSRateLimit(From);
    if (!rateLimit.allowed) {
      agentLogger.rateLimitExceeded(logCtx, agentLogger.maskPhone(From));
      return new NextResponse(
        generateTwiMLResponse("Too many messages. Please wait a moment before trying again."),
        {
          status: 200,
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // ========================================================================
    // 4. Parse Phone Number and Extract Content
    // ========================================================================

    const parsedPhone = parsePhoneNumber(From);
    const smsContent = extractSMSContent(params);

    // Log quick reply detection
    if (smsContent.quickReply) {
      agentLogger.quickReplyDetected(logCtx, smsContent.quickReply.type);
    }

    // ========================================================================
    // 5. Lookup User by Phone Number
    // ========================================================================

    // Note: The users model doesn't have a direct phone field in the schema.
    // We check if there's a phone in audit_bookings or consultations linked to this number.
    // For now, we'll create a task without a user association if not found.

    let userId: string | null = null;
    let orgId: string | null = null;

    // Try to find user by searching related tables with phone numbers
    // First check audit_bookings for clientPhone match
    const auditBooking = await prisma.audit_bookings.findFirst({
      where: { clientPhone: parsedPhone.e164 },
      orderBy: { createdAt: "desc" },
      select: { userId: true },
    });

    if (auditBooking?.userId) {
      const user = await prisma.users.findUnique({
        where: { id: auditBooking.userId },
        select: { id: true, orgId: true },
      });
      if (user) {
        userId = user.id;
        orgId = user.orgId;
        agentLogger.userLookupResult(logCtx, true, "phone");
        agentLogger.setUser(logCtx, userId, orgId || undefined);
      }
    }

    // If not found, check consultations
    if (!userId) {
      const consultation = await prisma.consultations.findFirst({
        where: { clientPhone: parsedPhone.e164 },
        orderBy: { createdAt: "desc" },
        select: { userId: true },
      });

      if (consultation?.userId) {
        const user = await prisma.users.findUnique({
          where: { id: consultation.userId },
          select: { id: true, orgId: true },
        });
        if (user) {
          userId = user.id;
          orgId = user.orgId;
        }
      }
    }

    // If still not found, check revenue_audits
    if (!userId) {
      const revenueAudit = await prisma.revenue_audits.findFirst({
        where: { clientPhone: parsedPhone.e164 },
        orderBy: { createdAt: "desc" },
        select: { userId: true },
      });

      if (revenueAudit?.userId) {
        const user = await prisma.users.findUnique({
          where: { id: revenueAudit.userId },
          select: { id: true, orgId: true },
        });
        if (user) {
          userId = user.id;
          orgId = user.orgId;
        }
      }
    }

    // If no user found, we need a system user to create the task
    // Look for a default system user or admin
    if (!userId) {
      agentLogger.userLookupResult(logCtx, false, "phone");
      const systemUser = await prisma.users.findFirst({
        where: {
          OR: [
            { role: "ADMIN" },
            { email: { contains: "system" } },
            { email: { contains: "admin" } },
          ],
        },
        select: { id: true, orgId: true },
      });

      if (systemUser) {
        userId = systemUser.id;
        orgId = systemUser.orgId;
        agentLogger.userLookupResult(logCtx, true, "system");
        agentLogger.setUser(logCtx, userId, orgId || undefined);
      } else {
        // Cannot create task without a user
        agentLogger.error(logCtx, "No user found and no system user available");
        return new NextResponse(
          generateTwiMLResponse("We couldn't identify your account. Please contact support or register at our website."),
          {
            status: 200,
            headers: { "Content-Type": "text/xml" },
          }
        );
      }
    }

    // ========================================================================
    // 6. Handle Quick Reply (Update Existing Task)
    // ========================================================================

    let acknowledgment: string;
    let taskType: AgentTaskType = AgentTaskType.UNKNOWN;

    if (smsContent.quickReply && smsContent.quickReply.type !== "other") {
      const quickReply = smsContent.quickReply;

      // Check if there's a pending task to update
      const pendingTask = await findPendingTaskForQuickReply(userId);

      if (pendingTask && quickReply.type !== "help") {
        // Update existing task with quick reply response
        taskType = mapQuickReplyToTaskType(quickReply);
        acknowledgment = getQuickReplyAcknowledgment(quickReply);

        agentLogger.quickReplyDetected(logCtx, quickReply.type, pendingTask.id);
      } else if (quickReply.type === "help") {
        // Just send help message, don't create a task
        return new NextResponse(
          generateTwiMLResponse(getQuickReplyAcknowledgment(quickReply)),
          {
            status: 200,
            headers: { "Content-Type": "text/xml" },
          }
        );
      } else {
        // No pending task, create a new one
        acknowledgment = "Got it! Processing your request...";
      }
    } else {
      // Regular message (not a quick reply)
      acknowledgment = "Got it! Processing your request...";
    }

    // ========================================================================
    // 7. Detect Priority
    // ========================================================================

    const priority = detectSMSPriority(Body);

    // ========================================================================
    // 8. Create SchedulingAgentTask
    // ========================================================================

    const entityData: Prisma.InputJsonValue = {
      phone: parsedPhone.e164,
      phoneCountryCode: parsedPhone.countryCode,
      phoneNumber: parsedPhone.number,
      twilioNumber: To,
      hasMedia: smsContent.hasMedia,
      mediaCount: smsContent.mediaCount,
      mediaUrls: smsContent.mediaUrls as Prisma.InputJsonValue,
      quickReply: smsContent.quickReply ? {
        type: smsContent.quickReply.type,
        value: smsContent.quickReply.value,
        confidence: smsContent.quickReply.confidence,
      } : null,
      fromCity: params.FromCity,
      fromState: params.FromState,
      fromCountry: params.FromCountry,
    };

    const aiMetadata: Prisma.InputJsonValue = {
      source: "twilio_sms",
      messageSid: MessageSid,
      accountSid: AccountSid,
      timestamp: new Date().toISOString(),
      isMultiPart: smsContent.isMultiPart,
      quickReplyDetected: smsContent.quickReply !== null,
    };

    const task = await prisma.schedulingAgentTask.create({
      data: {
        userId,
        orgId,
        source: AgentTaskSource.SMS,
        sourceId: MessageSid,
        rawContent: Body,
        taskType,
        priority,
        status: AgentTaskStatus.PENDING,
        entities: entityData,
        aiMetadata,
      },
    });

    agentLogger.taskCreated(logCtx, task.id, {
      source: "SMS",
      priority,
      taskType: taskType,
    });

    // ========================================================================
    // 9. Queue for AI Processing
    // ========================================================================

    let jobId: string | null = null;
    try {
      const jobData: ProcessInboxJobData = {
        taskId: task.id,
        userId,
        orgId: orgId || undefined,
        priority,
      };

      if (priority >= 4) {
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
      // Task is created, will need manual processing
    }

    // ========================================================================
    // 10. Log Completion
    // ========================================================================

    agentLogger.requestCompleted(logCtx, 200, `Task ${task.id} created from SMS`);

    // ========================================================================
    // 11. Return TwiML Response
    // ========================================================================

    return new NextResponse(generateTwiMLResponse(acknowledgment), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    agentLogger.error(logCtx, "Error processing SMS", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Always return valid TwiML even on error
    return new NextResponse(
      generateTwiMLResponse("Sorry, we encountered an error processing your message. Please try again later."),
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

// ============================================================================
// GET /api/agent/sms - Health Check
// ============================================================================

/**
 * GET /api/agent/sms
 *
 * Health check endpoint for monitoring.
 * Returns 200 OK if the SMS webhook is operational.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      status: "operational",
      endpoint: "SMS Webhook Handler",
      configured: {
        authToken: !!TWILIO_AUTH_TOKEN,
        accountSid: !!TWILIO_ACCOUNT_SID,
        signatureValidation: !SKIP_SIGNATURE_VALIDATION,
      },
    },
    { status: 200 }
  );
}
