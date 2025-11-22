import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { AgentTaskSource, AgentTaskStatus, AgentTaskType, Prisma } from "@prisma/client";
import {
  queueProcessInbox,
  queueProcessInboxUrgent,
  ProcessInboxJobData,
} from "@/workers/queues/schedulingAgent.queue";
import { agentLogger } from "@/lib/services/agentLogger.service";

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute (stricter for forms)

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const key = `form-rate:${identifier}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      reset: Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000),
      limit: RATE_LIMIT_MAX_REQUESTS,
    };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      limit: RATE_LIMIT_MAX_REQUESTS,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    reset: Math.ceil(record.resetTime / 1000),
    limit: RATE_LIMIT_MAX_REQUESTS,
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
// Bot Detection
// ============================================================================

// Track submission timestamps for timing-based bot detection
const submissionTimestamps = new Map<string, number>();
const MIN_SUBMISSION_TIME_MS = 2000; // Minimum 2 seconds to submit a form

function checkSubmissionTiming(identifier: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const key = `form-time:${identifier}`;
  const lastSubmission = submissionTimestamps.get(key);

  // Update timestamp for next check
  submissionTimestamps.set(key, now);

  // If this is their first submission, allow it
  if (!lastSubmission) {
    return { allowed: true };
  }

  // Check if submission was too fast (likely bot)
  const timeSinceLastSubmission = now - lastSubmission;
  if (timeSinceLastSubmission < MIN_SUBMISSION_TIME_MS) {
    return {
      allowed: false,
      reason: `Submission too fast (${timeSinceLastSubmission}ms). Please wait before resubmitting.`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// Validation Schemas
// ============================================================================

const formTypeSchema = z.enum(["booking", "task", "inquiry", "contact", "feedback"]);

const formSubmissionSchema = z.object({
  formType: formTypeSchema,
  userId: z.string().optional(),
  orgId: z.string().optional(),

  // Common fields
  name: z.string().max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
  message: z.string().max(5000).optional(),

  // Booking-specific
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  duration: z.number().int().min(15).max(480).optional(), // 15 mins to 8 hours
  meetingType: z.string().max(100).optional(),
  participants: z.array(z.string().max(255)).max(50).optional(),

  // Task-specific
  taskTitle: z.string().max(200).optional(),
  taskDescription: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  assignTo: z.string().max(255).optional(),

  // Metadata
  source: z.string().max(100).optional(), // Which form/page
  utmParams: z.record(z.string().max(500)).optional(),
  recaptchaToken: z.string().max(2000).optional(),

  // Honeypot field (should always be empty)
  honeypot: z.string().max(0).optional(),
  website: z.string().max(0).optional(), // Alternative honeypot field name
});

// ============================================================================
// Form Type to Task Type Mapping
// ============================================================================

const FORM_TYPE_TO_TASK_TYPE: Record<z.infer<typeof formTypeSchema>, AgentTaskType> = {
  booking: AgentTaskType.SCHEDULE_MEETING,
  task: AgentTaskType.CREATE_TASK,
  inquiry: AgentTaskType.INQUIRY,
  contact: AgentTaskType.INQUIRY,
  feedback: AgentTaskType.INQUIRY,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique form submission ID
 */
function generateFormSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `FORM-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate date string format (ISO 8601 or common formats)
 */
function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return false;

  // Try ISO 8601 format
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return true;

  // Try common date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY or DD/MM/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,     // M/D/YYYY
  ];

  return datePatterns.some((pattern) => pattern.test(dateStr));
}

/**
 * Validate time string format (HH:MM, H:MM AM/PM, etc.)
 */
function isValidTimeString(timeStr: string): boolean {
  if (!timeStr) return false;

  const timePatterns = [
    /^([01]?\d|2[0-3]):([0-5]\d)$/,           // 24-hour: HH:MM
    /^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/, // 24-hour with seconds
    /^\d{1,2}:\d{2}\s*(am|pm|AM|PM)$/,        // 12-hour with AM/PM
    /^\d{1,2}\s*(am|pm|AM|PM)$/,              // Hour only with AM/PM
  ];

  return timePatterns.some((pattern) => pattern.test(timeStr.trim()));
}

/**
 * Build raw content from form fields for storage and processing
 */
