/**
 * TaskActionExecutor - Executes actions for the Base Task Agent
 *
 * The TaskActionExecutor is responsible for:
 * - Executing AgentAction types emitted by the Base Task Agent
 * - Updating task state in the database via Prisma
 * - Emitting corresponding task.* and pipeline.* events
 * - Handling staff assignment strategies
 * - Managing task tags, notes, and escalations
 *
 * @module TaskActionExecutor
 */

import type {
  AgentAction,
  AgentActionSetStatus,
  AgentActionSetStage,
  AgentActionAssignStaff,
  AgentActionTagTask,
  AgentActionPingCustomer,
  AgentActionAddInternalNote,
  AgentActionEscalate,
  AgentActionNoOp,
  TaskStatus,
} from '../../types/tasks';
import {
  emitTaskEvent,
  emitPipelineEvent,
  type EmitEventOptions,
} from '../../events';
import { prisma } from '../../prisma';

// =============================================================================
// Types
// =============================================================================

/**
 * Result from executing a task action
 */
export interface TaskActionResult {
  /** Whether the action succeeded */
  success: boolean;
  /** Action type that was executed */
  action: string;
  /** Optional data returned by the handler */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Context passed to action handlers
 */
export interface TaskActionContext {
  /** Task ID being acted upon */
  taskId: string;
  /** Organization ID */
  orgId: string;
  /** Correlation ID for event tracking */
  correlationId?: string;
  /** Whether this is a dry run */
  dryRun?: boolean;
}

/**
 * Logger interface
 */
interface Logger {
  debug: (msg: string, data?: unknown) => void;
  info: (msg: string, data?: unknown) => void;
  warn: (msg: string, data?: unknown) => void;
  error: (msg: string, err?: unknown, data?: unknown) => void;
}

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[TaskActionExecutor] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[TaskActionExecutor] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[TaskActionExecutor] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[TaskActionExecutor] ${msg}`, err, data ?? ''),
};

// =============================================================================
// TaskActionExecutor Class
// =============================================================================

/**
 * TaskActionExecutor executes actions emitted by the Base Task Agent.
 *
 * @example
 * ```typescript
 * const executor = new TaskActionExecutor();
 *
 * const result = await executor.executeAction(
 *   { type: 'SET_STATUS', toStatus: 'IN_PROGRESS' },
 *   { taskId: 'task_123', orgId: 'org_456' }
 * );
 * ```
 */
export class TaskActionExecutor {
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? defaultLogger;
    this.logger.info('TaskActionExecutor initialized');
  }

  // ===========================================================================
  // Main Execution Method
  // ===========================================================================

  /**
   * Execute a single action for a task.
   *
   * @param action - The action to execute
   * @param context - Execution context
   * @returns Action execution result
   */
  async executeAction(
    action: AgentAction,
    context: TaskActionContext
  ): Promise<TaskActionResult> {
    const startTime = Date.now();

    this.logger.debug(`Executing action: ${action.type}`, { action, context });

    try {
      // Route to appropriate handler based on action type
      switch (action.type) {
        case 'SET_STATUS':
          return await this.handleSetStatus(action, context, startTime);

        case 'SET_STAGE':
          return await this.handleSetStage(action, context, startTime);

        case 'ASSIGN_STAFF':
          return await this.handleAssignStaff(action, context, startTime);

        case 'TAG_TASK':
          return await this.handleTagTask(action, context, startTime);

        case 'PING_CUSTOMER':
          return await this.handlePingCustomer(action, context, startTime);

        case 'ADD_INTERNAL_NOTE':
          return await this.handleAddInternalNote(action, context, startTime);

        case 'ESCALATE':
          return await this.handleEscalate(action, context, startTime);

        case 'NO_OP':
          return await this.handleNoOp(action, context, startTime);

        default:
          return {
            success: false,
            action: (action as AgentAction).type,
            error: `Unknown action type: ${(action as AgentAction).type}`,
            executionTime: Date.now() - startTime,
          };
      }
    } catch (error) {
      this.logger.error(`Action execution failed: ${action.type}`, error);
      return {
        success: false,
        action: action.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute multiple actions sequentially.
   *
   * @param actions - Array of actions to execute
   * @param context - Execution context
   * @returns Array of action results
   */
  async executeActions(
    actions: AgentAction[],
    context: TaskActionContext
  ): Promise<TaskActionResult[]> {
    const results: TaskActionResult[] = [];

    for (const action of actions) {
      const result = await this.executeAction(action, context);
      results.push(result);

      // Stop on first failure if it's critical
      if (!result.success && action.type !== 'NO_OP') {
        this.logger.warn('Stopping action execution due to failure', {
          action: action.type,
          error: result.error,
        });
        break;
      }
    }

    return results;
  }

  // ===========================================================================
  // Action Handlers
  // ===========================================================================

  /**
   * Handle SET_STATUS action: Update task.status and emit task:status_changed
   */
  private async handleSetStatus(
    action: AgentActionSetStatus,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'SET_STATUS',
        data: { dryRun: true, toStatus: action.toStatus },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get fromStatus
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { status: true, orgId: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'SET_STATUS',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const fromStatus = task.status as TaskStatus;

    // Update task status
    await prisma.task.update({
      where: { id: context.taskId },
      data: { status: action.toStatus },
    });

    // Emit task:status_changed event
    await emitTaskEvent(
      'task:status_changed',
      {
        taskId: context.taskId,
        orgId: context.orgId,
        fromStatus,
        toStatus: action.toStatus,
        reason: 'SYSTEM_RULE',
        by: 'SYSTEM',
      },
      { correlationId: context.correlationId }
    );

    this.logger.info('Status updated', {
      taskId: context.taskId,
      fromStatus,
      toStatus: action.toStatus,
    });

    return {
      success: true,
      action: 'SET_STATUS',
      data: { fromStatus, toStatus: action.toStatus },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle SET_STAGE action: Update task.stageKey and emit task:stage_changed + pipeline:item_moved
   */
  private async handleSetStage(
    action: AgentActionSetStage,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'SET_STAGE',
        data: { dryRun: true, toStageKey: action.toStageKey },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get fromStageKey and pipelineKey
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { stageKey: true, pipelineKey: true, orgId: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'SET_STAGE',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const fromStageKey = task.stageKey;
    const pipelineKey = task.pipelineKey;

    // Update task stageKey
    await prisma.task.update({
      where: { id: context.taskId },
      data: { stageKey: action.toStageKey },
    });

    // Emit task:stage_changed event
    await emitTaskEvent(
      'task:stage_changed',
      {
        taskId: context.taskId,
        orgId: context.orgId,
        fromStageKey,
        toStageKey: action.toStageKey,
        by: 'SYSTEM',
      },
      { correlationId: context.correlationId }
    );

    // Emit pipeline:item_moved event if pipelineKey exists
    if (pipelineKey) {
      await emitPipelineEvent(
        'pipeline:item_moved',
        {
          pipelineKey,
          orgId: context.orgId,
          taskId: context.taskId,
          fromStageKey,
          toStageKey: action.toStageKey,
          by: 'SYSTEM',
          reason: 'AUTO_RULE',
        },
        { correlationId: context.correlationId }
      );
    }

    this.logger.info('Stage updated', {
      taskId: context.taskId,
      fromStageKey,
      toStageKey: action.toStageKey,
    });

    return {
      success: true,
      action: 'SET_STAGE',
      data: { fromStageKey, toStageKey: action.toStageKey },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle ASSIGN_STAFF action: Find staff by strategy and update task.assignedToUserId
   */
  private async handleAssignStaff(
    action: AgentActionAssignStaff,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'ASSIGN_STAFF',
        data: { dryRun: true, strategy: action.strategy },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get current assignee
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { assignedToUserId: true, orgId: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'ASSIGN_STAFF',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const fromUserId = task.assignedToUserId;
    let toUserId: string | null = null;

    // Apply assignment strategy
    switch (action.strategy) {
      case 'LEAST_BUSY_IN_ROLE':
        toUserId = await this.findLeastBusyStaff(context.orgId, action.role);
        break;

      case 'KEEP_EXISTING':
        toUserId = fromUserId;
        break;

      case 'UNASSIGN':
        toUserId = null;
        break;
    }

    // Update task assignedToUserId
    await prisma.task.update({
      where: { id: context.taskId },
      data: { assignedToUserId: toUserId },
    });

    // Emit task:assignee_changed event
    await emitTaskEvent(
      'task:assignee_changed',
      {
        taskId: context.taskId,
        orgId: context.orgId,
        fromUserId,
        toUserId,
        mode: 'AUTO',
      },
      { correlationId: context.correlationId }
    );

    this.logger.info('Staff assigned', {
      taskId: context.taskId,
      fromUserId,
      toUserId,
      strategy: action.strategy,
    });

    return {
      success: true,
      action: 'ASSIGN_STAFF',
      data: { fromUserId, toUserId, strategy: action.strategy },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle TAG_TASK action: Update task.tags array
   */
  private async handleTagTask(
    action: AgentActionTagTask,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'TAG_TASK',
        data: { dryRun: true, add: action.add, remove: action.remove },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get existing tags
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { tags: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'TAG_TASK',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const currentTags = (task.tags ?? []) as string[];
    let newTags = [...currentTags];

    // Add new tags
    for (const tag of action.add) {
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
    }

    // Remove tags if specified
    if (action.remove && action.remove.length > 0) {
      newTags = newTags.filter(tag => !action.remove!.includes(tag));
    }

    // Update task tags
    await prisma.task.update({
      where: { id: context.taskId },
      data: { tags: newTags },
    });

    this.logger.info('Tags updated', {
      taskId: context.taskId,
      addedTags: action.add,
      removedTags: action.remove,
    });

    return {
      success: true,
      action: 'TAG_TASK',
      data: { added: action.add, removed: action.remove, newTags },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle PING_CUSTOMER action: Log notification (placeholder for actual notification service)
   */
  private async handlePingCustomer(
    action: AgentActionPingCustomer,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'PING_CUSTOMER',
        data: { dryRun: true, channel: action.channel, templateHint: action.templateHint },
        executionTime: Date.now() - startTime,
      };
    }

    // TODO: Integrate with actual notification service
    // For now, just log the action
    this.logger.info('Customer notification requested', {
      taskId: context.taskId,
      channel: action.channel,
      templateHint: action.templateHint,
    });

    return {
      success: true,
      action: 'PING_CUSTOMER',
      data: {
        channel: action.channel,
        templateHint: action.templateHint,
        status: 'queued',
      },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle ADD_INTERNAL_NOTE action: Append to task.data.notes
   */
  private async handleAddInternalNote(
    action: AgentActionAddInternalNote,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'ADD_INTERNAL_NOTE',
        data: { dryRun: true, note: action.note },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get existing data
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { data: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'ADD_INTERNAL_NOTE',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const currentData = (task.data ?? {}) as Record<string, unknown>;
    const currentNotes = (currentData.notes ?? []) as Array<{
      note: string;
      timestamp: string;
      by: string;
    }>;

    // Append new note
    const newNote = {
      note: action.note,
      timestamp: new Date().toISOString(),
      by: 'SYSTEM',
    };

    const updatedNotes = [...currentNotes, newNote];

    // Update task data with new notes
    await prisma.task.update({
      where: { id: context.taskId },
      data: {
        data: {
          ...currentData,
          notes: updatedNotes,
        },
      },
    });

    this.logger.info('Internal note added', {
      taskId: context.taskId,
      noteLength: action.note.length,
    });

    return {
      success: true,
      action: 'ADD_INTERNAL_NOTE',
      data: { noteAdded: true, totalNotes: updatedNotes.length },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle ESCALATE action: Set status to NEEDS_REVIEW and add escalated tag
   */
  private async handleEscalate(
    action: AgentActionEscalate,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    if (context.dryRun) {
      return {
        success: true,
        action: 'ESCALATE',
        data: { dryRun: true, reason: action.reason, targetRole: action.targetRole },
        executionTime: Date.now() - startTime,
      };
    }

    // Fetch current task to get existing data and tags
    const task = await prisma.task.findUnique({
      where: { id: context.taskId },
      select: { status: true, tags: true, data: true, orgId: true },
    });

    if (!task) {
      return {
        success: false,
        action: 'ESCALATE',
        error: `Task not found: ${context.taskId}`,
        executionTime: Date.now() - startTime,
      };
    }

    const fromStatus = task.status as TaskStatus;
    const currentTags = (task.tags ?? []) as string[];
    const currentData = (task.data ?? {}) as Record<string, unknown>;

    // Add escalated tag if not already present
    const newTags = currentTags.includes('escalated')
      ? currentTags
      : [...currentTags, 'escalated'];

    // Add escalation info to data
    const escalationInfo = {
      reason: action.reason,
      targetRole: action.targetRole,
      escalatedAt: new Date().toISOString(),
    };

    // Update task: set status to NEEDS_REVIEW, add tag, add escalation info
    await prisma.task.update({
      where: { id: context.taskId },
      data: {
        status: 'NEEDS_REVIEW',
        tags: newTags,
        data: {
          ...currentData,
          escalation: escalationInfo,
        },
      },
    });

    // Emit task:status_changed event
    await emitTaskEvent(
      'task:status_changed',
      {
        taskId: context.taskId,
        orgId: context.orgId,
        fromStatus,
        toStatus: 'NEEDS_REVIEW',
        reason: 'SYSTEM_RULE',
        by: 'SYSTEM',
      },
      { correlationId: context.correlationId }
    );

    this.logger.info('Task escalated', {
      taskId: context.taskId,
      reason: action.reason,
      targetRole: action.targetRole,
    });

    return {
      success: true,
      action: 'ESCALATE',
      data: {
        fromStatus,
        toStatus: 'NEEDS_REVIEW',
        reason: action.reason,
        targetRole: action.targetRole,
      },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Handle NO_OP action: Log and return (no database changes)
   */
  private async handleNoOp(
    action: AgentActionNoOp,
    context: TaskActionContext,
    startTime: number
  ): Promise<TaskActionResult> {
    this.logger.info('NO_OP action', {
      taskId: context.taskId,
      reason: action.reason,
    });

    return {
      success: true,
      action: 'NO_OP',
      data: { reason: action.reason },
      executionTime: Date.now() - startTime,
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Find the least busy staff member in a given role.
   * Uses task count as a simple metric for "busyness".
   *
   * @param orgId - Organization ID
   * @param role - Staff role to search (optional)
   * @returns User ID of least busy staff, or null if none found
   */
  private async findLeastBusyStaff(
    orgId: string,
    role?: string
  ): Promise<string | null> {
    try {
      // Build where clause
      const whereClause: Record<string, unknown> = {
        orgId,
        isActive: true,
      };

      if (role) {
        whereClause.role = role;
      }

      // Find all matching staff
      const staffMembers = await prisma.users.findMany({
        where: whereClause,
        select: { id: true },
      });

      if (staffMembers.length === 0) {
        this.logger.warn('No staff members found', { orgId, role });
        return null;
      }

      // Count tasks for each staff member
      const staffWithCounts = await Promise.all(
        staffMembers.map(async (staff: { id: string }) => {
          const taskCount = await prisma.task.count({
            where: {
              assignedToUserId: staff.id,
              status: {
                in: ['NEW', 'IN_PROGRESS'],
              },
            },
          });
          return { userId: staff.id, taskCount };
        })
      );

      // Sort by task count (ascending) and return the least busy
      staffWithCounts.sort((a: { taskCount: number }, b: { taskCount: number }) => a.taskCount - b.taskCount);
      const leastBusy = staffWithCounts[0];

      this.logger.debug('Found least busy staff', {
        userId: leastBusy.userId,
        taskCount: leastBusy.taskCount,
      });

      return leastBusy.userId;
    } catch (error) {
      this.logger.error('Failed to find least busy staff', error);
      return null;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new TaskActionExecutor instance.
 *
 * @param logger - Optional custom logger
 * @returns TaskActionExecutor instance
 */
export function createTaskActionExecutor(logger?: Logger): TaskActionExecutor {
  return new TaskActionExecutor(logger);
}
