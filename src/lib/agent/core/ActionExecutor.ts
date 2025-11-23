/**
 * ActionExecutor - Coordinates execution of agent actions
 *
 * The ActionExecutor is responsible for:
 * - Executing a list of AgentActions in order (or parallel where appropriate)
 * - Handling rollback on failure (when possible)
 * - Tracking execution results and timing
 * - Supporting dry-run mode for testing
 * - Managing action dependencies and conditions
 *
 * @module ActionExecutor
 */

import type {
  AgentAction,
  ActionResult,
  DecisionOutcome,
  ExecutionError,
  DecisionType,
  DecisionStatus,
  Logger,
  AssignPipelineParams,
  CreateEventParams,
  UpdateEventParams,
  CancelEventParams,
  SendNotificationParams,
  TriggerAutomationParams,
  EscalateParams,
} from '../types/agent.types';
import {
  DecisionType as DecisionTypeEnum,
  DecisionStatus as DecisionStatusEnum,
} from '../types/agent.types';
import { AgentEventBus, type EmitResult } from '../inputs/EventBus';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for the ActionExecutor
 */
export interface ActionExecutorConfig {
  /** Enable dry-run mode (no actions actually executed) */
  dryRun: boolean;
  /** Maximum time to execute all actions (ms) */
  maxExecutionTime: number;
  /** Timeout per individual action (ms) */
  actionTimeout: number;
  /** Number of retry attempts for failed actions */
  retryAttempts: number;
  /** Delay between retries (ms) */
  retryDelay: number;
  /** Whether to stop on first failure */
  stopOnFailure: boolean;
  /** Enable rollback on failure */
  enableRollback: boolean;
  /** Custom logger */
  logger?: Logger;
  /** Organization ID for context */
  orgId?: string;
}

/**
 * Handler function for executing a specific action type
 */
export type ActionHandler<T = Record<string, unknown>> = (
  params: T,
  context: ActionExecutionContext
) => Promise<ActionHandlerResult>;

/**
 * Result from an action handler
 */
export interface ActionHandlerResult {
  /** Whether the action succeeded */
  success: boolean;
  /** Data returned by the handler */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Whether rollback is possible */
  rollbackable?: boolean;
  /** Rollback function if available */
  rollback?: () => Promise<void>;
}

/**
 * Context passed to action handlers
 */
export interface ActionExecutionContext {
  /** Unique execution ID */
  executionId: string;
  /** Whether this is a dry run */
  dryRun: boolean;
  /** Organization ID */
  orgId?: string;
  /** Correlation ID for tracking */
  correlationId?: string;
  /** Previous action results (for dependencies) */
  previousResults: ActionResult[];
  /** Event bus for emitting events */
  eventBus: AgentEventBus;
}

/**
 * Rollback entry for tracking rollbackable actions
 */
interface RollbackEntry {
  action: AgentAction;
  rollbackFn: () => Promise<void>;
  timestamp: Date;
}

/**
 * Execution plan for optimizing action order
 */
