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
import { platformJobProcessor } from './platform.worker';
import { initializeSLAMonitorJob } from './jobs/sla-monitor.job';
import { initializeReminderSchedulerJob } from './jobs/reminder-scheduler.job';
import { initializeHealthCheckJob } from './jobs/health-check.job';
import { initializePendingItemsSyncJob } from './jobs/pending-items-sync.job';

/**
 * Worker Bootstrap
 * 
 * Optimized to use a single "Omni-Worker" to reduce Redis connection count.
 */

async function startWorkers() {
  console.log('[Workers] Starting Optimized Omni-Worker...');

  // Verify environment variables
  console.log('[Workers] Environment check:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
  console.log('  - REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');

  if (!process.env.OPENAI_API_KEY || !process.env.DATABASE_URL) {
    throw new Error('CRITICAL: Missing environment variables. Worker cannot start.');
  }

  // Wait for Redis
  if (redisConnection) {
    if (redisConnection.status !== 'ready') {
      await new Promise((resolve) => {
        redisConnection!.once('ready', resolve);
      });
    }
  } else {
    console.error('[Workers] CRITICAL: Cannot start workers - redisConnection is null. Check REDIS_URL.');
    process.exit(1);
  }

  /**
   * THE OMNI-WORKER
   * Consolidates 9 workers into 1.
   * Connection count: 3 (1 client, 1 subscriber, 1 blocking).
   */
  const omniWorker = new Worker('platform-jobs', platformJobProcessor, {
    connection: redisConnection,
    concurrency: 5, // Total parallel jobs across all types
    lockDuration: 30000,
  });

  omniWorker.on('completed', (job) => {
    console.log(`[OmniWorker] Job ${job.id} (${job.name}) completed`);
  });

  omniWorker.on('failed', (job, err) => {
    console.error(`[OmniWorker] Job ${job?.id} (${job?.name}) FAILED:`, err.message);
  });

  omniWorker.on('error', (err) => {
    console.error('[OmniWorker] Fatal error:', err);
  });

  console.log('[Workers] Omni-Worker active (concurrency: 5)');

  // Initialize cron jobs
  try {
    await Promise.all([
      initializeSLAMonitorJob(),
      initializeReminderSchedulerJob(),
      initializeHealthCheckJob(),
      initializePendingItemsSyncJob()
    ]);
    console.log('[Workers] All cron jobs initialized');
  } catch (error) {
    console.error('[Workers] Cron initialization failed:', error);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Workers] Shutting down...');
    await omniWorker.close();
    if (redisConnection) await redisConnection.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startWorkers().catch((error) => {
  console.error('[Workers] Startup failed:', error);
  process.exit(1);
});