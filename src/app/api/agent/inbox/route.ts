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

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per user

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const key = `rate:${userId}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
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
// Validation Schemas
// ============================================================================

const createTaskSchema = z.object({
  source: z.enum(["FORM", "EMAIL", "SMS", "API", "CHAT", "VOICE"]),
  sourceId: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  userId: z.string().optional(),
  orgId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const listTasksSchema = z.object({
  userId: z.string().optional(),
  orgId: z.string().optional(),
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "AWAITING_INPUT",
      "SCHEDULED",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
    ])
    .optional(),
  taskType: z
    .enum([
      "SCHEDULE_MEETING",
      "RESCHEDULE_MEETING",
      "CANCEL_MEETING",
      "CHECK_AVAILABILITY",
      "CREATE_TASK",
      "UPDATE_TASK",
      "INQUIRY",
      "REMINDER",
      "UNKNOWN",
    ])
    .optional(),
  source: z.enum(["FORM", "EMAIL", "SMS", "API", "CHAT", "VOICE"]).optional(),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ============================================================================
// Priority Detection
// ============================================================================

/**
 * Detect priority from content using keyword analysis
 * Returns priority 1-5 (5 = highest)
 */
function detectPriority(content: string): number {
  const lowerContent = content.toLowerCase();

  // High priority keywords (5)
  const urgentKeywords = [
    "urgent",
    "asap",
    "emergency",
    "immediately",
    "critical",
    "crisis",
  ];
  if (urgentKeywords.some((kw) => lowerContent.includes(kw))) {
    return 5;
  }

  // Medium-high priority keywords (4)
  const importantKeywords = [
    "important",
    "priority",
    "deadline",
    "today",
    "client",
    "customer",
  ];
  if (importantKeywords.some((kw) => lowerContent.includes(kw))) {
    return 4;
  }

  // Medium priority keywords (3) - default
  const standardKeywords = [
    "meeting",
    "schedule",
    "appointment",
    "call",
    "follow up",
  ];
  if (standardKeywords.some((kw) => lowerContent.includes(kw))) {
    return 3;
  }

  // Lower priority keywords (2)
  const lowKeywords = [
    "when convenient",
    "no rush",
    "whenever",
    "sometime",
    "general",
  ];
  if (lowKeywords.some((kw) => lowerContent.includes(kw))) {
    return 2;
  }

  // Default priority
  return 3;
}

// ============================================================================
// POST /api/agent/inbox - Create a new agent task
// ============================================================================

/**
 * POST /api/agent/inbox
 *
 * Creates a new scheduling agent task from multi-channel input.
 * Accepts content from forms, emails, SMS, API, chat, and voice sources.
 *
 * Request body:
 * - source: 'FORM' | 'EMAIL' | 'SMS' | 'API' | 'CHAT' | 'VOICE'
 * - sourceId?: string - Reference to original message
 * - content: string - The raw text content to process
 * - userId?: string - If not provided, uses session user
 * - orgId?: string - Organization context
 * - metadata?: Record<string, unknown> - Additional source-specific data
 *
 * Returns:
 * - 201: Task created successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    // Parse and validate request body
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { source, sourceId, content, metadata } = parsed.data;

    // Determine user ID - from body, session, or reject
    let userId = parsed.data.userId;
    if (!userId && session?.user?.id) {
      userId = session.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "User ID is required. Provide userId in body or authenticate.",
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          details: `Too many requests. Try again after ${new Date(rateLimit.reset * 1000).toISOString()}`,
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Verify user exists
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

    // Determine organization ID
    const orgId = parsed.data.orgId || user.orgId || undefined;

    // Verify organization exists if provided
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

    // Detect priority from content
    const priority = detectPriority(content);

    // Create the agent task in the database
    const task = await prisma.schedulingAgentTask.create({
      data: {
        userId,
        orgId,
        source: source as AgentTaskSource,
        sourceId,
        rawContent: content,
        taskType: AgentTaskType.UNKNOWN, // Will be classified by AI
        priority,
        status: AgentTaskStatus.PENDING,
        aiMetadata: metadata
          ? ({ sourceMetadata: metadata, createdAt: new Date().toISOString() } as Prisma.InputJsonValue)
          : ({ createdAt: new Date().toISOString() } as Prisma.InputJsonValue),
      },
    });

    // Queue the task for AI processing
    let jobId: string | null = null;
    try {
      const jobData: ProcessInboxJobData = {
        taskId: task.id,
        userId,
        orgId: orgId || undefined,
        priority,
      };

      // Use urgent queue for high priority tasks
      if (priority >= 4) {
        jobId = await queueProcessInboxUrgent(jobData);
      } else {
        jobId = await queueProcessInbox(jobData);
      }

      console.log(
        `[Agent Inbox] Task created and queued: ${task.id} (priority: ${priority}, source: ${source})`
      );
    } catch (queueError) {
      // Log queue error but don't fail the request - task is created
      console.error(
        `[Agent Inbox] Failed to queue task ${task.id}:`,
        queueError
      );
      // Task is still created, will need manual processing or retry
    }

    const response = NextResponse.json(
      {
        success: true,
        task: {
          id: task.id,
          status: task.status,
          source: task.source,
          sourceId: task.sourceId,
          taskType: task.taskType,
          priority: task.priority,
          createdAt: task.createdAt.toISOString(),
          ...(jobId && { jobId }),
        },
      },
      { status: 201 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[Agent Inbox] Error creating task:", error);
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

// ============================================================================
// GET /api/agent/inbox - List agent tasks
// ============================================================================

/**
 * GET /api/agent/inbox
 *
 * Lists scheduling agent tasks with optional filtering.
 *
 * Query parameters:
 * - userId: Filter by user ID
 * - orgId: Filter by organization ID
 * - status: Filter by task status
 * - taskType: Filter by task type
 * - source: Filter by input source
 * - priority: Filter by priority (1-5)
 * - limit: Number of results (default 20, max 100)
 * - offset: Pagination offset (default 0)
 *
 * Returns:
 * - 200: List of tasks with pagination
 * - 400: Validation error
 * - 401: Unauthorized
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to list tasks.",
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          details: `Too many requests. Try again after ${new Date(rateLimit.reset * 1000).toISOString()}`,
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Parse query parameters
    const { searchParams } = req.nextUrl;
    const params = {
      userId: searchParams.get("userId") || undefined,
      orgId: searchParams.get("orgId") || undefined,
      status: searchParams.get("status") || undefined,
      taskType: searchParams.get("taskType") || undefined,
      source: searchParams.get("source") || undefined,
      priority: searchParams.get("priority") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    };

    const parsed = listTasksSchema.safeParse(params);
    if (!parsed.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    const { userId, orgId, status, taskType, source, priority, limit, offset } =
      parsed.data;

    // Build where clause
    const where: Record<string, unknown> = {};

    // Default to current user's tasks if no userId specified
    // Allow access to org-wide tasks if user has orgId
    if (userId) {
      where.userId = userId;
    } else if (orgId) {
      where.orgId = orgId;
    } else {
      // Default to current user's tasks
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status as AgentTaskStatus;
    }
    if (taskType) {
      where.taskType = taskType as AgentTaskType;
    }
    if (source) {
      where.source = source as AgentTaskSource;
    }
    if (priority !== undefined) {
      where.priority = priority;
    }

    // Fetch tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.schedulingAgentTask.findMany({
        where,
        select: {
          id: true,
          userId: true,
          orgId: true,
          source: true,
          sourceId: true,
          rawContent: true,
          taskType: true,
          intent: true,
          entities: true,
          priority: true,
          confidence: true,
          title: true,
          description: true,
          dueDate: true,
          assignedTo: true,
          schedulingEventId: true,
          proposedSlots: true,
          selectedSlot: true,
          status: true,
          resolution: true,
          errorMessage: true,
          processingTime: true,
          retryCount: true,
          createdAt: true,
          updatedAt: true,
          processedAt: true,
          completedAt: true,
          // Include related data
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          schedulingEvent: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
              status: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.schedulingAgentTask.count({ where }),
    ]);

    const response = NextResponse.json(
      {
        success: true,
        tasks,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[Agent Inbox] Error listing tasks:", error);
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
