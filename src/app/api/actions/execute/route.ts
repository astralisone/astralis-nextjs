/**
 * Action Execution API Route
 *
 * Execute actions from the repository.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { actionRuntime } from '@/lib/services/action-runtime';
import { auth } from '@/lib/auth/config';

const executeActionSchema = z.object({
  actionKey: z.string(),
  params: z.record(z.any()),
  orgId: z.string().optional(),
});

// POST /api/actions/execute - Execute an action
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { actionKey, params, orgId } = executeActionSchema.parse(body);

    // Use orgId from session if not provided
    const targetOrgId = orgId || session.user.orgId;
    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Execute the action
    const result = await actionRuntime.executeAction(actionKey, params, {
      userId: session.user.id,
      orgId: targetOrgId,
    });

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      executionTime: result.executionTime,
      executionId: result.executionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to execute action:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}