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