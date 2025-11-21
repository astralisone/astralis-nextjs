# Phase 10: Scheduling Workflows

**Duration**: 1-2 weeks
**Prerequisites**: Phase 6 complete (calendar infrastructure exists)
**Priority**: Critical - Core AstralisOps feature

---

## Overview

Implement the complete scheduling workflow system including public booking page, conflict prevention, automated reminders, and calendar synchronization.

**Marketing Promise:**
> "Let clients book appointments online without the back-and-forth emails. Your calendar stays synchronized, double-bookings are prevented, and reminders go out automatically."

---

## Current State (as of Phase 6)

### What Exists
- `SchedulingEvent` and `EventReminder` database tables
- `CalendarConnection` for Google/Outlook OAuth
- `AvailabilityRule` for defining working hours
- `/api/scheduling/conflicts` for conflict detection
- `/api/calendar/events` for event CRUD
- Calendar components (CalendarView, EventForm, ConflictDetector)
- AI scheduling assistant (CalendarChatPanel)

### What's Missing
- Public booking page (`/book/[userId]` or `/book/[teamId]`)
- Double-booking prevention enforcement in booking flow
- Automated reminder worker (EventReminder table exists but no processor)
- Booking confirmation emails
- Calendar sync background worker
- Public availability display
- Time zone handling in UI

---

## Implementation Plan

### 1. Public Booking Page

Create `src/app/book/[userId]/page.tsx`:

```typescript
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PublicBookingForm } from '@/components/scheduling/PublicBookingForm';
import { AvailabilityDisplay } from '@/components/scheduling/AvailabilityDisplay';

interface BookingPageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ date?: string; type?: string }>;
}

export default async function PublicBookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { userId } = await params;
  const { date, type } = await searchParams;

  // Fetch user and their availability
  const user = await prisma.users.findUnique({
    where: { id: userId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch availability rules
  const availabilityRules = await prisma.availabilityRule.findMany({
    where: { userId, isActive: true },
    orderBy: { dayOfWeek: 'asc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-astralis-blue/10 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <span className="text-2xl font-bold text-astralis-blue">
                {user.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-astralis-navy">
            Book a meeting with {user.name}
          </h1>
          {user.organization && (
            <p className="text-slate-600">{user.organization.name}</p>
          )}
        </div>

        {/* Booking Interface */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Availability Calendar */}
            <Suspense fallback={<div>Loading availability...</div>}>
              <AvailabilityDisplay
                userId={userId}
                availabilityRules={availabilityRules}
                selectedDate={date}
              />
            </Suspense>

            {/* Booking Form */}
            <PublicBookingForm
              userId={userId}
              orgId={user.organization?.id || ''}
              selectedDate={date}
              meetingType={type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Booking API with Conflict Prevention

Create `src/app/api/book/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { conflictService } from '@/lib/services/conflict.service';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { schedulingRemindersQueue } from '@/workers/queues/schedulingReminders.queue';

const bookingSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().default('UTC'),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  description: z.string().optional(),
  meetingType: z.enum(['VIDEO_CALL', 'PHONE_CALL', 'IN_PERSON']).default('VIDEO_CALL'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get user and org
    const user = await prisma.users.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true, orgId: true },
    });

    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for conflicts
    const conflicts = await conflictService.checkConflicts({
      userId: data.userId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });

    if (conflicts.hasConflict) {
      return NextResponse.json(
        {
          error: 'Time slot unavailable',
          conflicts: conflicts.conflictingEvents,
          suggestion: conflicts.suggestedAlternatives,
        },
        { status: 409 }
      );
    }

    // Create the event
    const event = await prisma.schedulingEvent.create({
      data: {
        userId: data.userId,
        orgId: user.orgId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        timezone: data.timezone,
        participantEmails: [data.guestEmail],
        status: 'SCHEDULED',
        calendarIntegrationData: {
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          meetingType: data.meetingType,
          bookedAt: new Date().toISOString(),
        },
      },
    });

    // Create reminders (24h and 1h before)
    const startTime = new Date(data.startTime);
    const reminder24h = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder1h = new Date(startTime.getTime() - 60 * 60 * 1000);

    await prisma.eventReminder.createMany({
      data: [
        { eventId: event.id, reminderTime: reminder24h, status: 'PENDING' },
        { eventId: event.id, reminderTime: reminder1h, status: 'PENDING' },
      ],
    });

    // Queue reminders for processing
    await schedulingRemindersQueue.add(
      'schedule-reminders',
      { eventId: event.id },
      { delay: Math.max(0, reminder24h.getTime() - Date.now()) }
    );

    // Send confirmation emails
    await sendBookingConfirmationEmail({
      to: data.guestEmail,
      guestName: data.guestName,
      hostName: user.name || 'Host',
      eventTitle: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      timezone: data.timezone,
      meetingType: data.meetingType,
    });

    // Also notify host
    await sendBookingConfirmationEmail({
      to: user.email,
      guestName: data.guestName,
      hostName: user.name || 'Host',
      eventTitle: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      timezone: data.timezone,
      meetingType: data.meetingType,
      isHost: true,
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
      },
    });
  } catch (error) {
    console.error('[Booking] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

### 3. Reminder Worker

Update `src/workers/processors/schedulingReminder.processor.ts`:

```typescript
import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { sendReminderEmail } from '@/lib/email';

interface ReminderJobData {
  eventId: string;
  reminderId?: string;
}

export async function processSchedulingReminder(
  job: Job<ReminderJobData>
): Promise<void> {
  const { eventId, reminderId } = job.data;

  console.log(`[Reminder] Processing reminders for event ${eventId}`);

  // Get event with reminders
  const event = await prisma.schedulingEvent.findUnique({
    where: { id: eventId },
    include: {
      user: { select: { name: true, email: true } },
      reminders: {
        where: {
          status: 'PENDING',
          reminderTime: { lte: new Date() },
        },
      },
    },
  });

  if (!event || event.status === 'CANCELLED') {
    console.log(`[Reminder] Event ${eventId} not found or cancelled`);
    return;
  }

  // Process each pending reminder
  for (const reminder of event.reminders) {
    try {
      // Send to all participants
      for (const email of event.participantEmails) {
        await sendReminderEmail({
          to: email,
          eventTitle: event.title,
          startTime: event.startTime,
          timezone: event.timezone,
          hostName: event.user.name || 'Host',
          meetingLink: event.meetingLink,
        });
      }

      // Update reminder status
      await prisma.eventReminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      console.log(`[Reminder] Sent reminder ${reminder.id} for event ${eventId}`);
    } catch (error) {
      await prisma.eventReminder.update({
        where: { id: reminder.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: { increment: 1 },
        },
      });
      console.error(`[Reminder] Failed to send reminder ${reminder.id}:`, error);
    }
  }
}
```

### 4. Calendar Sync Worker

Create `src/workers/processors/calendarSync.processor.ts`:

```typescript
import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { googleCalendarService } from '@/lib/services/googleCalendar.service';

interface CalendarSyncJobData {
  userId: string;
  connectionId: string;
  syncType: 'full' | 'incremental';
}

export async function processCalendarSync(
  job: Job<CalendarSyncJobData>
): Promise<void> {
  const { userId, connectionId, syncType } = job.data;

  console.log(`[CalendarSync] ${syncType} sync for user ${userId}`);

  const connection = await prisma.calendarConnection.findUnique({
    where: { id: connectionId },
    include: { user: true },
  });

  if (!connection || !connection.isActive) {
    console.log(`[CalendarSync] Connection ${connectionId} not found or inactive`);
    return;
  }

  try {
    if (connection.provider === 'GOOGLE') {
      const events = await googleCalendarService.fetchEvents(
        connection.accessToken,
        connection.refreshToken,
        syncType === 'full' ? undefined : connection.lastSyncAt
      );

      // Sync events to database
      for (const gcalEvent of events) {
        await prisma.schedulingEvent.upsert({
          where: {
            // Use external calendar event ID for deduplication
            id: `gcal_${gcalEvent.id}`,
          },
          create: {
            id: `gcal_${gcalEvent.id}`,
            userId,
            orgId: connection.user.orgId!,
            title: gcalEvent.summary || 'Untitled Event',
            description: gcalEvent.description,
            startTime: new Date(gcalEvent.start.dateTime || gcalEvent.start.date),
            endTime: new Date(gcalEvent.end.dateTime || gcalEvent.end.date),
            timezone: gcalEvent.start.timeZone || 'UTC',
            location: gcalEvent.location,
            meetingLink: gcalEvent.hangoutLink,
            participantEmails: gcalEvent.attendees?.map((a: any) => a.email) || [],
            status: gcalEvent.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
            calendarIntegrationData: {
              provider: 'GOOGLE',
              externalId: gcalEvent.id,
              etag: gcalEvent.etag,
            },
          },
          update: {
            title: gcalEvent.summary || 'Untitled Event',
            description: gcalEvent.description,
            startTime: new Date(gcalEvent.start.dateTime || gcalEvent.start.date),
            endTime: new Date(gcalEvent.end.dateTime || gcalEvent.end.date),
            status: gcalEvent.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
          },
        });
      }
    }

    // Update last sync time
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncAt: new Date(),
        syncErrorCount: 0,
      },
    });

    console.log(`[CalendarSync] Completed sync for user ${userId}`);
  } catch (error) {
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: {
        syncErrorCount: { increment: 1 },
      },
    });
    console.error(`[CalendarSync] Error for user ${userId}:`, error);
    throw error;
  }
}
```

---

## Testing Checklist

- [ ] Public booking page displays availability correctly
- [ ] Booking creation prevents double-booking
- [ ] Conflict detection returns suggested alternatives
- [ ] Confirmation emails sent to both guest and host
- [ ] 24h and 1h reminders queued correctly
- [ ] Reminder worker sends emails at scheduled time
- [ ] Calendar sync fetches events from Google Calendar
- [ ] Cancelled events skip reminder sending
- [ ] Time zone conversion works correctly

---

## Environment Variables Required

```bash
# Google Calendar OAuth (existing)
GOOGLE_CALENDAR_CLIENT_ID="<client-id>"
GOOGLE_CALENDAR_CLIENT_SECRET="<client-secret>"
GOOGLE_CALENDAR_REDIRECT_URI="<redirect-uri>"

# Email (existing)
SMTP_HOST="<smtp-host>"
SMTP_PORT="587"
SMTP_USER="<smtp-user>"
SMTP_PASSWORD="<smtp-password>"
```

---

## Success Criteria

1. Clients can book appointments via public URL
2. No double-bookings possible (100% conflict prevention)
3. Reminders sent 24h and 1h before meetings
4. Calendar syncs every 15 minutes with Google Calendar
5. Booking confirmation emails delivered within 30 seconds
6. Time zone handling correct across all interfaces
