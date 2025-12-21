import { Queue, JobsOptions } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Unified Platform Jobs Queue
 * 
 * Replacing multiple specialized queues with a single one to save Redis connections.
 * Uses a getter to prevent errors when Redis is not available during initialization.
 */

let internalQueue: Queue | null = null;

export const getPlatformQueue = (): Queue => {
  if (internalQueue) return internalQueue;

  if (!redisConnection) {
    // If we're here, it means something tried to use the queue but Redis isn't configured
    // We'll throw a more descriptive error or return a proxy that logs warnings
    console.error('[Queue] CRITICAL: Attempted to access platformQueue but redisConnection is null. Check REDIS_URL.');
    throw new Error('Redis connection is required for background jobs. Please configure REDIS_URL.');
  }

  internalQueue = new Queue('platform-jobs', {
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

  return internalQueue;
};

/**
 * Unified Platform Jobs Queue Export
 * Made a getter to avoid initialization crashes
 */
export const platformQueue = new Proxy({} as Queue, {
  get: (target, prop) => {
    const queue = getPlatformQueue();
    const val = (queue as any)[prop];
    if (typeof val === 'function') {
      return val.bind(queue);
    }
    return val;
  }
});

/**
 * Generic helper to add jobs to the platform queue
 */
export async function addPlatformJob(name: string, data: any, options?: JobsOptions) {
  return getPlatformQueue().add(name, data, options);
}

/**
 * Get unified queue stats
 */
export async function getPlatformQueueStats() {
  const queue = getPlatformQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
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