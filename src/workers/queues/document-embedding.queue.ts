import { platformQueue } from './platform.queue';

/**
 * Document Embedding Queue (Legacy Wrapper)
 */
export const documentEmbeddingQueue = platformQueue;

/**
 * Job data interface
 */
export interface DocumentEmbeddingJobData {
  documentId: string;
  orgId: string;
  force?: boolean; // Force re-embedding even if embeddings already exist
}

/**
 * Add document embedding job
 */
export async function queueDocumentEmbedding(
  data: DocumentEmbeddingJobData
): Promise<void> {
  await platformQueue.add('embed-document', data, {
    jobId: `embed-${data.documentId}`,
  });

  console.log(`[Queue] Document embedding job queued: ${data.documentId} -> platform-jobs`);
}

/**
 * Retry document embedding
 */
export async function retryDocumentEmbedding(
  data: DocumentEmbeddingJobData
): Promise<void> {
  const jobId = `embed-${data.documentId}`;

  try {
    const existingJob = await platformQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
    }
  } catch (error) {}

  await platformQueue.add('embed-document', data, {
    jobId,
  });

  console.log(`[Queue] Document embedding retry job queued: ${data.documentId} -> platform-jobs`);
}

/**
 * Get embedding queue stats
 */
export async function getEmbeddingQueueStats() {
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