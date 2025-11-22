import { Queue, JobsOptions } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Scheduling Agent Queue
 *
 * Handles asynchronous processing of scheduling agent tasks including:
 * - AI classification of incoming requests
 * - Meeting scheduling with conflict detection
 * - Response generation and delivery
 * - Task retry handling
 */

// Job type definitions
export type SchedulingAgentJobType =
  | 'process-inbox'
  | 'schedule-meeting'
  | 'send-response'
  | 'retry-task';

// Job data interfaces for each job type
export interface ProcessInboxJobData {
  taskId: string;
  orgId?: string;
  userId: string;
  priority?: number;
}

export interface ScheduleMeetingJobData {
  taskId: string;
  orgId?: string;
  userId: string;
  schedulingData: {
    title: string;
    startTime: string;
    endTime: string;
    participants?: string[];
    location?: string;
    description?: string;
  };
  checkConflicts?: boolean;
}

export interface SendResponseJobData {
  taskId: string;
  userId: string;
  responseType: 'confirmation' | 'alternatives' | 'error' | 'clarification';
  channel: 'email' | 'sms' | 'chat' | 'webhook';
  recipientEmail?: string;
  recipientPhone?: string;
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface RetryTaskJobData {
  taskId: string;
  orgId?: string;
  userId: string;
  reason: string;
  previousAttempts: number;
}

// Union type for all job data
export type SchedulingAgentJobData =
  | { type: 'process-inbox'; data: ProcessInboxJobData }
  | { type: 'schedule-meeting'; data: ScheduleMeetingJobData }
  | { type: 'send-response'; data: SendResponseJobData }
  | { type: 'retry-task'; data: RetryTaskJobData };

/**
 * Default job options for the scheduling agent queue
 */
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2s delay
  },
  removeOnComplete: {
    age: 86400, // Keep completed jobs for 24 hours
  },
  removeOnFail: {
    age: 604800, // Keep failed jobs for 7 days
  },
};

/**
 * Scheduling Agent Queue instance
 */
export const schedulingAgentQueue = new Queue<SchedulingAgentJobData>('scheduling-agent', {
  connection: redisConnection,
  defaultJobOptions,
});

/**
 * Queue a new inbox processing job
 * Processes a new task and runs AI classification
 */
export async function queueProcessInbox(
  data: ProcessInboxJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await schedulingAgentQueue.add(
    'process-inbox',
    { type: 'process-inbox', data },
    {
      jobId: `process-inbox-${data.taskId}`,
      priority: data.priority || 3,
      ...options,
    }
  );

  console.log(`[SchedulingAgentQueue] Queued process-inbox job: ${data.taskId}`);
  return job.id || '';
}

/**
 * Queue a meeting scheduling job
 * Executes scheduling with conflict detection
 */
export async function queueScheduleMeeting(
  data: ScheduleMeetingJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await schedulingAgentQueue.add(
    'schedule-meeting',
    { type: 'schedule-meeting', data },
    {
      jobId: `schedule-meeting-${data.taskId}`,
      priority: 2, // Higher priority for scheduling actions
      ...options,
    }
  );

  console.log(`[SchedulingAgentQueue] Queued schedule-meeting job: ${data.taskId}`);
  return job.id || '';
}

/**
 * Queue a response sending job
 * Generates and sends response to user via specified channel
 */
export async function queueSendResponse(
  data: SendResponseJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await schedulingAgentQueue.add(
    'send-response',
    { type: 'send-response', data },
    {
      jobId: `send-response-${data.taskId}-${Date.now()}`,
      priority: 2,
      ...options,
    }
  );

  console.log(`[SchedulingAgentQueue] Queued send-response job: ${data.taskId} (${data.responseType})`);
  return job.id || '';
}

/**
 * Queue a task retry job
 * Retries a failed task with exponential backoff
 */
