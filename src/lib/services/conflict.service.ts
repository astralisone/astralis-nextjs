/**
 * Conflict Detection Service
 *
 * Provides comprehensive conflict detection including:
 * - Time overlap detection
 * - Availability rule validation
 * - Multi-participant conflict checks
 * - Conflict severity scoring
 * - Alternative time slot suggestions
 */

import { prisma } from '@/lib/prisma';
import { addMinutes, startOfDay, endOfDay, parseISO } from 'date-fns';
import { DayOfWeek } from '@prisma/client';

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

/**
 * Type definitions
 */
export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
  availabilityIssues: AvailabilityIssue[];
  severity: 'none' | 'low' | 'medium' | 'high';
}

export interface ConflictDetail {
  eventId: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  conflictScore: number;
  conflictType: 'full_overlap' | 'partial_overlap' | 'back_to_back';
}

export interface AvailabilityIssue {
  dayOfWeek: DayOfWeek | number;
  message: string;
  affectedTime: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  score?: number;
}

/**
 * Detect conflicts for a proposed time slot
 *
 * @param userId - User ID to check conflicts for
 * @param startTime - Proposed start time
 * @param endTime - Proposed end time
 * @param participantEmails - Optional array of participant emails
 * @returns Detailed conflict analysis result
 */
export async function detectConflicts(
  userId: string,
  startTime: Date,
  endTime: Date,
  participantEmails?: string[]
): Promise<ConflictResult> {
  const conflicts: ConflictDetail[] = [];
  const availabilityIssues: AvailabilityIssue[] = [];

  try {
    // Check for time overlaps with existing events
    const overlappingEvents = await getConflictingEvents(userId, startTime, endTime);

    for (const event of overlappingEvents) {
      const conflictScore = scoreConflict(
        { startTime, endTime } as any,
        event
      );

      let conflictType: ConflictDetail['conflictType'] = 'partial_overlap';

      // Determine conflict type
      if (
        event.startTime <= startTime &&
        event.endTime >= endTime
      ) {
        conflictType = 'full_overlap';
      } else if (
        event.endTime.getTime() === startTime.getTime() ||
        event.startTime.getTime() === endTime.getTime()
      ) {
        conflictType = 'back_to_back';
      }

      conflicts.push({
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        conflictScore,
        conflictType,
      });
    }

    // Check availability rules
    const dayIndex = startTime.getDay();
    const dayOfWeek = dayOfWeekMap[dayIndex];
    const startTimeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        userId,
        dayOfWeek,
      },
    });

    // Check if time falls within available hours
    let isWithinAvailableHours = false;

    for (const rule of availabilityRules) {
      if (rule.isActive) {
        // Check if proposed time falls within this availability window
        if (startTimeStr >= rule.startTime && endTimeStr <= rule.endTime) {
          isWithinAvailableHours = true;
          break;
        }
      } else {
        // Check if proposed time overlaps with unavailable period
        if (
          (startTimeStr >= rule.startTime && startTimeStr < rule.endTime) ||
          (endTimeStr > rule.startTime && endTimeStr <= rule.endTime) ||
          (startTimeStr <= rule.startTime && endTimeStr >= rule.endTime)
        ) {
          availabilityIssues.push({
            dayOfWeek,
            message: `Time conflicts with unavailable period ${rule.startTime}-${rule.endTime}`,
            affectedTime: `${rule.startTime}-${rule.endTime}`,
          });
        }
      }
    }

    // If there are available hour rules and time is not within them
    const hasAvailabilityRules = availabilityRules.some(r => r.isActive);
    if (hasAvailabilityRules && !isWithinAvailableHours) {
      availabilityIssues.push({
        dayOfWeek,
        message: 'Time is outside of available hours',
        affectedTime: `${startTimeStr}-${endTimeStr}`,
      });
    }

    // Check participant conflicts if provided
    if (participantEmails && participantEmails.length > 0) {
      const participantUsers = await prisma.users.findMany({
        where: {
          email: { in: participantEmails },
        },
        select: { id: true, email: true, name: true },
      });

      for (const participant of participantUsers) {
        const participantConflicts = await getConflictingEvents(
          participant.id,
          startTime,
          endTime
        );

        for (const event of participantConflicts) {
          conflicts.push({
            eventId: event.id,
            eventTitle: `${participant.name || participant.email}: ${event.title}`,
            startTime: event.startTime,
            endTime: event.endTime,
            conflictScore: scoreConflict({ startTime, endTime } as any, event),
            conflictType: 'partial_overlap',
          });
        }
      }
    }

    // Determine overall severity
    let severity: ConflictResult['severity'] = 'none';

    if (conflicts.length > 0 || availabilityIssues.length > 0) {
      const maxConflictScore = Math.max(
        ...conflicts.map(c => c.conflictScore),
        0
      );

      if (maxConflictScore >= 80 || availabilityIssues.length > 0) {
        severity = 'high';
      } else if (maxConflictScore >= 50) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    }

    const hasConflict = conflicts.length > 0 || availabilityIssues.length > 0;

    console.log(
      `Conflict check for user ${userId}: ${hasConflict ? 'conflicts found' : 'no conflicts'} (severity: ${severity})`
    );

    return {
      hasConflict,
      conflicts,
      availabilityIssues,
      severity,
    };
  } catch (error: any) {
    console.error('Error detecting conflicts:', error);
    throw new Error(`Failed to detect conflicts: ${error.message}`);
  }
}

