import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DashboardData, ActivityItem, ActivityType } from "@/types/dashboard";

/**
 * GET /api/dashboard/stats
 *
 * Fetches dashboard statistics and recent activity
 * Returns aggregated data for metrics cards, activity feed, and recent pipelines
 */
export async function GET(req: NextRequest) {
  try {
    // Get date 30 days ago for comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel queries for better performance
    const [
      pipelinesTotal,
      pipelinesActive,
      pipelinesLast30Days,
      intakeTotal,
      intakePending,
      intakeLast30Days,
      recentPipelines,
      activityLogs,
    ] = await Promise.all([
      // Pipeline stats
      prisma.pipeline.count(),
      prisma.pipeline.count({ where: { isActive: true } }),
      prisma.pipeline.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // Intake stats
      prisma.intakeRequest.count(),
      prisma.intakeRequest.count({
        where: { status: { in: ["NEW", "ASSIGNED"] } },
      }),
      prisma.intakeRequest.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // Recent pipelines with stage and item counts
      prisma.pipeline.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          stages: {
            include: {
              _count: {
                select: { items: true },
              },
            },
          },
        },
      }),

      // Recent activity from ActivityLog
      prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, last30Days: number): number => {
      if (current === 0) return 0;
      const previous = current - last30Days;
      if (previous === 0) return 100;
      return Math.round(((last30Days / previous) * 100) - 100);
    };

    // Map recent pipelines to response format
    const mappedPipelines = recentPipelines.map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      isActive: pipeline.isActive,
      stageCount: pipeline.stages.length,
      itemCount: pipeline.stages.reduce(
        (sum, stage) => sum + stage._count.items,
        0
      ),
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
    }));

    // Map activity logs to activity items
    const mappedActivity: ActivityItem[] = activityLogs.map((log) => {
      let type: ActivityType = "pipeline_created";
      let title = "System Activity";
      let description = "";

      // Map action to activity type and generate readable descriptions
      switch (log.action) {
        case "CREATE":
          if (log.entity === "PIPELINE") {
            type = "pipeline_created";
            title = "New Pipeline Created";
            description = `Pipeline "${log.entityId}" was created`;
          } else if (log.entity === "INTAKE") {
            type = "intake_received";
            title = "New Intake Request";
            description = "A new intake request was received";
          } else if (log.entity === "EVENT") {
            type = "event_scheduled";
            title = "Event Scheduled";
            description = "A new event was scheduled";
          }
          break;
        case "UPDATE":
          if (log.entity === "INTAKE") {
            type = "intake_assigned";
            title = "Intake Request Updated";
            description = "An intake request was assigned to a pipeline";
          } else if (log.entity === "PIPELINE") {
            type = "pipeline_created";
            title = "Pipeline Updated";
            description = `Pipeline was modified`;
          }
          break;
        case "DELETE":
          title = `${log.entity} Deleted`;
          description = `A ${log.entity.toLowerCase()} was deleted`;
          break;
        default:
          title = log.action;
          description = `${log.entity} ${log.action.toLowerCase()}`;
      }

      return {
        id: log.id,
        type,
        title,
        description,
        timestamp: log.createdAt,
        user: log.user
          ? {
              id: log.user.id,
              name: log.user.name,
              avatar: log.user.avatar,
            }
          : undefined,
        metadata: log.metadata as Record<string, unknown> | undefined,
      };
    });

    // Construct response
    const dashboardData: DashboardData = {
      stats: {
        pipelines: {
          total: pipelinesTotal,
          active: pipelinesActive,
          change: calculateChange(pipelinesTotal, pipelinesLast30Days),
        },
        intake: {
          total: intakeTotal,
          pending: intakePending,
          change: calculateChange(intakeTotal, intakeLast30Days),
        },
        documents: {
          total: 0, // TODO: Add document model queries when available
          processing: 0,
          change: 0,
        },
        events: {
          total: 0, // TODO: Add event model queries when available
          upcoming: 0,
          change: 0,
        },
      },
      recentActivity: mappedActivity,
      recentPipelines: mappedPipelines,
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
