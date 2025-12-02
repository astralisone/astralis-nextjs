import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import {
  emitTaskStatusChanged,
  emitTaskStageChanged,
  emitTaskAssigneeChanged,
} from "@/lib/events/taskEvents";

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "NEEDS_REVIEW", "BLOCKED", "DONE", "CANCELLED"]).optional(),
  pipelineKey: z.string().optional(),
  stageKey: z.string().optional(),
  assignedToUserId: z.string().nullable().optional(),
  data: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/tasks/[id]
 * Get a single task with all details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        template: true,
        pipeline: {
          include: {
            stages: {
              orderBy: { order: "asc" },
            },
          },
        },
        stage: true,
        decisionLogs: {
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 decisions
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task's properties
 *
 * Emits events when status, stage, or assignee changes.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch current task to detect changes
    const currentTask = await prisma.task.findUnique({
      where: { id },
      select: {
        status: true,
        stageKey: true,
        assignedToUserId: true,
        orgId: true,
        pipelineKey: true,
      },
    });

    if (!currentTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Build update data
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status as TaskStatus;
    if (parsed.data.data !== undefined) updateData.data = parsed.data.data;
    if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;
    if (parsed.data.assignedToUserId !== undefined) {
      updateData.assignedToUserId = parsed.data.assignedToUserId;
    }

    // Handle pipeline/stage changes
    if (parsed.data.pipelineKey !== undefined || parsed.data.stageKey !== undefined) {
      const newPipelineKey = parsed.data.pipelineKey || currentTask.pipelineKey;
      const newStageKey = parsed.data.stageKey;

      if (newPipelineKey && newStageKey) {
        const pipeline = await prisma.pipeline.findFirst({
          where: {
            orgId: currentTask.orgId,
            key: newPipelineKey,
          },
          include: {
            stages: {
              where: { key: newStageKey },
            },
          },
        });

        if (pipeline && pipeline.stages.length > 0) {
          updateData.pipelineId = pipeline.id;
          updateData.pipelineKey = newPipelineKey;
          updateData.stageId = pipeline.stages[0].id;
          updateData.stageKey = newStageKey;
        }
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
        pipeline: true,
        stage: true,
      },
    });

    // Emit events for changes
    const emitPromises: Promise<void>[] = [];

    // Status changed
    if (parsed.data.status && currentTask.status !== parsed.data.status) {
      emitPromises.push(
        emitTaskStatusChanged(
          id,
          currentTask.status as TaskStatus,
          parsed.data.status as TaskStatus,
          currentTask.orgId,
          "USER_ACTION",
          "USER"
        )
      );
    }

    // Stage changed
    if (parsed.data.stageKey && currentTask.stageKey !== parsed.data.stageKey) {
      emitPromises.push(
        emitTaskStageChanged(
          id,
          currentTask.stageKey,
          parsed.data.stageKey,
          currentTask.orgId,
          "USER"
        )
      );
    }

    // Assignee changed
    if (parsed.data.assignedToUserId !== undefined &&
        currentTask.assignedToUserId !== parsed.data.assignedToUserId) {
      emitPromises.push(
        emitTaskAssigneeChanged(
          id,
          currentTask.assignedToUserId,
          parsed.data.assignedToUserId,
          currentTask.orgId,
          "MANUAL"
        )
      );
    }

    // Emit all events in parallel
    await Promise.all(emitPromises);

    return NextResponse.json({
      task: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      {
        error: "Failed to update task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task (soft delete by setting status to CANCELLED)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch current task
    const currentTask = await prisma.task.findUnique({
      where: { id },
      select: {
        status: true,
        orgId: true,
      },
    });

    if (!currentTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to CANCELLED
    const task = await prisma.task.update({
      where: { id },
      data: { status: TaskStatus.CANCELLED },
    });

    // Emit status change event
    if (currentTask.status !== TaskStatus.CANCELLED) {
      await emitTaskStatusChanged(
        id,
        currentTask.status as TaskStatus,
        TaskStatus.CANCELLED,
        currentTask.orgId,
        "USER_ACTION",
        "USER"
      );
    }

    return NextResponse.json({
      success: true,
      task,
      message: "Task cancelled successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
