/**
 * Event contracts for task.* and pipeline.* domain events
 * Part of the Agentic Task System event-driven architecture
 *
 * @module events.types
 */

import type { TaskStatus, TaskSource, TaskOverride } from "../types/tasks";

// =============================================================================
// EVENT ENVELOPE
// =============================================================================

/**
 * Generic event envelope wrapper.
 * All events in the system follow this structure for consistency.
 *
 * @typeParam TPayload - The type of the event payload
 * @typeParam TMeta - The type of optional metadata
 */
export interface EventEnvelope<TPayload = unknown, TMeta = unknown> {
  /** Unique event identifier (UUID) */
  id: string;
  /** Event name (e.g., "task.status_changed") */
  name: string;
  /** ISO timestamp when the event occurred */
  occurredAt: string;
  /** Event payload data */
  payload: TPayload;
  /** Optional metadata */
  meta?: TMeta;
}

// =============================================================================
// TASK EVENTS
// =============================================================================

/**
 * All possible task event names.
 * These events are emitted when task state changes.
 * Using colon notation to match AgentEventType convention.
 */
export type TaskEventName =
  | "task:created"
  | "task:status_changed"
  | "task:stage_changed"
  | "task:assignee_changed"
  | "task:override_set"
  | "task:reprocess_requested"
  | "task:sla_warning"
  | "task:sla_breached";

/**
 * Payload for task.created event.
 * Emitted when a new task instance is created.
 */
export interface TaskCreatedPayload {
  /** ID of the created task */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Source channel */
  source: TaskSource;
  /** Task type */
  type: string;
  /** Task category */
  category: string;
  /** Priority level */
  priority: number;
}

/**
 * Payload for task.status_changed event.
 * Emitted when a task's status changes.
 */
export interface TaskStatusChangedPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Previous status */
  fromStatus: TaskStatus;
  /** New status */
  toStatus: TaskStatus;
  /** Reason for the change */
  reason: "PIPELINE_MOVE" | "USER_ACTION" | "SYSTEM_RULE";
  /** Who triggered the change */
  by: "SYSTEM" | "USER";
  /** User ID if changed by user */
  byUserId?: string;
}

/**
 * Payload for task.stage_changed event.
 * Emitted when a task moves between pipeline stages.
 */
export interface TaskStageChangedPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Previous stage key (null if first stage) */
  fromStageKey: string | null;
  /** New stage key */
  toStageKey: string;
  /** Who triggered the change */
  by: "SYSTEM" | "USER";
  /** User ID if changed by user */
  byUserId?: string;
}

/**
 * Payload for task.assignee_changed event.
 * Emitted when a task is assigned/unassigned.
 */
export interface TaskAssigneeChangedPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Previous assignee (null if unassigned) */
  fromUserId?: string | null;
  /** New assignee (null if unassigning) */
  toUserId?: string | null;
  /** Assignment mode */
  mode: "AUTO" | "MANUAL";
}

/**
 * Payload for task.override_set event.
 * Emitted when a human takes over task processing.
 */
export interface TaskOverrideSetPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Override configuration */
  override: TaskOverride;
}

/**
 * Payload for task.reprocess_requested event.
 * Emitted when a user requests agent reprocessing.
 */
export interface TaskReprocessRequestedPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** User who requested reprocessing */
  requestedByUserId: string;
}

/**
 * Payload for task.sla_warning event.
 * Emitted when a task is approaching SLA breach (typically at 80% of expected time).
 */
export interface TaskSlaWarningPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Current stage key */
  currentStageKey?: string;
  /** Expected completion time in minutes */
  expectedMinutes: number;
  /** Actual time elapsed in minutes */
  actualMinutes: number;
  /** Percentage of SLA time consumed (e.g., 80) */
  percentageUsed: number;
}

/**
 * Payload for task.sla_breached event.
 * Emitted when a task exceeds its expected completion time.
 */
export interface TaskSlaBreachedPayload {
  /** Task ID */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Current stage key */
  currentStageKey?: string;
  /** Expected completion time in minutes */
  expectedMinutes: number;
  /** Actual time elapsed in minutes */
  actualMinutes: number;
}

/**
 * Union type of all task events with properly typed payloads.
 */