interface ExecutionPlan {
  /** Actions to execute sequentially */
  sequential: AgentAction[];
  /** Actions that can be executed in parallel */
  parallel: AgentAction[][];
  /** Actions that are conditional */
  conditional: AgentAction[];
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: ActionExecutorConfig = {
  dryRun: false,
  maxExecutionTime: 300000, // 5 minutes
  actionTimeout: 30000, // 30 seconds
  retryAttempts: 2,
  retryDelay: 1000,
  stopOnFailure: false,
  enableRollback: true,
};

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[ActionExecutor] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[ActionExecutor] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[ActionExecutor] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[ActionExecutor] ${msg}`, err, data ?? ''),
};

// =============================================================================
// ActionExecutor Class
// =============================================================================

/**
 * ActionExecutor coordinates the execution of agent actions.
 *
 * @example
 * ```typescript
 * const executor = new ActionExecutor({
 *   dryRun: false,
 *   stopOnFailure: false,
 *   enableRollback: true,
 * });
 *
 * // Register custom handlers
 * executor.registerHandler(DecisionType.ASSIGN_PIPELINE, async (params, ctx) => {
 *   const result = await pipelineService.assign(params.intakeId, params.pipelineId);
 *   return { success: true, data: { assignmentId: result.id } };
 * });
 *
 * // Execute actions
 * const outcome = await executor.execute(decision.actions, {
 *   executionId: 'exec-123',
 *   correlationId: 'decision-456',
 * });
 * ```
 */
export class ActionExecutor {
  private config: ActionExecutorConfig;
  private logger: Logger;
  private handlers: Map<DecisionType, ActionHandler>;
  private rollbackStack: RollbackEntry[];
  private eventBus: AgentEventBus;

  constructor(config: Partial<ActionExecutorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = config.logger ?? defaultLogger;
    this.handlers = new Map();
    this.rollbackStack = [];
    this.eventBus = AgentEventBus.getInstance();

    // Register default handlers
    this.registerDefaultHandlers();

    this.logger.info('ActionExecutor initialized', {
      dryRun: this.config.dryRun,
      maxExecutionTime: this.config.maxExecutionTime,
      enableRollback: this.config.enableRollback,
    });
  }

  // ===========================================================================
  // Handler Registration
  // ===========================================================================

  /**
   * Register a handler for a specific action type.
   */
  registerHandler<T = Record<string, unknown>>(
    type: DecisionType,
    handler: ActionHandler<T>
  ): void {
    this.handlers.set(type, handler as ActionHandler);
    this.logger.debug(`Registered handler for action type: ${type}`);
  }

  /**
   * Unregister a handler for a specific action type.
   */
  unregisterHandler(type: DecisionType): boolean {
    const removed = this.handlers.delete(type);
    if (removed) {
      this.logger.debug(`Unregistered handler for action type: ${type}`);
    }
    return removed;
  }

  /**
   * Check if a handler is registered for an action type.
   */
  hasHandler(type: DecisionType): boolean {
    return this.handlers.has(type);
  }

  /**
   * Register default handlers for all action types.
   * These provide stub implementations that log and return success.
   */
  private registerDefaultHandlers(): void {
    // ASSIGN_PIPELINE handler
    this.registerHandler<AssignPipelineParams>(
      DecisionTypeEnum.ASSIGN_PIPELINE,
      async (params, ctx) => {
        this.logger.info('Executing ASSIGN_PIPELINE', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        // Emit event - actual implementation would call pipeline service
        await ctx.eventBus.emit('intake:assigned', {
          id: params.intakeId,
          intakeId: params.intakeId,
          pipelineId: params.pipelineId,
          stageId: params.stageId,
          assigneeId: params.assigneeId,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return {
          success: true,
          data: { assignmentId: `assign-${Date.now()}`, ...params },
          rollbackable: true,
          rollback: async () => {
            this.logger.info('Rolling back ASSIGN_PIPELINE', { intakeId: params.intakeId });
            // Actual rollback would unassign the intake
          },
        };
      }
    );

    // CREATE_EVENT handler
    this.registerHandler<CreateEventParams>(
      DecisionTypeEnum.CREATE_EVENT,
      async (params, ctx) => {
        this.logger.info('Executing CREATE_EVENT', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        const eventId = `evt-${Date.now()}`;

        await ctx.eventBus.emit('calendar:event_created', {
          id: eventId,
          eventId,
          title: params.title,
          startTime: params.startTime,
          endTime: params.endTime,
          attendees: params.attendees,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return {
          success: true,
          data: { eventId, ...params },
          rollbackable: true,
          rollback: async () => {
            this.logger.info('Rolling back CREATE_EVENT', { eventId });
            // Actual rollback would delete the created event
          },
        };
      }
    );

    // UPDATE_EVENT handler
    this.registerHandler<UpdateEventParams>(
      DecisionTypeEnum.UPDATE_EVENT,
      async (params, ctx): Promise<ActionHandlerResult> => {
        this.logger.info('Executing UPDATE_EVENT', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params }, rollbackable: false };
        }

        await ctx.eventBus.emit('calendar:event_updated', {
          id: params.eventId,
          eventId: params.eventId,
          updates: params,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return { success: true, data: params as unknown as Record<string, unknown>, rollbackable: false };
      }
    );

    // CANCEL_EVENT handler
    this.registerHandler<CancelEventParams>(
      DecisionTypeEnum.CANCEL_EVENT,
      async (params, ctx): Promise<ActionHandlerResult> => {
        this.logger.info('Executing CANCEL_EVENT', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params }, rollbackable: false };
        }

        await ctx.eventBus.emit('calendar:event_cancelled', {
          id: params.eventId,
          eventId: params.eventId,
          reason: params.reason,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return { success: true, data: params as unknown as Record<string, unknown>, rollbackable: false };
      }
    );

    // SEND_NOTIFICATION handler
    this.registerHandler<SendNotificationParams>(
      DecisionTypeEnum.SEND_NOTIFICATION,
      async (params, ctx) => {
        this.logger.info('Executing SEND_NOTIFICATION', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        // In production, this would call notification service
        // For now, just log and emit event
        const notificationId = `notif-${Date.now()}`;

        return {
          success: true,
          data: { notificationId, sentTo: params.recipientIds ?? params.recipientEmails },
          rollbackable: false, // Can't unsend notifications
        };
      }
    );

    // TRIGGER_AUTOMATION handler
    this.registerHandler<TriggerAutomationParams>(
      DecisionTypeEnum.TRIGGER_AUTOMATION,
      async (params, ctx) => {
        this.logger.info('Executing TRIGGER_AUTOMATION', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        await ctx.eventBus.emit('automation:triggered', {
          id: `auto-${Date.now()}`,
          workflowId: params.workflowId,
          workflowName: params.workflowId,
          status: 'success',
          executionTime: 0,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return {
          success: true,
          data: { triggerId: `trigger-${Date.now()}`, ...params },
          rollbackable: false,
        };
      }
    );

    // ESCALATE handler
    this.registerHandler<EscalateParams>(
      DecisionTypeEnum.ESCALATE,
      async (params, ctx): Promise<ActionHandlerResult> => {
        this.logger.info('Executing ESCALATE', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params }, rollbackable: false };
        }

        await ctx.eventBus.emit('intake:escalated', {
          id: `esc-${Date.now()}`,
          intakeId: (params.relatedEntityIds?.intakeId as string) ?? 'unknown',
          type: 'escalation',
          data: params,
          timestamp: new Date(),
          source: 'WORKER' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return { success: true, data: params as unknown as Record<string, unknown>, rollbackable: false };
      }
    );

    // NO_ACTION handler
    this.registerHandler(DecisionTypeEnum.NO_ACTION, async (params, ctx) => {
      this.logger.info('Executing NO_ACTION', { params, dryRun: ctx.dryRun });
      return { success: true, data: { noActionReason: (params as Record<string, unknown>).reason } };
    });
  }

  // ===========================================================================
  // Main Execution Methods
  // ===========================================================================

  /**
   * Execute a list of actions and return the outcome.
   *
   * @param actions - List of actions to execute
   * @param options - Execution options
   * @returns Execution outcome with results and errors
   */
  async execute(
    actions: AgentAction[],
    options: {
      executionId?: string;
      correlationId?: string;
      dryRun?: boolean;
    } = {}
  ): Promise<DecisionOutcome> {
    const startTime = Date.now();
    const executionId = options.executionId ?? `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const dryRun = options.dryRun ?? this.config.dryRun;

