import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import {
  AgentInputSource,
  DecisionStatus,
  DecisionType,
  Prisma,
} from "@prisma/client";

// Force dynamic rendering - this route requires database access
export const dynamic = 'force-dynamic';

// ============================================================================
// Validation Schemas
// ============================================================================

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  agentId: z.string().optional(),
});

// ============================================================================
// GET /api/agent/analytics - Get agent performance metrics
// ============================================================================

/**
 * GET /api/agent/analytics
 *
 * Retrieves comprehensive performance metrics for the orchestration agent.
 *
 * Query parameters:
 * - startDate: Start of the period (ISO datetime)
 * - endDate: End of the period (ISO datetime)
 * - agentId: Filter by specific agent ID
 *
 * Returns:
 * - 200: Analytics data including:
 *   - totalDecisions
 *   - successRate
 *   - avgConfidence
 *   - decisionsByType
 *   - decisionsBySource
 *   - decisionsByStatus
 *   - trendsOverTime
 * - 400: Invalid query parameters
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to view analytics.",
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

    // Parse query parameters
    const { searchParams } = req.nextUrl;
    const params = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      agentId: searchParams.get("agentId") || undefined,
    };

    const parsed = analyticsQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, agentId } = parsed.data;

    // Build where clause
    const where: Prisma.AgentDecisionWhereInput = {};

    // Scope to user's organization if they have one
    if (user.orgId) {
      where.orgId = user.orgId;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    // Default to last 30 days if no date range specified
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = endDate ? new Date(endDate) : new Date();

    where.createdAt = {
      gte: periodStart,
      lte: periodEnd,
    };

    // Fetch all decisions in the period
    const decisions = await prisma.agentDecision.findMany({
      where,
      select: {
        id: true,
        inputSource: true,
        decisionType: true,
        status: true,
        confidence: true,
        executionTime: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalDecisions = decisions.length;
    const successfulDecisions = decisions.filter(
      (d) => d.status === DecisionStatus.EXECUTED
    ).length;
    const failedDecisions = decisions.filter(
      (d) => d.status === DecisionStatus.FAILED
    ).length;
    const pendingDecisions = decisions.filter(
      (d) =>
        d.status === DecisionStatus.PENDING ||
        d.status === DecisionStatus.REQUIRES_APPROVAL
    ).length;
    const rejectedDecisions = decisions.filter(
      (d) => d.status === DecisionStatus.REJECTED
    ).length;

    // Success rate (excluding pending)
    const completedDecisions = totalDecisions - pendingDecisions;
    const successRate =
      completedDecisions > 0
        ? Math.round((successfulDecisions / completedDecisions) * 100 * 100) / 100
        : 0;

    // Average confidence
    const avgConfidence =
      totalDecisions > 0
        ? Math.round(
            (decisions.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions) *
              100
          ) / 100
        : 0;

    // Average execution time (for executed decisions)
    const executedDecisions = decisions.filter(
      (d) => d.executionTime !== null
    );
    const avgExecutionTime =
      executedDecisions.length > 0
        ? Math.round(
            executedDecisions.reduce((sum, d) => sum + (d.executionTime || 0), 0) /
              executedDecisions.length
          )
        : 0;

    // Decisions by type
    const decisionsByType: Record<string, number> = {};
    for (const type of Object.values(DecisionType)) {
      decisionsByType[type] = decisions.filter(
        (d) => d.decisionType === type
      ).length;
    }

    // Decisions by source
    const decisionsBySource: Record<string, number> = {};
    for (const source of Object.values(AgentInputSource)) {
      decisionsBySource[source] = decisions.filter(
        (d) => d.inputSource === source
      ).length;
    }

    // Decisions by status
    const decisionsByStatus: Record<string, number> = {
      EXECUTED: successfulDecisions,
      FAILED: failedDecisions,
      PENDING: decisions.filter((d) => d.status === DecisionStatus.PENDING).length,
      REQUIRES_APPROVAL: decisions.filter(
        (d) => d.status === DecisionStatus.REQUIRES_APPROVAL
      ).length,
      REJECTED: rejectedDecisions,
    };

    // Trends over time (daily aggregation)
    const trendsOverTime: Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
      avgConfidence: number;
    }> = [];

    // Group decisions by day
    const decisionsByDay = new Map<
      string,
      {
        total: number;
        successful: number;
        failed: number;
        confidenceSum: number;
      }
    >();

    for (const decision of decisions) {
      const dayKey = decision.createdAt.toISOString().split("T")[0];
      const existing = decisionsByDay.get(dayKey) || {
        total: 0,
        successful: 0,
        failed: 0,
        confidenceSum: 0,
      };

      existing.total++;
      existing.confidenceSum += decision.confidence;

      if (decision.status === DecisionStatus.EXECUTED) {
        existing.successful++;
      } else if (decision.status === DecisionStatus.FAILED) {
        existing.failed++;
      }

      decisionsByDay.set(dayKey, existing);
    }

    // Sort by date and build trends array
    const sortedDays = Array.from(decisionsByDay.entries()).sort(
      (a, b) => a[0].localeCompare(b[0])
    );

    for (const [date, stats] of sortedDays) {
      trendsOverTime.push({
        date,
        total: stats.total,
        successful: stats.successful,
        failed: stats.failed,
        avgConfidence:
          Math.round((stats.confidenceSum / stats.total) * 100) / 100,
      });
    }

    // Get top performing agent (if multiple agents exist)
    const agentStats = await prisma.orchestrationAgent.findMany({
      where: user.orgId ? { orgId: user.orgId, isActive: true } : { isActive: true },
      select: {
        id: true,
        name: true,
        llmProvider: true,
        llmModel: true,
        totalDecisions: true,
        successfulDecisions: true,
      },
      orderBy: { successfulDecisions: "desc" },
      take: 5,
    });

    // Calculate agent success rates
    const agentPerformance = agentStats.map((agent) => ({
      id: agent.id,
      name: agent.name,
      provider: agent.llmProvider,
      model: agent.llmModel,
      totalDecisions: agent.totalDecisions,
      successfulDecisions: agent.successfulDecisions,
      successRate:
        agent.totalDecisions > 0
          ? Math.round(
              (agent.successfulDecisions / agent.totalDecisions) * 100 * 100
            ) / 100
          : 0,
    }));

    return NextResponse.json(
      {
        success: true,
        analytics: {
          period: {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
          },
          summary: {
            totalDecisions,
            successfulDecisions,
            failedDecisions,
            pendingDecisions,
            rejectedDecisions,
            successRate,
            avgConfidence,
            avgExecutionTime,
          },
          decisionsByType,
          decisionsBySource,
          decisionsByStatus,
          trendsOverTime,
          agentPerformance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Analytics] Error fetching analytics:", error);
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
