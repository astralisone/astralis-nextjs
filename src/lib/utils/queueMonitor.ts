import { Queue, Job } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * Queue Monitor Utilities
 *
 * Provides monitoring and management functions for BullMQ queues.
 * Used by the worker monitoring API for health checks and job management.
 */

// ============================================================================
// Types
// ============================================================================

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface JobInfo {
  id: string;
  name: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
  failedReason?: string;
  attemptsMade: number;
  data?: Record<string, unknown>;
}

export interface WorkerHealth {
  redis: 'connected' | 'disconnected';
  workers: Record<string, 'running' | 'paused' | 'stopped'>;
}

// ============================================================================
// Redis Connection for Queue Operations
// ============================================================================

let redisConnection: Redis | null = null;

/**
 * Get or create Redis connection for queue monitoring
 */
function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      }
    );
  }
  return redisConnection;
}

/**
 * Get a Queue instance for monitoring
 */
function getQueue(queueName: string): Queue {
  return new Queue(queueName, {
    connection: getRedisConnection(),
  });
}

// ============================================================================
// Queue Statistics
// ============================================================================

/**
 * Get statistics for a queue
 *
 * @param queueName - Name of the queue to get stats for
 * @returns Promise<QueueStats> - Queue statistics including job counts
 */
export async function getQueueStats(queueName: string): Promise<QueueStats> {
  const queue = getQueue(queueName);

  try {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused(),
    ]);

    return {
      name: queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    };
  } finally {
    await queue.close();
  }
}

/**
 * Get statistics for multiple queues
 *
 * @param queueNames - Array of queue names
 * @returns Promise<Record<string, QueueStats>> - Map of queue name to stats
 */
export async function getMultipleQueueStats(
  queueNames: string[]
): Promise<Record<string, QueueStats>> {
  const stats = await Promise.all(queueNames.map(getQueueStats));
  return Object.fromEntries(stats.map((s) => [s.name, s]));
}

// ============================================================================
// Job Information
// ============================================================================

/**
 * Map BullMQ job state to simplified status
 */
function mapJobState(state: string): JobInfo['status'] {
  switch (state) {
    case 'waiting':
    case 'prioritized':
    case 'wait':
      return 'waiting';
    case 'active':
      return 'active';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    case 'delayed':
      return 'delayed';
    default:
      return 'waiting';
  }
}

/**
 * Convert Job to JobInfo
 */
function jobToInfo(job: Job, status: JobInfo['status']): JobInfo {
  return {
    id: job.id || 'unknown',
    name: job.name,
    status,
    createdAt: job.timestamp ? new Date(job.timestamp).toISOString() : new Date().toISOString(),
    processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : undefined,
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
    failedReason: job.failedReason || undefined,
    attemptsMade: job.attemptsMade,
    data: job.data as Record<string, unknown> | undefined,
  };
}

/**
 * Get recent jobs from a queue
 *
 * @param queueName - Name of the queue
 * @param limit - Maximum number of jobs to return (default 20)
 * @returns Promise<JobInfo[]> - Array of recent jobs
 */
export async function getRecentJobs(
  queueName: string,
  limit: number = 20
): Promise<JobInfo[]> {
  const queue = getQueue(queueName);

  try {
    // Fetch jobs from different states
    const perStateLimit = Math.ceil(limit / 4);

    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaiting(0, perStateLimit),
      queue.getActive(0, perStateLimit),
      queue.getCompleted(0, perStateLimit),
      queue.getFailed(0, perStateLimit),
    ]);

    // Convert and combine jobs
    const jobs: JobInfo[] = [
      ...active.map((job) => jobToInfo(job, 'active')),
      ...waiting.map((job) => jobToInfo(job, 'waiting')),
      ...failed.map((job) => jobToInfo(job, 'failed')),
      ...completed.map((job) => jobToInfo(job, 'completed')),
    ];

    // Sort by creation time (newest first) and limit
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return jobs.slice(0, limit);
  } finally {
    await queue.close();
  }
}

/**
 * Get a specific job by ID
 *
 * @param queueName - Name of the queue
 * @param jobId - ID of the job
 * @returns Promise<JobInfo | null> - Job info or null if not found
 */
export async function getJobById(
  queueName: string,
  jobId: string
): Promise<JobInfo | null> {
  const queue = getQueue(queueName);

  try {
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return jobToInfo(job, mapJobState(state));
  } finally {
    await queue.close();
  }
}

// ============================================================================
// Queue Management Actions
// ============================================================================

/**
 * Pause a queue
 *
 * @param queueName - Name of the queue to pause
 */
export async function pauseQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  try {
    await queue.pause();
    console.log(`[QueueMonitor] Queue ${queueName} paused`);
  } finally {
    await queue.close();
  }
}

/**
 * Resume a paused queue
 *
 * @param queueName - Name of the queue to resume
 */
export async function resumeQueue(queueName: string): Promise<void> {
  const queue = getQueue(queueName);

  try {
    await queue.resume();
    console.log(`[QueueMonitor] Queue ${queueName} resumed`);
  } finally {
    await queue.close();
  }
}

