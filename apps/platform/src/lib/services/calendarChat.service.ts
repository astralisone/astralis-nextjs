import OpenAI from 'openai';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { addDays, addWeeks, addMonths, startOfDay, endOfDay, parseISO, format, addHours, addMinutes } from 'date-fns';
import { addReminderJob } from '@/workers/queues/schedulingReminders.queue';

/**
 * Calendar Chat Service
 *
 * Handles conversational calendar management using OpenAI function calling.
 * Supports natural language queries for viewing, scheduling, and managing calendar events.
 *
 * Features:
 * - Intent classification (query, schedule, reschedule, cancel, availability)
 * - Entity extraction (dates, times, participants, duration)
 * - Calendar operations with confirmation flow
 * - Natural language date/time parsing
 * - Conflict detection
 */

// ============================================================================
// Types
// ============================================================================

export type Intent = 'query' | 'schedule' | 'schedule_event' | 'reschedule' | 'cancel' | 'cancel_event' | 'availability' | 'suggest' | 'unknown';

export interface Entities {
  dates?: Date[];
  times?: string[];
  participants?: string[];
  duration?: number; // minutes
  title?: string;
  location?: string;
  eventId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  participants?: string[];
  status: string;
  type: 'consultation' | 'audit' | 'meeting';
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ChatResponse {
  message: string;
  requiresConfirmation?: boolean;
  action?: {
    type: Intent;
    data: any;
  };
  data?: any;
}

// ============================================================================
// Calendar Chat Service Class
// ============================================================================

export class CalendarChatService {
  private openai: OpenAI;
  private chatModel = 'gpt-4-turbo-preview';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 2,
    });
  }

  /**
   * Process a calendar chat message
   */
  async processCalendarMessage(
    userId: string,
    orgId: string,
    message: string,
    context?: {
      previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      confirmed?: boolean;
      pendingAction?: any;
    }
  ): Promise<ChatResponse> {
    try {
      // If confirmation received, execute the pending action
      if (context?.confirmed && context?.pendingAction) {
        const result = await this.executeCalendarAction(
          context.pendingAction.type,
          context.pendingAction.data,
          userId,
          orgId
        );

        return {
          message: result.message,
          data: result.data,
          requiresConfirmation: false,
        };
      }

      // Use OpenAI function calling to interpret the message
      const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] = [
        {
          name: 'list_events',
          description: 'List calendar events in a date range. Use this when user wants to view their schedule.',
          parameters: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO format (YYYY-MM-DD)',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO format (YYYY-MM-DD)',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
        {
          name: 'check_availability',
          description: 'Check if user is available at a specific time or find free time slots.',
          parameters: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO format (YYYY-MM-DD)',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO format (YYYY-MM-DD)',
              },
              duration: {
                type: 'number',
                description: 'Required duration in minutes (optional)',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
        {
          name: 'schedule_event',
          description: 'Schedule a new calendar event. Always requires user confirmation.',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Event title',
              },
              startDateTime: {
                type: 'string',
                description: 'Start date and time in ISO format',
              },
              duration: {
                type: 'number',
                description: 'Duration in minutes',
              },
              participants: {
                type: 'array',
                items: { type: 'string' },
                description: 'Email addresses of participants',
              },
              description: {
                type: 'string',
                description: 'Event description (optional)',
              },
              location: {
                type: 'string',
                description: 'Event location (optional)',
              },
            },
            required: ['title', 'startDateTime', 'duration'],
          },
        },
        {
          name: 'find_time_slots',
          description: 'Find available time slots for a meeting of specific duration.',
          parameters: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date to search from in ISO format',
              },
              endDate: {
                type: 'string',
                description: 'End date to search until in ISO format',
              },
              duration: {
                type: 'number',
                description: 'Required duration in minutes',
              },
              maxSlots: {
                type: 'number',
                description: 'Maximum number of slots to return (default 5)',
              },
            },
            required: ['duration', 'startDate', 'endDate'],
          },
        },
        {
          name: 'cancel_event',
          description: 'Cancel a calendar event. Always requires user confirmation.',
          parameters: {
            type: 'object',
            properties: {
              eventId: {
                type: 'string',
                description: 'Event ID to cancel',
              },
            },
            required: ['eventId'],
          },
        },
        {
          name: 'set_reminder',
          description: 'Set a reminder for an event or create a standalone reminder. Use when user asks to remind them about something.',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'What to remind about',
              },
              reminderTime: {
                type: 'string',
                description: 'When to send the reminder in ISO format',
              },
              eventId: {
                type: 'string',
                description: 'Optional event ID to attach reminder to',
              },
              notifyBefore: {
                type: 'number',
                description: 'Minutes before event to remind (e.g., 15, 60, 1440 for 24h)',
              },
            },
            required: ['title', 'reminderTime'],
          },
        },
        {
          name: 'list_reminders',
          description: 'List upcoming reminders for the user.',
          parameters: {
            type: 'object',
            properties: {
              startDate: {
                type: 'string',
                description: 'Start date in ISO format',
              },
              endDate: {
                type: 'string',
                description: 'End date in ISO format',
              },
            },
            required: ['startDate', 'endDate'],
          },
        },
      ];

      const systemPrompt = `You are a helpful calendar assistant. You help users manage their calendar using natural language.

Current date and time: ${new Date().toISOString()}

When interpreting dates:
- "tomorrow" = ${format(addDays(new Date(), 1), 'yyyy-MM-dd')}
- "next week" = ${format(addWeeks(new Date(), 1), 'yyyy-MM-dd')} to ${format(addWeeks(new Date(), 2), 'yyyy-MM-dd')}
- "this week" = ${format(startOfDay(new Date()), 'yyyy-MM-dd')} to ${format(endOfDay(addDays(new Date(), 7)), 'yyyy-MM-dd')}

Guidelines:
- Be conversational and helpful
- Always confirm before creating, modifying, or deleting events
- Parse dates and times naturally (e.g., "tomorrow at 2pm", "next Tuesday")
- Provide clear summaries of events and time slots
- If information is missing, ask clarifying questions
- Use appropriate function calls to fulfill user requests`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...(context?.previousMessages || []),
        { role: 'user', content: message },
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.chatModel,
        messages,
        functions,
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseMessage = completion.choices[0].message;

      // If AI wants to call a function
      if (responseMessage.function_call) {
        const functionName = responseMessage.function_call.name;
        const functionArgs = JSON.parse(responseMessage.function_call.arguments);

        console.log(`[CalendarChat] Function call: ${functionName}`, functionArgs);

        // Execute the function
        const functionResult = await this.executeFunctionCall(
          functionName,
          functionArgs,
          userId,
          orgId
        );

        // Determine if confirmation is required
        const requiresConfirmation = this.requiresConfirmation(functionName as Intent);

        if (requiresConfirmation) {
          // Return confirmation request
          return {
            message: functionResult.message,
            requiresConfirmation: true,
            action: {
              type: functionName as Intent,
              data: functionArgs,
            },
          };
        } else {
          // Return result directly
          return {
            message: functionResult.message,
            data: functionResult.data,
            requiresConfirmation: false,
          };
        }
      }

      // No function call, return AI response
      return {
        message: responseMessage.content || 'I apologize, but I could not understand that request.',
        requiresConfirmation: false,
      };
    } catch (error) {
      console.error('[CalendarChat] Process message error:', error);
      return {
        message: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        requiresConfirmation: false,
      };
    }
  }

  /**
   * Execute a function call from OpenAI
   */
  private async executeFunctionCall(
    functionName: string,
    args: any,
    userId: string,
    orgId: string
  ): Promise<ActionResult> {
    try {
      switch (functionName) {
        case 'list_events':
          return await this.listEvents(userId, orgId, parseISO(args.startDate), parseISO(args.endDate));

        case 'check_availability':
          return await this.checkAvailability(
            userId,
            orgId,
            parseISO(args.startDate),
            parseISO(args.endDate),
            args.duration
          );

        case 'schedule_event':
          return await this.prepareScheduleEvent(args);

        case 'find_time_slots':
          return await this.findTimeSlots(
            userId,
            orgId,
            parseISO(args.startDate),
            parseISO(args.endDate),
            args.duration,
            args.maxSlots || 5
          );

        case 'cancel_event':
          return await this.prepareCancelEvent(userId, orgId, args.eventId);

        case 'set_reminder':
          return await this.setReminder(
            userId,
            orgId,
            args.title,
            parseISO(args.reminderTime),
            args.eventId,
            args.notifyBefore
          );

        case 'list_reminders':
          return await this.listReminders(
            userId,
            parseISO(args.startDate),
            parseISO(args.endDate)
          );

        default:
          return {
            success: false,
            message: `Unknown function: ${functionName}`,
            error: 'Unknown function',
          };
      }
    } catch (error) {
      console.error(`[CalendarChat] Function execution error (${functionName}):`, error);
      return {
        success: false,
        message: `Failed to execute ${functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute calendar action after confirmation
   */
  async executeCalendarAction(
    intent: Intent,
    data: any,
    userId: string,
    orgId: string
  ): Promise<ActionResult> {
    try {
      switch (intent) {
        case 'schedule_event':
        case 'schedule':
          return await this.scheduleEvent(userId, orgId, data);

        case 'cancel':
          return await this.cancelEvent(userId, orgId, data.eventId);

        default:
          return {
            success: false,
            message: `Cannot execute action: ${intent}`,
            error: 'Invalid intent',
          };
      }
    } catch (error) {
      console.error('[CalendarChat] Action execution error:', error);
      return {
        success: false,
        message: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if an intent requires confirmation
   */
  private requiresConfirmation(intent: string): boolean {
    return ['schedule', 'schedule_event', 'reschedule', 'cancel', 'cancel_event'].includes(intent);
  }

  // ============================================================================
  // Calendar Operations
  // ============================================================================

  /**
   * List events in a date range
   */
  private async listEvents(
    userId: string,
    orgId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActionResult> {
    try {
      // Fetch consultations
      const consultations = await prisma.consultations.findMany({
        where: {
          userId,
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      // Fetch audit bookings
      const auditBookings = await prisma.audit_bookings.findMany({
        where: {
          userId,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      // Fetch scheduling events
      const schedulingEvents = await prisma.schedulingEvent.findMany({
        where: {
          userId,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
        orderBy: { startTime: 'asc' },
      });

      const events: CalendarEvent[] = [
        ...consultations.map(c => ({
          id: c.id,
          title: c.title,
          startTime: c.scheduledAt || new Date(),
          endTime: addMinutes(c.scheduledAt || new Date(), c.duration),
          description: c.description || undefined,
          location: c.meetingUrl || undefined,
          participants: c.clientEmail ? [c.clientEmail] : [],
          status: c.status,
          type: 'consultation' as const,
        })),
        ...auditBookings.map(a => ({
          id: a.id,
          title: `${a.auditType} Audit - ${a.clientName}`,
          startTime: a.scheduledDate,
          endTime: addMinutes(a.scheduledDate, a.duration),
          description: a.additionalNotes || undefined,
          location: a.meetingLink || undefined,
          participants: [a.clientEmail],
          status: a.status,
          type: 'audit' as const,
        })),
        ...schedulingEvents.map(s => ({
          id: s.id,
          title: s.title,
          startTime: s.startTime,
          endTime: s.endTime,
          description: s.description || undefined,
          location: s.location || s.meetingLink || undefined,
          participants: s.participantEmails,
          status: s.status,
          type: 'meeting' as const,
        })),
      ];

      events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      if (events.length === 0) {
        return {
          success: true,
          message: `You have no events scheduled between ${format(startDate, 'MMM d')} and ${format(endDate, 'MMM d, yyyy')}.`,
          data: { events: [] },
        };
      }

      const eventList = events
        .map(
          (e, idx) =>
            `${idx + 1}. **${e.title}**\n   📅 ${format(e.startTime, 'EEE, MMM d')} at ${format(e.startTime, 'h:mm a')}\n   ⏱️ ${Math.round((e.endTime.getTime() - e.startTime.getTime()) / 60000)} minutes${e.location ? `\n   📍 ${e.location}` : ''}${(e.participants?.length ?? 0) > 0 ? `\n   👥 ${e.participants?.join(', ')}` : ''}`
        )
        .join('\n\n');

      return {
        success: true,
        message: `Here are your ${events.length} upcoming event${events.length > 1 ? 's' : ''}:\n\n${eventList}`,
        data: { events },
      };
    } catch (error) {
      console.error('[CalendarChat] List events error:', error);
      throw error;
    }
  }

  /**
   * Check availability
   */
  private async checkAvailability(
    userId: string,
    orgId: string,
    startDate: Date,
    endDate: Date,
    duration?: number
  ): Promise<ActionResult> {
    try {
      const result = await this.listEvents(userId, orgId, startDate, endDate);

      if (!result.success) {
        return result;
      }

      const events: CalendarEvent[] = result.data?.events || [];

      if (events.length === 0) {
        return {
          success: true,
          message: `You are completely free between ${format(startDate, 'MMM d')} and ${format(endDate, 'MMM d, yyyy')}! ${duration ? `Plenty of time for a ${duration}-minute meeting.` : ''}`,
          data: { available: true, conflicts: [] },
        };
      }

      const conflictList = events
        .map((e: CalendarEvent) => `- ${format(e.startTime, 'EEE, MMM d at h:mm a')}: ${e.title}`)
        .join('\n');

      return {
        success: true,
        message: `You have ${events.length} event${events.length > 1 ? 's' : ''} during that time:\n\n${conflictList}`,
        data: { available: false, conflicts: events },
      };
    } catch (error) {
      console.error('[CalendarChat] Check availability error:', error);
      throw error;
    }
  }

  /**
   * Prepare schedule event (return confirmation message)
   */
  private async prepareScheduleEvent(data: any): Promise<ActionResult> {
    const startTime = parseISO(data.startDateTime);
    const endTime = addMinutes(startTime, data.duration);

    const participantList = data.participants?.length > 0
      ? `\n👥 Participants: ${data.participants.join(', ')}`
      : '';

    const locationInfo = data.location ? `\n📍 Location: ${data.location}` : '';
    const descriptionInfo = data.description ? `\n📝 ${data.description}` : '';

    return {
      success: true,
      message: `I'll schedule the following event:\n\n**${data.title}**\n📅 ${format(startTime, 'EEEE, MMMM d, yyyy')}\n⏰ ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')} (${data.duration} minutes)${participantList}${locationInfo}${descriptionInfo}\n\nPlease confirm to proceed.`,
    };
  }

  /**
   * Schedule event (after confirmation)
   */
  private async scheduleEvent(userId: string, orgId: string, data: any): Promise<ActionResult> {
    try {
      const startTime = parseISO(data.startDateTime);
      const endTime = addMinutes(startTime, data.duration);

      // Create SchedulingEvent
      const schedulingEvent = await prisma.schedulingEvent.create({
        data: {
          id: randomUUID(),
          userId,
          orgId: orgId || undefined,
          title: data.title,
          description: data.description || undefined,
          startTime,
          endTime,
          timezone: 'UTC',
          location: data.location || undefined,
          meetingLink: data.meetingLink || undefined,
          participantEmails: data.participants || [],
          status: 'SCHEDULED',
        },
      });

      // Create default reminder 15 minutes before the event
      const reminderTime = addMinutes(startTime, -15);
      const reminder = await prisma.eventReminder.create({
        data: {
          id: randomUUID(),
          eventId: schedulingEvent.id,
          reminderTime,
          status: 'PENDING',
        },
      });

      // Queue the reminder for processing
      try {
        await addReminderJob({
          reminderId: reminder.id,
          eventId: reminder.eventId,
        });
      } catch (queueError) {
        console.error(`[CalendarChat] Failed to queue reminder ${reminder.id}:`, queueError);
        // Don't fail event creation if queueing fails
      }

      return {
        success: true,
        message: `Event scheduled successfully!\n\n**${data.title}** is now on your calendar for ${format(startTime, 'EEEE, MMMM d')} at ${format(startTime, 'h:mm a')}.\nA reminder has been set for 15 minutes before the event.`,
        data: { eventId: schedulingEvent.id },
      };
    } catch (error) {
      console.error('[CalendarChat] Schedule event error:', error);
      throw error;
    }
  }

  /**
   * Prepare cancel event (return confirmation message)
   */
  private async prepareCancelEvent(userId: string, orgId: string, eventId: string): Promise<ActionResult> {
    try {
      // Try to find the event
      const consultation = await prisma.consultations.findFirst({
        where: { id: eventId, userId },
      });

      const auditBooking = await prisma.audit_bookings.findFirst({
        where: { id: eventId, userId },
      });

      const event = consultation || auditBooking;

      if (!event) {
        return {
          success: false,
          message: 'Event not found or you do not have permission to cancel it.',
          error: 'Event not found',
        };
      }

      const title = consultation ? consultation.title : `${auditBooking?.auditType} Audit`;
      const scheduledAt = consultation ? consultation.scheduledAt : auditBooking?.scheduledDate;

      return {
        success: true,
        message: `Are you sure you want to cancel:\n\n**${title}**\n📅 ${scheduledAt ? format(scheduledAt, 'EEEE, MMMM d at h:mm a') : 'Unknown time'}\n\nPlease confirm to proceed.`,
      };
    } catch (error) {
      console.error('[CalendarChat] Prepare cancel error:', error);
      throw error;
    }
  }

  /**
   * Cancel event (after confirmation)
   */
  private async cancelEvent(userId: string, orgId: string, eventId: string): Promise<ActionResult> {
    try {
      // Try consultation first
      const consultation = await prisma.consultations.findFirst({
        where: { id: eventId, userId },
      });

      if (consultation) {
        await prisma.consultations.update({
          where: { id: eventId },
          data: { status: 'CANCELLED' },
        });

        return {
          success: true,
          message: `✅ Event cancelled successfully.\n\n**${consultation.title}** has been removed from your calendar.`,
        };
      }

      // Try audit booking
      const auditBooking = await prisma.audit_bookings.findFirst({
        where: { id: eventId, userId },
      });

      if (auditBooking) {
        await prisma.audit_bookings.update({
          where: { id: eventId },
          data: { status: 'CANCELLED' },
        });

        return {
          success: true,
          message: `✅ Event cancelled successfully.\n\nYour ${auditBooking.auditType} audit has been cancelled.`,
        };
      }

      return {
        success: false,
        message: 'Event not found or already cancelled.',
        error: 'Event not found',
      };
    } catch (error) {
      console.error('[CalendarChat] Cancel event error:', error);
      throw error;
    }
  }

  /**
   * Find available time slots
   */
  private async findTimeSlots(
    userId: string,
    orgId: string,
    startDate: Date,
    endDate: Date,
    duration: number,
    maxSlots: number
  ): Promise<ActionResult> {
    try {
      // Get all events in range
      const eventsResult = await this.listEvents(userId, orgId, startDate, endDate);
      const events: CalendarEvent[] = eventsResult.data?.events || [];

      // Business hours: 9 AM - 5 PM, Monday - Friday
      const businessHours = { start: 9, end: 17 };
      const slots: Array<{ start: Date; end: Date }> = [];

      let currentDate = startOfDay(startDate);
      const searchEndDate = endOfDay(endDate);

      while (currentDate <= searchEndDate && slots.length < maxSlots) {
        const dayOfWeek = currentDate.getDay();

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // Check each hour during business hours
        for (let hour = businessHours.start; hour < businessHours.end; hour++) {
          const slotStart = addHours(startOfDay(currentDate), hour);
          const slotEnd = addMinutes(slotStart, duration);

          // Check if slot is within business hours
          if (slotEnd.getHours() > businessHours.end) {
            continue;
          }

          // Check for conflicts
          const hasConflict = events.some(event => {
            return (
              (slotStart >= event.startTime && slotStart < event.endTime) ||
              (slotEnd > event.startTime && slotEnd <= event.endTime) ||
              (slotStart <= event.startTime && slotEnd >= event.endTime)
            );
          });

          if (!hasConflict) {
            slots.push({ start: slotStart, end: slotEnd });

            if (slots.length >= maxSlots) {
              break;
            }
          }
        }

        if (slots.length >= maxSlots) {
          break;
        }

        currentDate = addDays(currentDate, 1);
      }

      if (slots.length === 0) {
        return {
          success: true,
          message: `I couldn't find any ${duration}-minute slots between ${format(startDate, 'MMM d')} and ${format(endDate, 'MMM d, yyyy')} during business hours (9 AM - 5 PM, Mon-Fri). Your calendar is quite busy!`,
          data: { slots: [] },
        };
      }

      const slotList = slots
        .map(
          (slot, idx) =>
            `${idx + 1}. ${format(slot.start, 'EEE, MMM d')} at ${format(slot.start, 'h:mm a')} - ${format(slot.end, 'h:mm a')}`
        )
        .join('\n');

      return {
        success: true,
        message: `Here are ${slots.length} available ${duration}-minute time slot${slots.length > 1 ? 's' : ''}:\n\n${slotList}\n\nWould you like to schedule a meeting in one of these slots?`,
        data: { slots },
      };
    } catch (error) {
      console.error('[CalendarChat] Find time slots error:', error);
      throw error;
    }
  }

  /**
   * Set a reminder for an event or create a standalone reminder
   * Note: EventReminder requires an eventId, so for standalone reminders we create a placeholder SchedulingEvent
   */
  private async setReminder(
    userId: string,
    orgId: string,
    title: string,
    reminderTime: Date,
    eventId?: string,
    notifyBefore?: number
  ): Promise<ActionResult> {
    try {
      let targetEventId = eventId;

      // If no eventId provided, create a placeholder SchedulingEvent for the standalone reminder
      if (!targetEventId) {
        const placeholderEvent = await prisma.schedulingEvent.create({
          data: {
            id: randomUUID(),
            userId,
            orgId: orgId || undefined,
            title: `Reminder: ${title}`,
            startTime: reminderTime,
            endTime: addMinutes(reminderTime, 15), // Default 15-minute duration for placeholder
            timezone: 'UTC',
            status: 'SCHEDULED',
          },
        });
        targetEventId = placeholderEvent.id;
      }

      // Calculate actual reminder time if notifyBefore is specified
      let actualReminderTime = reminderTime;
      if (notifyBefore && eventId) {
        // If notifyBefore is set and we have an existing event, fetch the event to calculate reminder time
        const event = await prisma.schedulingEvent.findUnique({
          where: { id: eventId },
        });
        if (event) {
          actualReminderTime = addMinutes(event.startTime, -notifyBefore);
        }
      }

      // Create the EventReminder record
      const reminder = await prisma.eventReminder.create({
        data: {
          id: randomUUID(),
          eventId: targetEventId,
          reminderTime: actualReminderTime,
          status: 'PENDING',
          retryCount: 0,
        },
      });

      // Queue the reminder for processing
      try {
        await addReminderJob({
          reminderId: reminder.id,
          eventId: reminder.eventId,
        });
      } catch (queueError) {
        console.error(`[CalendarChat] Failed to queue reminder ${reminder.id}:`, queueError);
        // Don't fail the operation if queueing fails
      }

      const formattedTime = format(actualReminderTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a');

      return {
        success: true,
        message: `Reminder set successfully!\n\n**${title}**\nYou will be reminded on ${formattedTime}.`,
        data: {
          reminderId: reminder.id,
          eventId: targetEventId,
          reminderTime: actualReminderTime,
        },
      };
    } catch (error) {
      console.error('[CalendarChat] Set reminder error:', error);
      throw error;
    }
  }

  /**
   * List reminders for a user within a date range
   */
  private async listReminders(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActionResult> {
    try {
      // Query EventReminder records within the date range for this user's events
      const reminders = await prisma.eventReminder.findMany({
        where: {
          reminderTime: {
            gte: startDate,
            lte: endDate,
          },
          event: {
            userId,
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: {
          reminderTime: 'asc',
        },
      });

      if (reminders.length === 0) {
        return {
          success: true,
          message: `You have no reminders scheduled between ${format(startDate, 'MMM d')} and ${format(endDate, 'MMM d, yyyy')}.`,
          data: { reminders: [] },
        };
      }

      const reminderList = reminders
        .map((r, idx) => {
          const statusIcon = r.status === 'SENT' ? '(sent)' : r.status === 'FAILED' ? '(failed)' : '(pending)';
          return `${idx + 1}. **${r.event.title}** ${statusIcon}\n   Reminder: ${format(r.reminderTime, 'EEE, MMM d \'at\' h:mm a')}\n   Event: ${format(r.event.startTime, 'EEE, MMM d \'at\' h:mm a')}`;
        })
        .join('\n\n');

      return {
        success: true,
        message: `Here are your ${reminders.length} upcoming reminder${reminders.length > 1 ? 's' : ''}:\n\n${reminderList}`,
        data: {
          reminders: reminders.map((r) => ({
            id: r.id,
            eventId: r.eventId,
            eventTitle: r.event.title,
            reminderTime: r.reminderTime,
            eventStartTime: r.event.startTime,
            status: r.status,
          })),
        },
      };
    } catch (error) {
      console.error('[CalendarChat] List reminders error:', error);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let calendarChatServiceInstance: CalendarChatService | null = null;

export function getCalendarChatService(): CalendarChatService {
  if (!calendarChatServiceInstance) {
    calendarChatServiceInstance = new CalendarChatService();
  }
  return calendarChatServiceInstance;
}
