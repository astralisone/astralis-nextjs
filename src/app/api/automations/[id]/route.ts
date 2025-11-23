import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';
import { updateAutomationSchema } from '@/lib/validators/automation.validators';

/**
 * GET /api/automations/[id]
 *
 * Get a single automation by ID with full details.
 *
 * Auth: Required (must belong to same organization)
 * Returns: AutomationWithRelations
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

    // 2. Get automation
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

    // 3. Return automation
    return NextResponse.json({
      success: true,
      data: automation,
    });

  } catch (error) {
    console.error('[API /api/automations/[id] GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch automation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automations/[id]
 *
 * Update an automation's details.
 *
 * Body: UpdateAutomationInput {
 *   name?: string
 *   description?: string
 *   isActive?: boolean
 *   tags?: string[]
 * }
 *
 * Auth: Required (must belong to same organization, ADMIN or OPERATOR)
 * Returns: Updated automation
 */
export async function PATCH(
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
    const parsed = updateAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Update automation
    const automation = await automationService.updateAutomation(
      id,
      session.user.orgId,
      parsed.data
    );

    // 4. Return updated automation
    return NextResponse.json({
      success: true,
      data: automation,
    });

  } catch (error) {
    console.error('[API /api/automations/[id] PATCH] Error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update automation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/automations/[id]
 *
 * Delete an automation and its associated n8n workflow.
 *
 * Auth: Required (must belong to same organization, ADMIN only)
 * Returns: Success message
 */
export async function DELETE(
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

    // 2. Delete automation (service handles n8n deletion)
    await automationService.deleteAutomation(id, session.user.orgId);

    // 3. Return success
    return NextResponse.json({
      success: true,
      message: 'Automation deleted successfully',
    });

  } catch (error) {
    console.error('[API /api/automations/[id] DELETE] Error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to delete automation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