/**
 * Retry all failed jobs in a queue
 *
 * @param queueName - Name of the queue
 * @returns Promise<number> - Number of jobs retried
 */
export async function retryFailedJobs(queueName: string): Promise<number> {
  const queue = getQueue(queueName);

  try {
    const failedJobs = await queue.getFailed(0, 1000);
    let retriedCount = 0;

    for (const job of failedJobs) {
      try {
        await job.retry();
        retriedCount++;
      } catch (error) {
        console.error(`[QueueMonitor] Failed to retry job ${job.id}:`, error);
      }
    }

    console.log(`[QueueMonitor] Retried ${retriedCount} failed jobs in ${queueName}`);
    return retriedCount;
  } finally {
    await queue.close();
  }
}

/**
 * Retry a specific failed job
 *
 * @param queueName - Name of the queue
 * @param jobId - ID of the job to retry
 * @returns Promise<boolean> - True if job was retried
 */
export async function retryJob(queueName: string, jobId: string): Promise<boolean> {
  const queue = getQueue(queueName);

  try {
    const job = await queue.getJob(jobId);
    if (!job) {
      console.error(`[QueueMonitor] Job ${jobId} not found in ${queueName}`);
      return false;
    }

    const state = await job.getState();
    if (state !== 'failed') {
      console.error(`[QueueMonitor] Job ${jobId} is not in failed state (current: ${state})`);
      return false;
    }

    await job.retry();
    console.log(`[QueueMonitor] Job ${jobId} retried in ${queueName}`);
    return true;
  } finally {
    await queue.close();
  }
}

/**
 * Clean completed jobs from a queue
 *
 * @param queueName - Name of the queue
 * @param ageMs - Max age of jobs to keep (in milliseconds, default 24 hours)
 * @returns Promise<number> - Number of jobs cleaned
 */
export async function cleanCompletedJobs(
  queueName: string,
  ageMs: number = 24 * 60 * 60 * 1000
): Promise<number> {
  const queue = getQueue(queueName);

  try {
    const cleaned = await queue.clean(ageMs, 1000, 'completed');
    console.log(`[QueueMonitor] Cleaned ${cleaned.length} completed jobs from ${queueName}`);
    return cleaned.length;
  } finally {
    await queue.close();
  }
}

/**
 * Clean failed jobs from a queue
 *
 * @param queueName - Name of the queue
 * @param ageMs - Max age of jobs to keep (in milliseconds, default 7 days)
 * @returns Promise<number> - Number of jobs cleaned
 */
export async function cleanFailedJobs(
  queueName: string,
  ageMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<number> {
  const queue = getQueue(queueName);

  try {
    const cleaned = await queue.clean(ageMs, 1000, 'failed');
    console.log(`[QueueMonitor] Cleaned ${cleaned.length} failed jobs from ${queueName}`);
    return cleaned.length;
  } finally {
    await queue.close();
  }
}

// ============================================================================
// Health Checks
// ============================================================================

/**
 * Check Redis connection health
 *
 * @returns Promise<'connected' | 'disconnected'>
 */
export async function checkRedisHealth(): Promise<'connected' | 'disconnected'> {
  try {
    const redis = getRedisConnection();
    const result = await redis.ping();
    return result === 'PONG' ? 'connected' : 'disconnected';
  } catch (error) {
    console.error('[QueueMonitor] Redis health check failed:', error);
    return 'disconnected';
  }
}

/**
 * Check if a queue has workers running
 * Note: This checks if the queue is paused and has workers registered
 *
 * @param queueName - Name of the queue
 * @returns Promise<'running' | 'paused' | 'stopped'>
 */
export async function checkWorkerStatus(
  queueName: string
): Promise<'running' | 'paused' | 'stopped'> {
  const queue = getQueue(queueName);

  try {
    const isPaused = await queue.isPaused();
    if (isPaused) {
      return 'paused';
    }

    // Check if there are workers by looking at active jobs and worker count
    const workers = await queue.getWorkers();
    if (workers.length === 0) {
      return 'stopped';
    }

    return 'running';
  } catch (error) {
    console.error(`[QueueMonitor] Worker status check failed for ${queueName}:`, error);
    return 'stopped';
  } finally {
    await queue.close();
  }
}

/**
 * Get overall worker health
 *
 * @param queueNames - Array of queue names to check
 * @returns Promise<WorkerHealth>
 */
export async function getWorkerHealth(queueNames: string[]): Promise<WorkerHealth> {
  const [redisStatus, ...workerStatuses] = await Promise.all([
    checkRedisHealth(),
    ...queueNames.map(checkWorkerStatus),
  ]);

  const workers: Record<string, 'running' | 'paused' | 'stopped'> = {};
  queueNames.forEach((name, index) => {
    workers[name] = workerStatuses[index];
  });

  return {
    redis: redisStatus,
    workers,
  };
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Close the Redis connection (call on shutdown)
 */
export async function closeQueueMonitor(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log('[QueueMonitor] Redis connection closed');
  }
}
