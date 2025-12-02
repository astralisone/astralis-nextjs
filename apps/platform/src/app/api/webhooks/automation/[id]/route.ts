import { NextRequest, NextResponse } from 'next/server';
import { automationService } from '@/lib/services/automation.service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/webhooks/automation/[id]
 *
 * Public webhook endpoint for triggering automations.
 * No authentication required - validated by automation ID.
 *
 * Body: Any JSON (passed as triggerData to workflow)
 *
 * Auth: None (public webhook)
 * Returns: { success: true, executionId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 1. Validate automation exists and is active
    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      return NextResponse.json(
        { error: 'Not found', details: 'Automation not found' },
        { status: 404 }
      );
    }

    if (!automation.isActive) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Automation is not active' },
        { status: 403 }
      );
    }

    // 2. Parse webhook payload
    let triggerData: any = {};
    try {
      triggerData = await req.json();
    } catch (error) {
      // If no JSON body, use empty object
      console.log('[Webhook] No JSON body provided, using empty trigger data');
    }

    // 3. Add webhook metadata to trigger data
    const enrichedTriggerData = {
      ...triggerData,
      _webhook: {
        timestamp: new Date().toISOString(),
        automationId: id,
        headers: Object.fromEntries(req.headers.entries()),
      },
    };

    // 4. Execute automation
    const result = await automationService.executeAutomation(
      id,
      automation.orgId,
      enrichedTriggerData
    );

    // 5. Return success response
    return NextResponse.json({
      success: true,
      executionId: result.n8nExecutionId,
      status: result.status,
    });

  } catch (error) {
    console.error('[API /api/webhooks/automation/[id] POST] Error:', error);

    // Don't expose internal errors to webhook callers
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook execution failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/automation/[id]
 *
 * Test endpoint to verify webhook is accessible.
 *
 * Auth: None (public webhook)
 * Returns: Webhook info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 1. Validate automation exists
    const automation = await prisma.automation.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isActive: true,
        webhookUrl: true,
      },
    });

    if (!automation) {
      return NextResponse.json(
        { error: 'Not found', details: 'Automation not found' },
        { status: 404 }
      );
    }

    // 2. Return webhook info
    return NextResponse.json({
      success: true,
      data: {
        automationId: automation.id,
        automationName: automation.name,
        isActive: automation.isActive,
        webhookUrl: automation.webhookUrl,
        method: 'POST',
        contentType: 'application/json',
      },
    });

  } catch (error) {
    console.error('[API /api/webhooks/automation/[id] GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch webhook info',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
