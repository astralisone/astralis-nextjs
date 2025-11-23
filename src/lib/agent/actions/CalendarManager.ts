/**
 * Calendar Manager - Action Executor for Calendar Operations
 *
 * This module provides comprehensive calendar management capabilities for the
 * Orchestration Agent system. It handles event creation, updates, cancellations,
 * rescheduling, conflict detection, and time slot suggestions.
 *
 * Features:
 * - Full CRUD operations for calendar events
 * - Intelligent conflict detection with buffer time support
 * - Smart time slot suggestions based on availability and preferences
 * - Reminder management
 * - Attendee management with status tracking
 * - Recurrence rule support
 *
 * @module CalendarManager
 * @version 1.0.0
 */

import { z } from 'zod';
import type {
  Logger,
  EventSummary,
  OrgSettings,
} from '../types/agent.types';
import {
  TIME_PREFERENCES,
  REMINDER_PRESETS,
  estimateDuration,
  isWithinBusinessHours,
  isDuringLunch,
  getRecommendedReminders,
} from '../prompts/scheduling';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Attendee status for calendar events
 */
export type AttendeeStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

/**
 * Event visibility settings
 */
export type EventVisibility = 'default' | 'public' | 'private' | 'confidential';

/**
 * Event status
 */
export type CalendarEventStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'conflict';

/**
 * Reminder method types
 */
export type ReminderMethod = 'email' | 'push' | 'sms' | 'popup';

/**
 * Recurrence frequency
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Conference provider types
 */
export type ConferenceProvider = 'google_meet' | 'zoom' | 'teams' | 'webex' | 'custom';

/**
 * Conflict type classification
 */
export type ConflictType =
  | 'OVERLAP'
  | 'BUFFER_VIOLATION'
  | 'DAILY_LIMIT'
  | 'CONSECUTIVE_LIMIT'
  | 'OUTSIDE_HOURS'
  | 'LUNCH_CONFLICT'
  | 'ATTENDEE_UNAVAILABLE';

/**
 * Attendee information for calendar events
 */
export interface CalendarAttendee {
  /** Unique identifier for internal users, null for external */
  id: string | null;
  /** Email address (required) */
  email: string;
  /** Display name */
  name: string;
  /** Current response status */
  status: AttendeeStatus;
  /** Whether this is an external attendee */
  isExternal: boolean;
  /** Whether this is the event organizer */
  isOrganizer?: boolean;
  /** Whether this attendee is required */
  isRequired?: boolean;
  /** Optional comment from attendee */
  comment?: string;
}

/**
 * Reminder configuration for events
 */
export interface EventReminder {
  /** Unique identifier */
  id?: string;
  /** Minutes before event to send reminder */
  minutesBefore: number;
  /** How to deliver the reminder */
  method: ReminderMethod;
  /** Whether the reminder has been sent */
  sent?: boolean;
  /** When the reminder was sent */
  sentAt?: Date;
}

/**
 * Recurrence rule for repeating events
 */
export interface RecurrenceRule {
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** Interval between occurrences (e.g., every 2 weeks) */
  interval: number;
  /** Days of the week for weekly recurrence (0=Sunday, 6=Saturday) */
  daysOfWeek?: number[];
  /** Day of the month for monthly recurrence */
  dayOfMonth?: number;
  /** End date for the recurrence */
  endDate?: Date;
  /** Maximum number of occurrences */
  count?: number;
  /** Exceptions to the recurrence (dates to skip) */
  exceptions?: Date[];
}

/**
 * Conference/meeting link data
 */
export interface ConferenceData {
  /** Whether to create a conference link */
  createRequest: boolean;
  /** Conference provider */
  provider: ConferenceProvider;
  /** Meeting URL (if already created) */
  meetingUrl?: string;
  /** Meeting ID */
  meetingId?: string;
  /** Meeting password/passcode */
  password?: string;
  /** Dial-in information */
  dialIn?: string;
}

/**
 * Event metadata for additional context
 */
export interface EventMetadata {
  /** Source of the event creation */
  source?: 'agent' | 'manual' | 'api' | 'calendar_sync';
  /** Related entity IDs (intake, booking, etc.) */
  relatedEntityIds?: Record<string, string>;
  /** Custom fields */
  customFields?: Record<string, unknown>;
  /** Tags for categorization */
  tags?: string[];
  /** Priority level (1-5) */
  priority?: number;
  /** AI-generated suggestions metadata */
  aiSuggestionMeta?: Record<string, unknown>;
}

/**
 * Full calendar event data structure
 */
export interface CalendarEvent {
  /** Unique identifier */
  id: string;
  /** User ID of the event owner */
  userId: string;
  /** Organization ID */
  orgId?: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event start time */
  startTime: Date;
  /** Event end time */
  endTime: Date;
  /** Timezone for the event */
  timezone: string;
  /** Physical location */
  location?: string;
  /** Virtual meeting link */
  meetingLink?: string;
  /** Conference data */
  conferenceData?: ConferenceData;
  /** List of attendees */
  attendees: CalendarAttendee[];
  /** Event status */
  status: CalendarEventStatus;
  /** Visibility setting */
  visibility?: EventVisibility;
  /** Reminders configured for this event */
  reminders: EventReminder[];
  /** Recurrence rule for repeating events */
  recurrence?: RecurrenceRule;
  /** Additional metadata */
  metadata?: EventMetadata;
  /** External calendar integration data */
  calendarIntegrationData?: Record<string, unknown>;
  /** When the event was created */
  createdAt: Date;
  /** When the event was last updated */
  updatedAt: Date;
}

/**
 * Input data for creating a new event
 */
