/**
 * AutomationTrigger - Action executor for triggering n8n workflows and other automations
 *
 * This module provides:
 * - n8n webhook endpoint triggering
 * - n8n REST API integration for workflow management
 * - Scheduled automation support
 * - Rate limiting per workflow
 * - Comprehensive error handling and retry logic
 * - Execution logging and status tracking
 *
 * @module AutomationTrigger
 * @version 1.0.0
 */

import { z } from 'zod';
import type {
  AgentInputSource,
  TriggerAutomationParams,
  Logger,
} from '../types/agent.types';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Supported workflow types for automation
 */
export type WorkflowType =
  | 'email_sequence'
  | 'slack_notification'
  | 'crm_update'
  | 'report_generation'
  | 'custom_integration'
  | 'data_sync'
  | 'webhook_relay';

/**
 * Workflow status enumeration
 */
export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  WAITING = 'waiting',
  TIMED_OUT = 'timed_out',
}

/**
 * n8n workflow definition
 */
export interface Workflow {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Type classification */
  type: WorkflowType;
  /** Whether the workflow is active */
  isActive: boolean;
  /** Webhook URL for triggering */
  webhookUrl?: string;
  /** Organization ID this workflow belongs to */
  orgId: string;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Last execution timestamp */
  lastExecutedAt?: Date;
  /** Total execution count */
  executionCount: number;
  /** Success rate (0-1) */
  successRate: number;
}

/**
 * Trigger context for automation execution
 */
export interface TriggerContext {
  /** Organization ID */
  orgId: string;
  /** User ID who initiated the trigger */
  userId?: string;
  /** Source event that triggered the automation */
  sourceEvent?: string;
  /** Correlation ID for request tracing */
  correlationId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Trigger options for customizing execution
 */
export interface TriggerOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Whether to execute asynchronously */
  async?: boolean;
  /** Callback URL for async execution results */
  callbackUrl?: string;
  /** Additional headers to send */
  headers?: Record<string, string>;
  /** Priority level (1-5, where 5 is highest) */
  priority?: number;
}

/**
 * Result of a trigger operation
 */
export interface TriggerResult {
  /** Whether the trigger was successful */
  success: boolean;
  /** Execution ID from n8n */
  executionId?: string;
  /** Workflow ID that was triggered */
  workflowId: string;
  /** Response data from the workflow */
  data?: Record<string, unknown>;
  /** Status of the execution */
  status: WorkflowExecutionStatus;
  /** Execution time in milliseconds */
  executionTimeMs: number;
  /** Error message if failed */
  error?: string;
  /** Error code for categorization */
  errorCode?: string;
  /** Whether the error is retryable */
  retryable?: boolean;
  /** Timestamp of the trigger */
  triggeredAt: Date;
  /** Timestamp of completion */
  completedAt?: Date;
}

/**
 * Result of a webhook trigger
 */
export interface WebhookResult extends TriggerResult {
  /** HTTP status code */
  statusCode: number;
  /** Response headers */
  headers?: Record<string, string>;
  /** Raw response body */
  rawResponse?: string;
}

/**
 * Workflow execution status from n8n
 */
export interface WorkflowStatus {
  /** Execution ID */
  executionId: string;
  /** Workflow ID */
  workflowId: string;
  /** Current status */
  status: WorkflowExecutionStatus;
  /** Start timestamp */
  startedAt: Date;
  /** Finish timestamp */
  finishedAt?: Date;
  /** Execution duration in milliseconds */
  durationMs?: number;
  /** Execution mode */
  mode: 'trigger' | 'webhook' | 'manual' | 'scheduled';
  /** Error details if failed */
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  /** Execution data/result */
  data?: Record<string, unknown>;
  /** Retry count */
  retryCount: number;
}

/**
 * Scheduled automation record
 */
export interface ScheduledAutomation {
  /** Unique schedule ID */
  id: string;
  /** Workflow ID to trigger */
  workflowId: string;
  /** Payload to send */
  payload: Record<string, unknown>;
  /** Context information */
  context: TriggerContext;
  /** Scheduled execution time */
  runAt: Date;
  /** Current status */
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  /** Creation timestamp */
  createdAt: Date;
  /** Execution result if completed */
  result?: TriggerResult;
}

/**
 * Configuration for the AutomationTrigger
 */
