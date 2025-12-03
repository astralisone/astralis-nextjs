import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeStatus } from "@prisma/client";

const assignIntakeSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline ID is required"),
  stageId: z.string().optional(), // Optional - defaults to first stage
});

/**
 * POST /api/intake/[id]/assign
 * Manually assign an intake request to a pipeline
 * - Authenticates the user via getServerSession
 * - Updates the intake's assignedPipeline, status, and aiRoutingMeta
 * - Creates a PipelineItem record in the specified stage (or first stage)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userName = session.user.name || session.user.email || "Unknown";

    const { id: intakeId } = await params;
    const body = await req.json();
    const parsed = assignIntakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { pipelineId, stageId } = parsed.data;

    // Check if intake request exists
    const intake = await prisma.intakeRequest.findUnique({
      where: { id: intakeId },
    });

    if (!intake) {
      return NextResponse.json(
        { error: "Intake request not found" },
        { status: 404 }
      );
    }

    // Check if reassigning to the same pipeline
    const isReassignment = intake.assignedPipeline && intake.status === IntakeStatus.ASSIGNED;
    const isSamePipeline = intake.assignedPipeline === pipelineId;

    // Verify pipeline exists and get stages
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    if (pipeline.stages.length === 0) {
      return NextResponse.json(
        { error: "Pipeline has no stages. Please add stages before assigning items." },
        { status: 400 }
      );
    }

    // Determine target stage (specified or first stage)
    let targetStage = pipeline.stages[0];
    if (stageId) {
      const specifiedStage = pipeline.stages.find((s) => s.id === stageId);
      if (!specifiedStage) {
        return NextResponse.json(
          { error: "Specified stage not found in this pipeline" },
          { status: 404 }
        );
      }
      targetStage = specifiedStage;
    }

    // Build aiRoutingMeta with manual assignment info
    const existingMeta = (intake.aiRoutingMeta as Record<string, unknown>) || {};
    const aiRoutingMeta = {
      ...existingMeta,
      manualAssignment: {
        assignedBy: userId,
        assignedByName: userName,
        assignedAt: new Date().toISOString(),
        pipelineId,
        stageId: targetStage.id,
        stageName: targetStage.name,
        source: "MANUAL_ASSIGNMENT",
      },
    };

    // Use transaction to update intake and create/move pipeline item atomically
    const result = await prisma.$transaction(async (tx) => {
      // If reassigning to a different pipeline, find and delete existing pipeline item
      if (isReassignment && !isSamePipeline) {
        // Find existing pipeline item linked to this intake
        const existingItems = await tx.pipelineItem.findMany({
          where: {
            data: {
              path: ['intakeRequestId'],
              equals: intakeId,
            },
          },
        });

        // Delete existing pipeline items
        if (existingItems.length > 0) {
          await tx.pipelineItem.deleteMany({
            where: {
              id: { in: existingItems.map(item => item.id) },
            },
          });
        }
      }

      // Update the intake request
      const updatedIntake = await tx.intakeRequest.update({
        where: { id: intakeId },
        data: {
          assignedPipeline: pipelineId,
          status: IntakeStatus.ASSIGNED,
          aiRoutingMeta,
        },
        include: {
          pipeline: {
            select: { id: true, name: true },
          },
          organization: {
            select: { id: true, name: true },
          },
        },
      });

      // Create pipeline item from intake data (skip if same pipeline)
      let pipelineItem;
      if (!isSamePipeline) {
        pipelineItem = await tx.pipelineItem.create({
          data: {
            title: intake.title,
            description: intake.description,
            priority: intake.priority,
            status: "NOT_STARTED",
            stageId: targetStage.id,
            data: {
              intakeRequestId: intakeId,
              source: intake.source,
              originalRequestData: intake.requestData,
              assignedAt: new Date().toISOString(),
              reassignedFrom: isReassignment ? intake.assignedPipeline : undefined,
            },
            tags: ["intake"],
          },
        });
      } else {
        // Same pipeline - find existing item
        pipelineItem = await tx.pipelineItem.findFirst({
          where: {
            data: {
              path: ['intakeRequestId'],
              equals: intakeId,
            },
          },
        });
      }

      return {
        intakeRequest: updatedIntake,
        pipelineItem,
        stage: {
          id: targetStage.id,
          name: targetStage.name,
        },
        wasReassigned: isReassignment && !isSamePipeline,
      };
    });

    const actionWord = result.wasReassigned ? 'reassigned' : 'assigned';
    return NextResponse.json(
      {
        success: true,
        message: `Intake ${actionWord} to ${pipeline.name} in stage "${targetStage.name}"`,
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning intake request:", error);
    return NextResponse.json(
      {
        error: "Failed to assign intake request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