export interface CreateEventInput {
  /** User ID of the event owner */
  userId: string;
  /** Organization ID */
  orgId?: string;
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event start time */
  startTime: Date;
  /** Event end time */
  endTime: Date;
  /** Timezone (defaults to UTC) */
  timezone?: string;
  /** Physical location */
  location?: string;
  /** Whether to create a virtual meeting link */
  createMeetingLink?: boolean;
  /** Conference provider preference */
  conferenceProvider?: ConferenceProvider;
  /** List of attendees */
  attendees?: Array<{
    id?: string | null;
    email: string;
    name: string;
    isRequired?: boolean;
  }>;
  /** Visibility setting */
  visibility?: EventVisibility;
  /** Reminder configuration */
  reminders?: Array<{
    minutesBefore: number;
    method: ReminderMethod;
  }>;
  /** Recurrence rule */
  recurrence?: RecurrenceRule;
  /** Additional metadata */
  metadata?: EventMetadata;
  /** Whether to send invites to attendees */
  sendInvites?: boolean;
}

/**
 * Input data for updating an event
 */
export interface UpdateEventInput {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated start time */
  startTime?: Date;
  /** Updated end time */
  endTime?: Date;
  /** Updated timezone */
  timezone?: string;
  /** Updated location */
  location?: string;
  /** Updated meeting link */
  meetingLink?: string;
  /** Updated conference data */
  conferenceData?: ConferenceData;
  /** Updated attendees */
  attendees?: CalendarAttendee[];
  /** Updated status */
  status?: CalendarEventStatus;
  /** Updated visibility */
  visibility?: EventVisibility;
  /** Updated reminders */
  reminders?: EventReminder[];
  /** Updated recurrence */
  recurrence?: RecurrenceRule;
  /** Updated metadata */
  metadata?: EventMetadata;
  /** Whether to notify attendees of changes */
  notifyAttendees?: boolean;
}

/**
 * Available time slot suggestion
 */
export interface TimeSlot {
  /** Start time of the slot */
  start: Date;
  /** End time of the slot */
  end: Date;
  /** Score indicating slot quality (0-1) */
  score: number;
  /** Reason why this slot is recommended */
  reasoning: string;
  /** Whether the slot is within business hours */
  isWithinBusinessHours: boolean;
  /** Whether the slot conflicts with lunch */
  isDuringLunch: boolean;
  /** Attendee availability for this slot */
  attendeeAvailability?: Array<{
    userId: string;
    isAvailable: boolean;
  }>;
}

/**
 * Conflicting event information
 */
export interface ConflictingEvent {
  /** Event ID */
  eventId: string;
  /** Event title */
  title: string;
  /** Event start time */
  start: Date;
  /** Event end time */
  end: Date;
  /** Type of conflict */
  conflictType: ConflictType;
  /** Which attendees are affected */
  affectedAttendees?: string[];
}

/**
 * Result of conflict detection
 */
export interface ConflictResult {
  /** Whether any conflicts were detected */
  hasConflicts: boolean;
  /** List of conflicting events */
  conflicts: ConflictingEvent[];
  /** Summary of conflicts */
  summary: string;
  /** Suggested resolution strategies */
  suggestedResolutions: string[];
  /** Severity level (1-5, 5 = most severe) */
  severity: number;
}

/**
 * Attendee data for adding to events
 */
export interface AddAttendeeInput {
  /** User ID (optional for external attendees) */
  id?: string | null;
  /** Email address */
  email: string;
  /** Display name */
  name: string;
  /** Whether the attendee is required */
  isRequired?: boolean;
  /** Whether this is an external attendee */
  isExternal?: boolean;
  /** Whether to send invite */
  sendInvite?: boolean;
}

/**
 * Configuration for the Calendar Manager
 */
export interface CalendarManagerConfig {
  /** Default timezone */
  defaultTimezone: string;
  /** Buffer time between events (minutes) */
  bufferMinutes: number;
  /** Business hours configuration */
  businessHours: {
    start: number;
    end: number;
  };
  /** Lunch break configuration */
  lunchBreak: {
    start: number;
    end: number;
  };
  /** Maximum meetings per day */
  maxMeetingsPerDay: number;
  /** Maximum consecutive hours of meetings */
  maxConsecutiveHours: number;
  /** Default event duration (minutes) */
  defaultDuration: number;
  /** Default conference provider */
  defaultConferenceProvider: ConferenceProvider;
  /** Whether to send invites by default */
  sendInvitesByDefault: boolean;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Schema for validating create event input
 */
export const CreateEventInputSchema = z.object({
  userId: z.string().min(1),
  orgId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string().optional(),
  location: z.string().max(500).optional(),
  createMeetingLink: z.boolean().optional(),
  conferenceProvider: z.enum(['google_meet', 'zoom', 'teams', 'webex', 'custom']).optional(),
  attendees: z.array(z.object({
    id: z.string().nullable().optional(),
    email: z.string().email(),
    name: z.string().min(1),
    isRequired: z.boolean().optional(),
  })).optional(),
  visibility: z.enum(['default', 'public', 'private', 'confidential']).optional(),
  reminders: z.array(z.object({
    minutesBefore: z.number().int().positive(),
    method: z.enum(['email', 'push', 'sms', 'popup']),
  })).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().positive(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    endDate: z.date().optional(),
    count: z.number().int().positive().optional(),
    exceptions: z.array(z.date()).optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  sendInvites: z.boolean().optional(),
});

/**
 * Schema for validating update event input
 */
export const UpdateEventInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  timezone: z.string().optional(),
  location: z.string().max(500).optional().nullable(),
  meetingLink: z.string().url().optional().nullable(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'conflict']).optional(),
  visibility: z.enum(['default', 'public', 'private', 'confidential']).optional(),
  notifyAttendees: z.boolean().optional(),
});

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/**
 * Default configuration for Calendar Manager
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarManagerConfig = {
  defaultTimezone: 'UTC',
  bufferMinutes: TIME_PREFERENCES.bufferMinutes,
  businessHours: TIME_PREFERENCES.businessHours,
  lunchBreak: TIME_PREFERENCES.lunchHours,
  maxMeetingsPerDay: TIME_PREFERENCES.maxMeetingsPerDay,
  maxConsecutiveHours: TIME_PREFERENCES.maxConsecutiveHours,
  defaultDuration: 30,
  defaultConferenceProvider: 'google_meet',
  sendInvitesByDefault: true,
};

// =============================================================================
// CALENDAR MANAGER ERROR CLASSES
// =============================================================================

/**
 * Base error class for Calendar Manager operations
 */
