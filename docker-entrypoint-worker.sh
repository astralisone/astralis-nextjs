#!/bin/sh
set -e

echo "🚀 Starting Astralis Worker..."

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until node -e "
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.ping().then(() => { redis.disconnect(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "Redis is unavailable - sleeping 2s"
  sleep 2
done
echo "✅ Redis is ready"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => { prisma.\$disconnect(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping 2s"
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Start the worker using tsx (TypeScript execution)
echo "🔧 Starting BullMQ worker..."
exec npx tsx src/workers/index.ts
