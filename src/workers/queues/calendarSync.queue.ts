import { platformQueue } from './platform.queue';

/**
 * Calendar Sync Queue (Legacy Wrapper)
 */
export const calendarSyncQueue = platformQueue;

export interface CalendarSyncJobData {
  userId: string;
  provider: 'GOOGLE' | 'MICROSOFT';
  orgId?: string;
  force?: boolean;
}

export async function queueCalendarSync(data: CalendarSyncJobData): Promise<void> {
  await platformQueue.add('sync-calendar', data, {
    jobId: `sync-${data.userId}-${data.provider}`,
  });
  console.log(`[Queue] Calendar sync job queued: ${data.userId} -> platform-jobs`);
}