import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Intake Routing Queue
 *
 * Handles asynchronous AI-powered routing of intake requests
 * to appropriate team members, pipelines, and workflows.
 */
export const intakeRoutingQueue = new Queue('intake-routing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000, // Start with 3s delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

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
  await intakeRoutingQueue.add('route-intake', data, {
    jobId: `intake-${data.intakeRequestId}`,
    priority: data.priority || 2, // Default medium priority
  });

  console.log(`[Queue] Intake routing job queued: ${data.intakeRequestId} (source: ${data.source})`);
}

/**
 * Queue an intake request with high priority (urgent/important emails)
 */
export async function queueIntakeRoutingUrgent(
  data: IntakeRoutingJobData
): Promise<void> {
  await intakeRoutingQueue.add('route-intake', data, {
    jobId: `intake-${data.intakeRequestId}`,
    priority: 1, // High priority
  });

  console.log(`[Queue] Urgent intake routing job queued: ${data.intakeRequestId}`);
}

/**
 * Retry intake routing (removes old job first)
 */
export async function retryIntakeRouting(
  data: IntakeRoutingJobData
): Promise<void> {
  const jobId = `intake-${data.intakeRequestId}`;

  // Try to remove any existing job with this ID
  try {
    const existingJob = await intakeRoutingQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[Queue] Removed existing intake job for retry: ${data.intakeRequestId}`);
    }
  } catch (error) {
    // Job might not exist, that's fine
    console.log(`[Queue] No existing intake job to remove: ${data.intakeRequestId}`);
  }

  // Queue new job
  await intakeRoutingQueue.add('route-intake', data, {
    jobId,
    priority: data.priority || 2,
  });

  console.log(`[Queue] Intake retry job queued: ${data.intakeRequestId}`);
}

/**
 * Get intake routing queue stats
 */
export async function getIntakeRoutingQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    intakeRoutingQueue.getWaitingCount(),
    intakeRoutingQueue.getActiveCount(),
    intakeRoutingQueue.getCompletedCount(),
    intakeRoutingQueue.getFailedCount(),
    intakeRoutingQueue.getDelayedCount(),
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
