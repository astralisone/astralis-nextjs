import { Redis } from 'ioredis';

/**
 * Redis connection for BullMQ workers
 *
 * Uses IORedis for connection pooling and automatic reconnection
 * Made non-blocking so the app can function without Redis
 */

// Extended global type
declare global {
  var redisConnection: Redis | undefined;
}

let redisConnection: Redis | null = global.redisConnection || null;
let redisAvailable = false;

// If we already have a connection, check its status
if (redisConnection) {
  redisAvailable = redisConnection.status === 'ready' || redisConnection.status === 'connect';
}

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
      // Connection management for better resource handling
      keepAlive: 30000, // Send keep-alive every 30 seconds
      commandTimeout: 10000, // Increased from 5000
      connectTimeout: 20000, // Increased from 10000
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
      console.log(`[Redis] Connected successfully (status: ${connection.status})`);
      redisAvailable = true;
    });

    connection.on('ready', () => {
      console.log(`[Redis] Ready to accept commands (status: ${connection.status})`);
      redisAvailable = true;
    });

    connection.on('close', () => {
      console.log(`[Redis] Connection closed (status: ${connection.status})`);
      redisAvailable = false;
    });

    connection.on('reconnecting', () => {
      console.log(`[Redis] Reconnecting... (status: ${connection.status})`);
    });

    connection.on('error', (err) => {
      console.error(`[Redis] Connection error (status: ${connection.status}):`, err.message);
      redisAvailable = false;
    });

    // Monitor connection health and usage
    setInterval(async () => {
      if (redisAvailable && connection.status === 'ready') {
        try {
          // Get some basic Redis stats
          const info = await connection.info();
          const clients = info.match(/connected_clients:(\d+)/)?.[1] || 'unknown';
          const memory = info.match(/used_memory_human:(.+)/)?.[1] || 'unknown';

          console.log(`[Redis] Status: ${connection.status}, Clients: ${clients}, Memory: ${memory}`);
        } catch (error) {
          console.log(`[Redis] Status: ${connection.status} (stats unavailable)`);
        }
      } else {
        console.log(`[Redis] Status: ${connection.status}, Available: ${redisAvailable}`);
      }
    }, 30000); // Log every 30 seconds

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
if (!redisConnection) {
  redisConnection = createRedisConnection();
  // Always use global to ensure singleton across module re-evaluations
  global.redisConnection = redisConnection || undefined;
}

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

/**
 * Close Redis connection and cleanup resources
 * Important for serverless environments to prevent connection leaks
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    try {
      await redisConnection.quit();
      console.log('[Redis] Connection closed successfully');
    } catch (error) {
      console.error('[Redis] Error closing connection:', error);
    } finally {
      redisConnection = null;
      redisAvailable = false;
    }
  }
}

/**
 * Get connection info for monitoring
 */
export async function getRedisConnectionInfo() {
  if (!redisConnection) return null;

  const baseInfo = {
    connected: redisAvailable,
    ready: redisConnection.status === 'ready',
    status: redisConnection.status,
    options: redisConnection.options,
  };

  // Try to get additional Redis server info
  if (redisAvailable && redisConnection.status === 'ready') {
    try {
      const info = await redisConnection.info();
      const clients = info.match(/connected_clients:(\d+)/)?.[1];
      const memory = info.match(/used_memory_human:(.+)/)?.[1];
      const uptime = info.match(/uptime_in_seconds:(\d+)/)?.[1];

      return {
        ...baseInfo,
        serverInfo: {
          connectedClients: clients,
          usedMemory: memory,
          uptimeSeconds: uptime,
        }
      };
    } catch (error) {
      // Return base info if we can't get server stats
      return baseInfo;
    }
  }

  return baseInfo;
}

// Export for backwards compatibility (BullMQ needs this)
// Returns a dummy connection that will fail gracefully if Redis is down
export { redisConnection };
