import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const moveItemSchema = z.object({
  targetStageId: z.string(),
});

/**
 * PATCH /api/pipelines/[id]/items/[itemId]/move
 * Move an item to a different stage
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: pipelineId, itemId } = await params;
    const body = await req.json();
    const parsed = moveItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { targetStageId } = parsed.data;

    // Verify the item exists
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

    // Verify the target stage exists and belongs to this pipeline
    const targetStage = await prisma.pipelineStage.findFirst({
      where: {
        id: targetStageId,
        pipelineId: pipelineId,
      },
    });

    if (!targetStage) {
      return NextResponse.json(
        { error: "Target stage not found in this pipeline" },
        { status: 404 }
      );
    }

    // Move the item to the new stage
    const updatedItem = await prisma.pipelineItem.update({
      where: { id: itemId },
      data: {
        stageId: targetStageId,
      },
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error moving pipeline item:", error);
    return NextResponse.json(
      { error: "Failed to move item" },
      { status: 500 }
    );
  }
}
