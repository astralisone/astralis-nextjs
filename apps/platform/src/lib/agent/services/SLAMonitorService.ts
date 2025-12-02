/**
 * SLAMonitorService - Monitors task SLA compliance and emits events
 *
 * This service checks tasks for SLA warnings (80% of typical time) and breaches.
 * It emits appropriate events via EventBus when thresholds are crossed.
 *
 * @module SLAMonitorService
 */

import type { PrismaClient } from '@prisma/client';
import type { Logger } from '../types/agent.types';
import { emitTaskSlaWarning, emitTaskSlaBreached } from '@/lib/events/taskEvents';

// =============================================================================
// Constants
// =============================================================================

/** SLA warning threshold (percentage of typical time) */
const SLA_WARNING_THRESHOLD = 0.8; // 80%

/** SLA breach threshold (percentage of typical time) */
const SLA_BREACH_THRESHOLD = 1.0; // 100%

// =============================================================================
// Types
// =============================================================================

/**
 * Task timeline structure from JSON field
 */
interface TaskTimeline {
  startedAt?: string;
  dueAt?: string;
  breachedAt?: string;
  warnedAt?: string;
}

/**
 * Configuration for the SLA Monitor Service
 */
export interface SLAMonitorServiceConfig {
  /** Prisma client for database operations */
  prisma: PrismaClient;
  /** Custom logger */
  logger?: Logger;
  /** Custom warning threshold (default: 0.8) */
  warningThreshold?: number;
  /** Custom breach threshold (default: 1.0) */
  breachThreshold?: number;
}

/**
 * Result of checking a single task's SLA
 */
export interface TaskSLACheckResult {
  taskId: string;
  status: 'OK' | 'WARNING' | 'BREACHED' | 'ALREADY_WARNED' | 'ALREADY_BREACHED';
  expectedMinutes: number;
  actualMinutes: number;
  percentageUsed: number;
  eventEmitted: boolean;
}

/**
 * Summary of checking all tasks
 */
