/**
 * BaseTaskAgent - LLM-powered agent for task lifecycle management
 *
 * The BaseTaskAgent drives tasks through their lifecycle by:
 * - Subscribing to task.* events via EventBus
 * - Loading task and template context
 * - Making LLM-powered decisions based on template rules
 * - Logging decisions to DecisionLog
 * - Executing actions via TaskActionExecutor
 * - Respecting human override flags
 *
 * This agent is complementary to OrchestrationAgent:
 * - OrchestrationAgent: Intake classification → creates TaskInstance
 * - BaseTaskAgent: Task lifecycle management → drives task to completion
 *
 * @module BaseTaskAgent
 */

import type { PrismaClient } from '@prisma/client';
import type { ILLMClient } from './LLMClient';
import type { Logger } from '../types/agent.types';
import type { TaskInstance, TaskTemplate, AgentDecision, AgentAction } from '@/lib/types/tasks';
import type { TaskEvent, TaskEventName } from '@/lib/events/types';
import { AgentEventBus } from '../inputs/EventBus';
import { buildSystemPrompt, buildUserPrompt } from '../prompts/base-task-agent';
import { TaskActionExecutor, type TaskActionResult } from './TaskActionExecutor';

// =============================================================================
// Constants
// =============================================================================

/** Default number of recent decisions to load for context */
const DEFAULT_RECENT_DECISIONS_LIMIT = 10;

/** Rate limit: decisions per minute */
const DEFAULT_RATE_LIMIT_PER_MINUTE = 30;

/** Rate limit: decisions per hour */
const DEFAULT_RATE_LIMIT_PER_HOUR = 300;

/** Task events the agent listens to (using colon-based event names for EventBus) */
const TASK_EVENT_SUBSCRIPTIONS: string[] = [
  'task:created',
  'task:status_changed',
  'task:stage_changed',
  'task:assignee_changed',
  'task:reprocess_requested',
  'task:sla_breached',
  // Note: 'task:override_set' is NOT subscribed to, as override disables agent
];

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for the BaseTaskAgent
 */
export interface BaseTaskAgentConfig {
  /** Organization ID this agent operates in */
  orgId: string;
  /** LLM client for decision-making */
  llmClient: ILLMClient;
  /** Prisma client for database operations */
  prisma: PrismaClient;
  /** Custom logger */
  logger?: Logger;
  /** Maximum decisions per minute */
  maxDecisionsPerMinute?: number;
  /** Maximum decisions per hour */
  maxDecisionsPerHour?: number;
  /** Dry run mode (no actions executed) */
  dryRun?: boolean;
  /** Custom event subscriptions (overrides defaults) */
  subscribedEvents?: string[];
}

/**
 * Statistics tracked by the agent
 */
export interface BaseTaskAgentStats {
  /** Total decisions made */
  totalDecisions: number;
  /** Successful decisions */
  successfulDecisions: number;
  /** Failed decisions */
  failedDecisions: number;
  /** NO_OP decisions (override or already complete) */
  noOpDecisions: number;
  /** Events processed */
  totalEventsProcessed: number;
  /** Errors encountered */
  totalErrors: number;
  /** Average decision time (ms) */
  averageDecisionTimeMs: number;
  /** Rate limit status */
  rateLimitStatus: {
    decisionsThisMinute: number;
    decisionsThisHour: number;
    isLimited: boolean;
  };
  /** Agent uptime (ms) */
  uptimeMs: number;
}

/**
 * Rate limiter state
 */
