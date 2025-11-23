/**
 * AstralisOps Orchestration Agent
 *
 * A unified LLM-powered scheduling and task management agent that orchestrates
 * intake routing, calendar management, notifications, and automation workflows.
 *
 * @module agent
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import {
 *   // Agent system
 *   createAgentForOrg,
 *   initializeAgentSystem,
 *   getAgentInstance,
 *
 *   // Core classes
 *   OrchestrationAgent,
 *   createLLMClient,
 *   DecisionEngine,
 *   ActionExecutor,
 *
 *   // Input handlers
 *   getEventBus,
 *   WebhookInputHandler,
 *   EmailInputHandler,
 *
 *   // Action executors
 *   PipelineAssigner,
 *   CalendarManager,
 *   NotificationDispatcher,
 *
 *   // Prompts
 *   PromptBuilder,
 *
 *   // Types
 *   type AgentConfig,
 *   type AgentInput,
 *   type AgentDecisionResult,
 * } from '@/lib/agent';
 *
 * // Initialize the agent system
 * const agent = await createAgentForOrg('org-123', {
 *   llmProvider: LLMProvider.CLAUDE,
 *   llmModel: 'claude-sonnet-4-20250514',
 * });
 *
 * // Process an input
 * const result = await agent.process({
 *   source: AgentInputSource.WEBHOOK,
 *   type: 'form_submitted',
 *   rawContent: 'Customer inquiry about pricing',
 *   timestamp: new Date(),
 * });
 * ```
 */

// =============================================================================
// TYPES
// All type definitions for the agent system
// =============================================================================

export * from './types';

// Re-export commonly used types for convenience
export type {
  // Core types
  AgentConfig,
  AgentInput,
  AgentInputMetadata,
  AgentDecisionResult,
  AgentAction,
  AgentEvent,
  // Decision types
  DecisionContext,
  DecisionOutcome,
  IntentClassification,
  // Context types
  OrgContext,
  OrgSettings,
  HistoricalContext,
  // Entity summaries
  PipelineSummary,
  UserSummary,
  IntakeSummary,
  EventSummary,
  // Action parameters
  AssignPipelineParams,
  CreateEventParams,
  UpdateEventParams,
  CancelEventParams,
  SendNotificationParams,
  TriggerAutomationParams,
  EscalateParams,
  // LLM types
  LLMOptions,
  LLMResponse,
  LLMClientConfig,
  ChatMessage,
  TokenUsage,
  // API types
  ProcessInputRequest,
  ProcessInputResponse,
  DecisionApprovalRequest,
  AgentAnalytics,
  // Event payloads
  IntakeEventPayload,
  FormSubmissionPayload,
  BookingEventPayload,
  EmailEventPayload,
  PipelineEventPayload,
  // Logger
  Logger,
} from './types';

// =============================================================================
// CORE
// Main orchestration components: LLM clients, decision engine, action executor
// =============================================================================

export {
  // Orchestration Agent
  OrchestrationAgent,
  createOrchestrationAgent,
  type OrchestrationAgentConfig,
  type AgentStats,
  type PendingDecision,
  type DecisionRecord,

  // LLM Client Base
  BaseLLMClient,
  type ILLMClient,
  type RateLimitStatus,

  // Provider Implementations
  OpenAIClient,
  createOpenAIClient,
  type OpenAIClientConfig,
  ClaudeClient,
  createClaudeClient,
  type ClaudeClientConfig,

  // LLM Factory
  createLLMClient,
  createDefaultClient,
  createOpenAI,
  createClaude,
  getOrCreateClient,
  clearClientCache,
  getCacheSize,
  checkProviderHealth,
  checkAllProvidersHealth,
  getFirstAvailableProvider,
  isOpenAIModel,
  isClaudeModel,
  hasAPIKey,
  OPENAI_MODELS,
  CLAUDE_MODELS,
  getEnvironmentConfig,
  type LLMFactoryConfig,
  type LLMEnvironmentConfig,
  type ProviderHealthCheck,

  // Decision Engine
  DecisionEngine,
  createDecisionEngine,
  type DecisionEngineConfig,
  type ValidationResult as DecisionValidationResult,
  type FallbackDecision,

  // Action Executor
  ActionExecutor,
  createActionExecutor,
  type ActionExecutorConfig,
  type ActionHandler,
  type ActionHandlerResult,
  type ActionExecutionContext,
} from './core';

// =============================================================================
// INPUTS
// Event bus and input handlers for various sources
// =============================================================================

export {
  // EventBus - Central event dispatcher
  AgentEventBus,
  getEventBus,
  emitAgentEvent,
  type EventBusConfig,
  type EmitResult,
  type HandlerResult,
  type StoredEvent,

  // Base Input Handler
  BaseInputHandler,
  type InputHandlerConfig,
  type ValidationResult as InputValidationResult,
  type ProcessingResult,

  // Webhook Input Handler
  WebhookInputHandler,
  createWebhookHandler,
  type WebhookSource,
  type WebhookPayload,
  type WebhookHandlerConfig,
  type FormSubmittedPayload,
  type BookingRequestedPayload,
  type IntakeCreatedPayload,
  type CallbackReceivedPayload,

  // Worker Event Handler
  WorkerEventHandler,
  createWorkerEventHandler,
  type WorkerEventType,
  type QueueType,
  type WorkerEventInput,
  type WorkerEventHandlerConfig,
  type BullMQJobData,
  type BullMQJobOpts,

  // DB Trigger Handler
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

  // Email Input Handler
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
} from './inputs';

