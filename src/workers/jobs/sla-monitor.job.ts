/**
 * SLA Monitor Job Setup
 *
 * This module sets up the recurring SLA monitoring cron job.
 * The job runs every 15 minutes to check all active tasks for SLA compliance.
 *
 * Usage:
 * ```typescript
 * import { initializeSLAMonitorJob } from './jobs/sla-monitor.job';
 * await initializeSLAMonitorJob();
 * ```
 */

import { setupSLAMonitorCron } from '../queues/sla-monitor.queue';

/**
 * Initialize the SLA monitor cron job
 *
 * This should be called once when the worker starts up.
 * It will set up a repeatable job that runs every 15 minutes.
 */
export async function initializeSLAMonitorJob(): Promise<void> {
  console.log('[Job:SLAMonitor] Initializing SLA monitor cron job...');

  try {
    await setupSLAMonitorCron();
    console.log('[Job:SLAMonitor] SLA monitor cron job initialized successfully');
    console.log('[Job:SLAMonitor] Schedule: Every 15 minutes (*/15 * * * *)');
  } catch (error) {
    console.error('[Job:SLAMonitor] Failed to initialize SLA monitor cron job', error);
    throw error;
  }
}

/**
 * Trigger an immediate SLA check (useful for testing or manual triggers)
 *
 * @param orgId - Optional organization ID to check (omit to check all orgs)
 */
export async function triggerSLACheck(orgId?: string): Promise<void> {
  const { queueSLAMonitor } = await import('../queues/sla-monitor.queue');

  console.log('[Job:SLAMonitor] Triggering immediate SLA check', { orgId: orgId ?? 'all' });

  await queueSLAMonitor({ orgId });

  console.log('[Job:SLAMonitor] SLA check job queued');
}
