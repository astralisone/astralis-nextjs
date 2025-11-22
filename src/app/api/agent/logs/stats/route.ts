/**
 * Agent Logs Statistics API Route
 *
 * GET /api/agent/logs/stats - Get log statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
  const key = `logs:stats:${userId}`;
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
// Validation Schemas
// ============================================================================

const querySchema = z.object({
  periodHours: z.coerce.number().int().min(1).max(720).optional().default(24), // Max 30 days
});

// ============================================================================
// GET /api/agent/logs/stats - Get log statistics
// ============================================================================

/**
 * GET /api/agent/logs/stats
 *
 * Get statistics about agent logs for a specified period.
 *
 * Query parameters:
 * - periodHours: number (default 24, max 720/30 days) - Period to calculate stats for
 *
 * Returns:
 * - 200: Statistics with totals, breakdowns by level/category, error rate, avg duration
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
          error: 'Unauthorized',
          details: 'Authentication required to view log statistics.',
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

    // Parse query parameters
    const { searchParams } = req.nextUrl;
    const params = {
      periodHours: searchParams.get('periodHours') || '24',
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    const { periodHours } = parsed.data;

    // Get statistics
    const stats = agentLogService.getStats(periodHours);

    const response = NextResponse.json(
      {
        success: true,
        stats: {
          total: stats.total,
          byLevel: stats.byLevel,
          byCategory: stats.byCategory,
          errorRate: stats.errorRate,
          avgDuration: stats.avgDuration,
        },
        period: stats.period,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error('[Agent Logs] Error getting log statistics:', error);
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
