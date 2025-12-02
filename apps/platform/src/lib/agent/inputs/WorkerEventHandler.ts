/**
 * WorkerEventHandler - BullMQ Worker Event Input Handler
 *
 * Processes events from BullMQ workers (background job system) and normalizes them
 * into AgentInput format for the orchestration agent to process.
 *
 * Handles:
 * - Job completion events (with results)
 * - Job failure events (with errors and retry tracking)
 * - Job progress updates
 * - Scheduled/cron job triggers
 *
 * Supported queue types:
 * - email: Email sending jobs
 * - notifications: Push/in-app notification jobs
 * - automation: n8n workflow execution jobs
 * - reports: Report generation jobs
 * - reminders: Scheduled reminder jobs
 * - sync: Data synchronization jobs
 *
 * @module WorkerEventHandler
 * @example
 * ```typescript
 * import { WorkerEventHandler } from './WorkerEventHandler';
 *
 * const handler = new WorkerEventHandler({
 *   orgId: 'org_123',
 *   debug: true,
 * });
 *
 * // Process a completed job event
 * const result = await handler.handleInput({
 *   eventType: 'completed',
 *   queueName: 'automation',
 *   job: {
 *     id: 'job_456',
 *     name: 'run-workflow',
 *     data: { workflowId: 'wf_789' },
 *     returnValue: { success: true, output: { ... } },
 *     timestamp: Date.now(),
 *   },
 * });
 * ```
 *
 * @example BullMQ Integration
 * ```typescript
 * import { Worker } from 'bullmq';
 * import { WorkerEventHandler } from './WorkerEventHandler';
 *
 * const handler = new WorkerEventHandler({ orgId: 'org_123' });
 *
 * const worker = new Worker('automation', async (job) => {
 *   // Process job...
 *   return { success: true };
 * });
 *
 * // Register event handlers
 * worker.on('completed', async (job, returnValue) => {
 *   await handler.handleInput({
 *     eventType: 'completed',
 *     queueName: 'automation',
 *     job: {
 *       id: job.id,
 *       name: job.name,
 *       data: job.data,
 *       returnValue,
 *       timestamp: Date.now(),
 *       attemptsMade: job.attemptsMade,
 *     },
 *   });
 * });
 *
 * worker.on('failed', async (job, error) => {
 *   await handler.handleInput({
 *     eventType: 'failed',
 *     queueName: 'automation',
 *     job: {
 *       id: job?.id,
 *       name: job?.name,
 *       data: job?.data,
 *       failedReason: error.message,
 *       stacktrace: error.stack,
 *       timestamp: Date.now(),
 *       attemptsMade: job?.attemptsMade,
 *       opts: job?.opts,
 *     },
 *   });
 * });
 *
 * worker.on('progress', async (job, progress) => {
 *   await handler.handleInput({
 *     eventType: 'progress',
 *     queueName: 'automation',
 *     job: {
 *       id: job.id,
 *       name: job.name,
 *       data: job.data,
 *       progress,
 *       timestamp: Date.now(),
 *     },
 *   });
 * });
 *
 * // For scheduled/cron jobs using QueueScheduler or repeat jobs
 * const queue = new Queue('reports');
 *
 * // Add a repeatable job (cron)
 * await queue.add('daily-report', { reportType: 'sales' }, {
 *   repeat: { cron: '0 9 * * *' }, // Every day at 9 AM
 * });
 *
 * // When the cron triggers, handle it as a scheduled event
 * worker.on('active', async (job) => {
 *   if (job.opts.repeat) {
 *     await handler.handleInput({
 *       eventType: 'scheduled',
 *       queueName: 'reports',
 *       job: {
 *         id: job.id,
 *         name: job.name,
 *         data: job.data,
 *         timestamp: Date.now(),
 *         repeatJobKey: job.repeatJobKey,
 *         opts: job.opts,
 *       },
 *     });
 *   }
 * });
 * ```
 */

import { BaseInputHandler, type InputHandlerConfig, type ValidationResult, type ProcessingResult } from './BaseInputHandler';
import type {
  AgentInputSource,
  AgentEventType,
  AgentInputMetadata,
  AutomationEventPayload,
  ReminderEventPayload,
  BaseEventPayload,
} from '../types/agent.types';
import { AgentInputSource as InputSource } from '../types/agent.types';

// =============================================================================
// BullMQ Job Interfaces (for compatibility without requiring bullmq dependency)
// =============================================================================

/**
 * BullMQ job options interface
 */