/**
 * Check if a user is available during a specific time range
 *
 * @param userId - User ID to check
 * @param startTime - Start time
 * @param endTime - End time
 * @returns True if available, false if conflicts exist
 */
export async function checkAvailability(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const result = await detectConflicts(userId, startTime, endTime);
    return !result.hasConflict;
  } catch (error: any) {
    console.error('Error checking availability:', error);
    throw new Error(`Failed to check availability: ${error.message}`);
  }
}

/**
 * Get all events that conflict with a given time range
 *
 * @param userId - User ID
 * @param startTime - Start time
 * @param endTime - End time
 * @returns Array of conflicting events
 */
export async function getConflictingEvents(
  userId: string,
  startTime: Date,
  endTime: Date
) {
  try {
    const events = await prisma.schedulingEvent.findMany({
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return events;
  } catch (error: any) {
    console.error('Error getting conflicting events:', error);
    throw new Error(`Failed to get conflicting events: ${error.message}`);
  }
}

/**
 * Score the severity of a conflict between two events
 *
 * Scoring algorithm:
 * - Full overlap (one event completely contains another): 100
 * - High overlap (>75% overlap): 80-99
 * - Medium overlap (50-75% overlap): 50-79
 * - Low overlap (25-50% overlap): 25-49
 * - Minimal overlap (<25% overlap): 1-24
 * - Back-to-back (no gap): 10
 *
 * @param event1 - First event
 * @param event2 - Second event
 * @returns Conflict score from 0 (no conflict) to 100 (complete overlap)
 */
export function scoreConflict(event1: any, event2: any): number {
  const start1 = new Date(event1.startTime).getTime();
  const end1 = new Date(event1.endTime).getTime();
  const start2 = new Date(event2.startTime).getTime();
  const end2 = new Date(event2.endTime).getTime();

  // Calculate overlap
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);

  // No overlap
  if (overlapStart >= overlapEnd) {
    // Check if back-to-back
    if (end1 === start2 || end2 === start1) {
      return 10;
    }
    return 0;
  }

  const overlapDuration = overlapEnd - overlapStart;
  const duration1 = end1 - start1;
  const duration2 = end2 - start2;

  // Check for full overlap
  if (
    (start2 <= start1 && end2 >= end1) ||
    (start1 <= start2 && end1 >= end2)
  ) {
    return 100;
  }

  // Calculate overlap percentage relative to the shorter event
  const shorterDuration = Math.min(duration1, duration2);
  const overlapPercentage = (overlapDuration / shorterDuration) * 100;

  // Map percentage to score
  if (overlapPercentage >= 75) {
    return Math.min(80 + (overlapPercentage - 75) * 0.8, 99);
  } else if (overlapPercentage >= 50) {
    return 50 + (overlapPercentage - 50) * 1.2;
  } else if (overlapPercentage >= 25) {
    return 25 + (overlapPercentage - 25);
  } else {
    return Math.max(1, overlapPercentage);
  }
}

/**
 * Find alternative time slots when conflicts are detected
 *
 * @param userId - User ID to find slots for
 * @param duration - Duration in minutes
 * @param date - Date to search for slots
 * @returns Array of available time slots
 */
export async function findAlternativeSlots(
  userId: string,
  duration: number,
  date: Date
): Promise<TimeSlot[]> {
  try {
    const dayIndex = date.getDay();
    const dayOfWeek = dayOfWeekMap[dayIndex];
    const dateStart = startOfDay(date);
    const dateEnd = endOfDay(date);

    // Get availability rules for this day
    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        userId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (availabilityRules.length === 0) {
      console.log(`No availability rules found for user ${userId} on day ${dayOfWeek}`);
      return [];
    }

    // Get all events for the day
    const existingEvents = await prisma.schedulingEvent.findMany({
      where: {
        userId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        startTime: { gte: dateStart },
        endTime: { lte: dateEnd },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const availableSlots: TimeSlot[] = [];

    // Generate slots for each availability rule
    for (const rule of availabilityRules) {
      const [startHour, startMinute] = rule.startTime.split(':').map(Number);
      const [endHour, endMinute] = rule.endTime.split(':').map(Number);

      let slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const ruleEnd = new Date(date);
      ruleEnd.setHours(endHour, endMinute, 0, 0);

      // Generate 30-minute interval slots within this availability window
      while (slotStart < ruleEnd) {
        const slotEnd = addMinutes(slotStart, duration);

        // Check if slot extends beyond rule end time
        if (slotEnd > ruleEnd) {
          break;
        }

        // Check if this slot conflicts with any existing events
        let hasConflict = false;

        for (const event of existingEvents) {
          if (
            slotStart < event.endTime &&
            slotEnd > event.startTime
          ) {
            hasConflict = true;
            break;
          }
        }

        // Add slot if no conflict
        if (!hasConflict) {
          availableSlots.push({
            startTime: new Date(slotStart),
            endTime: new Date(slotEnd),
          });
        }

        // Move to next 30-minute slot
        slotStart = addMinutes(slotStart, 30);
      }
    }

    console.log(`Found ${availableSlots.length} alternative slots for user ${userId} on ${date.toDateString()}`);
    return availableSlots;
  } catch (error: any) {
    console.error('Error finding alternative slots:', error);
    throw new Error(`Failed to find alternative slots: ${error.message}`);
  }
}
