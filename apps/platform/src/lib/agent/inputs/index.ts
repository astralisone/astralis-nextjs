/**
 * Agent Inputs Module
 *
 * This module provides the input handling infrastructure for the Orchestration Agent:
 * - EventBus: Central event dispatcher with async handling, history, and replay
 * - BaseInputHandler: Abstract base class for building input handlers
 * - WebhookInputHandler: Handler for webhook/form submissions
 * - WorkerEventHandler: Handler for BullMQ worker events (job completion, failure, progress, cron)
 * - DBTriggerHandler: Handler for database change events from Prisma middleware
 * - EmailInputHandler: Handler for incoming emails via webhook (SendGrid, Mailgun, generic)
 *
 * @module agent/inputs
 */

// =============================================================================
// EventBus
// =============================================================================

export {
  AgentEventBus,
  getEventBus,
  emitAgentEvent,
  type EventBusConfig,
  type EmitResult,
  type HandlerResult,
  type StoredEvent,
} from './EventBus';

// =============================================================================
// BaseInputHandler
// =============================================================================

export {
  BaseInputHandler,
  type InputHandlerConfig,
  type ValidationResult,
  type ProcessingResult,
} from './BaseInputHandler';

// =============================================================================
// WebhookInputHandler
// =============================================================================

export {
  WebhookInputHandler,
  createWebhookHandler,
  type WebhookSource,
  type WebhookPayload,
  type WebhookHandlerConfig,
  type FormSubmittedPayload,
  type BookingRequestedPayload,
  type IntakeCreatedPayload,
  type CallbackReceivedPayload,
} from './WebhookInputHandler';

// =============================================================================
// WorkerEventHandler
// =============================================================================

export {
  WorkerEventHandler,
  createWorkerEventHandler,
  type WorkerEventType,
  type QueueType,
  type WorkerEventInput,
  type WorkerEventHandlerConfig,
  type BullMQJobData,
  type BullMQJobOpts,
} from './WorkerEventHandler';

// =============================================================================
// DBTriggerHandler
// =============================================================================

export {
  DBTriggerHandler,
  createPrismaMiddleware,
  DBChangeType,
  DBEntityType,
  DEFAULT_IGNORED_FIELDS,
  DEFAULT_SIGNIFICANT_FIELDS,
  EVENT_MAPPINGS,
  type DBTriggerInput,
  type DBTriggerHandlerConfig,
  type FieldChange,
  type ChangeDetectionResult,
  type EventMapping,
  type PrismaMiddlewareConfig,
} from './DBTriggerHandler';

// =============================================================================
// EmailInputHandler
// =============================================================================

export {
  EmailInputHandler,
  EmailType,
  EmailProvider,
  extractEmail,
  extractName,
  extractNameFromEmail,
  type EmailHandlerConfig,
  type EmailInputMetadata,
  type ParsedEmail,
  type EmailAttachment,
  type EmailHeaders,
} from './EmailInputHandler';
