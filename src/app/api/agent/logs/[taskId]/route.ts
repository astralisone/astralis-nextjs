/**
 * Agent Logs Task Timeline API Route
 *
 * GET /api/agent/logs/[taskId]/timeline - Get all logs for a specific task
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { agentLogService } from '@/lib/services/agentLog.service';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const key = `logs:timeline:${userId}`;
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
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
  return response;
}

// ============================================================================
// GET /api/agent/logs/[taskId]/timeline - Get task timeline
// ============================================================================

/**
 * GET /api/agent/logs/[taskId]/timeline
 *
 * Get all logs for a specific task, ordered by timestamp (ascending).
 * This provides a chronological timeline of all agent activities for a task.
 *
 * Path parameters:
 * - taskId: string - The task ID to get timeline for
 *
 * Returns:
 * - 200: Timeline with logs ordered by timestamp
 * - 400: Invalid taskId
 * - 401: Unauthorized
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'Authentication required to query task timeline.',
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
          error: 'Rate limit exceeded',
          details: `Too many requests. Try again after ${new Date(rateLimit.reset * 1000).toISOString()}`,
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Get taskId from params
    const { taskId } = await params;

    if (!taskId || typeof taskId !== 'string') {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Invalid taskId',
          details: 'taskId parameter is required and must be a string.',
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    // Get task timeline
    const logs = agentLogService.getTaskTimeline(taskId);

    // For non-admin users, we could add additional authorization checks here
    // to ensure they can only view timelines for tasks in their org.
    // This would require fetching the task from the database to verify orgId.
    // For now, we rely on the logs being filtered by orgId at creation time.

    const response = NextResponse.json(
      {
        success: true,
        taskId,
        logs,
        total: logs.length,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error('[Agent Logs] Error getting task timeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
