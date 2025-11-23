/**
 * Scheduling Service
 *
 * Core scheduling logic including:
 * - Event CRUD operations
 * - Availability rule management
 * - User availability queries
 * - Quick conflict checks
 * - Integration with Google Calendar sync
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { addHours, addDays, format, parseISO, startOfDay, endOfDay } from 'date-fns';
import * as googleCalendar from './googleCalendar.service';

/**
 * Validation schemas
 */
const createEventSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  participantEmails: z.array(z.string().email()).optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceRule: z.string().optional(),
  syncToGoogle: z.boolean().optional().default(true),
});

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  participantEmails: z.array(z.string().email()).optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CONFLICT']).optional(),
  syncToGoogle: z.boolean().optional().default(true),
});

import { DayOfWeek } from '@prisma/client';

// Helper to convert day number to DayOfWeek enum
function numberToDayOfWeek(day: number): DayOfWeek {
  const mapping: Record<number, DayOfWeek> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  return mapping[day];
}

// Helper to convert DayOfWeek enum to number
function dayOfWeekToNumber(day: DayOfWeek): number {
  const mapping: Record<DayOfWeek, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  return mapping[day];
}

const createAvailabilitySchema = z.object({
  userId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean(),
});

const updateAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isAvailable: z.boolean().optional(),
});

/**
 * Type definitions
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

export interface EventFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  search?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

/**
 * Create a new scheduling event
 *
 * @param data - Event creation data
 * @returns Created scheduling event
 */
export async function createEvent(data: CreateEventInput) {
  // Validate input
  const validated = createEventSchema.parse(data);

  // Validate time range
  if (validated.endTime <= validated.startTime) {
    throw new Error('End time must be after start time');
  }

  try {
    // Create event in database
    // Note: isRecurring and recurrenceRule are validated but not stored in DB schema yet
    const event = await prisma.schedulingEvent.create({
      data: {
        userId: validated.userId,
        title: validated.title,
        description: validated.description,
        location: validated.location,
        startTime: validated.startTime,
        endTime: validated.endTime,
        participantEmails: validated.participantEmails ?? [],
        status: 'SCHEDULED',
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

    // Create automatic reminders (24 hours and 1 hour before)
    const reminder24h = new Date(validated.startTime);
    reminder24h.setHours(reminder24h.getHours() - 24);

    const reminder1h = new Date(validated.startTime);
    reminder1h.setHours(reminder1h.getHours() - 1);

    // Only create reminders if they're in the future
    const now = new Date();

    if (reminder24h > now) {
      await prisma.eventReminder.create({
        data: {
          eventId: event.id,
          reminderTime: reminder24h,
          status: 'PENDING',
        },
      });
    }

    if (reminder1h > now) {
      await prisma.eventReminder.create({
        data: {
          eventId: event.id,
          reminderTime: reminder1h,
          status: 'PENDING',
        },
      });
    }

    // Sync to Google Calendar if enabled
    if (validated.syncToGoogle) {
      try {
        const googleEventData = {
          summary: event.title,
          description: event.description || undefined,
          location: event.location || undefined,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'America/New_York', // TODO: Make configurable per user
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'America/New_York',
          },
          attendees: validated.participantEmails?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 60 },
            ],
          },
        };

        const googleEvent = await googleCalendar.createEvent(validated.userId, googleEventData);

        // Store Google event ID in calendarIntegrationData JSON field
        await prisma.schedulingEvent.update({
          where: { id: event.id },
          data: {
            calendarIntegrationData: {
              googleEventId: googleEvent.id,
              provider: 'google',
              syncedAt: new Date().toISOString(),
            },
          },
        });

        console.log(`Event ${event.id} synced to Google Calendar as ${googleEvent.id}`);
      } catch (syncError) {
        console.error('Failed to sync event to Google Calendar:', syncError);
        // Don't fail the entire operation if sync fails
      }
    }

    console.log(`Created scheduling event ${event.id} for user ${validated.userId}`);
    return event;
  } catch (error: any) {
    console.error('Error creating scheduling event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Update an existing scheduling event
 *
 * @param id - Event ID to update
 * @param data - Update data
 * @returns Updated scheduling event
 */
export async function updateEvent(id: string, data: UpdateEventInput) {
  // Validate input
  const validated = updateEventSchema.parse(data);

  try {
    // Get existing event
    const existing = await prisma.schedulingEvent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Event not found');
    }

    // Validate time range if both times are provided
    const startTime = validated.startTime || existing.startTime;
    const endTime = validated.endTime || existing.endTime;

    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    // Update event
    const event = await prisma.schedulingEvent.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        location: validated.location,
        startTime: validated.startTime,
        endTime: validated.endTime,
        status: validated.status,
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

    // Sync to Google Calendar if enabled and event has Google ID
    const calendarData = existing.calendarIntegrationData as { googleEventId?: string } | null;
    const googleEventId = calendarData?.googleEventId;
    if (validated.syncToGoogle && googleEventId) {
      try {
        const googleEventData = {
          summary: event.title,
          description: event.description || undefined,
          location: event.location || undefined,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'America/New_York',
          },
        };

        await googleCalendar.updateEvent(
          existing.userId,
          googleEventId,
          googleEventData
        );

        console.log(`Event ${event.id} synced update to Google Calendar`);
      } catch (syncError) {
        console.error('Failed to sync event update to Google Calendar:', syncError);
      }
    }

    console.log(`Updated scheduling event ${id}`);
    return event;
  } catch (error: any) {
    console.error('Error updating scheduling event:', error);
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

/**
 * Delete a scheduling event
 *
 * @param id - Event ID to delete
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Delete from Google Calendar if synced
    const calendarData = event.calendarIntegrationData as { googleEventId?: string } | null;
    const googleEventId = calendarData?.googleEventId;
    if (googleEventId) {
      try {
        await googleCalendar.deleteEvent(event.userId, googleEventId);
        console.log(`Event ${id} deleted from Google Calendar`);
      } catch (syncError) {
        console.error('Failed to delete event from Google Calendar:', syncError);
      }
    }

    // Delete reminders first (due to foreign key constraint)
    await prisma.eventReminder.deleteMany({
      where: { eventId: id },
    });

    // Delete event
    await prisma.schedulingEvent.delete({
      where: { id },
    });

    console.log(`Deleted scheduling event ${id}`);
  } catch (error: any) {
    console.error('Error deleting scheduling event:', error);
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * Get a single scheduling event by ID
 *
 * @param id - Event ID
 * @returns Scheduling event or null
 */
export async function getEvent(id: string) {
  try {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
    });

    return event;
  } catch (error: any) {
    console.error('Error fetching scheduling event:', error);
    throw new Error(`Failed to fetch event: ${error.message}`);
  }
}

