/**
 * AstralisOps Orchestration Agent - Type Definitions
 *
 * This file contains all TypeScript types for the LLM-powered Orchestration Agent system.
 * These types mirror Prisma enums for client-side use and define the complete interface
 * for agent configuration, decision-making, and event handling.
 *
 * @module agent.types
 * @version 1.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Extend Error constructor for V8's captureStackTrace
declare global {
  interface ErrorConstructor {
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }
}

import { z } from 'zod';

// =============================================================================
// ENUMS (Mirror Prisma enums for client-side use)
// =============================================================================

/**
 * Role types for chat messages
 */
export type ChatMessageRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a chat conversation
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  name?: string;
}

/**
 * Zod schema for ChatMessage validation
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
  name: z.string().optional(),
});

/**
 * OpenAI model identifiers
 */
export type OpenAIModel =
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4-turbo-preview'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo';

/**
 * Claude/Anthropic model identifiers
 */
export type ClaudeModel =
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-sonnet-20241022';

/**
 * All supported LLM models
 */
export type LLMModel = OpenAIModel | ClaudeModel;

// =============================================================================
// CORE ENUMS
// =============================================================================

/**
 * Supported LLM providers for the orchestration agent.
 * Mirrors the Prisma LLMProvider enum for client-side use.
 */
export enum LLMProvider {
  /** OpenAI GPT models (GPT-4, GPT-4 Turbo, etc.) */
  OPENAI = 'OPENAI',
  /** Anthropic Claude models (Claude 3, Claude Sonnet, etc.) */
  CLAUDE = 'CLAUDE',
}

/**
 * Sources from which the agent can receive input.
 * Each source has its own input handler for processing.
 */
export enum AgentInputSource {
  /** Incoming email messages processed via webhook */
  EMAIL = 'EMAIL',
  /** Webhook payloads from forms, integrations, etc. */
  WEBHOOK = 'WEBHOOK',
  /** Database trigger events from Prisma middleware */
  DB_TRIGGER = 'DB_TRIGGER',
  /** Events from BullMQ worker queues */
  WORKER = 'WORKER',
  /** Direct API requests to the agent */
  API = 'API',
  /** Scheduled/cron-based triggers */
  SCHEDULE = 'SCHEDULE',
}

/**
 * Types of decisions the agent can make.
 * Each decision type maps to specific action executors.
 */
export enum DecisionType {
  /** Assign an intake request to a pipeline and stage */
  ASSIGN_PIPELINE = 'ASSIGN_PIPELINE',
  /** Create a new task from a task template */
  CREATE_TASK = 'CREATE_TASK',
  /** Create a new calendar event */
  CREATE_EVENT = 'CREATE_EVENT',
  /** Update an existing calendar event */
  UPDATE_EVENT = 'UPDATE_EVENT',
  /** Cancel an existing calendar event */
  CANCEL_EVENT = 'CANCEL_EVENT',
  /** Send a notification (email, in-app, etc.) */
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  /** Trigger an n8n automation workflow */
  TRIGGER_AUTOMATION = 'TRIGGER_AUTOMATION',
  /** Escalate to human review or management */
  ESCALATE = 'ESCALATE',
  /** No action required for this input */
  NO_ACTION = 'NO_ACTION',
}

/**
 * Status of a decision in its lifecycle.
 * Tracks the execution state of agent decisions.
 */
export enum DecisionStatus {
  /** Decision made but not yet executed */
  PENDING = 'PENDING',
  /** Decision successfully executed */
  EXECUTED = 'EXECUTED',
  /** Decision execution failed */
  FAILED = 'FAILED',
  /** Decision rejected by human reviewer */
  REJECTED = 'REJECTED',
  /** Decision requires human approval before execution */
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
}

// =============================================================================
// ENTITY SUMMARIES (for context building)
// =============================================================================

/**
 * Summarized pipeline information for context building.
 * Used when providing organizational context to the LLM.
 */
export interface PipelineSummary {
  /** Unique identifier of the pipeline */
  id: string;
  /** Display name of the pipeline */
  name: string;
  /** Ordered list of stage names in the pipeline */
  stages: string[];
  /** Category for matching (e.g., 'sales', 'support', 'general') */
  category: string;
  /** Optional description of the pipeline's purpose */
  description?: string;
  /** Whether this pipeline is currently active */
  isActive?: boolean;
}

/**
 * Summarized user information for context building and assignment.
 * Used for load balancing and role-based routing decisions.
 */
export interface UserSummary {
  /** Unique identifier of the user */
  id: string;
  /** Display name of the user */
  name: string;
  /** Email address for notifications */
  email: string;
  /** Role in the organization (ADMIN, OPERATOR, PM, etc.) */
  role: string;
  /** Current workload count for load balancing */
  currentLoad: number;
  /** Maximum workload capacity */
  maxLoad?: number;
  /** User's availability status */
  isAvailable?: boolean;
  /** Specializations or skills for routing */
  specializations?: string[];
}

/**
 * Summarized intake information for historical context.
 * Used to provide related intake history to the agent.
 */
