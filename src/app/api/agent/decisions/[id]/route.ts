import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

// ============================================================================
// Validation Schemas
// ============================================================================

const paramsSchema = z.object({
  id: z.string().min(1, "Decision ID is required"),
});

// ============================================================================
// GET /api/agent/decisions/[id] - Get single decision details
// ============================================================================

/**
 * GET /api/agent/decisions/[id]
 *
 * Retrieves detailed information about a specific agent decision.
 *
 * Path parameters:
 * - id: The decision ID
 *
 * Returns:
 * - 200: Decision details
 * - 400: Invalid decision ID
 * - 401: Unauthorized
 * - 403: Forbidden (decision belongs to different organization)
 * - 404: Decision not found
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to view decision details.",
        },
        { status: 401 }
      );
    }

    // Get user to determine org context
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, orgId: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Validate params
    const { id } = await params;
    const parsedParams = paramsSchema.safeParse({ id });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid decision ID",
          details: parsedParams.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Fetch the decision with all related data
    const decision = await prisma.agentDecision.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            llmProvider: true,
            llmModel: true,
            temperature: true,
            maxTokens: true,
            isActive: true,
            canAssignPipelines: true,
            canCreateEvents: true,
            canSendNotifications: true,
            canTriggerAutomations: true,
            totalDecisions: true,
            successfulDecisions: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!decision) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision not found",
          details: `No decision found with ID: ${parsedParams.data.id}`,
        },
        { status: 404 }
      );
    }

    // Check if user has access to this decision (must be in same org)
    if (user.orgId && decision.orgId !== user.orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "You do not have access to this decision.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        decision: {
          id: decision.id,
          agentId: decision.agentId,
          orgId: decision.orgId,
          inputSource: decision.inputSource,
          inputType: decision.inputType,
          inputData: decision.inputData,
          llmPrompt: decision.llmPrompt,
          llmResponse: decision.llmResponse,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          decisionType: decision.decisionType,
          actions: decision.actions,
          status: decision.status,
          executionTime: decision.executionTime,
          errorMessage: decision.errorMessage,
          createdAt: decision.createdAt.toISOString(),
          executedAt: decision.executedAt?.toISOString() || null,
          agent: decision.agent,
          organization: decision.organization,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Decisions] Error fetching decision:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