/**
 * List scheduling events for a user with optional filters
 *
 * @param userId - User ID to list events for
 * @param filters - Optional filters
 * @returns Array of scheduling events
 */
export async function listEvents(userId: string, filters?: EventFilters) {
  try {
    const where: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];

      if (filters.startDate) {
        where.AND.push({ startTime: { gte: filters.startDate } });
      }

      if (filters.endDate) {
        where.AND.push({ endTime: { lte: filters.endDate } });
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.schedulingEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reminders: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return events;
  } catch (error: any) {
    console.error('Error listing scheduling events:', error);
    throw new Error(`Failed to list events: ${error.message}`);
  }
}

/**
 * Create an availability rule for a user
 *
 * @param data - Availability rule data
 * @returns Created availability rule
 */
export async function createAvailabilityRule(data: CreateAvailabilityInput) {
  const validated = createAvailabilitySchema.parse(data);

  try {
    const rule = await prisma.availabilityRule.create({
      data: {
        userId: validated.userId,
        dayOfWeek: numberToDayOfWeek(validated.dayOfWeek),
        startTime: validated.startTime,
        endTime: validated.endTime,
        isActive: validated.isAvailable,
        timezone: 'UTC', // Default timezone
      },
    });

    console.log(`Created availability rule ${rule.id} for user ${validated.userId}`);
    return rule;
  } catch (error: any) {
    console.error('Error creating availability rule:', error);
    throw new Error(`Failed to create availability rule: ${error.message}`);
  }
}

/**
 * Update an availability rule
 *
 * @param id - Rule ID to update
 * @param data - Update data
 * @returns Updated availability rule
 */
export async function updateAvailabilityRule(id: string, data: UpdateAvailabilityInput) {
  const validated = updateAvailabilitySchema.parse(data);

  try {
    const updateData: any = {
      startTime: validated.startTime,
      endTime: validated.endTime,
      isActive: validated.isAvailable,
    };

    if (validated.dayOfWeek !== undefined) {
      updateData.dayOfWeek = numberToDayOfWeek(validated.dayOfWeek);
    }

    const rule = await prisma.availabilityRule.update({
      where: { id },
      data: updateData,
    });

    console.log(`Updated availability rule ${id}`);
    return rule;
  } catch (error: any) {
    console.error('Error updating availability rule:', error);
    throw new Error(`Failed to update availability rule: ${error.message}`);
  }
}