export interface BullMQJobOpts {
  /** Number of retry attempts */
  attempts?: number;
  /** Backoff configuration */
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  /** Delay before processing (ms) */
  delay?: number;
  /** Priority (lower = higher priority) */
  priority?: number;
  /** Remove on complete configuration */
  removeOnComplete?: boolean | number;
  /** Remove on fail configuration */
  removeOnFail?: boolean | number;
  /** Repeat/cron configuration */
  repeat?: {
    /** Cron expression */
    cron?: string;
    /** Repeat every N milliseconds */
    every?: number;
    /** Maximum number of repeats */
    limit?: number;
    /** Timezone for cron */
    tz?: string;
  };
  /** Job timeout (ms) */
  timeout?: number;
}

/**
 * Simplified BullMQ job interface for input processing
 */
export interface BullMQJobData {
  /** Unique job identifier */
  id?: string;
  /** Job name/type */
  name: string;
  /** Job payload data */
  data: Record<string, unknown>;
  /** Return value (for completed jobs) */
  returnValue?: unknown;
  /** Failed reason (for failed jobs) */
  failedReason?: string;
  /** Error stack trace (for failed jobs) */
  stacktrace?: string;
  /** Progress value (for progress events) */
  progress?: number | Record<string, unknown>;
  /** Unix timestamp when event occurred */
  timestamp: number;
  /** Number of attempts made */
  attemptsMade?: number;
  /** Job options */
  opts?: BullMQJobOpts;
  /** Repeat job key (for cron jobs) */
  repeatJobKey?: string;
  /** Queue name (optional, can be provided separately) */
  queueName?: string;
}

/**
 * Worker event types that can be processed
 */
export type WorkerEventType =
  | 'completed'  // Job finished successfully
  | 'failed'     // Job failed (may be retried)
  | 'progress'   // Job progress update
  | 'scheduled'  // Cron/scheduled job triggered
  | 'stalled'    // Job stalled (worker died)
  | 'active'     // Job became active
  | 'delayed'    // Job was delayed
  | 'waiting';   // Job is waiting

/**
 * Supported queue types and their purposes
 */
export type QueueType =
  | 'email'         // Email sending queue
  | 'notifications' // Push/in-app notifications
  | 'automation'    // n8n workflow execution
  | 'reports'       // Report generation
  | 'reminders'     // Scheduled reminders
  | 'sync'          // Data synchronization
  | 'cleanup'       // Cleanup/maintenance jobs
  | 'analytics'     // Analytics processing
  | 'custom';       // Custom queues

/**
 * Input payload for the WorkerEventHandler
 */
export interface WorkerEventInput {
  /** Type of worker event */
  eventType: WorkerEventType;
  /** Name of the queue */
  queueName: QueueType | string;
  /** Job data and metadata */
  job: BullMQJobData;
  /** Optional worker identifier */
  workerId?: string;
  /** Previous job state (for transitions) */
  previousState?: string;
}

// =============================================================================
// Queue to Event Type Mapping
// =============================================================================

/**
 * Maps queue names and event types to agent event types
 */
const QUEUE_EVENT_MAP: Record<string, Record<string, AgentEventType>> = {
  email: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
    scheduled: 'schedule:triggered',
  },
  notifications: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
    scheduled: 'schedule:triggered',
  },
  automation: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
    scheduled: 'automation:triggered',
  },
  reports: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
    scheduled: 'schedule:triggered',
  },
  reminders: {
    completed: 'calendar:reminder_due',
    failed: 'automation:failed',
    scheduled: 'calendar:reminder_due',
  },
  sync: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
  },
  cleanup: {
    completed: 'automation:completed',
    failed: 'automation:failed',
  },
  analytics: {
    completed: 'automation:completed',
    failed: 'automation:failed',
    progress: 'automation:triggered',
  },
};

/**
 * Default event types for unmapped queue/event combinations
 */
const DEFAULT_EVENT_MAP: Record<WorkerEventType, AgentEventType> = {
  completed: 'automation:completed',
  failed: 'automation:failed',
  progress: 'automation:triggered',
  scheduled: 'schedule:triggered',
  stalled: 'automation:failed',
  active: 'automation:triggered',
  delayed: 'automation:triggered',
  waiting: 'automation:triggered',
};

// =============================================================================
// Handler Configuration
// =============================================================================

/**
 * Extended configuration for WorkerEventHandler
 */
