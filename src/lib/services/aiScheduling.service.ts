/**
 * AI-Powered Scheduling Service
 *
 * Provides intelligent scheduling suggestions using:
 * - Time slot generation algorithms
 * - Availability and conflict filtering
 * - OpenAI GPT-4 ranking with contextual reasoning
 * - Multi-timezone support
 * - Buffer time consideration
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { addMinutes, format, startOfDay, endOfDay } from 'date-fns';
import * as conflictService from './conflict.service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Type definitions
 */
export interface SuggestionParams {
  userId: string;
  participantEmails?: string[];
  duration: number; // in minutes
  date: Date;
  preferredTimeRange?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  context?: string; // Additional context for AI ranking
  bufferMinutes?: number; // Buffer time before/after events
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface RankedSlot {
  startTime: Date;
  endTime: Date;
  score: number; // 0-100
  reasoning: string;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface TimeSlotSuggestion {
  slots: RankedSlot[];
  totalCandidates: number;
  analysisContext: string;
}

/**
 * Generate intelligent time slot suggestions
 *
 * @param params - Suggestion parameters
 * @returns Ranked time slot suggestions with AI reasoning
 */
export async function suggestTimeSlots(params: SuggestionParams): Promise<TimeSlotSuggestion> {
  try {
    // Step 1: Generate candidate time slots
    const candidateSlots = generateTimeSlots(
      params.date,
      params.duration,
      params.preferredTimeRange
    );

    console.log(`Generated ${candidateSlots.length} candidate time slots`);

    // Step 2: Filter by user availability
    const availableSlots = await filterByAvailability(candidateSlots, params.userId);

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

    const conflictFreeSlots = await filterByConflicts(availableSlots, userIds, params.bufferMinutes);

    console.log(`${conflictFreeSlots.length} slots after conflict filtering`);

    if (conflictFreeSlots.length === 0) {
      return {
        slots: [],
        totalCandidates: candidateSlots.length,
        analysisContext: 'No available time slots found after filtering for availability and conflicts.',
      };
    }

    // Step 4: Rank slots using AI
    const rankedSlots = await rankSlotsWithAI(
      conflictFreeSlots.slice(0, 20), // Limit to top 20 for AI processing
      params.context || 'General meeting',
      params.participantEmails?.length || 0
    );

    console.log(`AI ranked ${rankedSlots.length} time slots`);

    return {
      slots: rankedSlots.slice(0, 5), // Return top 5
      totalCandidates: candidateSlots.length,
      analysisContext: `Analyzed ${candidateSlots.length} potential slots, filtered to ${conflictFreeSlots.length} available options, and ranked the top ${Math.min(5, rankedSlots.length)} using AI.`,
    };
  } catch (error: any) {
    console.error('Error generating time slot suggestions:', error);
    throw new Error(`Failed to suggest time slots: ${error.message}`);
  }
}

/**
 * Generate candidate time slots for a given date and duration
 *
 * @param date - Date to generate slots for
 * @param duration - Duration in minutes
 * @param preferredTimeRange - Optional preferred time range
 * @returns Array of time slots
 */
export function generateTimeSlots(
  date: Date,
  duration: number,
  preferredTimeRange?: { start: string; end: string }
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Default business hours: 9 AM to 5 PM
  let startHour = 9;
  let startMinute = 0;
  let endHour = 17;
  let endMinute = 0;

  // Override with preferred time range if provided
  if (preferredTimeRange) {
    const [prefStartHour, prefStartMinute] = preferredTimeRange.start.split(':').map(Number);
    const [prefEndHour, prefEndMinute] = preferredTimeRange.end.split(':').map(Number);

    startHour = prefStartHour;
    startMinute = prefStartMinute;
    endHour = prefEndHour;
    endMinute = prefEndMinute;
  }

  let slotStart = new Date(date);
  slotStart.setHours(startHour, startMinute, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  // Generate 30-minute interval slots
  while (slotStart < dayEnd) {
    const slotEnd = addMinutes(slotStart, duration);

    // Only add slot if it doesn't extend beyond the day end
    if (slotEnd <= dayEnd) {
      slots.push({
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
      });
    }

    // Move to next 30-minute interval
    slotStart = addMinutes(slotStart, 30);
  }

  return slots;
}

/**
 * Filter time slots by user availability rules
 *
 * @param slots - Candidate time slots
 * @param userId - User ID to check availability for
 * @returns Filtered array of available time slots
 */
export async function filterByAvailability(slots: TimeSlot[], userId: string): Promise<TimeSlot[]> {
  try {
    const availableSlots: TimeSlot[] = [];

    for (const slot of slots) {
      const dayOfWeek = slot.startTime.getDay();

      // Get availability rules for this day
      const rules = await prisma.availabilityRule.findMany({
        where: {
          userId,
          dayOfWeek,
          isAvailable: true,
        },
      });

      // If no availability rules, skip this slot
      if (rules.length === 0) {
        continue;
      }

      // Check if slot falls within any availability rule
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
  } catch (error: any) {
    console.error('Error filtering by availability:', error);
    throw new Error(`Failed to filter by availability: ${error.message}`);
  }
}

/**
 * Filter time slots by conflicts across multiple users
 *
 * @param slots - Candidate time slots
 * @param userIds - Array of user IDs to check conflicts for
 * @param bufferMinutes - Optional buffer time in minutes
 * @returns Filtered array of conflict-free time slots
 */
export async function filterByConflicts(
  slots: TimeSlot[],
  userIds: string[],
  bufferMinutes: number = 0
): Promise<TimeSlot[]> {
  try {
    const conflictFreeSlots: TimeSlot[] = [];

    for (const slot of slots) {
      let hasConflict = false;

      // Apply buffer time
      const bufferedStart = addMinutes(slot.startTime, -bufferMinutes);
      const bufferedEnd = addMinutes(slot.endTime, bufferMinutes);

      // Check conflicts for all users
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
  } catch (error: any) {
    console.error('Error filtering by conflicts:', error);
    throw new Error(`Failed to filter by conflicts: ${error.message}`);
  }
}

/**
 * Rank time slots using OpenAI GPT-4 with contextual reasoning
 *
 * @param slots - Time slots to rank
 * @param context - Meeting context or description
 * @param participantCount - Number of participants
 * @returns Array of ranked slots with scores and reasoning
 */
export async function rankSlotsWithAI(
  slots: TimeSlot[],
  context: string,
  participantCount: number
): Promise<RankedSlot[]> {
  try {
    if (slots.length === 0) {
      return [];
    }

    // Format slots for AI analysis
    const slotDescriptions = slots.map((slot, index) => {
      return `${index + 1}. ${format(slot.startTime, 'EEEE, MMMM d, yyyy')} at ${format(slot.startTime, 'h:mm a')} - ${format(slot.endTime, 'h:mm a')}`;
    }).join('\n');

    // Create AI prompt
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

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a scheduling expert that provides practical, business-focused recommendations.',
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

    // Parse AI response
    let rankings;
    try {
      rankings = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback: return slots with default scoring
      return slots.slice(0, 5).map((slot, index) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        score: 80 - index * 10,
        reasoning: 'Available time slot based on calendar availability.',
        confidenceLevel: 'medium' as const,
      }));
    }

    // Map rankings back to slots
    const rankedSlots: RankedSlot[] = rankings.map((ranking: any) => {
      const slot = slots[ranking.slotIndex - 1];

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        score: ranking.score,
        reasoning: ranking.reasoning,
        confidenceLevel: ranking.confidenceLevel,
      };
    });

    console.log(`AI successfully ranked ${rankedSlots.length} time slots`);

    return rankedSlots;
  } catch (error: any) {
    console.error('Error ranking slots with AI:', error);

    // Fallback: return slots with simple time-of-day based scoring
    return slots.slice(0, 5).map((slot, index) => {
      const hour = slot.startTime.getHours();
      let score = 70;

      // Prefer mid-morning (9-11 AM)
      if (hour >= 9 && hour < 11) {
        score = 90;
      }
      // Early afternoon (1-3 PM) is good
      else if (hour >= 13 && hour < 15) {
        score = 85;
      }
      // Late morning (11 AM - 12 PM) is acceptable
      else if (hour >= 11 && hour < 12) {
        score = 80;
      }
      // Early morning (8-9 AM) or mid-afternoon (3-4 PM)
      else if ((hour >= 8 && hour < 9) || (hour >= 15 && hour < 16)) {
        score = 75;
      }

      // Slight penalty for each subsequent slot to encourage earlier options
      score -= index * 2;

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        score: Math.max(score, 50),
        reasoning: 'Available time slot based on calendar availability and general business hour preferences.',
        confidenceLevel: 'medium' as const,
      };
    });
  }
}
