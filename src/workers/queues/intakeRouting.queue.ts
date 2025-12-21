import { platformQueue } from './platform.queue';

/**
 * Intake Routing Queue (Legacy Wrapper)
 */
export const intakeRoutingQueue = platformQueue;

/**
 * Job data interface for intake routing
 */
export interface IntakeRoutingJobData {
  intakeRequestId: string;
  orgId: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  title: string;
  description?: string;
  requestData: Record<string, unknown>;
  priority?: number;
}

/**
 * Add intake routing job to queue
 */
export async function queueIntakeRouting(
  data: IntakeRoutingJobData
): Promise<void> {
  await platformQueue.add('route-intake', data, {
    jobId: `intake-${data.intakeRequestId}`,
    priority: data.priority || 2,
  });

  console.log(`[Queue] Intake routing job queued: ${data.intakeRequestId} -> platform-jobs`);
}

/**
 * Queue an intake request with high priority
 */
export async function queueIntakeRoutingUrgent(
  data: IntakeRoutingJobData
): Promise<void> {
  await platformQueue.add('route-intake', data, {
    jobId: `intake-${data.intakeRequestId}`,
    priority: 1,
  });

  console.log(`[Queue] Urgent intake routing job queued: ${data.intakeRequestId} -> platform-jobs`);
}

/**
 * Retry intake routing
 */
export async function retryIntakeRouting(
  data: IntakeRoutingJobData
): Promise<void> {
  const jobId = `intake-${data.intakeRequestId}`;

  try {
    const existingJob = await platformQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }
  } catch (error) {}

  await platformQueue.add('route-intake', data, {
    jobId,
    priority: data.priority || 2,
  });

  console.log(`[Queue] Intake retry job queued: ${data.intakeRequestId} -> platform-jobs`);
}

/**
 * Get intake routing queue stats
 */
export async function getIntakeRoutingQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    platformQueue.getWaitingCount(),
    platformQueue.getActiveCount(),
    platformQueue.getCompletedCount(),
    platformQueue.getFailedCount(),
    platformQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}