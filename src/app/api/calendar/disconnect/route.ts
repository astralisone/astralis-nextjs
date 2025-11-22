import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import * as googleCalendarService from "@/lib/services/googleCalendar.service";
import { z } from "zod";

// Request validation schema
const disconnectSchema = z.object({
  connectionId: z.string().min(1, "Connection ID is required"),
});

/**
 * POST /api/calendar/disconnect
 * Disconnects a Google Calendar integration
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
    const result = disconnectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { connectionId } = result.data;

    // Disconnect calendar
    await googleCalendarService.disconnectCalendar(connectionId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Calendar disconnected successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disconnecting calendar:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Calendar connection not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "You don't have permission to disconnect this calendar" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to disconnect calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
