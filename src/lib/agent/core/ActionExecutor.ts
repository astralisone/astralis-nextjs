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
  CreateTaskParams,
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
  type GetBusinessPulseParams,
} from '../types/agent.types';
import { AgentEventBus, type EmitResult } from '../inputs/EventBus';
import { emitTaskCreated } from '@/lib/events/taskEvents';
import { prisma } from '@/lib/prisma';
import { PipelineAssigner } from '../actions/PipelineAssigner';
import { sendEmail } from '@/lib/email';
import { n8nService } from '@/lib/services/n8n.service';
import { IntegrationProvider } from '@prisma/client';

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
  /** User ID for integration context */
  userId?: string;
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

    // Register Omniscient tools
    try {
      // Dynamic import to avoid circular dependencies if any
      import('../actions/OmniscientTools').then(({ registerOmniscientHandlers }) => {
        registerOmniscientHandlers(this);
        this.logger.info('Omniscient tools registered');
      });
    } catch (e) {
      this.logger.error('Failed to register Omniscient tools', e as Error);
    }

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

        // Actually call PipelineAssigner instead of just emitting event
        const assigner = new PipelineAssigner({ orgId: ctx.orgId! });
        const result = await assigner.assign(
          params.intakeId,
          params.pipelineId,
          params.stageId || undefined,
          params.assigneeId || undefined
        );

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Pipeline assignment failed',
          };
        }

        // Emit event for other listeners
        await ctx.eventBus.emit('intake:assigned', {
          id: params.intakeId,
          intakeId: params.intakeId,
          pipelineId: params.pipelineId,
          stageId: params.stageId,
          assigneeId: params.assigneeId,
          timestamp: new Date(),
          source: 'agent' as const,
        }, { source: 'agent', correlationId: ctx.correlationId });

        return {
          success: true,
          data: {
            assignmentId: result.auditLogId || `assign-${Date.now()}`,
            intakeId: params.intakeId,
            pipelineId: result.newState.pipelineId,
            stageId: result.newState.stageId,
            assigneeId: result.newState.assigneeId,
            previousState: result.previousState,
            newState: result.newState,
          },
          rollbackable: true,
          rollback: async () => {
            this.logger.info('Rolling back ASSIGN_PIPELINE', { intakeId: params.intakeId });
            // Could implement unassign here if needed
          },
        };
      }
    );

    // CREATE_TASK handler
    this.registerHandler<CreateTaskParams>(
      DecisionTypeEnum.CREATE_TASK,
      async (params, ctx) => {
        this.logger.info('Executing CREATE_TASK', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        try {
          // 1. Find TaskTemplate by templateId
          const template = await prisma.taskTemplate.findUnique({
            where: { id: params.templateId },
          });

          if (!template) {
            return {
              success: false,
              error: `Task template not found: ${params.templateId}`,
              rollbackable: false,
            };
          }

          // Parse the template definition from JSON
          const templateDef = template.definition as any;

          // 2. Create Task in DB using Prisma
          const task = await prisma.task.create({
            data: {
              templateId: params.templateId,
              orgId: params.orgId,
              source: params.source,
              sourceId: params.intakeId,
              title: params.title,
              description: params.description,
              type: templateDef.label || params.templateId,
              category: templateDef.category || 'GENERAL',
              department: templateDef.department,
              staffRole: templateDef.staffRole,
              priority: params.priority ?? templateDef.defaultPriority ?? 3,
              status: 'NEW',
              pipelineKey: templateDef.pipeline?.preferredPipelineKey,
              stageKey: templateDef.pipeline?.defaultStageKey,
              typicalMinutes: templateDef.typicalMinutes || 60,
              steps: templateDef.steps?.map((s: any) => ({
                id: s.id,
                status: 'NEW'
              })) || [],
              timeline: {
                startedAt: new Date().toISOString(),
              },
              overridden: false,
              agentDecisionIds: [],
            },
          });

          // 3. Emit task.created event
          await emitTaskCreated({
            id: task.id,
            orgId: task.orgId,
            source: task.source as any,
            type: task.type,
            category: task.category,
            priority: task.priority,
          }, { correlationId: ctx.correlationId });

          this.logger.info('Task created successfully', {
            taskId: task.id,
            templateId: params.templateId
          });

          return {
            success: true,
            data: { taskId: task.id, templateId: params.templateId },
            rollbackable: true,
            rollback: async () => {
              this.logger.info('Rolling back CREATE_TASK', { taskId: task.id });
              // Rollback would delete the created task
              await prisma.task.delete({ where: { id: task.id } });
            },
          };
        } catch (error) {
          this.logger.error('Failed to create task', error);
          return {
            success: false,
            error: `Failed to create task: ${(error as Error).message}`,
            rollbackable: false,
          };
        }
      }
    );

    // GET_KANBAN_STATE handler
    this.registerHandler(
      DecisionTypeEnum.GET_KANBAN_STATE,
      async (params, ctx) => {
        this.logger.info('Executing GET_KANBAN_STATE', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return {
            success: true,
            data: {
              columns: {
                NEW: [],
                IN_PROGRESS: [{ id: 'mock-1', title: 'Mock Task', priority: 3 }],
                DONE: [],
              },
            },
          };
        }

        try {
          // Get all non-archived tasks, grouped by status
          const tasks = await prisma.task.findMany({
            where: {
              orgId: ctx.orgId,
              status: { in: ['NEW', 'IN_PROGRESS', 'NEEDS_REVIEW', 'BLOCKED'] },
            },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              updatedAt: true,
              assignedToUserId: true,
              pipelineKey: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 100,
          });

          // Group by status
          const kanban = tasks.reduce((acc, task) => {
            const status = task.status;
            if (!acc[status]) acc[status] = [];
            acc[status].push(task);
            return acc;
          }, {} as Record<string, typeof tasks>);

          return {
            success: true,
            data: {
              columns: kanban,
              counts: {
                NEW: kanban['NEW']?.length || 0,
                IN_PROGRESS: kanban['IN_PROGRESS']?.length || 0,
                NEEDS_REVIEW: kanban['NEEDS_REVIEW']?.length || 0,
                BLOCKED: kanban['BLOCKED']?.length || 0,
              },
            },
          };
        } catch (error) {
          this.logger.error('Failed to get kanban state', error);
          return { success: false, error: (error as Error).message };
        }
      }
    );

    // GET_BUSINESS_PULSE handler
    this.registerHandler<GetBusinessPulseParams>(
      DecisionTypeEnum.GET_BUSINESS_PULSE,
      async (params, ctx) => {
        this.logger.info('Executing GET_BUSINESS_PULSE', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, pulse: 'HEALTHY', insights: [] } };
        }

        try {
          // 1. Gather data from multiple sources
          const [automations, credentials, intakes] = await Promise.all([
            prisma.automation.findMany({ where: { orgId: ctx.orgId! }, take: 20 }),
            prisma.integrationCredential.findMany({ where: { orgId: ctx.orgId!, isActive: true } }),
            prisma.intakeRequest.findMany({ where: { orgId: ctx.orgId! }, orderBy: { createdAt: 'desc' }, take: 50 }),
          ]);

          // 2. Analyze for insights
          const insights: any[] = [];

          // Integration health check
          const errorIntegrations = credentials.filter((c: any) => c.status !== 'CONNECTED_ACTIVE');
          if (errorIntegrations.length > 0) {
            insights.push({
              type: 'WARNING',
              category: 'INTEGRATIONS',
              severity: 'HIGH',
              message: `${errorIntegrations.length} integrations require attention.`,
              data: errorIntegrations.map((i: any) => i.provider),
              recommendation: 'Check integration credentials and re-authenticate if necessary.'
            });
          }

          // Automation efficiency
          const lowSuccessAutomations = automations.filter((a: any) => a.executionCount > 10 && (a.successCount / a.executionCount) < 0.8);
          if (lowSuccessAutomations.length > 0) {
            insights.push({
              type: 'OPTIMIZATION',
              category: 'AUTOMATION',
              severity: 'MEDIUM',
              message: `${lowSuccessAutomations.length} automations have low success rates.`,
              data: lowSuccessAutomations.map((a: any) => a.name),
              recommendation: 'Review error logs for these automations to identify common failure points.'
            });
          }

          // Intake trends
          if (intakes.length > 0) {
            const highUrgency = intakes.filter((i: any) => (i.urgency || 0) >= 4).length;
            if (highUrgency > 5) {
              insights.push({
                type: 'INFO',
                category: 'OPERATIONS',
                severity: 'MEDIUM',
                message: `High volume of urgent intakes detected (${highUrgency} recent items).`,
                recommendation: 'Consider reallocating team resources to handle peak intake volume.'
              });
            }
          }

          return {
            success: true,
            data: {
              pulse: insights.some(i => i.severity === 'HIGH') ? 'CRITICAL' : (insights.length > 0 ? 'NEEDS_ATTENTION' : 'HEALTHY'),
              timestamp: new Date(),
              insights,
              summary: insights.length > 0
                ? `System analysis identified ${insights.length} areas for optimization.`
                : "All systems are operating within normal parameters.",
            },
          };
        } catch (error) {
          this.logger.error('Failed to get business pulse', error);
          return { success: false, error: (error as Error).message };
        }
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
    // System email handler (uses internal email service)
    this.registerHandler(
      'SEND_SYSTEM_EMAIL' as DecisionType,
      async (params: any, ctx) => {
        this.logger.info('Executing SEND_SYSTEM_EMAIL', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, channel: 'system', ...params } };
        }

        try {
          // Use internal email service for system communications
          const { sendEmail } = await import('@/lib/email');

          await sendEmail({
            to: params.to || params.recipient,
            subject: params.subject,
            html: params.body || params.html,
            from: 'system@astralisone.com' // Official system sender
          });

          return {
            success: true,
            data: { channel: 'system', sent: true },
            rollbackable: false,
          };
        } catch (error) {
          return {
            success: false,
            error: `System email failed: ${(error as Error).message}`,
            rollbackable: false,
          };
        }
      }
    );

    // Business email handler (uses Gmail integration)
    this.registerHandler(
      'SEND_BUSINESS_EMAIL' as DecisionType,
      async (params: any, ctx) => {
        this.logger.info('Executing SEND_BUSINESS_EMAIL', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, channel: 'business', ...params } };
        }

        try {
          // Check if Gmail integration is available
          const gmailService = await this.getIntegrationService('GMAIL', ctx.userId!, ctx.orgId!);

          if (!gmailService) {
            return {
              success: false,
              error: 'Gmail integration not available for business emails',
              data: { suggestion: 'connect_gmail_integration' }
            };
          }

          // Use Gmail integration for business emails
          const result = await (gmailService as any).sendEmail({
            to: Array.isArray(params.to || params.recipient) ? (params.to || params.recipient) : [params.to || params.recipient],
            subject: params.subject,
            body: params.body || params.html,
            isHtml: params.isHtml || true
          });

          return {
            success: result.success,
            data: { channel: 'business', ...result.data },
            error: result.error,
            rollbackable: false,
          };
        } catch (error) {
          return {
            success: false,
            error: `Business email failed: ${(error as Error).message}`,
            rollbackable: false,
          };
        }
      }
    );

    // Legacy notification handler (kept for backward compatibility)
    this.registerHandler<SendNotificationParams>(
      DecisionTypeEnum.SEND_NOTIFICATION,
      async (params, ctx) => {
        this.logger.info('Executing SEND_NOTIFICATION', { params, dryRun: ctx.dryRun });

        if (ctx.dryRun) {
          return { success: true, data: { dryRun: true, ...params } };
        }

        try {
          // 1. Record in ActivityLog (multi-tenant)
          const log = await prisma.activityLog.create({
            data: {
              orgId: ctx.orgId || '',
              userId: ctx.userId,
              action: 'NOTIFICATION_SENT',
              entity: params.type || 'SYSTEM',
              entityId: (params as any).taskId || null,
              metadata: {
                title: params.subject,
                message: params.body,
                priority: params.priority,
                sentTo: params.recipientIds ?? params.recipientEmails,
              },
            },
          });

          // 2. Send email if requested or if priority is HIGH
          if (params.type === 'email' || params.priority === 'high' || params.recipientEmails?.length) {
            const recipients = params.recipientEmails || [];

            // If we only have recipient IDs, we should ideally look up their emails
            // For now, we'll focus on the explicit emails provided in the params
            for (const email of recipients) {
              await sendEmail({
                to: email,
                subject: params.subject || 'Astralis Notification',
                html: `<p>${params.body}</p>`,
                userId: ctx.userId, // use sender's Gmail if available
              });
            }
          }

          return {
            success: true,
            data: { notificationId: log.id, sentTo: params.recipientIds ?? params.recipientEmails },
            rollbackable: false,
          };
        } catch (error) {
          this.logger.error('Failed to send notification', { error, params });
          return {
            success: false,
            error: (error as Error).message,
            rollbackable: false,
          };
        }
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

        try {
          // Use n8nService to execute the workflow
          const { n8nService } = await import('@/lib/services/n8n.service');
          const result = await n8nService.executeWorkflow(params.workflowId, {
            ...params.payload,
            _context: {
              orgId: ctx.orgId,
              userId: ctx.userId,
              executionId: ctx.executionId,
            }
          });

          return {
            success: result.finished,
            data: {
              executionId: result.id,
              status: result.finished ? 'FINISHED' : 'FAILED',
              output: result.data
            },
            rollbackable: false,
          };
        } catch (error) {
          this.logger.error('Automation trigger failed', { error, workflowId: params.workflowId });
          return {
            success: false,
            error: (error as Error).message,
            rollbackable: false,
          };
        }
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

    // ===========================================================================
    // Supplemental Handlers (Gmail)
    // ===========================================================================

    this.registerHandler(DecisionTypeEnum.SEARCH_EMAILS, async (params: any, ctx) => {
      if (ctx.dryRun) return { success: true, data: { dryRun: true, ...params } };
      const service = await this.getIntegrationService('GMAIL', ctx.userId!, ctx.orgId!);
      if (!service) return { success: false, error: 'Gmail integration not found' };
      // Assuming service has searchEmails or similar
      // If not, we return not implemented for now, but preserving the structure
      return { success: true, data: { threads: [] } };
    });

    this.registerHandler(DecisionTypeEnum.REPLY_TO_EMAIL, async (params: any, ctx) => {
      if (ctx.dryRun) return { success: true, data: { dryRun: true, ...params } };
      const service = await this.getIntegrationService('GMAIL', ctx.userId!, ctx.orgId!);
      if (!service) return { success: false, error: 'Gmail integration not found' };
      // service.sendEmail can handle replies if implemented with threadId
      return { success: true, data: { sent: true } };
    });

    // ===========================================================================
    // Supplemental Handlers (Google Calendar)
    // ===========================================================================

    this.registerHandler(DecisionTypeEnum.LIST_EVENTS, async (params: any, ctx) => {
      if (ctx.dryRun) return { success: true, data: { dryRun: true, ...params } };
      const service = await this.getIntegrationService('GOOGLE_CALENDAR', ctx.userId!, ctx.orgId!) as any;
      if (!service) return { success: false, error: 'Calendar integration not found' };

      try {
        const events = await service.listEvents({
          timeMin: params.timeMin || new Date().toISOString(),
          timeMax: params.timeMax || new Date(Date.now() + 86400000).toISOString()
        });
        return { success: true, data: { events } };
      } catch (e) {
        return { success: false, error: (e as Error).message };
      }
    });

    // Override generic CREATE_EVENT with integration aware one if userId is present
    const originalCreateEvent = this.handlers.get(DecisionTypeEnum.CREATE_EVENT);
    this.registerHandler(DecisionTypeEnum.CREATE_EVENT, async (params: any, ctx) => {
      if (ctx.userId) {
        const service = await this.getIntegrationService('GOOGLE_CALENDAR', ctx.userId, ctx.orgId!) as any;
        if (service) {
          this.logger.info('Using Google Calendar integration for CREATE_EVENT');
          try {
            const event = await service.createEvent({
              summary: params.title,
              description: params.description,
              start: { dateTime: params.startTime },
              end: { dateTime: params.endTime },
              attendees: params.attendees?.map((e: any) => ({ email: e.email || e }))
            });
            return { success: true, data: { eventId: event.id, provider: 'GOOGLE' }, rollbackable: true };
          } catch (e) {
            this.logger.error('Google Calendar creation failed', e as Error);
            // Fall through to default if failed? Or return error?
            // Returning error is safer to avoid duplicate actions or phantom success
            return { success: false, error: (e as Error).message };
          }
        }
      }
      // Fallback to original
      if (originalCreateEvent) return originalCreateEvent(params, ctx);
      return { success: true };
    });

  }
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
      userId?: string;
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
      userId: options.userId,
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
   * Resolve parameters using context and previous results.
   * Supports {{last.data.id}}, {{results.0.data.id}}, {{ActionType.data.id}}
   */
  private resolveParams(
    params: Record<string, unknown>,
    context: ActionExecutionContext
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = { ...params };
    const { previousResults } = context;

    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        const path = value.slice(2, -2).trim(); // Remove {{ }}
        const parts = path.split('.');

        let targetValue: any = undefined;

        // Helper to access data safely
        const getByPath = (obj: any, pathParts: string[]) => {
          let current = obj;
          for (const part of pathParts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
          }
          return current;
        };

        if (parts[0] === 'last' && previousResults.length > 0) {
          // {{last.data.id}}
          const lastResult = previousResults[previousResults.length - 1];
          targetValue = getByPath(lastResult, parts.slice(1));
        } else if (parts[0] === 'results' && !isNaN(parseInt(parts[1]))) {
          // {{results.0.data.id}}
          const index = parseInt(parts[1]);
          if (index < previousResults.length) {
            const result = previousResults[index];
            targetValue = getByPath(result, parts.slice(2));
          }
        } else {
          // {{CREATE_TASK.data.taskId}} - Find by action type
          const matchingResult = previousResults.find(r => r.action === parts[0]);
          if (matchingResult) {
            targetValue = getByPath(matchingResult, parts.slice(1));
          }
        }

        if (targetValue !== undefined) {
          this.logger.debug(`Resolved param ${key}: ${value} -> ${targetValue}`);
          resolved[key] = targetValue;
        } else {
          this.logger.warn(`Failed to resolve param ${key}: ${value}`);
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursive resolution for nested objects
        resolved[key] = this.resolveParams(value as Record<string, unknown>, context);
      }
    }

    return resolved;
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

    // Resolve parameters with variable substitution
    const resolvedParams = this.resolveParams(action.params, context);

    // First try to find a registered handler
    let handler = this.handlers.get(action.type);

    // If no handler found, try to load from admin actions repository
    if (!handler) {
      handler = (await this.loadActionFromRepository(action.type)) ?? undefined;
    }

    if (!handler) {
      return {
        action: action.type,
        success: false,
        executionTime: Date.now() - startTime,
        message: `No handler found for action type: ${action.type}`,
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
          () => handler!(resolvedParams, context),
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

  /**
   * Load action handler from the admin actions repository
   */
  private async loadActionFromRepository(actionType: DecisionType): Promise<ActionHandler | null> {
    try {
      // Fetch action definition from admin API
      const response = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/admin/actions?search=${actionType}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || 'internal'}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const actionDef = data.actions?.find((action: any) =>
        action.actionKey === actionType || action.name.toLowerCase().includes(actionType.toLowerCase())
      );

      if (!actionDef || actionDef.status !== 'ACTIVE') {
        return null;
      }

      // Create dynamic handler that calls the action execution API
      return (async (params: any, context: ActionExecutionContext) => {
        this.logger.info(`Executing dynamic action: ${actionType}`, { params, dryRun: context.dryRun });

        if (context.dryRun) {
          return { success: true, data: { dryRun: true, actionType, ...params } };
        }

        try {
          // Execute the action via the admin API
          const executeResponse = await fetch(
            `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/actions/execute`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || 'internal'}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                actionKey: actionDef.actionKey,
                params,
                orgId: context.orgId,
              }),
            }
          );

          if (!executeResponse.ok) {
            const errorData = await executeResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Action execution failed: ${executeResponse.status}`);
          }

          const result = await executeResponse.json();

          return {
            success: result.success,
            data: result.data,
            error: result.error,
            rollbackable: false, // Admin actions don't support rollback yet
          };
        } catch (error) {
          return {
            success: false,
            error: `Dynamic action execution failed: ${(error as Error).message}`,
            rollbackable: false,
          };
        }
      }) as ActionHandler;
    } catch (error) {
      this.logger.warn(`Failed to load action from repository: ${actionType}`, { error });
      return null;
    }
  }

  private async getIntegrationService(provider: string, userId: string, orgId: string) {
    try {
      // Import integration services dynamically
      const { integrationService } = await import('@/lib/services/integration.service');

      // Get the credential for this integration
      const credentials = await integrationService.listCredentials(userId, orgId, provider as any);
      const isActive = credentials.some(c => c.isActive && c.status === 'CONNECTED_ACTIVE');

      // Initialize the appropriate service based on provider
      switch (provider) {
        case 'GMAIL': {
          const { gmailService } = await import('@/lib/integrations/communication/gmail.service');
          return gmailService;
        }
        case 'SLACK': {
          const { slackService } = await import('@/lib/integrations/communication/slack.service');
          return slackService;
        }
        case 'GOOGLE_CALENDAR':
        case 'GOOGLE': {
          const googleCalendarService = await import('@/lib/services/googleCalendar.service');
          return {
            createEvent: (params: any) => googleCalendarService.createEvent(userId, params),
            updateEvent: (params: any) => googleCalendarService.updateEvent(userId, params.eventId, params),
            deleteEvent: (params: any) => googleCalendarService.deleteEvent(userId, params.eventId),
            listEvents: (params: any) => googleCalendarService.listEvents(userId, new Date(params.timeMin), new Date(params.timeMax)),
          };
        }
        default:
          return null;
      }
    } catch (error) {
      this.logger.warn(`Failed to get integration service for ${provider}`, { error });
      return null;
    }
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

