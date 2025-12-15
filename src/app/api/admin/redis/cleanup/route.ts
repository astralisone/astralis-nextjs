import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { closeRedisConnection, getRedisConnectionInfo } from '@/workers/redis';

/**
 * GET /api/admin/redis/cleanup
 *
 * Get Redis connection information for monitoring
 *
 * This endpoint:
 * - Shows current Redis connection status
 * - Provides server statistics
 * - Helps diagnose connection issues
 *
 * Auth: Required (admin only)
 * Method: GET
 *
 * Response: 200 OK
 * {
 *   connected: boolean,
 *   ready: boolean,
 *   status: string,
 *   serverInfo?: {
 *     connectedClients: string,
 *     usedMemory: string,
 *     uptimeSeconds: string
 *   }
 * }
 */

/**
 * POST /api/admin/redis/cleanup
 *
 * Cleanup idle Redis connections
 *
 * This endpoint:
 * - Closes the Redis connection to free up resources
 * - Helps prevent connection pool exhaustion
 * - Should be called periodically or when connection issues occur
 *
 * Auth: Required (admin only)
 * Method: POST
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   message: "Redis connection cleaned up",
 *   before: { connection info },
 *   after: { connection info }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 500: Cleanup failed
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get info before cleanup
    const beforeInfo = await getRedisConnectionInfo();

    // Cleanup Redis connection
    await closeRedisConnection();

    // Get info after cleanup
    const afterInfo = await getRedisConnectionInfo();

    console.log('[Redis Cleanup] Connection cleaned up by admin:', session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Redis connection cleaned up successfully',
      before: beforeInfo,
      after: afterInfo,
    });

  } catch (error) {
    console.error('[Redis Cleanup] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup Redis connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/redis/cleanup
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get Redis connection info
    const connectionInfo = await getRedisConnectionInfo();

    return NextResponse.json({
      success: true,
      connectionInfo,
    });

  } catch (error) {
    console.error('[Redis Info] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Redis connection info',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}