import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/dashboard/charts/pipeline-performance
 *
 * Returns pipeline performance data showing items per pipeline stage
 * Used for dashboard bar chart visualization
 *
 * @requires Authentication
 * @returns Array of pipeline performance metrics
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

    // Get pipelines with stage and item counts
    const pipelines = await prisma.pipeline.findMany({
      where: { orgId, isActive: true },
      include: {
        stages: {
          include: {
            _count: {
              select: { items: true },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to top 10 pipelines
    });

    // Transform data for bar chart
    const result = pipelines.map((pipeline) => ({
      name: pipeline.name.length > 20
        ? pipeline.name.substring(0, 20) + '...'
        : pipeline.name,
      value: pipeline.stages.reduce((sum, stage) => sum + stage._count.items, 0),
      stages: pipeline.stages.length,
    }));

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Dashboard pipeline performance error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pipeline performance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}