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
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    schedulingRemindersQueue.getWaitingCount(),
    schedulingRemindersQueue.getActiveCount(),
    schedulingRemindersQueue.getCompletedCount(),
    schedulingRemindersQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}
