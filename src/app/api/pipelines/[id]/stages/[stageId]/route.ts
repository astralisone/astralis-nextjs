import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateStageSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * PUT /api/pipelines/[id]/stages/[stageId]
 * Update a stage
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { id: pipelineId, stageId } = await params;
    const body = await req.json();
    const parsed = updateStageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify stage belongs to pipeline
    const existingStage = await prisma.pipelineStage.findFirst({
      where: {
        id: stageId,
        pipelineId,
      },
    });

    if (!existingStage) {
      return NextResponse.json(
        { error: "Stage not found in this pipeline" },
        { status: 404 }
      );
    }

    const stage = await prisma.pipelineStage.update({
      where: { id: stageId },
      data: parsed.data,
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json(
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pipelines/[id]/stages/[stageId]
 * Delete a stage (only if it has no items)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const { id: pipelineId, stageId } = await params;

    // Verify stage belongs to pipeline
    const stage = await prisma.pipelineStage.findFirst({
      where: {
        id: stageId,
        pipelineId,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found in this pipeline" },
        { status: 404 }
      );
    }

    if (stage._count.items > 0) {
      return NextResponse.json(
        { error: "Cannot delete stage with items. Please move or delete items first." },
        { status: 400 }
      );
    }

    await prisma.pipelineStage.delete({
      where: { id: stageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return NextResponse.json(
      { error: "Failed to delete stage" },
      { status: 500 }
    );
  }
}
