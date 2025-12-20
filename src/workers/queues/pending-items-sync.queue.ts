import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Pending Items Sync Queue
 *
 * Scans the database for items that missed their initial processing trigger
 */
export const pendingItemsSyncQueue = new Queue('pending-items-sync', {
    connection: redisConnection as any,
    defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: {
            age: 24 * 3600,
        },
    },
});

/**
 * Job data interface
 */
export interface PendingItemsSyncJobData {
    dryRun?: boolean;
}

/**
 * Add pending items sync job
 */
export async function queuePendingItemsSync(data: PendingItemsSyncJobData = {}): Promise<void> {
    await pendingItemsSyncQueue.add('sync-pending-items', data, {
        jobId: 'pending-items-sync-manual',
    });
}

/**
 * Setup recurring sync job
 */
export async function setupPendingItemsSyncCron(): Promise<void> {
    // Clear any existing repeatable jobs for this name/id to avoid duplicates
    const repeatableJobs = await pendingItemsSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
        if (job.name === 'sync-pending-items') {
            await pendingItemsSyncQueue.removeRepeatableByKey(job.key);
        }
    }

    // Add repeatable job: every 15 minutes
    await pendingItemsSyncQueue.add(
        'sync-pending-items',
        {},
        {
            repeat: {
                pattern: '*/15 * * * *',
            },
            jobId: 'pending-items-sync-cron',
        }
    );
}
