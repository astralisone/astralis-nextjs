import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { automationService } from '@/lib/services/automation.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for template deployment
const deployTemplateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Helper function to determine trigger type from n8n workflow JSON
 */
function inferTriggerType(workflowJson: any): {
  triggerType: 'WEBHOOK' | 'SCHEDULE' | 'EVENT' | 'MANUAL';
  triggerConfig: any;
} {
  const nodes = workflowJson?.nodes || [];

  // Check for webhook node
  const hasWebhook = nodes.some((node: any) =>
    node.type === 'n8n-nodes-base.webhook'
  );
  if (hasWebhook) {
    return { triggerType: 'WEBHOOK', triggerConfig: {} };
  }

  // Check for cron/schedule node
  const hasCron = nodes.some((node: any) =>
    node.type === 'n8n-nodes-base.cron' || node.type === 'n8n-nodes-base.schedule'
  );
  if (hasCron) {
    const cronNode = nodes.find((node: any) =>
      node.type === 'n8n-nodes-base.cron' || node.type === 'n8n-nodes-base.schedule'
    );
    return {
      triggerType: 'SCHEDULE',
      triggerConfig: {
        cronSchedule: cronNode?.parameters?.cronExpression || '0 9 * * *'
      }
    };
  }

  // Default to MANUAL
  return { triggerType: 'MANUAL', triggerConfig: {} };
}

/**
 * POST /api/automations/templates/[id]/deploy
 *
 * Deploy a template as a new automation for the user's organization.
 *
 * Body: {
 *   name?: string (override template name)
 *   description?: string (override template description)
 *   tags?: string[] (custom tags)
 * }
 *
 * Auth: Required (ADMIN or OPERATOR)
 * Returns: Created automation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('[DEPLOY] Starting deployment for template:', id);

  try {
    // 1. Verify authentication
    console.log('[DEPLOY] Step 1: Checking authentication...');
    const session = await auth();
    console.log('[DEPLOY] Session:', session ? `User ${session.user?.id}, Org ${session.user?.orgId}` : 'None');

    if (!session?.user?.id) {
      console.log('[DEPLOY] ERROR: No session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.orgId) {
      console.log('[DEPLOY] ERROR: No organization ID');
      return NextResponse.json(
        { error: 'Forbidden', details: 'Organization required' },
        { status: 403 }
      );
    }

    // 2. Validate input (body is optional since all fields are optional)
    console.log('[DEPLOY] Step 2: Parsing request body...');
    let body = {};
    try {
      const text = await req.text();
      console.log('[DEPLOY] Request text length:', text.length);
      if (text) {
        body = JSON.parse(text);
        console.log('[DEPLOY] Parsed body:', body);
      } else {
        console.log('[DEPLOY] Empty body, using defaults');
      }
    } catch (err) {
      console.log('[DEPLOY] Body parsing error (using defaults):', err);
    }

    const parsed = deployTemplateSchema.safeParse(body);
    console.log('[DEPLOY] Validation result:', parsed.success ? 'Valid' : 'Invalid');

    if (!parsed.success) {
      console.log('[DEPLOY] Validation errors:', parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Get template from database
    console.log('[DEPLOY] Step 3: Fetching template from database...');
    const template = await prisma.automationTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        n8nWorkflowJson: true,
        tags: true,
        requiredIntegrations: true,
      },
    });
    console.log('[DEPLOY] Template found:', template ? template.name : 'Not found');

    if (!template) {
      console.log('[DEPLOY] ERROR: Template not found in database');
      return NextResponse.json(
        { error: 'Not found', details: 'Template not found' },
        { status: 404 }
      );
    }

    // 4. Parse workflow JSON and infer trigger type
    console.log('[DEPLOY] Step 4: Parsing workflow JSON...');
    let workflowJson: any;
    try {
      workflowJson = JSON.parse(template.n8nWorkflowJson);
      console.log('[DEPLOY] Workflow JSON parsed successfully, nodes:', workflowJson?.nodes?.length || 0);
    } catch (err) {
      console.log('[DEPLOY] ERROR: Failed to parse workflow JSON:', err);
      return NextResponse.json(
        { error: 'Invalid template', details: 'Failed to parse workflow JSON' },
        { status: 500 }
      );
    }

    const { triggerType, triggerConfig } = inferTriggerType(workflowJson);
    console.log('[DEPLOY] Inferred trigger type:', triggerType);

    // 5. Increment template use count
    console.log('[DEPLOY] Step 5: Incrementing use count...');
    await prisma.automationTemplate.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });

    // 6. Create automation from template
    console.log('[DEPLOY] Step 6: Creating automation...');
    const automationData = {
      name: parsed.data.name || template.name,
      description: parsed.data.description || template.description,
      triggerType,
      triggerConfig,
      workflowJson,
      tags: parsed.data.tags || template.tags,
      orgId: session.user.orgId,
      createdById: session.user.id,
      metadata: {
        deployedFromTemplate: template.id,
        requiredIntegrations: template.requiredIntegrations,
      },
    };
    console.log('[DEPLOY] Automation data:', JSON.stringify(automationData, null, 2));

    const automation = await automationService.createAutomation(automationData);
    console.log('[DEPLOY] Automation created:', automation.id);

    // 7. Return created automation
    const response = {
      success: true,
      data: automation,
      automationId: automation.id,
      message: 'Template deployed successfully',
    };
    console.log('[DEPLOY] Returning success response');
    return NextResponse.json(response);

  } catch (error) {
    console.error('[DEPLOY] FATAL ERROR:', error);
    console.error('[DEPLOY] Error type:', typeof error);
    console.error('[DEPLOY] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[DEPLOY] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[DEPLOY] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to deploy template',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
