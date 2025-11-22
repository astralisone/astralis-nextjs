/**
 * Agent Logger Service
 *
 * Comprehensive structured logging for the scheduling agent system.
 * Provides persistence to database, console output with color coding,
 * and queryable log history for debugging and monitoring.
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Category-based organization
 * - Database persistence with cleanup
 * - Performance timing utilities
 * - Color-coded console output
 * - Query and filtering capabilities
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { AgentLog } from '@prisma/client';
import type { ClassificationResult } from './schedulingAgent.service';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Log levels ordered by severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Categories for organizing agent logs
 */
export type LogCategory =
  | 'intake'        // New task intake
  | 'classification' // AI classification
  | 'scheduling'    // Scheduling operations
  | 'delivery'      // Response delivery
  | 'worker'        // Background worker jobs
  | 'system';       // System operations

/**
 * Structure of a log entry
 */
export interface AgentLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  taskId?: string;
  userId?: string;
  orgId?: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  duration?: number;  // ms
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Log context for additional information
 */
export interface AgentLogContext {
  taskId?: string;
  userId?: string;
  orgId?: string;
  metadata?: Record<string, unknown>;
  duration?: number;
}

/**
 * Legacy log context for request tracking (backward compatibility)
 */
export interface LogContext {
  requestId: string;
  userId?: string;
  orgId?: string;
  route: string;
  method: string;
  startTime: number;
}

/**
 * Legacy log entry (backward compatibility)
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  route: string;
  method: string;
  message: string;
  userId?: string;
  orgId?: string;
  duration?: number;
  data?: Record<string, unknown>;
}

/**
 * Filter options for querying logs
 */
export interface LogFilters {
  level?: LogLevel;
  category?: LogCategory;
  taskId?: string;
  userId?: string;
  orgId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Timer handle for performance measurements
 */
export interface TimerHandle {
  label: string;
  startTime: number;
  taskId?: string;
  category?: LogCategory;
}

/**
 * Worker job status types
 */
export type WorkerJobStatus = 'started' | 'completed' | 'failed' | 'retrying';

/**
 * Delivery channel types
 */
export type DeliveryChannel = 'email' | 'sms' | 'webhook' | 'api' | 'chat' | 'push';

// ============================================================================
// CONSOLE COLOR CODES
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Log levels
  debug: '\x1b[90m',   // Gray
  info: '\x1b[36m',    // Cyan/Blue
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red

  // Additional colors
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
} as const;

const LEVEL_ICONS = {
  debug: '[DBG]',
  info: '[INF]',
  warn: '[WRN]',
  error: '[ERR]',
} as const;

// ============================================================================
// AGENT LOGGER SERVICE CLASS
// ============================================================================

/**
 * Agent Logger Service
 *
 * Provides comprehensive logging for all agent operations with:
 * - Database persistence for queryability
 * - Color-coded console output
 * - Performance timing
 * - Log rotation/cleanup
 * - Backward compatibility with legacy API route logging
 */
