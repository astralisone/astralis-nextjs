import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { DecisionStatus, Prisma } from "@prisma/client";
import {
  ActionExecutor,
  createActionExecutor,
} from "@/lib/agent/core";
import type { AgentAction } from "@/lib/agent/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const paramsSchema = z.object({
  id: z.string().min(1, "Decision ID is required"),
});

// ============================================================================
// POST /api/agent/decisions/[id]/approve - Approve a pending decision
// ============================================================================

/**
 * POST /api/agent/decisions/[id]/approve
 *
 * Approves a pending decision and executes its actions.
 *
 * Path parameters:
 * - id: The decision ID
 *
 * Returns:
 * - 200: Decision approved and executed
 * - 400: Decision cannot be approved (not in pending/requires_approval state)
 * - 401: Unauthorized
 * - 403: Forbidden (decision belongs to different organization)
 * - 404: Decision not found
 * - 500: Server error
 */
export async function POST(
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
          details: "Authentication required to approve decisions.",
        },
        { status: 401 }
      );
    }

    // Get user to determine org context and permissions
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, orgId: true, role: true, name: true },
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

    // Fetch the decision
    const decision = await prisma.agentDecision.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            orgId: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
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

    // Check if decision can be approved
    const approvableStatuses: DecisionStatus[] = [
      DecisionStatus.PENDING,
      DecisionStatus.REQUIRES_APPROVAL,
    ];

    if (!approvableStatuses.includes(decision.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision cannot be approved",
          details: `Decision is in '${decision.status}' status. Only PENDING or REQUIRES_APPROVAL decisions can be approved.`,
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let executionErrors: string[] = [];
    let executionResults: unknown[] = [];

    // Execute the decision's actions
    try {
      const actionExecutor = createActionExecutor({
        orgId: decision.orgId,
        dryRun: false,
      });

      const actions = decision.actions as unknown as AgentAction[];

      const outcome = await actionExecutor.execute(actions, {
        executionId: decision.id,
        correlationId: decision.id,
        dryRun: false,
      });

      executionResults = outcome.results;
      executionErrors = outcome.errors.map((e) => e.message);

      // Update decision status based on execution outcome
      const newStatus =
        outcome.errors.length === 0 && outcome.status === DecisionStatus.EXECUTED
          ? DecisionStatus.EXECUTED
          : DecisionStatus.FAILED;

      const executionTime = Date.now() - startTime;

      const updatedDecision = await prisma.agentDecision.update({
        where: { id: decision.id },
        data: {
          status: newStatus,
          executionTime,
          executedAt: new Date(),
          errorMessage:
            executionErrors.length > 0 ? executionErrors.join("; ") : null,
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              llmProvider: true,
              llmModel: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update agent statistics
      await prisma.orchestrationAgent.update({
        where: { id: decision.agentId },
        data: {
          ...(newStatus === DecisionStatus.EXECUTED && {
            successfulDecisions: { increment: 1 },
          }),
        },
      });

      console.log(
        `[Agent Decisions] Decision approved and executed: ${decision.id} by ${user.name} (status: ${newStatus})`
      );

      return NextResponse.json(
        {
          success: true,
          message: "Decision approved and executed successfully",
          decision: {
            id: updatedDecision.id,
            status: updatedDecision.status,
            executionTime: updatedDecision.executionTime,
            executedAt: updatedDecision.executedAt?.toISOString(),
            errorMessage: updatedDecision.errorMessage,
            agent: updatedDecision.agent,
            organization: updatedDecision.organization,
          },
          execution: {
            results: executionResults,
            errors: executionErrors,
          },
          approvedBy: {
            id: user.id,
            name: user.name,
          },
        },
        { status: 200 }
      );
    } catch (execError) {
      // Mark decision as failed if execution throws
      const executionTime = Date.now() - startTime;
      const errorMessage =
        execError instanceof Error ? execError.message : "Unknown execution error";

      await prisma.agentDecision.update({
        where: { id: decision.id },
        data: {
          status: DecisionStatus.FAILED,
          executionTime,
          executedAt: new Date(),
          errorMessage,
        },
      });

      console.error(
        `[Agent Decisions] Decision execution failed: ${decision.id}`,
        execError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Execution failed",
          details: errorMessage,
          decision: {
            id: decision.id,
            status: DecisionStatus.FAILED,
            executionTime,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Agent Decisions] Error approving decision:", error);
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