export type TaskEvent =
  | (EventEnvelope<TaskCreatedPayload> & { name: "task:created" })
  | (EventEnvelope<TaskStatusChangedPayload> & {
      name: "task:status_changed";
    })
  | (EventEnvelope<TaskStageChangedPayload> & {
      name: "task:stage_changed";
    })
  | (EventEnvelope<TaskAssigneeChangedPayload> & {
      name: "task:assignee_changed";
    })
  | (EventEnvelope<TaskOverrideSetPayload> & {
      name: "task:override_set";
    })
  | (EventEnvelope<TaskReprocessRequestedPayload> & {
      name: "task:reprocess_requested";
    })
  | (EventEnvelope<TaskSlaWarningPayload> & {
      name: "task:sla_warning";
    })
  | (EventEnvelope<TaskSlaBreachedPayload> & {
      name: "task:sla_breached";
    });

// =============================================================================
// PIPELINE EVENTS
// =============================================================================

/**
 * All possible pipeline event names.
 * These events are emitted when pipeline state changes.
 * Using colon notation to match AgentEventType convention.
 */
export type PipelineEventName =
  | "pipeline:item_added"
  | "pipeline:item_moved"
  | "pipeline:item_assigned"
  | "pipeline:item_sla_breached"
  | "pipeline:item_completed";

/**
 * Payload for pipeline.item_added event.
 * Emitted when a task is added to a pipeline.
 */
export interface PipelineItemAddedPayload {
  /** Pipeline key */
  pipelineKey: string;
  /** Organization ID */
  orgId: string;
  /** Stage key where item was added */
  stageKey: string;
  /** Task ID */
  taskId: string;
  /** How the item was added */
  source: "AI_ROUTING" | "MANUAL" | "IMPORT";
}

/**
 * Payload for pipeline.item_moved event.
 * Emitted when a task moves between stages.
 */
export interface PipelineItemMovedPayload {
  /** Pipeline key */
  pipelineKey: string;
  /** Organization ID */
  orgId: string;
  /** Task ID */
  taskId: string;
  /** Previous stage key (null if first stage) */
  fromStageKey: string | null;
  /** New stage key */
  toStageKey: string;
  /** Who triggered the move */
  by: "SYSTEM" | "USER";
  /** User ID if moved by user */
  byUserId?: string;
  /** Reason for the move */
  reason: "AUTO_RULE" | "DRAG_DROP" | "REPROCESS";
}

/**
 * Payload for pipeline.item_assigned event.
 * Emitted when a task is assigned/unassigned in a pipeline.
 */
export interface PipelineItemAssignedPayload {
  /** Pipeline key */
  pipelineKey: string;
  /** Organization ID */
  orgId: string;
  /** Task ID */
  taskId: string;
  /** Previous assignee (null if unassigned) */
  fromUserId?: string | null;
  /** New assignee (null if unassigning) */
  toUserId?: string | null;
  /** Assignment mode */
  mode: "AUTO" | "MANUAL";
}

/**
 * Payload for pipeline.item_sla_breached event.
 * Emitted when a task in a pipeline exceeds its SLA.
 */
export interface PipelineItemSlaBreachedPayload {
  /** Pipeline key */
  pipelineKey: string;
  /** Organization ID */
  orgId: string;
  /** Task ID */
  taskId: string;
  /** Stage key where breach occurred */
  stageKey: string;
  /** Expected completion time in minutes */
  expectedMinutes: number;
  /** Actual time elapsed in minutes */
  actualMinutes: number;
}

/**
 * Payload for pipeline.item_completed event.
 * Emitted when a task reaches a terminal stage.
 */
export interface PipelineItemCompletedPayload {
  /** Pipeline key */
  pipelineKey: string;
  /** Organization ID */
  orgId: string;
  /** Task ID */
  taskId: string;
  /** Final stage key */
  finalStageKey: string;
  /** User who completed the task (if applicable) */
  completedByUserId?: string;
}

/**
 * Union type of all pipeline events with properly typed payloads.
 */
export type PipelineEvent =
  | (EventEnvelope<PipelineItemAddedPayload> & {
      name: "pipeline:item_added";
    })
  | (EventEnvelope<PipelineItemMovedPayload> & {
      name: "pipeline:item_moved";
    })
  | (EventEnvelope<PipelineItemAssignedPayload> & {
      name: "pipeline:item_assigned";
    })
  | (EventEnvelope<PipelineItemSlaBreachedPayload> & {
      name: "pipeline:item_sla_breached";
    })
  | (EventEnvelope<PipelineItemCompletedPayload> & {
      name: "pipeline:item_completed";
    });
