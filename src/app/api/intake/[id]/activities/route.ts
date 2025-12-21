import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";

/**
 * GET /api/intake/[id]/activities
 * Fetch all activities related to an intake request
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Get ActivityLogs for this intake
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        entity: "INTAKE",
        entityId: id,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Get Tasks created from this intake
    const tasks = await prisma.task.findMany({
      where: {
        sourceId: id,
      },
      include: {
        decisionLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // 3. Flatten into a unified timeline
    const activities: any[] = [];

    // Add ActivityLogs
    activityLogs.forEach((log) => {
      activities.push({
        id: log.id,
        type: "LOG",
        action: log.action,
        timestamp: log.createdAt,
        user: log.user?.name || "System",
        details: log.metadata || {},
      });
    });

    // Add Task activities
    tasks.forEach((task) => {
      activities.push({
        id: task.id,
        type: "TASK_CREATED",
        action: "TASK_CREATED",
        timestamp: task.createdAt,
        details: {
          taskId: task.id,
          title: task.title,
          status: task.status,
        },
      });

      // Add DecisionLogs for each task
      task.decisionLogs.forEach((decision) => {
        activities.push({
          id: decision.id,
          type: "AGENT_DECISION",
          action: decision.eventName,
          timestamp: decision.createdAt,
          details: {
            reasoning: (decision.decision as any)?.reasoning,
            actions: (decision.decision as any)?.actions,
          },
        });
      });
    });

    // Sort all by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching intake activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