export interface IntakeSummary {
  /** Unique identifier of the intake */
  id: string;
  /** Subject or title of the intake request */
  subject: string;
  /** Source channel of the intake */
  source: string;
  /** Priority level (1-5, where 5 is highest) */
  priority: number;
  /** Timestamp when the intake was created */
  createdAt: Date;
  /** Current status of the intake */
  status?: string;
  /** Assigned user ID if any */
  assignedTo?: string;
  /** Pipeline ID if assigned */
  pipelineId?: string;
}

/**
 * Summarized event information for calendar context.
 * Used for conflict detection and scheduling decisions.
 */
export interface EventSummary {
  /** Unique identifier of the event */
  id: string;
  /** Title or subject of the event */
  title: string;
  /** Event start time */
  startTime: Date;
  /** Event end time */
  endTime: Date;
  /** List of attendee identifiers (user IDs or emails) */
  attendees: string[];
  /** Event type (meeting, call, etc.) */
  type?: string;
  /** Whether the event is confirmed */
  isConfirmed?: boolean;
  /** Location or meeting link */
  location?: string;
}

/**
 * Working hours configuration for scheduling.
 */
export interface WorkingHours {
  /** Start time in 24h format (e.g., '09:00') */
  start: string;
  /** End time in 24h format (e.g., '17:00') */
  end: string;
  /** Days of the week that are working days (0=Sunday, 6=Saturday) */
  workingDays: number[];
}

/**
 * Time range for breaks or blocked periods.
 */
export interface TimeRange {
  /** Start time in 24h format */
  start: string;
  /** End time in 24h format */
  end: string;
}

/**
 * Organization settings relevant to agent decision-making.
 * Contains configuration that affects routing and scheduling.
 */
export interface OrgSettings {
  /** Organization's timezone (e.g., 'America/New_York') */
  timezone: string;
  /** Working hours configuration */
  workingHours: WorkingHours;
  /** Default pipeline ID for unclassified intakes */
  defaultPipeline: string;
  /** Email address for escalations */
  escalationEmail: string;
  /** Default event duration in minutes */
  defaultEventDuration?: number;
  /** Lunch break configuration */
  lunchBreak?: TimeRange;
  /** Whether to auto-respond to emails */
  autoRespondEnabled?: boolean;
}

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Configuration for the orchestration agent.
 * Defines LLM settings, capabilities, rate limits, and notification preferences.
 */
export interface AgentConfig {
  /** Unique identifier for the agent configuration */
  id?: string;
  /** Organization ID this agent belongs to */
  orgId: string;
  /** Display name for the agent */
  name?: string;

  // LLM Settings
  /** The LLM provider to use (OpenAI or Claude) */
  llmProvider: LLMProvider;
  /** Specific model identifier (e.g., 'gpt-4-turbo', 'claude-sonnet-4-20250514') */
  llmModel: string;
  /** Temperature for LLM responses (0.0 = deterministic, 1.0 = creative) */
  temperature: number;
  /** Maximum tokens for LLM responses */
  maxTokens?: number;
  /** Custom system prompt override */
  systemPrompt?: string;

  // Decision Thresholds
  /** Confidence threshold above which decisions execute automatically (0.0-1.0) */
  autoExecuteThreshold: number;
  /** Confidence threshold below which human approval is required (0.0-1.0) */
  requireApprovalThreshold: number;

  // Capabilities
  /** Enabled action types for this agent */
  enabledActions: DecisionType[];
  /** Whether the agent can assign intakes to pipelines */
  canAssignPipelines?: boolean;
  /** Whether the agent can create calendar events */
  canCreateEvents?: boolean;
  /** Whether the agent can send notifications */
  canSendNotifications?: boolean;
  /** Whether the agent can trigger automations */
  canTriggerAutomations?: boolean;

  // Rate Limits
  /** Maximum actions the agent can take per minute */
  maxActionsPerMinute: number;
  /** Maximum actions the agent can take per hour */
  maxActionsPerHour: number;

  // Notifications
  /** Whether to send notifications for high-priority items */
  notifyOnHighPriority: boolean;
  /** Whether to send notifications on decision failures */
  notifyOnFailure: boolean;
  /** Email address for escalations and failure notifications */
  escalationEmail: string;

  // Audit tracking
  /** Total number of decisions made by this agent */
  totalDecisions?: number;
  /** Number of successful decisions */
  successfulDecisions?: number;

  // Timestamps
  /** When the configuration was created */
  createdAt?: Date;
  /** When the configuration was last updated */
  updatedAt?: Date;
}

/**
 * Metadata associated with an agent input.
 */
export interface AgentInputMetadata {
  /** Email address of the sender (for email inputs) */
  senderEmail?: string;
  /** Name of the sender */
  senderName?: string;
  /** IP address of the requester */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Webhook signature for verification */
  webhookSignature?: string;
  /** Original request headers */
  headers?: Record<string, string>;
  /** Related entity IDs (intake ID, user ID, etc.) */
  relatedEntityIds?: Record<string, string>;
  /** Priority hint from the source */
  priorityHint?: number;
  /** Tags or labels */
  tags?: string[];
}

/**
 * Input received by the orchestration agent.
 * Represents a single piece of work for the agent to process.
 */
export interface AgentInput {
  /** Source channel of the input */
  source: AgentInputSource;
  /** Type of input (e.g., 'intake_created', 'form_submitted', 'email_received') */
  type: string;
  /** Raw content of the input (email body, form data as string, etc.) */
  rawContent: string;
  /** Parsed/structured data from the input */
  structuredData?: Record<string, unknown>;
  /** Additional metadata about the input */
  metadata?: AgentInputMetadata;
  /** Timestamp when the input was received */
  timestamp: Date;
  /** Unique identifier for tracking this input through the system */
  correlationId?: string;
}

