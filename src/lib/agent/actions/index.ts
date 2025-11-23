/**
 * Agent Actions Module
 *
 * This module exports all action executors for the Orchestration Agent system.
 * Action executors are responsible for performing specific tasks like:
 * - Pipeline assignment and management
 * - Calendar event operations
 * - Notification dispatching
 * - Automation triggering
 *
 * @module agent/actions
 * @version 1.0.0
 */

// =============================================================================
// PIPELINE ASSIGNER
// =============================================================================

export {
  PipelineAssigner,
  createPipelineAssigner,
  // Types
  type AssignmentResult,
  type AssignmentState,
  type Pipeline,
  type PipelineStage,
  type TeamMember,
  type IntakeRequest,
  type PipelineItem,
  type AssignmentAuditLog,
  type AssignmentAction,
  type PipelineAssignerConfig,
  type LoadBalancingOptions,
  type WorkloadInfo,
  // Errors
  PipelineAssignmentError,
  ValidationError,
  NotFoundError,
  PermissionError,
  InvalidStateError,
} from './PipelineAssigner';

// =============================================================================
// AUTOMATION TRIGGER
// =============================================================================

export {
  AutomationTrigger,
  createAutomationTrigger,
  // Types
  type Workflow,
  type WorkflowType,
  type WorkflowStatus,
  type TriggerContext,
  type TriggerOptions,
  type TriggerResult,
  type WebhookResult,
  type ScheduledAutomation,
  type AutomationTriggerConfig,
  // Enums
  WorkflowExecutionStatus,
  // Errors
  AutomationError,
  RateLimitExceededError,
  WorkflowNotFoundError,
  WebhookRequestError,
  ExecutionTimeoutError,
} from './AutomationTrigger';

// =============================================================================
// CALENDAR MANAGER
// =============================================================================

export {
  CalendarManager,
  createCalendarManager,
  // Types
  type CalendarEvent,
  type CalendarAttendee,
  type CalendarEventStatus,
  type AttendeeStatus,
  type EventReminder,
  type RecurrenceRule,
  type RecurrenceFrequency,
  type ConferenceData,
  type ConferenceProvider,
  type EventMetadata,
  type EventVisibility,
  type ReminderMethod,
  // Input types
  type CreateEventInput,
  type UpdateEventInput,
  type AddAttendeeInput,
  // Result types
  type TimeSlot,
  type ConflictResult,
  type ConflictingEvent,
  type ConflictType,
  // Configuration
  type CalendarManagerConfig,
  type CalendarPrismaClient,
  DEFAULT_CALENDAR_CONFIG,
  // Schemas
  CreateEventInputSchema,
  UpdateEventInputSchema,
  // Errors
  CalendarError,
  EventNotFoundError,
  ConflictError,
  CalendarValidationError,
  AttendeeError,
} from './CalendarManager';

// =============================================================================
// NOTIFICATION DISPATCHER
// =============================================================================

export {
  NotificationDispatcher,
  notificationDispatcher,
  // Types
  type NotificationChannel,
  type NotificationPriority,
  type NotificationStatus,
  type NotificationPayload,
  type NotificationResult,
  type BulkNotificationResult,
  type Notification,
  type EmailOptions,
  type InAppOptions,
  type SMSOptions,
  type PushOptions,
  type QuietHoursConfig,
  type RateLimitConfig,
  type NotificationTemplate,
  type NotificationDispatcherConfig,
} from './NotificationDispatcher';