class AgentLoggerService {
  private isDevelopment: boolean;
  private logRetentionDays: number;
  private timers: Map<string, number> = new Map();

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logRetentionDays = parseInt(process.env.AGENT_LOG_RETENTION_DAYS || '30', 10);
  }

  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================

  /**
   * Generic log method - main entry point for all logging
   *
   * @param level - Log severity level
   * @param category - Log category for organization
   * @param action - Short action identifier
   * @param message - Human-readable log message
   * @param context - Additional context (taskId, userId, metadata, etc.)
   * @returns Created log entry
   *
   * @example
   * ```typescript
   * await agentLogger.log('info', 'intake', 'task.created', 'New task received from email', {
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   metadata: { source: 'gmail', subject: 'Meeting request' }
   * });
   * ```
   */
  async log(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    context?: AgentLogContext
  ): Promise<AgentLogEntry> {
    const timestamp = new Date();

    // Build the log entry
    const entry: AgentLogEntry = {
      id: '', // Will be set by database
      timestamp,
      level,
      category,
      action,
      message,
      taskId: context?.taskId,
      userId: context?.userId,
      orgId: context?.orgId,
      metadata: context?.metadata,
      duration: context?.duration,
    };

    // Output to console with colors
    this.consoleLogEntry(entry);

    // Persist to database
    try {
      const dbEntry = await prisma.agentLog.create({
        data: {
          timestamp,
          level,
          category,
          action,
          message,
          taskId: context?.taskId || null,
          userId: context?.userId || null,
          orgId: context?.orgId || null,
          metadata: context?.metadata as Prisma.InputJsonValue | undefined,
          duration: context?.duration || null,
          error: Prisma.JsonNull,
        },
      });

      entry.id = dbEntry.id;
    } catch (dbError) {
      // Log DB error to console but don't throw - logging should not break the app
      console.error('Failed to persist agent log to database:', dbError);
    }

    return entry;
  }

  // ============================================================================
  // SPECIALIZED LOGGING METHODS
  // ============================================================================

  /**
   * Log new task intake
   *
   * @param taskId - The created task ID
   * @param source - Source of the task (FORM, EMAIL, SMS, etc.)
   * @param userId - User ID who owns the task
   * @param metadata - Additional metadata about the intake
   * @returns Created log entry
   */
  async logTaskCreated(
    taskId: string,
    source: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<AgentLogEntry> {
    return this.log('info', 'intake', 'task.created', `New task created from ${source}`, {
      taskId,
      userId,
      metadata: {
        source,
        ...metadata,
      },
    });
  }

  /**
   * Log AI classification results
   *
   * @param taskId - The task ID that was classified
   * @param result - The classification result
   * @returns Created log entry
   */
  async logClassification(
    taskId: string,
    result: ClassificationResult
  ): Promise<AgentLogEntry> {
    const confidenceLabel =
      result.confidence >= 0.9 ? 'high' :
      result.confidence >= 0.7 ? 'medium' : 'low';

    return this.log('info', 'classification', 'task.classified',
      `Task classified as ${result.taskType} with ${confidenceLabel} confidence (${(result.confidence * 100).toFixed(1)}%)`,
      {
        taskId,
        duration: result.processingTimeMs,
        metadata: {
          taskType: result.taskType,
          intent: result.intent,
          priority: result.priority,
          confidence: result.confidence,
          entityCount: {
            dates: result.entities.dates?.length || 0,
            times: result.entities.times?.length || 0,
            participants: result.entities.participants?.length || 0,
            hasDuration: !!result.entities.duration?.length,
            hasSubject: !!result.entities.subject,
            hasLocation: !!result.entities.location,
          },
        },
      }
    );
  }

  /**
   * Log scheduling operations
   *
   * @param taskId - The task ID for the scheduling operation
   * @param action - The scheduling action performed
   * @param eventId - Optional event ID if an event was created/modified
   * @param metadata - Additional metadata about the operation
   * @returns Created log entry
   */
  async logSchedulingAction(
    taskId: string,
    action: string,
    eventId?: string,
    metadata?: Record<string, unknown>
  ): Promise<AgentLogEntry> {
    const actionMessages: Record<string, string> = {
      'event.created': 'Created scheduling event',
      'event.updated': 'Updated scheduling event',
      'event.cancelled': 'Cancelled scheduling event',
      'event.rescheduled': 'Rescheduled event to new time',
      'slots.proposed': 'Proposed available time slots',
      'slot.selected': 'User selected time slot',
      'conflict.detected': 'Detected scheduling conflict',
      'conflict.resolved': 'Resolved scheduling conflict',
      'availability.checked': 'Checked availability for time range',
    };

    const message = actionMessages[action] || `Scheduling action: ${action}`;

    return this.log('info', 'scheduling', action, message, {
      taskId,
      metadata: {
        eventId,
        ...metadata,
      },
    });
  }

  /**
   * Log response delivery
   *
   * @param taskId - The task ID for the delivery
   * @param channel - The delivery channel used
   * @param success - Whether delivery was successful
   * @param metadata - Additional metadata about the delivery
   * @returns Created log entry
   */
  async logDelivery(
    taskId: string,
    channel: DeliveryChannel,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<AgentLogEntry> {
    const level: LogLevel = success ? 'info' : 'error';
    const status = success ? 'succeeded' : 'failed';
    const message = `Response delivery via ${channel} ${status}`;

    return this.log(level, 'delivery', `delivery.${channel}.${status}`, message, {
      taskId,
      metadata: {
        channel,
        success,
        ...metadata,
      },
    });
  }

  /**
   * Log worker job execution
   *
   * @param jobType - Type of worker job
   * @param jobId - Unique job identifier
   * @param status - Job status (started, completed, failed, retrying)
   * @param duration - Optional job duration in ms
   * @param error - Optional error if job failed
   * @returns Created log entry
   */
  async logWorkerJob(
    jobType: string,
    jobId: string | undefined,
    status: WorkerJobStatus,
    duration?: number,
    error?: Error
  ): Promise<AgentLogEntry> {
    const level: LogLevel = status === 'failed' ? 'error' :
                           status === 'retrying' ? 'warn' : 'info';

    const resolvedJobId = jobId || 'unknown';
    const message = `Worker job ${jobType}:${resolvedJobId} ${status}` +
                   (duration ? ` in ${duration}ms` : '');

    const context: AgentLogContext = {
      duration,
      metadata: {
        jobType,
        jobId: resolvedJobId,
        status,
      },
    };

    if (error) {
      return this.logError('worker', error, context);
    }

    return this.log(level, 'worker', `job.${status}`, message, context);
  }

  /**
   * Log errors with full stack traces
   *
   * @param category - Log category
   * @param error - The error object
   * @param context - Additional context
   * @returns Created log entry
   */
  async logError(
    category: LogCategory,
    error: Error | unknown,
    context?: AgentLogContext
  ): Promise<AgentLogEntry> {
    const timestamp = new Date();
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const errorData = {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
    };

    // Build the log entry
    const entry: AgentLogEntry = {
      id: '',
      timestamp,
      level: 'error',
      category,
      action: 'error',
      message: errorObj.message,
      taskId: context?.taskId,
      userId: context?.userId,
      orgId: context?.orgId,
      metadata: context?.metadata,
      duration: context?.duration,
      error: errorData,
    };

    // Output to console with colors
    this.consoleLogEntry(entry);

    // Persist to database
    try {
      const dbEntry = await prisma.agentLog.create({
        data: {
          timestamp,
          level: 'error',
          category,
          action: 'error',
          message: errorObj.message,
          taskId: context?.taskId || null,
          userId: context?.userId || null,
          orgId: context?.orgId || null,
          metadata: context?.metadata as Prisma.InputJsonValue | undefined,
          duration: context?.duration || null,
          error: errorData as Prisma.InputJsonValue,
        },
      });

      entry.id = dbEntry.id;
    } catch (dbError) {
      console.error('Failed to persist error log to database:', dbError);
    }

    return entry;
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get logs with filters
   *
   * @param filters - Filter criteria for logs
   * @returns Array of matching log entries
   */
  async getLogs(filters: LogFilters = {}): Promise<AgentLogEntry[]> {
    const {
      level,
      category,
      taskId,
      userId,
      orgId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    try {
      const where: Prisma.AgentLogWhereInput = {};

      if (level) where.level = level;
      if (category) where.category = category;
      if (taskId) where.taskId = taskId;
      if (userId) where.userId = userId;
      if (orgId) where.orgId = orgId;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      const logs = await prisma.agentLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      return logs.map(this.mapDbLogToEntry);
    } catch (error) {
      console.error('Failed to query agent logs:', error);
      throw new Error(`Failed to query logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get complete timeline of all logs for a specific task
   *
   * @param taskId - The task ID to get timeline for
   * @returns Array of log entries in chronological order
   */
  async getTaskTimeline(taskId: string): Promise<AgentLogEntry[]> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }

    try {
      const logs = await prisma.agentLog.findMany({
        where: { taskId },
        orderBy: { timestamp: 'asc' },
      });

      return logs.map(this.mapDbLogToEntry);
    } catch (error) {
      console.error('Failed to get task timeline:', error);
      throw new Error(`Failed to get task timeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // PERFORMANCE TIMING
  // ============================================================================

  /**
   * Start a performance timer
   *
   * @param label - Label for the timer
   * @param taskId - Optional task ID to associate with the timer
   * @param category - Optional category for logging when timer ends
   * @returns Timer handle to pass to endTimer
   */
  startTimer(label: string, taskId?: string, category?: LogCategory): TimerHandle {
    return {
      label,
      startTime: Date.now(),
      taskId,
      category,
    };
  }

  /**
   * End a performance timer and get the duration
   *
   * @param handle - The timer handle from startTimer
   * @returns Duration in milliseconds
   */
  endTimer(handle: TimerHandle): number {
    const duration = Date.now() - handle.startTime;

    // Log the timing in debug if category was provided
    if (handle.category) {
      this.log(
        'debug',
        handle.category,
        'timer.completed',
        `Timer "${handle.label}" completed in ${duration}ms`,
        {
          taskId: handle.taskId,
          duration,
          metadata: { label: handle.label },
        }
      );
    }

    return duration;
  }

  // ============================================================================
  // CLEANUP METHODS
  // ============================================================================

  /**
   * Delete logs older than retention period
   *
   * @param daysToKeep - Number of days to keep (default: 30)
   * @returns Number of deleted records
   */
  async cleanupOldLogs(daysToKeep: number = this.logRetentionDays): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const result = await prisma.agentLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`Agent logs cleanup: Deleted ${result.count} entries older than ${daysToKeep} days`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      throw new Error(`Failed to cleanup logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Output log to console with color coding
   * @private
   */
  private consoleLogEntry(entry: AgentLogEntry): void {
    const color = COLORS[entry.level];
    const icon = LEVEL_ICONS[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const category = entry.category.toUpperCase().padEnd(14);
    const action = entry.action.padEnd(25);

    // Build the main log line
    let logLine = `${color}${icon}${COLORS.reset} `;
    logLine += `${COLORS.dim}${timestamp}${COLORS.reset} `;
    logLine += `${COLORS.magenta}[${category}]${COLORS.reset} `;
    logLine += `${color}${action}${COLORS.reset} `;
    logLine += entry.message;

    // Add task ID if present
    if (entry.taskId) {
      logLine += ` ${COLORS.dim}(task:${entry.taskId})${COLORS.reset}`;
    }

    // Add duration if present
    if (entry.duration) {
      logLine += ` ${COLORS.green}[${entry.duration}ms]${COLORS.reset}`;
    }

    console.log(logLine);

    // Pretty print metadata in development
    if (this.isDevelopment && entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log(`${COLORS.dim}    metadata:${COLORS.reset}`, JSON.stringify(entry.metadata, null, 2));
    }

    // Print error stack in development
    if (entry.error?.stack && this.isDevelopment) {
      console.log(`${COLORS.error}    stack:${COLORS.reset}\n${entry.error.stack}`);
    }
  }

  /**
   * Map database AgentLog to AgentLogEntry
   * @private
   */
  private mapDbLogToEntry(dbLog: AgentLog): AgentLogEntry {
    return {
      id: dbLog.id,
      timestamp: dbLog.timestamp,
      level: dbLog.level as LogLevel,
      category: dbLog.category as LogCategory,
      taskId: dbLog.taskId || undefined,
      userId: dbLog.userId || undefined,
      orgId: dbLog.orgId || undefined,
      action: dbLog.action,
      message: dbLog.message,
      metadata: dbLog.metadata as Record<string, unknown> | undefined,
      duration: dbLog.duration || undefined,
      error: dbLog.error as AgentLogEntry['error'] | undefined,
    };
  }

  // ============================================================================
  // LEGACY API ROUTE LOGGING (Backward Compatibility)
  // ============================================================================

  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      `[${entry.requestId.substring(0, 8)}]`,
      `[${entry.route}]`,
      entry.message,
    ];

    if (entry.userId) {
      parts.push(`userId=${entry.userId}`);
    }

    if (entry.duration !== undefined) {
      parts.push(`duration=${entry.duration}ms`);
    }

    return parts.join(' ');
  }

  private legacyLog(
    level: LogLevel,
    context: LogContext,
    message: string,
    data?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: context.requestId,
      route: context.route,
      method: context.method,
      message,
      userId: context.userId,
      orgId: context.orgId,
      duration: Date.now() - context.startTime,
      data,
    };

    const formattedMessage = this.formatLogEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data ? JSON.stringify(data) : '');
        break;
      case 'info':
        console.log(formattedMessage, data ? JSON.stringify(data) : '');
        break;
      case 'warn':
        console.warn(formattedMessage, data ? JSON.stringify(data) : '');
        break;
      case 'error':
        console.error(formattedMessage, data ? JSON.stringify(data) : '');
        break;
    }
  }

  /**
   * Create a new logging context for a request
   */
  createContext(route: string, method: string): LogContext {
    return {
      requestId: randomUUID(),
      route,
      method,
      startTime: Date.now(),
    };
  }

  /**
   * Update context with user information
   */
  setUser(context: LogContext, userId: string, orgId?: string): void {
    context.userId = userId;
    if (orgId) {
      context.orgId = orgId;
    }
  }

  /**
   * Log debug level message (legacy)
   */
  debug(context: LogContext, message: string, data?: Record<string, unknown>): void {
    this.legacyLog('debug', context, message, data);
  }

  /**
   * Log info level message (legacy)
   */
  info(context: LogContext, message: string, data?: Record<string, unknown>): void {
    this.legacyLog('info', context, message, data);
  }

  /**
   * Log warning level message (legacy)
   */
  warn(context: LogContext, message: string, data?: Record<string, unknown>): void {
    this.legacyLog('warn', context, message, data);
  }

  /**
   * Log error level message (legacy)
   */
  error(context: LogContext, message: string, data?: Record<string, unknown>): void {
    this.legacyLog('error', context, message, data);
  }

  /**
   * Log request received
   */
  requestReceived(
    context: LogContext,
    details: {
      source?: string;
      hasAuth?: boolean;
      contentType?: string;
      ip?: string;
    }
  ): void {
    this.info(context, 'Request received', details);
  }

  /**
   * Log validation error
   */
  validationError(
    context: LogContext,
    errors: Record<string, string[]> | string
  ): void {
    this.warn(context, 'Validation failed', {
      errors: typeof errors === 'string' ? { _: [errors] } : errors,
    });
  }

  /**
   * Log authorization failure
   */
  authorizationFailed(context: LogContext, reason: string): void {
    this.warn(context, 'Authorization failed', { reason });
  }

  /**
   * Log rate limit exceeded
   */
  rateLimitExceeded(context: LogContext, identifier: string): void {
    this.warn(context, 'Rate limit exceeded', { identifier });
  }

  /**
   * Log task created (legacy)
   */
  taskCreated(
    context: LogContext,
    taskId: string,
    details?: {
      source?: string;
      priority?: number;
      taskType?: string;
    }
  ): void {
    this.info(context, 'Task created', { taskId, ...details });
  }

  /**
   * Log task updated
   */
  taskUpdated(
    context: LogContext,
    taskId: string,
    changes?: Record<string, unknown>
  ): void {
    this.info(context, 'Task updated', { taskId, changes });
  }

  /**
   * Log task deleted
   */
  taskDeleted(context: LogContext, taskId: string): void {
    this.info(context, 'Task deleted', { taskId });
  }

  /**
   * Log task not found
   */
  taskNotFound(context: LogContext, taskId: string): void {
    this.warn(context, 'Task not found', { taskId });
  }

  /**
   * Log task fetched
   */
  taskFetched(context: LogContext, taskId: string): void {
    this.info(context, 'Task fetched', { taskId });
  }

  /**
   * Log queue job added
   */
  queueJobAdded(
    context: LogContext,
    jobId: string,
    queue: 'standard' | 'urgent'
  ): void {
    this.info(context, 'Queue job added', { jobId, queue });
  }

  /**
   * Log queue job failed
   */
  queueJobFailed(context: LogContext, taskId: string, error: string): void {
    this.error(context, 'Failed to queue task', { taskId, error });
  }

  /**
   * Log request completed with summary
   */
  requestCompleted(
    context: LogContext,
    status: number,
    summary?: string
  ): void {
    const duration = Date.now() - context.startTime;
    this.info(context, `Request completed: ${status}`, {
      status,
      duration,
      summary,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Mask phone number for logging (show last 4 digits)
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length < 4) {
      return '****';
    }
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  }

  /**
   * Mask email for logging (show first 2 chars + domain)
   */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    const maskedLocal = local.length > 2 ? local.substring(0, 2) + '***' : '***';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Truncate string for preview
   */
  truncate(str: string, maxLength: number = 50): string {
    if (!str || str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength) + '...';
  }

  /**
   * Format duration in human-readable form
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  // ============================================================================
  // WORKER-SPECIFIC CONSOLE LOGGING (for high-frequency operations)
  // ============================================================================

  /**
   * Log worker startup
   */
  logWorkerStartup(workerName: string, concurrency: number): void {
    console.log(`[Workers] ${workerName} worker started (concurrency: ${concurrency})`);
  }

  /**
   * Log worker shutdown
   */
  logWorkerShutdown(workerName: string): void {
    console.log(`[Workers] ${workerName} worker stopped`);
  }

  /**
   * Log scheduler lifecycle
   */
  logSchedulerLifecycle(action: 'started' | 'stopped', jobsAdded?: string[]): void {
    const prefix = '[Scheduler]';
    if (action === 'started') {
      console.log(`${prefix} Scheduler started successfully`);
      if (jobsAdded && jobsAdded.length > 0) {
        jobsAdded.forEach(job => {
          console.log(`${prefix}   - ${job}`);
        });
      }
    } else {
      console.log(`${prefix} Scheduler stopped`);
    }
  }

  /**
   * Log classification events (console only for speed)
   */
  logClassificationEvent(
    jobId: string | undefined,
    taskId: string,
    status: 'started' | 'completed' | 'failed',
    result?: { taskType?: string; confidence?: number; duration?: number }
  ): void {
    const prefix = '[SchedulingAgent:Classification]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    if (status === 'started') {
      console.log(`${prefix}${jobIdStr}${taskIdStr} Classification started`);
    } else if (status === 'completed' && result) {
      const durationStr = result.duration ? ` (${this.formatDuration(result.duration)})` : '';
      console.log(
        `${prefix}${jobIdStr}${taskIdStr} Classification completed${durationStr} | ` +
        `type=${result.taskType || 'UNKNOWN'} confidence=${result.confidence?.toFixed(2) || '0.00'}`
      );
    } else if (status === 'failed') {
      console.error(`${prefix}${jobIdStr}${taskIdStr} Classification failed`);
    }
  }

  /**
   * Log conflict check (console only for speed)
   */
  logConflictCheck(
    jobId: string | undefined,
    taskId: string,
    hasConflict: boolean,
    conflictCount?: number,
    alternativeCount?: number
  ): void {
    const prefix = '[SchedulingAgent:ConflictCheck]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    if (hasConflict) {
      console.log(
        `${prefix}${jobIdStr}${taskIdStr} Conflicts detected: ${conflictCount || 0} conflicts, ` +
        `${alternativeCount || 0} alternatives available`
      );
    } else {
      console.log(`${prefix}${jobIdStr}${taskIdStr} No conflicts detected`);
    }
  }

  /**
   * Log event creation (console only)
   */
  logEventCreation(
    jobId: string | undefined,
    taskId: string,
    eventId: string,
    title: string
  ): void {
    const prefix = '[SchedulingAgent:EventCreation]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    console.log(
      `${prefix}${jobIdStr}${taskIdStr} Event created [event:${eventId}] | title="${this.truncate(title, 50)}"`
    );
  }

  /**
   * Log response delivery (console only)
   */
  logResponseDelivery(
    jobId: string | undefined,
    taskId: string,
    responseType: string,
    channel: string,
    success: boolean,
    messageId?: string,
    error?: string
  ): void {
    const prefix = '[SchedulingAgent:ResponseDelivery]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    if (success) {
      const msgIdStr = messageId ? ` [msgId:${messageId}]` : '';
      console.log(
        `${prefix}${jobIdStr}${taskIdStr} Response delivered${msgIdStr} | ` +
        `type=${responseType} channel=${channel}`
      );
    } else {
      console.error(
        `${prefix}${jobIdStr}${taskIdStr} Response delivery failed | ` +
        `type=${responseType} channel=${channel} error="${this.truncate(error || 'Unknown', 100)}"`
      );
    }
  }

  /**
   * Log reminder processing
   */
  logReminderProcessing(
    jobId: string | undefined,
    eventId: string,
    reminderId: string | undefined,
    status: 'started' | 'skipped' | 'sent' | 'failed',
    reason?: string
  ): void {
    const prefix = '[SchedulingAgent:Reminder]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const eventIdStr = ` [event:${eventId}]`;
    const reminderIdStr = reminderId ? ` [reminder:${reminderId}]` : '';

    switch (status) {
      case 'started':
        console.log(`${prefix}${jobIdStr}${eventIdStr}${reminderIdStr} Processing reminder`);
        break;
      case 'skipped':
        console.log(`${prefix}${jobIdStr}${eventIdStr}${reminderIdStr} Reminder skipped | reason="${reason || 'Unknown'}"`);
        break;
      case 'sent':
        console.log(`${prefix}${jobIdStr}${eventIdStr}${reminderIdStr} Reminder sent successfully`);
        break;
      case 'failed':
        console.error(`${prefix}${jobIdStr}${eventIdStr}${reminderIdStr} Reminder failed | error="${this.truncate(reason || 'Unknown', 100)}"`);
        break;
    }
  }

  /**
   * Log worker generic info
   */
  logWorkerInfo(component: string, message: string, data?: Record<string, unknown>): void {
    const prefix = `[${component}]`;
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    console.log(`${prefix} ${message}${dataStr}`);
  }

  /**
   * Log worker generic error
   */
  logWorkerError(component: string, message: string, error?: unknown, data?: Record<string, unknown>): void {
    const prefix = `[${component}]`;
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    const errorStr = error instanceof Error ? ` | ${error.message}` : '';
    console.error(`${prefix} ${message}${errorStr}${dataStr}`);
  }

  // ============================================================================
  // ADDITIONAL LEGACY METHODS (for backward compatibility with existing code)
  // ============================================================================

  /**
   * Log signature validation result
   */
  signatureValidation(context: LogContext, valid: boolean, type: string): void {
    if (valid) {
      this.info(context, 'Signature validated', { type });
    } else {
      this.warn(context, 'Invalid signature', { type });
    }
  }

  /**
   * Log email received
   */
  emailReceived(
    context: LogContext,
    details: {
      fromDomain?: string | null;
      subjectPreview?: string;
      hasAttachments?: boolean;
    }
  ): void {
    this.info(context, 'Email received', details);
  }

  /**
   * Log spam detection
   */
  spamDetected(context: LogContext, reason: string): void {
    this.warn(context, 'Spam detected', { reason });
  }

  /**
   * Log email thread detection
   */
  threadDetected(context: LogContext, existingTaskId: string): void {
    this.info(context, 'Thread reply detected', { existingTaskId });
  }

  /**
   * Log form submission
   */
  formSubmission(
    context: LogContext,
    details: {
      formType: string;
      source?: string;
      hasRecaptcha?: boolean;
    }
  ): void {
    this.info(context, 'Form submission received', details);
  }

  /**
   * Log bot detection result
   */
  botDetection(
    context: LogContext,
    detected: boolean,
    method: 'honeypot' | 'timing' | 'recaptcha'
  ): void {
    if (detected) {
      this.warn(context, 'Bot detected', { method });
    } else {
      this.debug(context, 'Bot check passed', { method });
    }
  }

  /**
   * Log reCAPTCHA result
   */
  recaptchaResult(
    context: LogContext,
    success: boolean,
    score?: number
  ): void {
    if (success) {
      this.info(context, 'reCAPTCHA verified', { score });
    } else {
      this.warn(context, 'reCAPTCHA failed', { score });
    }
  }

  /**
   * Log entity extraction
   */
  entityExtraction(
    context: LogContext,
    entities: string[]
  ): void {
    this.info(context, 'Entities extracted', { entities, count: entities.length });
  }

  /**
   * Log SMS received
   */
  smsReceived(
    context: LogContext,
    details: {
      fromMasked: string;
      hasMedia?: boolean;
      isQuickReply?: boolean;
    }
  ): void {
    this.info(context, 'SMS received', details);
  }

  /**
   * Log quick reply detection
   */
  quickReplyDetected(
    context: LogContext,
    replyType: string,
    pendingTaskId?: string
  ): void {
    this.info(context, 'Quick reply detected', { replyType, pendingTaskId });
  }

  /**
   * Log user lookup result
   */
  userLookupResult(
    context: LogContext,
    found: boolean,
    method: 'email' | 'phone' | 'session' | 'system'
  ): void {
    this.info(context, 'User lookup completed', { found, method });
  }

  // ============================================================================
  // AI SCHEDULING SERVICE LOGGING METHODS
  // ============================================================================

  /**
   * Log slot finding operation start
   */
  logSlotFindingStart(userId: string, duration: number, startDate: Date, endDate: Date): string {
    const timerId = `findAvailableSlots-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.timers.set(timerId, Date.now());
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] [DEBUG] [AIScheduling] Slot finding started userId=${userId} ` +
      `duration=${duration}min range=${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`
    );
    return timerId;
  }

  /**
   * Log slot finding operation result
   */
  logSlotFindingResult(timerId: string, resultCount: number): void {
    const startTime = this.timers.get(timerId);
    const durationMs = startTime ? Date.now() - startTime : undefined;
    this.timers.delete(timerId);
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] [DEBUG] [AIScheduling] Slot finding complete ` +
      `resultCount=${resultCount}${durationMs ? ` duration=${durationMs}ms` : ''}`
    );
  }

  /**
   * Log conflict detection result
   */
  logConflictDetection(data: {
    userId: string;
    startTime: string;
    endTime: string;
    conflictFound: boolean;
    conflictCount?: number;
    alternativesCount?: number;
  }): void {
    const timestamp = new Date().toISOString();
    const level = data.conflictFound ? 'INFO' : 'DEBUG';
    const logMethod = data.conflictFound ? console.info : console.debug;
    logMethod(
      `[${timestamp}] [${level}] [AIScheduling] Conflict check userId=${data.userId} ` +
      `${data.conflictFound ? `conflictFound=true count=${data.conflictCount || 0}` : 'conflictFound=false'}` +
      `${data.alternativesCount ? ` alternatives=${data.alternativesCount}` : ''}`
    );
  }

  /**
   * Log overbooking detection
   */
  logOverbooking(userId: string, date: Date, utilizationPercent: number, isOverbooked: boolean): void {
    const timestamp = new Date().toISOString();
    const level = isOverbooked ? 'WARN' : 'DEBUG';
    const logMethod = isOverbooked ? console.warn : console.debug;
    logMethod(
      `[${timestamp}] [${level}] [AIScheduling] Overbooking check userId=${userId} ` +
      `date=${date.toISOString().slice(0, 10)} utilization=${utilizationPercent}% ` +
      `isOverbooked=${isOverbooked}`
    );
  }

  /**
   * Log alternative suggestions
   */
  logAlternativeSuggestions(conflictingSlotTime: string, alternativeCount: number): void {
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] [DEBUG] [AIScheduling] Generated alternatives ` +
      `conflictTime=${conflictingSlotTime} count=${alternativeCount}`
    );
  }

  // ============================================================================
  // RESPONSE SERVICE LOGGING METHODS
  // ============================================================================

  /**
   * Log response generation
   */
  logResponseGeneration(data: {
    taskId?: string;
    eventId?: string;
    responseType: string;
    channel: string;
    hasAttachments?: boolean;
    durationMs?: number;
  }): void {
    const timestamp = new Date().toISOString();
    const id = data.taskId ? `taskId=${data.taskId.slice(0, 8)}` :
               data.eventId ? `eventId=${data.eventId.slice(0, 8)}` : '';
    console.debug(
      `[${timestamp}] [DEBUG] [ResponseService] Response generated ${id} ` +
      `type=${data.responseType} channel=${data.channel}` +
      `${data.hasAttachments ? ' hasAttachments=true' : ''}` +
      `${data.durationMs ? ` duration=${data.durationMs}ms` : ''}`
    );
  }

  /**
   * Log template rendering
   */
  logTemplateRendering(responseType: string, channel: string): void {
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] [DEBUG] [ResponseService] Template rendered type=${responseType} channel=${channel}`
    );
  }

  /**
   * Log ICS generation
   */
  logIcsGeneration(eventId: string, success: boolean, error?: string): void {
    const timestamp = new Date().toISOString();
    if (success) {
      console.debug(
        `[${timestamp}] [DEBUG] [ResponseService] ICS generated eventId=${eventId.slice(0, 8)}`
      );
    } else {
      console.warn(
        `[${timestamp}] [WARN] [ResponseService] ICS generation failed eventId=${eventId.slice(0, 8)} error="${error}"`
      );
    }
  }

  // ============================================================================
  // DELIVERY SERVICE LOGGING METHODS
  // ============================================================================

  /**
   * Log delivery attempt start
   */
  logDeliveryAttempt(taskId: string, channel: string, recipientMasked: string): string {
    const timerId = `delivery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.timers.set(timerId, Date.now());
    const timestamp = new Date().toISOString();
    console.info(
      `[${timestamp}] [INFO] [DeliveryService] Delivery started taskId=${taskId.slice(0, 8)} ` +
      `channel=${channel} recipient=${recipientMasked}`
    );
    return timerId;
  }

  /**
   * Log delivery success
   */
  logDeliverySuccess(timerId: string, channel: string, messageId?: string): void {
    const startTime = this.timers.get(timerId);
    const durationMs = startTime ? Date.now() - startTime : undefined;
    this.timers.delete(timerId);
    const timestamp = new Date().toISOString();
    console.info(
      `[${timestamp}] [INFO] [DeliveryService] Delivery successful channel=${channel}` +
      `${messageId ? ` messageId=${this.truncate(messageId, 20)}` : ''}` +
      `${durationMs ? ` duration=${durationMs}ms` : ''}`
    );
  }

  /**
   * Log delivery failure
   */
  logDeliveryFailure(timerId: string | null, channel: string, error: string): void {
    let durationMs: number | undefined;
    if (timerId) {
      const startTime = this.timers.get(timerId);
      durationMs = startTime ? Date.now() - startTime : undefined;
      this.timers.delete(timerId);
    }
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [ERROR] [DeliveryService] Delivery failed channel=${channel} ` +
      `error="${error}"${durationMs ? ` duration=${durationMs}ms` : ''}`
    );
  }

  /**
   * Log fallback attempt
   */
  logFallbackAttempt(failedChannel: string, fallbackChannel: string): void {
    const timestamp = new Date().toISOString();
    console.warn(
      `[${timestamp}] [WARN] [DeliveryService] Fallback attempt failedChannel=${failedChannel} ` +
      `fallbackChannel=${fallbackChannel}`
    );
  }

  // ============================================================================
  // SCHEDULING AGENT SERVICE LOGGING METHODS
  // ============================================================================

  /**
   * Log task completion
   */
  logTaskCompleted(taskId: string, resolution: string, durationMs?: number): void {
    const timestamp = new Date().toISOString();
    console.info(
      `[${timestamp}] [INFO] [SchedulingAgent] Task completed taskId=${taskId.slice(0, 8)} ` +
      `resolution="${this.truncate(resolution, 50)}"${durationMs ? ` duration=${durationMs}ms` : ''}`
    );
  }

  /**
   * Log task failure
   */
  logTaskFailed(taskId: string, error: string, retryCount?: number): void {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [ERROR] [SchedulingAgent] Task failed taskId=${taskId.slice(0, 8)} ` +
      `error="${error}"${retryCount !== undefined ? ` retryCount=${retryCount}` : ''}`
    );
  }

  // ============================================================================
  // WORKER PROCESSOR LOGGING METHODS
  // ============================================================================

  /**
   * Log task linked to event
   */
  logTaskLinkedToEvent(
    jobId: string | undefined,
    taskId: string,
    eventId: string
  ): void {
    const prefix = '[SchedulingAgent:TaskLink]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    console.log(`${prefix}${jobIdStr}${taskIdStr} Task linked to event [event:${eventId}]`);
  }

  /**
   * Log alternatives sent to user
   */
  logAlternativesSent(
    jobId: string | undefined,
    taskId: string,
    alternativeCount: number,
    conflictCount: number
  ): void {
    const prefix = '[SchedulingAgent:Alternatives]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    console.log(
      `${prefix}${jobIdStr}${taskIdStr} Alternatives queued | ` +
      `conflicts=${conflictCount} alternatives=${alternativeCount}`
    );
  }

  /**
   * Log next action queued
   */
  logNextActionQueued(
    jobId: string | undefined,
    taskId: string,
    nextAction: string,
    targetJobType?: string
  ): void {
    const prefix = '[SchedulingAgent:NextAction]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;
    const targetStr = targetJobType ? ` -> ${targetJobType}` : '';

    console.log(`${prefix}${jobIdStr}${taskIdStr} Action queued: ${nextAction}${targetStr}`);
  }

  /**
   * Log reminder status updated in database
   */
  logReminderStatusUpdated(
    jobId: string | undefined,
    reminderId: string,
    status: string
  ): void {
    const prefix = '[SchedulingAgent:Reminder]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    console.log(`${prefix}${jobIdStr} [reminder:${reminderId}] Status updated to ${status}`);
  }

  /**
   * Log followup processing
   */
  logFollowupProcessing(
    jobId: string | undefined,
    taskId: string,
    responseType: string,
    action: string,
    contentPreview?: string
  ): void {
    const prefix = '[SchedulingAgent:Followup]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;
    const contentStr = contentPreview ? ` | content="${this.truncate(contentPreview, 50)}"` : '';

    console.log(
      `${prefix}${jobIdStr}${taskIdStr} Followup processed | ` +
      `responseType=${responseType} action=${action}${contentStr}`
    );
  }

  /**
   * Log followup classification result
   */
  logFollowupClassification(
    jobId: string | undefined,
    taskId: string,
    responseType: string,
    confidence: number
  ): void {
    const prefix = '[SchedulingAgent:Followup]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const taskIdStr = ` [task:${taskId}]`;

    console.log(
      `${prefix}${jobIdStr}${taskIdStr} AI classification result | ` +
      `responseType=${responseType} confidence=${confidence.toFixed(2)}`
    );
  }

  // ============================================================================
  // SUGGEST API ROUTE LOGGING METHODS
  // ============================================================================

  /**
   * Log suggestion request
   */
  suggestionRequest(
    context: LogContext,
    details: {
      duration: number;
      preferredTime?: string;
      participantCount?: number;
    }
  ): void {
    this.info(context, 'Suggestion request', details);
  }

  /**
   * Log slots found
   */
  slotsFound(context: LogContext, count: number): void {
    this.info(context, 'Time slots generated', { count });
  }

  /**
   * Log overbooking warning
   */
  overbookingWarning(
    context: LogContext,
    details: {
      eventCount: number;
      hoursBooked: number;
      percentageBooked: number;
    }
  ): void {
    this.warn(context, 'Overbooking detected', details);
  }

  // ============================================================================
  // SCHEDULER LOGGING METHODS
  // ============================================================================

  /**
   * Log scheduler job execution
   */
  logSchedulerJob(
    jobType: string,
    jobId: string | undefined,
    status: 'started' | 'completed' | 'failed',
    result?: Record<string, unknown>,
    duration?: number
  ): void {
    const prefix = `[Scheduler:${jobType}]`;
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    const durationStr = duration ? ` (${this.formatDuration(duration)})` : '';

    switch (status) {
      case 'started':
        console.log(`${prefix}${jobIdStr} Job started`);
        break;
      case 'completed':
        const resultStr = result ? ` | ${JSON.stringify(result)}` : '';
        console.log(`${prefix}${jobIdStr} Job completed${durationStr}${resultStr}`);
        break;
      case 'failed':
        console.error(`${prefix}${jobIdStr} Job failed${durationStr}`);
        break;
    }
  }

  /**
   * Log scheduler reminders dispatched
   */
  logRemindersDispatched(
    jobId: string | undefined,
    processedCount: number,
    queuedCount: number,
    duration: number
  ): void {
    const prefix = '[Scheduler:Reminders]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    console.log(
      `${prefix}${jobIdStr} Reminders dispatched | ` +
      `processed=${processedCount} queued=${queuedCount} duration=${this.formatDuration(duration)}`
    );
  }

  /**
   * Log scheduler stale tasks cleaned
   */
  logStaleTasksCleaned(
    jobId: string | undefined,
    markedCount: number,
    retriedCount: number,
    duration: number
  ): void {
    const prefix = '[Scheduler:Cleanup]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    console.log(
      `${prefix}${jobIdStr} Stale tasks cleaned | ` +
      `marked=${markedCount} retried=${retriedCount} duration=${this.formatDuration(duration)}`
    );
  }

  /**
   * Log scheduler statistics aggregated
   */
  logStatsAggregated(
    jobId: string | undefined,
    stats: {
      totalTasks: number;
      pendingCount: number;
      failedCount: number;
      pendingReminders: number;
    },
    duration: number
  ): void {
    const prefix = '[Scheduler:Stats]';
    const jobIdStr = jobId ? ` [job:${jobId}]` : '';
    console.log(
      `${prefix}${jobIdStr} Statistics aggregated | ` +
      `total=${stats.totalTasks} pending=${stats.pendingCount} failed=${stats.failedCount} ` +
      `pendingReminders=${stats.pendingReminders} duration=${this.formatDuration(duration)}`
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of AgentLoggerService
 */
export const agentLogger = new AgentLoggerService();

/**
 * Export the class for testing or custom instantiation
 */
export { AgentLoggerService };
