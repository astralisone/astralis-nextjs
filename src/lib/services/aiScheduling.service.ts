/**
 * AI-Powered Scheduling Service
 *
 * Provides intelligent scheduling capabilities including:
 * - Smart time slot suggestions with preference scoring
 * - Conflict detection and alternative suggestions
 * - Overbooking detection and recommendations
 * - Buffer time recommendations for back-to-back meetings
 * - Multi-participant availability checking
 * - Time preference support (morning, afternoon, evening)
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import {
  addMinutes,
  addDays,
  format,
  startOfDay,
  endOfDay,
  differenceInMinutes,
  isSameDay,
  isAfter,
  isBefore,
} from 'date-fns';
import * as conflictService from './conflict.service';
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Time preference definitions (in 24-hour format)
 */
const TIME_PREFERENCES = {
  morning: { start: '08:00', end: '12:00' },
  afternoon: { start: '12:00', end: '17:00' },
  evening: { start: '17:00', end: '21:00' },
} as const;

/**
 * Default working hours (8 AM to 6 PM)
 */
const DEFAULT_WORK_HOURS = {
  start: '08:00',
  end: '18:00',
};

/**
 * Overbooking threshold (80% utilization)
 */
const OVERBOOKING_THRESHOLD = 80;

/**
 * Default buffer time in minutes
 */
const DEFAULT_BUFFER_MINUTES = 15;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents an available time slot with scoring and reasoning
 */
export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  score: number; // Higher = better match for preferences (0-100)
  reason?: string; // Why this slot was suggested
}

/**
 * Parameters for finding available slots
 */
export interface FindAvailableSlotsParams {
  userId: string;
  duration: number; // in minutes
  startDate: Date;
  endDate: Date;
  preferredTimes?: ('morning' | 'afternoon' | 'evening')[];
  excludeParticipantConflicts?: string[]; // user IDs to check
}

/**
 * Overbooking analysis result
 */
export interface OverbookingAnalysis {
  date: Date;
  totalMeetings: number;
  totalMinutes: number;
  utilizationPercent: number;
  isOverbooked: boolean;
  recommendations: string[];
}

/**
 * Conflict check result
 */
export interface ConflictResult {
  hasConflict: boolean;
  conflictingEvents: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
  }>;
  suggestions?: TimeSlot[];
}

/**
 * Parameters for checking conflicts
 */
export interface CheckConflictsParams {
  userId: string;
  startTime: Date;
  endTime: Date;
  excludeEventId?: string;
}

/**
 * Buffer time recommendation
 */
export interface BufferRecommendation {
  recommendedStart: Date;
  reason: string;
}

/**
 * Legacy type definitions for backward compatibility
 */
export interface SuggestionParams {
  userId: string;
  participantEmails?: string[];
  duration: number;
  date: Date;
  preferredTimeRange?: {
    start: string;
    end: string;
  };
  context?: string;
  bufferMinutes?: number;
}

