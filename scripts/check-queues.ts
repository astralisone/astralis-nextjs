import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first (takes precedence), then .env
const envLocal = resolve(process.cwd(), '.env.local');
const envFile = resolve(process.cwd(), '.env');
config({ path: envLocal });
config({ path: envFile });

import { redisConnection } from '../src/workers/redis';
import { documentProcessingQueue } from '../src/workers/queues/document-processing.queue';
import { documentEmbeddingQueue } from '../src/workers/queues/document-embedding.queue';

async function checkQueues() {
    console.log('Checking BullMQ Queues...');

    const ocrStats = await documentProcessingQueue.getJobCounts();
    console.log('OCR Queue Stats:', ocrStats);

    const embeddingStats = await documentEmbeddingQueue.getJobCounts();
    console.log('Embedding Queue Stats:', embeddingStats);

    const failedOcrJobs = await documentProcessingQueue.getFailed();
    console.log('Failed OCR Jobs:', failedOcrJobs.length);
    if (failedOcrJobs.length > 0) {
        console.log('First 3 failed OCR jobs:', failedOcrJobs.slice(0, 3).map(j => ({ id: j.id, failedReason: j.failedReason })));
    }

    const failedEmbeddingJobs = await documentEmbeddingQueue.getFailed();
    console.log('Failed Embedding Jobs:', failedEmbeddingJobs.length);
    if (failedEmbeddingJobs.length > 0) {
        console.log('First 3 failed embedding jobs:', failedEmbeddingJobs.slice(0, 3).map(j => ({ id: j.id, failedReason: j.failedReason })));
    }

    process.exit(0);
}

checkQueues().catch(err => {
    console.error(err);
    process.exit(1);
});
