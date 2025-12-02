import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emitTaskOverrideSet } from "@/lib/events/taskEvents";

const setOverrideSchema = z.object({
  overridden: z.boolean(),
  reason: z.string().optional(),
  byUserId: z.string().optional(),
});

/**
 * POST /api/tasks/[id]/override
 * Set or clear the human override flag on a task
 *
 * When overridden = true:
 * - The BaseTaskAgent will stop processing this task
 * - Agent will emit NO_OP actions when receiving events for this task
 * - Human operators take full control
 *
 * When overridden = false:
 * - The BaseTaskAgent resumes processing
 * - Can be used to hand back control to the agent
 *
 * Emits: task:override_set event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = setOverrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { overridden, reason, byUserId } = parsed.data;

    // Fetch current task
    const currentTask = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        orgId: true,
        overridden: true,
      },
    });

    if (!currentTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Update override flag
    const task = await prisma.task.update({
      where: { id },
      data: {
        overridden,
        overrideReason: reason,
        overrideByUserId: byUserId,
        overrideAt: overridden ? new Date() : null,
      },
      include: {
        template: true,
        pipeline: true,
        stage: true,
      },
    });

    // Emit task:override_set event
    await emitTaskOverrideSet(
      id,
      {
        overridden,
        reason: reason || null,
        byUserId: byUserId || null,
        at: task.overrideAt?.toISOString() || null,
      },
      currentTask.orgId,
      { correlationId: id }
    );

    return NextResponse.json({
      task,
      message: overridden
        ? "Task override set - agent processing paused"
        : "Task override cleared - agent processing resumed",
    });
  } catch (error) {
    console.error("Error setting task override:", error);
    return NextResponse.json(
      {
        error: "Failed to set task override",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
