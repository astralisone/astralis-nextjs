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