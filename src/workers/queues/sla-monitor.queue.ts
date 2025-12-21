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