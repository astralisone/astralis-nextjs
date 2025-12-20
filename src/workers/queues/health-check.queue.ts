import { Queue } from 'bullmq';
import { redisConnection } from '../redis';

/**
 * Health Check Queue
 * 
 * Handles periodic business pulse and system health monitoring via AI.
 */
export const healthCheckQueue = new Queue('health-check', {
    connection: redisConnection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 100,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    },
});

export interface HealthCheckJobData {
    orgId?: string;
}

export async function queueHealthCheck(data: HealthCheckJobData = {}): Promise<void> {
    await healthCheckQueue.add('perform-health-check', data);
}

export async function setupHealthCheckCron(): Promise<void> {
    // Remove existing repeatable jobs
    const existingJobs = await healthCheckQueue.getRepeatableJobs();
    for (const job of existingJobs) {
        if (job.name === 'health-check-cron') {
            await healthCheckQueue.removeRepeatableByKey(job.key);
        }
    }

    // Add new repeatable job (every 30 minutes)
    await healthCheckQueue.add(
        'health-check-cron',
        {},
        {
            repeat: {
                pattern: '*/30 * * * *',
            },
            jobId: 'business-pulse-health-check',
        }
    );

    console.log('[Queue] Business health check cron job scheduled (every 30 minutes)');
}
