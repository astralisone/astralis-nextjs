import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updatePipelineSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/pipelines/[id]
 * Get a single pipeline with all stages, items, and intake requests
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            items: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        intakeRequests: {
          orderBy: [
            { priority: "desc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Error fetching pipeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pipelines/[id]
 * Update a pipeline
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updatePipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: parsed.data,
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Error updating pipeline:", error);
    return NextResponse.json(
      { error: "Failed to update pipeline" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pipelines/[id]
 * Delete a pipeline (soft delete by setting isActive to false)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, pipeline });
  } catch (error) {
    console.error("Error deleting pipeline:", error);
    return NextResponse.json(
      { error: "Failed to delete pipeline" },
      { status: 500 }
    );
  }
}
