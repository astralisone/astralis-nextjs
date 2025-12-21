import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/database
 *
 * Returns database information for debugging.
 *
 * Auth: Required (admin only)
 * Returns: Database connection status, table counts, recent activity
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      );
    }

    // Test database connection
    let connected = false;
    try {
      await prisma.$connect();
      connected = true;
    } catch (error) {
      console.error('Database connection test failed:', error);
    }

    // Get table statistics
    const tables = [];

    try {
      // Users table
      const userCount = await prisma.users.count();
      tables.push({ name: 'users', count: userCount });

      // Organizations table
      const orgCount = await prisma.organization.count();
      tables.push({ name: 'organizations', count: orgCount });

      // Integration credentials
      const credentialCount = await prisma.integrationCredential.count();
      tables.push({ name: 'integration_credentials', count: credentialCount });

      // Workflows (Automations)
      const workflowCount = await prisma.automation.count();
      tables.push({ name: 'automations', count: workflowCount });

      // Pipeline stages
      const pipelineCount = await prisma.pipelineStage.count();
      tables.push({ name: 'pipeline_stages', count: pipelineCount });

      // Activity log (recent entries)
      const activityCount = await prisma.activityLog.count();
      tables.push({ name: 'activity_logs', count: activityCount });

    } catch (error) {
      console.error('Failed to get table statistics:', error);
    }

    // Get database name from connection string (safely)
    const dbUrl = process.env.DATABASE_URL || '';
    const dbName = dbUrl.split('/').pop()?.split('?')[0] || 'unknown';

    // Recent activity (last 10 activity log entries)
    let recentActivity = [];
    try {
      recentActivity = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to get recent activity:', error);
    }

    return NextResponse.json({
      connected,
      database: dbName,
      tables,
      recentActivity,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API /api/debug/database GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Database debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}