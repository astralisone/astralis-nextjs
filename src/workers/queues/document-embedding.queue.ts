import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Document Embedding Queue
 *
 * Handles asynchronous document embedding generation for RAG
 */
export const documentEmbeddingQueue = new Queue('document-embedding', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // Start with 10s delay (longer than OCR due to API calls)
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
  await documentEmbeddingQueue.add('embed-document', data, {
    jobId: `embed-${data.documentId}`,
  });

  console.log(`[Queue] Document embedding job queued: ${data.documentId}`);
}

/**
 * Retry document embedding (removes old job first)
 */
export async function retryDocumentEmbedding(
  data: DocumentEmbeddingJobData
): Promise<void> {
  const jobId = `embed-${data.documentId}`;

  // Try to remove any existing job with this ID
  try {
    const existingJob = await documentEmbeddingQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[Queue] Removed existing embedding job for retry: ${data.documentId}`);
    }
  } catch (error) {
    // Job might not exist, that's fine
    console.log(`[Queue] No existing embedding job to remove: ${data.documentId}`);
  }

  // Queue new job
  await documentEmbeddingQueue.add('embed-document', data, {
    jobId,
  });

  console.log(`[Queue] Document embedding retry job queued: ${data.documentId}`);
}

/**
 * Get embedding queue stats
 */
export async function getEmbeddingQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    documentEmbeddingQueue.getWaitingCount(),
    documentEmbeddingQueue.getActiveCount(),
    documentEmbeddingQueue.getCompletedCount(),
    documentEmbeddingQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}
