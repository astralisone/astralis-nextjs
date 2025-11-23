import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { DecisionStatus } from "@prisma/client";

// ============================================================================
// Validation Schemas
// ============================================================================

const paramsSchema = z.object({
  id: z.string().min(1, "Decision ID is required"),
});

const rejectBodySchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

// ============================================================================
// POST /api/agent/decisions/[id]/reject - Reject a pending decision
// ============================================================================

/**
 * POST /api/agent/decisions/[id]/reject
 *
 * Rejects a pending decision.
 *
 * Path parameters:
 * - id: The decision ID
 *
 * Request body:
 * - reason: string - Reason for rejection
 *
 * Returns:
 * - 200: Decision rejected successfully
 * - 400: Decision cannot be rejected or invalid request body
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
          details: "Authentication required to reject decisions.",
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

    // Parse and validate request body
    const body = await req.json();
    const parsedBody = rejectBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsedBody.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { reason } = parsedBody.data;

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

    // Check if decision can be rejected
    const rejectableStatuses: DecisionStatus[] = [
      DecisionStatus.PENDING,
      DecisionStatus.REQUIRES_APPROVAL,
    ];

    if (!rejectableStatuses.includes(decision.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision cannot be rejected",
          details: `Decision is in '${decision.status}' status. Only PENDING or REQUIRES_APPROVAL decisions can be rejected.`,
        },
        { status: 400 }
      );
    }

    // Update decision status to rejected
    const updatedDecision = await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: DecisionStatus.REJECTED,
        errorMessage: `Rejected by ${user.name || user.id}: ${reason}`,
        executedAt: new Date(),
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

    console.log(
      `[Agent Decisions] Decision rejected: ${decision.id} by ${user.name} (reason: ${reason})`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Decision rejected successfully",
        decision: {
          id: updatedDecision.id,
          status: updatedDecision.status,
          decisionType: updatedDecision.decisionType,
          confidence: updatedDecision.confidence,
          errorMessage: updatedDecision.errorMessage,
          createdAt: updatedDecision.createdAt.toISOString(),
          executedAt: updatedDecision.executedAt?.toISOString(),
          agent: updatedDecision.agent,
          organization: updatedDecision.organization,
        },
        rejection: {
          reason,
          rejectedBy: {
            id: user.id,
            name: user.name,
          },
          rejectedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Decisions] Error rejecting decision:", error);
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
