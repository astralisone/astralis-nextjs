import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Scheduling Reminders Queue
 *
 * Handles sending email reminders for scheduled events
 */
export const schedulingRemindersQueue = new Queue('scheduling-reminders', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2s delay
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // Keep completed jobs for 7 days
      count: 500,
    },
    removeOnFail: {
      age: 14 * 24 * 3600, // Keep failed jobs for 14 days
    },
  },
});

/**
 * Job data interface for reminder processing
 */
export interface ReminderJobData {
  reminderId: string;
  eventId: string;
  orgId: string; // REQUIRED for multi-tenant isolation
}

/**
 * Job data interface for reminder scanning (cron job)
 */
export interface ScanRemindersJobData {
  // Empty - the cron job doesn't need any data
}

/**
 * Add reminder job to queue
 */
export async function addReminderJob(data: ReminderJobData): Promise<void> {
  await schedulingRemindersQueue.add('send-reminder', data, {
    jobId: `reminder-${data.reminderId}`,
  });

  console.log(`[Queue] Reminder job queued: ${data.reminderId} for event ${data.eventId}`);
}

/**
 * Queue a reminder (alias for addReminderJob)
 */
export async function queueReminder(data: ReminderJobData): Promise<void> {
  return addReminderJob(data);
}

/**
 * Setup recurring reminder scheduler job (runs every 5 minutes)
 */
export async function setupReminderSchedulerCron(): Promise<void> {
  // Remove any existing cron jobs
  const existingJobs = await schedulingRemindersQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    if (job.name === 'scan-pending-reminders') {
      await schedulingRemindersQueue.removeRepeatableByKey(job.key);
      console.log(`[Queue] Removed existing reminder scheduler cron job: ${job.key}`);
    }
  }

  // Add new repeatable job (every 5 minutes)
  await schedulingRemindersQueue.add(
    'scan-pending-reminders',
    {}, // No data needed for cron job
    {
      repeat: {
        pattern: '*/5 * * * *', // Every 5 minutes
      },
      jobId: 'reminder-scheduler-cron',
    }
  );

  console.log('[Queue] Reminder scheduler cron job scheduled (every 5 minutes)');
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    schedulingRemindersQueue.getWaitingCount(),
    schedulingRemindersQueue.getActiveCount(),
    schedulingRemindersQueue.getCompletedCount(),
    schedulingRemindersQueue.getFailedCount(),
    schedulingRemindersQueue.getDelayedCount(),
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
