import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import {
  parseISO,
  startOfDay,
  endOfDay,
  addMinutes,
  eachDayOfInterval,
  format,
} from "date-fns";
import { DayOfWeek } from "@prisma/client";

// ============================================================================
// Types
// ============================================================================

interface TimeBlock {
  date: string; // YYYY-MM-DD format
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

interface DayAvailability {
  date: string;
  dayOfWeek: string;
  availableBlocks: TimeBlock[];
  totalAvailableMinutes: number;
  scheduledEvents: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps JavaScript Date.getDay() (0=Sunday, 1=Monday, ..., 6=Saturday)
 * to Prisma DayOfWeek enum
 */
const dayOfWeekMap: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Validation schema for query parameters
 */
const queryParamsSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
});

/**
 * Get available time blocks for a single day
 */
async function getAvailableBlocksForDay(
  userId: string,
  date: Date
): Promise<{
  blocks: TimeBlock[];
  scheduledEventsCount: number;
}> {
  const dayIndex = date.getDay();
  const dayOfWeek = dayOfWeekMap[dayIndex];
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const dateString = format(date, "yyyy-MM-dd");

  // Get availability rules for this day
  const rules = await prisma.availabilityRule.findMany({
    where: {
      userId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (rules.length === 0) {
    return { blocks: [], scheduledEventsCount: 0 };
  }

  // Get scheduled events for this day
  const events = await prisma.schedulingEvent.findMany({
    where: {
      userId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Convert availability rules to time windows
  const availableWindows: { start: Date; end: Date }[] = [];

  for (const rule of rules) {
    const [startHour, startMinute] = rule.startTime.split(":").map(Number);
    const [endHour, endMinute] = rule.endTime.split(":").map(Number);

    const windowStart = new Date(date);
    windowStart.setHours(startHour, startMinute, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setHours(endHour, endMinute, 0, 0);

    availableWindows.push({ start: windowStart, end: windowEnd });
  }

  // Subtract scheduled events from available windows
  const availableBlocks: TimeBlock[] = [];

  for (const window of availableWindows) {
    let currentStart = new Date(window.start);

    // Find events that overlap with this window
    const overlappingEvents = events.filter(
      (event) => event.startTime < window.end && event.endTime > window.start
    );

    if (overlappingEvents.length === 0) {
      // No overlapping events, entire window is available
      const durationMinutes =
        (window.end.getTime() - window.start.getTime()) / (1000 * 60);

      availableBlocks.push({
        date: dateString,
        startTime: window.start,
        endTime: window.end,
        durationMinutes,
      });
    } else {
      // Process gaps between events
      for (const event of overlappingEvents) {
        // Add gap before this event if there's space
        if (event.startTime > currentStart) {
          const blockEnd =
            event.startTime < window.end ? event.startTime : window.end;
          const durationMinutes =
            (blockEnd.getTime() - currentStart.getTime()) / (1000 * 60);

          if (durationMinutes >= 15) {
            // Minimum 15-minute blocks
            availableBlocks.push({
              date: dateString,
              startTime: new Date(currentStart),
              endTime: new Date(blockEnd),
              durationMinutes,
            });
          }
        }

        // Move current start past this event
        currentStart = new Date(Math.max(currentStart.getTime(), event.endTime.getTime()));
      }

      // Add remaining time after last event
      if (currentStart < window.end) {
        const durationMinutes =
          (window.end.getTime() - currentStart.getTime()) / (1000 * 60);

        if (durationMinutes >= 15) {
          availableBlocks.push({
            date: dateString,
            startTime: new Date(currentStart),
            endTime: new Date(window.end),
            durationMinutes,
          });
        }
      }
    }
  }

  return {
    blocks: availableBlocks,
    scheduledEventsCount: events.length,
  };
}

// ============================================================================
// GET /api/agent/availability - Check availability for date range
// ============================================================================

/**
 * GET /api/agent/availability
 *
 * Returns available time blocks for a user within a date range.
 *
 * Query parameters:
 * - userId: string - The user to check availability for
 * - startDate: string - Start date in YYYY-MM-DD format
 * - endDate: string - End date in YYYY-MM-DD format
 *
 * Returns:
 * - 200: Success with availability data
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: User not found
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to check availability.",
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = req.nextUrl;
    const params = {
      userId: searchParams.get("userId") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    };

    const parsed = queryParamsSchema.safeParse(params);

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

    const { userId, startDate, endDate } = parsed.data;

    // Authorization check: can only check availability for self or org members
    if (userId !== session.user.id) {
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
            details: "You can only check availability for users in your organization.",
          },
          { status: 403 }
        );
      }
    }

    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Validate date range (max 30 days)
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 30) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: {
            dateRange: ["Date range cannot exceed 30 days."],
          },
        },
        { status: 400 }
      );
    }

    if (daysDiff < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: {
            dateRange: ["End date must be after or equal to start date."],
          },
        },
        { status: 400 }
      );
    }

    // Get all days in the range
    const days = eachDayOfInterval({ start, end });

    // Get availability for each day
    const availabilityByDay: DayAvailability[] = [];
    let totalAvailableMinutes = 0;
    let totalScheduledEvents = 0;

    for (const day of days) {
      const { blocks, scheduledEventsCount } = await getAvailableBlocksForDay(
        userId,
        day
      );

      const dayTotalMinutes = blocks.reduce(
        (sum, block) => sum + block.durationMinutes,
        0
      );

      totalAvailableMinutes += dayTotalMinutes;
      totalScheduledEvents += scheduledEventsCount;

      availabilityByDay.push({
        date: format(day, "yyyy-MM-dd"),
        dayOfWeek: dayNames[day.getDay()],
        availableBlocks: blocks,
        totalAvailableMinutes: dayTotalMinutes,
        scheduledEvents: scheduledEventsCount,
      });
    }

    console.log(
      `[Agent Availability] Checked availability for user ${userId} from ${startDate} to ${endDate}`
    );

    return NextResponse.json(
      {
        success: true,
        availability: availabilityByDay,
        summary: {
          userId,
          startDate,
          endDate,
          totalDays: days.length,
          totalAvailableMinutes,
          totalAvailableHours: Math.round((totalAvailableMinutes / 60) * 10) / 10,
          totalScheduledEvents,
          averageAvailableMinutesPerDay: Math.round(
            totalAvailableMinutes / days.length
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Availability] Error checking availability:", error);
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