export class CalendarError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly eventId?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CalendarError';

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, CalendarError);
    }
  }
}

/**
 * Error thrown when an event is not found
 */
export class EventNotFoundError extends CalendarError {
  constructor(eventId: string) {
    super(`Event not found: ${eventId}`, 'EVENT_NOT_FOUND', eventId);
    this.name = 'EventNotFoundError';
  }
}

/**
 * Error thrown when there's a scheduling conflict
 */
export class ConflictError extends CalendarError {
  constructor(
    message: string,
    eventId?: string,
    public readonly conflicts?: ConflictingEvent[]
  ) {
    super(message, 'SCHEDULING_CONFLICT', eventId, { conflicts });
    this.name = 'ConflictError';
  }
}

/**
 * Error thrown when validation fails
 */
export class CalendarValidationError extends CalendarError {
  constructor(
    message: string,
    public readonly validationErrors?: z.ZodError
  ) {
    super(message, 'VALIDATION_ERROR', undefined, {
      errors: validationErrors?.errors,
    });
    this.name = 'CalendarValidationError';
  }
}

/**
 * Error thrown when an attendee operation fails
 */
export class AttendeeError extends CalendarError {
  constructor(message: string, eventId: string, public readonly attendeeId?: string) {
    super(message, 'ATTENDEE_ERROR', eventId, { attendeeId });
    this.name = 'AttendeeError';
  }
}

// =============================================================================
// PRISMA CLIENT TYPE (Simplified for standalone usage)
// =============================================================================

/**
 * Prisma-like client interface for database operations
 * This allows the manager to work with the actual Prisma client
 */
