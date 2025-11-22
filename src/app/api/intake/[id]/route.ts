import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeStatus, IntakeSource } from "@prisma/client";

const updateIntakeSchema = z.object({
  status: z.enum(["NEW", "ROUTING", "ASSIGNED", "PROCESSING", "COMPLETED", "REJECTED"]).optional(),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedPipeline: z.string().optional(),
});

// Shared handler for PUT and PATCH
async function handleUpdate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateIntakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Check if intake request exists
    const existing = await prisma.intakeRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Intake request not found" },
        { status: 404 },
      );
    }

    // Update the intake request
    const updated = await prisma.intakeRequest.update({
      where: { id },
      data: {
        ...parsed.data,
        status: parsed.data.status as IntakeStatus | undefined,
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

    return NextResponse.json({ intakeRequest: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating intake request:", error);
    return NextResponse.json(
      { error: "Failed to update intake request" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/intake/[id]
 * Update a single intake request
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

/**
 * PATCH /api/intake/[id]
 * Partially update a single intake request
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, context);
}

/**
 * DELETE /api/intake/[id]
 * Delete a single intake request
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if intake request exists
    const existing = await prisma.intakeRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Intake request not found" },
        { status: 404 },
      );
    }

    // Delete the intake request
    await prisma.intakeRequest.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Intake request deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting intake request:", error);
    return NextResponse.json(
      { error: "Failed to delete intake request" },
      { status: 500 },
    );
  }
}
