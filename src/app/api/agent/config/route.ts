import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// =============================================================================
// Zod Schemas for Request Validation
// =============================================================================

/**
 * Schema for creating or updating agent configuration.
 * All fields are optional for PATCH-like behavior; llmProvider and llmModel
 * are required for initial creation.
 */
const agentConfigInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  llmProvider: z.enum(['OPENAI', 'CLAUDE']),
  llmModel: z.string().min(1).max(50),
  systemPrompt: z.string().max(10000).optional(),
  temperature: z.number().min(0).max(2).optional().default(0.3),
  maxTokens: z.number().int().min(1).max(100000).optional().default(2000),
  isActive: z.boolean().optional().default(true),
  canAssignPipelines: z.boolean().optional().default(true),
  canCreateEvents: z.boolean().optional().default(true),
  canSendNotifications: z.boolean().optional().default(true),
  canTriggerAutomations: z.boolean().optional().default(true),
  maxActionsPerMinute: z.number().int().min(1).max(1000).optional().default(60),
  maxActionsPerHour: z.number().int().min(1).max(10000).optional().default(500),
});

type AgentConfigInput = z.infer<typeof agentConfigInputSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the organization ID from the session.
 * Returns null if not authenticated or no org ID.
 *
 * Note: This is a placeholder implementation. In production, this should
 * use proper session management with NextAuth or similar.
 */
async function getOrgIdFromSession(): Promise<{
  orgId: string | null;
  userId: string | null;
  error: string | null;
  statusCode: number;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        orgId: null,
        userId: null,
        error: 'Authentication required',
        statusCode: 401,
      };
    }

    if (!session.user.orgId) {
      return {
        orgId: null,
        userId: session.user.id,
        error: 'Organization required',
        statusCode: 403,
      };
    }

    return {
      orgId: session.user.orgId,
      userId: session.user.id,
      error: null,
      statusCode: 200,
    };
  } catch (error) {
    console.error('[getOrgIdFromSession] Error:', error);
    return {
      orgId: null,
      userId: null,
      error: 'Failed to retrieve session',
      statusCode: 500,
    };
  }
}

// =============================================================================
// GET /api/agent/config
// =============================================================================

/**
 * GET /api/agent/config
 *
 * Retrieve the current agent configuration for the authenticated user's organization.
 *
 * Auth: Required (session.user.orgId)
 * Returns: AgentConfig or null if no config exists
 *
 * Response:
 * - 200: { success: true, data: AgentConfig }
 * - 200: { success: true, data: null } (no config exists)
 * - 401: { error: 'Unauthorized', details: string }
 * - 403: { error: 'Forbidden', details: string }
 * - 500: { error: string, details: string }
 */
