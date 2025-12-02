# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/marketing/package.json ./apps/marketing/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./

# Copy all source files
COPY . .

# Build the marketing app (static export)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm turbo build --filter=@astralis/marketing

# Stage 3: Nginx server for static files
FROM nginx:alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy static export
COPY --from=builder /app/apps/marketing/out /usr/share/nginx/html

# Copy custom nginx config
COPY apps/marketing/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
