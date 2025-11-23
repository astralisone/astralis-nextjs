import { NextRequest, NextResponse } from "next/server";
import * as googleCalendarService from "@/lib/services/googleCalendar.service";

/**
 * GET /api/calendar/callback
 * Handles Google Calendar OAuth callback
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth error (user denied access)
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/calendar/connections?error=${encodeURIComponent(error)}`,
          req.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/calendar/connections?error=missing_parameters",
          req.url
        )
      );
    }

    // Exchange authorization code for tokens
    const userId = state; // State contains userId from initial auth request
    await googleCalendarService.handleOAuthCallback(code, userId);

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/calendar/connections?success=true", req.url)
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/calendar/connections?error=${encodeURIComponent(
          error instanceof Error ? error.message : "callback_failed"
        )}`,
        req.url
      )
    );
  }
}
