import { platformQueue } from './platform.queue';

/**
 * Health Check Queue (Legacy Wrapper)
 */
export const healthCheckQueue = platformQueue;

export async function queueHealthCheck(data: any = {}): Promise<void> {
  await platformQueue.add('health-check', data, {
    jobId: `health-${Date.now()}`,
  });
  console.log(`[Queue] Health check job queued -> platform-jobs`);
}

/**
 * Setup recurring health check job
 */
export async function setupHealthCheckCron(): Promise<void> {
  const jobId = 'health-check-cron';

  try {
    const repeatableJobs = await platformQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId || job.name === 'health-check') {
        await platformQueue.removeRepeatableByKey(job.key);
      }
    }
  } catch (error) {}

  // Add new repeatable job (every 30 minutes)
  await platformQueue.add('health-check', {}, {
    repeat: { pattern: '*/30 * * * *' },
    jobId,
  });

  console.log('[Queue] Business health check cron job scheduled (every 30 minutes)');
}