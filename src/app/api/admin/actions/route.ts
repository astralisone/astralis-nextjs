/**
 * Admin Actions API Route
 *
 * REST API for managing the action repository.
 * Provides CRUD operations and analytics for actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { actionRepository } from '@/lib/services/action-repository';
import { ActionStatus } from '@/lib/types/action';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// GET /api/admin/actions - List actions with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as ActionStatus | null;
    const provider = searchParams.get('provider') || '';

    // Build search filters
    const filters: any = {};
    if (search) {
      filters.searchQuery = search;
    }
    if (status) {
      filters.status = [status];
    }
    if (provider) {
      filters.provider = [provider];
    }

    const actions = await actionRepository.search(filters);

    return NextResponse.json({
      success: true,
      actions,
      total: actions.length,
    });
  } catch (error) {
    console.error('Failed to list actions:', error);
    return NextResponse.json(
      { error: 'Failed to list actions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/actions - Create new action (manual creation)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const actionData = {
      actionKey: body.actionKey,
      provider: body.provider,
      name: body.name,
      description: body.description,
      category: body.category,
      inputSchema: body.inputSchema,
      outputSchema: body.outputSchema,
      executionSpec: body.executionSpec,
      version: body.version || '1.0.0',
      status: body.status || 'ACTIVE',
      tags: body.tags || [],
      executionCount: 0,
    };

    const action = await actionRepository.save(actionData);

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error) {
    console.error('Failed to create action:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}