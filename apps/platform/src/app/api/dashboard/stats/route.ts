import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DashboardData, ActivityItem, ActivityType } from "@/types/dashboard";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/dashboard/stats
 *
 * Fetches dashboard statistics and recent activity
 * Returns aggregated data for metrics cards, activity feed, and recent pipelines
 *
 * @requires Authentication
 * @returns DashboardData with org-scoped stats
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

    // Calculate date ranges for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Parallel queries for better performance (all scoped to orgId)
    const [
      pipelinesTotal,
      pipelinesActive,
      pipelinesLast30Days,
      pipelinesPrev30Days,
      intakeTotal,
      intakePending,
      intakeLast30Days,
      intakePrev30Days,
      documentsTotal,
      documentsProcessing,
      documentsLast30Days,
      documentsPrev30Days,
      eventsTotal,
      eventsUpcoming,
      eventsLast30Days,
      eventsPrev30Days,
      recentPipelines,
      activityLogs,
    ] = await Promise.all([
      // Pipeline stats
      prisma.pipeline.count({ where: { orgId } }),
      prisma.pipeline.count({ where: { orgId, isActive: true } }),
      prisma.pipeline.count({
        where: { orgId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.pipeline.count({
        where: { orgId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),

      // Intake stats
      prisma.intakeRequest.count({ where: { orgId } }),
      prisma.intakeRequest.count({
        where: { orgId, status: { in: ["NEW", "ASSIGNED"] } },
      }),
      prisma.intakeRequest.count({
        where: { orgId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.intakeRequest.count({
        where: { orgId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),

      // Document stats
      prisma.document.count({ where: { orgId } }),
      prisma.document.count({
        where: { orgId, status: "PROCESSING" },
      }),
      prisma.document.count({
        where: { orgId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.document.count({
        where: { orgId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),

      // Event stats
      prisma.schedulingEvent.count({ where: { orgId } }),
      prisma.schedulingEvent.count({
        where: {
          orgId,
          startTime: { gte: now },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.schedulingEvent.count({
        where: { orgId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.schedulingEvent.count({
        where: { orgId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),

      // Recent pipelines with stage and item counts
      prisma.pipeline.findMany({
        where: { orgId },
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
        where: { orgId },
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

    // Calculate percentage changes (last 30 days vs previous 30 days)
    const calculateChange = (last30Days: number, prev30Days: number): number => {
      // If no previous data, return 100% if we have new data, else 0%
      if (prev30Days === 0) {
        return last30Days > 0 ? 100 : 0;
      }
      // Calculate percentage change: ((new - old) / old) * 100
      return Math.round(((last30Days - prev30Days) / prev30Days) * 100);
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
          change: calculateChange(pipelinesLast30Days, pipelinesPrev30Days),
        },
        intake: {
          total: intakeTotal,
          pending: intakePending,
          change: calculateChange(intakeLast30Days, intakePrev30Days),
        },
        documents: {
          total: documentsTotal,
          processing: documentsProcessing,
          change: calculateChange(documentsLast30Days, documentsPrev30Days),
        },
        events: {
          total: eventsTotal,
          upcoming: eventsUpcoming,
          change: calculateChange(eventsLast30Days, eventsPrev30Days),
        },
      },
      recentActivity: mappedActivity,
      recentPipelines: mappedPipelines,
    };

    return NextResponse.json(dashboardData, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
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