    this.logger.info('Starting action execution', {
      executionId,
      actionCount: actions.length,
      dryRun,
    });

    // Reset rollback stack
    this.rollbackStack = [];

    // Sort actions by priority
    const sortedActions = [...actions].sort((a, b) => (b.priority ?? 3) - (a.priority ?? 3));

    const results: ActionResult[] = [];
    const errors: ExecutionError[] = [];
    let overallStatus: DecisionStatus = DecisionStatusEnum.EXECUTED;

    // Create execution context
    const context: ActionExecutionContext = {
      executionId,
      dryRun,
      orgId: this.config.orgId,
      correlationId: options.correlationId,
      previousResults: [],
      eventBus: this.eventBus,
    };

    // Execute actions
    for (const action of sortedActions) {
      // Check execution timeout
      if (Date.now() - startTime > this.config.maxExecutionTime) {
        this.logger.error('Execution timeout exceeded');
        errors.push({
          action: action.type,
          code: 'EXECUTION_TIMEOUT',
          message: `Execution timeout exceeded (${this.config.maxExecutionTime}ms)`,
          retryable: true,
        });
        overallStatus = DecisionStatusEnum.FAILED;
        break;
      }

      // Handle delay if specified
      if (action.delayMs && action.delayMs > 0) {
        this.logger.debug(`Waiting ${action.delayMs}ms before executing ${action.type}`);
        await this.sleep(action.delayMs);
      }

      // Check condition if specified
      if (action.condition) {
        const conditionMet = await this.evaluateCondition(action.condition, context);
        if (!conditionMet) {
          this.logger.info(`Skipping action ${action.type}: condition not met`);
          results.push({
            action: action.type,
            success: true,
            data: { skipped: true, reason: 'Condition not met' },
            executionTime: 0,
            message: 'Action skipped: condition not met',
          });
          continue;
        }
      }

      // Execute the action
      const result = await this.executeAction(action, context);
      results.push(result);

      // Update context with previous results
      context.previousResults = [...results];

      // Handle failure
      if (!result.success) {
        const error: ExecutionError = {
          action: action.type,
          code: 'ACTION_FAILED',
          message: result.message ?? 'Action execution failed',
          retryable: true,
        };
        errors.push(error);

        if (this.config.stopOnFailure) {
          this.logger.warn('Stopping execution due to failure', { action: action.type });
          overallStatus = DecisionStatusEnum.FAILED;
          break;
        }
      }
    }

