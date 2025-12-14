/**
 * Admin Action Status Update API Route
 *
 * Update action status (active, inactive, deprecated, broken).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { actionRepository } from '@/lib/services/action-repository';
import { ActionStatus } from '@/lib/types/action';
import { auth } from '@/lib/auth/config';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED', 'BROKEN']),
});

// PATCH /api/admin/actions/[id]/status - Update action status
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
    const { status } = updateStatusSchema.parse(body);

    const action = await actionRepository.update(params.id, { status });

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update action status:', error);
    return NextResponse.json(
      { error: 'Failed to update action status' },
      { status: 500 }
    );
  }
}