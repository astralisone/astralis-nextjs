import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';
import { createAutomationSchema } from '@/lib/validators/automation.validators';
import { z } from 'zod';

/**
 * GET /api/automations
 *
 * List automations for the authenticated user's organization.
 *
 * Query params:
 * - isActive: Filter by active status (true/false)
 * - search: Search by name/description
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20)
 *
 * Auth: Required (session.user.orgId)
 * Returns: AutomationListResponse
 */
export async function GET(req: NextRequest) {
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
    const isActiveParam = searchParams.get('isActive');
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const filters: any = {};

    if (isActiveParam !== null) {
      filters.isActive = isActiveParam === 'true';
    }

    if (search) {
      filters.search = search;
    }

    // 3. Get automations from service
    const automations = await automationService.listAutomations(
      session.user.orgId,
      filters
    );

    // 4. Return response
    return NextResponse.json({
      success: true,
      automations: automations,  // Frontend expects 'automations' key
      data: automations,  // Also include 'data' for consistency
      pagination: {
        page,
        pageSize,
        total: automations.length,
      },
    });

  } catch (error) {
    console.error('[API /api/automations GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch automations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automations
 *
 * Create a new automation with n8n workflow integration.
 *
 * Body: CreateAutomationInput {
 *   name: string
 *   description?: string
 *   triggerType: 'WEBHOOK' | 'SCHEDULE' | 'EVENT' | 'MANUAL' | 'API'
 *   triggerConfig: Record<string, any>
 *   workflowJson: { nodes: any[], connections: Record<string, any> }
 *   tags?: string[]
 * }
 *
 * Auth: Required (ADMIN or OPERATOR role)
 * Returns: Created automation with n8n workflow ID
 */
export async function POST(req: NextRequest) {
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
    const parsed = createAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Create automation via service
    const automation = await automationService.createAutomation({
      ...parsed.data,
      orgId: session.user.orgId,
      createdById: session.user.id,
    });

    // 4. Return created automation
    return NextResponse.json(
      {
        success: true,
        data: automation,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[API /api/automations POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create automation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
