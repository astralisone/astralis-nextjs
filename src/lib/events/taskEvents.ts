/**
 * Task event helper functions
 * Convenience wrappers for emitting common task events
 *
 * @module events.taskEvents
 */

import type { TaskStatus, TaskSource, TaskOverride } from "../types/tasks";
import { emitTaskEvent, type EmitEventOptions } from "./index";

// =============================================================================
// TASK EVENT HELPERS
// =============================================================================

/**
 * Emit a task.created event when a new task is created.
 *
 * @param task - Task instance data
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskCreated({
 *   id: 'task_123',
 *   orgId: 'org_456',
 *   source: 'FORM',
 *   type: 'booking_request',
 *   category: 'SALES_INQUIRY',
 *   priority: 3
 * });
 * ```
 */
export async function emitTaskCreated(
  task: {
    id: string;
    orgId: string;
    source: TaskSource;
    type: string;
    category: string;
    priority: number;
  },
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:created",
    {
      taskId: task.id,
      orgId: task.orgId,
      source: task.source,
      type: task.type,
      category: task.category,
      priority: task.priority,
    },
    options
  );
}

/**
 * Emit a task.status_changed event when a task status changes.
 *
 * @param taskId - Task ID
 * @param fromStatus - Previous status
 * @param toStatus - New status
 * @param orgId - Organization ID
 * @param reason - Reason for status change
 * @param by - Who triggered the change (SYSTEM or USER)
 * @param byUserId - Optional user ID if changed by user
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskStatusChanged(
 *   'task_123',
 *   'NEW',
 *   'IN_PROGRESS',
 *   'org_456',
 *   'PIPELINE_MOVE',
 *   'SYSTEM'
 * );
 * ```
 */
export async function emitTaskStatusChanged(
  taskId: string,
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
  orgId: string,
  reason: "PIPELINE_MOVE" | "USER_ACTION" | "SYSTEM_RULE",
  by: "SYSTEM" | "USER",
  byUserId?: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:status_changed",
    {
      taskId,
      orgId,
      fromStatus,
      toStatus,
      reason,
      by,
      byUserId,
    },
    options
  );
}

/**
 * Emit a task.stage_changed event when a task moves between pipeline stages.
 *
 * @param taskId - Task ID
 * @param fromStageKey - Previous stage key (null if first stage)
 * @param toStageKey - New stage key
 * @param orgId - Organization ID
 * @param by - Who triggered the change (SYSTEM or USER)
 * @param byUserId - Optional user ID if changed by user
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskStageChanged(
 *   'task_123',
 *   'new_intake',
 *   'qualification',
 *   'org_456',
 *   'SYSTEM'
 * );
 * ```
 */
export async function emitTaskStageChanged(
  taskId: string,
  fromStageKey: string | null,
  toStageKey: string,
  orgId: string,
  by: "SYSTEM" | "USER",
  byUserId?: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:stage_changed",
    {
      taskId,
      orgId,
      fromStageKey,
      toStageKey,
      by,
      byUserId,
    },
    options
  );
}

/**
 * Emit a task.assignee_changed event when a task is assigned/unassigned.
 *
 * @param taskId - Task ID
 * @param fromUserId - Previous assignee (null if unassigned)
 * @param toUserId - New assignee (null if unassigning)
 * @param orgId - Organization ID
 * @param mode - Assignment mode (AUTO or MANUAL)
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskAssigneeChanged(
 *   'task_123',
 *   null,
 *   'user_789',
 *   'org_456',
 *   'AUTO'
 * );
 * ```
 */
export async function emitTaskAssigneeChanged(
  taskId: string,
  fromUserId: string | null | undefined,
  toUserId: string | null | undefined,
  orgId: string,
  mode: "AUTO" | "MANUAL",
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:assignee_changed",
    {
      taskId,
      orgId,
      fromUserId,
      toUserId,
      mode,
    },
    options
  );
}

/**
 * Emit a task.override_set event when a human takes over task processing.
 *
 * @param taskId - Task ID
 * @param override - Override configuration
 * @param orgId - Organization ID
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskOverrideSet(
 *   'task_123',
 *   {
 *     overridden: true,
 *     reason: 'complex_case',
 *     overriddenByUserId: 'user_789',
 *     overriddenAt: new Date()
 *   },
 *   'org_456'
 * );
 * ```
 */
export async function emitTaskOverrideSet(
  taskId: string,
  override: TaskOverride,
  orgId: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:override_set",
    {
      taskId,
      orgId,
      override,
    },
    options
  );
}

/**
 * Emit a task.reprocess_requested event when a user requests agent reprocessing.
 *
 * @param taskId - Task ID
 * @param requestedByUserId - User who requested reprocessing
 * @param orgId - Organization ID
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskReprocessRequested(
 *   'task_123',
 *   'user_789',
 *   'org_456'
 * );
 * ```
 */
export async function emitTaskReprocessRequested(
  taskId: string,
  requestedByUserId: string,
  orgId: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:reprocess_requested",
    {
      taskId,
      orgId,
      requestedByUserId,
    },
    options
  );
}

/**
 * Emit a task.sla_warning event when a task is approaching SLA breach.
 *
 * @param taskId - Task ID
 * @param orgId - Organization ID
 * @param expectedMinutes - Expected completion time in minutes
 * @param actualMinutes - Actual time elapsed in minutes
 * @param percentageUsed - Percentage of SLA time consumed (e.g., 80)
 * @param currentStageKey - Current stage key (optional)
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskSlaWarning(
 *   'task_123',
 *   'org_456',
 *   240, // 4 hours expected
 *   192, // 3.2 hours actual (80%)
 *   80,
 *   'qualification'
 * );
 * ```
 */
export async function emitTaskSlaWarning(
  taskId: string,
  orgId: string,
  expectedMinutes: number,
  actualMinutes: number,
  percentageUsed: number,
  currentStageKey?: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:sla_warning",
    {
      taskId,
      orgId,
      currentStageKey,
      expectedMinutes,
      actualMinutes,
      percentageUsed,
    },
    options
  );
}

/**
 * Emit a task.sla_breached event when a task exceeds its expected completion time.
 *
 * @param taskId - Task ID
 * @param orgId - Organization ID
 * @param expectedMinutes - Expected completion time in minutes
 * @param actualMinutes - Actual time elapsed in minutes
 * @param currentStageKey - Current stage key (optional)
 * @param options - Optional correlation ID and metadata
 *
 * @example
 * ```typescript
 * await emitTaskSlaBreached(
 *   'task_123',
 *   'org_456',
 *   240, // 4 hours expected
 *   300, // 5 hours actual
 *   'qualification'
 * );
 * ```
 */
export async function emitTaskSlaBreached(
  taskId: string,
  orgId: string,
  expectedMinutes: number,
  actualMinutes: number,
  currentStageKey?: string,
  options?: EmitEventOptions
): Promise<void> {
  await emitTaskEvent(
    "task:sla_breached",
    {
      taskId,
      orgId,
      currentStageKey,
      expectedMinutes,
      actualMinutes,
    },
    options
  );
}
