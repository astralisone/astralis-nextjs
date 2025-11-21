import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as schedulingService from "@/lib/services/scheduling.service";
import { z } from "zod";

// Time format validation (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Availability update validation schema
const updateAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format").optional(),
  endTime: z.string().regex(timeRegex, "End time must be in HH:mm format").optional(),
  timezone: z.string().min(1).optional(),
});

/**
 * PUT /api/availability/[id]
 * Updates an availability rule
 */
export async function PUT(
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
    const { id: availabilityId } = await params;

    // Parse and validate request body
    const body = await req.json();
    const result = updateAvailabilitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = result.data;

    // Validate time range if both times are provided
    if (updateData.startTime && updateData.endTime) {
      const [startHour, startMinute] = updateData.startTime.split(":").map(Number);
      const [endHour, endMinute] = updateData.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }
    }

    // Update availability rule
    const availability = await schedulingService.updateAvailability(
      availabilityId,
      userId,
      updateData
    );

    return NextResponse.json(
      {
        success: true,
        data: availability,
        message: "Availability rule updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating availability:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Availability rule not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "You don't have permission to update this availability rule" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        {
          error: "Availability rule already exists for this day and time",
          details: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/availability/[id]
 * Deletes an availability rule
 */
export async function DELETE(
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
    const { id: availabilityId } = await params;

    // Delete availability rule
    await schedulingService.deleteAvailability(availabilityId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Availability rule deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting availability:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Availability rule not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "You don't have permission to delete this availability rule" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to delete availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
