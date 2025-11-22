/**
 * Agent Log Service
 *
 * In-memory logging service for agent operations.
 * Provides structured logging with retention policies and query capabilities.
 *
 * Note: In production, this should be backed by a persistent store (Redis, database, etc.)
 */

import { randomUUID } from 'crypto';
import type {
  AgentLogEntry,
  AgentLogLevel,
  AgentLogCategory,
  AgentLogFilters,
  CreateAgentLogInput,
} from '@/types/agent-logs';

/**
 * Maximum number of logs to retain in memory
 */
const MAX_LOG_ENTRIES = 10000;

/**
 * Default retention period in days
 */
const DEFAULT_RETENTION_DAYS = 30;

/**
 * In-memory log storage
 */
let logStore: AgentLogEntry[] = [];

/**
 * Agent Log Service
 *
 * Provides methods for creating, querying, and managing agent logs.
 */
class AgentLogService {
  /**
   * Create a new log entry
   *
   * @param input - Log entry creation parameters
   * @returns The created log entry
   *
   * @example
   * ```typescript
   * const log = agentLogService.log({
   *   level: 'info',
   *   category: 'intake',
   *   action: 'task.created',
   *   message: 'New task created from email source',
   *   taskId: 'task-123',
   *   userId: 'user-456',
   * });
   * ```
   */
  log(input: CreateAgentLogInput): AgentLogEntry {
    const entry: AgentLogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level: input.level,
      category: input.category,
      action: input.action,
      message: input.message,
      taskId: input.taskId,
      userId: input.userId,
      orgId: input.orgId,
      duration: input.duration,
      metadata: input.metadata,
    };

    // Add error details if provided
    if (input.error) {
      entry.error = {
        name: input.error.name,
        message: input.error.message,
        stack: input.error.stack,
      };
    }

    // Add to store
    logStore.push(entry);

    // Enforce max entries limit
    if (logStore.length > MAX_LOG_ENTRIES) {
      logStore = logStore.slice(-MAX_LOG_ENTRIES);
    }

    // Console output for debugging (can be disabled in production)
    this.consoleLog(entry);

