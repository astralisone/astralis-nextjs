import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import * as aiSchedulingService from "@/lib/services/aiScheduling.service";
import * as conflictService from "@/lib/services/conflict.service";
import { parseISO, startOfDay, endOfDay, addDays } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  score: number;
  reasoning: string;
  confidenceLevel: "low" | "medium" | "high";
}

export interface OverbookingAnalysis {
  isOverbooked: boolean;
  eventCount: number;
  totalHoursBooked: number;
  percentageBooked: number;
  message: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const suggestSlotsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  duration: z.number().int().min(15).max(480), // 15 min to 8 hours
  preferredDate: z.string().optional(),
  preferredTime: z.enum(["morning", "afternoon", "evening"]).optional(),
  participants: z.array(z.string().email()).optional(),
  context: z.string().optional(),
  bufferMinutes: z.number().int().min(0).max(60).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert preferred time period to time range
 */
function getTimeRangeForPreference(
  preference?: "morning" | "afternoon" | "evening"
): { start: string; end: string } | undefined {
  if (!preference) {
    return undefined;
  }

  switch (preference) {
    case "morning":
      return { start: "08:00", end: "12:00" };
    case "afternoon":
      return { start: "12:00", end: "17:00" };
    case "evening":
      return { start: "17:00", end: "21:00" };
    default:
      return undefined;
  }
}

/**
 * Analyze overbooking for a given date
 */
async function analyzeOverbooking(
  userId: string,
  date: Date
): Promise<OverbookingAnalysis> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Get all events for the day
  const events = await prisma.schedulingEvent.findMany({
    where: {
      userId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const eventCount = events.length;

  // Calculate total booked hours
  let totalMinutesBooked = 0;
  for (const event of events) {
    const duration =
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    totalMinutesBooked += duration;
  }

  const totalHoursBooked = totalMinutesBooked / 60;

  // Assuming 8-hour workday (9 AM - 5 PM)
  const workdayHours = 8;
  const percentageBooked = (totalHoursBooked / workdayHours) * 100;

  // Determine overbooking status
  const isOverbooked = percentageBooked >= 75 || eventCount >= 6;

  let message = "";
  if (isOverbooked) {
    message = `Warning: This date appears heavily booked (${eventCount} events, ${totalHoursBooked.toFixed(1)} hours scheduled, ${percentageBooked.toFixed(0)}% of workday).`;
  } else if (percentageBooked >= 50) {
    message = `Note: This date is moderately booked (${eventCount} events, ${totalHoursBooked.toFixed(1)} hours scheduled).`;
  } else {
    message = `This date has good availability (${eventCount} events, ${totalHoursBooked.toFixed(1)} hours scheduled).`;
  }

  return {
    isOverbooked,
    eventCount,
    totalHoursBooked,
    percentageBooked: Math.round(percentageBooked),
    message,
  };
}

// ============================================================================
// POST /api/agent/suggest - AI slot suggestions endpoint
// ============================================================================

/**
 * POST /api/agent/suggest
 *
 * Returns AI-powered time slot suggestions for scheduling.
 *
 * Request body:
 * - userId: string - The user to find slots for
 * - duration: number - Duration in minutes (15-480)
 * - preferredDate?: string - ISO date string (defaults to tomorrow)
 * - preferredTime?: 'morning' | 'afternoon' | 'evening'
 * - participants?: string[] - Array of participant email addresses
 * - context?: string - Meeting context for AI ranking
 * - bufferMinutes?: number - Buffer time before/after events (0-60)
 *
 * Returns:
 * - 200: Success with slots and optional overbooking warning
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: User not found
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to get slot suggestions.",
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = suggestSlotsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      userId,
      duration,
      preferredDate,
      preferredTime,
      participants,
      context,
      bufferMinutes,
    } = parsed.data;

    // Authorization check: can only get suggestions for self or org members
    if (userId !== session.user.id) {
      // Check if target user is in same org
      const targetUser = await prisma.users.findUnique({
        where: { id: userId },
        select: { orgId: true },
      });

      if (!targetUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Not Found",
            details: `User with ID ${userId} not found.`,
          },
          { status: 404 }
        );
      }

      if (targetUser.orgId !== session.user.orgId) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            details: "You can only get suggestions for users in your organization.",
          },
          { status: 403 }
        );
      }
    }

    // Parse date (default to tomorrow if not provided)
    const targetDate = preferredDate
      ? parseISO(preferredDate)
      : addDays(new Date(), 1);

    // Get time range for preference
    const preferredTimeRange = getTimeRangeForPreference(preferredTime);

    // Get AI slot suggestions
    const suggestionResult = await aiSchedulingService.suggestTimeSlots({
      userId,
      duration,
      date: targetDate,
      preferredTimeRange,
      participantEmails: participants,
      context: context || "General meeting",
      bufferMinutes: bufferMinutes || 0,
    });

    // Analyze overbooking for the date
    const overbookingAnalysis = await analyzeOverbooking(userId, targetDate);

    // Format response
    const slots: TimeSlot[] = suggestionResult.slots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      score: slot.score,
      reasoning: slot.reasoning,
      confidenceLevel: slot.confidenceLevel,
    }));

    console.log(
      `[Agent Suggest] Generated ${slots.length} suggestions for user ${userId} on ${targetDate.toISOString().split("T")[0]}`
    );

    return NextResponse.json(
      {
        success: true,
        slots,
        totalCandidates: suggestionResult.totalCandidates,
        analysisContext: suggestionResult.analysisContext,
        ...(overbookingAnalysis.isOverbooked && {
          overbookingWarning: overbookingAnalysis,
        }),
        metadata: {
          userId,
          date: targetDate.toISOString().split("T")[0],
          duration,
          preferredTime: preferredTime || "any",
          participantCount: participants?.length || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Suggest] Error generating suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