    // If any errors, determine if we should rollback
    if (errors.length > 0 && this.config.enableRollback && !dryRun) {
      const rollbackSuccessful = await this.performRollback();
      if (rollbackSuccessful) {
        overallStatus = DecisionStatusEnum.FAILED;
      }
    }

    // Determine final status
    if (errors.length > 0) {
      overallStatus = DecisionStatusEnum.FAILED;
    } else if (dryRun) {
      overallStatus = DecisionStatusEnum.PENDING; // Dry run doesn't actually execute
    }

    const outcome: DecisionOutcome = {
      status: overallStatus,
      executionTime: Date.now() - startTime,
      results,
      errors,
      rolledBack: this.rollbackStack.length > 0 && errors.length > 0,
      completedAt: new Date(),
    };

    this.logger.info('Action execution complete', {
      executionId,
      status: outcome.status,
      executionTime: outcome.executionTime,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length,
    });

    // Emit completion event
    await this.eventBus.emit('agent:action_executed', {
      id: executionId,
      decisionId: executionId,
      agentId: 'orchestration-agent',
      decisionType: sortedActions[0]?.type ?? DecisionTypeEnum.NO_ACTION,
      status: outcome.status,
      confidence: 1,
      actions: sortedActions,
      timestamp: new Date(),
      source: 'agent' as const,
    }, { source: 'agent', correlationId: options.correlationId });

