/**
 * Admin Action Management API Route
 *
 * Individual action CRUD operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { actionRepository } from '@/lib/services/action-repository';
import { ActionStatus } from '@/lib/types/action';
import { auth } from '@/lib/auth/config';

// GET /api/admin/actions/[id] - Get action details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = await actionRepository.findById(params.id);
    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Get execution stats
    const stats = await actionRepository.getActionStats(params.id);

    return NextResponse.json({
      success: true,
      action: {
        ...action,
        stats,
      },
    });
  } catch (error) {
    console.error('Failed to get action:', error);
    return NextResponse.json(
      { error: 'Failed to get action' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/actions/[id] - Update action
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: any = {};

    // Only allow certain fields to be updated
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.tags !== undefined) updates.tags = body.tags;

    const action = await actionRepository.update(params.id, updates);

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error) {
    console.error('Failed to update action:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/actions/[id] - Delete action
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await actionRepository.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Action deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete action:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}