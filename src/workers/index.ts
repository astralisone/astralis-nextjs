// Load environment variables from .env files
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first (takes precedence), then .env
const envLocal = resolve(process.cwd(), '.env.local');
const envFile = resolve(process.cwd(), '.env');
config({ path: envLocal });
config({ path: envFile });

import { Worker } from 'bullmq';
import { redisConnection } from './redis';
import { processDocumentOCR } from './processors/ocr.processor';
import { processDocumentEmbedding } from './processors/embedding.processor';
import { processIntakeRouting } from './processors/intakeRouting.processor';
import { processCalendarSync } from './processors/calendarSync.processor';
import { processSchedulingReminder } from './processors/schedulingReminder.processor';

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
  console.log('  - SPACES_BUCKET:', process.env.SPACES_BUCKET || 'NOT SET');
  console.log('  - SPACES_ENDPOINT:', process.env.SPACES_ENDPOINT || 'NOT SET');

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

  // Intake routing worker (AI-powered request routing)
  const intakeRoutingWorker = new Worker('intake-routing', processIntakeRouting, {
    connection: redisConnection,
    concurrency: 5, // Higher concurrency for lightweight routing operations
  });

  // Calendar sync worker (Google Calendar synchronization)
  const calendarSyncWorker = new Worker('calendar-sync', processCalendarSync, {
    connection: redisConnection,
    concurrency: 2, // Lower concurrency due to external API rate limits
  });

  // Scheduling reminder worker (email reminders for events)
  const schedulingReminderWorker = new Worker('scheduling-reminders', processSchedulingReminder, {
    connection: redisConnection,
    concurrency: 5, // Higher concurrency for email sending
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

  // Intake routing worker event handlers
  intakeRoutingWorker.on('completed', (job) => {
    console.log(`[Worker:IntakeRouting] Job ${job.id} completed`);
  });

  intakeRoutingWorker.on('failed', (job, err) => {
    console.error(`[Worker:IntakeRouting] Job ${job?.id} failed:`, err.message);
  });

  intakeRoutingWorker.on('error', (err) => {
    console.error('[Worker:IntakeRouting] Worker error:', err);
  });

  // Calendar sync worker event handlers
  calendarSyncWorker.on('completed', (job) => {
    console.log(`[Worker:CalendarSync] Job ${job.id} completed`);
  });

  calendarSyncWorker.on('failed', (job, err) => {
    console.error(`[Worker:CalendarSync] Job ${job?.id} failed:`, err.message);
  });

  calendarSyncWorker.on('error', (err) => {
    console.error('[Worker:CalendarSync] Worker error:', err);
  });

  // Scheduling reminder worker event handlers
  schedulingReminderWorker.on('completed', (job) => {
    console.log(`[Worker:SchedulingReminder] Job ${job.id} completed`);
  });

  schedulingReminderWorker.on('failed', (job, err) => {
    console.error(`[Worker:SchedulingReminder] Job ${job?.id} failed:`, err.message);
  });

  schedulingReminderWorker.on('error', (err) => {
    console.error('[Worker:SchedulingReminder] Worker error:', err);
  });

  console.log('[Workers] Document processing worker started (concurrency: 3)');
  console.log('[Workers] Document embedding worker started (concurrency: 2)');
  console.log('[Workers] Intake routing worker started (concurrency: 5)');
  console.log('[Workers] Calendar sync worker started (concurrency: 2)');
  console.log('[Workers] Scheduling reminder worker started (concurrency: 5)');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Workers] Shutting down gracefully...');

    // Close all workers in parallel for faster shutdown
    await Promise.all([
      documentWorker.close(),
      embeddingWorker.close(),
      intakeRoutingWorker.close(),
      calendarSyncWorker.close(),
      schedulingReminderWorker.close(),
    ]);

    console.log('[Workers] All workers closed');
    await redisConnection.quit();
    console.log('[Workers] Redis connection closed');
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
