import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeStatus } from "@prisma/client";

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
  action: z.enum(["update_status", "assign_pipeline", "update_priority", "delete"]),
  data: z.object({
    status: z.enum(["NEW", "ROUTING", "ASSIGNED", "PROCESSING", "COMPLETED", "REJECTED"]).optional(),
    assignedPipeline: z.string().optional(),
    priority: z.number().int().min(0).max(10).optional(),
  }).optional(),
});

/**
 * POST /api/intake/bulk
 * Perform bulk operations on multiple intake requests
 *
 * Actions:
 * - update_status: Update status for multiple requests
 * - assign_pipeline: Assign pipeline to multiple requests
 * - update_priority: Update priority for multiple requests
 * - delete: Delete multiple requests
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bulkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { ids, action, data } = parsed.data;

    // Verify all requests exist and belong to the same organization
    const requests = await prisma.intakeRequest.findMany({
      where: { id: { in: ids } },
      select: { id: true, orgId: true },
    });

    if (requests.length !== ids.length) {
      return NextResponse.json(
        { error: "One or more intake requests not found" },
        { status: 404 },
      );
    }

    // Verify all requests belong to the same organization
    const orgIds = [...new Set(requests.map(r => r.orgId))];
    if (orgIds.length > 1) {
      return NextResponse.json(
        { error: "Cannot perform bulk operations across different organizations" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "update_status":
        if (!data?.status) {
          return NextResponse.json(
            { error: "Status is required for update_status action" },
            { status: 400 },
          );
        }
        result = await prisma.intakeRequest.updateMany({
          where: { id: { in: ids } },
          data: { status: data.status as IntakeStatus },
        });
        break;

      case "assign_pipeline":
        if (!data?.assignedPipeline) {
          return NextResponse.json(
            { error: "Pipeline ID is required for assign_pipeline action" },
            { status: 400 },
          );
        }
        // Verify pipeline exists and belongs to the same organization
        const pipeline = await prisma.pipeline.findUnique({
          where: { id: data.assignedPipeline },
        });
        if (!pipeline || pipeline.orgId !== orgIds[0]) {
          return NextResponse.json(
            { error: "Invalid pipeline or organization mismatch" },
            { status: 400 },
          );
        }
        result = await prisma.intakeRequest.updateMany({
          where: { id: { in: ids } },
          data: {
            assignedPipeline: data.assignedPipeline,
            status: IntakeStatus.ASSIGNED,
          },
        });
        break;

      case "update_priority":
        if (data?.priority === undefined) {
          return NextResponse.json(
            { error: "Priority is required for update_priority action" },
            { status: 400 },
          );
        }
        result = await prisma.intakeRequest.updateMany({
          where: { id: { in: ids } },
          data: { priority: data.priority },
        });
        break;

      case "delete":
        result = await prisma.intakeRequest.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    return NextResponse.json(
      {
        success: true,
        action,
        affectedCount: result.count,
        ids,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 },
    );
  }
}