export interface CalendarPrismaClient {
  schedulingEvent: {
    create: (args: {
      data: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
    findUnique: (args: {
      where: { id: string };
      include?: Record<string, boolean>;
    }) => Promise<Record<string, unknown> | null>;
    findMany: (args: {
      where: Record<string, unknown>;
      include?: Record<string, boolean>;
      orderBy?: Record<string, string>;
    }) => Promise<Array<Record<string, unknown>>>;
    count: (args: { where: Record<string, unknown> }) => Promise<number>;
  };
  eventReminder: {
    create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
    createMany: (args: {
      data: Array<Record<string, unknown>>;
    }) => Promise<{ count: number }>;
    deleteMany: (args: { where: Record<string, unknown> }) => Promise<{ count: number }>;
    findMany: (args: { where: Record<string, unknown> }) => Promise<Array<Record<string, unknown>>>;
  };
  availabilityRule: {
    findMany: (args: {
      where: Record<string, unknown>;
    }) => Promise<Array<Record<string, unknown>>>;
  };
}

// =============================================================================
// CALENDAR MANAGER CLASS
// =============================================================================

/**
 * Calendar Manager - Action executor for calendar operations
 *
 * Provides comprehensive calendar management including:
 * - Event CRUD operations
 * - Conflict detection
 * - Time slot suggestions
 * - Reminder management
 * - Attendee management
 *
 * @example
 * ```typescript
 * const manager = new CalendarManager(prismaClient, {
 *   defaultTimezone: 'America/New_York',
 * });
 *
 * // Create an event
 * const event = await manager.createEvent({
 *   userId: 'user-123',
 *   title: 'Team Meeting',
 *   startTime: new Date('2024-01-15T10:00:00Z'),
 *   endTime: new Date('2024-01-15T11:00:00Z'),
 *   attendees: [
 *     { email: 'john@example.com', name: 'John Doe' },
 *   ],
 * });
 *
 * // Check for conflicts
 * const conflicts = await manager.checkConflicts(
 *   'user-123',
 *   new Date('2024-01-15T10:30:00Z'),
 *   new Date('2024-01-15T11:30:00Z')
 * );
 * ```
 */
export class CalendarManager {
  private readonly prisma: CalendarPrismaClient;
  private readonly config: CalendarManagerConfig;
  private readonly logger: Logger;

  /**
   * Create a new Calendar Manager instance
   *
   * @param prisma - Prisma client for database operations
   * @param config - Optional configuration overrides
   * @param logger - Optional logger instance
   */
  constructor(
    prisma: CalendarPrismaClient,
    config: Partial<CalendarManagerConfig> = {},
    logger?: Logger
  ) {
    this.prisma = prisma;
    this.config = { ...DEFAULT_CALENDAR_CONFIG, ...config };
    this.logger = logger || this.createDefaultLogger();

    this.logger.info('CalendarManager initialized', {
      timezone: this.config.defaultTimezone,
      bufferMinutes: this.config.bufferMinutes,
    });
  }

  // ===========================================================================
  // CORE CRUD OPERATIONS
  // ===========================================================================

  /**
   * Create a new calendar event
   *
   * @param eventData - Event creation data
   * @returns The created calendar event
   * @throws {CalendarValidationError} If input validation fails
   * @throws {ConflictError} If there are scheduling conflicts (optional)
   */
  async createEvent(eventData: CreateEventInput): Promise<CalendarEvent> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    this.logger.info(`[${requestId}] Creating calendar event`, {
      title: eventData.title,
      userId: eventData.userId,
    });

    // Validate input
    const validation = CreateEventInputSchema.safeParse(eventData);
    if (!validation.success) {
      this.logger.error(`[${requestId}] Validation failed`, validation.error);
      throw new CalendarValidationError(
        'Invalid event data',
        validation.error
      );
    }

    // Validate time range
    if (eventData.endTime <= eventData.startTime) {
      throw new CalendarValidationError(
        'End time must be after start time'
      );
    }

    // Prepare attendees
    const attendees: CalendarAttendee[] = (eventData.attendees || []).map((a) => ({
      id: a.id || null,
      email: a.email,
      name: a.name,
      status: 'pending' as AttendeeStatus,
      isExternal: !a.id,
      isRequired: a.isRequired ?? true,
    }));

    // Prepare reminders or use defaults
    const reminders: EventReminder[] = eventData.reminders?.map((r) => ({
      minutesBefore: r.minutesBefore,
      method: r.method,
    })) || this.getDefaultReminders(eventData, attendees);

    // Prepare conference data if requested
    let conferenceData: ConferenceData | undefined;
    if (eventData.createMeetingLink) {
      conferenceData = {
        createRequest: true,
        provider: eventData.conferenceProvider || this.config.defaultConferenceProvider,
      };
    }

    // Generate meeting link placeholder (would integrate with actual provider)
    const meetingLink = conferenceData?.createRequest
      ? this.generateMeetingLinkPlaceholder(conferenceData.provider)
      : undefined;

    // Create the event in database
    const eventId = this.generateEventId();
    const now = new Date();

    const dbEvent = await this.prisma.schedulingEvent.create({
      data: {
        id: eventId,
        userId: eventData.userId,
        orgId: eventData.orgId,
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        timezone: eventData.timezone || this.config.defaultTimezone,
        location: eventData.location,
        meetingLink,
        participantEmails: attendees.map((a) => a.email),
        status: 'SCHEDULED',
        aiSuggestionMeta: eventData.metadata?.aiSuggestionMeta || null,
        calendarIntegrationData: conferenceData ? { conference: conferenceData } : null,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create reminders
    if (reminders.length > 0) {
      await this.prisma.eventReminder.createMany({
        data: reminders.map((r) => ({
          id: this.generateReminderId(),
          eventId,
          reminderTime: new Date(eventData.startTime.getTime() - r.minutesBefore * 60 * 1000),
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        })),
      });
    }

    // Build response
    const event: CalendarEvent = {
      id: eventId,
      userId: eventData.userId,
      orgId: eventData.orgId,
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      timezone: eventData.timezone || this.config.defaultTimezone,
      location: eventData.location,
      meetingLink,
      conferenceData,
      attendees,
      status: 'scheduled',
      visibility: eventData.visibility || 'default',
      reminders,
      recurrence: eventData.recurrence,
      metadata: eventData.metadata,
      calendarIntegrationData: dbEvent.calendarIntegrationData as Record<string, unknown> | undefined,
      createdAt: now,
      updatedAt: now,
    };

    const elapsed = Date.now() - startTime;
    this.logger.info(`[${requestId}] Event created successfully`, {
      eventId,
      elapsed,
    });

    return event;
  }

  /**
   * Update an existing calendar event
   *
   * @param eventId - ID of the event to update
   * @param updates - Fields to update
   * @returns The updated calendar event
   * @throws {EventNotFoundError} If the event doesn't exist
   * @throws {CalendarValidationError} If update data is invalid
   */
  async updateEvent(
    eventId: string,
    updates: UpdateEventInput
  ): Promise<CalendarEvent> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Updating event`, { eventId });

    // Validate input
    const validation = UpdateEventInputSchema.safeParse(updates);
    if (!validation.success) {
      throw new CalendarValidationError(
        'Invalid update data',
        validation.error
      );
    }

    // Fetch existing event
    const existingEvent = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
      include: { reminders: true },
    });

    if (!existingEvent) {
      throw new EventNotFoundError(eventId);
    }

    // Validate time range if both times are being updated
    if (updates.startTime && updates.endTime) {
      if (updates.endTime <= updates.startTime) {
        throw new CalendarValidationError(
          'End time must be after start time'
        );
      }
    } else if (updates.startTime && !updates.endTime) {
      if (new Date(existingEvent.endTime as string) <= updates.startTime) {
        throw new CalendarValidationError(
          'New start time must be before existing end time'
        );
      }
    } else if (updates.endTime && !updates.startTime) {
      if (updates.endTime <= new Date(existingEvent.startTime as string)) {
        throw new CalendarValidationError(
          'New end time must be after existing start time'
        );
      }
    }

    // Map status to database enum
    const statusMap: Record<CalendarEventStatus, string> = {
      scheduled: 'SCHEDULED',
      confirmed: 'CONFIRMED',
      cancelled: 'CANCELLED',
      completed: 'COMPLETED',
      conflict: 'CONFLICT',
    };

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.meetingLink !== undefined) updateData.meetingLink = updates.meetingLink;
    if (updates.status !== undefined) updateData.status = statusMap[updates.status];

    // Update the event
    const updatedDbEvent = await this.prisma.schedulingEvent.update({
      where: { id: eventId },
      data: updateData,
    });

    // Update reminders if provided
    if (updates.reminders) {
      // Delete existing reminders
      await this.prisma.eventReminder.deleteMany({
        where: { eventId },
      });

      // Create new reminders
      const eventStartTime = updates.startTime || new Date(existingEvent.startTime as string);
      await this.prisma.eventReminder.createMany({
        data: updates.reminders.map((r) => ({
          id: this.generateReminderId(),
          eventId,
          reminderTime: new Date(eventStartTime.getTime() - r.minutesBefore * 60 * 1000),
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
    }

    // Build response
    const event = this.mapDbEventToCalendarEvent(updatedDbEvent, updates.attendees || []);

    this.logger.info(`[${requestId}] Event updated successfully`, { eventId });

    return event;
  }

  /**
   * Cancel a calendar event
   *
   * @param eventId - ID of the event to cancel
   * @param reason - Optional cancellation reason
   * @throws {EventNotFoundError} If the event doesn't exist
   */
  async cancelEvent(eventId: string, reason?: string): Promise<void> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Cancelling event`, { eventId, reason });

    // Verify event exists
    const existingEvent = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      throw new EventNotFoundError(eventId);
    }

    // Update status to cancelled
    await this.prisma.schedulingEvent.update({
      where: { id: eventId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
        calendarIntegrationData: {
          ...(existingEvent.calendarIntegrationData as Record<string, unknown> || {}),
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        },
      },
    });

    // Cancel pending reminders
    await this.prisma.eventReminder.deleteMany({
      where: {
        eventId,
        status: 'PENDING',
      },
    });

    this.logger.info(`[${requestId}] Event cancelled successfully`, { eventId });
  }

  /**
   * Reschedule an event to a new time
   *
   * @param eventId - ID of the event to reschedule
   * @param newStart - New start time
   * @param newEnd - New end time
   * @returns The rescheduled event
   * @throws {EventNotFoundError} If the event doesn't exist
   * @throws {ConflictError} If the new time has conflicts
   */
  async rescheduleEvent(
    eventId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<CalendarEvent> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Rescheduling event`, {
      eventId,
      newStart,
      newEnd,
    });

    // Validate time range
    if (newEnd <= newStart) {
      throw new CalendarValidationError(
        'End time must be after start time'
      );
    }

    // Fetch existing event
    const existingEvent = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
      include: { reminders: true },
    });

    if (!existingEvent) {
      throw new EventNotFoundError(eventId);
    }

    // Check for conflicts at new time
    const conflicts = await this.checkConflicts(
      existingEvent.userId as string,
      newStart,
      newEnd,
      eventId // Exclude current event
    );

    if (conflicts.hasConflicts) {
      throw new ConflictError(
        `Cannot reschedule: ${conflicts.summary}`,
        eventId,
        conflicts.conflicts
      );
    }

    // Update the event
    const updatedEvent = await this.updateEvent(eventId, {
      startTime: newStart,
      endTime: newEnd,
      notifyAttendees: true,
    });

    // Update reminders with new times
    const existingReminders = (existingEvent.reminders || []) as Array<{ reminderTime: Date }>;
    const originalStart = new Date(existingEvent.startTime as string);

    await this.prisma.eventReminder.deleteMany({
      where: { eventId },
    });

    if (existingReminders.length > 0) {
      await this.prisma.eventReminder.createMany({
        data: existingReminders.map((r) => {
          const minutesBefore = Math.round(
            (originalStart.getTime() - new Date(r.reminderTime).getTime()) / 60000
          );
          return {
            id: this.generateReminderId(),
            eventId,
            reminderTime: new Date(newStart.getTime() - minutesBefore * 60 * 1000),
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      });
    }

    this.logger.info(`[${requestId}] Event rescheduled successfully`, {
      eventId,
      newStart,
      newEnd,
    });

    return updatedEvent;
  }

  // ===========================================================================
  // AVAILABILITY AND CONFLICT DETECTION
  // ===========================================================================

  /**
   * Find available time slots for a user on a given date
   *
   * @param userId - User to find slots for
   * @param date - Date to search for slots
   * @param duration - Required duration in minutes
   * @returns Array of available time slots sorted by score
   */
  async findAvailableSlots(
    userId: string,
    date: Date,
    duration: number
  ): Promise<TimeSlot[]> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Finding available slots`, {
      userId,
      date,
      duration,
    });

    // Get existing events for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingEvents = await this.prisma.schedulingEvent.findMany({
      where: {
        userId,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      orderBy: { startTime: 'asc' },
    });

