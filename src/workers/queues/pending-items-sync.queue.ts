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