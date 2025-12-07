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

// =============================================================================
// OPERATIONAL AGENT HANDLERS
// =============================================================================

// Database Lookup Handler
export {
  DbLookupHandler,
  createDbLookupHandler,
  dbLookupHandler,
  // Types
  type LookupTable,
  type DbLookupInput,
  type DbLookupResult,
  type DuplicateCheckResult,
  type DbLookupHandlerConfig,
  // Errors
  DbLookupError,
  TableNotFoundError,
  QueryTimeoutError,
  // Constants
  DEFAULT_LOOKUP_CONFIG,
} from './DbLookupHandler';

// Date Calculation Handler
export {
  DateCalculationHandler,
  createDateCalculationHandler,
  dateCalculationHandler,
  // Types
  type DateOperation,
  type TimeUnit,
  type DateCalculationInput,
  type DateCalculationResult,
  type AlertThreshold,
  type ExpirationCheckResult,
  type DateCalculationHandlerConfig,
  // Errors
  DateCalculationError,
  InvalidDateError,
  // Constants
  DEFAULT_DATE_CONFIG,
} from './DateCalculationHandler';

// Array Comparison Handler
export {
  ArrayComparisonHandler,
  createArrayComparisonHandler,
  arrayComparisonHandler,
  // Types
  type ComparisonItem,
  type ArrayComparisonInput,
  type MatchedItem,
  type ArrayComparisonResult,
  type DiscrepancyReport,
  type ArrayComparisonHandlerConfig,
  // Errors
  ArrayComparisonError,
  InvalidInputError,
  // Constants
  DEFAULT_COMPARISON_CONFIG,
} from './ArrayComparisonHandler';

// API Post Handler
export {
  ApiPostHandler,
  createApiPostHandler,
  apiPostHandler,
  // Types
  type AuthType,
  type AuthConfig,
  type ApiPostInput,
  type ApiPostResult,
  type IntegrationType,
  type IntegrationConfig,
  type ApiPostHandlerConfig,
  // Errors
  ApiPostError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  // Constants
  DEFAULT_API_CONFIG,
} from './ApiPostHandler';
