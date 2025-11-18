import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createItemSchema = z.object({
  title: z.string().min(2),
  data: z.any(),
  stageId: z.string(),
});

/**
 * GET /api/pipelines/[id]/items
 * List all items in a pipeline across all stages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id: pipelineId } = params;

    // Verify pipeline exists
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            items: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      stages: pipeline.stages,
    });
  } catch (error) {
    console.error("Error fetching pipeline items:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline items" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/pipelines/[id]/items
 * Add a new item to a pipeline stage (used by n8n integrations)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id: pipelineId } = params;

    // Verify stage belongs to this pipeline
    const stage = await prisma.stage.findFirst({
      where: {
        id: parsed.data.stageId,
        pipelineId: pipelineId,
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found in this pipeline" },
        { status: 404 },
      );
    }

    const item = await prisma.pipelineItem.create({
      data: {
        title: parsed.data.title,
        data: parsed.data.data,
        stageId: parsed.data.stageId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline item:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline item" },
      { status: 500 },
    );
  }
}
