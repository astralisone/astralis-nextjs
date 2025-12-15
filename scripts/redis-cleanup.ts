#!/usr/bin/env node

/**
 * Redis Connection Cleanup Script
 *
 * This script helps clean up leaked Redis connections by:
 * 1. Listing all current connections
 * 2. Identifying idle connections
 * 3. Optionally killing idle connections
 *
 * Usage:
 *   npm run redis:cleanup [--dry-run] [--idle-timeout=300]
 */

import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
const DRY_RUN = process.argv.includes('--dry-run');
const IDLE_TIMEOUT = parseInt(process.argv.find(arg => arg.startsWith('--idle-timeout='))?.split('=')[1] || '300');

async function cleanupRedisConnections() {
  if (!REDIS_URL) {
    console.error('❌ No REDIS_URL configured');
    process.exit(1);
  }

  const redis = new Redis(REDIS_URL);

  try {
    console.log('🔍 Analyzing Redis connections...\n');

    // Get all client connections
    const clients = await redis.client('LIST');
    const clientLines = clients.split('\n').filter(line => line.trim());

    console.log(`📊 Found ${clientLines.length} connections\n`);

    let idleConnections = 0;
    const connectionsToKill = [];

    for (const line of clientLines) {
      const parts = line.split(' ');
      const clientInfo = {};

      // Parse client info
      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key && value) {
          clientInfo[key] = value;
        }
      }

      const id = clientInfo['id'];
      const addr = clientInfo['addr'];
      const age = parseInt(clientInfo['age'] || '0');
      const idle = parseInt(clientInfo['idle'] || '0');
      const cmd = clientInfo['cmd'] || 'unknown';

      console.log(`ID: ${id}, Addr: ${addr}, Age: ${age}s, Idle: ${idle}s, Cmd: ${cmd}`);

      // Mark for cleanup if idle too long
      if (idle > IDLE_TIMEOUT) {
        idleConnections++;
        connectionsToKill.push(id);
      }
    }

    console.log(`\n⚠️  Found ${idleConnections} idle connections (>${IDLE_TIMEOUT}s)`);

    if (connectionsToKill.length > 0 && !DRY_RUN) {
      console.log('\n🧹 Killing idle connections...');
      for (const clientId of connectionsToKill) {
        try {
          await redis.client('KILL', 'ID', clientId);
          console.log(`✅ Killed connection ${clientId}`);
        } catch (error) {
          console.error(`❌ Failed to kill connection ${clientId}:`, error.message);
        }
      }
    } else if (DRY_RUN) {
      console.log('\n🔍 DRY RUN - No connections were killed');
      console.log('Run without --dry-run to actually kill connections');
    }

    // Show final connection count
    const finalClients = await redis.client('LIST');
    const finalCount = finalClients.split('\n').filter(line => line.trim()).length;
    console.log(`\n📊 Final connection count: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await redis.quit();
  }
}

cleanupRedisConnections().catch(console.error);