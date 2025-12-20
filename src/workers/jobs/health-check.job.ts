import { setupHealthCheckCron } from '../queues/health-check.queue';

/**
 * Initialize the Health Check cron job
 */
export async function initializeHealthCheckJob(): Promise<void> {
    console.log('[Job:HealthCheck] Initializing business health check cron job...');

    try {
        await setupHealthCheckCron();
        console.log('[Job:HealthCheck] Health check cron job initialized successfully');
    } catch (error) {
        console.error('[Job:HealthCheck] Failed to initialize health check cron job', error);
        throw error;
    }
}
