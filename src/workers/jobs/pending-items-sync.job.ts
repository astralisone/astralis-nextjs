/**
 * Pending Items Sync Job Setup
 *
 * This module sets up the recurring job that checks for unprocessed items.
 */

import { setupPendingItemsSyncCron } from '../queues/pending-items-sync.queue';

/**
 * Initialize the pending items sync cron job
 */
export async function initializePendingItemsSyncJob(): Promise<void> {
    console.log('[Job:PendingSync] Initializing pending items sync cron job...');

    try {
        await setupPendingItemsSyncCron();
        console.log('[Job:PendingSync] Pending items sync cron job initialized successfully');
        console.log('[Job:PendingSync] Schedule: Every 15 minutes (*/15 * * * *)');
    } catch (error) {
        console.error('[Job:PendingSync] Failed to initialize pending items sync cron job', error);
        throw error;
    }
}
