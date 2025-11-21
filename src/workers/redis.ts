import { Redis } from 'ioredis';

/**
 * Redis connection for BullMQ workers
 *
 * Uses IORedis for connection pooling and automatic reconnection
 */
export const redisConnection = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Required for BullMQ
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  }
);

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

redisConnection.on('ready', () => {
  console.log('[Redis] Ready to accept commands');
});

redisConnection.on('close', () => {
  console.log('[Redis] Connection closed');
});

redisConnection.on('reconnecting', () => {
  console.log('[Redis] Reconnecting...');
});
