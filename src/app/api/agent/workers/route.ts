import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import {
  getQueueStats,
  getRecentJobs,
  getWorkerHealth,
  pauseQueue,
  resumeQueue,
  retryFailedJobs,
  retryJob,
  cleanCompletedJobs,
  cleanFailedJobs,
  QueueStats,
  JobInfo,
} from "@/lib/utils/queueMonitor";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_QUEUE = "scheduling-agent";
const SUPPORTED_QUEUES = [
  "scheduling-agent",
  "document-processing",
  "document-embedding",
  "intake-routing",
  "calendar-sync",
  "scheduling-reminders",
];

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute (monitoring can be polled)

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const key = `rate:workers:${userId}`;
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
// Authorization
// ============================================================================

/**
 * Check if user has ADMIN role
 */
function isAdmin(role: string | undefined): boolean {
  return role === "ADMIN";
}

// ============================================================================
// Validation Schemas
// ============================================================================

const actionSchema = z.object({
  action: z.enum(["pause", "resume", "retry-failed", "retry-job", "clean-completed", "clean-failed"]),
  queue: z.string().optional().default(DEFAULT_QUEUE),
  jobId: z.string().optional(), // For retry-job action
  ageMs: z.number().int().positive().optional(), // For clean actions (in milliseconds)
});

// ============================================================================
// Response Types
// ============================================================================

interface GetWorkersResponse {
  success: true;
  queues: Record<string, QueueStats>;
  jobs: {
    recent: JobInfo[];
  };
  health: {
    redis: "connected" | "disconnected";
    workers: Record<string, "running" | "paused" | "stopped">;
  };
}

interface PostWorkersResponse {
  success: true;
  action: string;
  queue: string;
  result: {
    message: string;
    affectedCount?: number;
    jobId?: string;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, string[]>;
}

// ============================================================================
// GET /api/agent/workers - Get worker status
// ============================================================================

/**
 * GET /api/agent/workers
 *
 * Returns worker status, queue statistics, recent jobs, and health information.
 *
 * Query parameters:
 * - queue: Specific queue to get stats for (defaults to all supported queues)
 * - jobLimit: Number of recent jobs to return (default 20, max 100)
 *
 * Returns:
 * - 200: Worker status and health information
 * - 401: Unauthorized
 * - 403: Forbidden (requires ADMIN role)
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
          details: "Authentication required to access worker status.",
        },
        { status: 401 }
      );
    }

    // Check ADMIN role
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "ADMIN role required to access worker status.",
        },
        { status: 403 }
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
    const queueParam = searchParams.get("queue");
    const jobLimitParam = searchParams.get("jobLimit");
    const jobLimit = Math.min(Math.max(parseInt(jobLimitParam || "20", 10) || 20, 1), 100);

    // Determine which queues to check
    const queuesToCheck = queueParam
      ? SUPPORTED_QUEUES.includes(queueParam)
        ? [queueParam]
        : []
      : SUPPORTED_QUEUES;

    if (queueParam && queuesToCheck.length === 0) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid queue",
          details: `Queue '${queueParam}' is not supported. Supported queues: ${SUPPORTED_QUEUES.join(", ")}`,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Fetch all data in parallel
    const [queueStatsResults, recentJobs, healthInfo] = await Promise.all([
      Promise.all(queuesToCheck.map(getQueueStats)),
      getRecentJobs(queueParam || DEFAULT_QUEUE, jobLimit),
      getWorkerHealth(queuesToCheck),
    ]);

    // Convert queue stats array to record
    const queues: Record<string, QueueStats> = {};
    queueStatsResults.forEach((stats) => {
      queues[stats.name] = stats;
    });

    const response = NextResponse.json<GetWorkersResponse>(
      {
        success: true,
        queues,
        jobs: {
          recent: recentJobs,
        },
        health: healthInfo,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[Workers API] Error getting worker status:", error);
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
// POST /api/agent/workers - Worker management actions
// ============================================================================

/**
 * POST /api/agent/workers
 *
 * Performs worker management actions like pause, resume, retry, and clean.
 *
 * Request body:
 * - action: 'pause' | 'resume' | 'retry-failed' | 'retry-job' | 'clean-completed' | 'clean-failed'
 * - queue?: string - Queue name (defaults to 'scheduling-agent')
 * - jobId?: string - Required for 'retry-job' action
 * - ageMs?: number - Age threshold for clean actions (in milliseconds)
 *
 * Returns:
 * - 200: Action completed successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden (requires ADMIN role)
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to manage workers.",
        },
        { status: 401 }
      );
    }

    // Check ADMIN role
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "ADMIN role required to manage workers.",
        },
        { status: 403 }
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

    // Parse and validate request body
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    const { action, queue, jobId, ageMs } = parsed.data;

    // Validate queue name
    if (!SUPPORTED_QUEUES.includes(queue)) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid queue",
          details: `Queue '${queue}' is not supported. Supported queues: ${SUPPORTED_QUEUES.join(", ")}`,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Execute action
    let result: PostWorkersResponse["result"];

    switch (action) {
      case "pause": {
        await pauseQueue(queue);
        result = {
          message: `Queue '${queue}' has been paused`,
        };
        break;
      }

      case "resume": {
        await resumeQueue(queue);
        result = {
          message: `Queue '${queue}' has been resumed`,
        };
        break;
      }

      case "retry-failed": {
        const retriedCount = await retryFailedJobs(queue);
        result = {
          message: `Retried ${retriedCount} failed jobs in queue '${queue}'`,
          affectedCount: retriedCount,
        };
        break;
      }

      case "retry-job": {
        if (!jobId) {
          const response = NextResponse.json(
            {
              success: false,
              error: "Validation failed",
              details: "jobId is required for retry-job action",
            },
            { status: 400 }
          );
          return addRateLimitHeaders(response, rateLimit);
        }

        const success = await retryJob(queue, jobId);
        if (!success) {
          const response = NextResponse.json(
            {
              success: false,
              error: "Job retry failed",
              details: `Could not retry job '${jobId}'. Job may not exist or may not be in failed state.`,
            },
            { status: 400 }
          );
          return addRateLimitHeaders(response, rateLimit);
        }

        result = {
          message: `Job '${jobId}' has been retried in queue '${queue}'`,
          jobId,
        };
        break;
      }

      case "clean-completed": {
        const defaultAge = 24 * 60 * 60 * 1000; // 24 hours
        const cleanedCount = await cleanCompletedJobs(queue, ageMs || defaultAge);
        result = {
          message: `Cleaned ${cleanedCount} completed jobs from queue '${queue}'`,
          affectedCount: cleanedCount,
        };
        break;
      }

      case "clean-failed": {
        const defaultFailedAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cleanedCount = await cleanFailedJobs(queue, ageMs || defaultFailedAge);
        result = {
          message: `Cleaned ${cleanedCount} failed jobs from queue '${queue}'`,
          affectedCount: cleanedCount,
        };
        break;
      }

      default: {
        const response = NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            details: `Action '${action}' is not supported`,
          },
          { status: 400 }
        );
        return addRateLimitHeaders(response, rateLimit);
      }
    }

    console.log(
      `[Workers API] Action '${action}' executed on queue '${queue}' by user ${session.user.id}`
    );

    const response = NextResponse.json<PostWorkersResponse>(
      {
        success: true,
        action,
        queue,
        result,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[Workers API] Error executing action:", error);
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
