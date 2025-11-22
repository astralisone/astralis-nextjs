/**
 * Agent Logs API Route
 *
 * GET /api/agent/logs - Query agent logs with filtering and pagination
 * DELETE /api/agent/logs - Clean old logs (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { agentLogService } from '@/lib/services/agentLog.service';
import type {
  AgentLogLevel,
  AgentLogCategory,
} from '@/types/agent-logs';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const GET_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const GET_RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute for GET
const DELETE_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const DELETE_RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute for DELETE

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  userId: string,
  operation: 'GET' | 'DELETE'
): {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
} {
  const now = Date.now();
  const maxRequests =
    operation === 'GET' ? GET_RATE_LIMIT_MAX_REQUESTS : DELETE_RATE_LIMIT_MAX_REQUESTS;
  const windowMs =
    operation === 'GET' ? GET_RATE_LIMIT_WINDOW_MS : DELETE_RATE_LIMIT_WINDOW_MS;
  const key = `logs:${operation}:${userId}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: Math.ceil((now + windowMs) / 1000),
      limit: maxRequests,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      limit: maxRequests,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    reset: Math.ceil(record.resetTime / 1000),
    limit: maxRequests,
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

const logLevels: AgentLogLevel[] = ['debug', 'info', 'warn', 'error'];
const logCategories: AgentLogCategory[] = [
  'intake',
  'classification',
  'scheduling',
  'delivery',
  'worker',
  'system',
];

const querySchema = z.object({
  level: z.enum(logLevels as [string, ...string[]]).optional(),
  category: z.enum(logCategories as [string, ...string[]]).optional(),
  taskId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  action: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const deleteSchema = z.object({
  olderThanDays: z.coerce.number().int().min(1).max(365).optional().default(30),
});

// ============================================================================
// GET /api/agent/logs - Query logs
// ============================================================================

/**
 * GET /api/agent/logs
 *
 * Query agent logs with optional filtering and pagination.
 *
 * Query parameters:
 * - level: 'debug' | 'info' | 'warn' | 'error'
 * - category: 'intake' | 'classification' | 'scheduling' | 'delivery' | 'worker' | 'system'
 * - taskId: string
 * - userId: string
 * - startDate: ISO string
 * - endDate: ISO string
 * - action: string (partial match)
 * - limit: number (default 100, max 1000)
 * - offset: number (default 0)
 *
 * Returns:
 * - 200: List of logs with pagination
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
          details: 'Authentication required to query logs.',
        },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id, 'GET');
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
      level: searchParams.get('level') || undefined,
      category: searchParams.get('category') || undefined,
      taskId: searchParams.get('taskId') || undefined,
      userId: searchParams.get('userId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      action: searchParams.get('action') || undefined,
      limit: searchParams.get('limit') || '100',
      offset: searchParams.get('offset') || '0',
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

    const filters = parsed.data;

    // Filter by orgId for non-admin users
    const isAdmin = session.user.role === 'ADMIN';
    const orgId = session.user.orgId;

    // Build query filters - non-admins can only see logs from their org
    const queryFilters = {
      ...filters,
      level: filters.level as AgentLogLevel | undefined,
      category: filters.category as AgentLogCategory | undefined,
      // Only filter by orgId if user is not admin and requesting logs without specific userId filter
      orgId: !isAdmin && !filters.userId ? orgId : filters.userId ? undefined : undefined,
    };

    // If non-admin user is filtering by userId, ensure it's their own
    if (!isAdmin && filters.userId && filters.userId !== session.user.id) {
      // Non-admin users can only see their own logs or org logs
      queryFilters.orgId = orgId;
    }

    // Query logs
    const { logs, total } = agentLogService.query(queryFilters);

    const response = NextResponse.json(
      {
        success: true,
        logs,
        total,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < total,
        },
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error('[Agent Logs] Error querying logs:', error);
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

// ============================================================================
// DELETE /api/agent/logs - Clean old logs (admin only)
// ============================================================================

/**
 * DELETE /api/agent/logs
 *
 * Delete logs older than specified number of days.
 * Requires ADMIN role.
 *
 * Request body:
 * - olderThanDays: number (default 30)
 *
 * Returns:
 * - 200: Success with deleted count
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden (non-admin)
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'Authentication required to delete logs.',
        },
        { status: 401 }
      );
    }

    // Check for ADMIN role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          details: 'Only administrators can delete logs.',
        },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id, 'DELETE');
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

    // Parse request body
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is OK, use defaults
    }

    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
      return addRateLimitHeaders(response, rateLimit);
    }

    const { olderThanDays } = parsed.data;

    // Delete old logs
    const deletedCount = agentLogService.deleteOldLogs(olderThanDays);

    const response = NextResponse.json(
      {
        success: true,
        deletedCount,
        message: `Successfully deleted ${deletedCount} log entries older than ${olderThanDays} days.`,
      },
      { status: 200 }
    );

    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error('[Agent Logs] Error deleting logs:', error);
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
