import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import * as aiSchedulingService from "@/lib/services/aiScheduling.service";
import { z } from "zod";

// Suggestion request validation schema
const suggestSchema = z.object({
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours"),
  participantEmails: z.array(z.string().email()).optional().default([]),
  preferredDates: z.array(z.string().datetime()).optional().default([]),
  context: z.string().optional(),
});

/**
 * POST /api/scheduling/suggest
 * Generates AI-powered time slot suggestions
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
    const result = suggestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { duration, participantEmails, preferredDates, context } = result.data;

    // Use the first preferred date, or default to today
    const date = preferredDates.length > 0
      ? new Date(preferredDates[0])
      : new Date();

    // Generate AI suggestions
    const suggestions = await aiSchedulingService.suggestTimeSlots({
      userId,
      duration,
      participantEmails,
      date,
      context,
    });

    // Return top 5 suggestions
    const topSuggestions = suggestions.slots.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        data: {
          suggestions: topSuggestions,
          count: topSuggestions.length,
          totalCandidates: suggestions.totalCandidates,
          analysisContext: suggestions.analysisContext,
          requestedDuration: duration,
          participantsConsidered: participantEmails.length,
        },
        message: `Found ${topSuggestions.length} optimal time slot${topSuggestions.length !== 1 ? 's' : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating time slot suggestions:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message.includes("No available")) {
      return NextResponse.json(
        {
          error: "No available time slots found",
          details: error.message,
          suggestions: [],
        },
        { status: 200 } // Still return 200 with empty suggestions
      );
    }

    if (error instanceof Error && error.message.includes("participant")) {
      return NextResponse.json(
        {
          error: "Failed to check participant availability",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate time slot suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
