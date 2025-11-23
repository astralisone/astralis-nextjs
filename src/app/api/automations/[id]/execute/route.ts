import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';
import { executeAutomationSchema } from '@/lib/validators/automation.validators';

/**
 * POST /api/automations/[id]/execute
 *
 * Execute an automation manually with custom trigger data.
 *
 * Body: ExecuteAutomationInput {
 *   triggerData?: Record<string, any>
 * }
 *
 * Auth: Required (must belong to same organization)
 * Returns: Execution result with n8nExecutionId
 */
export async function POST(
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

    // 2. Validate input
    const body = await req.json();
    const parsed = executeAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Execute automation
    const result = await automationService.executeAutomation(
      id,
      session.user.orgId,
      parsed.data.triggerData
    );

    // 4. Return execution result
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('[API /api/automations/[id]/execute POST] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', details: error.message },
          { status: 404 }
        );
      }

      if (error.message.includes('not active')) {
        return NextResponse.json(
          { error: 'Forbidden', details: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to execute automation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