    // Get user's availability rules
    const availabilityRules = await this.prisma.availabilityRule.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    // Build busy periods from existing events (with buffer)
    const busyPeriods = existingEvents.map((e) => ({
      start: new Date(new Date(e.startTime as string).getTime() - this.config.bufferMinutes * 60000),
      end: new Date(new Date(e.endTime as string).getTime() + this.config.bufferMinutes * 60000),
    }));

    // Generate potential slots
    const slots: TimeSlot[] = [];
    const businessStart = new Date(date);
    businessStart.setHours(this.config.businessHours.start, 0, 0, 0);
    const businessEnd = new Date(date);
    businessEnd.setHours(this.config.businessHours.end, 0, 0, 0);

    // Iterate through business hours in 15-minute increments
    const incrementMinutes = 15;
    let currentStart = new Date(businessStart);

    while (currentStart.getTime() + duration * 60000 <= businessEnd.getTime()) {
      const currentEnd = new Date(currentStart.getTime() + duration * 60000);

      // Check if slot overlaps with any busy period
      const isConflicting = busyPeriods.some(
        (busy) => currentStart < busy.end && currentEnd > busy.start
      );

      if (!isConflicting) {
        const slot = this.evaluateTimeSlot(currentStart, currentEnd, availabilityRules);
        if (slot.score > 0) {
          slots.push(slot);
        }
      }

      // Move to next slot
      currentStart = new Date(currentStart.getTime() + incrementMinutes * 60000);
    }

    // Sort by score (highest first)
    slots.sort((a, b) => b.score - a.score);

    this.logger.info(`[${requestId}] Found ${slots.length} available slots`);

