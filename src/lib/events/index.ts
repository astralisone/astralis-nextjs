/**
 * Event system convenience functions and re-exports
 * Provides type-safe event emission helpers for task and pipeline events
 *
 * @module events
 */

import { AgentEventBus } from "../agent/inputs/EventBus";
import type {
  TaskEventName,
  TaskCreatedPayload,
  TaskStatusChangedPayload,
  TaskStageChangedPayload,
  TaskAssigneeChangedPayload,
  TaskOverrideSetPayload,
  TaskReprocessRequestedPayload,
  TaskSlaWarningPayload,
  TaskSlaBreachedPayload,
  PipelineEventName,
  PipelineItemAddedPayload,
  PipelineItemMovedPayload,
  PipelineItemAssignedPayload,
  PipelineItemSlaBreachedPayload,
  PipelineItemCompletedPayload,
} from "./types";

// Re-export all types
export * from "./types";

// =============================================================================
// TYPE MAPS
// =============================================================================

/**
 * Map of task event names to their payload types
 */
type TaskEventPayloadMap = {
  "task:created": TaskCreatedPayload;
  "task:status_changed": TaskStatusChangedPayload;
  "task:stage_changed": TaskStageChangedPayload;
  "task:assignee_changed": TaskAssigneeChangedPayload;
  "task:override_set": TaskOverrideSetPayload;
  "task:reprocess_requested": TaskReprocessRequestedPayload;
  "task:sla_warning": TaskSlaWarningPayload;
  "task:sla_breached": TaskSlaBreachedPayload;
};

/**
 * Map of pipeline event names to their payload types
 */
type PipelineEventPayloadMap = {
  "pipeline:item_added": PipelineItemAddedPayload;
  "pipeline:item_moved": PipelineItemMovedPayload;
  "pipeline:item_assigned": PipelineItemAssignedPayload;
  "pipeline:item_sla_breached": PipelineItemSlaBreachedPayload;
  "pipeline:item_completed": PipelineItemCompletedPayload;
};

// =============================================================================
// EVENT EMISSION OPTIONS
// =============================================================================

/**
 * Options for emitting events
 */
export interface EmitEventOptions {
  /** Correlation ID for tracking related events */
  correlationId?: string;
  /** Organization ID */
  orgId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// TASK EVENT EMISSION
// =============================================================================

/**
 * Emit a task event with type safety.
 *
 * @param eventName - The task event name
 * @param payload - The event payload (type-checked based on event name)
 * @param options - Optional correlation ID and org ID
 * @returns Promise that resolves when event is emitted
 *
 * @example
 * ```typescript
 * await emitTaskEvent('task:created', {
 *   taskId: 'task_123',
 *   orgId: 'org_456',
 *   source: 'FORM',
 *   type: 'booking_request',
 *   category: 'SALES_INQUIRY',
 *   priority: 3
 * });
 * ```
 */
export async function emitTaskEvent<T extends TaskEventName>(
  eventName: T,
  payload: TaskEventPayloadMap[T],
  options?: EmitEventOptions
): Promise<void> {
  const eventBus = AgentEventBus.getInstance();

  await eventBus.emit(eventName, payload, {
    source: "system",
    correlationId: options?.correlationId,
    orgId: options?.orgId,
    metadata: options?.metadata,
  });
}

// =============================================================================
// PIPELINE EVENT EMISSION
// =============================================================================

/**
 * Emit a pipeline event with type safety.
 *
 * @param eventName - The pipeline event name
 * @param payload - The event payload (type-checked based on event name)
 * @param options - Optional correlation ID and org ID
 * @returns Promise that resolves when event is emitted
 *
 * @example
 * ```typescript
 * await emitPipelineEvent('pipeline:item_moved', {
 *   pipelineKey: 'sales-tasks',
 *   orgId: 'org_456',
 *   taskId: 'task_123',
 *   fromStageKey: 'new_intake',
 *   toStageKey: 'qualification',
 *   by: 'SYSTEM',
 *   reason: 'AUTO_RULE'
 * });
 * ```
 */
export async function emitPipelineEvent<T extends PipelineEventName>(
  eventName: T,
  payload: PipelineEventPayloadMap[T],
  options?: EmitEventOptions
): Promise<void> {
  const eventBus = AgentEventBus.getInstance();

  await eventBus.emit(eventName, payload, {
    source: "system",
    correlationId: options?.correlationId,
    orgId: options?.orgId,
    metadata: options?.metadata,
  });
}

// =============================================================================
// EVENT BUS ACCESS
// =============================================================================

/**
 * Get the singleton EventBus instance for subscribing to events.
 *
 * @example
 * ```typescript
 * const eventBus = getEventBus();
 *
 * // Subscribe to task events
 * eventBus.on('task:created', async (event) => {
 *   console.log('New task created:', event.payload);
 * });
 *
 * // Subscribe to all events with wildcard
 * eventBus.onAny(async (event) => {
 *   console.log('Event:', event.type);
 * });
 * ```
 */
export function getEventBus(): AgentEventBus {
  return AgentEventBus.getInstance();
}
