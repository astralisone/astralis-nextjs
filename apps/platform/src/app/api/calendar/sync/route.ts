import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import * as googleCalendarService from "@/lib/services/googleCalendar.service";
import { z } from "zod";

// Request validation schema
const syncSchema = z.object({
  connectionId: z.string().min(1, "Connection ID is required"),
});

/**
 * POST /api/calendar/sync
 * Manually triggers calendar synchronization
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
    const result = syncSchema.safeParse(body);

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

    // Note: connectionId is currently not used by syncFromGoogle
    // The service syncs all active Google connections for the user
    // Perform sync from Google Calendar
    const syncResult = await googleCalendarService.syncFromGoogle(userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          synced: syncResult.synced,
          errors: syncResult.errors,
          syncedAt: new Date().toISOString(),
          message: `Successfully synced ${syncResult.synced} events${syncResult.errors.length > 0 ? ` with ${syncResult.errors.length} errors` : ''}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing calendar:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Calendar connection not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "You don't have permission to sync this calendar" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes("expired")) {
      return NextResponse.json(
        {
          error: "Calendar connection expired",
          message: "Please reconnect your Google Calendar",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to sync calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
