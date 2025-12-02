import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const decisionFiltersSchema = z.object({
  eventName: z.string().optional().nullable(),
  limit: z.string().optional().nullable(),
  offset: z.string().optional().nullable(),
});

/**
 * GET /api/decisions/[taskId]
 * Get decision log entries for a specific task
 *
 * Decision logs are the append-only audit trail of all decisions
 * made by the BaseTaskAgent for a task. Each entry includes:
 * - Event that triggered the decision
 * - Snapshot of task state at decision time
 * - LLM call metadata (model, tokens)
 * - Agent's reasoning
 * - Actions that were executed
 *
 * This is critical for:
 * - Debugging agent behavior
 * - Understanding why a task is in a certain state
 * - Auditing automated decisions
 * - Replaying task execution
 *
 * Query parameters:
 * - eventName: Filter by event type (e.g., task.created, task.status_changed)
 * - limit: Number of results (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const { searchParams } = req.nextUrl;
    const filters = {
      eventName: searchParams.get("eventName"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const parsed = decisionFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { eventName, limit: limitStr, offset: offsetStr } = parsed.data;
    const limit = parseInt(limitStr || "50");
    const offset = parseInt(offsetStr || "0");

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        status: true,
        templateId: true,
        orgId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const where: any = { taskId };

    if (eventName) {
      where.eventName = eventName;
    }

    const [decisions, total] = await Promise.all([
      prisma.decisionLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          template: {
            select: { id: true, label: true },
          },
        },
      }),
      prisma.decisionLog.count({ where }),
    ]);

    // Parse JSON fields for better readability
    const decisionsWithParsedData = decisions.map(decision => ({
      id: decision.id,
      taskId: decision.taskId,
      orgId: decision.orgId,
      templateId: decision.templateId,
      template: decision.template,
      eventName: decision.eventName,
      eventId: decision.eventId,
      agentConfigHash: decision.agentConfigHash,
      inputSnapshot: decision.inputSnapshot,
      llmCall: decision.llmCall,
      decision: decision.decision, // Contains { reasoning, actions[] }
      appliedAt: decision.appliedAt,
      createdAt: decision.createdAt,
    }));

    // Calculate statistics
    const eventBreakdown = decisions.reduce((acc, d) => {
      acc[d.eventName] = (acc[d.eventName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const actionBreakdown = decisions.reduce((acc, d) => {
      const decisionData = d.decision as any;
      if (decisionData?.actions) {
        decisionData.actions.forEach((action: any) => {
          acc[action.type] = (acc[action.type] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        templateId: task.templateId,
      },
      decisions: decisionsWithParsedData,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      statistics: {
        totalDecisions: total,
        eventBreakdown,
        actionBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching decision log:", error);
    return NextResponse.json(
      { error: "Failed to fetch decision log" },
      { status: 500 }
    );
  }
}