// =============================================================================
// ACTIONS
// Action executors for various operations
// =============================================================================

export {
  // Pipeline Assigner
  PipelineAssigner,
  createPipelineAssigner,
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
  PipelineAssignmentError,
  NotFoundError,
  PermissionError,
  InvalidStateError,

  // Calendar Manager
  CalendarManager,
  createCalendarManager,
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
  type CreateEventInput,
  type UpdateEventInput,
  type AddAttendeeInput,
  type TimeSlot,
  type ConflictResult,
  type ConflictingEvent,
  type ConflictType,
  type CalendarManagerConfig,
  type CalendarPrismaClient,
  DEFAULT_CALENDAR_CONFIG,
  CreateEventInputSchema,
  UpdateEventInputSchema,
  CalendarError,
  EventNotFoundError,
  ConflictError,
  CalendarValidationError,
  AttendeeError,

  // Notification Dispatcher
  NotificationDispatcher,
  notificationDispatcher,
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

  // Automation Trigger
  AutomationTrigger,
  createAutomationTrigger,
  type Workflow,
  type WorkflowType,
  type WorkflowStatus,
  type TriggerContext,
  type TriggerOptions,
  type TriggerResult,
  type WebhookResult,
  type ScheduledAutomation,
  type AutomationTriggerConfig,
  WorkflowExecutionStatus,
  AutomationError,
  RateLimitExceededError,
  WorkflowNotFoundError,
  WebhookRequestError,
  ExecutionTimeoutError,
} from './actions';

// =============================================================================
// PROMPTS
// Prompt templates and builder utilities
// =============================================================================

export {
  // Prompt Builder
  PromptBuilder,

  // System Prompt
  ORCHESTRATION_SYSTEM_PROMPT,
  buildSystemPrompt,

  // Intake Routing
  INTAKE_ROUTING_PROMPT,
  buildIntakeRoutingPrompt,
  INTENT_CATEGORIES,
  URGENCY_KEYWORDS,
  detectUrgencyLevel,
  detectIntentCategory,

  // Scheduling
  SCHEDULING_PROMPT,
  buildSchedulingPrompt,
  MEETING_TYPES,
  TIME_PREFERENCES,
  REMINDER_PRESETS,
  estimateDuration,
  isWithinBusinessHours,
  isDuringLunch,
  getRecommendedReminders,

  // Notification
  NOTIFICATION_PROMPT,
  buildNotificationPrompt,
  NOTIFICATION_EVENT_TYPES,
  URGENCY_LEVELS,
  NOTIFICATION_CHANNELS,
  ROLE_NOTIFICATION_ROUTING,
  MESSAGE_TEMPLATES,
  determineUrgencyLevel,
  getRecipientsByRole,
  isQuietHours,
  selectChannels,
  generateShortMessage,

  // Prompt utilities
  createMinimalSystemPrompt,
  combinePrompts,
  extractJsonFromResponse,
  validateAgentResponse,

  // Prompt types
  type OrgContext as PromptOrgContext,
  type IntakeData,
  type SchedulingRequest,
  type NotificationEvent,
} from './prompts';

// =============================================================================
// UTILITIES
// Factory functions and system management
// =============================================================================

export {
  createAgentForOrg,
  initializeAgentSystem,
  shutdownAgentSystem,
  getAgentInstance,
  type AgentSystemOptions,
  type AgentFactoryOptions,
} from './utils';

// =============================================================================
// WEBHOOKS
// Webhook signature verification and utilities
// =============================================================================

export {
  // Verification functions
  verifyHmacSignature,
  verifySendGridSignature,
  verifyMailgunSignature,
  verifyStripeSignature,
  // Utility functions
  generateWebhookSignature,
  extractWebhookHeaders,
  generateCorrelationId,
  createWebhookResponse,
  // Constants
  DEFAULT_SIGNATURE_VALIDITY_WINDOW_MS,
  // Types
  type WebhookProvider,
  type SignatureVerificationResult,
  type SignatureVerificationOptions,
} from './webhooks';

// =============================================================================
// RE-EXPORT ENUMS & CONSTANTS
// Commonly used enums and default values
// =============================================================================

export {
  // Enums
  LLMProvider,
  AgentInputSource,
  DecisionType,
  DecisionStatus,

  // Error classes
  LLMError,
  RateLimitError,
  AuthenticationError,
  APIKeyError,
  ValidationError,
  TimeoutError,
  ContentFilterError,
  ModelOverloadedError,

  // Default configurations
  DEFAULT_LLM_OPTIONS,
  DEFAULT_CLIENT_CONFIG,
  DEFAULT_AGENT_CONFIG,

  // Schemas for validation
  AgentInputSchema,
  IntentClassificationSchema,
  AgentActionSchema,
  AgentDecisionResultSchema,
  ChatMessageSchema,

  // Type guards
  isLLMProvider,
  isAgentInputSource,
  isDecisionType,
  isDecisionStatus,
} from './types';
