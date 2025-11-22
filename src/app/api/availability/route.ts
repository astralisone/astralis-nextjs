import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import * as schedulingService from "@/lib/services/scheduling.service";
import { z } from "zod";

// Time format validation (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Availability creation validation schema
const createAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6, "Day of week must be between 0 (Sunday) and 6 (Saturday)"),
  startTime: z.string().regex(timeRegex, "Start time must be in HH:mm format (e.g., 09:00)"),
  endTime: z.string().regex(timeRegex, "End time must be in HH:mm format (e.g., 17:00)"),
  timezone: z.string().min(1, "Timezone is required"),
});

/**
 * GET /api/availability
 * Lists availability rules for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch availability rules
    const availabilityRules = await schedulingService.getAvailability(userId);

    return NextResponse.json(
      {
        success: true,
        data: availabilityRules,
        count: availabilityRules.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/availability
 * Creates a new availability rule
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const result = createAvailabilitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { dayOfWeek, startTime, endTime, timezone } = result.data;

    // Validate that end time is after start time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Create availability rule
    const availability = await schedulingService.setAvailability({
      userId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true, // Default to available when creating
    });

    return NextResponse.json(
      {
        success: true,
        data: availability,
        message: "Availability rule created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating availability:", error);

    // Handle duplicate availability errors
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
        error: "Failed to create availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
