import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * SLA Monitor Queue
 *
 * Handles periodic SLA monitoring for tasks.
 * This queue runs on a cron schedule to check all active tasks
 * for SLA warnings and breaches.
 */
export const slaMonitorQueue = new Queue('sla-monitor', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Job data interface for SLA monitoring
 */
export interface SLAMonitorJobData {
  orgId?: string; // Optional: check specific org, omit to check all orgs
  taskId?: string; // Optional: check specific task
}

/**
 * Add SLA monitoring job to queue (for specific org or task)
 */
export async function queueSLAMonitor(data: SLAMonitorJobData = {}): Promise<void> {
  const jobId = data.taskId
    ? `sla-check-task-${data.taskId}`
    : data.orgId
    ? `sla-check-org-${data.orgId}`
    : `sla-check-all-${Date.now()}`;

  await slaMonitorQueue.add('check-sla', data, {
    jobId,
  });

  console.log(`[Queue] SLA monitor job queued: ${jobId}`);
}

/**
 * Setup recurring SLA monitor job (runs every 15 minutes)
 */
export async function setupSLAMonitorCron(): Promise<void> {
  // Remove any existing cron jobs
  const existingJobs = await slaMonitorQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    if (job.name === 'check-sla-cron') {
      await slaMonitorQueue.removeRepeatableByKey(job.key);
      console.log(`[Queue] Removed existing SLA monitor cron job: ${job.key}`);
    }
  }

  // Add new repeatable job (every 15 minutes)
  await slaMonitorQueue.add(
    'check-sla-cron',
    {}, // No specific org or task - check all
    {
      repeat: {
        pattern: '*/15 * * * *', // Every 15 minutes
      },
      jobId: 'sla-monitor-cron',
    }
  );

  console.log('[Queue] SLA monitor cron job scheduled (every 15 minutes)');
}

/**
 * Get SLA monitor queue stats
 */
export async function getSLAMonitorQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    slaMonitorQueue.getWaitingCount(),
    slaMonitorQueue.getActiveCount(),
    slaMonitorQueue.getCompletedCount(),
    slaMonitorQueue.getFailedCount(),
    slaMonitorQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}
