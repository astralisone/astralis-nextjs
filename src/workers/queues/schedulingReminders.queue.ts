import { platformQueue } from './platform.queue';

/**
 * Scheduling Reminders Queue (Legacy Wrapper)
 */
export const schedulingRemindersQueue = platformQueue;

export interface SchedulingReminderJobData {
  eventId: string;
  userId: string;
  reminderType: 'EMAIL' | 'SMS';
  recipient: string;
  title: string;
  startTime: Date | string;
}

export async function queueSchedulingReminder(data: SchedulingReminderJobData): Promise<void> {
  await platformQueue.add('send-reminder', data, {
    jobId: `reminder-${data.eventId}-${data.reminderType}-${Date.now()}`,
  });
  console.log(`[Queue] Scheduling reminder job queued: ${data.eventId} -> platform-jobs`);
}

/**
 * Setup recurring reminder scheduler job
 */
export async function setupReminderSchedulerCron(): Promise<void> {
  const jobId = 'reminder-scheduler-cron';

  try {
    const repeatableJobs = await platformQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId || job.name === 'send-reminder') {
        await platformQueue.removeRepeatableByKey(job.key);
        console.log(`[Queue] Removed existing reminder scheduler cron job: ${job.id}`);
      }
    }
  } catch (error) {}

  // Add new repeatable job (every 5 minutes)
  await platformQueue.add('send-reminder', {}, {
    repeat: { pattern: '*/5 * * * *' },
    jobId,
  });

  console.log('[Queue] Reminder scheduler cron job scheduled (every 5 minutes)');
}