/**
 * Named entity extracted from input content.
 */
export interface ExtractedEntity {
  /** Type of entity (PERSON, DATE, TIME, ORGANIZATION, EMAIL, PHONE, etc.) */
  type: string;
  /** The extracted value */
  value: string;
  /** Confidence in the extraction */
  confidence: number;
  /** Character position in the original text */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Result of intent classification by the LLM.
 * Represents the agent's understanding of what the input is asking for.
 */
export interface IntentClassification {
  /** Classified intent (e.g., 'SALES_INQUIRY', 'SUPPORT_REQUEST', 'SCHEDULING') */
  intent: string;
  /** Confidence score of the classification (0.0-1.0) */
  confidence: number;
  /** Urgency level (1-5, where 5 is most urgent) */
  urgency: number;
  /** Keywords extracted from the input that influenced classification */
  keywords: string[];
  /** Named entities extracted from the input */
  entities: ExtractedEntity[];
  /** Sub-intent or more specific categorization */
  subIntent?: string;
  /** Sentiment analysis result */
  sentiment?: 'positive' | 'neutral' | 'negative';
}

/**
 * Options for LLM API calls.
 * Controls the behavior of LLM completions.
 */
export interface LLMOptions {
  /** Temperature for response generation (0.0-1.0) */
  temperature?: number;
  /** Maximum tokens in the response */
  maxTokens?: number;
  /** System prompt to use for this request */
  systemPrompt?: string;
  /** Stop sequences to end generation */
  stopSequences?: string[];
  /** Top-p (nucleus) sampling parameter */
  topP?: number;
  /** Frequency penalty (OpenAI-specific) */
  frequencyPenalty?: number;
  /** Presence penalty (OpenAI-specific) */
  presencePenalty?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** User identifier for rate limiting */
  user?: string;
}

/**
 * Configuration for creating an LLM client
 */
export interface LLMClientConfig {
  /** API key for the provider (defaults to env variable) */
  apiKey?: string;
  /** Model to use */
  model: LLMModel;
  /** Default options for all requests */
  defaultOptions?: LLMOptions;
  /** Maximum retries for failed requests */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseDelay?: number;
  /** Organization ID (for OpenAI) */
  organizationId?: string;
  /** Base URL override (for proxies or custom endpoints) */
  baseUrl?: string;
}

/**
 * Default client configuration
 */
export const DEFAULT_CLIENT_CONFIG: Required<Pick<LLMClientConfig, 'maxRetries' | 'retryBaseDelay'>> = {
  maxRetries: 3,
  retryBaseDelay: 1000,
};

/**
 * Token usage information from an LLM call.
 */
export interface TokenUsage {
  /** Number of tokens in the prompt */
  promptTokens: number;
  /** Number of tokens in the completion */
  completionTokens: number;
  /** Total tokens used */
  totalTokens: number;
  /** Estimated cost in USD (if calculable) */
  estimatedCost?: number;
}

/**
 * Finish reason for LLM response completion.
 */
export type LLMFinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error';

/**
 * Response from an LLM API call.
 * Contains the generated content and usage metadata.
 */
export interface LLMResponse {
  /** The generated text content */
  content: string;
  /** Token usage information */
  usage: TokenUsage;
  /** The model that generated the response */
  model: string;
  /** Reason the generation finished */
  finishReason: LLMFinishReason;
  /** Unique identifier for this completion */
  id?: string;
  /** Time taken to generate the response in milliseconds */
  latencyMs?: number;
  /** Raw response from the provider (for debugging) */
  raw?: unknown;
}

/**
 * Streaming chunk from LLM response
 */
export interface LLMStreamChunk {
  /** Partial content */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Finish reason (only on final chunk) */
  finishReason?: LLMFinishReason | null;
}

// =============================================================================
// DECISION INTERFACES
// =============================================================================

/**
 * Organization context for decision-making.
 */
export interface OrgContext {
  /** Organization ID */
  id: string;
  /** Organization name */
  name: string;
  /** Available pipelines for intake assignment */
  pipelines: PipelineSummary[];
  /** Team members for assignment and notification */
  users: UserSummary[];
  /** Organization settings */
  settings: OrgSettings;
}

/**
 * Record of a previous agent decision for historical context.
 */
export interface AgentDecisionRecord {
  /** Decision ID */
  id: string;
  /** Type of decision made */
  decisionType: DecisionType;
  /** Input type that triggered the decision */
  inputType: string;
  /** Confidence of the decision */
  confidence: number;
  /** Status of the decision */
  status: DecisionStatus;
  /** When the decision was made */
  createdAt: Date;
}

/**
 * Summary of a previous interaction with a contact.
 */
export interface InteractionSummary {
  /** Type of interaction */
  type: 'email' | 'form' | 'call' | 'meeting' | 'chat';
  /** When the interaction occurred */
  timestamp: Date;
  /** Brief summary of the interaction */
  summary: string;
  /** Outcome or resolution */
  outcome?: string;
}

/**
 * Historical context for informed decision-making.
 */
export interface HistoricalContext {
  /** Recent decisions made by the agent */
  recentDecisions: AgentDecisionRecord[];
  /** Related intake requests */
  relatedIntakes: IntakeSummary[];
  /** Related calendar events */
  relatedEvents: EventSummary[];
  /** Previous interactions with the same sender/contact */
  previousInteractions?: InteractionSummary[];
}

/**
 * Complete context provided to the agent for making decisions.
 * Contains all information needed to process an input and determine actions.
 */
export interface DecisionContext {
  /** The input being processed */
  input: AgentInput;

