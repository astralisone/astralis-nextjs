import { Redis } from 'ioredis';

/**
 * Redis connection for BullMQ workers
 *
 * Uses IORedis for connection pooling and automatic reconnection
 * Made non-blocking so the app can function without Redis
 */

let redisConnection: Redis | null = null;
let redisAvailable = false;

/**
 * Create Redis connection with graceful error handling
 * The app will work without Redis - just background jobs won't process
 */
function createRedisConnection(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  // Skip Redis in development if no URL configured
  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    console.log('[Redis] No REDIS_URL configured, skipping Redis connection');
    return null;
  }

  try {
    const connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false, // Required for BullMQ
      lazyConnect: true, // Don't connect immediately
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[Redis] Max retries reached, giving up');
          return null; // Stop retrying after 3 attempts
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    connection.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
      redisAvailable = false;
    });

    connection.on('connect', () => {
      console.log('[Redis] Connected successfully');
      redisAvailable = true;
    });

    connection.on('ready', () => {
      console.log('[Redis] Ready to accept commands');
      redisAvailable = true;
    });

    connection.on('close', () => {
      console.log('[Redis] Connection closed');
      redisAvailable = false;
    });

    connection.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    // Try to connect
    connection.connect().catch((err) => {
      console.warn('[Redis] Initial connection failed:', err.message);
      redisAvailable = false;
    });

    return connection;
  } catch (error) {
    console.warn('[Redis] Failed to create connection:', error);
    return null;
  }
}

// Initialize connection
redisConnection = createRedisConnection();

/**
 * Check if Redis is available for use
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redisConnection !== null;
}

/**
 * Get Redis connection (may be null if unavailable)
 */
export function getRedisConnection(): Redis | null {
  return redisConnection;
}

// Export for backwards compatibility (BullMQ needs this)
// Returns a dummy connection that will fail gracefully if Redis is down
export { redisConnection };