interface RateLimiterState {
  minuteTimestamps: number[];
  hourTimestamps: number[];
}

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[BaseTaskAgent] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[BaseTaskAgent] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[BaseTaskAgent] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[BaseTaskAgent] ${msg}`, err, data ?? ''),
};

// =============================================================================
// BaseTaskAgent Class
// =============================================================================

/**
 * Base Task Agent - Drives task lifecycle via LLM decision-making
 *
 * @example
 * ```typescript
 * const agent = new BaseTaskAgent({
 *   orgId: 'org-123',
 *   llmClient: createLLMClient({ provider: LLMProvider.OPENAI, model: 'gpt-4o-mini' }),
 *   prisma: prismaClient,
 * });
 *
 * agent.start(); // Subscribe to task.* events
 *
 * // Events are processed automatically
 * // To stop: agent.stop();
 * ```
 */
export class BaseTaskAgent {
  // Core configuration
  private config: BaseTaskAgentConfig;
  private logger: Logger;
  private agentId: string;

  // Core components
  private llmClient: ILLMClient;
  private prisma: PrismaClient;
  private eventBus: AgentEventBus;
  private actionExecutor: TaskActionExecutor;

  // State
  private isRunning: boolean = false;
  private startTime: Date | null = null;
  private subscriptionIds: string[] = [];

  // Rate limiting
  private rateLimiter: RateLimiterState = {
    minuteTimestamps: [],
    hourTimestamps: [],
  };

  // Statistics
  private stats: {
    totalDecisions: number;
    successfulDecisions: number;
    failedDecisions: number;
    noOpDecisions: number;
    totalEventsProcessed: number;
    totalErrors: number;
    decisionTimes: number[];
  } = {
    totalDecisions: 0,
    successfulDecisions: 0,
    failedDecisions: 0,
    noOpDecisions: 0,
    totalEventsProcessed: 0,
    totalErrors: 0,
    decisionTimes: [],
  };

  constructor(config: BaseTaskAgentConfig) {
    this.config = config;
    this.logger = config.logger ?? defaultLogger;
    this.agentId = `base-task-agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.llmClient = config.llmClient;
    this.prisma = config.prisma;
    this.eventBus = AgentEventBus.getInstance();
    this.actionExecutor = new TaskActionExecutor(this.logger);

    this.logger.info('BaseTaskAgent initialized', {
      agentId: this.agentId,
      orgId: this.config.orgId,
    });
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  /**
   * Start the agent - subscribe to task events
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.logger.info('Starting BaseTaskAgent', { agentId: this.agentId });

    this.isRunning = true;
    this.startTime = new Date();

    // Subscribe to task events
    const eventsToSubscribe = this.config.subscribedEvents ?? TASK_EVENT_SUBSCRIPTIONS;

    for (const eventName of eventsToSubscribe) {
      const subscriptionId = this.eventBus.on(eventName as any, async (event) => {
        await this.handleEvent(event);
      });
      this.subscriptionIds.push(subscriptionId);
      this.logger.debug(`Subscribed to event: ${eventName}`, { subscriptionId });
    }

    this.logger.info('BaseTaskAgent started', {
      agentId: this.agentId,
      subscribedEvents: eventsToSubscribe.length,
    });
  }

  /**
   * Stop the agent - unsubscribe from events
   */
  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Agent is not running');
      return;
    }

    this.logger.info('Stopping BaseTaskAgent', { agentId: this.agentId });

    // Unsubscribe from all events
    for (const subscriptionId of this.subscriptionIds) {
      this.eventBus.off(subscriptionId);
    }
    this.subscriptionIds = [];

    this.isRunning = false;

    this.logger.info('BaseTaskAgent stopped', {
      agentId: this.agentId,
      totalDecisions: this.stats.totalDecisions,
    });
  }

  /**
   * Check if the agent is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  // ===========================================================================
  // Event Handling
  // ===========================================================================

  /**
   * Handle an incoming task event
   */
  async handleEvent(event: any): Promise<void> {
    this.stats.totalEventsProcessed++;

    const payload = event.payload || {};
    const taskId = payload.taskId;
    if (!taskId) {
      this.logger.warn('Event missing taskId, skipping', { eventType: event.type });
      return;
    }

    this.logger.debug('Handling task event', {
      eventType: event.type,
      taskId,
      eventId: event.eventId,
    });

    try {
      await this.processTaskEvent(taskId, event);
    } catch (error) {
      this.stats.totalErrors++;
      this.logger.error('Error handling task event', error as Error, {
        eventType: event.type,
        taskId,
        eventId: event.eventId,
      });
    }
  }

  /**
   * Process a task event - main decision loop
   */
  private async processTaskEvent(taskId: string, event: any): Promise<void> {
    const startTime = Date.now();
    const eventType = event.type || 'unknown';

    // Check rate limits
    if (this.isRateLimited()) {
      this.logger.warn('Rate limit exceeded, skipping event', { taskId, eventType });
      return;
    }

    // Load task from DB
    const task = await this.loadTask(taskId);
    if (!task) {
      this.logger.warn('Task not found, skipping', { taskId });
      return;
    }

    // Check override flag (mapped from Prisma fields)
    if (task.override?.overridden) {
      this.logger.info('Task has human override, skipping', { taskId });
      this.stats.noOpDecisions++;
      return;
    }

    // Load template
    const template = await this.loadTemplate(task.templateId);
    if (!template) {
      this.logger.warn('Template not found, skipping', { taskId, templateId: task.templateId });
      return;
    }

    // Load recent decisions
    const recentDecisions = await this.loadRecentDecisions(taskId, DEFAULT_RECENT_DECISIONS_LIMIT);

    // Convert AgentEvent to TaskEvent format for prompt building
    const taskEvent: TaskEvent = {
      id: event.eventId || '',
      name: eventType.replace('task:', 'task.') as any, // Convert task:created -> task.created
      occurredAt: event.timestamp?.toISOString() || new Date().toISOString(),
      payload: event.payload || {},
    };

    // Build prompts
    const systemPrompt = buildSystemPrompt(template);
    const userPrompt = buildUserPrompt(task, taskEvent, recentDecisions);

    // Make LLM decision
    this.logger.debug('Calling LLM for decision', { taskId, eventType });
    const decision = await this.makeLLMDecision(systemPrompt, userPrompt);

    // Log decision to DB BEFORE execution
    const decisionLogId = await this.logDecision(task, template, taskEvent, decision);

    // Update task agent state
    await this.updateTaskAgentState(task.id, decisionLogId);

    // Check if NO_OP
    const isNoOp = decision.actions.length === 1 && decision.actions[0].type === 'NO_OP';
    if (isNoOp) {
      this.logger.info('Decision is NO_OP', {
        taskId,
        reason: (decision.actions[0] as any).reason,
      });
      this.stats.noOpDecisions++;
      this.stats.totalDecisions++;
      return;
    }

    // Execute actions via TaskActionExecutor
    this.logger.info('Executing decision actions', {
      taskId,
      reasoning: decision.reasoning,
      actionCount: decision.actions.length,
      actions: decision.actions.map(a => a.type),
    });

    let executionResults: TaskActionResult[] = [];
    try {
      executionResults = await this.actionExecutor.executeActions(
        decision.actions,
        {
          taskId: task.id,
          orgId: task.orgId,
          correlationId: taskEvent.id,
          dryRun: this.config.dryRun,
        }
      );

      // Check for execution failures
      const failedActions = executionResults.filter(r => !r.success);
      if (failedActions.length > 0) {
        this.logger.error('Some actions failed to execute', new Error('Action execution failed'), {
          taskId,
          failedActions: failedActions.map(f => ({ action: f.action, error: f.error })),
        });
        this.stats.failedDecisions++;
        this.stats.totalDecisions++;
        this.recordRateLimitAction();

        // Update DecisionLog with execution results
        await this.updateDecisionLogWithResults(decisionLogId, executionResults, false);
        return;
      }

      // Update DecisionLog with successful execution results
      await this.updateDecisionLogWithResults(decisionLogId, executionResults, true);

      this.logger.info('Actions executed successfully', {
        taskId,
        executionResults: executionResults.map(r => ({
          action: r.action,
          success: r.success,
          executionTime: r.executionTime,
        })),
      });

      // Update stats
      const decisionTime = Date.now() - startTime;
      this.stats.decisionTimes.push(decisionTime);
      this.stats.totalDecisions++;
      this.stats.successfulDecisions++;
      this.recordRateLimitAction();
    } catch (error) {
      this.logger.error('Action execution failed with exception', error as Error, {
        taskId,
        decisionLogId,
      });
      this.stats.failedDecisions++;
      this.stats.totalDecisions++;
      this.stats.totalErrors++;
      this.recordRateLimitAction();

      // Update DecisionLog with error
      await this.updateDecisionLogWithResults(decisionLogId, executionResults, false);
      return;
    }

    this.logger.debug('Task event processed successfully', {
      taskId,
      eventType,
      decisionTimeMs: Date.now() - startTime,
    });
  }

  // ===========================================================================
  // Data Loading
  // ===========================================================================

  /**
   * Load task from database
   */
  private async loadTask(taskId: string): Promise<TaskInstance | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return null;
    }

    // Convert Prisma model to TaskInstance type
    // Map Prisma schema fields to TaskInstance interface
    return {
      id: task.id,
      templateId: task.templateId,
      orgId: task.orgId,
      source: task.source as any,
      sourceId: task.sourceId ?? undefined,
      title: task.title,
      description: task.description ?? undefined,
      type: task.type,
      category: task.category,
      department: task.department ?? undefined,
      staffRole: task.staffRole ?? undefined,
      priority: task.priority as 1 | 2 | 3 | 4 | 5,
      status: task.status as any,
      pipelineKey: task.pipelineKey ?? undefined,
      stageKey: task.stageKey ?? undefined,
      timeline: task.timeline as any ?? {
        typicalMinutes: task.typicalMinutes ?? 60,
      },
      steps: task.steps as any ?? [],
      attachments: task.attachments as any,
      data: task.data as any,
      tags: task.tags ?? [],
      assignedToUserId: task.assignedToUserId ?? undefined,
      // Map Prisma override fields to TaskOverride interface
      override: {
        overridden: task.overridden,
        reason: task.overrideReason ?? undefined,
        byUserId: task.overrideByUserId ?? undefined,
        at: task.overrideAt?.toISOString() ?? undefined,
      },
      // Map Prisma agent state fields to TaskAgentState interface
      agentState: {
        lastDecisionId: task.agentLastDecisionId ?? undefined,
        decisionIds: task.agentDecisionIds ?? [],
      },
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * Load template from database
   */
  private async loadTemplate(templateId: string): Promise<TaskTemplate | null> {
    const template = await this.prisma.taskTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return null;
    }

    // Template definition is stored as JSON in the definition field
    return template.definition as any;
  }

  /**
   * Load recent decisions for this task
   */
  private async loadRecentDecisions(taskId: string, limit: number) {
    const decisions = await this.prisma.decisionLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        decision: true,
        appliedAt: true,
      },
    });

    return decisions.map((d: { id: string; decision: unknown; appliedAt: Date }) => ({
      id: d.id,
      decision: d.decision as unknown as AgentDecision,
      appliedAt: d.appliedAt.toISOString(),
    }));
  }

  // ===========================================================================
  // LLM Decision Making
  // ===========================================================================

  /**
   * Make LLM decision call
   */
  private async makeLLMDecision(systemPrompt: string, userPrompt: string): Promise<AgentDecision> {
    const response = await this.llmClient.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON response
    const decision = this.parseAgentDecision(response.content);

    return decision;
  }

  /**
   * Parse and validate AgentDecision from LLM response
   */
  private parseAgentDecision(llmResponse: string): AgentDecision {
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = llmResponse.trim();
      if (jsonStr.startsWith('```')) {
        const match = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (match) {
          jsonStr = match[1];
        }
      }

      const parsed = JSON.parse(jsonStr);

      // Basic validation
      if (!parsed.reasoning || typeof parsed.reasoning !== 'string') {
        throw new Error('Missing or invalid "reasoning" field');
      }

      if (!Array.isArray(parsed.actions)) {
        throw new Error('Missing or invalid "actions" field (must be array)');
      }

      for (const action of parsed.actions) {
        if (!action.type) {
          throw new Error('Action missing "type" field');
        }
      }

      return parsed as AgentDecision;
    } catch (error) {
      this.logger.error('Failed to parse AgentDecision', error as Error, { llmResponse });

      // Fallback to NO_OP on parse error
      return {
        reasoning: `Failed to parse LLM response: ${(error as Error).message}`,
        actions: [{ type: 'NO_OP', reason: 'LLM response parsing failed' }],
      };
    }
  }

  // ===========================================================================
  // Decision Logging
  // ===========================================================================

  /**
   * Log decision to DecisionLog table
   */
  private async logDecision(
    task: TaskInstance,
    template: TaskTemplate,
    event: TaskEvent,
    decision: AgentDecision
  ): Promise<string> {
    const decisionLog = await this.prisma.decisionLog.create({
      data: {
        taskId: task.id,
        orgId: task.orgId,
        templateId: task.templateId,
        eventName: event.name,
        eventId: event.id,
        agentConfigHash: this.hashAgentConfig(template.agentConfig),
        inputSnapshot: {
          status: task.status,
          stageKey: task.stageKey,
          steps: task.steps,
          tags: task.tags,
          priority: task.priority,
          assignedToUserId: task.assignedToUserId,
        } as any,
        llmCall: {
          model: 'gpt-4o-mini', // TODO: Get from LLM client
          promptType: 'DECIDE_NEXT_ACTION',
        } as any,
        decision: decision as any,
        appliedAt: new Date(),
      },
    });

    return decisionLog.id;
  }

  /**
   * Update task agent state with new decision
   */
  private async updateTaskAgentState(taskId: string, decisionId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { agentDecisionIds: true },
    });

    if (!task) {
      return;
    }

    const currentDecisionIds = task.agentDecisionIds ?? [];

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        agentLastDecisionId: decisionId,
        agentDecisionIds: [...currentDecisionIds, decisionId],
      },
    });
  }

  /**
   * Update DecisionLog with action execution results
   */
  private async updateDecisionLogWithResults(
    decisionLogId: string,
    results: TaskActionResult[],
    success: boolean
  ): Promise<void> {
    try {
      // Store execution results in the decision log's data field
      // This allows tracking of what actions were executed and their outcomes
      const executionSummary = {
        success,
        totalActions: results.length,
        successfulActions: results.filter(r => r.success).length,
        failedActions: results.filter(r => !r.success).length,
        results: results.map(r => ({
          action: r.action,
          success: r.success,
          executionTime: r.executionTime,
          error: r.error,
          data: r.data,
        })),
        completedAt: new Date().toISOString(),
      };

      // Update the decision log with execution results
      // Note: This assumes the DecisionLog table has a 'data' JSONB field
      // If the field doesn't exist, this update will be skipped
      await this.prisma.decisionLog.update({
        where: { id: decisionLogId },
        data: {
          data: executionSummary as any,
        },
      });

      this.logger.debug('DecisionLog updated with execution results', {
        decisionLogId,
        success,
        actionCount: results.length,
      });
    } catch (error) {
      // Log but don't fail - execution results persistence is non-critical
      this.logger.warn('Failed to update DecisionLog with execution results', {
        decisionLogId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Hash agent config for reproducibility tracking
   */
  private hashAgentConfig(agentConfig: any): string {
    // Simple hash for now - in production, use crypto hash
    return JSON.stringify(agentConfig);
  }

  // ===========================================================================
  // Rate Limiting
  // ===========================================================================

  /**
   * Check if rate limited
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Clean old timestamps
    this.rateLimiter.minuteTimestamps = this.rateLimiter.minuteTimestamps.filter(
      t => now - t < 60000
    );
    this.rateLimiter.hourTimestamps = this.rateLimiter.hourTimestamps.filter(
      t => now - t < 3600000
    );

    const perMinute = this.config.maxDecisionsPerMinute ?? DEFAULT_RATE_LIMIT_PER_MINUTE;
    const perHour = this.config.maxDecisionsPerHour ?? DEFAULT_RATE_LIMIT_PER_HOUR;

    return (
      this.rateLimiter.minuteTimestamps.length >= perMinute ||
      this.rateLimiter.hourTimestamps.length >= perHour
    );
  }

  /**
   * Record a decision for rate limiting
   */
  private recordRateLimitAction(): void {
    const now = Date.now();
    this.rateLimiter.minuteTimestamps.push(now);
    this.rateLimiter.hourTimestamps.push(now);
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  /**
   * Get agent statistics
   */
  getStats(): BaseTaskAgentStats {
    const avgDecisionTime =
      this.stats.decisionTimes.length > 0
        ? this.stats.decisionTimes.reduce((a, b) => a + b, 0) / this.stats.decisionTimes.length
        : 0;

    const now = Date.now();

    return {
      totalDecisions: this.stats.totalDecisions,
      successfulDecisions: this.stats.successfulDecisions,
      failedDecisions: this.stats.failedDecisions,
      noOpDecisions: this.stats.noOpDecisions,
      totalEventsProcessed: this.stats.totalEventsProcessed,
      totalErrors: this.stats.totalErrors,
      averageDecisionTimeMs: avgDecisionTime,
      rateLimitStatus: {
        decisionsThisMinute: this.rateLimiter.minuteTimestamps.filter(t => now - t < 60000).length,
        decisionsThisHour: this.rateLimiter.hourTimestamps.filter(t => now - t < 3600000).length,
        isLimited: this.isRateLimited(),
      },
      uptimeMs: this.startTime ? now - this.startTime.getTime() : 0,
    };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new BaseTaskAgent instance
 */
export function createBaseTaskAgent(config: BaseTaskAgentConfig): BaseTaskAgent {
  return new BaseTaskAgent(config);
}
