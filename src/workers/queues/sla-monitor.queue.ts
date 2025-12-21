import { platformQueue } from './platform.queue';

/**
 * SLA Monitor Queue (Legacy Wrapper)
 */
export const slaMonitorQueue = platformQueue;

export interface SLAMonitorJobData {
  orgId?: string;
  taskId?: string;
}

export async function queueSLAMonitor(data: SLAMonitorJobData = {}): Promise<void> {
  await platformQueue.add('check-sla', data, {
    jobId: data.taskId ? `sla-${data.taskId}` : `sla-all-${Date.now()}`,
  });
  console.log(`[Queue] SLA monitor job queued -> platform-jobs`);
}

/**
 * Setup recurring SLA monitor job
 */
export async function setupSLAMonitorCron(): Promise<void> {
  const jobId = 'sla-monitor-cron';

  // Remove existing cron job if it exists to avoid duplicates
  try {
    const repeatableJobs = await platformQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId || job.name === 'check-sla') {
        await platformQueue.removeRepeatableByKey(job.key);
        console.log(`[Queue] Removed existing SLA monitor cron job: ${job.id}`);
      }
    }
  } catch (error) {
    console.error('[Queue] Error clearing SLA cron:', error);
  }

  // Add new repeatable job (every 15 minutes)
  await platformQueue.add('check-sla', {}, {
    repeat: { pattern: '*/15 * * * *' },
    jobId,
  });

  console.log('[Queue] SLA monitor cron job scheduled (every 15 minutes)');
}