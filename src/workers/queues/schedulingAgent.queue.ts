import { JobsOptions } from 'bullmq';
import { platformQueue } from './platform.queue';

/**
 * Scheduling Agent Queue (Legacy Wrapper)
 */
export const schedulingAgentQueue = platformQueue;

// Job type definitions
export type SchedulingAgentJobType =
  | 'process-inbox'
  | 'schedule-meeting'
  | 'send-response'
  | 'retry-task';

// Job data interfaces
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

/**
 * Queue a new inbox processing job
 */
export async function queueProcessInbox(
  data: ProcessInboxJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await platformQueue.add(
    'process-inbox',
    { type: 'process-inbox', data },
    {
      jobId: `process-inbox-${data.taskId}`,
      priority: data.priority || 3,
      ...options,
    }
  );

  console.log(`[Queue] Queued process-inbox job: ${data.taskId} -> platform-jobs`);
  return job.id || '';
}

/**
 * Queue a meeting scheduling job
 */
export async function queueScheduleMeeting(
  data: ScheduleMeetingJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await platformQueue.add(
    'schedule-meeting',
    { type: 'schedule-meeting', data },
    {
      jobId: `schedule-meeting-${data.taskId}`,
      priority: 2,
      ...options,
    }
  );

  console.log(`[Queue] Queued schedule-meeting job: ${data.taskId} -> platform-jobs`);
  return job.id || '';
}

/**
 * Queue a response sending job
 */
export async function queueSendResponse(
  data: SendResponseJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const job = await platformQueue.add(
    'send-response',
    { type: 'send-response', data },
    {
      jobId: `send-response-${data.taskId}-${Date.now()}`,
      priority: 2,
      ...options,
    }
  );

  console.log(`[Queue] Queued send-response job: ${data.taskId} -> platform-jobs`);
  return job.id || '';
}

/**
 * Queue a task retry job
 */
export async function queueRetryTask(
  data: RetryTaskJobData,
  options?: Partial<JobsOptions>
): Promise<string> {
  const jobId = `retry-task-${data.taskId}`;
  try {
    const existingJob = await platformQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }
  } catch {}

  const job = await platformQueue.add(
    'retry-task',
    { type: 'retry-task', data },
    {
      jobId,
      priority: 4,
      delay: Math.min(data.previousAttempts * 5000, 60000),
      ...options,
    }
  );

  console.log(`[Queue] Queued retry-task job: ${data.taskId} -> platform-jobs`);
  return job.id || '';
}

/**
 * Queue an urgent inbox processing job
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