/**
 * Delete an availability rule
 *
 * @param id - Rule ID to delete
 */
export async function deleteAvailabilityRule(id: string): Promise<void> {
  try {
    await prisma.availabilityRule.delete({
      where: { id },
    });

    console.log(`Deleted availability rule ${id}`);
  } catch (error: any) {
    console.error('Error deleting availability rule:', error);
    throw new Error(`Failed to delete availability rule: ${error.message}`);
  }
}

/**
 * Get available time slots for a user on a specific date
 *
 * @param userId - User ID
 * @param date - Date to check availability
 * @returns Array of available time slots
 */
export async function getUserAvailability(userId: string, date: Date): Promise<TimeSlot[]> {
  try {
    const dayOfWeekNum = date.getDay();
    const dayOfWeek = numberToDayOfWeek(dayOfWeekNum);

    // Get availability rules for this day
    const rules = await prisma.availabilityRule.findMany({
      where: {
        userId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (rules.length === 0) {
      return [];
    }

    // Convert rules to time slots
    const slots: TimeSlot[] = rules.map(rule => {
      const [startHour, startMinute] = rule.startTime.split(':').map(Number);
      const [endHour, endMinute] = rule.endTime.split(':').map(Number);

      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      return { startTime, endTime };
    });

    return slots;
  } catch (error: any) {
    console.error('Error getting user availability:', error);
    throw new Error(`Failed to get user availability: ${error.message}`);
  }
}

/**
 * Quick conflict check for a time range
 *
 * @param userId - User ID
 * @param startTime - Start of time range
 * @param endTime - End of time range
 * @returns True if there is a conflict, false otherwise
 */
export async function checkQuickConflict(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const conflicts = await prisma.schedulingEvent.findMany({
      where: {
        userId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
      take: 1,
    });

    return conflicts.length > 0;
  } catch (error: any) {
    console.error('Error checking for conflicts:', error);
    throw new Error(`Failed to check for conflicts: ${error.message}`);
  }
}

/**
 * Get all availability rules for a user
 *
 * @param userId - User ID
 * @returns Array of availability rules
 */
export async function getAvailability(userId: string) {
  try {
    const rules = await prisma.availabilityRule.findMany({
      where: { userId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    console.log(`Retrieved ${rules.length} availability rules for user ${userId}`);
    return rules;
  } catch (error: any) {
    console.error('Error getting availability rules:', error);
    throw new Error(`Failed to get availability rules: ${error.message}`);
  }
}

/**
 * Set/create availability for a user (alias for createAvailabilityRule)
 *
 * @param data - Availability rule data
 * @returns Created availability rule
 */
export async function setAvailability(data: CreateAvailabilityInput & { timezone?: string }) {
  return createAvailabilityRule(data);
}

/**
 * Update an availability rule with ownership check
 *
 * @param id - Rule ID to update
 * @param userId - User ID (for authorization)
 * @param data - Update data
 * @returns Updated availability rule
 */
export async function updateAvailability(id: string, userId: string, data: UpdateAvailabilityInput) {
  try {
    // Check ownership
    const existing = await prisma.availabilityRule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Availability rule not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Unauthorized: You do not own this availability rule');
    }

    return updateAvailabilityRule(id, data);
  } catch (error: any) {
    console.error('Error updating availability rule:', error);
    throw error;
  }
}

/**
 * Delete an availability rule with ownership check
 *
 * @param id - Rule ID to delete
 * @param userId - User ID (for authorization)
 */
export async function deleteAvailability(id: string, userId: string): Promise<void> {
  try {
    // Check ownership
    const existing = await prisma.availabilityRule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Availability rule not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Unauthorized: You do not own this availability rule');
    }

    return deleteAvailabilityRule(id);
  } catch (error: any) {
    console.error('Error deleting availability rule:', error);
    throw error;
  }
}

/**
 * Get events for a user (alias for listEvents)
 *
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns Array of scheduling events
 */
export async function getEventsForUser(userId: string, filters?: EventFilters) {
  return listEvents(userId, filters);
}

/**
 * Get event by ID (alias for getEvent)
 *
 * @param id - Event ID
 * @returns Scheduling event or null
 */
export async function getEventById(id: string) {
  return getEvent(id);
}
