import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import { AgentTaskStatus, Prisma } from "@prisma/client";

// ============================================================================
// Validation Schemas
// ============================================================================

const updateTaskSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "AWAITING_INPUT",
      "SCHEDULED",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
    ])
    .optional(),
  priority: z.number().int().min(1).max(5).optional(),
  resolution: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  selectedSlot: z
    .object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
    })
    .optional(),
  errorMessage: z.string().optional(),
});

// ============================================================================
// GET /api/agent/inbox/[taskId] - Get single task with full relations
// ============================================================================

/**
 * GET /api/agent/inbox/[taskId]
 *
 * Fetches a single scheduling agent task with all related data.
 *
 * Returns:
 * - 200: Task with full relations
 * - 401: Unauthorized
 * - 404: Task not found
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to access tasks.",
        },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          details: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    const task = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        schedulingEvent: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            location: true,
            meetingLink: true,
            participantEmails: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details: `Task with ID ${taskId} not found.`,
        },
        { status: 404 }
      );
    }

    // Authorization check: user must own the task or be in the same org
    const isOwner = task.userId === session.user.id;
    const isOrgMember =
      task.orgId && session.user.orgId && task.orgId === session.user.orgId;

    if (!isOwner && !isOrgMember) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "You do not have access to this task.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Task] Error fetching task:", error);
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

// ============================================================================
// PATCH /api/agent/inbox/[taskId] - Update task
// ============================================================================

/**
 * PATCH /api/agent/inbox/[taskId]
 *
 * Updates a scheduling agent task (status, priority, resolution, etc.).
 *
 * Request body:
 * - status?: AgentTaskStatus
 * - priority?: number (1-5)
 * - resolution?: string
 * - title?: string
 * - description?: string
 * - dueDate?: string (ISO datetime)
 * - assignedTo?: string
 * - selectedSlot?: { startTime: string, endTime: string }
 * - errorMessage?: string
 *
 * Returns:
 * - 200: Updated task
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Task not found
 * - 500: Server error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to update tasks.",
        },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          details: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Fetch existing task
    const existingTask = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        userId: true,
        orgId: true,
        status: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details: `Task with ID ${taskId} not found.`,
        },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = existingTask.userId === session.user.id;
    const isOrgMember =
      existingTask.orgId &&
      session.user.orgId &&
      existingTask.orgId === session.user.orgId;

    if (!isOwner && !isOrgMember) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "You do not have permission to update this task.",
        },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Prisma.SchedulingAgentTaskUpdateInput = {};

    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status as AgentTaskStatus;

      // Set completedAt when task reaches a terminal state
      if (
        parsed.data.status === "COMPLETED" ||
        parsed.data.status === "CANCELLED"
      ) {
        updateData.completedAt = new Date();
      }
    }

    if (parsed.data.priority !== undefined) {
      updateData.priority = parsed.data.priority;
    }

    if (parsed.data.resolution !== undefined) {
      updateData.resolution = parsed.data.resolution;
    }

    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }

    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }

    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = new Date(parsed.data.dueDate);
    }

    if (parsed.data.assignedTo !== undefined) {
      updateData.assignedTo = parsed.data.assignedTo;
    }

    if (parsed.data.selectedSlot !== undefined) {
      updateData.selectedSlot =
        parsed.data.selectedSlot as Prisma.InputJsonValue;
    }

    if (parsed.data.errorMessage !== undefined) {
      updateData.errorMessage = parsed.data.errorMessage;
    }

    // Perform update
    const updatedTask = await prisma.schedulingAgentTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        schedulingEvent: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    console.log(`[Agent Task] Updated task ${taskId} by user ${session.user.id}`);

    return NextResponse.json(
      {
        success: true,
        task: updatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Task] Error updating task:", error);
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

// ============================================================================
// DELETE /api/agent/inbox/[taskId] - Delete task
// ============================================================================

/**
 * DELETE /api/agent/inbox/[taskId]
 *
 * Deletes a scheduling agent task.
 *
 * Returns:
 * - 200: Task deleted successfully
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Task not found
 * - 500: Server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to delete tasks.",
        },
        { status: 401 }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          details: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    // Fetch existing task
    const existingTask = await prisma.schedulingAgentTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        userId: true,
        orgId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details: `Task with ID ${taskId} not found.`,
        },
        { status: 404 }
      );
    }

    // Authorization check: only owner or org admin can delete
    const isOwner = existingTask.userId === session.user.id;
    const isOrgMember =
      existingTask.orgId &&
      session.user.orgId &&
      existingTask.orgId === session.user.orgId;

    if (!isOwner && !isOrgMember) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          details: "You do not have permission to delete this task.",
        },
        { status: 403 }
      );
    }

    // Delete the task
    await prisma.schedulingAgentTask.delete({
      where: { id: taskId },
    });

    console.log(`[Agent Task] Deleted task ${taskId} by user ${session.user.id}`);

    return NextResponse.json(
      {
        success: true,
        message: `Task ${taskId} deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Task] Error deleting task:", error);
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