export interface SLACheckSummary {
  totalChecked: number;
  okCount: number;
  warningCount: number;
  breachedCount: number;
  alreadyWarnedCount: number;
  alreadyBreachedCount: number;
  errorCount: number;
  errors: Array<{ taskId: string; error: string }>;
}

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[SLAMonitorService] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[SLAMonitorService] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[SLAMonitorService] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[SLAMonitorService] ${msg}`, err, data ?? ''),
};

// =============================================================================
// SLAMonitorService Class
// =============================================================================

/**
 * Service for monitoring task SLA compliance
 *
 * @example
 * ```typescript
 * const service = new SLAMonitorService({
 *   prisma: prismaClient,
 * });
 *
 * // Check a specific task
 * const result = await service.checkTaskSLA('task_123');
 *
 * // Check all pending tasks for an organization
 * const summary = await service.checkAllPendingTasks('org_456');
 * ```
 */
export class SLAMonitorService {
  private prisma: PrismaClient;
  private logger: Logger;
  private warningThreshold: number;
  private breachThreshold: number;

  constructor(config: SLAMonitorServiceConfig) {
    this.prisma = config.prisma;
    this.logger = config.logger ?? defaultLogger;
    this.warningThreshold = config.warningThreshold ?? SLA_WARNING_THRESHOLD;
    this.breachThreshold = config.breachThreshold ?? SLA_BREACH_THRESHOLD;

    this.logger.info('SLAMonitorService initialized', {
      warningThreshold: this.warningThreshold,
      breachThreshold: this.breachThreshold,
    });
  }

  // ===========================================================================
  // Single Task Check
  // ===========================================================================

  /**
   * Check SLA for a specific task
   *
   * @param taskId - Task ID to check
   * @returns SLA check result
   */
  async checkTaskSLA(taskId: string): Promise<TaskSLACheckResult> {
    this.logger.debug('Checking task SLA', { taskId });

    try {
      // Load task from database
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          orgId: true,
          typicalMinutes: true,
          timeline: true,
          status: true,
          stageKey: true,
          createdAt: true,
        },
      });

      if (!task) {
        this.logger.warn('Task not found', { taskId });
        throw new Error(`Task ${taskId} not found`);
      }

      // Check if task is in a terminal state
      if (task.status === 'DONE' || task.status === 'CANCELLED') {
        this.logger.debug('Task is in terminal state, skipping', {
          taskId,
          status: task.status,
        });
        return {
          taskId,
          status: 'OK',
          expectedMinutes: task.typicalMinutes ?? 0,
          actualMinutes: 0,
          percentageUsed: 0,
          eventEmitted: false,
        };
      }

      // Check if task has typicalMinutes defined
      if (!task.typicalMinutes || task.typicalMinutes <= 0) {
        this.logger.debug('Task has no SLA defined (typicalMinutes not set)', { taskId });
        return {
          taskId,
          status: 'OK',
          expectedMinutes: 0,
          actualMinutes: 0,
          percentageUsed: 0,
          eventEmitted: false,
        };
      }

      // Parse timeline
      const timeline = (task.timeline as TaskTimeline) ?? {};

      // Calculate elapsed time (from createdAt or timeline.startedAt)
      const startTime = timeline.startedAt
        ? new Date(timeline.startedAt)
        : task.createdAt;
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedMinutes = elapsedMs / (1000 * 60);

      // Calculate percentage of SLA time used
      const percentageUsed = elapsedMinutes / task.typicalMinutes;

      this.logger.debug('SLA calculation', {
        taskId,
        typicalMinutes: task.typicalMinutes,
        elapsedMinutes: Math.round(elapsedMinutes),
        percentageUsed: Math.round(percentageUsed * 100),
      });

      // Check for breach
      if (percentageUsed >= this.breachThreshold) {
        // Check if already breached
        if (timeline.breachedAt) {
          this.logger.debug('Task already breached', { taskId, breachedAt: timeline.breachedAt });
          return {
            taskId,
            status: 'ALREADY_BREACHED',
            expectedMinutes: task.typicalMinutes,
            actualMinutes: elapsedMinutes,
            percentageUsed,
            eventEmitted: false,
          };
        }

        // Emit breach event and update timeline
        this.logger.info('Task SLA breached', {
          taskId,
          typicalMinutes: task.typicalMinutes,
          elapsedMinutes: Math.round(elapsedMinutes),
        });

        await emitTaskSlaBreached(
          taskId,
          task.orgId,
          task.typicalMinutes,
          elapsedMinutes,
          task.stageKey ?? undefined
        );

        // Update timeline with breachedAt
        const updatedTimeline: TaskTimeline = {
          ...timeline,
          breachedAt: now.toISOString(),
        };

        await this.prisma.task.update({
          where: { id: taskId },
          data: { timeline: updatedTimeline as any },
        });

        return {
          taskId,
          status: 'BREACHED',
          expectedMinutes: task.typicalMinutes,
          actualMinutes: elapsedMinutes,
          percentageUsed,
          eventEmitted: true,
        };
      }

      // Check for warning
      if (percentageUsed >= this.warningThreshold) {
        // Check if already warned
        if (timeline.warnedAt) {
          this.logger.debug('Task already warned', { taskId, warnedAt: timeline.warnedAt });
          return {
            taskId,
            status: 'ALREADY_WARNED',
            expectedMinutes: task.typicalMinutes,
            actualMinutes: elapsedMinutes,
            percentageUsed,
            eventEmitted: false,
          };
        }

        // Emit warning event and update timeline
        this.logger.info('Task SLA warning', {
          taskId,
          typicalMinutes: task.typicalMinutes,
          elapsedMinutes: Math.round(elapsedMinutes),
          percentageUsed: Math.round(percentageUsed * 100),
        });

        await emitTaskSlaWarning(
          taskId,
          task.orgId,
          task.typicalMinutes,
          elapsedMinutes,
          percentageUsed * 100,
          task.stageKey ?? undefined
        );

        // Update timeline with warnedAt
        const updatedTimeline: TaskTimeline = {
          ...timeline,
          warnedAt: now.toISOString(),
        };

        await this.prisma.task.update({
          where: { id: taskId },
          data: { timeline: updatedTimeline as any },
        });

        return {
          taskId,
          status: 'WARNING',
          expectedMinutes: task.typicalMinutes,
          actualMinutes: elapsedMinutes,
          percentageUsed,
          eventEmitted: true,
        };
      }

      // Task is within SLA
      return {
        taskId,
        status: 'OK',
        expectedMinutes: task.typicalMinutes,
        actualMinutes: elapsedMinutes,
        percentageUsed,
        eventEmitted: false,
      };
    } catch (error) {
      this.logger.error('Error checking task SLA', error as Error, { taskId });
      throw error;
    }
  }

  // ===========================================================================
  // Bulk Check
  // ===========================================================================

  /**
   * Check SLA for all pending tasks in an organization
   *
   * @param orgId - Organization ID
   * @returns Summary of SLA checks
   */
  async checkAllPendingTasks(orgId: string): Promise<SLACheckSummary> {
    this.logger.info('Checking all pending tasks', { orgId });

    const summary: SLACheckSummary = {
      totalChecked: 0,
      okCount: 0,
      warningCount: 0,
      breachedCount: 0,
      alreadyWarnedCount: 0,
      alreadyBreachedCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      // Find all non-terminal tasks with typicalMinutes set
      const tasks = await this.prisma.task.findMany({
        where: {
          orgId,
          status: {
            notIn: ['DONE', 'CANCELLED'],
          },
          typicalMinutes: {
            not: null,
            gt: 0,
          },
        },
        select: {
          id: true,
        },
      });

      this.logger.info('Found tasks to check', { orgId, count: tasks.length });

      // Check each task
      for (const task of tasks) {
        summary.totalChecked++;

        try {
          const result = await this.checkTaskSLA(task.id);

          switch (result.status) {
            case 'OK':
              summary.okCount++;
              break;
            case 'WARNING':
              summary.warningCount++;
              break;
            case 'BREACHED':
              summary.breachedCount++;
              break;
            case 'ALREADY_WARNED':
              summary.alreadyWarnedCount++;
              break;
            case 'ALREADY_BREACHED':
              summary.alreadyBreachedCount++;
              break;
          }
        } catch (error) {
          summary.errorCount++;
          summary.errors.push({
            taskId: task.id,
            error: (error as Error).message,
          });
          this.logger.error('Error checking task', error as Error, { taskId: task.id });
        }
      }

      this.logger.info('SLA check completed', {
        orgId,
        summary: {
          total: summary.totalChecked,
          ok: summary.okCount,
          warning: summary.warningCount,
          breached: summary.breachedCount,
          errors: summary.errorCount,
        },
      });

      return summary;
    } catch (error) {
      this.logger.error('Error checking all pending tasks', error as Error, { orgId });
      throw error;
    }
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Get tasks approaching SLA breach for an organization
   *
   * @param orgId - Organization ID
   * @param thresholdPercentage - Minimum percentage to include (default: 70)
   * @returns Array of task IDs and their SLA percentages
   */
  async getTasksApproachingSLA(
    orgId: string,
    thresholdPercentage: number = 70
  ): Promise<Array<{ taskId: string; percentageUsed: number; elapsedMinutes: number }>> {
    const tasks = await this.prisma.task.findMany({
      where: {
        orgId,
        status: {
          notIn: ['DONE', 'CANCELLED'],
        },
        typicalMinutes: {
          not: null,
          gt: 0,
        },
      },
      select: {
        id: true,
        typicalMinutes: true,
        timeline: true,
        createdAt: true,
      },
    });

    const results: Array<{ taskId: string; percentageUsed: number; elapsedMinutes: number }> = [];

    for (const task of tasks) {
      const timeline = (task.timeline as TaskTimeline) ?? {};
      const startTime = timeline.startedAt ? new Date(timeline.startedAt) : task.createdAt;
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedMinutes = elapsedMs / (1000 * 60);
      const percentageUsed = (elapsedMinutes / (task.typicalMinutes ?? 1)) * 100;

      if (percentageUsed >= thresholdPercentage) {
        results.push({
          taskId: task.id,
          percentageUsed: Math.round(percentageUsed),
          elapsedMinutes: Math.round(elapsedMinutes),
        });
      }
    }

    // Sort by percentage descending
    results.sort((a, b) => b.percentageUsed - a.percentageUsed);

    return results;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new SLAMonitorService instance
 */
export function createSLAMonitorService(config: SLAMonitorServiceConfig): SLAMonitorService {
  return new SLAMonitorService(config);
}
