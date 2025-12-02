import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Calendar Sync Queue
 *
 * Handles synchronization of calendar events from external providers
 */
export const calendarSyncQueue = new Queue('calendar-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 200,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Job data interface for calendar sync
 */
export interface CalendarSyncJobData {
  connectionId: string;
  userId: string;
  orgId: string; // REQUIRED for multi-tenant isolation
  syncType: 'full' | 'incremental';
}

/**
 * Add calendar sync job to queue
 */
export async function addSyncJob(data: CalendarSyncJobData): Promise<void> {
  await calendarSyncQueue.add('sync-calendar', data, {
    jobId: `sync-${data.connectionId}-${Date.now()}`,
  });

  console.log(`[Queue] Calendar sync job queued: ${data.syncType} sync for user ${data.userId}`);
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    calendarSyncQueue.getWaitingCount(),
    calendarSyncQueue.getActiveCount(),
    calendarSyncQueue.getCompletedCount(),
    calendarSyncQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}

/**
 * Queue a calendar sync job (alias for addSyncJob)
 * Follows naming convention specified in Phase 10
 */
export async function queueCalendarSync(data: CalendarSyncJobData): Promise<void> {
  return addSyncJob(data);
}
