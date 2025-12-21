
import { Queue, JobsOptions } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Unified Platform Jobs Queue
 * 
 * Replacing multiple specialized queues with a single one to save Redis connections
 */
export const platformQueue = new Queue('platform-jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

/**
 * Generic helper to add jobs to the platform queue
 */
export async function addPlatformJob(name: string, data: any, options?: JobsOptions) {
  return platformQueue.add(name, data, options);
}

/**
 * Get unified queue stats
 */
export async function getPlatformQueueStats() {
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