  /** Organization context for decision-making */
  org: OrgContext;

  /** Historical context for informed decisions */
  history?: HistoricalContext;

  /** Actions available to the agent for this request */
  availableActions: DecisionType[];

  /** Current timestamp for the decision */
  decisionTimestamp?: Date;

  /** Session/request identifier for tracking */
  sessionId?: string;
}

/**
 * Condition for conditional action execution.
 */
export interface ActionCondition {
  /** Type of condition check */
  type: 'time_range' | 'user_available' | 'slot_available' | 'custom';
  /** Condition parameters */
  params: Record<string, unknown>;
}

/**
 * A single action to be executed by the agent.
 * Part of the decision result that specifies what to do.
 *
 * @typeParam T - The type of parameters for this action
 */
export interface AgentAction<T = Record<string, unknown>> {
  /** Type of action to execute */
  type: DecisionType;
  /** Parameters for the action executor */
  params: T;
  /** Priority of this action (1-5, where 5 is highest) */
  priority: number;
  /** Whether this action requires human confirmation */
  requiresConfirmation: boolean;
  /** Optional delay before executing (in milliseconds) */
  delayMs?: number;
  /** Condition that must be met for this action to execute */
  condition?: ActionCondition;
  /** Fallback action if this one fails */
  fallback?: AgentAction;
}

/**
 * An alternative decision that was considered.
 */
export interface AlternativeDecision {
  /** The alternative intent */
  intent: string;
  /** Confidence in this alternative */
  confidence: number;
  /** Brief reason why this wasn't chosen */
  reason: string;
}

/**
 * Result of the agent's decision-making process.
 * Contains the classification, reasoning, and actions to execute.
 */
export interface AgentDecisionResult {
  /** Classified intent of the input */
  intent: string;
  /** Confidence in the classification and decision (0.0-1.0) */
  confidence: number;
  /** LLM's reasoning for the decision (for audit trail) */
  reasoning: string;
  /** Array of actions to execute */
  actions: AgentAction[];
  /** Whether the decision requires human approval before execution */
  requiresApproval: boolean;
  /** Suggested priority for the overall decision */
  priority?: number;
  /** Any warnings or notes from the decision process */
  warnings?: string[];
  /** Alternative decisions considered but not chosen */
  alternatives?: AlternativeDecision[];
}

/**
 * Result of a single action execution.
 */
export interface ActionResult {
  /** The action that was executed */
  action: DecisionType;
  /** Whether the action succeeded */
  success: boolean;
  /** Data returned by the action executor */
  data?: Record<string, unknown>;
  /** Time taken for this specific action (in milliseconds) */
  executionTime: number;
  /** Any message from the executor */
  message?: string;
}

/**
 * Error encountered during decision execution.
 */
export interface ExecutionError {
  /** Which action failed */
  action: DecisionType;
  /** Error code for categorization */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Full error stack (in development) */
  stack?: string;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Suggested retry delay in milliseconds */
  retryDelayMs?: number;
}

/**
 * Outcome of executing a decision.
 * Records what happened when the agent's actions were executed.
 */
export interface DecisionOutcome {
  /** Final status after execution */
  status: DecisionStatus;
  /** Time taken to execute all actions (in milliseconds) */
  executionTime: number;
  /** Results from each action execution */
  results: ActionResult[];
  /** Errors encountered during execution */
  errors: ExecutionError[];
  /** Whether any actions were rolled back */
  rolledBack?: boolean;
  /** Timestamp when execution completed */
  completedAt: Date;
}

// =============================================================================
// ACTION PARAMETER TYPES
// =============================================================================

/**
 * Parameters for pipeline assignment action.
 */
export interface AssignPipelineParams {
  /** ID of the intake to assign */
  intakeId: string;
  /** ID of the pipeline to assign to */
  pipelineId: string;
  /** ID of the stage within the pipeline */
  stageId?: string;
  /** ID of the user to assign to */
  assigneeId?: string;
  /** Priority level to set */
  priority?: number;
  /** Notes to add to the assignment */
  notes?: string;
}

/**
 * Reminder configuration for calendar events.
 */
export interface ReminderConfig {
  /** Minutes before event to send reminder */
  minutesBefore: number;
  /** How to send the reminder */
  method: 'email' | 'push' | 'sms';
}

/**
 * Parameters for creating a calendar event.
 */
export interface CreateEventParams {
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Start time of the event */
  startTime: Date;
  /** End time of the event */
  endTime: Date;
  /** Attendee user IDs or email addresses */
  attendees: string[];
  /** Event location or meeting link */
  location?: string;
  /** Whether to send calendar invites */
  sendInvites?: boolean;
  /** Reminder configuration */
  reminders?: ReminderConfig[];
  /** Event type (meeting, call, etc.) */
  type?: string;
}

/**
 * Parameters for updating a calendar event.
 */
export interface UpdateEventParams {
  /** ID of the event to update */
  eventId: string;
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated start time */
  startTime?: Date;
  /** Updated end time */
  endTime?: Date;
  /** Updated attendees */
  attendees?: string[];
  /** Updated location */
  location?: string;
  /** Whether to notify attendees of changes */
  notifyAttendees?: boolean;
}

/**
 * Parameters for canceling a calendar event.
 */
export interface CancelEventParams {
  /** ID of the event to cancel */
  eventId: string;
  /** Reason for cancellation */
  reason?: string;
  /** Whether to notify attendees */
  notifyAttendees?: boolean;
}

/**
 * Parameters for sending a notification.
 */
export interface SendNotificationParams {
  /** User IDs to notify */
  recipientIds?: string[];
  /** Email addresses to notify (for external recipients) */
  recipientEmails?: string[];
  /** Notification type (email, in-app, push, etc.) */
  type: 'email' | 'in_app' | 'push' | 'sms';
  /** Notification subject/title */
  subject: string;
  /** Notification body content */
  body: string;
  /** Template ID to use instead of raw content */
  templateId?: string;
  /** Template variables */
  templateData?: Record<string, unknown>;
  /** Priority of the notification */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Parameters for triggering an automation.
 */
export interface TriggerAutomationParams {
  /** Workflow/automation identifier */
  workflowId: string;
  /** Payload to pass to the automation */
  payload: Record<string, unknown>;
  /** Whether to wait for automation completion */
  waitForCompletion?: boolean;
  /** Timeout for waiting (in milliseconds) */
  timeoutMs?: number;
}

/**
 * Parameters for escalation action.
 */
export interface EscalateParams {
  /** Reason for escalation */
  reason: string;
  /** Escalation level (1=immediate supervisor, 2=department head, etc.) */
  level: number;
  /** Specific user ID to escalate to */
  escalateToUserId?: string;
  /** Email to notify about escalation */
  escalateToEmail?: string;
  /** Related entity IDs for context */
  relatedEntityIds?: Record<string, string>;
  /** Priority of the escalation */
  priority: 'normal' | 'high' | 'urgent';
}

/**
 * Parameters for creating a task from a template.
 */
export interface CreateTaskParams {
  /** ID of the task template to use */
  templateId: string;
  /** Organization ID */
  orgId: string;
  /** Source channel (FORM, EMAIL, CHAT, API, CALL) */
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API' | 'CALL';
  /** Task title */
  title: string;
  /** Optional task description */
  description?: string;
  /** Optional intake ID that triggered this task */
  intakeId?: string;
  /** Optional priority override (1-5, where 5 is highest) */
  priority?: 1 | 2 | 3 | 4 | 5;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Event types that can be emitted and handled by the agent.
 */
export type AgentEventType =
  // Intake events
  | 'intake:created'
  | 'intake:updated'
  | 'intake:assigned'
  | 'intake:escalated'
  | 'intake:routing_failed'
  // Task events (Agentic Task System)
  | 'task:created'
  | 'task:status_changed'
  | 'task:stage_changed'
  | 'task:assignee_changed'
  | 'task:override_set'
  | 'task:reprocess_requested'
  | 'task:sla_warning'
  | 'task:sla_breached'
  // Form/webhook events
  | 'webhook:form_submitted'
  | 'webhook:booking_requested'
  | 'webhook:callback_received'
  // Email events
  | 'email:received'
  | 'email:replied'
  // Pipeline events
  | 'pipeline:stage_changed'
  | 'pipeline:completed'
  | 'pipeline:item_added'
  | 'pipeline:item_moved'
  | 'pipeline:item_assigned'
  | 'pipeline:item_sla_breached'
  | 'pipeline:item_completed'
  // Calendar events
  | 'calendar:event_created'
  | 'calendar:event_updated'
  | 'calendar:event_cancelled'
  | 'calendar:reminder_due'
  // Automation events
  | 'automation:triggered'
  | 'automation:completed'
  | 'automation:failed'
  // Agent events
  | 'agent:decision_made'
  | 'agent:action_executed'
  | 'agent:error'
  // Schedule events
  | 'schedule:triggered'
  // Custom events
  | `custom:${string}`;

/**
 * Event emitted within the orchestration agent system.
 * Used for communication between components and external integrations.
 *
 * @typeParam T - The type of the event payload
 */
export interface AgentEvent<T = unknown> {
  /** Type of event */
  type: AgentEventType;
  /** Event payload data */
  payload: T;
  /** Timestamp when the event was created */
  timestamp: Date;
  /** Source that emitted the event */
  source: AgentInputSource | 'agent' | 'system';
  /** Unique identifier for this event */
  eventId?: string;
  /** Correlation ID for tracking related events */
  correlationId?: string;
  /** Organization ID this event belongs to */
  orgId?: string;
  /** Metadata about the event */
  metadata?: Record<string, unknown>;
}

/**
 * Handler function for processing agent events.
 *
 * @typeParam T - The type of the event payload
 */
export type EventHandler<T = unknown> = (
  event: AgentEvent<T>
) => Promise<void> | void;

/**
 * Subscription to agent events.
 */
export interface EventSubscription {
  /** Event type being subscribed to */
  eventType: AgentEventType | '*';
  /** Handler function */
  handler: EventHandler;
  /** Unique subscription ID */
  subscriptionId: string;
  /** Whether this is a one-time subscription */
  once?: boolean;
}

// =============================================================================
// EVENT PAYLOAD TYPES
// =============================================================================

/**
 * Base payload for all events
 */
export interface BaseEventPayload {
  id: string;
  timestamp: Date;
  source: AgentInputSource;
  orgId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payload for intake events
 */
export interface IntakeEventPayload extends BaseEventPayload {
  intakeId: string;
  type: string;
  data: Record<string, unknown>;
  contactInfo?: {
    email?: string;
    name?: string;
    phone?: string;
  };
}

/**
 * Payload for form submission events
 */
export interface FormSubmissionPayload extends BaseEventPayload {
  formId: string;
  formType: string;
  fields: Record<string, unknown>;
  submitterEmail?: string;
  submitterName?: string;
}

/**
 * Payload for booking events
 */
export interface BookingEventPayload extends BaseEventPayload {
  bookingId: string;
  eventType: 'created' | 'updated' | 'cancelled';
  bookingData: {
    date: string;
    time: string;
    duration?: number;
    guestEmail?: string;
    guestName?: string;
    purpose?: string;
    hostId?: string;
  };
}

/**
 * Payload for email events
 */
export interface EmailEventPayload extends BaseEventPayload {
  emailId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

/**
 * Payload for pipeline stage change events
 */
export interface PipelineEventPayload extends BaseEventPayload {
  pipelineId: string;
  entityId: string;
  entityType: string;
  previousStage?: string;
  newStage: string;
  triggeredBy?: string;
}

/**
 * Payload for reminder events
 */
export interface ReminderEventPayload extends BaseEventPayload {
  reminderId: string;
  eventId?: string;
  message: string;
  dueAt: Date;
  recipientIds: string[];
}

/**
 * Payload for automation completion events
 */
export interface AutomationEventPayload extends BaseEventPayload {
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failure';
  executionTime: number;
  result?: Record<string, unknown>;
  error?: string;
}

/**
 * Payload for decision events
 */
export interface DecisionEventPayload extends BaseEventPayload {
  decisionId: string;
  agentId: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  confidence: number;
  actions?: AgentAction[];
}

/**
 * Map of event types to their payload types
 */
export type EventPayloadMap = {
  'intake:created': IntakeEventPayload;
  'intake:updated': IntakeEventPayload;
  'intake:assigned': IntakeEventPayload;
  'intake:escalated': IntakeEventPayload;
  'webhook:form_submitted': FormSubmissionPayload;
  'webhook:booking_requested': BookingEventPayload;
  'webhook:callback_received': BaseEventPayload;
  'email:received': EmailEventPayload;
  'email:replied': EmailEventPayload;
  'pipeline:stage_changed': PipelineEventPayload;
  'pipeline:completed': PipelineEventPayload;
  'calendar:event_created': BaseEventPayload;
  'calendar:event_updated': BaseEventPayload;
  'calendar:event_cancelled': BaseEventPayload;
  'calendar:reminder_due': ReminderEventPayload;
  'automation:triggered': AutomationEventPayload;
  'automation:completed': AutomationEventPayload;
  'automation:failed': AutomationEventPayload;
  'agent:decision_made': DecisionEventPayload;
  'agent:action_executed': DecisionEventPayload;
  'agent:error': BaseEventPayload;
  'schedule:triggered': BaseEventPayload;
};

/**
 * Wildcard event handler that receives all events
 */
export type WildcardEventHandler = (
  event: AgentEventType,
  payload: EventPayloadMap[keyof EventPayloadMap]
) => Promise<void> | void;

/**
 * Stored event for history/replay functionality
 */
export interface StoredEvent<T extends keyof EventPayloadMap = keyof EventPayloadMap> {
  id: string;
  event: T;
  payload: EventPayloadMap[T];
  timestamp: Date;
  processed: boolean;
  processingErrors?: string[];
}

// =============================================================================
// LOGGER INTERFACE
// =============================================================================

/**
 * Logger interface for agent system components
 */
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
}

// =============================================================================
// EXTENDED AGENT INPUT
// =============================================================================

/**
 * Extended agent input with additional metadata
 */
export interface AgentInputExtended extends AgentInput {
  id: string;
  orgId?: string;
  priority?: number;
  tags?: string[];
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * Source of webhook events
 */
export type WebhookSource =
  | 'contact_form'
  | 'booking_form'
  | 'survey_form'
  | 'newsletter_signup'
  | 'intake_form'
  | 'generic';

/**
 * Raw webhook payload before processing
 */
export interface WebhookPayload {
  source: WebhookSource | string;
  timestamp?: string | Date;
  data: Record<string, unknown>;
  headers?: Record<string, string>;
  signature?: string;
}

/**
 * Result of webhook validation
 */
export interface WebhookValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedData?: Record<string, unknown>;
}

// =============================================================================
// LLM CLIENT INTERFACE
// =============================================================================

/**
 * Interface for LLM client implementations.
 * Abstracts away differences between OpenAI and Claude APIs.
 */
export interface ILLMClient {
  /** The provider this client uses */
  provider: LLMProvider;
  /** The model this client is configured to use */
  model: string;

