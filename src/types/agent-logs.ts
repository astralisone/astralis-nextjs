/**
 * Agent Logs Type Definitions
 * Type definitions for agent log entries, filters, and API responses
 */

/**
 * Log levels for agent logs
 */
export type AgentLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log categories for agent operations
 */
export type AgentLogCategory =
  | 'intake'
  | 'classification'
  | 'scheduling'
  | 'delivery'
  | 'worker'
  | 'system';

/**
 * Agent Log Entry
 * Represents a single log entry in the agent logging system
 */
export interface AgentLogEntry {
  /** Unique identifier for the log entry */
  id: string;
  /** Timestamp of when the log was created */
  timestamp: string;
  /** Log severity level */
  level: AgentLogLevel;
  /** Category of the log */
  category: AgentLogCategory;
  /** The action being performed */
  action: string;
  /** Human-readable message describing the log event */
  message: string;
  /** Associated task ID (if applicable) */
  taskId?: string;
  /** Associated user ID (if applicable) */
  userId?: string;
  /** Associated organization ID (if applicable) */
  orgId?: string;
  /** Duration of the operation in milliseconds (if applicable) */
  duration?: number;
  /** Additional metadata for the log entry */
  metadata?: Record<string, unknown>;
  /** Error details if level is 'error' */
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Query filters for retrieving agent logs
 */
export interface AgentLogFilters {
  /** Filter by log level */
  level?: AgentLogLevel;
  /** Filter by category */
  category?: AgentLogCategory;
  /** Filter by task ID */
  taskId?: string;
  /** Filter by user ID */
  userId?: string;
  /** Filter by organization ID */
  orgId?: string;
  /** Filter logs after this date */
  startDate?: string;
  /** Filter logs before this date */
  endDate?: string;
  /** Filter by action (partial match) */
  action?: string;
  /** Maximum number of logs to return */
  limit?: number;
  /** Number of logs to skip for pagination */
  offset?: number;
}

/**
 * Pagination information for log queries
 */
export interface AgentLogPagination {
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Response for GET /api/agent/logs
 */
export interface AgentLogsResponse {
  success: true;
  logs: AgentLogEntry[];
  total: number;
  pagination: AgentLogPagination;
}

/**
 * Statistics by log level
 */
export type LogLevelStats = Record<AgentLogLevel, number>;

/**
 * Statistics by log category
 */
export type LogCategoryStats = Record<AgentLogCategory, number>;

/**
 * Response for GET /api/agent/logs/stats
 */
export interface AgentLogStatsResponse {
  success: true;
  stats: {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    errorRate: number;
    avgDuration: number;
  };
  period: {
    start: string;
    end: string;
  };
}

/**
 * Response for GET /api/agent/logs/[taskId]/timeline
 */
export interface AgentLogTimelineResponse {
  success: true;
  taskId: string;
  logs: AgentLogEntry[];
  total: number;
}

/**
 * Request body for DELETE /api/agent/logs
 */
export interface AgentLogDeleteRequest {
  olderThanDays?: number;
}

/**
 * Response for DELETE /api/agent/logs
 */
export interface AgentLogDeleteResponse {
  success: true;
  deletedCount: number;
  message: string;
}

/**
 * Error response for agent logs API
 */
export interface AgentLogErrorResponse {
  success: false;
  error: string;
  details?: string | Record<string, string[]>;
}

/**
 * Input for creating a new log entry
 */
export interface CreateAgentLogInput {
  level: AgentLogLevel;
  category: AgentLogCategory;
  action: string;
  message: string;
  taskId?: string;
  userId?: string;
  orgId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  error?: Error;
}