function buildRawContent(data: z.infer<typeof formSubmissionSchema>): string {
  const parts: string[] = [];

  switch (data.formType) {
    case "booking":
      parts.push(`Form Type: Booking Request`);
      if (data.name) parts.push(`Name: ${data.name}`);
      if (data.email) parts.push(`Email: ${data.email}`);
      if (data.phone) parts.push(`Phone: ${data.phone}`);
      if (data.preferredDate) parts.push(`Preferred Date: ${data.preferredDate}`);
      if (data.preferredTime) parts.push(`Preferred Time: ${data.preferredTime}`);
      if (data.duration) parts.push(`Duration: ${data.duration} minutes`);
      if (data.meetingType) parts.push(`Meeting Type: ${data.meetingType}`);
      if (data.participants?.length) parts.push(`Participants: ${data.participants.join(", ")}`);
      if (data.message) parts.push(`Additional Notes: ${data.message}`);
      break;

    case "task":
      parts.push(`Form Type: Task Creation`);
      if (data.taskTitle) parts.push(`Task Title: ${data.taskTitle}`);
      if (data.taskDescription) parts.push(`Task Description: ${data.taskDescription}`);
      if (data.dueDate) parts.push(`Due Date: ${data.dueDate}`);
      if (data.priority) parts.push(`Priority: ${data.priority}`);
      if (data.assignTo) parts.push(`Assign To: ${data.assignTo}`);
      if (data.name) parts.push(`Submitted By: ${data.name}`);
      if (data.email) parts.push(`Contact Email: ${data.email}`);
      break;

    case "inquiry":
    case "contact":
    case "feedback":
      parts.push(`Form Type: ${data.formType.charAt(0).toUpperCase() + data.formType.slice(1)}`);
      if (data.name) parts.push(`Name: ${data.name}`);
      if (data.email) parts.push(`Email: ${data.email}`);
      if (data.phone) parts.push(`Phone: ${data.phone}`);
      if (data.message) parts.push(`Message: ${data.message}`);
      break;
  }

  if (data.source) parts.push(`Source: ${data.source}`);

  return parts.join("\n");
}

/**
 * Extract pre-classified entities from structured form data
 */
function extractEntitiesFromForm(data: z.infer<typeof formSubmissionSchema>): Record<string, unknown> {
  const entities: Record<string, unknown> = {};

  // Contact information
  if (data.name) entities.contactName = data.name;
  if (data.email) entities.contactEmail = data.email;
  if (data.phone) entities.contactPhone = data.phone;

  // Date and time (for booking)
  if (data.preferredDate) {
    entities.dates = [
      {
        raw: data.preferredDate,
        parsed: isValidDateString(data.preferredDate) ? new Date(data.preferredDate).toISOString() : null,
      },
    ];
  }

  if (data.preferredTime) {
    entities.times = [
      {
        raw: data.preferredTime,
        parsed: data.preferredTime, // Keep the original format
      },
    ];
  }

  // Duration
  if (data.duration) {
    entities.duration = [
      {
        raw: `${data.duration} minutes`,
        minutes: data.duration,
      },
    ];
  }

  // Participants
  if (data.participants?.length) {
    entities.participants = data.participants;
  }

  // Meeting type as subject
  if (data.meetingType) {
    entities.subject = data.meetingType;
  }

  // Task-specific entities
  if (data.taskTitle) {
    entities.taskTitle = data.taskTitle;
  }
  if (data.taskDescription) {
    entities.taskDescription = data.taskDescription;
  }
  if (data.dueDate) {
    entities.dueDate = data.dueDate;
  }
  if (data.assignTo) {
    entities.assignTo = data.assignTo;
  }

  // Message/inquiry content
  if (data.message) {
    entities.message = data.message;
  }

  return entities;
}

/**
 * Determine priority based on form type and content
 */
function determinePriority(data: z.infer<typeof formSubmissionSchema>): number {
  // If explicit priority is provided (for tasks), use it
  if (data.priority && data.priority >= 1 && data.priority <= 5) {
    return data.priority;
  }

  // Default priorities by form type
  switch (data.formType) {
    case "booking":
      // Check if date is soon (within 48 hours)
      if (data.preferredDate) {
        const preferredDate = new Date(data.preferredDate);
        const now = new Date();
        const hoursDiff = (preferredDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursDiff <= 48 && hoursDiff > 0) {
          return 4; // High priority for imminent bookings
        }
      }
      return 3;

    case "task":
      // Check due date urgency
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        const now = new Date();
        const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 1) return 5;
        if (daysDiff <= 3) return 4;
        if (daysDiff <= 7) return 3;
      }
      return 3;

    case "inquiry":
    case "contact":
      return 3;

    case "feedback":
      return 2;

    default:
      return 3;
  }
}