  /**
   * Generate a completion from the LLM.
   * @param prompt - The prompt to send
   * @param options - Optional configuration for the request
   * @returns The LLM response
   */
  complete(prompt: string, options?: LLMOptions): Promise<LLMResponse>;

  /**
   * Classify the intent of an input.
   * @param input - The agent input to classify
   * @returns The intent classification
   */
  classifyIntent(input: AgentInput): Promise<IntentClassification>;

  /**
   * Make a decision based on the provided context.
   * @param context - The full decision context
   * @returns The decision result with actions to execute
   */
  makeDecision(context: DecisionContext): Promise<AgentDecisionResult>;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Request to process an input through the agent.
 */
export interface ProcessInputRequest {
  /** The input to process */
  input: AgentInput;
  /** Optional configuration overrides for this request */
  configOverrides?: Partial<AgentConfig>;
  /** Whether to execute actions or just return the decision */
  dryRun?: boolean;
  /** Whether to require approval regardless of confidence */
  forceApproval?: boolean;
}

/**
 * Response from processing an input.
 */
export interface ProcessInputResponse {
  /** Unique ID of the decision record */
  decisionId: string;
  /** The decision result */
  decision: AgentDecisionResult;
  /** Execution outcome (if not dry run) */
  outcome?: DecisionOutcome;
  /** Whether the decision is awaiting approval */
  awaitingApproval: boolean;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Request to approve or reject a pending decision.
 */
export interface DecisionApprovalRequest {
  /** ID of the decision to approve/reject */
  decisionId: string;
  /** Whether to approve (true) or reject (false) */
  approved: boolean;
  /** Reason for the approval/rejection */
  reason?: string;
  /** User ID of the approver */
  approverId: string;
  /** Modified actions (if approver wants to change something) */
  modifiedActions?: AgentAction[];
}

/**
 * Response from approving/rejecting a decision.
 */
export interface DecisionApprovalResponse {
  /** ID of the decision */
  decisionId: string;
  /** New status after approval/rejection */
  status: DecisionStatus;
  /** Execution outcome (if approved) */
  outcome?: DecisionOutcome;
}

/**
 * Filters for querying agent decisions.
 */
export interface DecisionQueryFilters {
  /** Filter by organization ID */
  orgId?: string;
  /** Filter by agent ID */
  agentId?: string;
  /** Filter by input source */
  inputSource?: AgentInputSource;
  /** Filter by decision type */
  decisionType?: DecisionType;
  /** Filter by status */
  status?: DecisionStatus;
  /** Filter by minimum confidence */
  minConfidence?: number;
  /** Filter by maximum confidence */
  maxConfidence?: number;
  /** Filter by date range start */
  fromDate?: Date;
  /** Filter by date range end */
  toDate?: Date;
  /** Number of results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort field */
  sortBy?: 'createdAt' | 'confidence' | 'executionTime';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Analytics data for agent performance.
 */
export interface AgentAnalytics {
  /** Total number of decisions in the period */
  totalDecisions: number;
  /** Number of successful decisions */
  successfulDecisions: number;
  /** Number of failed decisions */
  failedDecisions: number;
  /** Number of decisions requiring approval */
  pendingApprovals: number;
  /** Average confidence score */
  averageConfidence: number;
  /** Average execution time in milliseconds */
  averageExecutionTime: number;
  /** Breakdown by decision type */
  byDecisionType: Record<DecisionType, number>;
  /** Breakdown by input source */
  byInputSource: Record<AgentInputSource, number>;
  /** Breakdown by status */
  byStatus: Record<DecisionStatus, number>;
  /** Time period for these analytics */
  period: {
    start: Date;
    end: Date;
  };
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Base error class for LLM-related errors
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: LLMProvider,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'LLMError';