export interface AutomationTriggerConfig {
  /** n8n base URL */
  n8nBaseUrl: string;
  /** n8n API key for REST API access */
  n8nApiKey?: string;
  /** Default timeout in milliseconds */
  defaultTimeout?: number;
  /** Default retry count */
  defaultRetries?: number;
  /** Rate limit per workflow per minute */
  rateLimitPerWorkflow?: number;
  /** Global rate limit per minute */
  globalRateLimit?: number;
  /** Custom logger implementation */
  logger?: Logger;
  /** Enable debug logging */
  debug?: boolean;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Schema for validating trigger payload
 */
const TriggerPayloadSchema = z.object({
  workflowId: z.string().min(1),
  triggerData: z.record(z.unknown()),
  context: z.object({
    orgId: z.string().min(1),
    userId: z.string().optional(),
    sourceEvent: z.string().optional(),
    correlationId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  options: z.object({
    timeout: z.number().positive().optional(),
    retries: z.number().int().min(0).max(10).optional(),
    async: z.boolean().optional(),
    callbackUrl: z.string().url().optional(),
    headers: z.record(z.string()).optional(),
    priority: z.number().int().min(1).max(5).optional(),
  }).optional(),
});

/**
 * Schema for webhook trigger validation
 */
const WebhookTriggerSchema = z.object({
  webhookUrl: z.string().url(),
  payload: z.record(z.unknown()),
  options: z.object({
    timeout: z.number().positive().optional(),
    retries: z.number().int().min(0).max(10).optional(),
    headers: z.record(z.string()).optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional(),
  }).optional(),
});

// =============================================================================
// ERROR CLASSES
// =============================================================================

/**
 * Base error class for automation-related errors
 */
export class AutomationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly statusCode?: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AutomationError';

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AutomationError);
    }
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitExceededError extends AutomationError {
  constructor(
    workflowId: string,
    public readonly retryAfterMs?: number
  ) {
    super(
      `Rate limit exceeded for workflow ${workflowId}`,
      'RATE_LIMIT_EXCEEDED',
      true,
      429
    );
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Error thrown when workflow is not found
 */
export class WorkflowNotFoundError extends AutomationError {
  constructor(workflowId: string) {
    super(
      `Workflow not found: ${workflowId}`,
      'WORKFLOW_NOT_FOUND',
      false,
      404
    );
    this.name = 'WorkflowNotFoundError';
  }
}

/**
 * Error thrown when webhook request fails
 */
export class WebhookRequestError extends AutomationError {
  constructor(
    message: string,
    statusCode: number,
    retryable: boolean = false,
    originalError?: Error
  ) {
    super(message, 'WEBHOOK_REQUEST_FAILED', retryable, statusCode, originalError);
    this.name = 'WebhookRequestError';
  }
}

/**
 * Error thrown when execution times out
 */
export class ExecutionTimeoutError extends AutomationError {
  constructor(workflowId: string, timeoutMs: number) {
    super(
      `Execution timed out after ${timeoutMs}ms for workflow ${workflowId}`,
      'EXECUTION_TIMEOUT',
      true,
      408
    );
    this.name = 'ExecutionTimeoutError';
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * Generate a unique ID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a default logger
 */
function createDefaultLogger(componentName: string): Logger {
  return {
    debug: (message: string, data?: Record<string, unknown>) => {
      if (isDevelopment) {
        console.debug(`[${componentName}] ${message}`, data ?? '');
      }
    },
    info: (message: string, data?: Record<string, unknown>) => {
      console.info(`[${componentName}] ${message}`, data ?? '');
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      console.warn(`[${componentName}] ${message}`, data ?? '');
    },
    error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
      console.error(`[${componentName}] ${message}`, error, data ?? '');
    },
  };
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// RATE LIMITER
// =============================================================================

interface RateLimiterEntry {
  timestamps: number[];
  lastReset: number;
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private entries: Map<string, RateLimiterEntry> = new Map();
  private readonly windowMs: number = 60000; // 1 minute

  constructor(
    private readonly limitPerWindow: number,
    private readonly globalLimit: number
  ) {}

  /**
   * Check if a request is allowed for a given key
   */
  isAllowed(key: string): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    this.cleanup(now);

    // Check global rate limit
    const globalEntry = this.entries.get('__global__') ?? { timestamps: [], lastReset: now };
    if (globalEntry.timestamps.length >= this.globalLimit) {
      const oldestTimestamp = globalEntry.timestamps[0];
      const retryAfterMs = oldestTimestamp + this.windowMs - now;
      return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
    }

    // Check per-workflow rate limit
    const entry = this.entries.get(key) ?? { timestamps: [], lastReset: now };
    if (entry.timestamps.length >= this.limitPerWindow) {
      const oldestTimestamp = entry.timestamps[0];
      const retryAfterMs = oldestTimestamp + this.windowMs - now;
      return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
    }

    return { allowed: true };
  }

  /**
   * Record a request for a given key
   */
  record(key: string): void {
    const now = Date.now();

    // Record for global
    const globalEntry = this.entries.get('__global__') ?? { timestamps: [], lastReset: now };
    globalEntry.timestamps.push(now);
    this.entries.set('__global__', globalEntry);

    // Record for specific key
    const entry = this.entries.get(key) ?? { timestamps: [], lastReset: now };
    entry.timestamps.push(now);
    this.entries.set(key, entry);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(now: number): void {
    const cutoff = now - this.windowMs;

    for (const [key, entry] of this.entries.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
      if (entry.timestamps.length === 0) {
        this.entries.delete(key);
      }
    }
  }

  /**
   * Get current stats for a key
   */
  getStats(key: string): { requestsInWindow: number; remaining: number } {
    this.cleanup(Date.now());
    const entry = this.entries.get(key) ?? { timestamps: [], lastReset: Date.now() };
    return {
      requestsInWindow: entry.timestamps.length,
      remaining: Math.max(0, this.limitPerWindow - entry.timestamps.length),
    };
  }
}

// =============================================================================
// EXECUTION LOG
// =============================================================================

interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  triggeredAt: Date;
  completedAt?: Date;
  executionTimeMs?: number;
  error?: string;
  context?: TriggerContext;
}

/**
 * In-memory execution log for tracking recent executions
 */
class ExecutionLog {
  private entries: ExecutionLogEntry[] = [];
  private readonly maxEntries: number = 1000;

  /**
   * Add a new log entry
   */
  add(entry: ExecutionLogEntry): void {
    this.entries.unshift(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  /**
   * Update an existing entry
   */
  update(id: string, updates: Partial<ExecutionLogEntry>): void {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      Object.assign(entry, updates);
    }
  }

  /**
   * Get entry by ID
   */
  get(id: string): ExecutionLogEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  /**
   * Get recent entries
   */
  getRecent(limit: number = 100): ExecutionLogEntry[] {
    return this.entries.slice(0, limit);
  }

  /**
   * Get entries for a specific workflow
   */
  getByWorkflow(workflowId: string, limit: number = 50): ExecutionLogEntry[] {
    return this.entries
      .filter((e) => e.workflowId === workflowId)
      .slice(0, limit);
  }
}

// =============================================================================
// AUTOMATION TRIGGER CLASS
// =============================================================================

/**
 * AutomationTrigger - Main class for triggering n8n workflows and automations
 *
 * Features:
 * - n8n webhook triggering
 * - n8n REST API integration
 * - Scheduled automation support
 * - Rate limiting per workflow
 * - Retry logic with exponential backoff
 * - Execution logging
 *
 * @example
 * ```typescript
 * const trigger = new AutomationTrigger({
 *   n8nBaseUrl: 'https://n8n.example.com',
 *   n8nApiKey: 'your-api-key',
 * });
 *
 * // Trigger by workflow ID
 * const result = await trigger.trigger('workflow-123', {
 *   customer: { name: 'John Doe', email: 'john@example.com' },
 *   action: 'welcome_email',
 * });
 *
 * // Trigger webhook directly
 * const webhookResult = await trigger.triggerWebhook(
 *   'https://n8n.example.com/webhook/abc123',
 *   { data: 'payload' }
 * );
 * ```
 */
export class AutomationTrigger {
  private readonly config: Required<AutomationTriggerConfig>;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiter;
  private readonly executionLog: ExecutionLog;
  private readonly scheduledAutomations: Map<string, ScheduledAutomation> = new Map();
  private readonly workflowCache: Map<string, Workflow> = new Map();

  // Statistics
  private stats = {
    totalTriggers: 0,
    successfulTriggers: 0,
    failedTriggers: 0,
    totalWebhookCalls: 0,
    averageExecutionTimeMs: 0,
  };

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(config: AutomationTriggerConfig) {
    // Validate and set default config
    this.config = {
      n8nBaseUrl: config.n8nBaseUrl.replace(/\/$/, ''), // Remove trailing slash
      n8nApiKey: config.n8nApiKey ?? '',
      defaultTimeout: config.defaultTimeout ?? 30000,
      defaultRetries: config.defaultRetries ?? 3,
      rateLimitPerWorkflow: config.rateLimitPerWorkflow ?? 30,
      globalRateLimit: config.globalRateLimit ?? 100,
      logger: config.logger ?? createDefaultLogger('AutomationTrigger'),
      debug: config.debug ?? false,
    };

    this.logger = this.config.logger;
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitPerWorkflow,
      this.config.globalRateLimit
    );
    this.executionLog = new ExecutionLog();

    this.logger.info('AutomationTrigger initialized', {
      n8nBaseUrl: this.config.n8nBaseUrl,
      defaultTimeout: this.config.defaultTimeout,
      rateLimitPerWorkflow: this.config.rateLimitPerWorkflow,
    });
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Trigger a workflow by its ID
   *
   * @param workflowId - The workflow ID to trigger
   * @param payload - The payload to send to the workflow
   * @param context - Optional context information
   * @param options - Optional trigger options
   * @returns Promise resolving to the trigger result
   */
  public async trigger(
    workflowId: string,
    payload: Record<string, unknown>,
    context?: TriggerContext,
    options?: TriggerOptions
  ): Promise<TriggerResult> {
    const startTime = Date.now();
    const executionId = generateId();
    const correlationId = context?.correlationId ?? generateId();

    this.logger.info(`Triggering workflow ${workflowId}`, {
      executionId,
      correlationId,
      async: options?.async,
    });

    // Validate input
    const validation = TriggerPayloadSchema.safeParse({
      workflowId,
      triggerData: payload,
      context: context ?? { orgId: 'default' },
      options,
    });

    if (!validation.success) {
      return this.createFailedResult(
        workflowId,
        startTime,
        'VALIDATION_ERROR',
        `Invalid trigger payload: ${validation.error.message}`,
        false
      );
    }

    // Check rate limits
    const rateLimitCheck = this.rateLimiter.isAllowed(workflowId);
    if (!rateLimitCheck.allowed) {
      this.logger.warn(`Rate limit exceeded for workflow ${workflowId}`, {
        retryAfterMs: rateLimitCheck.retryAfterMs,
      });
      throw new RateLimitExceededError(workflowId, rateLimitCheck.retryAfterMs);
    }

    // Record rate limit usage
    this.rateLimiter.record(workflowId);

    // Log execution start
    this.executionLog.add({
      id: executionId,
      workflowId,
      status: WorkflowExecutionStatus.PENDING,
      triggeredAt: new Date(),
      context,
    });

    try {
      // Get workflow details (from cache or API)
      const workflow = await this.getWorkflowDetails(workflowId);

      if (!workflow) {
        throw new WorkflowNotFoundError(workflowId);
      }

      if (!workflow.isActive) {
        return this.createFailedResult(
          workflowId,
          startTime,
          'WORKFLOW_INACTIVE',
          `Workflow ${workflowId} is not active`,
          false
        );
      }

      // Determine trigger method
      let result: TriggerResult;

      if (workflow.webhookUrl) {
        // Trigger via webhook
        result = await this.executeWebhookTrigger(
          workflow.webhookUrl,
          payload,
          executionId,
          workflowId,
          startTime,
          options
        );
      } else {
        // Trigger via n8n REST API
        result = await this.executeApiTrigger(
          workflowId,
          payload,
          executionId,
          startTime,
          options
        );
      }

      // Update execution log
      this.executionLog.update(executionId, {
        status: result.status,
        completedAt: result.completedAt,
        executionTimeMs: result.executionTimeMs,
        error: result.error,
      });

      // Update stats
      this.updateStats(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const retryable = error instanceof AutomationError ? error.retryable : false;

      this.executionLog.update(executionId, {
        status: WorkflowExecutionStatus.FAILED,
        completedAt: new Date(),
        executionTimeMs: Date.now() - startTime,
        error: errorMessage,
      });

      this.stats.failedTriggers++;

      throw error;
    }
  }

  /**
   * Trigger a workflow by its name
   *
   * @param workflowName - The workflow name to search for
   * @param payload - The payload to send
   * @param orgId - Organization ID to scope the search
   * @param options - Optional trigger options
   * @returns Promise resolving to the trigger result
   */
  public async triggerByName(
    workflowName: string,
    payload: Record<string, unknown>,
    orgId: string,
    options?: TriggerOptions
  ): Promise<TriggerResult> {
    this.logger.info(`Looking up workflow by name: ${workflowName}`, { orgId });

    // Find workflow by name
    const workflows = await this.listAvailableWorkflows(orgId);
    const workflow = workflows.find(
      (w) => w.name.toLowerCase() === workflowName.toLowerCase()
    );

    if (!workflow) {
      throw new WorkflowNotFoundError(`name:${workflowName}`);
    }

    return this.trigger(workflow.id, payload, { orgId }, options);
  }

  /**
   * Trigger a webhook URL directly
   *
   * @param webhookUrl - The webhook URL to call
   * @param payload - The payload to send
   * @param options - Optional webhook options
   * @returns Promise resolving to the webhook result
   */
  public async triggerWebhook(
    webhookUrl: string,
    payload: Record<string, unknown>,
    options?: TriggerOptions & { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' }
  ): Promise<WebhookResult> {
    const startTime = Date.now();
    const executionId = generateId();

    // Validate webhook URL
    const validation = WebhookTriggerSchema.safeParse({
      webhookUrl,
      payload,
      options,
    });

    if (!validation.success) {
      return {
        success: false,
        workflowId: 'webhook',
        status: WorkflowExecutionStatus.FAILED,
        executionTimeMs: Date.now() - startTime,
        error: `Invalid webhook request: ${validation.error.message}`,
        errorCode: 'VALIDATION_ERROR',
        retryable: false,
        triggeredAt: new Date(),
        statusCode: 400,
      };
    }

    // Check global rate limit
    const rateLimitCheck = this.rateLimiter.isAllowed('__webhooks__');
    if (!rateLimitCheck.allowed) {
      throw new RateLimitExceededError('__webhooks__', rateLimitCheck.retryAfterMs);
    }

    this.rateLimiter.record('__webhooks__');
    this.stats.totalWebhookCalls++;

    const timeout = options?.timeout ?? this.config.defaultTimeout;
    const retries = options?.retries ?? this.config.defaultRetries;
    const method = options?.method ?? 'POST';

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        if (attempt > 0) {
          this.logger.info(`Webhook retry attempt ${attempt}/${retries}`, {
            executionId,
            webhookUrl,
          });
          // Exponential backoff
          await sleep(Math.min(1000 * Math.pow(2, attempt - 1), 30000));
        }

        const result = await this.executeWebhookRequest(
          webhookUrl,
          payload,
          method,
          timeout,
          options?.headers,
          executionId,
          startTime
        );

        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (!this.shouldRetryError(error as Error)) {
          break;
        }
      }
    }

    return {
      success: false,
      workflowId: 'webhook',
      status: WorkflowExecutionStatus.FAILED,
      executionTimeMs: Date.now() - startTime,
      error: lastError?.message ?? 'Unknown error',
      errorCode: 'WEBHOOK_FAILED',
      retryable: false,
      triggeredAt: new Date(),
      statusCode: 500,
    };
  }

  /**
   * Schedule an automation to run at a specific time
   *
   * @param workflowId - The workflow ID to trigger
   * @param payload - The payload to send
   * @param runAt - When to run the automation
   * @param context - Optional context information
   * @returns Promise resolving to the schedule ID
   */
  public async scheduleAutomation(
    workflowId: string,
    payload: Record<string, unknown>,
    runAt: Date,
    context?: TriggerContext
  ): Promise<string> {
    const scheduleId = generateId();

    if (runAt <= new Date()) {
      throw new AutomationError(
        'Scheduled time must be in the future',
        'INVALID_SCHEDULE_TIME',
        false
      );
    }

    const scheduledAutomation: ScheduledAutomation = {
      id: scheduleId,
      workflowId,
      payload,
      context: context ?? { orgId: 'default' },
      runAt,
      status: 'pending',
      createdAt: new Date(),
    };

    this.scheduledAutomations.set(scheduleId, scheduledAutomation);

    // Set up timer to execute at scheduled time
    const delay = runAt.getTime() - Date.now();
    setTimeout(async () => {
      await this.executeScheduledAutomation(scheduleId);
    }, delay);

    this.logger.info(`Scheduled automation ${scheduleId}`, {
      workflowId,
      runAt: runAt.toISOString(),
      delayMs: delay,
    });

    return scheduleId;
  }

  /**
   * Cancel a scheduled automation
   *
   * @param scheduleId - The schedule ID to cancel
   */
  public async cancelScheduled(scheduleId: string): Promise<void> {
    const scheduled = this.scheduledAutomations.get(scheduleId);

    if (!scheduled) {
      throw new AutomationError(
        `Scheduled automation not found: ${scheduleId}`,
        'SCHEDULE_NOT_FOUND',
        false
      );
    }

    if (scheduled.status !== 'pending') {
      throw new AutomationError(
        `Cannot cancel automation with status: ${scheduled.status}`,
        'INVALID_SCHEDULE_STATUS',
        false
      );
    }

    scheduled.status = 'cancelled';
    this.scheduledAutomations.set(scheduleId, scheduled);

    this.logger.info(`Cancelled scheduled automation ${scheduleId}`);
  }

  /**
   * Get the status of a workflow execution
   *
   * @param executionId - The execution ID to check
   * @returns Promise resolving to the workflow status
   */
  public async getWorkflowStatus(executionId: string): Promise<WorkflowStatus> {
    // First check local execution log
    const localEntry = this.executionLog.get(executionId);
    if (localEntry) {
      return {
        executionId,
        workflowId: localEntry.workflowId,
        status: localEntry.status,
        startedAt: localEntry.triggeredAt,
        finishedAt: localEntry.completedAt,
        durationMs: localEntry.executionTimeMs,
        mode: 'trigger',
        retryCount: 0,
        error: localEntry.error ? { message: localEntry.error } : undefined,
      };
    }

    // Query n8n API for execution status
    if (this.config.n8nApiKey) {
      try {
        const response = await this.makeApiRequest<N8nExecutionResponse>(
          `/executions/${executionId}`,
          'GET'
        );

        return this.mapN8nExecutionToStatus(response);
      } catch (error) {
        this.logger.error('Failed to get execution status from n8n', error, {
          executionId,
        });
      }
    }

    throw new AutomationError(
      `Execution not found: ${executionId}`,
      'EXECUTION_NOT_FOUND',
      false
    );
  }

  /**
   * List available workflows for an organization
   *
   * @param orgId - Organization ID to filter by
   * @returns Promise resolving to array of workflows
   */
  public async listAvailableWorkflows(orgId: string): Promise<Workflow[]> {
    if (!this.config.n8nApiKey) {
      this.logger.warn('n8n API key not configured, returning cached workflows only');
      return Array.from(this.workflowCache.values()).filter(
        (w) => w.orgId === orgId
      );
    }

    try {
      const response = await this.makeApiRequest<{ data: N8nWorkflow[] }>(
        '/workflows',
        'GET'
      );

      const workflows = response.data.map((n8nWorkflow) =>
        this.mapN8nWorkflowToWorkflow(n8nWorkflow, orgId)
      );

      // Update cache
      for (const workflow of workflows) {
        this.workflowCache.set(workflow.id, workflow);
      }

      return workflows;
    } catch (error) {
      this.logger.error('Failed to list workflows from n8n', error, { orgId });
      // Return cached workflows on error
      return Array.from(this.workflowCache.values()).filter(
        (w) => w.orgId === orgId
      );
    }
  }

  /**
   * Get execution statistics
   */
  public getStats(): typeof this.stats & { rateLimitStats: Record<string, unknown> } {
    return {
      ...this.stats,
      rateLimitStats: {
        global: this.rateLimiter.getStats('__global__'),
      },
    };
  }

  /**
   * Get recent executions from the log
   */
  public getRecentExecutions(limit: number = 100): ExecutionLogEntry[] {
    return this.executionLog.getRecent(limit);
  }

  /**
   * Get scheduled automations
   */
  public getScheduledAutomations(): ScheduledAutomation[] {
    return Array.from(this.scheduledAutomations.values());
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Execute a webhook trigger with retries
   */
  private async executeWebhookTrigger(
    webhookUrl: string,
    payload: Record<string, unknown>,
    executionId: string,
    workflowId: string,
    startTime: number,
    options?: TriggerOptions
  ): Promise<TriggerResult> {
    const timeout = options?.timeout ?? this.config.defaultTimeout;
    const retries = options?.retries ?? this.config.defaultRetries;

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        if (attempt > 0) {
          this.logger.info(`Trigger retry attempt ${attempt}/${retries}`, {
            executionId,
            workflowId,
          });
          await sleep(Math.min(1000 * Math.pow(2, attempt - 1), 30000));
        }

        const result = await this.executeWebhookRequest(
          webhookUrl,
          payload,
          'POST',
          timeout,
          options?.headers,
          executionId,
          startTime
        );

        return {
          ...result,
          workflowId,
          executionId,
        };
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (!this.shouldRetryError(error as Error)) {
          break;
        }
      }
    }

    return this.createFailedResult(
      workflowId,
      startTime,
      'TRIGGER_FAILED',
      lastError?.message ?? 'Webhook trigger failed',
      false,
      executionId
    );
  }

  /**
   * Execute an API trigger via n8n REST API
   */
  private async executeApiTrigger(
    workflowId: string,
    payload: Record<string, unknown>,
    executionId: string,
    startTime: number,
    options?: TriggerOptions
  ): Promise<TriggerResult> {
    if (!this.config.n8nApiKey) {
      return this.createFailedResult(
        workflowId,
        startTime,
        'API_NOT_CONFIGURED',
        'n8n API key not configured',
        false,
        executionId
      );
    }

    try {
      const response = await this.makeApiRequest<N8nExecutionResponse>(
        `/workflows/${workflowId}/execute`,
        'POST',
        payload,
        options?.timeout
      );

      return {
        success: true,
        executionId: response.id ?? executionId,
        workflowId,
        data: response.data,
        status: this.mapN8nStatus(response.status),
        executionTimeMs: Date.now() - startTime,
        triggeredAt: new Date(startTime),
        completedAt: new Date(),
      };
    } catch (error) {
      return this.createFailedResult(
        workflowId,
        startTime,
        'API_TRIGGER_FAILED',
        (error as Error).message,
        this.shouldRetryError(error as Error),
        executionId
      );
    }
  }

  /**
   * Execute a webhook HTTP request
   */
  private async executeWebhookRequest(
    url: string,
    payload: Record<string, unknown>,
    method: string,
    timeout: number,
    headers?: Record<string, string>,
    executionId?: string,
    startTime?: number
  ): Promise<WebhookResult> {
    const requestStartTime = startTime ?? Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AstralisOps-AutomationTrigger/1.0',
          'X-Execution-ID': executionId ?? generateId(),
          ...headers,
        },
        body: method !== 'GET' ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: Record<string, unknown> | undefined;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Response is not JSON, store as raw
      }

      const executionTimeMs = Date.now() - requestStartTime;

      if (!response.ok) {
        return {
          success: false,
          workflowId: 'webhook',
          status: WorkflowExecutionStatus.FAILED,
          executionTimeMs,
          error: `HTTP ${response.status}: ${response.statusText}`,
          errorCode: `HTTP_${response.status}`,
          retryable: response.status >= 500 || response.status === 429,
          triggeredAt: new Date(requestStartTime),
          completedAt: new Date(),
          statusCode: response.status,
          rawResponse: responseText,
        };
      }

      return {
        success: true,
        executionId: executionId ?? generateId(),
        workflowId: 'webhook',
        data: responseData,
        status: WorkflowExecutionStatus.SUCCESS,
        executionTimeMs,
        triggeredAt: new Date(requestStartTime),
        completedAt: new Date(),
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      const isTimeout = (error as Error).name === 'AbortError';
      const executionTimeMs = Date.now() - requestStartTime;

      return {
        success: false,
        workflowId: 'webhook',
        status: isTimeout ? WorkflowExecutionStatus.TIMED_OUT : WorkflowExecutionStatus.FAILED,
        executionTimeMs,
        error: isTimeout ? `Request timed out after ${timeout}ms` : (error as Error).message,
        errorCode: isTimeout ? 'TIMEOUT' : 'REQUEST_FAILED',
        retryable: isTimeout,
        triggeredAt: new Date(requestStartTime),
        completedAt: new Date(),
        statusCode: 0,
      };
    }
  }

  /**
   * Execute a scheduled automation
   */
  private async executeScheduledAutomation(scheduleId: string): Promise<void> {
    const scheduled = this.scheduledAutomations.get(scheduleId);

    if (!scheduled || scheduled.status !== 'pending') {
      return;
    }

    this.logger.info(`Executing scheduled automation ${scheduleId}`);

    try {
      const result = await this.trigger(
        scheduled.workflowId,
        scheduled.payload,
        scheduled.context
      );

      scheduled.status = result.success ? 'executed' : 'failed';
      scheduled.result = result;
    } catch (error) {
      scheduled.status = 'failed';
      scheduled.result = this.createFailedResult(
        scheduled.workflowId,
        scheduled.runAt.getTime(),
        'SCHEDULED_EXECUTION_FAILED',
        (error as Error).message,
        false
      );
    }

    this.scheduledAutomations.set(scheduleId, scheduled);
  }

  /**
   * Get workflow details from cache or API
   */
  private async getWorkflowDetails(workflowId: string): Promise<Workflow | null> {
    // Check cache first
    if (this.workflowCache.has(workflowId)) {
      return this.workflowCache.get(workflowId) ?? null;
    }

    // Query n8n API
    if (this.config.n8nApiKey) {
      try {
        const n8nWorkflow = await this.makeApiRequest<N8nWorkflow>(
          `/workflows/${workflowId}`,
          'GET'
        );

        const workflow = this.mapN8nWorkflowToWorkflow(n8nWorkflow, 'default');
        this.workflowCache.set(workflowId, workflow);
        return workflow;
      } catch (error) {
        this.logger.error('Failed to get workflow from n8n', error, { workflowId });
      }
    }

    return null;
  }

  /**
   * Make an API request to n8n
   */
  private async makeApiRequest<T>(
    endpoint: string,
    method: string,
    body?: Record<string, unknown>,
    timeout?: number
  ): Promise<T> {
    const url = `${this.config.n8nBaseUrl}/api/v1${endpoint}`;
    const requestTimeout = timeout ?? this.config.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.config.n8nApiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new WebhookRequestError(
          `n8n API error: ${response.status} ${response.statusText}`,
          response.status,
          response.status >= 500
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new ExecutionTimeoutError('n8n-api', requestTimeout);
      }

      throw error;
    }
  }

  /**
   * Create a failed trigger result
   */
  private createFailedResult(
    workflowId: string,
    startTime: number,
    errorCode: string,
    errorMessage: string,
    retryable: boolean,
    executionId?: string
  ): TriggerResult {
    return {
      success: false,
      executionId,
      workflowId,
      status: WorkflowExecutionStatus.FAILED,
      executionTimeMs: Date.now() - startTime,
      error: errorMessage,
      errorCode,
      retryable,
      triggeredAt: new Date(startTime),
      completedAt: new Date(),
    };
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetryError(error: Error): boolean {
    if (error instanceof AutomationError) {
      return error.retryable;
    }

    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('socket') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  }

  /**
   * Update statistics after a trigger
   */
  private updateStats(result: TriggerResult): void {
    this.stats.totalTriggers++;

    if (result.success) {
      this.stats.successfulTriggers++;
    } else {
      this.stats.failedTriggers++;
    }

    // Update rolling average execution time
    const totalExecutions = this.stats.successfulTriggers + this.stats.failedTriggers;
    this.stats.averageExecutionTimeMs =
      (this.stats.averageExecutionTimeMs * (totalExecutions - 1) + result.executionTimeMs) /
      totalExecutions;
  }

  /**
   * Map n8n workflow to internal Workflow type
   */
  private mapN8nWorkflowToWorkflow(n8nWorkflow: N8nWorkflow, orgId: string): Workflow {
    // Find webhook node to get webhook URL
    let webhookUrl: string | undefined;
    if (n8nWorkflow.nodes) {
      const webhookNode = n8nWorkflow.nodes.find(
        (node) => node.type === 'n8n-nodes-base.webhook'
      );
      if (webhookNode?.parameters?.path) {
        webhookUrl = `${this.config.n8nBaseUrl}/webhook/${webhookNode.parameters.path}`;
      }
    }

    return {
      id: n8nWorkflow.id,
      name: n8nWorkflow.name,
      description: n8nWorkflow.settings?.description,
      type: this.inferWorkflowType(n8nWorkflow),
      isActive: n8nWorkflow.active,
      webhookUrl,
      orgId,
      tags: n8nWorkflow.tags?.map((t) => t.name) ?? [],
      createdAt: new Date(n8nWorkflow.createdAt),
      updatedAt: new Date(n8nWorkflow.updatedAt),
      executionCount: 0, // Would need separate API call to get this
      successRate: 1, // Would need separate API call to calculate
    };
  }

  /**
   * Infer workflow type from n8n workflow definition
   */
  private inferWorkflowType(n8nWorkflow: N8nWorkflow): WorkflowType {
    const nodeTypes = n8nWorkflow.nodes?.map((n) => n.type.toLowerCase()) ?? [];

    if (nodeTypes.some((t) => t.includes('email') || t.includes('sendgrid') || t.includes('mailgun'))) {
      return 'email_sequence';
    }
    if (nodeTypes.some((t) => t.includes('slack'))) {
      return 'slack_notification';
    }
    if (nodeTypes.some((t) => t.includes('salesforce') || t.includes('hubspot') || t.includes('crm'))) {
      return 'crm_update';
    }
    if (nodeTypes.some((t) => t.includes('spreadsheet') || t.includes('google sheets') || t.includes('excel'))) {
      return 'report_generation';
    }

    return 'custom_integration';
  }

  /**
   * Map n8n status to internal status
   */
  private mapN8nStatus(status?: string): WorkflowExecutionStatus {
    switch (status?.toLowerCase()) {
      case 'success':
        return WorkflowExecutionStatus.SUCCESS;
      case 'running':
        return WorkflowExecutionStatus.RUNNING;
      case 'waiting':
        return WorkflowExecutionStatus.WAITING;
      case 'error':
      case 'failed':
        return WorkflowExecutionStatus.FAILED;
      case 'cancelled':
        return WorkflowExecutionStatus.CANCELLED;
      default:
        return WorkflowExecutionStatus.PENDING;
    }
  }

  /**
   * Map n8n execution response to WorkflowStatus
   */
  private mapN8nExecutionToStatus(execution: N8nExecutionResponse): WorkflowStatus {
    return {
      executionId: execution.id,
      workflowId: execution.workflowId ?? 'unknown',
      status: this.mapN8nStatus(execution.status),
      startedAt: new Date(execution.startedAt ?? Date.now()),
      finishedAt: execution.finishedAt ? new Date(execution.finishedAt) : undefined,
      durationMs: execution.stoppedAt && execution.startedAt
        ? new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime()
        : undefined,
      mode: execution.mode as 'trigger' | 'webhook' | 'manual' | 'scheduled',
      retryCount: 0,
      data: execution.data,
      error: execution.error
        ? { message: execution.error.message, code: execution.error.code }
        : undefined,
    };
  }
}

// =============================================================================
// n8n API TYPES
// =============================================================================

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes?: Array<{
    type: string;
    parameters?: {
      path?: string;
      [key: string]: unknown;
    };
  }>;
  settings?: {
    description?: string;
    [key: string]: unknown;
  };
  tags?: Array<{ name: string }>;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecutionResponse {
  id: string;
  workflowId?: string;
  status?: string;
  startedAt?: string;
  stoppedAt?: string;
  finishedAt?: string;
  mode?: string;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
  };
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create an AutomationTrigger instance from environment variables
 *
 * @returns Configured AutomationTrigger instance
 */
export function createAutomationTrigger(): AutomationTrigger {
  const n8nBaseUrl = process.env.N8N_BASE_URL ?? process.env.NEXT_PUBLIC_N8N_BASE_URL;
  const n8nApiKey = process.env.N8N_API_KEY;

  if (!n8nBaseUrl) {
    throw new Error('N8N_BASE_URL environment variable is required');
  }

  return new AutomationTrigger({
    n8nBaseUrl,
    n8nApiKey,
    defaultTimeout: parseInt(process.env.N8N_TIMEOUT ?? '30000', 10),
    defaultRetries: parseInt(process.env.N8N_RETRIES ?? '3', 10),
    rateLimitPerWorkflow: parseInt(process.env.N8N_RATE_LIMIT_PER_WORKFLOW ?? '30', 10),
    globalRateLimit: parseInt(process.env.N8N_GLOBAL_RATE_LIMIT ?? '100', 10),
    debug: process.env.NODE_ENV === 'development',
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AutomationTrigger;
