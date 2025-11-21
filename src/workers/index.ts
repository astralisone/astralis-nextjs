import 'dotenv/config'; // Load environment variables from .env files
import { Worker } from 'bullmq';
import { redisConnection } from './redis';
import { processDocumentOCR } from './processors/ocr.processor';
import { processDocumentEmbedding } from './processors/embedding.processor';

/**
 * Worker Bootstrap
 *
 * Starts all background workers for document processing and embedding
 */

async function startWorkers() {
  console.log('[Workers] Starting document processing and embedding workers...');

  // Verify environment variables are loaded
  console.log('[Workers] Environment check:');
  console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET (' + process.env.OPENAI_API_KEY.substring(0, 20) + '...)' : 'NOT SET');
  console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('  - REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('CRITICAL: OPENAI_API_KEY environment variable is not set. Worker cannot start.');
  }

  // Redis auto-connects, so we just wait for ready state
  if (redisConnection.status !== 'ready') {
    await new Promise((resolve) => {
      redisConnection.once('ready', resolve);
    });
  }

  // Document processing worker (OCR)
  const documentWorker = new Worker('document-processing', processDocumentOCR, {
    connection: redisConnection,
    concurrency: 3, // Lower concurrency due to CPU-intensive OCR
  });

  // Document embedding worker (RAG embeddings)
  const embeddingWorker = new Worker('document-embedding', processDocumentEmbedding, {
    connection: redisConnection,
    concurrency: 2, // Lower concurrency due to API rate limits
  });

  // Document worker event handlers
  documentWorker.on('completed', (job) => {
    console.log(`[Worker:OCR] Job ${job.id} completed`);
  });

  documentWorker.on('failed', (job, err) => {
    console.error(`[Worker:OCR] Job ${job?.id} failed:`, err.message);
  });

  documentWorker.on('error', (err) => {
    console.error('[Worker:OCR] Worker error:', err);
  });

  // Embedding worker event handlers
  embeddingWorker.on('completed', (job) => {
    console.log(`[Worker:Embedding] Job ${job.id} completed`);
  });

  embeddingWorker.on('failed', (job, err) => {
    console.error(`[Worker:Embedding] Job ${job?.id} failed:`, err.message);
  });

  embeddingWorker.on('error', (err) => {
    console.error('[Worker:Embedding] Worker error:', err);
  });

  console.log('[Workers] Document processing worker started (concurrency: 3)');
  console.log('[Workers] Document embedding worker started (concurrency: 2)');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Workers] Shutting down gracefully...');
    await documentWorker.close();
    await embeddingWorker.close();
    await redisConnection.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start workers
startWorkers().catch((error) => {
  console.error('[Workers] Failed to start:', error);
  process.exit(1);
});
