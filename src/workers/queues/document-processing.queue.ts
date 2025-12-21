import { platformQueue } from './platform.queue';

/**
 * Document Processing Queue (Legacy Wrapper)
 */
export const documentProcessingQueue = platformQueue;

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
  await platformQueue.add('process-document', data, {
    jobId: `doc-${data.documentId}`,
  });

  console.log(`[Queue] Document processing job queued: ${data.documentId} -> platform-jobs`);
}

/**
 * Retry document processing
 */
export async function retryDocumentProcessing(
  data: DocumentProcessingJobData
): Promise<void> {
  const jobId = `doc-${data.documentId}`;

  try {
    const existingJob = await platformQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }
  } catch (error) {}

  await platformQueue.add('process-document', data, {
    jobId,
  });

  console.log(`[Queue] Document retry job queued: ${data.documentId} -> platform-jobs`);
}

/**
 * Get queue stats (Proxy to unified stats)
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    platformQueue.getWaitingCount(),
    platformQueue.getActiveCount(),
    platformQueue.getCompletedCount(),
    platformQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}
