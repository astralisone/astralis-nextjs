import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createStageSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().min(0),
});

/**
 * GET /api/pipelines/[id]/stages
 * Get all stages for a pipeline
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;

    const stages = await prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ stages });
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json(
      { error: "Failed to fetch stages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pipelines/[id]/stages
 * Create a new stage
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pipelineId } = await params;
    const body = await req.json();
    const parsed = createStageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify pipeline exists
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const stage = await prisma.pipelineStage.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        order: parsed.data.order,
        pipelineId,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error("Error creating stage:", error);
    return NextResponse.json(
      { error: "Failed to create stage" },
      { status: 500 }
    );
  }
}