export async function queueRetryTask(
  data: RetryTaskJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  // Remove any existing retry job for this task
  try {
    const existingJob = await schedulingAgentQueue.getJob(`retry-task-${data.taskId}`);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[SchedulingAgentQueue] Removed existing retry job for task: ${data.taskId}`);
    }
  } catch {
    // Job might not exist, continue
  }

  const job = await schedulingAgentQueue.add(
    'retry-task',
    { type: 'retry-task', data },
    {
      jobId: `retry-task-${data.taskId}`,
      priority: 4, // Lower priority for retries
      delay: Math.min(data.previousAttempts * 5000, 60000), // Progressive delay, max 60s
      ...options,
    }
  );

  console.log(`[SchedulingAgentQueue] Queued retry-task job: ${data.taskId} (attempt ${data.previousAttempts + 1})`);
  return job.id || '';
}

/**
 * Queue an urgent inbox processing job (high priority)
 */
export async function queueProcessInboxUrgent(
  data: ProcessInboxJobData
): Promise<string> {
  return queueProcessInbox(
    { ...data, priority: 1 },
    { priority: 1 }
  );
}

/**
 * Get queue statistics
 */
export async function getSchedulingAgentQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    schedulingAgentQueue.getWaitingCount(),
    schedulingAgentQueue.getActiveCount(),
    schedulingAgentQueue.getCompletedCount(),
    schedulingAgentQueue.getFailedCount(),
    schedulingAgentQueue.getDelayedCount(),
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

/**
 * Get jobs by type
 */
export async function getJobsByType(
  type: SchedulingAgentJobType,
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' = 'waiting',
  limit = 100
) {
  let jobs;
  switch (status) {
    case 'waiting':
      jobs = await schedulingAgentQueue.getWaiting(0, limit);
      break;
    case 'active':
      jobs = await schedulingAgentQueue.getActive(0, limit);
      break;
    case 'completed':
      jobs = await schedulingAgentQueue.getCompleted(0, limit);
      break;
    case 'failed':
      jobs = await schedulingAgentQueue.getFailed(0, limit);
      break;
    case 'delayed':
      jobs = await schedulingAgentQueue.getDelayed(0, limit);
      break;
  }

  return jobs.filter((job) => job.name === type);
}

/**
 * Pause the queue
 */
export async function pauseSchedulingAgentQueue(): Promise<void> {
  await schedulingAgentQueue.pause();
  console.log('[SchedulingAgentQueue] Queue paused');
}

/**
 * Resume the queue
 */
export async function resumeSchedulingAgentQueue(): Promise<void> {
  await schedulingAgentQueue.resume();
  console.log('[SchedulingAgentQueue] Queue resumed');
}

/**
 * Clean old jobs from the queue
 */
export async function cleanSchedulingAgentQueue(
  grace: number = 86400000, // 24 hours in ms
  limit: number = 1000
): Promise<void> {
  await Promise.all([
    schedulingAgentQueue.clean(grace, limit, 'completed'),
    schedulingAgentQueue.clean(grace * 7, limit, 'failed'), // 7 days for failed
  ]);
  console.log('[SchedulingAgentQueue] Queue cleaned');
}

// ============================================================================
// Legacy/Backward-Compatible Exports
// ============================================================================

/**
 * Legacy job data interface for backward compatibility with existing API routes
 */
export interface LegacySchedulingAgentJobData {
  taskId: string;
  userId: string;
  orgId?: string;
  jobType: 'process-inbox' | 'schedule-meeting' | 'send-alternatives' | 'send-reminder' | 'process-followup';
  source: 'FORM' | 'EMAIL' | 'SMS' | 'API' | 'CHAT' | 'VOICE';
  sourceId?: string;
  content: string;
  metadata?: Record<string, unknown>;
  priority?: number;
}

/**
 * Add scheduling agent job to queue (legacy interface)
 * @deprecated Use queueProcessInbox, queueScheduleMeeting, queueSendResponse, or queueRetryTask instead
 */
export async function queueSchedulingAgentTask(
  data: LegacySchedulingAgentJobData
): Promise<string> {
  // Map legacy job types to new interface
  if (data.jobType === 'process-inbox') {
    return queueProcessInbox({
      taskId: data.taskId,
      userId: data.userId,
      orgId: data.orgId,
      priority: data.priority,
    });
  }

  // For other legacy job types, queue as process-inbox to be classified
  const job = await schedulingAgentQueue.add(
    'process-inbox',
    {
      type: 'process-inbox',
      data: {
        taskId: data.taskId,
        userId: data.userId,
        orgId: data.orgId,
        priority: data.priority,
      },
    },
    {
      jobId: `agent-task-${data.taskId}`,
      priority: data.priority || 3,
    }
  );

  console.log(`[SchedulingAgentQueue] Legacy job queued: ${data.taskId} (type: ${data.jobType}, source: ${data.source})`);

  return job.id || data.taskId;
}

/**
 * Queue a scheduling agent task with high priority (legacy interface)
 * @deprecated Use queueProcessInboxUrgent instead
 */
export async function queueSchedulingAgentTaskUrgent(
  data: LegacySchedulingAgentJobData
): Promise<string> {
  return queueProcessInboxUrgent({
    taskId: data.taskId,
    userId: data.userId,
    orgId: data.orgId,
    priority: 1,
  });
}

/**
 * Retry a scheduling agent task (legacy interface)
 * @deprecated Use queueRetryTask instead
 */
export async function retrySchedulingAgentTask(
  data: LegacySchedulingAgentJobData
): Promise<string> {
  const jobId = `agent-task-${data.taskId}`;

  // Try to remove any existing job with this ID
  try {
    const existingJob = await schedulingAgentQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[SchedulingAgentQueue] Removed existing job for retry: ${data.taskId}`);
    }
  } catch {
    // Job might not exist, continue
  }

  return queueSchedulingAgentTask(data);
}
