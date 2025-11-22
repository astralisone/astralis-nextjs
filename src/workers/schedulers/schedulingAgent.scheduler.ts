import { Queue, Job, Worker } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { redisConnection } from '../redis';
import { addReminderJob } from '../queues/schedulingReminders.queue';
import { AgentTaskStatus } from '@prisma/client';
import { agentLogger } from '@/lib/services/agentLogger.service';

/**
 * Scheduling Agent Scheduler
 *
 * Handles periodic tasks for the scheduling agent:
 * - Reminder dispatching (every minute)
 * - Stale task cleanup (every hour)
 * - Statistics aggregation (every 15 minutes)
 */

// ============================================================================
// Constants
// ============================================================================

const SCHEDULER_QUEUE_NAME = 'scheduling-agent-scheduler';
const REMINDER_BATCH_SIZE = 100;
const STALE_TASK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const MAX_RETRY_COUNT = 3;

// Job names
export const SCHEDULER_JOBS = {
  CHECK_REMINDERS: 'check-reminders',
  CLEANUP_STALE: 'cleanup-stale',
  AGGREGATE_STATS: 'aggregate-stats',
} as const;

// ============================================================================
// Scheduler Queue
// ============================================================================

/**
 * Scheduler queue for recurring jobs
 */
export const schedulingAgentSchedulerQueue = new Queue(SCHEDULER_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

// ============================================================================
// Job Data Types
// ============================================================================

export interface CheckRemindersJobData {
  timestamp: string;
}

export interface CleanupStaleJobData {
  timestamp: string;
}

export interface AggregateStatsJobData {
  timestamp: string;
}

export type SchedulerJobData =
  | CheckRemindersJobData
  | CleanupStaleJobData
  | AggregateStatsJobData;

// ============================================================================
// Statistics Interface
// ============================================================================

export interface SchedulingAgentStats {
  timestamp: string;
  tasks: {
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    byTaskType: Record<string, number>;
  };
  processing: {
    averageTimeMs: number;
    totalProcessed: number;
    failedCount: number;
    pendingCount: number;
  };
  reminders: {
    pendingCount: number;
    sentLast24h: number;
    failedLast24h: number;
  };
}

// ============================================================================
// Scheduler Processor Functions
// ============================================================================

/**
 * Check and dispatch pending reminders
 * Runs every minute
 */
async function processCheckReminders(
  job: Job<CheckRemindersJobData>
): Promise<{ processed: number; queued: number }> {
  const startTime = Date.now();

  // Log job started
  agentLogger.logSchedulerJob('check-reminders', job.id, 'started');

  try {
    await job.updateProgress(10);

    const now = new Date();

    // Query EventReminder where status = PENDING and reminderTime <= now
    // Process in batches to avoid overwhelming the queue
    const pendingReminders = await prisma.eventReminder.findMany({
      where: {
        status: 'PENDING',
        reminderTime: {
          lte: now,
        },
      },
      take: REMINDER_BATCH_SIZE,
      orderBy: {
        reminderTime: 'asc',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    await job.updateProgress(30);

    if (pendingReminders.length === 0) {
      const duration = Date.now() - startTime;
      agentLogger.logSchedulerJob('check-reminders', job.id, 'completed', { processed: 0, queued: 0 }, duration);
      return { processed: 0, queued: 0 };
    }

    agentLogger.logWorkerInfo('Scheduler:Reminders', `Found ${pendingReminders.length} pending reminders`);

    let queuedCount = 0;
    let skippedCount = 0;

    // Queue each pending reminder for processing
    for (const reminder of pendingReminders) {
      // Skip if event is cancelled
      if (reminder.event?.status === 'CANCELLED') {
        agentLogger.logWorkerInfo('Scheduler:Reminders', `Skipping reminder ${reminder.id} - event cancelled`);
        await prisma.eventReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Event was cancelled',
          },
        });
        skippedCount++;
        continue;
      }

      try {
        await addReminderJob({
          reminderId: reminder.id,
          eventId: reminder.eventId,
        });
        queuedCount++;
      } catch (error) {
        agentLogger.logWorkerError('Scheduler:Reminders', `Failed to queue reminder ${reminder.id}`, error);
      }
    }

    await job.updateProgress(100);

    const duration = Date.now() - startTime;

    // Log reminders dispatched count
    agentLogger.logRemindersDispatched(job.id, pendingReminders.length, queuedCount, duration);

    agentLogger.logSchedulerJob('check-reminders', job.id, 'completed', {
      processed: pendingReminders.length,
      queued: queuedCount,
      skipped: skippedCount,
    }, duration);

    return { processed: pendingReminders.length, queued: queuedCount };
  } catch (error) {
    const duration = Date.now() - startTime;
    agentLogger.logSchedulerJob('check-reminders', job.id, 'failed', undefined, duration);
    agentLogger.logWorkerError('Scheduler:Reminders', 'Error checking reminders', error);
    throw error;
  }
}

/**
 * Cleanup stale tasks
 * Runs every hour
 */
async function processCleanupStale(
  job: Job<CleanupStaleJobData>
): Promise<{ marked: number; retried: number }> {
  const startTime = Date.now();

  // Log job started
  agentLogger.logSchedulerJob('cleanup-stale', job.id, 'started');

  try {
    await job.updateProgress(10);

    const staleThreshold = new Date(Date.now() - STALE_TASK_THRESHOLD_MS);

    // Find SchedulingAgentTask with status = PROCESSING for > 30 minutes
    const staleTasks = await prisma.schedulingAgentTask.findMany({
      where: {
        status: 'PROCESSING',
        updatedAt: {
          lt: staleThreshold,
        },
      },
      take: 100,
    });

    await job.updateProgress(30);

    if (staleTasks.length === 0) {
      const duration = Date.now() - startTime;
      agentLogger.logSchedulerJob('cleanup-stale', job.id, 'completed', { marked: 0, retried: 0 }, duration);
      return { marked: 0, retried: 0 };
    }

    agentLogger.logWorkerInfo('Scheduler:Cleanup', `Found ${staleTasks.length} stale tasks`);

    let markedCount = 0;
    let retriedCount = 0;

    for (const task of staleTasks) {
      try {
        if (task.retryCount < MAX_RETRY_COUNT) {
          // Retry the task - reset to PENDING and increment retry count
          await prisma.schedulingAgentTask.update({
            where: { id: task.id },
            data: {
              status: 'PENDING',
              retryCount: task.retryCount + 1,
              errorMessage: `Processing timeout - retry ${task.retryCount + 1}/${MAX_RETRY_COUNT}`,
            },
          });
          retriedCount++;
          agentLogger.logWorkerInfo('Scheduler:Cleanup', `Task ${task.id} reset for retry (attempt ${task.retryCount + 1})`);
        } else {
          // Mark as FAILED after max retries
          await prisma.schedulingAgentTask.update({
            where: { id: task.id },
            data: {
              status: 'FAILED',
              errorMessage: `Processing timeout - max retries (${MAX_RETRY_COUNT}) exceeded`,
            },
          });
          markedCount++;
          agentLogger.logWorkerInfo('Scheduler:Cleanup', `Task ${task.id} marked as FAILED (max retries exceeded)`);
        }
      } catch (error) {
        agentLogger.logWorkerError('Scheduler:Cleanup', `Failed to process stale task ${task.id}`, error);
      }
    }

    await job.updateProgress(100);

    const duration = Date.now() - startTime;

    // Log stale tasks cleaned count
    agentLogger.logStaleTasksCleaned(job.id, markedCount, retriedCount, duration);

    agentLogger.logSchedulerJob('cleanup-stale', job.id, 'completed', {
      marked: markedCount,
      retried: retriedCount,
      total: staleTasks.length,
    }, duration);

    return { marked: markedCount, retried: retriedCount };
  } catch (error) {
    const duration = Date.now() - startTime;
    agentLogger.logSchedulerJob('cleanup-stale', job.id, 'failed', undefined, duration);
    agentLogger.logWorkerError('Scheduler:Cleanup', 'Error during cleanup', error);
    throw error;
  }
}

/**
 * Aggregate statistics
 * Runs every 15 minutes
 */
async function processAggregateStats(
  job: Job<AggregateStatsJobData>
): Promise<SchedulingAgentStats> {
  const startTime = Date.now();

  // Log job started
  agentLogger.logSchedulerJob('aggregate-stats', job.id, 'started');

  try {
    await job.updateProgress(10);

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count tasks by status
    const tasksByStatus = await prisma.schedulingAgentTask.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    await job.updateProgress(25);

    // Count tasks by source
    const tasksBySource = await prisma.schedulingAgentTask.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
    });

    await job.updateProgress(40);

    // Count tasks by task type
    const tasksByType = await prisma.schedulingAgentTask.groupBy({
      by: ['taskType'],
      _count: {
        id: true,
      },
    });

    await job.updateProgress(55);

    // Calculate average processing time for completed tasks
    const processingStats = await prisma.schedulingAgentTask.aggregate({
      where: {
        status: 'COMPLETED',
        processingTime: {
          not: null,
        },
      },
      _avg: {
        processingTime: true,
      },
      _count: {
        id: true,
      },
    });

    await job.updateProgress(70);

    // Count failed and pending tasks
    const [failedCount, pendingCount] = await Promise.all([
      prisma.schedulingAgentTask.count({
        where: { status: 'FAILED' },
      }),
      prisma.schedulingAgentTask.count({
        where: { status: 'PENDING' },
      }),
    ]);

    await job.updateProgress(85);

    // Get reminder statistics
    const [pendingReminders, sentRemindersLast24h, failedRemindersLast24h] = await Promise.all([
      prisma.eventReminder.count({
        where: { status: 'PENDING' },
      }),
      prisma.eventReminder.count({
        where: {
          status: 'SENT',
          sentAt: {
            gte: last24h,
          },
        },
      }),
      prisma.eventReminder.count({
        where: {
          status: 'FAILED',
          updatedAt: {
            gte: last24h,
          },
        },
      }),
    ]);

    await job.updateProgress(95);

    // Calculate totals
    const totalTasks = tasksByStatus.reduce((sum, item) => sum + item._count.id, 0);

    // Build stats object
    const stats: SchedulingAgentStats = {
      timestamp: now.toISOString(),
      tasks: {
        total: totalTasks,
        byStatus: tasksByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        bySource: tasksBySource.reduce(
          (acc, item) => {
            acc[item.source] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        byTaskType: tasksByType.reduce(
          (acc, item) => {
            acc[item.taskType] = item._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      processing: {
        averageTimeMs: processingStats._avg.processingTime || 0,
        totalProcessed: processingStats._count.id,
        failedCount,
        pendingCount,
      },
      reminders: {
        pendingCount: pendingReminders,
        sentLast24h: sentRemindersLast24h,
        failedLast24h: failedRemindersLast24h,
      },
    };

    await job.updateProgress(100);

    const duration = Date.now() - startTime;

    // Log statistics aggregated
    agentLogger.logStatsAggregated(job.id, {
      totalTasks: stats.tasks.total,
      pendingCount: stats.processing.pendingCount,
      failedCount: stats.processing.failedCount,
      pendingReminders: stats.reminders.pendingCount,
    }, duration);

    agentLogger.logSchedulerJob('aggregate-stats', job.id, 'completed', {
      totalTasks: stats.tasks.total,
      byStatus: stats.tasks.byStatus,
      avgProcessingTime: stats.processing.averageTimeMs,
      pendingReminders: stats.reminders.pendingCount,
    }, duration);

    return stats;
  } catch (error) {
    const duration = Date.now() - startTime;
    agentLogger.logSchedulerJob('aggregate-stats', job.id, 'failed', undefined, duration);
    agentLogger.logWorkerError('Scheduler:Stats', 'Error aggregating statistics', error);
    throw error;
  }
}

/**
 * Main processor for scheduler jobs
 */
async function processSchedulerJob(job: Job<SchedulerJobData>) {
  console.log(`[Scheduler] Processing job: ${job.name} (${job.id})`);

  switch (job.name) {
    case SCHEDULER_JOBS.CHECK_REMINDERS:
      return processCheckReminders(job as Job<CheckRemindersJobData>);
    case SCHEDULER_JOBS.CLEANUP_STALE:
      return processCleanupStale(job as Job<CleanupStaleJobData>);
    case SCHEDULER_JOBS.AGGREGATE_STATS:
      return processAggregateStats(job as Job<AggregateStatsJobData>);
    default:
      throw new Error(`Unknown scheduler job type: ${job.name}`);
  }
}

// ============================================================================
// Scheduler Bootstrap
// ============================================================================

let schedulerWorker: Worker | null = null;

/**
 * Start the scheduler
 * Adds repeatable jobs to the queue and starts the worker
 */
export async function startScheduler(): Promise<void> {
  agentLogger.logWorkerInfo('Scheduler', 'Starting scheduling agent scheduler...');

  try {
    // Remove existing repeatable jobs to avoid duplicates
    await removeRepeatableJobs();

    const jobsAdded: string[] = [];

    // Add repeatable jobs
    // 1. Check reminders - every minute
    await schedulingAgentSchedulerQueue.add(
      SCHEDULER_JOBS.CHECK_REMINDERS,
      { timestamp: new Date().toISOString() },
      {
        repeat: {
          every: 60000, // Every 60 seconds (1 minute)
        },
        jobId: 'check-reminders-repeat',
      }
    );
    jobsAdded.push('check-reminders (every 1 minute)');

    // 2. Cleanup stale tasks - every hour
    await schedulingAgentSchedulerQueue.add(
      SCHEDULER_JOBS.CLEANUP_STALE,
      { timestamp: new Date().toISOString() },
      {
        repeat: {
          every: 3600000, // Every 3600 seconds (1 hour)
        },
        jobId: 'cleanup-stale-repeat',
      }
    );
    jobsAdded.push('cleanup-stale (every 1 hour)');

    // 3. Aggregate statistics - every 15 minutes
    await schedulingAgentSchedulerQueue.add(
      SCHEDULER_JOBS.AGGREGATE_STATS,
      { timestamp: new Date().toISOString() },
      {
        repeat: {
          every: 900000, // Every 900 seconds (15 minutes)
        },
        jobId: 'aggregate-stats-repeat',
      }
    );
    jobsAdded.push('aggregate-stats (every 15 minutes)');

    // Start the worker
    schedulerWorker = new Worker(SCHEDULER_QUEUE_NAME, processSchedulerJob, {
      connection: redisConnection,
      concurrency: 3, // Allow parallel processing of different job types
    });

    // Worker event handlers
    schedulerWorker.on('completed', (job) => {
      agentLogger.logWorkerInfo('Scheduler', `Job ${job.name} (${job.id}) completed`);
    });

    schedulerWorker.on('failed', (job, err) => {
      agentLogger.logWorkerError('Scheduler', `Job ${job?.name} (${job?.id}) failed`, err);
    });

    schedulerWorker.on('error', (err) => {
      agentLogger.logWorkerError('Scheduler', 'Worker error', err);
    });

    // Log scheduler startup with jobs added
    agentLogger.logSchedulerLifecycle('started', jobsAdded);
  } catch (error) {
    agentLogger.logWorkerError('Scheduler', 'Failed to start scheduler', error);
    throw error;
  }
}

/**
 * Stop the scheduler gracefully
 * Removes repeatable jobs and closes the worker
 */
export async function stopScheduler(): Promise<void> {
  agentLogger.logWorkerInfo('Scheduler', 'Stopping scheduler...');

  try {
    // Remove repeatable jobs
    await removeRepeatableJobs();

    // Close the worker
    if (schedulerWorker) {
      await schedulerWorker.close();
      schedulerWorker = null;
    }

    // Log scheduler stopped
    agentLogger.logSchedulerLifecycle('stopped');
  } catch (error) {
    agentLogger.logWorkerError('Scheduler', 'Error stopping scheduler', error);
    throw error;
  }
}

/**
 * Remove all repeatable jobs from the queue
 */
async function removeRepeatableJobs(): Promise<void> {
  try {
    const repeatableJobs = await schedulingAgentSchedulerQueue.getRepeatableJobs();

    for (const job of repeatableJobs) {
      await schedulingAgentSchedulerQueue.removeRepeatableByKey(job.key);
      agentLogger.logWorkerInfo('Scheduler', `Removed repeatable job: ${job.name} (${job.key})`);
    }
  } catch (error) {
    agentLogger.logWorkerError('Scheduler', 'Error removing repeatable jobs', error);
  }
}

/**
 * Get scheduler status
 */
export async function getSchedulerStatus() {
  const repeatableJobs = await schedulingAgentSchedulerQueue.getRepeatableJobs();
  const [waiting, active, completed, failed] = await Promise.all([
    schedulingAgentSchedulerQueue.getWaitingCount(),
    schedulingAgentSchedulerQueue.getActiveCount(),
    schedulingAgentSchedulerQueue.getCompletedCount(),
    schedulingAgentSchedulerQueue.getFailedCount(),
  ]);

  return {
    isRunning: schedulerWorker !== null,
    repeatableJobs: repeatableJobs.map((job) => ({
      name: job.name,
      key: job.key,
      every: job.every,
      next: job.next,
    })),
    queue: {
      waiting,
      active,
      completed,
      failed,
    },
  };
}

/**
 * Manually trigger a scheduler job (for testing/admin purposes)
 */
export async function triggerSchedulerJob(
  jobType: keyof typeof SCHEDULER_JOBS
): Promise<string> {
  const jobName = SCHEDULER_JOBS[jobType];
  const job = await schedulingAgentSchedulerQueue.add(
    jobName,
    { timestamp: new Date().toISOString() },
    {
      jobId: `manual-${jobName}-${Date.now()}`,
    }
  );

  console.log(`[Scheduler] Manually triggered ${jobName} job: ${job.id}`);
  return job.id || '';
}
