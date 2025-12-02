import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Document Processing Queue
 *
 * Handles asynchronous document OCR and data extraction
 */
export const documentProcessingQueue = new Queue('document-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay
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
 * Job data interface
 */
export interface DocumentProcessingJobData {
  documentId: string;
  orgId: string;
  documentType?: string; // invoice, receipt, form, generic
  performOCR?: boolean;
  performVisionExtraction?: boolean;
  language?: string;
}

/**
 * Add document processing job
 */
export async function queueDocumentProcessing(
  data: DocumentProcessingJobData
): Promise<void> {
  await documentProcessingQueue.add('process-document', data, {
    jobId: `doc-${data.documentId}`,
  });

  console.log(`[Queue] Document processing job queued: ${data.documentId}`);
}

/**
 * Retry document processing (removes old job first)
 */
export async function retryDocumentProcessing(
  data: DocumentProcessingJobData
): Promise<void> {
  const jobId = `doc-${data.documentId}`;

  // Try to remove any existing job with this ID
  try {
    const existingJob = await documentProcessingQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[Queue] Removed existing job for retry: ${data.documentId}`);
    }
  } catch (error) {
    // Job might not exist, that's fine
    console.log(`[Queue] No existing job to remove: ${data.documentId}`);
  }

  // Queue new job
  await documentProcessingQueue.add('process-document', data, {
    jobId,
  });

  console.log(`[Queue] Document retry job queued: ${data.documentId}`);
}

/**
 * Get queue stats
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    documentProcessingQueue.getWaitingCount(),
    documentProcessingQueue.getActiveCount(),
    documentProcessingQueue.getCompletedCount(),
    documentProcessingQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}
