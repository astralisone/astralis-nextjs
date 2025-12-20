import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/dashboard/charts/agent-metrics
 *
 * Returns agent performance metrics and usage statistics
 * Shows agent decision counts and success rates over time
 *
 * @param range - Time range: '7d', '30d', '90d', '1y' (default: '30d')
 * @returns Array of agent performance data points
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Get user with org context
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, orgId: true },
    });

    if (!user || !user.orgId) {
      return NextResponse.json(
        { error: "User not found or not associated with an organization" },
        { status: 404 }
      );
    }

    const orgId = user.orgId;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    // Query agent metrics grouped by date using raw SQL for proper date truncation
    const agentTrends = await prisma.$queryRawUnsafe<Array<{ date: string; decisions: bigint; executions: bigint; successes: bigint }>>(
      `
      WITH decisions AS (
        SELECT DATE("createdAt") as d, COUNT(*) as c
        FROM "AgentDecision"
        WHERE "orgId" = $1 AND "createdAt" >= $2
        GROUP BY DATE("createdAt")
      ),
      executions AS (
        SELECT DATE("createdAt") as d, COUNT(*) as total, SUM(CASE WHEN "status" = 'COMPLETED' THEN 1 ELSE 0 END) as success
        FROM "WorkflowExecution"
        WHERE "orgId" = $1 AND "createdAt" >= $2
        GROUP BY DATE("createdAt")
      )
      SELECT 
        COALESCE(d.d, e.d)::text as date,
        COALESCE(d.c, 0) as decisions,
        COALESCE(e.total, 0) as executions,
        COALESCE(e.success, 0) as successes
      FROM decisions d
      FULL OUTER JOIN executions e ON d.d = e.d
      ORDER BY date ASC
      `,
      orgId,
      startDate
    );

    // Create record for fast lookup
    const dailyData: Record<string, { decisions: number; executions: number; successes: number }> = {};
    agentTrends.forEach((item) => {
      dailyData[item.date] = {
        decisions: Number(item.decisions),
        executions: Number(item.executions),
        successes: Number(item.successes),
      };
    });

    // Fill in missing dates and create result
    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const executions = dailyData[dateStr]?.executions || 0;
      const successes = dailyData[dateStr]?.successes || 0;
      const successRate = executions > 0 ? Math.round((successes / executions) * 100) : 0;

      result.push({
        date: dateStr,
        decisions: dailyData[dateStr]?.decisions || 0,
        executions: executions,
        successRate: successRate,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Agent metrics chart error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch agent metrics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}