export async function GET(_req: NextRequest) {
  try {
    // 1. Verify authentication and get org ID
    const { orgId, error, statusCode } = await getOrgIdFromSession();

    if (error || !orgId) {
      return NextResponse.json(
        { error: statusCode === 401 ? 'Unauthorized' : 'Forbidden', details: error },
        { status: statusCode }
      );
    }

    // 2. Fetch the agent configuration for this organization
    const agentConfig = await prisma.orchestrationAgent.findFirst({
      where: {
        orgId,
      },
      select: {
        id: true,
        orgId: true,
        name: true,
        llmProvider: true,
        llmModel: true,
        systemPrompt: true,
        temperature: true,
        maxTokens: true,
        isActive: true,
        canAssignPipelines: true,
        canCreateEvents: true,
        canSendNotifications: true,
        canTriggerAutomations: true,
        maxActionsPerMinute: true,
        maxActionsPerHour: true,
        totalDecisions: true,
        successfulDecisions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 3. Return the configuration (or null if not found)
    return NextResponse.json({
      success: true,
      data: agentConfig,
    });
  } catch (error) {
    console.error('[API /api/agent/config GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch agent configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/agent/config
// =============================================================================

/**
 * POST /api/agent/config
 *
 * Create or update (upsert) the agent configuration for the authenticated
 * user's organization. Only one agent config is allowed per organization.
 *
 * Request Body: AgentConfigInput {
 *   name?: string;
 *   llmProvider: 'OPENAI' | 'CLAUDE';
 *   llmModel: string;
 *   systemPrompt?: string;
 *   temperature?: number;
 *   maxTokens?: number;
 *   isActive?: boolean;
 *   canAssignPipelines?: boolean;
 *   canCreateEvents?: boolean;
 *   canSendNotifications?: boolean;
 *   canTriggerAutomations?: boolean;
 *   maxActionsPerMinute?: number;
 *   maxActionsPerHour?: number;
 * }
 *
 * Auth: Required (session.user.orgId)
 * Returns: Created or updated AgentConfig
 *
 * Response:
 * - 200: { success: true, data: AgentConfig, created: false } (updated)
 * - 201: { success: true, data: AgentConfig, created: true } (created)
 * - 400: { error: 'Validation failed', details: object }
 * - 401: { error: 'Unauthorized', details: string }
 * - 403: { error: 'Forbidden', details: string }
 * - 500: { error: string, details: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication and get org ID
    const { orgId, error, statusCode } = await getOrgIdFromSession();

    if (error || !orgId) {
      return NextResponse.json(
        { error: statusCode === 401 ? 'Unauthorized' : 'Forbidden', details: error },
        { status: statusCode }
      );
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    const parsed = agentConfigInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: AgentConfigInput = parsed.data;

    // 3. Check if an agent config already exists for this org
    const existingConfig = await prisma.orchestrationAgent.findFirst({
      where: { orgId },
      select: { id: true },
    });

    // 4. Build the data object for upsert
    const configData = {
      name: input.name || 'Orchestration Agent',
      llmProvider: input.llmProvider,
      llmModel: input.llmModel,
      systemPrompt: input.systemPrompt || '',
      temperature: input.temperature ?? 0.3,
      maxTokens: input.maxTokens ?? 2000,
      isActive: input.isActive ?? true,
      canAssignPipelines: input.canAssignPipelines ?? true,
      canCreateEvents: input.canCreateEvents ?? true,
      canSendNotifications: input.canSendNotifications ?? true,
      canTriggerAutomations: input.canTriggerAutomations ?? true,
      maxActionsPerMinute: input.maxActionsPerMinute ?? 60,
      maxActionsPerHour: input.maxActionsPerHour ?? 500,
    };

    let agentConfig;
    let created = false;

    if (existingConfig) {
      // 5a. Update existing configuration
      agentConfig = await prisma.orchestrationAgent.update({
        where: { id: existingConfig.id },
        data: {
          ...configData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          orgId: true,
          name: true,
          llmProvider: true,
          llmModel: true,
          systemPrompt: true,
          temperature: true,
          maxTokens: true,
          isActive: true,
          canAssignPipelines: true,
          canCreateEvents: true,
          canSendNotifications: true,
          canTriggerAutomations: true,
          maxActionsPerMinute: true,
          maxActionsPerHour: true,
          totalDecisions: true,
          successfulDecisions: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      // 5b. Create new configuration
      agentConfig = await prisma.orchestrationAgent.create({
        data: {
          ...configData,
          orgId,
          totalDecisions: 0,
          successfulDecisions: 0,
        },
        select: {
          id: true,
          orgId: true,
          name: true,
          llmProvider: true,
          llmModel: true,
          systemPrompt: true,
          temperature: true,
          maxTokens: true,
          isActive: true,
          canAssignPipelines: true,
          canCreateEvents: true,
          canSendNotifications: true,
          canTriggerAutomations: true,
          maxActionsPerMinute: true,
          maxActionsPerHour: true,
          totalDecisions: true,
          successfulDecisions: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      created = true;
    }

    // 6. Return the created/updated configuration
    return NextResponse.json(
      {
        success: true,
        data: agentConfig,
        created,
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    console.error('[API /api/agent/config POST] Error:', error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            error: 'Configuration already exists',
            details: 'An agent configuration already exists for this organization',
          },
          { status: 409 }
        );
      }

      // Check for foreign key constraint (invalid orgId)
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            error: 'Invalid organization',
            details: 'The specified organization does not exist',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to save agent configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