    // Maintain proper stack trace in V8
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, LLMError);
    }
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends LLMError {
  constructor(
    message: string,
    provider: LLMProvider,
    public readonly retryAfterMs?: number,
    originalError?: Error
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', provider, 429, true, originalError);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends LLMError {
  constructor(
    message: string,
    provider: LLMProvider,
    originalError?: Error
  ) {
    super(message, 'AUTHENTICATION_FAILED', provider, 401, false, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when the API key is missing or invalid
 */
export class APIKeyError extends LLMError {
  constructor(
    provider: LLMProvider,
    originalError?: Error
  ) {
    super(
      `API key not configured for ${provider}. Please set the appropriate environment variable.`,
      'API_KEY_MISSING',
      provider,
      undefined,
      false,
      originalError
    );
    this.name = 'APIKeyError';
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends LLMError {
  constructor(
    message: string,
    provider: LLMProvider,
    public readonly validationErrors?: z.ZodError
  ) {
    super(message, 'VALIDATION_FAILED', provider, 400, false);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends LLMError {
  constructor(
    provider: LLMProvider,
    timeoutMs: number,
    originalError?: Error
  ) {
    super(
      `Request timed out after ${timeoutMs}ms`,
      'TIMEOUT',
      provider,
      408,
      true,
      originalError
    );
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown when content is filtered/blocked
 */
export class ContentFilterError extends LLMError {
  constructor(
    message: string,
    provider: LLMProvider,
    originalError?: Error
  ) {
    super(message, 'CONTENT_FILTERED', provider, 400, false, originalError);
    this.name = 'ContentFilterError';
  }
}

/**
 * Error thrown when the model is overloaded
 */
export class ModelOverloadedError extends LLMError {
  constructor(
    provider: LLMProvider,
    public readonly retryAfterMs?: number,
    originalError?: Error
  ) {
    super(
      `${provider} model is currently overloaded. Please retry later.`,
      'MODEL_OVERLOADED',
      provider,
      503,
      true,
      originalError
    );
    this.name = 'ModelOverloadedError';
  }
}

// =============================================================================
// ZOD SCHEMAS (for runtime validation)
// =============================================================================

/**
 * Zod schema for AgentInput validation
 */
export const AgentInputSchema = z.object({
  source: z.nativeEnum(AgentInputSource),
  type: z.string().min(1),
  rawContent: z.string(),
  structuredData: z.record(z.unknown()).optional(),
  metadata: z.object({
    senderEmail: z.string().email().optional(),
    senderName: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    webhookSignature: z.string().optional(),
    headers: z.record(z.string()).optional(),
    relatedEntityIds: z.record(z.string()).optional(),
    priorityHint: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  timestamp: z.date(),
  correlationId: z.string().optional(),
});

/**
 * Zod schema for IntentClassification
 */
export const IntentClassificationSchema = z.object({
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  urgency: z.number().int().min(1).max(5),
  keywords: z.array(z.string()),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(1),
    position: z.object({
      start: z.number(),
      end: z.number(),
    }).optional(),
  })),
  subIntent: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
});

/**
 * Zod schema for AgentAction
 */
export const AgentActionSchema = z.object({
  type: z.nativeEnum(DecisionType),
  params: z.record(z.unknown()),
  priority: z.number().int().min(1).max(5),
  requiresConfirmation: z.boolean(),
  delayMs: z.number().int().positive().optional(),
  condition: z.object({
    type: z.enum(['time_range', 'user_available', 'slot_available', 'custom']),
    params: z.record(z.unknown()),
  }).optional(),
});

/**
 * Zod schema for AgentDecisionResult (from LLM)
 */
export const AgentDecisionResultSchema = z.object({
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  actions: z.array(AgentActionSchema),
  requiresApproval: z.boolean(),
  priority: z.number().int().min(1).max(5).optional(),
  warnings: z.array(z.string()).optional(),
  alternatives: z.array(z.object({
    intent: z.string(),
    confidence: z.number().min(0).max(1),
    reason: z.string(),
  })).optional(),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type guard to check if a value is a valid LLMProvider.
 */
export function isLLMProvider(value: unknown): value is LLMProvider {
  return (
    typeof value === 'string' &&
    Object.values(LLMProvider).includes(value as LLMProvider)
  );
}

/**
 * Type guard to check if a value is a valid AgentInputSource.
 */
export function isAgentInputSource(value: unknown): value is AgentInputSource {
  return (
    typeof value === 'string' &&
    Object.values(AgentInputSource).includes(value as AgentInputSource)
  );
}

/**
 * Type guard to check if a value is a valid DecisionType.
 */
export function isDecisionType(value: unknown): value is DecisionType {
  return (
    typeof value === 'string' &&
    Object.values(DecisionType).includes(value as DecisionType)
  );
}

/**
 * Type guard to check if a value is a valid DecisionStatus.
 */
export function isDecisionStatus(value: unknown): value is DecisionStatus {
  return (
    typeof value === 'string' &&
    Object.values(DecisionStatus).includes(value as DecisionStatus)
  );
}

/**
 * Make all properties of T optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the parameter type for a specific action type.
 */
export type ActionParamsFor<T extends DecisionType> =
  T extends DecisionType.ASSIGN_PIPELINE
    ? AssignPipelineParams
    : T extends DecisionType.CREATE_TASK
      ? CreateTaskParams
      : T extends DecisionType.CREATE_EVENT
        ? CreateEventParams
        : T extends DecisionType.UPDATE_EVENT
          ? UpdateEventParams
          : T extends DecisionType.CANCEL_EVENT
            ? CancelEventParams
            : T extends DecisionType.SEND_NOTIFICATION
              ? SendNotificationParams
              : T extends DecisionType.TRIGGER_AUTOMATION
                ? TriggerAutomationParams
                : T extends DecisionType.ESCALATE
                  ? EscalateParams
                  : Record<string, unknown>;

/**
 * Strongly-typed action with correct parameter type.
 */
export type TypedAgentAction<T extends DecisionType> = Omit<
  AgentAction,
  'type' | 'params'
> & {
  type: T;
  params: ActionParamsFor<T>;
};

/**
 * Default LLM options
 */
export const DEFAULT_LLM_OPTIONS: Required<Pick<LLMOptions, 'temperature' | 'maxTokens' | 'timeout'>> = {
  temperature: 0.3,
  maxTokens: 2000,
  timeout: 30000,
};

/**
 * Default agent configuration values
 */
export const DEFAULT_AGENT_CONFIG: Pick<
  AgentConfig,
  'temperature' | 'autoExecuteThreshold' | 'requireApprovalThreshold' | 'maxActionsPerMinute' | 'maxActionsPerHour'
> = {
  temperature: 0.3,
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
  maxActionsPerMinute: 60,
  maxActionsPerHour: 500,
};
