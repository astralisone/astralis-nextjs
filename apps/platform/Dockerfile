# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package files for workspace
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY apps/platform/package.json ./apps/platform/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma/
COPY packages/ui/package.json ./packages/ui/
COPY packages/lib/package.json ./packages/lib/

# Install dependencies and generate Prisma client
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @astralis/database exec prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy node_modules from deps stage (includes generated Prisma client)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/pnpm-lock.yaml ./

# Copy all source files
COPY . .

# Build the platform app and its dependencies
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
RUN pnpm turbo build --filter=@astralis/platform

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Prisma schema for migrations (optional, only if running migrations in container)
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./packages/database/prisma

# Copy standalone build output (includes all necessary node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/.next/static ./apps/platform/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/platform/public ./apps/platform/public

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/platform/server.js"]
