/**
 * Core types for Task Templates, Task Instances, and Decision Logs
 * Part of the Agentic Task System
 *
 * @module tasks
 */

// =============================================================================
// ENUMS & PRIMITIVE TYPES
// =============================================================================

/**
 * Status of a task through its lifecycle.
 * Mirrors the Prisma TaskStatus enum.
 */
export type TaskStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "NEEDS_REVIEW"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

/**
 * Source channel from which a task was created.
 * Mirrors the Prisma TaskSource enum.
 */
export type TaskSource = "FORM" | "EMAIL" | "CHAT" | "API" | "CALL";

// =============================================================================
// TASK TEMPLATE TYPES
// =============================================================================

/**
 * Template definition for a task step.
 * Defines the required steps in a task workflow.
 */
export interface TaskStepTemplate {
  /** Unique identifier for the step */
  id: string;
  /** Display label for the step */
  label: string;
  /** Order/sequence of this step (1, 2, 3, etc.) */
  order: number;
}

/**
 * Agent configuration for a task template.
 * Defines how the Base Task Agent should behave for this task type.
 */
export interface TaskTemplateAgentConfig {
  /** System prompt for the LLM when processing this task type */
  systemPrompt: string;
  /** Actions the agent is allowed to take for this task type */
  allowedActions: string[];
  /** Criteria that must be met for task completion */
  completionCriteria: {
    /** Required final status */
    status: TaskStatus | string;
    /** Step IDs that must be completed */
    requiredStepsCompleted?: string[];
  };
}

/**
 * Task Template - Static definition of how a task type behaves.
 * Templates are JSON configs loaded from config/task-templates.json.
 */
export interface TaskTemplate {
  /** Unique identifier (e.g., "BOOKING_REQUEST_V1") */
  id: string;
  /** Display label (e.g., "Booking Request") */
  label: string;
  /** Sources this template applies to */
  applicableSources: TaskSource[];
  /** Category for classification (e.g., "SALES_INQUIRY") */
  category: string;
  /** Responsible department */
  department: string;
  /** Required staff role */
  staffRole: string;
  /** Typical time to complete in minutes */
  typicalMinutes: number;
  /** Default priority level (1-5, where 5 is highest) */
  defaultPriority: number;
  /** Pipeline routing configuration */
  pipeline: {
    /** Preferred pipeline key for this task type */
    preferredPipelineKey: string;
    /** Default stage key within the pipeline */
    defaultStageKey: string;
  };
  /** Ordered workflow steps */
  steps: TaskStepTemplate[];
  /** Agent behavior configuration */
  agentConfig: TaskTemplateAgentConfig;
}

// =============================================================================
// TASK INSTANCE TYPES
// =============================================================================

/**
 * Runtime state of a task step.
 * Tracks completion status for each step in a task instance.
 */
export interface TaskStepInstance {
  /** Step ID from the template */
  id: string;
  /** Current status of this step */
  status: TaskStatus;
}

/**
 * Timeline tracking for task SLA management.
 */
export interface TaskTimeline {
  /** Expected completion time in minutes (from template) */
  typicalMinutes: number;
  /** When the task was started */
  startedAt?: string | null;
  /** When the task is due to be completed */
  dueAt?: string | null;
  /** When SLA was breached (if applicable) */
  breachedAt?: string | null;
}

/**
 * Human override flag for task processing.
 * When set, the Base Task Agent will stop processing and emit NO_OP.
 */
export interface TaskOverride {
  /** Whether this task has been overridden by a human */
  overridden: boolean;
  /** Reason for the override */
  reason?: string | null;
  /** User ID who set the override */
  byUserId?: string | null;
  /** Timestamp when override was set */
  at?: string | null;
}

/**
 * Agent state tracking for a task instance.
 * Links to decision log entries for audit trail.
 */
export interface TaskAgentState {
  /** Most recent decision ID */
  lastDecisionId?: string | null;
  /** Array of all decision IDs for this task */
  decisionIds: string[];
}

/**
 * Task Instance - Concrete task created from a template.
 * Represents actual work to be done, tracked through pipelines.
 */
export interface TaskInstance {
  /** Unique identifier */
  id: string;
  /** Template this task was created from */
  templateId: string;
  /** Organization ID */
  orgId: string;

  // Source information
  /** Channel this task came from */
  source: TaskSource;
  /** Optional ID from the source system */
  sourceId?: string;

  // Core task data
  /** Task title/subject */
  title: string;
  /** Detailed description */
  description?: string;

  // Classification
  /** Task type (from template) */
  type: string;
  /** Category (from template) */
  category: string;
  /** Department (from template) */
  department?: string;
  /** Required staff role (from template) */
  staffRole?: string;

