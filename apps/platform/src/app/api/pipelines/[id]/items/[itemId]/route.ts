import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateItemSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  priority: z.number().int().min(0).max(4).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CLOSED']).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  assignedToId: z.string().optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  data: z.any().optional(),
});

/**
 * GET /api/pipelines/[id]/items/[itemId]
 * Get a specific pipeline item
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: pipelineId, itemId } = await params;

    const item = await prisma.pipelineItem.findUnique({
      where: { id: itemId },
      include: {
        stage: {
          include: {
            pipeline: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Verify the item belongs to this pipeline
    if (item.stage.pipelineId !== pipelineId) {
      return NextResponse.json(
        { error: "Item does not belong to this pipeline" },
        { status: 403 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching pipeline item:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline item" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pipelines/[id]/items/[itemId]
 * Update a pipeline item (including status changes for Close/Complete actions)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: pipelineId, itemId } = await params;
    const body = await req.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the item exists and belongs to this pipeline
    const existingItem = await prisma.pipelineItem.findUnique({
      where: { id: itemId },
      include: {
        stage: {
          include: {
            pipeline: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItem.stage.pipelineId !== pipelineId) {
      return NextResponse.json(
        { error: "Item does not belong to this pipeline" },
        { status: 403 }
      );
    }

    // Build update data object
    const updateData: Record<string, unknown> = {};

    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }
    if (parsed.data.description !== undefined) {
      updateData.description = parsed.data.description;
    }
    if (parsed.data.priority !== undefined) {
      updateData.priority = parsed.data.priority;
    }
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
    }
    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }
    if (parsed.data.tags !== undefined) {
      updateData.tags = parsed.data.tags;
    }
    if (parsed.data.assignedToId !== undefined) {
      updateData.assignedToId = parsed.data.assignedToId;
    }
    if (parsed.data.progress !== undefined) {
      updateData.progress = parsed.data.progress;
    }
    if (parsed.data.data !== undefined) {
      updateData.data = parsed.data.data;
    }

    const updatedItem = await prisma.pipelineItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating pipeline item:", error);
    return NextResponse.json(
      { error: "Failed to update pipeline item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pipelines/[id]/items/[itemId]
 * Delete a pipeline item (use with caution - prefer CLOSED status instead)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: pipelineId, itemId } = await params;

    // Verify the item exists and belongs to this pipeline
    const existingItem = await prisma.pipelineItem.findUnique({
      where: { id: itemId },
      include: {
        stage: {
          include: {
            pipeline: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItem.stage.pipelineId !== pipelineId) {
      return NextResponse.json(
        { error: "Item does not belong to this pipeline" },
        { status: 403 }
      );
    }

    await prisma.pipelineItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pipeline item:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline item" },
      { status: 500 }
    );
  }
}
