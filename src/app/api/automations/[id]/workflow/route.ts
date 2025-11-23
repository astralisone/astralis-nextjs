import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';
import { n8nService } from '@/lib/services/n8n.service';

/**
 * GET /api/automations/[id]/workflow
 *
 * Get the workflow JSON from n8n for an automation.
 *
 * Auth: Required (must belong to same organization)
 * Returns: Workflow JSON from n8n
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

    // 3. Get workflow from n8n if it has a workflow ID
    if (!automation.n8nWorkflowId) {
      // Return workflow from metadata if no n8n ID
      if (automation.metadata?.workflowJson) {
        return NextResponse.json({
          success: true,
          workflow: automation.metadata.workflowJson,
        });
      }

      return NextResponse.json(
        { error: 'Not found', details: 'No workflow configured for this automation' },
        { status: 404 }
      );
    }

    // 4. Fetch workflow from n8n
    const n8nWorkflow = await n8nService.getWorkflow(automation.n8nWorkflowId);

    // 5. Return workflow JSON
    return NextResponse.json({
      success: true,
      workflow: {
        name: n8nWorkflow.name,
        nodes: n8nWorkflow.nodes,
        connections: n8nWorkflow.connections,
      },
    });

  } catch (error) {
    console.error('[API /api/automations/[id]/workflow GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch workflow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