  // Status and priority
  /** Priority level (1-5, where 5 is highest) */
  priority: 1 | 2 | 3 | 4 | 5;
  /** Current status */
  status: TaskStatus;

  // Pipeline placement
  /** Pipeline key this task is in */
  pipelineKey?: string | null;
  /** Stage key within the pipeline */
  stageKey?: string | null;

  // Workflow tracking
  /** Timeline and SLA tracking */
  timeline: TaskTimeline;
  /** Step completion status */
  steps: TaskStepInstance[];

  // Attachments
  /** Related files/documents */
  attachments?: Array<{
    id: string;
    type: "DOCUMENT" | "IMAGE" | "AUDIO" | "OTHER";
    url: string;
    label?: string;
  }>;

  // Additional data
  /** Custom data specific to this task */
  data?: Record<string, any>;
  /** Tags for filtering/organization */
  tags?: string[];

  // Assignment
  /** User ID of assigned staff member */
  assignedToUserId?: string | null;

  // Override state
  /** Human override configuration */
  override: TaskOverride;

  // Agent state
  /** Agent processing state */
  agentState: TaskAgentState;

  // Timestamps
  /** When the task was created */
  createdAt: string;
  /** When the task was last updated */
  updatedAt: string;
}

// =============================================================================
// AGENT ACTION TYPES
// =============================================================================

/**
 * Action: Set task status
 */
export interface AgentActionSetStatus {
  type: "SET_STATUS";
  toStatus: TaskStatus;
}

/**
 * Action: Set task stage in pipeline
 */
export interface AgentActionSetStage {
  type: "SET_STAGE";
  toStageKey: string;
}

/**
 * Action: Assign staff to task
 */
export interface AgentActionAssignStaff {
  type: "ASSIGN_STAFF";
  strategy: "LEAST_BUSY_IN_ROLE" | "KEEP_EXISTING" | "UNASSIGN";
  role?: string;
}

/**
 * Action: Add/remove tags
 */
export interface AgentActionTagTask {
  type: "TAG_TASK";
  add: string[];
  remove?: string[];
}

/**
 * Action: Send customer communication
 */
export interface AgentActionPingCustomer {
  type: "PING_CUSTOMER";
  channel: "EMAIL" | "SMS" | "CHAT";
  templateHint: string;
}

/**
 * Action: Add internal note
 */
export interface AgentActionAddInternalNote {
  type: "ADD_INTERNAL_NOTE";
  note: string;
}

/**
 * Action: Escalate to higher level
 */
export interface AgentActionEscalate {
  type: "ESCALATE";
  reason: string;
  targetRole?: string;
}

/**
 * Action: No operation (when override is set)
 */
export interface AgentActionNoOp {
  type: "NO_OP";
  reason: string;
}

/**
 * Union type of all possible agent actions.
 * The Base Task Agent emits these actions based on task events.
 */
export type AgentAction =
  | AgentActionSetStatus
  | AgentActionSetStage
  | AgentActionAssignStaff
  | AgentActionTagTask
  | AgentActionPingCustomer
  | AgentActionAddInternalNote
  | AgentActionEscalate
  | AgentActionNoOp;

// =============================================================================
// DECISION LOG TYPES
// =============================================================================

/**
 * LLM call metadata for decision audit trail.
 */
export interface DecisionLLMCall {
  /** Model used (e.g., "gpt-4-turbo") */
  model: string;
  /** Type of prompt used */
  promptType: string;
  /** Input tokens consumed */
  tokensIn?: number;
  /** Output tokens generated */
  tokensOut?: number;
}

/**
 * Agent decision result from LLM.
 * Contains reasoning and actions to execute.
 */
export interface AgentDecision {
  /** LLM's reasoning for the decision */
  reasoning: string;
  /** Array of actions to execute */
  actions: AgentAction[];
}

/**
 * Decision Log Entry - Append-only audit trail of agent decisions.
 * Each entry records what the agent decided and why for a specific event.
 */
export interface DecisionLogEntry {
  /** Unique identifier */
  id: string;
  /** Task this decision was made for */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Template ID (for context) */
  templateId: string;
  /** Event that triggered this decision */
  eventName: string;
  /** Optional event ID for correlation */
  eventId?: string;
  /** Hash of agent config for reproducibility */
  agentConfigHash?: string;
  /** Snapshot of task state when decision was made */
  inputSnapshot: Record<string, any>;
  /** LLM call metadata */
  llmCall?: DecisionLLMCall;
  /** The decision result */
  decision: AgentDecision;
  /** When the decision was applied */
  appliedAt: string;
  /** When the log entry was created */
  createdAt: string;
}
