import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';

/**
 * GET /api/automations/[id]/executions
 *
 * Get execution history for a specific automation.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * - status: Filter by status (SUCCESS, FAILED, RUNNING)
 *
 * Auth: Required (must belong to same organization)
 * Returns: ExecutionHistoryResponse
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 1. Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Organization required' },
        { status: 403 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '20'),
      100
    );
    const status = searchParams.get('status') || undefined;

    // 3. Verify automation exists and belongs to org
    const automation = await automationService.getAutomation(
      id,
      session.user.orgId
    );

    if (!automation) {
      return NextResponse.json(
        { error: 'Not found', details: 'Automation not found' },
        { status: 404 }
      );
    }

    // 4. Get execution history
    const executions = await automationService.getExecutionHistory(
      id,
      session.user.orgId,
      pageSize
    );

    // 5. Return execution history
    return NextResponse.json({
      success: true,
      data: executions,
      pagination: {
        page,
        pageSize,
        total: executions.length,
      },
    });

  } catch (error) {
    console.error('[API /api/automations/[id]/executions GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch execution history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
