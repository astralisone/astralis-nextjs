import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as googleCalendarService from "@/lib/services/googleCalendar.service";

/**
 * POST /api/calendar/connect
 * Initiates Google Calendar OAuth flow
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Generate OAuth authorization URL
    const authUrl = await googleCalendarService.generateAuthUrl(userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          authUrl,
          message: "Redirect user to this URL to authorize Google Calendar access",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error initiating Google Calendar OAuth:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate calendar connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