    return outcome;
  }

  /**
   * Execute a single action with retry logic.
   */
  private async executeAction(
    action: AgentAction,
    context: ActionExecutionContext
  ): Promise<ActionResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    // Get handler
    const handler = this.handlers.get(action.type);
    if (!handler) {
      return {
        action: action.type,
        success: false,
        executionTime: Date.now() - startTime,
        message: `No handler registered for action type: ${action.type}`,
      };
    }

    // Attempt execution with retries
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.debug(`Retrying action ${action.type} (attempt ${attempt + 1})`);
          await this.sleep(this.config.retryDelay * attempt);
        }

        // Execute with timeout
        const result = await this.executeWithTimeout(
          () => handler(action.params, context),
          this.config.actionTimeout
        );

        // Track rollback if available
        if (result.rollbackable && result.rollback && !context.dryRun) {
          this.rollbackStack.push({
            action,
            rollbackFn: result.rollback,
            timestamp: new Date(),
          });
        }

        return {
          action: action.type,
          success: result.success,
          data: result.data,
          executionTime: Date.now() - startTime,
          message: result.error,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Action ${action.type} failed (attempt ${attempt + 1})`, {
          error: lastError.message,
        });
      }
    }

    return {
      action: action.type,
      success: false,
      executionTime: Date.now() - startTime,
      message: lastError?.message ?? 'Unknown error',
    };
  }

  /**
   * Execute a function with timeout.
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Action timeout exceeded (${timeoutMs}ms)`));
      }, timeoutMs);
    });

    return Promise.race([fn(), timeoutPromise]);
  }

  /**
   * Evaluate an action condition.
   */
  private async evaluateCondition(
    condition: NonNullable<AgentAction['condition']>,
    context: ActionExecutionContext
  ): Promise<boolean> {
    switch (condition.type) {
      case 'time_range': {
        const now = new Date();
        const start = new Date(condition.params.start as string);
        const end = new Date(condition.params.end as string);
        return now >= start && now <= end;
      }

      case 'user_available': {
        // Would check user availability in production
        return true;
      }

      case 'slot_available': {
        // Would check calendar slot availability in production
        return true;
      }

      case 'custom': {
        // Custom conditions can be evaluated based on params
        const evaluator = condition.params.evaluator;
        if (typeof evaluator === 'function') {
          return evaluator(context);
        }
        return true;
      }

      default:
        return true;
    }
  }

  // ===========================================================================
  // Rollback Methods
  // ===========================================================================

  /**
   * Perform rollback of executed actions in reverse order.
   */
  private async performRollback(): Promise<boolean> {
    if (this.rollbackStack.length === 0) {
      return true;
    }

    this.logger.info('Starting rollback', { actionsToRollback: this.rollbackStack.length });

    let allSuccessful = true;

    // Rollback in reverse order
    while (this.rollbackStack.length > 0) {
      const entry = this.rollbackStack.pop()!;

      try {
        this.logger.debug(`Rolling back action: ${entry.action.type}`);
        await entry.rollbackFn();
      } catch (error) {
        this.logger.error(`Rollback failed for action ${entry.action.type}`, error);
        allSuccessful = false;
      }
    }

    this.logger.info('Rollback complete', { successful: allSuccessful });
    return allSuccessful;
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Sleep for specified milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create an execution plan for optimized action execution.
   * (For future use with parallel execution)
   */
  createExecutionPlan(actions: AgentAction[]): ExecutionPlan {
    const sequential: AgentAction[] = [];
    const parallel: AgentAction[][] = [];
    const conditional: AgentAction[] = [];

    // Group actions by priority
    const priorityGroups = new Map<number, AgentAction[]>();

    for (const action of actions) {
      if (action.condition) {
        conditional.push(action);
        continue;
      }

      const priority = action.priority ?? 3;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(action);
    }

    // Convert priority groups to arrays
    const sortedPriorities = [...priorityGroups.keys()].sort((a, b) => b - a);

    for (const priority of sortedPriorities) {
      const group = priorityGroups.get(priority)!;
      if (group.length === 1) {
        sequential.push(group[0]);
      } else {
        parallel.push(group);
      }
    }

    return { sequential, parallel, conditional };
  }

  /**
   * Validate that all actions have registered handlers.
   */
  validateActions(actions: AgentAction[]): { valid: boolean; missing: DecisionType[] } {
    const missing: DecisionType[] = [];

    for (const action of actions) {
      if (!this.handlers.has(action.type)) {
        missing.push(action.type);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get executor statistics.
   */
  getStats(): {
    registeredHandlers: number;
    handlerTypes: DecisionType[];
    config: Readonly<ActionExecutorConfig>;
  } {
    return {
      registeredHandlers: this.handlers.size,
      handlerTypes: [...this.handlers.keys()],
      config: { ...this.config },
    };
  }

  /**
   * Update executor configuration.
   */
  updateConfig(config: Partial<ActionExecutorConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuration updated');
  }

  /**
   * Enable or disable dry-run mode.
   */
  setDryRun(enabled: boolean): void {
    this.config.dryRun = enabled;
    this.logger.info(`Dry-run mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new ActionExecutor instance.
 */
export function createActionExecutor(
  config?: Partial<ActionExecutorConfig>
): ActionExecutor {
  return new ActionExecutor(config);
}