    return entry;
  }

  /**
   * Log a debug message
   */
  debug(
    category: AgentLogCategory,
    action: string,
    message: string,
    context?: Partial<Omit<CreateAgentLogInput, 'level' | 'category' | 'action' | 'message'>>
  ): AgentLogEntry {
    return this.log({
      level: 'debug',
      category,
      action,
      message,
      ...context,
    });
  }

  /**
   * Log an info message
   */
  info(
    category: AgentLogCategory,
    action: string,
    message: string,
    context?: Partial<Omit<CreateAgentLogInput, 'level' | 'category' | 'action' | 'message'>>
  ): AgentLogEntry {
    return this.log({
      level: 'info',
      category,
      action,
      message,
      ...context,
    });
  }

  /**
   * Log a warning message
   */
  warn(
    category: AgentLogCategory,
    action: string,
    message: string,
    context?: Partial<Omit<CreateAgentLogInput, 'level' | 'category' | 'action' | 'message'>>
  ): AgentLogEntry {
    return this.log({
      level: 'warn',
      category,
      action,
      message,
      ...context,
    });
  }

  /**
   * Log an error message
   */
  error(
    category: AgentLogCategory,
    action: string,
    message: string,
    error?: Error,
    context?: Partial<Omit<CreateAgentLogInput, 'level' | 'category' | 'action' | 'message' | 'error'>>
  ): AgentLogEntry {
    return this.log({
      level: 'error',
      category,
      action,
      message,
      error,
      ...context,
    });
  }

  /**
   * Query logs with filters
   *
   * @param filters - Query filters
   * @returns Object containing filtered logs and total count
   *
   * @example
   * ```typescript
   * const { logs, total } = agentLogService.query({
   *   level: 'error',
   *   category: 'worker',
   *   limit: 50,
   *   offset: 0,
   * });
   * ```
   */
  query(filters: AgentLogFilters = {}): { logs: AgentLogEntry[]; total: number } {
    const {
      level,
      category,
      taskId,
      userId,
      orgId,
      startDate,
      endDate,
      action,
      limit = 100,
      offset = 0,
    } = filters;

    let filtered = [...logStore];

    // Apply filters
    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (category) {
      filtered = filtered.filter((log) => log.category === category);
    }

    if (taskId) {
      filtered = filtered.filter((log) => log.taskId === taskId);
    }

    if (userId) {
      filtered = filtered.filter((log) => log.userId === userId);
    }

    if (orgId) {
      filtered = filtered.filter((log) => log.orgId === orgId);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) <= end);
    }

    if (action) {
      const actionLower = action.toLowerCase();
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(actionLower)
      );
    }

    // Sort by timestamp descending (most recent first)
    filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = filtered.length;

    // Apply pagination
    const paginated = filtered.slice(offset, offset + limit);

    return { logs: paginated, total };
  }

  /**
   * Get timeline for a specific task
   *
   * @param taskId - The task ID to get timeline for
   * @returns Array of log entries for the task, ordered by timestamp
   */
  getTaskTimeline(taskId: string): AgentLogEntry[] {
    return logStore
      .filter((log) => log.taskId === taskId)
      .sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }

  /**
   * Get log statistics
   *
   * @param periodHours - Period in hours to calculate stats for (default: 24)
   * @returns Statistics object
   */
  getStats(periodHours: number = 24): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    errorRate: number;
    avgDuration: number;
    period: { start: string; end: string };
  } {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodHours * 60 * 60 * 1000);

    // Filter logs within period
    const periodLogs = logStore.filter(
      (log) => new Date(log.timestamp) >= periodStart
    );

    // Calculate by level
    const byLevel: Record<string, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };
    for (const log of periodLogs) {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    }

    // Calculate by category
    const byCategory: Record<string, number> = {
      intake: 0,
      classification: 0,
      scheduling: 0,
      delivery: 0,
      worker: 0,
      system: 0,
    };
    for (const log of periodLogs) {
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    }

    // Calculate error rate
    const total = periodLogs.length;
    const errorCount = byLevel.error;
    const errorRate = total > 0 ? errorCount / total : 0;

    // Calculate average duration (only for logs with duration)
    const logsWithDuration = periodLogs.filter(
      (log) => typeof log.duration === 'number'
    );
    const avgDuration =
      logsWithDuration.length > 0
        ? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
          logsWithDuration.length
        : 0;

    return {
      total,
      byLevel,
      byCategory,
      errorRate,
      avgDuration,
      period: {
        start: periodStart.toISOString(),
        end: now.toISOString(),
      },
    };
  }

  /**
   * Delete logs older than specified number of days
   *
   * @param olderThanDays - Delete logs older than this many days
   * @returns Number of deleted log entries
   */
  deleteOldLogs(olderThanDays: number = DEFAULT_RETENTION_DAYS): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const initialCount = logStore.length;
    logStore = logStore.filter(
      (log) => new Date(log.timestamp) >= cutoffDate
    );

    const deletedCount = initialCount - logStore.length;

    if (deletedCount > 0) {
      this.info(
        'system',
        'logs.cleanup',
        `Deleted ${deletedCount} log entries older than ${olderThanDays} days`,
        { metadata: { deletedCount, olderThanDays } }
      );
    }

    return deletedCount;
  }

  /**
   * Get the total number of logs in store
   */
  getLogCount(): number {
    return logStore.length;
  }

  /**
   * Clear all logs (for testing purposes only)
   */
  clearAll(): void {
    logStore = [];
  }

  /**
   * Output log to console (for debugging)
   * @private
   */
  private consoleLog(entry: AgentLogEntry): void {
    const prefix = `[Agent ${entry.category.toUpperCase()}]`;
    const taskInfo = entry.taskId ? ` [Task: ${entry.taskId.slice(0, 8)}]` : '';
    const durationInfo = entry.duration ? ` (${entry.duration}ms)` : '';
    const logMessage = `${prefix}${taskInfo} ${entry.action}: ${entry.message}${durationInfo}`;

    switch (entry.level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage, entry.error);
        break;
    }
  }
}

/**
 * Singleton instance of AgentLogService
 */
export const agentLogService = new AgentLogService();

/**
 * Export the class for testing or custom instantiation
 */
export { AgentLogService };

/**
 * Export convenience methods for common logging patterns
 */
export const agentLog = {
  debug: agentLogService.debug.bind(agentLogService),
  info: agentLogService.info.bind(agentLogService),
  warn: agentLogService.warn.bind(agentLogService),
  error: agentLogService.error.bind(agentLogService),
  query: agentLogService.query.bind(agentLogService),
  getTaskTimeline: agentLogService.getTaskTimeline.bind(agentLogService),
  getStats: agentLogService.getStats.bind(agentLogService),
};