    return slots;
  }

  /**
   * Check for scheduling conflicts
   *
   * @param userId - User to check conflicts for
   * @param start - Proposed start time
   * @param end - Proposed end time
   * @param excludeEventId - Optional event ID to exclude (for rescheduling)
   * @returns Conflict detection result
   */
  async checkConflicts(
    userId: string,
    start: Date,
    end: Date,
    excludeEventId?: string
  ): Promise<ConflictResult> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Checking conflicts`, {
      userId,
      start,
      end,
      excludeEventId,
    });

    const conflicts: ConflictingEvent[] = [];
    const suggestedResolutions: string[] = [];

    // Expand search window to include buffer time
    const searchStart = new Date(start.getTime() - this.config.bufferMinutes * 60000);
    const searchEnd = new Date(end.getTime() + this.config.bufferMinutes * 60000);

    // Find overlapping events
    const overlappingEvents = await this.prisma.schedulingEvent.findMany({
      where: {
        userId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            startTime: { gte: searchStart, lt: searchEnd },
          },
          {
            endTime: { gt: searchStart, lte: searchEnd },
          },
          {
            AND: [
              { startTime: { lte: searchStart } },
              { endTime: { gte: searchEnd } },
            ],
          },
        ],
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      },
    });

    // Classify conflicts
    for (const event of overlappingEvents) {
      const eventStart = new Date(event.startTime as string);
      const eventEnd = new Date(event.endTime as string);

      let conflictType: ConflictType = 'OVERLAP';

      // Check if it's a buffer violation vs direct overlap
      if (start >= eventEnd || end <= eventStart) {
        // Times don't directly overlap - check buffer
        const gapBefore = (start.getTime() - eventEnd.getTime()) / 60000;
        const gapAfter = (eventStart.getTime() - end.getTime()) / 60000;

        if (gapBefore >= 0 && gapBefore < this.config.bufferMinutes) {
          conflictType = 'BUFFER_VIOLATION';
          suggestedResolutions.push(
            `Move start time to ${this.config.bufferMinutes - gapBefore} minutes later`
          );
        } else if (gapAfter >= 0 && gapAfter < this.config.bufferMinutes) {
          conflictType = 'BUFFER_VIOLATION';
          suggestedResolutions.push(
            `Move end time to ${this.config.bufferMinutes - gapAfter} minutes earlier`
          );
        }
      } else {
        suggestedResolutions.push('Consider rescheduling to a different time');
      }

      conflicts.push({
        eventId: event.id as string,
        title: event.title as string,
        start: eventStart,
        end: eventEnd,
        conflictType,
      });
    }

    // Check business hours
    const businessHoursCheck = isWithinBusinessHours(
      start,
      this.config.defaultTimezone
    );
    if (!businessHoursCheck.isValid) {
      conflicts.push({
        eventId: 'BUSINESS_HOURS',
        title: 'Outside Business Hours',
        start,
        end,
        conflictType: 'OUTSIDE_HOURS',
      });
      suggestedResolutions.push('Move event to within business hours (9 AM - 5 PM)');
    }

    // Check lunch conflict
    if (isDuringLunch(start, this.config.defaultTimezone)) {
      conflicts.push({
        eventId: 'LUNCH_HOURS',
        title: 'During Lunch Break',
        start,
        end,
        conflictType: 'LUNCH_CONFLICT',
      });
      suggestedResolutions.push('Consider scheduling before or after lunch (12 PM - 1 PM)');
    }

    // Check daily meeting limit
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyCount = await this.prisma.schedulingEvent.count({
      where: {
        userId,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
        status: { not: 'CANCELLED' },
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      },
    });

    if (dailyCount >= this.config.maxMeetingsPerDay) {
      conflicts.push({
        eventId: 'DAILY_LIMIT',
        title: 'Daily Meeting Limit Reached',
        start,
        end,
        conflictType: 'DAILY_LIMIT',
      });
      suggestedResolutions.push('Consider scheduling on a different day');
    }

    // Calculate severity
    const severity = this.calculateConflictSeverity(conflicts);

    // Build summary
    const summary = conflicts.length > 0
      ? `Found ${conflicts.length} conflict(s): ${conflicts.map((c) => c.conflictType).join(', ')}`
      : 'No conflicts detected';

    this.logger.info(`[${requestId}] Conflict check complete`, {
      hasConflicts: conflicts.length > 0,
      conflictCount: conflicts.length,
      severity,
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      summary,
      suggestedResolutions: [...new Set(suggestedResolutions)],
      severity,
    };
  }

  // ===========================================================================
  // REMINDER MANAGEMENT
  // ===========================================================================

  /**
   * Create reminders for an event
   *
   * @param eventId - Event ID to create reminders for
   * @param reminderTimes - Array of minutes before event for each reminder
   */
  async createReminders(eventId: string, reminderTimes: number[]): Promise<void> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Creating reminders`, {
      eventId,
      reminderCount: reminderTimes.length,
    });

    // Fetch the event
    const event = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    const eventStart = new Date(event.startTime as string);
    const now = new Date();

    // Create reminders
    const remindersToCreate = reminderTimes
      .map((minutes) => {
        const reminderTime = new Date(eventStart.getTime() - minutes * 60000);
        return {
          id: this.generateReminderId(),
          eventId,
          reminderTime,
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        };
      })
      .filter((r) => r.reminderTime > now); // Only create future reminders

    if (remindersToCreate.length > 0) {
      await this.prisma.eventReminder.createMany({
        data: remindersToCreate,
      });
    }

    this.logger.info(`[${requestId}] Created ${remindersToCreate.length} reminders`);
  }

  // ===========================================================================
  // ATTENDEE MANAGEMENT
  // ===========================================================================

  /**
   * Add an attendee to an event
   *
   * @param eventId - Event ID
   * @param attendeeData - Attendee information
   */
  async addAttendee(eventId: string, attendeeData: AddAttendeeInput): Promise<void> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Adding attendee`, {
      eventId,
      email: attendeeData.email,
    });

    // Fetch the event
    const event = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    // Get existing attendees
    const existingEmails = (event.participantEmails as string[]) || [];

    // Check if already added
    if (existingEmails.includes(attendeeData.email)) {
      throw new AttendeeError(
        `Attendee ${attendeeData.email} is already added to this event`,
        eventId
      );
    }

    // Add new attendee
    const updatedEmails = [...existingEmails, attendeeData.email];

    await this.prisma.schedulingEvent.update({
      where: { id: eventId },
      data: {
        participantEmails: updatedEmails,
        updatedAt: new Date(),
      },
    });

    this.logger.info(`[${requestId}] Attendee added successfully`, {
      eventId,
      email: attendeeData.email,
    });
  }

  /**
   * Remove an attendee from an event
   *
   * @param eventId - Event ID
   * @param attendeeId - Attendee ID or email to remove
   */
  async removeAttendee(eventId: string, attendeeId: string): Promise<void> {
    const requestId = this.generateRequestId();
    this.logger.info(`[${requestId}] Removing attendee`, {
      eventId,
      attendeeId,
    });

    // Fetch the event
    const event = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new EventNotFoundError(eventId);
    }

    // Get existing attendees
    const existingEmails = (event.participantEmails as string[]) || [];

    // Find and remove attendee (by ID or email)
    const updatedEmails = existingEmails.filter(
      (email) => email !== attendeeId && email !== attendeeId
    );

    if (updatedEmails.length === existingEmails.length) {
      throw new AttendeeError(
        `Attendee ${attendeeId} not found in this event`,
        eventId,
        attendeeId
      );
    }

    await this.prisma.schedulingEvent.update({
      where: { id: eventId },
      data: {
        participantEmails: updatedEmails,
        updatedAt: new Date(),
      },
    });

    this.logger.info(`[${requestId}] Attendee removed successfully`, {
      eventId,
      attendeeId,
    });
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Get an event by ID
   *
   * @param eventId - Event ID
   * @returns The calendar event or null
   */
  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    const dbEvent = await this.prisma.schedulingEvent.findUnique({
      where: { id: eventId },
      include: { reminders: true },
    });

    if (!dbEvent) {
      return null;
    }

    return this.mapDbEventToCalendarEvent(dbEvent, []);
  }

  /**
   * Get events for a user within a date range
   *
   * @param userId - User ID
   * @param start - Start of date range
   * @param end - End of date range
   * @returns Array of calendar events
   */
  async getEventsInRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<CalendarEvent[]> {
    const events = await this.prisma.schedulingEvent.findMany({
      where: {
        userId,
        startTime: { gte: start },
        endTime: { lte: end },
        status: { not: 'CANCELLED' },
      },
      include: { reminders: true },
      orderBy: { startTime: 'asc' },
    });

    return events.map((e) => this.mapDbEventToCalendarEvent(e, []));
  }

  /**
   * Get event summaries for context building
   *
   * @param userId - User ID
   * @param date - Date to get events for
   * @returns Array of event summaries
   */
  async getEventSummaries(userId: string, date: Date): Promise<EventSummary[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await this.prisma.schedulingEvent.findMany({
      where: {
        userId,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
    });

    return events.map((e) => ({
      id: e.id as string,
      title: e.title as string,
      startTime: new Date(e.startTime as string),
      endTime: new Date(e.endTime as string),
      attendees: (e.participantEmails as string[]) || [],
      location: e.location as string | undefined,
      isConfirmed: e.status === 'CONFIRMED',
    }));
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Create a default logger instance
   */
  private createDefaultLogger(): Logger {
    return {
      debug: (message: string, data?: Record<string, unknown>) => {
        console.debug(`[CalendarManager] ${message}`, data || '');
      },
      info: (message: string, data?: Record<string, unknown>) => {
        console.info(`[CalendarManager] ${message}`, data || '');
      },
      warn: (message: string, data?: Record<string, unknown>) => {
        console.warn(`[CalendarManager] ${message}`, data || '');
      },
      error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
        console.error(`[CalendarManager] ${message}`, error, data || '');
      },
    };
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Generate a unique reminder ID
   */
  private generateReminderId(): string {
    return `rem_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Generate a unique request ID for logging
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Generate a placeholder meeting link
   */
  private generateMeetingLinkPlaceholder(provider: ConferenceProvider): string {
    const id = Math.random().toString(36).substring(2, 10);
    switch (provider) {
      case 'google_meet':
        return `https://meet.google.com/${id}`;
      case 'zoom':
        return `https://zoom.us/j/${id}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${id}`;
      case 'webex':
        return `https://webex.com/meet/${id}`;
      default:
        return `https://meeting.example.com/${id}`;
    }
  }

  /**
   * Get default reminders based on event properties
   */
  private getDefaultReminders(
    eventData: CreateEventInput,
    attendees: CalendarAttendee[]
  ): EventReminder[] {
    const hasExternalAttendees = attendees.some((a) => a.isExternal);
    const duration = Math.round(
      (eventData.endTime.getTime() - eventData.startTime.getTime()) / 60000
    );
    const isHighPriority = eventData.metadata?.priority === 5;

    const reminderConfig = getRecommendedReminders({
      hasExternalAttendees,
      isHighPriority,
      duration,
    });

    return reminderConfig.map((r) => ({
      minutesBefore: r.minutes,
      method: r.method as ReminderMethod,
    }));
  }

  /**
   * Evaluate a time slot and calculate its score
   */
  private evaluateTimeSlot(
    start: Date,
    end: Date,
    _availabilityRules: Array<Record<string, unknown>>
  ): TimeSlot {
    let score = 0.5; // Base score
    const reasons: string[] = [];

    const startHour = start.getHours();
    const businessHoursValid = isWithinBusinessHours(start, this.config.defaultTimezone);
    const duringLunch = isDuringLunch(start, this.config.defaultTimezone);

    // Adjust score based on time preferences
    if (businessHoursValid.isValid) {
      // Morning preference (9-11 AM)
      if (startHour >= 9 && startHour < 11) {
        score += 0.3;
        reasons.push('Preferred morning slot');
      }
      // Afternoon preference (2-4 PM)
      else if (startHour >= 14 && startHour < 16) {
        score += 0.25;
        reasons.push('Preferred afternoon slot');
      }
      // Pre-lunch (11-12)
      else if (startHour >= 11 && startHour < 12) {
        score += 0.15;
        reasons.push('Pre-lunch slot');
      }
      // End of day (4-5 PM)
      else if (startHour >= 16 && startHour < 17) {
        score += 0.1;
        reasons.push('End of day slot');
      }
    } else {
      score -= 0.3;
      reasons.push('Outside business hours');
    }

    // Penalize lunch hour
    if (duringLunch) {
      score -= 0.25;
      reasons.push('During lunch break');
    }

    // Cap score between 0 and 1
    score = Math.max(0, Math.min(1, score));

    return {
      start,
      end,
      score,
      reasoning: reasons.join('. ') || 'Available slot',
      isWithinBusinessHours: businessHoursValid.isValid,
      isDuringLunch: duringLunch,
    };
  }

  /**
   * Calculate conflict severity based on conflict types
   */
  private calculateConflictSeverity(conflicts: ConflictingEvent[]): number {
    if (conflicts.length === 0) return 0;

    const severityMap: Record<ConflictType, number> = {
      OVERLAP: 5,
      ATTENDEE_UNAVAILABLE: 4,
      DAILY_LIMIT: 3,
      CONSECUTIVE_LIMIT: 3,
      BUFFER_VIOLATION: 2,
      OUTSIDE_HOURS: 2,
      LUNCH_CONFLICT: 1,
    };

    const maxSeverity = Math.max(
      ...conflicts.map((c) => severityMap[c.conflictType] || 1)
    );

    return Math.min(5, maxSeverity);
  }

  /**
   * Map database event to CalendarEvent type
   */
  private mapDbEventToCalendarEvent(
    dbEvent: Record<string, unknown>,
    attendees: CalendarAttendee[]
  ): CalendarEvent {
    const statusMap: Record<string, CalendarEventStatus> = {
      SCHEDULED: 'scheduled',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      CONFLICT: 'conflict',
    };

    // Build attendees from participantEmails if not provided
    const eventAttendees = attendees.length > 0
      ? attendees
      : ((dbEvent.participantEmails as string[]) || []).map((email) => ({
          id: null,
          email,
          name: email.split('@')[0],
          status: 'pending' as AttendeeStatus,
          isExternal: true,
        }));

    // Map reminders
    const reminders: EventReminder[] = ((dbEvent.reminders as Array<Record<string, unknown>>) || []).map((r) => {
      const eventStart = new Date(dbEvent.startTime as string);
      const reminderTime = new Date(r.reminderTime as string);
      const minutesBefore = Math.round(
        (eventStart.getTime() - reminderTime.getTime()) / 60000
      );

      return {
        id: r.id as string,
        minutesBefore,
        method: 'email' as ReminderMethod,
        sent: r.status === 'SENT',
        sentAt: r.sentAt ? new Date(r.sentAt as string) : undefined,
      };
    });

    return {
      id: dbEvent.id as string,
      userId: dbEvent.userId as string,
      orgId: dbEvent.orgId as string | undefined,
      title: dbEvent.title as string,
      description: dbEvent.description as string | undefined,
      startTime: new Date(dbEvent.startTime as string),
      endTime: new Date(dbEvent.endTime as string),
      timezone: (dbEvent.timezone as string) || this.config.defaultTimezone,
      location: dbEvent.location as string | undefined,
      meetingLink: dbEvent.meetingLink as string | undefined,
      attendees: eventAttendees,
      status: statusMap[(dbEvent.status as string) || 'SCHEDULED'] || 'scheduled',
      visibility: 'default',
      reminders,
      metadata: dbEvent.aiSuggestionMeta
        ? { aiSuggestionMeta: dbEvent.aiSuggestionMeta as Record<string, unknown> }
        : undefined,
      calendarIntegrationData: dbEvent.calendarIntegrationData as Record<string, unknown> | undefined,
      createdAt: new Date(dbEvent.createdAt as string),
      updatedAt: new Date(dbEvent.updatedAt as string),
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a Calendar Manager instance with default configuration
 *
 * @param prisma - Prisma client
 * @param orgSettings - Optional organization settings for configuration
 * @param logger - Optional logger
 * @returns Configured CalendarManager instance
 */
export function createCalendarManager(
  prisma: CalendarPrismaClient,
  orgSettings?: Partial<OrgSettings>,
  logger?: Logger
): CalendarManager {
  const config: Partial<CalendarManagerConfig> = {};

  if (orgSettings) {
    config.defaultTimezone = orgSettings.timezone;

    if (orgSettings.workingHours) {
      const startHour = parseInt(orgSettings.workingHours.start.split(':')[0], 10);
      const endHour = parseInt(orgSettings.workingHours.end.split(':')[0], 10);

      config.businessHours = {
        start: startHour || 9,
        end: endHour || 17,
      };
    }

    if (orgSettings.lunchBreak) {
      const lunchStart = parseInt(orgSettings.lunchBreak.start.split(':')[0], 10);
      const lunchEnd = parseInt(orgSettings.lunchBreak.end.split(':')[0], 10);

      config.lunchBreak = {
        start: lunchStart || 12,
        end: lunchEnd || 13,
      };
    }

    if (orgSettings.defaultEventDuration) {
      config.defaultDuration = orgSettings.defaultEventDuration;
    }
  }

  return new CalendarManager(prisma, config, logger);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CalendarManager;