export interface RankedSlot {
  startTime: Date;
  endTime: Date;
  score: number;
  reasoning: string;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface TimeSlotSuggestion {
  slots: RankedSlot[];
  totalCandidates: number;
  analysisContext: string;
}

// ============================================================================
// AI SCHEDULING SERVICE CLASS
// ============================================================================

/**
 * AISchedulingService provides intelligent scheduling capabilities
 */
export class AISchedulingService {
  /**
   * Find available time slots for a user within a date range
   *
   * @param params - Parameters for finding slots
   * @returns Array of available time slots sorted by preference score
   */
  async findAvailableSlots(params: FindAvailableSlotsParams): Promise<TimeSlot[]> {
    const {
      userId,
      duration,
      startDate,
      endDate,
      preferredTimes,
      excludeParticipantConflicts,
    } = params;

    console.log(`Finding available slots for user ${userId}, duration: ${duration} minutes`);

    const availableSlots: TimeSlot[] = [];

    // Iterate through each day in the range
    let currentDate = startOfDay(startDate);
    const lastDate = endOfDay(endDate);

    while (currentDate <= lastDate) {
      const dayOfWeek = dayOfWeekMap[currentDate.getDay()];

      // Get user's availability rules for this day
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

      // Get existing events for this day
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const existingEvents = await prisma.schedulingEvent.findMany({
        where: {
          userId,
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          AND: [
            { startTime: { lt: dayEnd } },
            { endTime: { gt: dayStart } },
          ],
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      // Get participant conflicts if specified
      let participantEvents: Array<{ startTime: Date; endTime: Date }> = [];
      if (excludeParticipantConflicts && excludeParticipantConflicts.length > 0) {
        const pEvents = await prisma.schedulingEvent.findMany({
          where: {
            userId: { in: excludeParticipantConflicts },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
            AND: [
              { startTime: { lt: dayEnd } },
              { endTime: { gt: dayStart } },
            ],
          },
          select: {
            startTime: true,
            endTime: true,
          },
        });
        participantEvents = pEvents;
      }

      // Generate slots from availability rules or default hours
      const slotsForDay = this.generateSlotsForDay(
        currentDate,
        duration,
        availabilityRules,
        existingEvents,
        participantEvents,
        preferredTimes
      );

      availableSlots.push(...slotsForDay);

      // Move to next day
      currentDate = addDays(currentDate, 1);
    }

    // Sort by score (descending)
    availableSlots.sort((a, b) => b.score - a.score);

    console.log(`Found ${availableSlots.length} available slots`);
    return availableSlots;
  }

  /**
   * Generate available slots for a specific day
   */
  private generateSlotsForDay(
    date: Date,
    duration: number,
    availabilityRules: Array<{ startTime: string; endTime: string }>,
    existingEvents: Array<{ startTime: Date; endTime: Date }>,
    participantEvents: Array<{ startTime: Date; endTime: Date }>,
    preferredTimes?: ('morning' | 'afternoon' | 'evening')[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    // Use availability rules if present, otherwise use default hours
    const windows =
      availabilityRules.length > 0
        ? availabilityRules.map(rule => ({
            start: rule.startTime,
            end: rule.endTime,
          }))
        : [DEFAULT_WORK_HOURS];

    for (const window of windows) {
      const [startHour, startMin] = window.start.split(':').map(Number);
      const [endHour, endMin] = window.end.split(':').map(Number);

      let slotStart = new Date(date);
      slotStart.setHours(startHour, startMin, 0, 0);

      const windowEnd = new Date(date);
      windowEnd.setHours(endHour, endMin, 0, 0);

      // Generate 30-minute interval slots
      while (slotStart < windowEnd) {
        const slotEnd = addMinutes(slotStart, duration);

        // Check if slot extends beyond window
        if (slotEnd > windowEnd) {
          break;
        }

        // Check for conflicts with existing events
        const hasUserConflict = existingEvents.some(
          event =>
            slotStart < event.endTime && slotEnd > event.startTime
        );

        // Check for participant conflicts
        const hasParticipantConflict = participantEvents.some(
          event =>
            slotStart < event.endTime && slotEnd > event.startTime
        );

        if (!hasUserConflict && !hasParticipantConflict) {
          const score = this.calculateSlotScore(slotStart, slotEnd, preferredTimes);
          const reason = this.getSlotReason(slotStart, preferredTimes);

          slots.push({
            startTime: new Date(slotStart),
            endTime: new Date(slotEnd),
            score,
            reason,
          });
        }

        // Move to next 30-minute interval
        slotStart = addMinutes(slotStart, 30);
      }
    }

    return slots;
  }

  /**
   * Calculate preference score for a time slot
   */
  private calculateSlotScore(
    startTime: Date,
    endTime: Date,
    preferredTimes?: ('morning' | 'afternoon' | 'evening')[]
  ): number {
    let score = 50; // Base score
    const hour = startTime.getHours();
    const dayOfWeek = startTime.getDay();

    // Preferred time bonus
    if (preferredTimes && preferredTimes.length > 0) {
      const timeOfDay = this.getTimeOfDay(hour);
      if (preferredTimes.includes(timeOfDay)) {
        score += 30;
      }
    }

    // Mid-morning preference (9-11 AM) - generally productive
    if (hour >= 9 && hour < 11) {
      score += 15;
    }
    // Early afternoon (1-3 PM) - good for meetings
    else if (hour >= 13 && hour < 15) {
      score += 10;
    }
    // Avoid lunch hour
    else if (hour === 12) {
      score -= 10;
    }
    // Early morning penalty
    else if (hour < 9) {
      score -= 5;
    }
    // Late afternoon penalty
    else if (hour >= 17) {
      score -= 15;
    }

    // Mid-week preference (Tuesday, Wednesday, Thursday)
    if (dayOfWeek >= 2 && dayOfWeek <= 4) {
      score += 10;
    }
    // Monday/Friday slight penalty
    else if (dayOfWeek === 1 || dayOfWeek === 5) {
      score -= 5;
    }

    // Ensure score is within bounds
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get time of day category
   */
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Generate reason for slot suggestion
   */
  private getSlotReason(
    startTime: Date,
    preferredTimes?: ('morning' | 'afternoon' | 'evening')[]
  ): string {
    const hour = startTime.getHours();
    const dayName = format(startTime, 'EEEE');
    const timeOfDay = this.getTimeOfDay(hour);

    const reasons: string[] = [];

    if (preferredTimes?.includes(timeOfDay)) {
      reasons.push(`Matches your ${timeOfDay} preference`);
    }

    if (hour >= 9 && hour < 11) {
      reasons.push('Prime productive morning hours');
    } else if (hour >= 13 && hour < 15) {
      reasons.push('Good afternoon slot for focused work');
    }

    if (['Tuesday', 'Wednesday', 'Thursday'].includes(dayName)) {
      reasons.push(`${dayName} is a productive mid-week day`);
    }

    return reasons.length > 0
      ? reasons.join('; ')
      : 'Available time slot';
  }

  /**
   * Suggest alternative time slots when a requested time conflicts
   *
   * @param conflictingSlot - The originally requested time slot
   * @param userId - User ID to find alternatives for
   * @param count - Number of alternatives to return (default: 3)
   * @returns Array of alternative time slots
   */
  async suggestAlternatives(
    conflictingSlot: TimeSlot,
    userId: string,
    count: number = 3
  ): Promise<TimeSlot[]> {
    const duration = differenceInMinutes(
      conflictingSlot.endTime,
      conflictingSlot.startTime
    );

    console.log(`Suggesting ${count} alternatives for conflicting slot`);

    const alternatives: TimeSlot[] = [];
    const requestedDate = startOfDay(conflictingSlot.startTime);
    const requestedHour = conflictingSlot.startTime.getHours();

    // Priority 1: Same day alternatives
    const sameDaySlots = await this.findAvailableSlots({
      userId,
      duration,
      startDate: requestedDate,
      endDate: endOfDay(requestedDate),
    });

    // Find slots closest to the requested time on the same day
    const sameDaySorted = sameDaySlots.sort((a, b) => {
      const aDiff = Math.abs(a.startTime.getHours() - requestedHour);
      const bDiff = Math.abs(b.startTime.getHours() - requestedHour);
      return aDiff - bDiff;
    });

    alternatives.push(...sameDaySorted.slice(0, Math.ceil(count / 2)));

    // Priority 2: Next day at similar time
    if (alternatives.length < count) {
      const nextDay = addDays(requestedDate, 1);
      const nextDaySlots = await this.findAvailableSlots({
        userId,
        duration,
        startDate: nextDay,
        endDate: endOfDay(nextDay),
      });

      const nextDaySorted = nextDaySlots.sort((a, b) => {
        const aDiff = Math.abs(a.startTime.getHours() - requestedHour);
        const bDiff = Math.abs(b.startTime.getHours() - requestedHour);
        return aDiff - bDiff;
      });

      alternatives.push(...nextDaySorted.slice(0, count - alternatives.length));
    }

    // Priority 3: Same time on different days within the week
    if (alternatives.length < count) {
      for (let i = 2; i <= 7 && alternatives.length < count; i++) {
        const futureDate = addDays(requestedDate, i);
        const futureDaySlots = await this.findAvailableSlots({
          userId,
          duration,
          startDate: futureDate,
          endDate: endOfDay(futureDate),
        });

        // Find slot closest to the original time
        const closestSlot = futureDaySlots.find(
          slot => Math.abs(slot.startTime.getHours() - requestedHour) <= 1
        );

        if (closestSlot) {
          closestSlot.reason = `Same time on ${format(futureDate, 'EEEE')}`;
          alternatives.push(closestSlot);
        }
      }
    }

    // Update reasons for alternatives
    alternatives.forEach((slot, index) => {
      if (isSameDay(slot.startTime, conflictingSlot.startTime)) {
        slot.reason = slot.reason || 'Alternative on same day';
      } else if (
        isSameDay(slot.startTime, addDays(conflictingSlot.startTime, 1))
      ) {
        slot.reason = slot.reason || 'Next available day';
      }
    });

    return alternatives.slice(0, count);
  }

  /**
   * Detect overbooking for a user on a specific date
   *
   * @param userId - User ID to check
   * @param date - Date to analyze
   * @returns Overbooking analysis with recommendations
   */
  async detectOverbooking(userId: string, date: Date): Promise<OverbookingAnalysis> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    console.log(`Analyzing overbooking for user ${userId} on ${format(date, 'yyyy-MM-dd')}`);

    // Get all events for the day
    const events = await prisma.schedulingEvent.findMany({
      where: {
        userId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        AND: [
          { startTime: { lt: dayEnd } },
          { endTime: { gt: dayStart } },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Calculate total meeting time
    let totalMinutes = 0;
    for (const event of events) {
      const effectiveStart = isAfter(event.startTime, dayStart)
        ? event.startTime
        : dayStart;
      const effectiveEnd = isBefore(event.endTime, dayEnd)
        ? event.endTime
        : dayEnd;
      totalMinutes += differenceInMinutes(effectiveEnd, effectiveStart);
    }

    // Get available hours for the day
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    const availabilityRules = await prisma.availabilityRule.findMany({
      where: {
        userId,
        dayOfWeek,
        isActive: true,
      },
    });

    // Calculate total available minutes
    let availableMinutes = 0;
    if (availabilityRules.length > 0) {
      for (const rule of availabilityRules) {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        availableMinutes += (endH * 60 + endM) - (startH * 60 + startM);
      }
    } else {
      // Default 8 hours (8 AM - 4 PM)
      availableMinutes = 480;
    }

    const utilizationPercent =
      availableMinutes > 0
        ? Math.round((totalMinutes / availableMinutes) * 100)
        : 0;

    const isOverbooked = utilizationPercent >= OVERBOOKING_THRESHOLD;

    // Generate recommendations
    const recommendations: string[] = [];

    if (isOverbooked) {
      recommendations.push(
        `Consider spreading meetings across multiple days - ${utilizationPercent}% of your day is booked`
      );
    }

    if (events.length >= 5) {
      recommendations.push(
        'High number of meetings detected - consider blocking focus time'
      );
    }

    // Check for back-to-back meetings
    let backToBackCount = 0;
    for (let i = 1; i < events.length; i++) {
      const gap = differenceInMinutes(
        events[i].startTime,
        events[i - 1].endTime
      );
      if (gap < 15) {
        backToBackCount++;
      }
    }

    if (backToBackCount > 0) {
      recommendations.push(
        `${backToBackCount} back-to-back meetings detected - add buffer time between meetings`
      );
    }

    if (utilizationPercent > 90) {
      recommendations.push(
        'Consider declining or rescheduling non-essential meetings'
      );
    }

    if (recommendations.length === 0 && events.length > 0) {
      recommendations.push('Calendar utilization is healthy');
    }

    return {
      date,
      totalMeetings: events.length,
      totalMinutes,
      utilizationPercent,
      isOverbooked,
      recommendations,
    };
  }

  /**
   * Check for conflicts with a proposed time slot
   *
   * @param params - Conflict check parameters
   * @returns Conflict result with suggestions if conflicts found
   */
  async checkConflicts(params: CheckConflictsParams): Promise<ConflictResult> {
    const { userId, startTime, endTime, excludeEventId } = params;

    console.log(`Checking conflicts for user ${userId}`);

    // Use existing conflict service
    const conflictingEvents = await conflictService.getConflictingEvents(
      userId,
      startTime,
      endTime
    );

    // Filter out excluded event if specified
    const filteredConflicts = excludeEventId
      ? conflictingEvents.filter(e => e.id !== excludeEventId)
      : conflictingEvents;

    const hasConflict = filteredConflicts.length > 0;

    const result: ConflictResult = {
      hasConflict,
      conflictingEvents: filteredConflicts.map(event => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
      })),
    };

    // If conflicts found, suggest alternatives
    if (hasConflict) {
      const duration = differenceInMinutes(endTime, startTime);
      const alternatives = await this.suggestAlternatives(
        { startTime, endTime, score: 0 },
        userId,
        3
      );
      result.suggestions = alternatives;
    }

    return result;
  }

  /**
   * Recommend buffer time if a meeting would be back-to-back
   *
   * @param userId - User ID to check
   * @param startTime - Proposed meeting start time
   * @returns Buffer recommendation or null if no buffer needed
   */
  async recommendBufferTime(
    userId: string,
    startTime: Date
  ): Promise<BufferRecommendation | null> {
    console.log(`Checking buffer time recommendation for user ${userId}`);

    // Find meeting ending just before the proposed start time
    const bufferWindow = addMinutes(startTime, -DEFAULT_BUFFER_MINUTES);

    const precedingEvent = await prisma.schedulingEvent.findFirst({
      where: {
        userId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        endTime: {
          gt: bufferWindow,
          lte: startTime,
        },
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    if (!precedingEvent) {
      return null;
    }

    const gap = differenceInMinutes(startTime, precedingEvent.endTime);

    if (gap < DEFAULT_BUFFER_MINUTES) {
      const recommendedStart = addMinutes(
        precedingEvent.endTime,
        DEFAULT_BUFFER_MINUTES
      );

      return {
        recommendedStart,
        reason: `A meeting ends at ${format(
          precedingEvent.endTime,
          'h:mm a'
        )}. Adding ${DEFAULT_BUFFER_MINUTES}-minute buffer for transition time.`,
      };
    }

    return null;
  }
}

// ============================================================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================================================

/**
 * Generate intelligent time slot suggestions (legacy function)
 *
 * @param params - Suggestion parameters
 * @returns Ranked time slot suggestions with AI reasoning
 */
export async function suggestTimeSlots(
  params: SuggestionParams
): Promise<TimeSlotSuggestion> {
  try {
    // Step 1: Generate candidate time slots
    const candidateSlots = generateTimeSlots(
      params.date,
      params.duration,
      params.preferredTimeRange
    );

    console.log(`Generated ${candidateSlots.length} candidate time slots`);

    // Step 2: Filter by user availability
    const availableSlots = await filterByAvailability(
      candidateSlots,
      params.userId
    );

    console.log(`${availableSlots.length} slots after availability filtering`);

    // Step 3: Filter by conflicts (user + participants)
    const userIds = [params.userId];

    if (params.participantEmails && params.participantEmails.length > 0) {
      const participants = await prisma.users.findMany({
        where: {
          email: { in: params.participantEmails },
        },
        select: { id: true },
      });

      userIds.push(...participants.map(p => p.id));
    }

    const conflictFreeSlots = await filterByConflicts(
      availableSlots,
      userIds,
      params.bufferMinutes
    );

    console.log(`${conflictFreeSlots.length} slots after conflict filtering`);

    if (conflictFreeSlots.length === 0) {
      return {
        slots: [],
        totalCandidates: candidateSlots.length,
        analysisContext:
          'No available time slots found after filtering for availability and conflicts.',
      };
    }

    // Step 4: Rank slots using AI
    const rankedSlots = await rankSlotsWithAI(
      conflictFreeSlots.slice(0, 20),
      params.context || 'General meeting',
      params.participantEmails?.length || 0
    );

    console.log(`AI ranked ${rankedSlots.length} time slots`);

    return {
      slots: rankedSlots.slice(0, 5),
      totalCandidates: candidateSlots.length,
      analysisContext: `Analyzed ${candidateSlots.length} potential slots, filtered to ${conflictFreeSlots.length} available options, and ranked the top ${Math.min(5, rankedSlots.length)} using AI.`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating time slot suggestions:', error);
    throw new Error(`Failed to suggest time slots: ${errorMessage}`);
  }
}

/**
 * Generate candidate time slots for a given date and duration
 */
export function generateTimeSlots(
  date: Date,
  duration: number,
  preferredTimeRange?: { start: string; end: string }
): { startTime: Date; endTime: Date }[] {
  const slots: { startTime: Date; endTime: Date }[] = [];

  let startHour = 9;
  let startMinute = 0;
  let endHour = 17;
  let endMinute = 0;

  if (preferredTimeRange) {
    const [prefStartHour, prefStartMinute] = preferredTimeRange.start
      .split(':')
      .map(Number);
    const [prefEndHour, prefEndMinute] = preferredTimeRange.end
      .split(':')
      .map(Number);

    startHour = prefStartHour;
    startMinute = prefStartMinute;
    endHour = prefEndHour;
    endMinute = prefEndMinute;
  }

  let slotStart = new Date(date);
  slotStart.setHours(startHour, startMinute, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  while (slotStart < dayEnd) {
    const slotEnd = addMinutes(slotStart, duration);

    if (slotEnd <= dayEnd) {
      slots.push({
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
      });
    }

    slotStart = addMinutes(slotStart, 30);
  }

  return slots;
}

/**
 * Filter time slots by user availability rules
 */
export async function filterByAvailability(
  slots: { startTime: Date; endTime: Date }[],
  userId: string
): Promise<{ startTime: Date; endTime: Date }[]> {
  try {
    const availableSlots: { startTime: Date; endTime: Date }[] = [];

    for (const slot of slots) {
      const dayIndex = slot.startTime.getDay();
      const dayOfWeek = dayOfWeekMap[dayIndex];

      const rules = await prisma.availabilityRule.findMany({
        where: {
          userId,
          dayOfWeek,
          isActive: true,
        },
      });

      if (rules.length === 0) {
        continue;
      }

      const slotStartTime = `${slot.startTime.getHours().toString().padStart(2, '0')}:${slot.startTime.getMinutes().toString().padStart(2, '0')}`;
      const slotEndTime = `${slot.endTime.getHours().toString().padStart(2, '0')}:${slot.endTime.getMinutes().toString().padStart(2, '0')}`;

      let isAvailable = false;

      for (const rule of rules) {
        if (slotStartTime >= rule.startTime && slotEndTime <= rule.endTime) {
          isAvailable = true;
          break;
        }
      }

      if (isAvailable) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error filtering by availability:', error);
    throw new Error(`Failed to filter by availability: ${errorMessage}`);
  }
}

/**
 * Filter time slots by conflicts across multiple users
 */
export async function filterByConflicts(
  slots: { startTime: Date; endTime: Date }[],
  userIds: string[],
  bufferMinutes: number = 0
): Promise<{ startTime: Date; endTime: Date }[]> {
  try {
    const conflictFreeSlots: { startTime: Date; endTime: Date }[] = [];

    for (const slot of slots) {
      let hasConflict = false;

      const bufferedStart = addMinutes(slot.startTime, -bufferMinutes);
      const bufferedEnd = addMinutes(slot.endTime, bufferMinutes);

      for (const userId of userIds) {
        const conflicts = await conflictService.getConflictingEvents(
          userId,
          bufferedStart,
          bufferedEnd
        );

        if (conflicts.length > 0) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        conflictFreeSlots.push(slot);
      }
    }

    return conflictFreeSlots;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error filtering by conflicts:', error);
    throw new Error(`Failed to filter by conflicts: ${errorMessage}`);
  }
}

/**
 * Rank time slots using OpenAI GPT-4 with contextual reasoning
 */
export async function rankSlotsWithAI(
  slots: { startTime: Date; endTime: Date }[],
  context: string,
  participantCount: number
): Promise<RankedSlot[]> {
  try {
    if (slots.length === 0) {
      return [];
    }

    const slotDescriptions = slots
      .map((slot, index) => {
        return `${index + 1}. ${format(slot.startTime, 'EEEE, MMMM d, yyyy')} at ${format(slot.startTime, 'h:mm a')} - ${format(slot.endTime, 'h:mm a')}`;
      })
      .join('\n');

    const prompt = `You are an intelligent scheduling assistant. Analyze the following available time slots for a meeting and rank the top 5 based on typical business preferences and best practices.

Meeting Context: ${context}
Number of Participants: ${participantCount}

Available Time Slots:
${slotDescriptions}

Consider the following factors:
1. Time of day preferences (mid-morning and early afternoon are generally preferred)
2. Avoid very early morning (before 9 AM) or late afternoon (after 4 PM) slots when possible
3. Mid-week days (Tuesday, Wednesday, Thursday) are often better than Monday or Friday
4. Allow for preparation time (mid-morning slots like 10 AM are often ideal)
5. Avoid immediately after lunch (12-1 PM) for important meetings
6. Consider participant count (larger meetings benefit from mid-day slots)

Respond with a JSON array of the top 5 slots in this exact format:
[
  {
    "slotIndex": 1,
    "score": 95,
    "reasoning": "Tuesday at 10:00 AM is ideal for productive meetings, allowing morning preparation time and avoiding early-morning fatigue.",
    "confidenceLevel": "high"
  }
]

Score from 0-100 where 100 is the most ideal time.
Confidence levels: "low", "medium", "high"
Only return the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a scheduling expert that provides practical, business-focused recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    let rankings;
    try {
      rankings = JSON.parse(aiResponse);
    } catch {
      console.error('Failed to parse AI response:', aiResponse);
      return slots.slice(0, 5).map((slot, index) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        score: 80 - index * 10,
        reasoning: 'Available time slot based on calendar availability.',
        confidenceLevel: 'medium' as const,
      }));
    }

    const rankedSlots: RankedSlot[] = rankings.map(
      (ranking: {
        slotIndex: number;
        score: number;
        reasoning: string;
        confidenceLevel: 'low' | 'medium' | 'high';
      }) => {
        const slot = slots[ranking.slotIndex - 1];

        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          score: ranking.score,
          reasoning: ranking.reasoning,
          confidenceLevel: ranking.confidenceLevel,
        };
      }
    );

    console.log(`AI successfully ranked ${rankedSlots.length} time slots`);

    return rankedSlots;
  } catch (error) {
    console.error('Error ranking slots with AI:', error);

    return slots.slice(0, 5).map((slot, index) => {
      const hour = slot.startTime.getHours();
      let score = 70;

      if (hour >= 9 && hour < 11) {
        score = 90;
      } else if (hour >= 13 && hour < 15) {
        score = 85;
      } else if (hour >= 11 && hour < 12) {
        score = 80;
      } else if ((hour >= 8 && hour < 9) || (hour >= 15 && hour < 16)) {
        score = 75;
      }

      score -= index * 2;

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        score: Math.max(score, 50),
        reasoning:
          'Available time slot based on calendar availability and general business hour preferences.',
        confidenceLevel: 'medium' as const,
      };
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of AISchedulingService
 */
export const aiSchedulingService = new AISchedulingService();

/**
 * Default export for convenience
 */
export default aiSchedulingService;