export interface WorkerEventHandlerConfig extends InputHandlerConfig {
  /** Custom queue-to-event mapping overrides */
  queueEventMap?: Record<string, Record<string, AgentEventType>>;
  /** Whether to emit events for progress updates (can be noisy) */
  emitProgressEvents?: boolean;
  /** Minimum progress percentage change to emit event (0-100) */
  progressThreshold?: number;
  /** Whether to track retry attempts */
  trackRetries?: boolean;
  /** Maximum retries before considering job permanently failed */
  maxRetriesForPermanentFailure?: number;
}

// =============================================================================
// WorkerEventHandler Class
// =============================================================================

/**
 * Handles BullMQ worker events and normalizes them for the orchestration agent.
 *
 * Processes job lifecycle events from background workers and converts them
 * into agent inputs that can trigger decisions and actions.
 */
export class WorkerEventHandler extends BaseInputHandler {
  private queueEventMap: Record<string, Record<string, AgentEventType>>;
  private emitProgressEvents: boolean;
  private progressThreshold: number;
  private trackRetries: boolean;
  private maxRetriesForPermanentFailure: number;

  // Track last progress values to avoid duplicate emissions
  private progressTracker: Map<string, number> = new Map();

  // Track retry counts for jobs
  private retryTracker: Map<string, number> = new Map();

  // Extended stats for worker events
  protected workerStats = {
    completedJobs: 0,
    failedJobs: 0,
    progressUpdates: 0,
    scheduledTriggers: 0,
    stalledJobs: 0,
    permanentFailures: 0,
    retriedJobs: 0,
    byQueue: {} as Record<string, { completed: number; failed: number }>,
  };

  constructor(config: WorkerEventHandlerConfig = {}) {
    super(config);

    // Merge custom queue event map with defaults
    this.queueEventMap = {
      ...QUEUE_EVENT_MAP,
      ...config.queueEventMap,
    };

    this.emitProgressEvents = config.emitProgressEvents ?? false;
    this.progressThreshold = config.progressThreshold ?? 10;
    this.trackRetries = config.trackRetries ?? true;
    this.maxRetriesForPermanentFailure = config.maxRetriesForPermanentFailure ?? 3;

    this.logger.info('WorkerEventHandler initialized', {
      emitProgressEvents: this.emitProgressEvents,
      progressThreshold: this.progressThreshold,
      trackRetries: this.trackRetries,
      maxRetriesForPermanentFailure: this.maxRetriesForPermanentFailure,
    });
  }

  // ==========================================================================
  // Abstract Method Implementations
  // ==========================================================================

  /**
   * Returns the input source type for worker events
   */
  protected getSource(): AgentInputSource {
    return InputSource.WORKER;
  }

