import { platformQueue } from './platform.queue';

/**
 * Pending Items Sync Queue (Legacy Wrapper)
 */
export const pendingItemsSyncQueue = platformQueue;

export async function queuePendingItemsSync(data: any = {}): Promise<void> {
  await platformQueue.add('sync-pending-items', data, {
    jobId: `sync-pending-${Date.now()}`,
  });
  console.log(`[Queue] Pending items sync job queued -> platform-jobs`);
}

/**
 * Setup recurring pending items sync job
 */
export async function setupPendingItemsSyncCron(): Promise<void> {
  const jobId = 'pending-sync-cron';

  try {
    const repeatableJobs = await platformQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId || job.name === 'sync-pending-items') {
        await platformQueue.removeRepeatableByKey(job.key);
      }
    }
  } catch (error) {}

  // Add new repeatable job (every 15 minutes)
  await platformQueue.add('sync-pending-items', {}, {
    repeat: { pattern: '*/15 * * * *' },
    jobId,
  });

  console.log('[Queue] Pending items sync cron job scheduled (every 15 minutes)');
}