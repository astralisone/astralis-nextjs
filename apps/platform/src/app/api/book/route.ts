/**
 * Public Booking API
 *
 * Handles public booking submissions with conflict detection.
 *
 * This endpoint:
 * 1. Validates booking data with Zod schema
 * 2. Verifies user exists and is active
 * 3. Checks for scheduling conflicts using conflict detection service
 * 4. Creates SchedulingEvent in database
 * 5. Creates EventReminder entries (24h and 1h before)
 * 6. Sends confirmation emails to guest and host
 * 7. Returns event details on success
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { detectConflicts } from '@/lib/services/conflict.service';
import {
  sendEmail,
  generateSchedulingConfirmationEmail,
  generateSchedulingConfirmationText,
  generateHostNotificationEmail,
} from '@/lib/email';
import { addReminderJob } from '@/workers/queues/schedulingReminders.queue';

/**
 * Booking request validation schema
 */
const bookingSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  startTime: z.string().datetime({ message: 'Invalid start time format' }),
  endTime: z.string().datetime({ message: 'Invalid end time format' }),
  timezone: z.string().default('America/New_York'),
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid guest email address'),
  guestPhone: z.string().optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  meetingType: z.enum(['VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON']).default('VIDEO_CALL'),
});

export type BookingRequest = z.infer<typeof bookingSchema>;

/**
 * POST /api/book
 *
 * Create a new public booking with conflict prevention
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      userId,
      title,
      startTime: startTimeStr,
      endTime: endTimeStr,
      timezone,
      guestName,
      guestEmail,
      guestPhone,
      description,
      meetingType,
    } = parsed.data;

    // Parse datetime strings to Date objects
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    // Validate time range
    if (endTime <= startTime) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: { endTime: ['End time must be after start time'] },
        },
        { status: 400 }
      );
    }

    // Validate booking is not in the past
    const now = new Date();
    if (startTime < now) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: { startTime: ['Cannot book a time in the past'] },
        },
        { status: 400 }
      );
    }

    // Step 1: Fetch user and verify they exist and are active
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        orgId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', details: { userId: ['The specified user does not exist'] } },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'User is inactive', details: { userId: ['The specified user is not accepting bookings'] } },
        { status: 403 }
      );
    }

    if (!user.orgId) {
      return NextResponse.json(
        { error: 'User configuration error', details: { userId: ['User must belong to an organization'] } },
        { status: 400 }
      );
    }

    // Step 2: Check for conflicts using conflict detection service
    const conflictResult = await detectConflicts(userId, startTime, endTime);

    if (conflictResult.hasConflict) {
      const conflictDetails = conflictResult.conflicts.map((c) => ({
        eventId: c.eventId,
        eventTitle: c.eventTitle,
        startTime: c.startTime.toISOString(),
        endTime: c.endTime.toISOString(),
        conflictType: c.conflictType,
      }));

      const availabilityIssueDetails = conflictResult.availabilityIssues.map((a) => ({
        message: a.message,
        affectedTime: a.affectedTime,
      }));

      return NextResponse.json(
        {
          error: 'Scheduling conflict detected',
          severity: conflictResult.severity,
          conflicts: conflictDetails,
          availabilityIssues: availabilityIssueDetails,
          message:
            conflictResult.severity === 'high'
              ? 'The requested time slot is not available due to existing commitments.'
              : 'There are potential conflicts with this time slot.',
        },
        { status: 409 }
      );
    }

    // Step 3: Create SchedulingEvent in database
    const event = await prisma.schedulingEvent.create({
      data: {
        userId,
        title,
        description,
        startTime,
        endTime,
        timezone,
        participantEmails: [guestEmail],
        status: 'SCHEDULED',
        aiSuggestionMeta: {
          guestName,
          guestEmail,
          guestPhone: guestPhone || null,
          meetingType,
          bookedAt: new Date().toISOString(),
          source: 'public_booking_api',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Step 4: Create EventReminder entries (24h and 1h before)
    const reminders = [];
    const reminder24h = new Date(startTime);
    reminder24h.setHours(reminder24h.getHours() - 24);

    const reminder1h = new Date(startTime);
    reminder1h.setHours(reminder1h.getHours() - 1);

    // Only create reminders if they're in the future
    if (reminder24h > now) {
      reminders.push(
        prisma.eventReminder.create({
          data: {
            eventId: event.id,
            reminderTime: reminder24h,
            status: 'PENDING',
          },
        })
      );
    }

    if (reminder1h > now) {
      reminders.push(
        prisma.eventReminder.create({
          data: {
            eventId: event.id,
            reminderTime: reminder1h,
            status: 'PENDING',
          },
        })
      );
    }

    const createdReminders = await Promise.all(reminders);

    // Queue each reminder for processing
    for (const reminder of createdReminders) {
      try {
        await addReminderJob({
          reminderId: reminder.id,
          eventId: reminder.eventId,
          orgId: user.orgId,
        });
      } catch (queueError) {
        console.error(`Failed to queue reminder ${reminder.id}:`, queueError);
        // Don't fail the booking if queueing fails
      }
    }

    console.log(
      `Created booking event ${event.id} for user ${userId} with ${reminders.length} reminders`
    );

    // Step 5: Send confirmation emails
    const bookingDetails = {
      eventId: event.id,
      title,
      startTime,
      endTime,
      timezone,
      guestName,
      guestEmail,
      guestPhone,
      meetingType,
      hostName: user.name || 'Host',
      hostEmail: user.email,
    };

    // Send confirmation to guest
    try {
      await sendEmail({
        to: guestEmail,
        subject: `Booking Confirmed: ${title}`,
        html: generateSchedulingConfirmationEmail(bookingDetails, false),
        text: generateSchedulingConfirmationText(bookingDetails, false),
      });
      console.log(`Guest confirmation email sent to ${guestEmail}`);
    } catch (emailError) {
      console.error('Failed to send guest confirmation email:', emailError);
      // Continue processing even if email fails
    }

    // Send notification to host
    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `New Booking: ${guestName} - ${title}`,
          html: generateHostNotificationEmail(bookingDetails),
        });
        console.log(`Host notification email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send host notification email:', emailError);
        // Continue processing even if email fails
      }
    }

    // Step 6: Return success with event details
    return NextResponse.json(
      {
        success: true,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          timezone: event.timezone,
          status: event.status,
          host: {
            id: event.user.id,
            name: event.user.name,
            email: event.user.email,
          },
          guest: {
            name: guestName,
            email: guestEmail,
            phone: guestPhone || null,
          },
          meetingType,
          createdAt: event.createdAt.toISOString(),
        },
        message: 'Booking confirmed successfully. Confirmation emails have been sent.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to process booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/book
 *
 * Get booking information (public endpoint for checking availability)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId parameter' },
        { status: 400 }
      );
    }

    const event = await prisma.schedulingEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        timezone: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        timezone: event.timezone,
        status: event.status,
        hostName: event.user.name,
        createdAt: event.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
