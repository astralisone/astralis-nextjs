/**
 * Public Booking Availability API
 *
 * Fetches availability rules for a specific user (public endpoint).
 * Used by BookingModal to show available time slots based on user's
 * configured availability schedule.
 *
 * This endpoint does NOT require authentication as it's used by
 * public booking forms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/booking/availability
 *
 * Query Parameters:
 * - userId: (required) The user ID to fetch availability for
 *
 * Returns the user's availability rules that can be used to
 * generate available time slots for booking.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Verify user exists and is active
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'User is not accepting bookings' },
        { status: 403 }
      );
    }

    // Fetch availability rules for the user
    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        timezone: true,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: availabilityRules,
      count: availabilityRules.length,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
