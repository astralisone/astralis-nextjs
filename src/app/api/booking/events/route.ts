/**
 * Public Booking Events API
 *
 * Fetches existing scheduled events for a specific user and date range.
 * Used by BookingModal to show which time slots are already taken.
 *
 * This endpoint does NOT require authentication as it's used by
 * public booking forms. It returns minimal event information
 * (only what's needed for conflict detection) to protect privacy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/booking/events
 *
 * Query Parameters:
 * - userId: (required) The user ID to fetch events for
 * - startDate: (required) ISO date string for the start of the date range
 * - endDate: (required) ISO date string for the end of the date range
 *
 * Returns a list of events (with minimal info) that can be used
 * to determine which time slots are already booked.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Missing startDate or endDate parameter' },
        { status: 400 }
      );
    }

    // Parse and validate dates
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid startDate format' },
        { status: 400 }
      );
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid endDate format' },
        { status: 400 }
      );
    }

    // Limit date range to 7 days to prevent abuse
    const maxRangeMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxRangeMs) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 7 days' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch events for the user within the date range
    // Only return scheduled/confirmed events (not cancelled/completed)
    const events = await prisma.schedulingEvent.findMany({
      where: {
        userId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        AND: [
          { startTime: { lt: endDate } },
          { endTime: { gt: startDate } },
        ],
      },
      select: {
        // Only return minimal information needed for conflict detection
        // Do not expose title, description, or participant details
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Transform dates to ISO strings for consistent client handling
    const transformedEvents = events.map((event) => ({
      id: event.id,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      status: event.status,
    }));

    return NextResponse.json({
      success: true,
      data: transformedEvents,
      count: transformedEvents.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