  /**
   * Validates a worker event input
   *
   * @param input - The raw input to validate
   * @returns Validation result with errors/warnings
   */
  public validate(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check input is an object
    if (!input || typeof input !== 'object') {
      return {
        isValid: false,
        errors: ['Input must be a non-null object'],
        warnings: [],
      };
    }

    const workerInput = input as Partial<WorkerEventInput>;

    // Validate eventType
    if (!workerInput.eventType) {
      errors.push('Missing required field: eventType');
    } else if (!this.isValidEventType(workerInput.eventType)) {
      errors.push(`Invalid eventType: ${workerInput.eventType}. Must be one of: completed, failed, progress, scheduled, stalled, active, delayed, waiting`);
    }

    // Validate queueName
    if (!workerInput.queueName) {
      errors.push('Missing required field: queueName');
    } else if (typeof workerInput.queueName !== 'string') {
      errors.push('queueName must be a string');
    }

    // Validate job object
    if (!workerInput.job) {
      errors.push('Missing required field: job');
    } else if (typeof workerInput.job !== 'object') {
      errors.push('job must be an object');
    } else {
      const job = workerInput.job as Partial<BullMQJobData>;

      // Validate job.name
      if (!job.name) {
        errors.push('Missing required field: job.name');
      } else if (typeof job.name !== 'string') {
        errors.push('job.name must be a string');
      }

      // Validate job.data
      if (job.data !== undefined && typeof job.data !== 'object') {
        errors.push('job.data must be an object');
      }

      // Validate job.timestamp
      if (!job.timestamp) {
        warnings.push('Missing job.timestamp, will use current time');
      } else if (typeof job.timestamp !== 'number') {
        errors.push('job.timestamp must be a number (Unix timestamp)');
      }

      // Validate event-specific fields
      if (workerInput.eventType === 'failed') {
        if (!job.failedReason) {
          warnings.push('Failed job missing failedReason');
        }
      }

      if (workerInput.eventType === 'progress') {
        if (job.progress === undefined) {
          warnings.push('Progress event missing progress value');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput: errors.length === 0 ? this.sanitizeInput(workerInput) : undefined,
    };
  }

  /**
   * Process a worker event and emit appropriate agent events
   *
   * @param input - The validated worker event input
   * @returns Processing result with normalized input and event emission details
   */
  public async handleInput(input: unknown): Promise<ProcessingResult> {
    return this.processWithErrorHandling(input, async (normalizedInput) => {
      const startTime = Date.now();
      const workerInput = input as WorkerEventInput;

      // Determine the event type to emit
      const agentEventType = this.getAgentEventType(
        workerInput.queueName,
        workerInput.eventType
      );

      // Build the event payload based on queue type
      const eventPayload = this.buildEventPayload(workerInput);

      // Update stats based on event type
      this.updateStats(workerInput);

      // Check if we should emit this event
      if (!this.shouldEmitEvent(workerInput)) {
        this.logger.debug('Skipping event emission', {
          reason: 'Event filtered by configuration',
          eventType: workerInput.eventType,
          queueName: workerInput.queueName,
        });

        return this.createSuccessResult(normalizedInput, undefined, startTime);
      }

      // Handle retry tracking for failed jobs
      if (workerInput.eventType === 'failed' && this.trackRetries) {
        this.handleFailedJobRetry(workerInput);
      }

      // Emit the event
      const emitResult = await this.emitEvent(
        agentEventType,
        eventPayload,
        normalizedInput.correlationId
      );

      this.logger.info('Worker event processed', {
        eventType: workerInput.eventType,
        queueName: workerInput.queueName,
        jobId: workerInput.job.id,
        jobName: workerInput.job.name,
        agentEventType,
        emitResult: {
          eventId: emitResult.eventId,
          handlersInvoked: emitResult.handlersInvoked,
        },
      });

      return this.createSuccessResult(
        normalizedInput,
        { type: agentEventType, result: emitResult },
        startTime
      );
    });
  }

  // ==========================================================================
  // Event Type Mapping
  // ==========================================================================

  /**
   * Get the agent event type for a queue and worker event combination
   */
  private getAgentEventType(
    queueName: string,
    eventType: WorkerEventType
  ): AgentEventType {
    // Normalize queue name to lowercase for mapping
    const normalizedQueue = queueName.toLowerCase();

    // Check for custom mapping first
    const queueMapping = this.queueEventMap[normalizedQueue];
    if (queueMapping && queueMapping[eventType]) {
      return queueMapping[eventType];
    }

    // Fall back to default mapping
    return DEFAULT_EVENT_MAP[eventType] || 'automation:triggered';
  }

  // ==========================================================================
  // Event Payload Building
  // ==========================================================================

  /**
   * Build the appropriate event payload based on queue type and event
   */
  private buildEventPayload(
    input: WorkerEventInput
  ): AutomationEventPayload | ReminderEventPayload | BaseEventPayload {
    const basePayload: BaseEventPayload = {
      id: input.job.id || this.generateId(),
      timestamp: new Date(input.job.timestamp || Date.now()),
      source: InputSource.WORKER,
      orgId: this.orgId,
      metadata: {
        queueName: input.queueName,
        eventType: input.eventType,
        jobName: input.job.name,
        attemptsMade: input.job.attemptsMade,
        workerId: input.workerId,
        repeatJobKey: input.job.repeatJobKey,
      },
    };

    // Build specialized payloads based on queue type
    const queueName = input.queueName.toLowerCase();

    if (queueName === 'reminders' || input.eventType === 'scheduled') {
      return this.buildReminderPayload(input, basePayload);
    }

    if (['automation', 'email', 'notifications', 'reports', 'sync'].includes(queueName)) {
      return this.buildAutomationPayload(input, basePayload);
    }

    // Default to base payload with job data
    return {
      ...basePayload,
      metadata: {
        ...basePayload.metadata,
        jobData: input.job.data,
        returnValue: input.job.returnValue,
        failedReason: input.job.failedReason,
      },
    };
  }

  /**
   * Build automation event payload
   */
  private buildAutomationPayload(
    input: WorkerEventInput,
    basePayload: BaseEventPayload
  ): AutomationEventPayload {
    const isSuccess = input.eventType === 'completed';
    const isFailed = input.eventType === 'failed' || input.eventType === 'stalled';

    return {
      ...basePayload,
      workflowId: (input.job.data.workflowId as string) || input.job.name,
      workflowName: (input.job.data.workflowName as string) || input.job.name,
      status: isSuccess ? 'success' : isFailed ? 'failure' : 'success',
      executionTime: this.calculateExecutionTime(input),
      result: isSuccess ? (input.job.returnValue as Record<string, unknown>) : undefined,
      error: input.job.failedReason,
    };
  }

  /**
   * Build reminder event payload
   */
  private buildReminderPayload(
    input: WorkerEventInput,
    basePayload: BaseEventPayload
  ): ReminderEventPayload {
    const data = input.job.data;

    return {
      ...basePayload,
      reminderId: (data.reminderId as string) || basePayload.id,
      eventId: data.eventId as string | undefined,
      message: (data.message as string) || `Reminder: ${input.job.name}`,
      dueAt: new Date((data.dueAt as number) || input.job.timestamp),
      recipientIds: (data.recipientIds as string[]) || [],
    };
  }

  // ==========================================================================
  // Progress and Retry Tracking
  // ==========================================================================

  /**
   * Check if we should emit this event based on configuration and state
   */
  private shouldEmitEvent(input: WorkerEventInput): boolean {
    // Always emit completed, failed, scheduled, and stalled events
    if (['completed', 'failed', 'scheduled', 'stalled'].includes(input.eventType)) {
      return true;
    }

    // Check progress event configuration
    if (input.eventType === 'progress') {
      if (!this.emitProgressEvents) {
        return false;
      }

      // Check progress threshold
      return this.meetsProgressThreshold(input);
    }

    // For other events (active, delayed, waiting), emit if debug mode
    return this.debug;
  }

  /**
   * Check if progress update meets the threshold for emission
   */
  private meetsProgressThreshold(input: WorkerEventInput): boolean {
    const jobKey = `${input.queueName}:${input.job.id}`;
    const currentProgress = this.extractProgressValue(input.job.progress);
    const lastProgress = this.progressTracker.get(jobKey) ?? 0;

    // Check if progress changed enough
    if (Math.abs(currentProgress - lastProgress) >= this.progressThreshold) {
      this.progressTracker.set(jobKey, currentProgress);
      return true;
    }

    return false;
  }

  /**
   * Extract numeric progress value from various formats
   */
  private extractProgressValue(progress: unknown): number {
    if (typeof progress === 'number') {
      return progress;
    }

    if (typeof progress === 'object' && progress !== null) {
      const obj = progress as Record<string, unknown>;
      if (typeof obj.percent === 'number') return obj.percent;
      if (typeof obj.percentage === 'number') return obj.percentage;
      if (typeof obj.value === 'number') return obj.value;
    }

    return 0;
  }

  /**
   * Handle retry tracking for failed jobs
   */
  private handleFailedJobRetry(input: WorkerEventInput): void {
    const jobKey = `${input.queueName}:${input.job.id}`;
    const currentRetries = this.retryTracker.get(jobKey) ?? 0;
    const newRetries = currentRetries + 1;

    this.retryTracker.set(jobKey, newRetries);
    this.workerStats.retriedJobs++;

    // Check if this is a permanent failure
    const maxAttempts = input.job.opts?.attempts ?? this.maxRetriesForPermanentFailure;
    const attemptsMade = input.job.attemptsMade ?? newRetries;

    if (attemptsMade >= maxAttempts) {
      this.workerStats.permanentFailures++;
      this.logger.warn('Job permanently failed after max retries', {
        jobId: input.job.id,
        jobName: input.job.name,
        queueName: input.queueName,
        attemptsMade,
        maxAttempts,
        failedReason: input.job.failedReason,
      });

      // Clean up tracker
      this.retryTracker.delete(jobKey);
    }
  }

  // ==========================================================================
  // Statistics and Utilities
  // ==========================================================================

  /**
   * Update internal statistics based on event type
   */
  private updateStats(input: WorkerEventInput): void {
    const queueName = input.queueName.toLowerCase();

    // Initialize queue stats if needed
    if (!this.workerStats.byQueue[queueName]) {
      this.workerStats.byQueue[queueName] = { completed: 0, failed: 0 };
    }

    switch (input.eventType) {
      case 'completed':
        this.workerStats.completedJobs++;
        this.workerStats.byQueue[queueName].completed++;
        // Clean up progress tracker
        this.progressTracker.delete(`${queueName}:${input.job.id}`);
        // Clean up retry tracker on success
        this.retryTracker.delete(`${queueName}:${input.job.id}`);
        break;

      case 'failed':
        this.workerStats.failedJobs++;
        this.workerStats.byQueue[queueName].failed++;
        break;

      case 'progress':
        this.workerStats.progressUpdates++;
        break;

      case 'scheduled':
        this.workerStats.scheduledTriggers++;
        break;

      case 'stalled':
        this.workerStats.stalledJobs++;
        this.workerStats.byQueue[queueName].failed++;
        break;
    }
  }

  /**
   * Calculate approximate execution time from job data
   */
  private calculateExecutionTime(input: WorkerEventInput): number {
    // If job has processedOn and finishedOn, calculate difference
    const data = input.job.data;
    if (data.processedOn && data.finishedOn) {
      return (data.finishedOn as number) - (data.processedOn as number);
    }

    // Otherwise return 0 (unknown)
    return 0;
  }

  /**
   * Validate event type is one of the known types
   */
  private isValidEventType(eventType: string): eventType is WorkerEventType {
    return ['completed', 'failed', 'progress', 'scheduled', 'stalled', 'active', 'delayed', 'waiting'].includes(eventType);
  }

  /**
   * Sanitize and normalize input
   */
  private sanitizeInput(input: Partial<WorkerEventInput>): WorkerEventInput {
    return {
      eventType: input.eventType!,
      queueName: input.queueName!,
      job: {
        ...input.job!,
        id: input.job!.id || this.generateId(),
        data: input.job!.data || {},
        timestamp: input.job!.timestamp || Date.now(),
      },
      workerId: input.workerId,
      previousState: input.previousState,
    };
  }

  /**
   * Generate a unique identifier
   */
  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `worker_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Determine input type for normalization
   */
  protected override determineInputType(input: unknown): string {
    if (typeof input === 'object' && input !== null) {
      const workerInput = input as WorkerEventInput;
      return `worker:${workerInput.queueName}:${workerInput.eventType}`;
    }
    return 'worker:unknown';
  }

  /**
   * Build metadata for the normalized input
   */
  protected buildInputMetadata(input: WorkerEventInput): AgentInputMetadata {
    const relatedEntityIds: Record<string, string> = {
      jobId: input.job.id || '',
      queueName: input.queueName,
    };

    // Conditionally add optional entity IDs
    if (input.job.data.entityId) {
      relatedEntityIds.entityId = input.job.data.entityId as string;
    }
    if (input.job.data.workflowId) {
      relatedEntityIds.workflowId = input.job.data.workflowId as string;
    }

    return {
      tags: [
        'worker',
        input.queueName,
        input.eventType,
        input.job.name,
      ],
      relatedEntityIds,
    };
  }

  // ==========================================================================
  // Public API Extensions
  // ==========================================================================

  /**
   * Get extended statistics including worker-specific metrics
   */
  public getWorkerStats(): typeof this.workerStats {
    return { ...this.workerStats };
  }

  /**
   * Reset worker-specific statistics
   */
  public resetWorkerStats(): void {
    this.workerStats = {
      completedJobs: 0,
      failedJobs: 0,
      progressUpdates: 0,
      scheduledTriggers: 0,
      stalledJobs: 0,
      permanentFailures: 0,
      retriedJobs: 0,
      byQueue: {},
    };
    this.progressTracker.clear();
    this.retryTracker.clear();
  }

  /**
   * Get current retry count for a specific job
   */
  public getJobRetryCount(queueName: string, jobId: string): number {
    return this.retryTracker.get(`${queueName}:${jobId}`) ?? 0;
  }

  /**
   * Manually mark a job's progress tracker as complete
   * Useful for cleanup after jobs are processed outside normal flow
   */
  public clearJobTracking(queueName: string, jobId: string): void {
    const key = `${queueName}:${jobId}`;
    this.progressTracker.delete(key);
    this.retryTracker.delete(key);
  }

  /**
   * Add custom queue-to-event mapping at runtime
   */
  public addQueueMapping(
    queueName: string,
    eventMap: Partial<Record<WorkerEventType, AgentEventType>>
  ): void {
    this.queueEventMap[queueName.toLowerCase()] = {
      ...this.queueEventMap[queueName.toLowerCase()],
      ...eventMap,
    };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a pre-configured WorkerEventHandler
 *
 * @param config - Handler configuration
 * @returns Configured WorkerEventHandler instance
 */
export function createWorkerEventHandler(
  config: WorkerEventHandlerConfig = {}
): WorkerEventHandler {
  return new WorkerEventHandler(config);
}