/**
 * Generate intent description based on form type
 */
function generateIntentDescription(data: z.infer<typeof formSubmissionSchema>): string {
  switch (data.formType) {
    case "booking":
      if (data.meetingType) {
        return `User wants to schedule a ${data.meetingType} meeting`;
      }
      return "User wants to schedule a meeting";

    case "task":
      if (data.taskTitle) {
        return `User wants to create a task: ${data.taskTitle}`;
      }
      return "User wants to create a new task";

    case "inquiry":
      return "User is making a general inquiry";

    case "contact":
      return "User submitted a contact form";

    case "feedback":
      return "User submitted feedback";

    default:
      return "Form submission received";
  }
}

/**
 * Estimate processing time based on form type and complexity
 */
function estimateProcessingTime(data: z.infer<typeof formSubmissionSchema>): number {
  // Base processing times in seconds
  const baseTime: Record<string, number> = {
    booking: 30,
    task: 15,
    inquiry: 60,
    contact: 45,
    feedback: 30,
  };

  let time = baseTime[data.formType] || 45;

  // Add time for additional complexity
  if (data.participants && data.participants.length > 3) {
    time += 15; // More participants = more time to check availability
  }

  return time;
}

// ============================================================================
// reCAPTCHA Verification (Optional)
// ============================================================================

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // reCAPTCHA not configured, skip verification
    console.log("[Agent Form] reCAPTCHA verification skipped - no secret key configured");
    return { success: true };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${data["error-codes"]?.join(", ") || "Unknown error"}`,
      };
    }

    // For reCAPTCHA v3, check the score (0.0 - 1.0, higher is more likely human)
    if (data.score !== undefined && data.score < 0.5) {
      return {
        success: false,
        score: data.score,
        error: "reCAPTCHA score too low",
      };
    }

    return { success: true, score: data.score };
  } catch (error) {
    console.error("[Agent Form] reCAPTCHA verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "reCAPTCHA verification failed",
    };
  }
}

// ============================================================================
// POST /api/agent/form - Handle form submissions
// ============================================================================

/**
 * POST /api/agent/form
 *
 * Handles structured form submissions for the scheduling agent.
 * Automatically maps form types to task types and pre-extracts entities.
 *
 * Request body:
 * - formType: 'booking' | 'task' | 'inquiry' | 'contact' | 'feedback'
 * - userId?: string
 * - orgId?: string
 * - name?: string
 * - email?: string
 * - phone?: string
 * - message?: string
 * - preferredDate?: string (for booking)
 * - preferredTime?: string (for booking)
 * - duration?: number (for booking)
 * - meetingType?: string (for booking)
 * - participants?: string[] (for booking)
 * - taskTitle?: string (for task)
 * - taskDescription?: string (for task)
 * - dueDate?: string (for task)
 * - priority?: number (for task)
 * - assignTo?: string (for task)
 * - source?: string
 * - utmParams?: Record<string, string>
 * - recaptchaToken?: string
 *
 * Returns:
 * - 201: Task created successfully
 * - 400: Validation error
 * - 422: Honeypot triggered or bot detected
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  const logCtx = agentLogger.createContext("/api/agent/form", "POST");

  try {
    // Get client IP for rate limiting and bot detection
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "anonymous";

    agentLogger.requestReceived(logCtx, {
      source: "FORM",
      ip: clientIp,
    });

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
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

    // Validate request body
    const parsed = formSubmissionSchema.safeParse(body);

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

    const data = parsed.data;

    // Log form submission details
    agentLogger.formSubmission(logCtx, {
      formType: data.formType,
      source: data.source,
      hasRecaptcha: !!data.recaptchaToken,
    });

    // ========================================================================
    // Bot Detection: Honeypot Check
    // ========================================================================
    if (data.honeypot || data.website) {
      agentLogger.botDetection(logCtx, true, "honeypot");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid submission",
          details: "Form submission rejected",
        },
        { status: 422 }
      );
    }
    agentLogger.botDetection(logCtx, false, "honeypot");

    // ========================================================================
    // Bot Detection: Timing Check
    // ========================================================================
    const timingCheck = checkSubmissionTiming(clientIp);
    if (!timingCheck.allowed) {
      agentLogger.botDetection(logCtx, true, "timing");
      return NextResponse.json(
        {
          success: false,
          error: "Submission rejected",
          details: timingCheck.reason,
        },
        { status: 422 }
      );
    }
    agentLogger.botDetection(logCtx, false, "timing");

    // ========================================================================
    // Rate Limiting
    // ========================================================================
    const rateLimitIdentifier = data.email || clientIp;
    const rateLimit = checkRateLimit(rateLimitIdentifier);
    if (!rateLimit.allowed) {
      agentLogger.rateLimitExceeded(logCtx, rateLimitIdentifier);
      const response = NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          details: `Too many submissions. Try again after ${new Date(rateLimit.reset * 1000).toISOString()}`,
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // ========================================================================
    // reCAPTCHA Verification (if token provided)
    // ========================================================================
    if (data.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(data.recaptchaToken);
      agentLogger.recaptchaResult(logCtx, recaptchaResult.success, recaptchaResult.score);
      if (!recaptchaResult.success) {
        const response = NextResponse.json(
          {
            success: false,
            error: "reCAPTCHA verification failed",
            details: recaptchaResult.error,
          },
          { status: 422 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }
    }

    // ========================================================================
    // Validate Required Fields Based on Form Type
    // ========================================================================
    const validationErrors: Record<string, string[]> = {};

    if (data.formType === "booking") {
      if (!data.name) validationErrors.name = ["Name is required for booking"];
      if (!data.email) validationErrors.email = ["Email is required for booking"];

      // Validate date format if provided
      if (data.preferredDate && !isValidDateString(data.preferredDate)) {
        validationErrors.preferredDate = ["Invalid date format. Use ISO 8601 or MM/DD/YYYY format."];
      }

      // Validate time format if provided
      if (data.preferredTime && !isValidTimeString(data.preferredTime)) {
        validationErrors.preferredTime = ["Invalid time format. Use HH:MM or H:MM AM/PM format."];
      }
    }

    if (data.formType === "task") {
      if (!data.taskTitle && !data.message) {
        validationErrors.taskTitle = ["Task title or message is required"];
      }

      // Validate due date format if provided
      if (data.dueDate && !isValidDateString(data.dueDate)) {
        validationErrors.dueDate = ["Invalid date format. Use ISO 8601 or MM/DD/YYYY format."];
      }
    }

    if (data.formType === "contact" || data.formType === "inquiry" || data.formType === "feedback") {
      if (!data.email && !data.phone) {
        validationErrors.email = ["Email or phone is required for contact"];
      }
      if (!data.message) {
        validationErrors.message = ["Message is required"];
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // ========================================================================
    // User Resolution
    // ========================================================================
    let userId = data.userId;
    let orgId = data.orgId;

    // Try session first
    const session = await auth();
    if (session?.user?.id) {
      userId = userId || session.user.id;
    }

    // If userId provided, verify it exists
    if (userId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, orgId: true },
      });

      if (!user) {
        const response = NextResponse.json(
          {
            success: false,
            error: "User not found",
            details: "The specified user does not exist.",
          },
          { status: 404 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }

      // Use user's org if not specified
      if (!orgId && user.orgId) {
        orgId = user.orgId;
      }
    }

    // If email provided but no userId, try to find user by email
    if (!userId && data.email) {
      const userByEmail = await prisma.users.findUnique({
        where: { email: data.email },
        select: { id: true, orgId: true },
      });

      if (userByEmail) {
        userId = userByEmail.id;
        if (!orgId && userByEmail.orgId) {
          orgId = userByEmail.orgId;
        }
      }
    }

    // If still no userId, we need at least an email for anonymous submissions
    if (!userId && !data.email) {
      const response = NextResponse.json(
        {
          success: false,
          error: "User identification required",
          details: "Please provide userId, authenticate, or include an email address.",
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // For anonymous submissions (has email but no user account), create a placeholder user reference
    // We'll use a special "anonymous" user pattern
    const effectiveUserId = userId || `anonymous:${data.email}`;

    // Verify organization if provided
    if (orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true },
      });

      if (!org) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Organization not found",
            details: "The specified organization does not exist.",
          },
          { status: 404 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }
    }

    // ========================================================================
    // Build Task Data
    // ========================================================================
    const formSubmissionId = generateFormSubmissionId();
    const taskType = FORM_TYPE_TO_TASK_TYPE[data.formType];
    const rawContent = buildRawContent(data);
    const entities = extractEntitiesFromForm(data);
    const priority = determinePriority(data);
    const intent = generateIntentDescription(data);

    // Log entity extraction
    const extractedEntities = Object.keys(entities);
    if (extractedEntities.length > 0) {
      agentLogger.entityExtraction(logCtx, extractedEntities);
    }

    // For anonymous users, we need to find or create a proper user
    // This is a database-safe approach
    let dbUserId: string;

    if (userId && !userId.startsWith("anonymous:")) {
      dbUserId = userId;
    } else if (data.email) {
      // Find existing user by email or we need to handle anonymous case
      const existingUser = await prisma.users.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      if (existingUser) {
        dbUserId = existingUser.id;
      } else {
        // For truly anonymous submissions without a user account,
        // we cannot create the task without a valid user reference.
        // Return an error asking for authentication or registration.
        const response = NextResponse.json(
          {
            success: false,
            error: "User account required",
            details: "No user account found for the provided email. Please register or authenticate first.",
          },
          { status: 400 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }
    } else {
      const response = NextResponse.json(
        {
          success: false,
          error: "User identification required",
          details: "Could not determine user for this submission.",
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Create the agent task
    const task = await prisma.schedulingAgentTask.create({
      data: {
        userId: dbUserId,
        orgId: orgId || null,
        source: AgentTaskSource.FORM,
        sourceId: formSubmissionId,
        rawContent,
        taskType,
        intent,
        entities: entities as Prisma.InputJsonValue,
        priority,
        confidence: 0.95, // High confidence since data is structured
        status: AgentTaskStatus.PENDING,
        // Pre-populate task fields for task type
        title: data.formType === "task" ? data.taskTitle || null : null,
        description: data.formType === "task" ? data.taskDescription || null : null,
        dueDate: data.formType === "task" && data.dueDate ? new Date(data.dueDate) : null,
        assignedTo: data.assignTo || null,
        // Store full metadata
        aiMetadata: {
          formType: data.formType,
          formSubmissionId,
          source: data.source || "direct",
          utmParams: data.utmParams || {},
          clientIp,
          submittedAt: new Date().toISOString(),
          preClassified: true,
          confidence: 0.95,
        } as Prisma.InputJsonValue,
      },
    });

    // Log task creation
    agentLogger.taskCreated(logCtx, task.id, {
      source: "FORM",
      priority,
      taskType: taskType,
    });

    // ========================================================================
    // Queue for Processing
    // ========================================================================
    let jobId: string | null = null;
    try {
      const jobData: ProcessInboxJobData = {
        taskId: task.id,
        userId: dbUserId,
        orgId: orgId || undefined,
        priority,
      };

      // Use urgent queue for high priority tasks
      if (priority >= 4) {
        jobId = await queueProcessInboxUrgent(jobData);
        agentLogger.queueJobAdded(logCtx, jobId || "unknown", "urgent");
      } else {
        jobId = await queueProcessInbox(jobData);
        agentLogger.queueJobAdded(logCtx, jobId || "unknown", "standard");
      }
    } catch (queueError) {
      // Log queue error but don't fail the request - task is created
      agentLogger.queueJobFailed(
        logCtx,
        task.id,
        queueError instanceof Error ? queueError.message : "Unknown error"
      );
    }
    const estimatedTime = estimateProcessingTime(data);

    const response = NextResponse.json(
      {
        success: true,
        taskId: task.id,
        taskType: task.taskType,
        message: getSuccessMessage(data.formType),
        formSubmissionId,
        estimatedProcessingTime: estimatedTime,
        ...(jobId && { jobId }),
        meta: {
          priority: task.priority,
          confidence: 0.95,
        },
      },
      { status: 201 }
    );

    agentLogger.requestCompleted(logCtx, 201, `Task ${task.id} created from form`);
    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    agentLogger.error(logCtx, "Error processing form submission", {
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

/**
 * Get user-friendly success message based on form type
 */
function getSuccessMessage(formType: z.infer<typeof formTypeSchema>): string {
  switch (formType) {
    case "booking":
      return "Your booking request has been received and is being processed. We will confirm your meeting time shortly.";
    case "task":
      return "Your task has been created successfully and added to the queue.";
    case "inquiry":
      return "Your inquiry has been received. We will respond as soon as possible.";
    case "contact":
      return "Thank you for contacting us. We will get back to you shortly.";
    case "feedback":
      return "Thank you for your feedback. We appreciate you taking the time to share your thoughts.";
    default:
      return "Your submission has been received and is being processed.";
  }
}
