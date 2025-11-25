import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emitTaskReprocessRequested } from "@/lib/events/taskEvents";

const reprocessRequestSchema = z.object({
  requestedByUserId: z.string().min(1),
  reason: z.string().optional(),
});

/**
 * POST /api/tasks/[id]/reprocess
 * Request that the BaseTaskAgent reprocess this task
 *
 * Use cases:
 * - After manually correcting task data, ask agent to re-evaluate
 * - After resolving a BLOCKED state, trigger agent to continue
 * - Force agent to reconsider its last decision
 *
 * The agent will:
 * 1. Receive task:reprocess_requested event
 * 2. Load current task state
 * 3. Make a fresh decision based on current context
 * 4. Execute appropriate actions
 *
 * Note: If task has override flag set, agent will still emit NO_OP.
 * Clear override first if you want agent to take action.
 *
 * Emits: task:reprocess_requested event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = reprocessRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { requestedByUserId, reason } = parsed.data;

    // Fetch task to verify existence and get org context
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        orgId: true,
        status: true,
        overridden: true,
        templateId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: requestedByUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Emit task:reprocess_requested event
    await emitTaskReprocessRequested(
      id,
      requestedByUserId,
      task.orgId,
      { correlationId: id, metadata: { reason } }
    );

    // Add a note to task data about the reprocess request
    const currentData = (task as any).data || {};
    await prisma.task.update({
      where: { id },
      data: {
        data: {
          ...currentData,
          reprocessRequests: [
            ...(currentData.reprocessRequests || []),
            {
              requestedByUserId,
              requestedAt: new Date().toISOString(),
              reason,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: task.overridden
        ? "Reprocess requested, but task has override flag set. Agent will emit NO_OP. Clear override to allow agent processing."
        : "Reprocess request sent to BaseTaskAgent. Agent will re-evaluate task shortly.",
      task: {
        id: task.id,
        status: task.status,
        overridden: task.overridden,
      },
    });
  } catch (error) {
    console.error("Error requesting task reprocess:", error);
    return NextResponse.json(
      {
        error: "Failed to request task reprocess",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
