# Phase 6: Production Deployment

**Duration**: 1 week
**Prerequisites**: Phases 1-5 complete (Authentication, Dashboard, AI Routing, Document Processing, Scheduling)
**Docker Changes**: Add nginx container, production compose file, multi-stage builds, health checks
**Server**: 137.184.31.207 (DigitalOcean Droplet)

---

## Phase Overview

This phase transforms the development environment into a production-ready deployment on the DigitalOcean droplet. By the end of this phase, AstralisOps will be running securely with SSL, automated backups, monitoring, health checks, and zero-downtime deployment capabilities.

### Success Criteria Checklist

- [ ] Production Docker environment deployed on 137.184.31.207
- [ ] Nginx reverse proxy with SSL certificates (Let's Encrypt)
- [ ] HTTPS accessible at https://app.astralisone.com
- [ ] Automated daily database backups to DigitalOcean Spaces
- [ ] Automated weekly log rotation
- [ ] Health checks running for all services
- [ ] Auto-restart policies configured
- [ ] PM2 cluster mode for Next.js (4 instances)
- [ ] Redis persistence enabled (AOF + RDB)
- [ ] PostgreSQL connection pooling configured
- [ ] Monitoring dashboard accessible (Prometheus + Grafana)
- [ ] Log aggregation working (centralized logging)
- [ ] Zero-downtime deployment script tested
- [ ] Rollback procedure documented and tested
- [ ] Environment secrets encrypted and managed securely
- [ ] Production performance benchmarks recorded

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 16 (App Router), TypeScript 5, Prisma ORM, PostgreSQL 16, Redis 7, Docker
**Infrastructure**: DigitalOcean Droplet (8GB RAM, 4 vCPUs) + Spaces (S3-compatible object storage)

**Brand Design System**:
- **Astralis Navy**: `#0A1B2B` (headings, sidebar, dark backgrounds)
- **Astralis Blue**: `#2B6CB0` (primary buttons, links, accents)
- **Status Colors**: Success `#38A169`, Warning `#DD6B20`, Error `#E53E3E`, Info `#3182CE`
- **Neutrals**: Slate palette (50-950)
- **Font**: Inter (via next/font/google)
- **Border Radius**: 6px (md), 8px (lg), 4px (sm)
- **Spacing**: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

**Database**: Multi-tenant architecture
- Organization → Users → Pipelines → PipelineItems
- Organization → IntakeRequests → Documents → SchedulingEvents
- Organization → Automations

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) (Phase 2)
**AI Routing**: OpenAI GPT-4 with BullMQ job queues (Phase 3)
**Document Processing**: DigitalOcean Spaces + Tesseract.js OCR (Phase 4)
**Scheduling**: Google Calendar API integration (Phase 5)
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 6 - Production)

```yaml
Production Containers:
- nginx: Nginx reverse proxy (ports 80, 443)
  ├── SSL termination with Let's Encrypt certificates
  ├── Reverse proxy to app container
  ├── Static file serving for .well-known/acme-challenge
  ├── Rate limiting (100 req/min per IP)
  ├── Gzip compression enabled
  ├── Security headers (HSTS, CSP, X-Frame-Options)
  └── Health check: curl localhost:80/health

- app: Next.js application (internal port 3001) - PM2 Cluster Mode
  ├── 4 Node.js processes (cluster mode)
  ├── Handles all web requests
  ├── Serves marketing pages, dashboard, API routes
  ├── Includes NextAuth routes (Phase 1)
  ├── Dashboard UI (Phase 2)
  ├── AI routing endpoints (Phase 3)
  ├── Document upload/processing (Phase 4)
  ├── Calendar integration (Phase 5)
  ├── Memory limit: 2GB
  ├── CPU limit: 2.0
  └── Health check: curl localhost:3001/api/health

- postgres: PostgreSQL 16 database (internal port 5432)
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  ├── Automated daily backups to Spaces
  ├── Connection pooling: max 100 connections
  ├── Shared buffers: 2GB
  ├── Effective cache: 6GB
  ├── WAL archiving enabled
  └── Health check: pg_isready

- redis: Redis 7 (internal port 6379)
  ├── BullMQ job queues (Phase 3)
  ├── Session caching
  ├── Rate limiting storage
  ├── Persistence: AOF (appendonly) + RDB snapshots
  ├── Memory limit: 1GB
  ├── Eviction policy: allkeys-lru
  └── Health check: redis-cli ping

- worker: Background job processor (Phase 3)
  ├── Processes BullMQ queues
  ├── Queues: intake-routing, email-sending, document-processing, scheduling-reminders
  ├── Concurrency: 10 jobs
  ├── Retry policy: exponential backoff
  ├── Memory limit: 1GB
  └── Health check: process running check

- prometheus: Metrics collection (port 9090)
  ├── Scrapes metrics from app, postgres, redis
  ├── Retention: 15 days
  ├── Storage: prometheus-data volume
  └── Health check: curl localhost:9090/-/healthy

- grafana: Metrics visualization (port 3003)
  ├── Dashboards for system metrics
  ├── Alerting for critical conditions
  ├── Data source: Prometheus
  ├── Storage: grafana-data volume
  └── Health check: curl localhost:3003/api/health

- postgres-exporter: PostgreSQL metrics for Prometheus
  ├── Exposes DB metrics
  └── Port: 9187

- redis-exporter: Redis metrics for Prometheus
  ├── Exposes Redis metrics
  └── Port: 9121

Volumes:
- postgres-data: Database persistence
- redis-data: Redis persistence (AOF + RDB)
- nginx-certs: SSL certificates
- nginx-www: Let's Encrypt challenge files
- prometheus-data: Metrics storage
- grafana-data: Dashboard configurations
- app-logs: Application logs
- nginx-logs: Access and error logs

Networks:
- astralis-network: Bridge network (all services)
- monitoring-network: Prometheus and exporters only

Status: Full production stack with monitoring, backups, and SSL
```

---

## Database Schema State (Phase 6 - Complete)

```prisma
// prisma/schema.prisma - Complete schema after Phase 5

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  ADMIN
  OPERATOR
  CLIENT
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum IntakeSource {
  FORM
  EMAIL
  CHAT
  API
}

enum IntakeStatus {
  NEW
  ROUTING
  ASSIGNED
  PROCESSING
  COMPLETED
  REJECTED
}

enum EventStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  CONFLICT
}

// [PHASE 1] Authentication Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  resource  String?
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@index([action])
}

// Core Models
model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users            User[]
  pipelines        Pipeline[]
  documents        Document[]
  intakeRequests   IntakeRequest[]
  automations      Automation[]
  schedulingEvents SchedulingEvent[]
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  password      String?   // Hashed password for credentials login
  role          Role      @default(OPERATOR)
  orgId         String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  organization Organization  @relation(fields: [orgId], references: [id])
  pipelines    Pipeline[]    @relation("PipelineOperators")
  accounts     Account[]     // OAuth accounts
  sessions     Session[]     // Active sessions
  activityLogs ActivityLog[] // Audit trail

  @@index([orgId])
  @@index([email])
}

// [PHASE 2] Pipeline Management Models
model Pipeline {
  id        String   @id @default(cuid())
  name      String
  orgId     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization   Organization    @relation(fields: [orgId], references: [id])
  stages         Stage[]
  operators      User[]          @relation("PipelineOperators")
  intakeRequests IntakeRequest[]

  @@index([orgId])
}

model Stage {
  id         String         @id @default(cuid())
  name       String
  order      Int
  pipelineId String
  pipeline   Pipeline       @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  items      PipelineItem[]

  @@index([pipelineId])
  @@index([order])
}

model PipelineItem {
  id        String   @id @default(cuid())
  title     String
  data      Json
  stageId   String
  createdAt DateTime @default(now())

  stage Stage @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@index([stageId])
  @@index([createdAt])
}

// [PHASE 3] AI Routing & Intake Models
model IntakeRequest {
  id               String       @id @default(cuid())
  source           IntakeSource
  status           IntakeStatus @default(NEW)
  title            String
  description      String?      @db.Text
  requestData      Json
  aiRoutingMeta    Json? // Stores AI routing confidence, reasoning, pipeline suggestions
  assignedPipeline String?
  priority         Int          @default(0)
  orgId            String
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])
  pipeline     Pipeline?    @relation(fields: [assignedPipeline], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([source])
  @@index([createdAt])
  @@index([priority])
}

// [PHASE 4] Document Processing Models
model Document {
  id            String         @id @default(cuid())
  fileName      String
  filePath      String // Spaces path: astralis-documents/org-id/filename
  fileSize      Int
  mimeType      String
  status        DocumentStatus @default(PENDING)
  ocrText       String?        @db.Text
  extractedData Json? // GPT-4 Vision extracted structured data
  metadata      Json?
  uploadedBy    String
  orgId         String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([createdAt])
}

// [PHASE 3] Automation & n8n Integration
model Automation {
  id            String    @id @default(cuid())
  name          String
  description   String?   @db.Text
  workflowId    String? // n8n workflow ID
  webhookUrl    String?
  isActive      Boolean   @default(true)
  triggerConfig Json
  lastRunAt     DateTime?
  runCount      Int       @default(0)
  orgId         String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([isActive])
  @@index([workflowId])
}

// [PHASE 5] Scheduling & Calendar Models
model SchedulingEvent {
  id                  String      @id @default(cuid())
  title               String
  description         String?     @db.Text
  startTime           DateTime
  endTime             DateTime
  participants        Json // Array of participant emails
  calendarIntegration Json? // Google Calendar event ID, sync status
  aiScheduled         Boolean     @default(false)
  status              EventStatus @default(SCHEDULED)
  conflictData        Json? // Detected conflicts with reasoning
  orgId               String
  createdBy           String?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([startTime])
  @@index([endTime])
  @@index([aiScheduled])
}
```

**Database Production Configuration**:
- Connection pooling: 100 max connections
- Statement timeout: 30s
- Idle timeout: 10m
- Shared buffers: 2GB (25% of RAM)
- Effective cache: 6GB (75% of RAM)
- WAL archiving: enabled for point-in-time recovery
- Daily automated backups to DigitalOcean Spaces

---

## Environment Variables (Phase 6 - Production)

**Production .env file location**: `/home/deploy/astralis-nextjs/.env.production`

```bash
# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=production

# ============================================
# DATABASE (Phase 1+)
# ============================================
DATABASE_URL="postgresql://astralis_user:STRONG_PASSWORD_HERE@postgres:5432/astralis_production"
# Connection pooling settings
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_CONNECTION_TIMEOUT=30000

# ============================================
# NEXTAUTH.JS (Phase 1)
# ============================================
NEXTAUTH_SECRET="GENERATED_64_CHAR_SECRET_HERE"
NEXTAUTH_URL="https://app.astralisone.com"

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# ============================================
# EMAIL (Phase 1)
# ============================================
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.YOUR_SENDGRID_API_KEY"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ============================================
# API
# ============================================
NEXT_PUBLIC_API_BASE_URL="https://app.astralisone.com"

# ============================================
# ANALYTICS (Existing)
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"

# ============================================
# OPENAI (Phase 3)
# ============================================
OPENAI_API_KEY="sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
OPENAI_MODEL="gpt-4-turbo-preview"
OPENAI_MAX_TOKENS=2000

# ============================================
# REDIS (Phase 3)
# ============================================
REDIS_URL="redis://redis:6379"
REDIS_PASSWORD="STRONG_REDIS_PASSWORD_HERE"
# Redis configuration
REDIS_MAX_RETRIES=10
REDIS_CONNECT_TIMEOUT=10000

# ============================================
# BULLMQ (Phase 3)
# ============================================
BULL_CONCURRENCY=10
BULL_MAX_STALLED_COUNT=3
BULL_LOCK_DURATION=30000

# ============================================
# DIGITALOCEAN SPACES (Phase 4)
# ============================================
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_BUCKET="astralis-documents-prod"
SPACES_REGION="nyc3"
SPACES_ACCESS_KEY="DO00XXXXXXXXXXXXXX"
SPACES_SECRET_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
SPACES_CDN_URL="https://astralis-documents-prod.nyc3.cdn.digitaloceanspaces.com"

# ============================================
# GOOGLE CALENDAR (Phase 5)
# ============================================
GOOGLE_CALENDAR_CLIENT_ID="YOUR_CALENDAR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="YOUR_CALENDAR_CLIENT_SECRET"
GOOGLE_CALENDAR_REDIRECT_URI="https://app.astralisone.com/api/calendar/callback"

# ============================================
# PRODUCTION SETTINGS (Phase 6)
# ============================================
# PM2 Configuration
PM2_INSTANCES=4
PM2_MAX_MEMORY_RESTART="2G"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_TO_FILE="true"
LOG_DIRECTORY="/var/log/astralis"

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3003
GRAFANA_ADMIN_PASSWORD="STRONG_GRAFANA_PASSWORD_HERE"

# Backup Configuration
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_SPACES_BUCKET="astralis-backups-prod"

# Security
ALLOWED_ORIGINS="https://app.astralisone.com,https://www.astralisone.com"
CSRF_ENABLED="true"
HELMET_ENABLED="true"

# Health Checks
HEALTH_CHECK_INTERVAL=30
HEALTH_CHECK_TIMEOUT=10
```

**Secrets Management**:
All sensitive values should be:
1. Generated using `openssl rand -base64 32`
2. Stored in `.env.production` (not committed to git)
3. Backed up securely (encrypted, off-server)
4. Rotated quarterly

---

## File Structure (After Phase 6)

```
/home/deploy/astralis-nextjs/
├── .github/
│   └── workflows/
│       └── deploy.yml                      # [PHASE 6] GitHub Actions deployment
├── docs/
│   ├── phases/
│   │   ├── phase-1-authentication-rbac.md
│   │   ├── phase-2-dashboard-ui-pipelines.md
│   │   ├── phase-3-ai-routing-background-jobs.md
│   │   ├── phase-4-document-processing-ocr.md
│   │   ├── phase-5-scheduling-calendar.md
│   │   ├── phase-6-production-deployment.md  # [PHASE 6] This document
│   │   ├── phase-7-cleanup-refactor.md
│   │   ├── PROGRESS.md
│   │   └── README.md
│   ├── ASTRALISOPS-PRD.md
│   └── BOOKING_SETUP.md
├── prisma/
│   ├── schema.prisma                       # Complete schema (all phases)
│   └── migrations/                         # All migrations from phases 1-5
├── public/
│   └── images/
├── scripts/                                 # [PHASE 6] Deployment scripts
│   ├── deploy.sh                           # Zero-downtime deployment
│   ├── rollback.sh                         # Rollback to previous version
│   ├── backup.sh                           # Database backup script
│   ├── restore.sh                          # Database restore script
│   ├── health-check.sh                     # Manual health check
│   ├── setup-server.sh                     # Initial server setup
│   └── renew-ssl.sh                        # SSL renewal script
├── src/
│   ├── app/
│   │   ├── (marketing)/                    # Marketing pages
│   │   ├── (app)/                          # [PHASE 2] Dashboard
│   │   ├── api/
│   │   │   ├── auth/                       # [PHASE 1] NextAuth routes
│   │   │   ├── booking/                    # Existing
│   │   │   ├── contact/                    # Existing
│   │   │   ├── intake/                     # [PHASE 3] AI routing
│   │   │   ├── documents/                  # [PHASE 4] Upload/processing
│   │   │   ├── calendar/                   # [PHASE 5] Calendar sync
│   │   │   ├── health/                     # [PHASE 6] Health check endpoint
│   │   │   │   └── route.ts
│   │   │   └── metrics/                    # [PHASE 6] Prometheus metrics
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                             # Existing Radix UI components
│   │   ├── auth/                           # [PHASE 1] Auth components
│   │   ├── dashboard/                      # [PHASE 2] Dashboard components
│   │   ├── documents/                      # [PHASE 4] Document viewer
│   │   ├── calendar/                       # [PHASE 5] Calendar components
│   │   └── layout/
│   ├── hooks/                              # [PHASE 2] Custom hooks
│   ├── lib/
│   │   ├── auth/                           # [PHASE 1] Auth utilities
│   │   ├── middleware/                     # [PHASE 1] RBAC middleware
│   │   ├── services/
│   │   │   ├── ai-routing.ts               # [PHASE 3] OpenAI integration
│   │   │   ├── document-processing.ts      # [PHASE 4] OCR/Vision
│   │   │   └── calendar-sync.ts            # [PHASE 5] Google Calendar
│   │   ├── validators/                     # Zod schemas
│   │   ├── monitoring/                     # [PHASE 6] Monitoring utilities
│   │   │   ├── metrics.ts
│   │   │   ├── logger.ts
│   │   │   └── alerts.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts                        # [PHASE 3] Redis client
│   │   ├── email.ts
│   │   ├── calendar.ts
│   │   └── utils.ts
│   ├── stores/                             # [PHASE 2] Zustand stores
│   ├── types/
│   └── workers/                            # [PHASE 3] Background workers
│       ├── index.ts                        # Worker entry point
│       ├── processors/
│       │   ├── intake-routing.ts
│       │   ├── email-sending.ts
│       │   ├── document-processing.ts
│       │   └── scheduling-reminders.ts
│       └── config.ts
├── .storybook/
├── docker/                                  # [PHASE 6] Docker configurations
│   ├── nginx/
│   │   ├── nginx.conf                      # Main Nginx config
│   │   ├── ssl.conf                        # SSL settings
│   │   └── security-headers.conf           # Security headers
│   ├── postgres/
│   │   ├── postgresql.conf                 # Production Postgres config
│   │   └── init.sql                        # Initialization script
│   ├── prometheus/
│   │   └── prometheus.yml                  # Prometheus scrape config
│   └── grafana/
│       └── dashboards/
│           ├── app-metrics.json
│           ├── database-metrics.json
│           └── system-metrics.json
├── logs/                                    # [PHASE 6] Application logs
│   ├── app/
│   ├── nginx/
│   └── workers/
├── .env.production                          # [PHASE 6] Production environment
├── .env.local.template
├── .gitignore
├── docker-compose.yml                       # Development compose
├── docker-compose.prod.yml                  # [PHASE 6] Production compose
├── Dockerfile                               # [PHASE 6] Multi-stage build
├── Dockerfile.worker                        # [PHASE 6] Worker container
├── ecosystem.config.js                      # [PHASE 6] PM2 configuration
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Implementation Steps

### Step 1: Create Multi-Stage Dockerfile

**File**: `/home/deploy/astralis-nextjs/Dockerfile`

```dockerfile
# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Install system dependencies for Prisma and native modules
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache curl openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "server.js"]
```

**File**: `/home/deploy/astralis-nextjs/Dockerfile.worker`

```dockerfile
# ============================================
# Worker Container for Background Jobs
# ============================================
FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 worker && \
    chown -R worker:nodejs /app

USER worker

ENV NODE_ENV=production

# Health check - verify worker process is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD pgrep -f "node.*workers" || exit 1

CMD ["node", "src/workers/index.ts"]
```

Update `next.config.ts` to enable standalone output:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Existing configurations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "astralis-documents-prod.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
```

### Step 2: Create Production Docker Compose

**File**: `/home/deploy/astralis-nextjs/docker-compose.prod.yml`

```yaml
version: '3.9'

services:
  # ============================================
  # Nginx Reverse Proxy
  # ============================================
  nginx:
    image: nginx:1.25-alpine
    container_name: astralis-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl.conf:/etc/nginx/conf.d/ssl.conf:ro
      - ./docker/nginx/security-headers.conf:/etc/nginx/conf.d/security-headers.conf:ro
      - nginx-certs:/etc/letsencrypt
      - nginx-www:/var/www/certbot
      - nginx-logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - astralis-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  # ============================================
  # Certbot for Let's Encrypt SSL
  # ============================================
  certbot:
    image: certbot/certbot:latest
    container_name: astralis-certbot
    volumes:
      - nginx-certs:/etc/letsencrypt
      - nginx-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - astralis-network

  # ============================================
  # Next.js Application (PM2 Cluster Mode)
  # ============================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: astralis-app
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - PORT=3001
    volumes:
      - app-logs:/app/logs
      - ./prisma:/app/prisma:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - astralis-network
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:16-alpine
    container_name: astralis-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: astralis_production
      POSTGRES_USER: astralis_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
      # Performance tuning
      POSTGRES_SHARED_BUFFERS: 2GB
      POSTGRES_EFFECTIVE_CACHE_SIZE: 6GB
      POSTGRES_MAX_CONNECTIONS: 100
      POSTGRES_WORK_MEM: 20MB
      POSTGRES_MAINTENANCE_WORK_MEM: 512MB
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./scripts/backup.sh:/usr/local/bin/backup.sh:ro
    networks:
      - astralis-network
      - monitoring-network
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U astralis_user -d astralis_production"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ============================================
  # Redis Cache & Queue
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: astralis-redis
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --appendfsync everysec
      --maxmemory 1gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - redis-data:/data
    networks:
      - astralis-network
      - monitoring-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # ============================================
  # Background Worker
  # ============================================
  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: astralis-worker
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - astralis-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "pgrep -f 'node.*workers' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  # ============================================
  # Prometheus Metrics Collection
  # ============================================
  prometheus:
    image: prom/prometheus:latest
    container_name: astralis-prometheus
    restart: unless-stopped
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================
  # Grafana Dashboards
  # ============================================
  grafana:
    image: grafana/grafana:latest
    container_name: astralis-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_SERVER_ROOT_URL=https://app.astralisone.com/grafana
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./docker/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    ports:
      - "3003:3000"
    depends_on:
      - prometheus
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================
  # PostgreSQL Exporter for Prometheus
  # ============================================
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: astralis-postgres-exporter
    restart: unless-stopped
    environment:
      DATA_SOURCE_NAME: "postgresql://astralis_user:${POSTGRES_PASSWORD}@postgres:5432/astralis_production?sslmode=disable"
    depends_on:
      - postgres
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9187/metrics"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================
  # Redis Exporter for Prometheus
  # ============================================
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: astralis-redis-exporter
    restart: unless-stopped
    environment:
      REDIS_ADDR: "redis:6379"
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    depends_on:
      - redis
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:9121/metrics"]
      interval: 30s
      timeout: 10s
      retries: 3

# ============================================
# Volumes
# ============================================
volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  nginx-certs:
    driver: local
  nginx-www:
    driver: local
  nginx-logs:
    driver: local
  app-logs:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local

# ============================================
# Networks
# ============================================
networks:
  astralis-network:
    driver: bridge
  monitoring-network:
    driver: bridge
```

### Step 3: Create Nginx Configuration

**File**: `/home/deploy/astralis-nextjs/docker/nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    # Upstream to Next.js app
    upstream nextjs_app {
        server app:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP - Redirect to HTTPS
    server {
        listen 80;
        server_name app.astralisone.com www.astralisone.com;

        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Health check endpoint (no redirect)
        location /health {
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name app.astralisone.com;

        # SSL certificates
        ssl_certificate /etc/letsencrypt/live/app.astralisone.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app.astralisone.com/privkey.pem;

        # SSL configuration
        include /etc/nginx/conf.d/ssl.conf;

        # Security headers
        include /etc/nginx/conf.d/security-headers.conf;

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            limit_conn addr 10;

            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Login endpoints with stricter rate limiting
        location ~ ^/api/auth/(signin|signup|callback) {
            limit_req zone=login_limit burst=5 nodelay;

            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location /_next/static/ {
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;

            # Cache static assets for 1 year
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Images with caching
        location ~ ^/images/ {
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;

            # Cache images for 30 days
            expires 30d;
            add_header Cache-Control "public";
        }

        # All other requests
        location / {
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Monitoring endpoints (restricted to local network)
        location /grafana/ {
            allow 10.0.0.0/8;
            allow 172.16.0.0/12;
            allow 192.168.0.0/16;
            deny all;

            proxy_pass http://grafana:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**File**: `/home/deploy/astralis-nextjs/docker/nginx/ssl.conf`

```nginx
# SSL Configuration - Mozilla Intermediate Profile
# https://ssl-config.mozilla.org/

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;

# SSL session cache
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# DH parameters (generate with: openssl dhparam -out /etc/nginx/dhparam.pem 2048)
ssl_dhparam /etc/letsencrypt/dhparam.pem;
```

**File**: `/home/deploy/astralis-nextjs/docker/nginx/security-headers.conf`

```nginx
# Security Headers

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com; frame-ancestors 'self';" always;

# Remove server header
server_tokens off;
```

### Step 4: Create PostgreSQL Production Configuration

**File**: `/home/deploy/astralis-nextjs/docker/postgres/postgresql.conf`

```conf
# PostgreSQL Production Configuration
# For 8GB RAM, 4 vCPU DigitalOcean Droplet

# ============================================
# Memory Settings
# ============================================
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
work_mem = 20MB                         # RAM / max_connections / 4
maintenance_work_mem = 512MB            # RAM / 16
wal_buffers = 16MB

# ============================================
# Connection Settings
# ============================================
max_connections = 100
superuser_reserved_connections = 3

# Connection pooling
idle_in_transaction_session_timeout = 600000   # 10 minutes
statement_timeout = 30000                      # 30 seconds
lock_timeout = 10000                           # 10 seconds

# ============================================
# Write Ahead Log (WAL)
# ============================================
wal_level = replica
max_wal_size = 2GB
min_wal_size = 1GB
wal_compression = on
wal_log_hints = on

# Checkpoints
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min

# ============================================
# Query Planner
# ============================================
random_page_cost = 1.1                  # For SSD
effective_io_concurrency = 200          # For SSD
default_statistics_target = 100

# ============================================
# Logging
# ============================================
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000       # Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# ============================================
# Performance
# ============================================
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_worker_processes = 4

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 10s

# ============================================
# Locale and Formatting
# ============================================
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.UTF-8'
lc_monetary = 'en_US.UTF-8'
lc_numeric = 'en_US.UTF-8'
lc_time = 'en_US.UTF-8'
default_text_search_config = 'pg_catalog.english'
```

### Step 5: Create PM2 Ecosystem Configuration

**File**: `/home/deploy/astralis-nextjs/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'astralis-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 4,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/app/error.log',
      out_file: './logs/app/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
      shutdown_with_message: true,
    },
  ],
};
```

### Step 6: Create Prometheus Configuration

**File**: `/home/deploy/astralis-nextjs/docker/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'astralis-production'

# Alerting configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: []

# Rule files
rule_files:
  # - "alerts.yml"

# Scrape configurations
scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # PostgreSQL metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
        labels:
          service: 'database'

  # Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
        labels:
          service: 'cache'

  # Next.js application metrics (if exposed)
  - job_name: 'nextjs-app'
    static_configs:
      - targets: ['app:3001']
        labels:
          service: 'application'
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  # Node exporter (if added for system metrics)
  # - job_name: 'node'
  #   static_configs:
  #     - targets: ['node-exporter:9100']
  #       labels:
  #         service: 'system'
```

### Step 7: Create Health Check Endpoint

**File**: `/home/deploy/astralis-nextjs/src/app/api/health/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/**
 * Health Check Endpoint
 *
 * Checks the health of critical services:
 * - Database connectivity
 * - Redis connectivity
 * - Application status
 *
 * Returns 200 if all services are healthy, 503 if any service is down
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "healthy",
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: "healthy",
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? "healthy" : "warning",
    latency: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
  };

  // Overall health
  const isHealthy = Object.values(checks).every((check) => check.status === "healthy");
  const totalLatency = Date.now() - startTime;

  const response = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    latency: totalLatency,
  };

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
```

### Step 8: Create Metrics Endpoint

**File**: `/home/deploy/astralis-nextjs/src/app/api/metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Prometheus Metrics Endpoint
 *
 * Exposes application metrics in Prometheus format:
 * - Request counts
 * - Database connection pool stats
 * - Custom business metrics
 */
export async function GET(req: NextRequest) {
  try {
    const metrics: string[] = [];

    // Application info
    metrics.push('# HELP astralis_app_info Application information');
    metrics.push('# TYPE astralis_app_info gauge');
    metrics.push(`astralis_app_info{version="${process.env.npm_package_version || "unknown"}",node_version="${process.version}"} 1`);

    // Uptime
    metrics.push('# HELP astralis_uptime_seconds Application uptime in seconds');
    metrics.push('# TYPE astralis_uptime_seconds counter');
    metrics.push(`astralis_uptime_seconds ${process.uptime()}`);

    // Memory usage
    const memUsage = process.memoryUsage();
    metrics.push('# HELP astralis_memory_heap_used_bytes Heap memory used in bytes');
    metrics.push('# TYPE astralis_memory_heap_used_bytes gauge');
    metrics.push(`astralis_memory_heap_used_bytes ${memUsage.heapUsed}`);

    metrics.push('# HELP astralis_memory_heap_total_bytes Total heap memory in bytes');
    metrics.push('# TYPE astralis_memory_heap_total_bytes gauge');
    metrics.push(`astralis_memory_heap_total_bytes ${memUsage.heapTotal}`);

    metrics.push('# HELP astralis_memory_rss_bytes Resident set size in bytes');
    metrics.push('# TYPE astralis_memory_rss_bytes gauge');
    metrics.push(`astralis_memory_rss_bytes ${memUsage.rss}`);

    // Database metrics (example: count of records)
    try {
      const [orgCount, userCount, pipelineCount, intakeCount] = await Promise.all([
        prisma.organization.count(),
        prisma.user.count(),
        prisma.pipeline.count(),
        prisma.intakeRequest.count(),
      ]);

      metrics.push('# HELP astralis_organizations_total Total number of organizations');
      metrics.push('# TYPE astralis_organizations_total gauge');
      metrics.push(`astralis_organizations_total ${orgCount}`);

      metrics.push('# HELP astralis_users_total Total number of users');
      metrics.push('# TYPE astralis_users_total gauge');
      metrics.push(`astralis_users_total ${userCount}`);

      metrics.push('# HELP astralis_pipelines_total Total number of pipelines');
      metrics.push('# TYPE astralis_pipelines_total gauge');
      metrics.push(`astralis_pipelines_total ${pipelineCount}`);

      metrics.push('# HELP astralis_intake_requests_total Total number of intake requests');
      metrics.push('# TYPE astralis_intake_requests_total gauge');
      metrics.push(`astralis_intake_requests_total ${intakeCount}`);
    } catch (error) {
      console.error("Error fetching database metrics:", error);
    }

    return new NextResponse(metrics.join('\n') + '\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    console.error("Error generating metrics:", error);
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 }
    );
  }
}
```

### Step 9: Create Deployment Scripts

**File**: `/home/deploy/astralis-nextjs/scripts/setup-server.sh`

```bash
#!/bin/bash

# ============================================
# AstralisOps Server Setup Script
# Run this once on a fresh DigitalOcean droplet
# ============================================

set -e

echo "=========================================="
echo "AstralisOps Production Server Setup"
echo "=========================================="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js (for local scripts)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Git
echo "Installing Git..."
sudo apt-get install -y git

# Install essential tools
echo "Installing essential tools..."
sudo apt-get install -y curl wget vim htop ufw fail2ban

# Configure firewall
echo "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure fail2ban
echo "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /home/deploy
sudo chown -R $USER:$USER /home/deploy

# Create log directories
echo "Creating log directories..."
sudo mkdir -p /var/log/astralis/{app,nginx,workers}
sudo chown -R $USER:$USER /var/log/astralis

# Clone repository
echo "Cloning repository..."
cd /home/deploy
if [ ! -d "astralis-nextjs" ]; then
    git clone https://github.com/yourusername/astralis-nextjs.git
fi
cd astralis-nextjs

# Create .env.production (empty template)
echo "Creating .env.production template..."
if [ ! -f ".env.production" ]; then
    cp .env.local.template .env.production
    echo "⚠️  IMPORTANT: Edit .env.production with production values!"
fi

# Generate SSL certificates
echo "Setting up SSL certificates..."
sudo mkdir -p /etc/letsencrypt
sudo chmod 755 /etc/letsencrypt

echo "⚠️  Before running certbot, ensure:"
echo "   1. DNS A record for app.astralisone.com points to this server"
echo "   2. Port 80 and 443 are accessible"
echo ""
echo "Run this command to obtain SSL certificate:"
echo "sudo docker run -it --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot certonly --webroot -w /var/www/certbot -d app.astralisone.com --email support@astralisone.com --agree-tos --no-eff-email"

# Generate DH parameters
echo "Generating DH parameters (this may take several minutes)..."
if [ ! -f "/etc/letsencrypt/dhparam.pem" ]; then
    sudo openssl dhparam -out /etc/letsencrypt/dhparam.pem 2048
fi

# Set up log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/astralis > /dev/null <<EOF
/var/log/astralis/*/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        docker exec astralis-app pkill -USR1 node || true
        docker exec astralis-nginx nginx -s reload || true
    endscript
}
EOF

# Set up cron for backups
echo "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/deploy/astralis-nextjs/scripts/backup.sh >> /var/log/astralis/backup.log 2>&1") | crontab -

# Set up cron for SSL renewal
echo "Setting up SSL renewal cron job..."
(crontab -l 2>/dev/null; echo "0 0,12 * * * docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --quiet && docker exec astralis-nginx nginx -s reload") | crontab -

echo ""
echo "=========================================="
echo "Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit /home/deploy/astralis-nextjs/.env.production with your production values"
echo "2. Obtain SSL certificate using the certbot command above"
echo "3. Run deployment: ./scripts/deploy.sh"
echo ""
```

**File**: `/home/deploy/astralis-nextjs/scripts/deploy.sh`

```bash
#!/bin/bash

# ============================================
# AstralisOps Zero-Downtime Deployment Script
# ============================================

set -e

DEPLOY_DIR="/home/deploy/astralis-nextjs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"

echo "=========================================="
echo "AstralisOps Deployment - $TIMESTAMP"
echo "=========================================="

# Navigate to project directory
cd $DEPLOY_DIR

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup current database before deployment
echo "Creating database backup..."
./scripts/backup.sh

# Pull latest code
echo "Pulling latest code from repository..."
git fetch origin
git checkout main
git pull origin main

# Backup current .env.production
echo "Backing up environment configuration..."
cp .env.production $BACKUP_DIR/.env.production.$TIMESTAMP

# Install dependencies (if package.json changed)
echo "Checking for dependency updates..."
if git diff HEAD@{1} HEAD -- package.json | grep -q .; then
    echo "Dependencies changed, installing..."
    npm ci --only=production
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build Docker images
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1

    echo "Waiting for services to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:80/health > /dev/null 2>&1; then
            echo "✓ Services are healthy!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: Services not ready yet..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "✗ Services failed to become healthy!"
    return 1
}

# Deploy new containers
echo "Deploying new containers..."

# Start new containers (this will create new instances alongside old ones)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build

# Wait for new containers to be healthy
if health_check; then
    echo "New containers are healthy, removing old containers..."

    # Remove old containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans

    # Clean up unused images
    echo "Cleaning up old Docker images..."
    docker image prune -f

    echo ""
    echo "=========================================="
    echo "Deployment successful!"
    echo "=========================================="
    echo "Timestamp: $TIMESTAMP"
    echo "Backup location: $BACKUP_DIR"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "Deployment failed!"
    echo "=========================================="
    echo "Rolling back to previous version..."
    ./scripts/rollback.sh
    exit 1
fi

# Show container status
echo "Current container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs from app container (last 50 lines)
echo ""
echo "Recent application logs:"
docker-compose -f docker-compose.prod.yml logs --tail=50 app
```

**File**: `/home/deploy/astralis-nextjs/scripts/rollback.sh`

```bash
#!/bin/bash

# ============================================
# AstralisOps Rollback Script
# ============================================

set -e

DEPLOY_DIR="/home/deploy/astralis-nextjs"
BACKUP_DIR="/home/deploy/backups"

echo "=========================================="
echo "AstralisOps Rollback"
echo "=========================================="

cd $DEPLOY_DIR

# Get previous commit
CURRENT_COMMIT=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

echo "Current commit: $CURRENT_COMMIT"
echo "Rolling back to: $PREVIOUS_COMMIT"

read -p "Are you sure you want to rollback? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Rollback cancelled."
    exit 1
fi

# Stop current containers
echo "Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Rollback code
echo "Rolling back code to previous commit..."
git reset --hard $PREVIOUS_COMMIT

# Find latest backup
LATEST_ENV_BACKUP=$(ls -t $BACKUP_DIR/.env.production.* 2>/dev/null | head -n 1)
if [ -n "$LATEST_ENV_BACKUP" ]; then
    echo "Restoring environment configuration from: $LATEST_ENV_BACKUP"
    cp $LATEST_ENV_BACKUP .env.production
fi

# Rebuild and restart
echo "Rebuilding containers..."
docker-compose -f docker-compose.prod.yml build

echo "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "Waiting for services to be healthy..."
sleep 10

if curl -f http://localhost:80/health > /dev/null 2>&1; then
    echo ""
    echo "=========================================="
    echo "Rollback successful!"
    echo "=========================================="
    echo "Rolled back to commit: $PREVIOUS_COMMIT"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "Rollback failed - services not healthy!"
    echo "=========================================="
    echo "Check logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
```

**File**: `/home/deploy/astralis-nextjs/scripts/backup.sh`

```bash
#!/bin/bash

# ============================================
# AstralisOps Database Backup Script
# Backs up PostgreSQL to DigitalOcean Spaces
# ============================================

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="astralis_backup_${TIMESTAMP}.sql.gz"
LOCAL_BACKUP_DIR="/home/deploy/backups/db"
CONTAINER_NAME="astralis-postgres"
DB_NAME="astralis_production"
DB_USER="astralis_user"

# Load environment variables
if [ -f "/home/deploy/astralis-nextjs/.env.production" ]; then
    export $(grep -v '^#' /home/deploy/astralis-nextjs/.env.production | xargs)
fi

echo "=========================================="
echo "Database Backup - $TIMESTAMP"
echo "=========================================="

# Create local backup directory
mkdir -p $LOCAL_BACKUP_DIR

# Create backup
echo "Creating database backup..."
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME | gzip > $LOCAL_BACKUP_DIR/$BACKUP_FILE

# Verify backup file exists and has content
if [ -s "$LOCAL_BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$LOCAL_BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "✓ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "✗ Backup failed - file is empty or doesn't exist"
    exit 1
fi

# Upload to DigitalOcean Spaces
if [ -n "$SPACES_ACCESS_KEY" ] && [ -n "$SPACES_SECRET_KEY" ]; then
    echo "Uploading backup to DigitalOcean Spaces..."

    # Install s3cmd if not present
    if ! command -v s3cmd &> /dev/null; then
        echo "Installing s3cmd..."
        sudo apt-get install -y s3cmd
    fi

    # Configure s3cmd
    cat > ~/.s3cfg <<EOF
[default]
access_key = $SPACES_ACCESS_KEY
secret_key = $SPACES_SECRET_KEY
host_base = $SPACES_ENDPOINT
host_bucket = %(bucket)s.$SPACES_ENDPOINT
use_https = True
EOF

    # Upload to Spaces
    s3cmd put $LOCAL_BACKUP_DIR/$BACKUP_FILE s3://$BACKUP_SPACES_BUCKET/$BACKUP_FILE

    if [ $? -eq 0 ]; then
        echo "✓ Backup uploaded to Spaces"
    else
        echo "✗ Failed to upload backup to Spaces"
    fi
else
    echo "⚠️  Spaces credentials not configured - skipping upload"
fi

# Clean up old local backups (keep last 7 days)
echo "Cleaning up old local backups..."
find $LOCAL_BACKUP_DIR -name "astralis_backup_*.sql.gz" -mtime +7 -delete

# Clean up old Spaces backups (keep last 30 days)
if command -v s3cmd &> /dev/null && [ -n "$SPACES_ACCESS_KEY" ]; then
    echo "Cleaning up old Spaces backups..."
    CUTOFF_DATE=$(date -d "30 days ago" +%Y%m%d)
    s3cmd ls s3://$BACKUP_SPACES_BUCKET/ | while read -r line; do
        BACKUP_DATE=$(echo $line | grep -oP 'astralis_backup_\K[0-9]{8}')
        if [ -n "$BACKUP_DATE" ] && [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
            BACKUP_NAME=$(echo $line | awk '{print $4}')
            echo "Deleting old backup: $BACKUP_NAME"
            s3cmd del $BACKUP_NAME
        fi
    done
fi

echo ""
echo "=========================================="
echo "Backup complete!"
echo "=========================================="
echo "Local: $LOCAL_BACKUP_DIR/$BACKUP_FILE"
if [ -n "$SPACES_ACCESS_KEY" ]; then
    echo "Remote: s3://$BACKUP_SPACES_BUCKET/$BACKUP_FILE"
fi
echo ""
```

**File**: `/home/deploy/astralis-nextjs/scripts/restore.sh`

```bash
#!/bin/bash

# ============================================
# AstralisOps Database Restore Script
# ============================================

set -e

CONTAINER_NAME="astralis-postgres"
DB_NAME="astralis_production"
DB_USER="astralis_user"
LOCAL_BACKUP_DIR="/home/deploy/backups/db"

echo "=========================================="
echo "Database Restore"
echo "=========================================="

# List available backups
echo "Available backups:"
ls -lh $LOCAL_BACKUP_DIR/astralis_backup_*.sql.gz 2>/dev/null || echo "No backups found locally"

read -p "Enter backup filename (or 'latest' for most recent): " BACKUP_INPUT

if [ "$BACKUP_INPUT" = "latest" ]; then
    BACKUP_FILE=$(ls -t $LOCAL_BACKUP_DIR/astralis_backup_*.sql.gz 2>/dev/null | head -n 1)
    if [ -z "$BACKUP_FILE" ]; then
        echo "✗ No backups found"
        exit 1
    fi
else
    BACKUP_FILE="$LOCAL_BACKUP_DIR/$BACKUP_INPUT"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
read -p "This will OVERWRITE the current database. Are you sure? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Stop application to prevent connections
echo "Stopping application containers..."
docker-compose -f /home/deploy/astralis-nextjs/docker-compose.prod.yml stop app worker

# Drop existing connections
echo "Terminating existing database connections..."
docker exec -t $CONTAINER_NAME psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

# Drop and recreate database
echo "Dropping database..."
docker exec -t $CONTAINER_NAME psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Creating fresh database..."
docker exec -t $CONTAINER_NAME psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore backup
echo "Restoring backup..."
gunzip -c $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME

# Restart application
echo "Restarting application containers..."
docker-compose -f /home/deploy/astralis-nextjs/docker-compose.prod.yml up -d app worker

echo ""
echo "=========================================="
echo "Restore complete!"
echo "=========================================="
echo "Database restored from: $BACKUP_FILE"
echo ""
```

Make all scripts executable:

```bash
chmod +x /home/deploy/astralis-nextjs/scripts/*.sh
```

### Step 10: Create Monitoring Utilities

**File**: `/home/deploy/astralis-nextjs/src/lib/monitoring/logger.ts`

```typescript
/**
 * Production Logger
 *
 * Structured logging for production environment
 * Logs to console and optionally to file
 */

import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private logLevel: LogLevel;
  private logToFile: boolean;
  private logDirectory: string;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logDirectory = process.env.LOG_DIRECTORY || '/var/log/astralis';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.logToFile) return;

    try {
      const logFile = path.join(this.logDirectory, 'app', `${entry.level}.log`);
      const logLine = this.formatEntry(entry) + '\n';

      // Ensure directory exists
      if (!fs.existsSync(path.dirname(logFile))) {
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
      }

      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    // Console output with color
    const colors = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';

    console.log(`${colors[level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}`, context || '');

    if (error) {
      console.error(error);
    }

    // File output
    this.writeToFile(entry);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();
```

**File**: `/home/deploy/astralis-nextjs/src/lib/monitoring/metrics.ts`

```typescript
/**
 * Application Metrics Collector
 *
 * Collects and aggregates application metrics
 * for Prometheus endpoint
 */

interface MetricValue {
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private counters: Map<string, number>;
  private gauges: Map<string, MetricValue>;
  private histograms: Map<string, number[]>;

  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, {
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Record a value in histogram
   */
  recordHistogram(name: string, value: number): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);
  }

  /**
   * Get all counters
   */
  getCounters(): Map<string, number> {
    return new Map(this.counters);
  }

  /**
   * Get all gauges
   */
  getGauges(): Map<string, MetricValue> {
    return new Map(this.gauges);
  }

  /**
   * Get histogram percentiles
   */
  getHistogramPercentiles(name: string, percentiles: number[] = [50, 90, 95, 99]): Record<number, number> {
    const values = this.histograms.get(name) || [];
    if (values.length === 0) return {};

    const sorted = [...values].sort((a, b) => a - b);
    const result: Record<number, number> = {};

    percentiles.forEach((p) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      result[p] = sorted[index];
    });

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

// Helper to measure execution time
export async function measureTime<T>(
  metricName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.recordHistogram(metricName, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.recordHistogram(metricName, duration);
    metrics.incrementCounter(`${metricName}_errors`);
    throw error;
  }
}
```

---

## Production Deployment Checklist

### Pre-Deployment Checklist

- [ ] **DNS Configuration**
  - [ ] A record for app.astralisone.com points to 137.184.31.207
  - [ ] DNS propagation verified (dig app.astralisone.com)

- [ ] **Server Setup**
  - [ ] DigitalOcean droplet created (8GB RAM, 4 vCPUs)
  - [ ] SSH access configured
  - [ ] Firewall configured (ports 22, 80, 443 open)
  - [ ] Fail2ban installed and configured
  - [ ] Docker and Docker Compose installed
  - [ ] Application directory created at /home/deploy/astralis-nextjs

- [ ] **Environment Configuration**
  - [ ] .env.production created with all required variables
  - [ ] Database password generated (strong, 32+ characters)
  - [ ] Redis password generated (strong, 32+ characters)
  - [ ] NextAuth secret generated (64+ characters)
  - [ ] Grafana admin password set
  - [ ] All API keys configured (OpenAI, Google, SendGrid, Spaces)
  - [ ] Environment file backed up securely off-server

- [ ] **DigitalOcean Spaces**
  - [ ] Bucket created: astralis-documents-prod
  - [ ] Bucket created: astralis-backups-prod
  - [ ] CDN enabled for documents bucket
  - [ ] CORS configured for document uploads
  - [ ] Access keys generated and added to .env.production

- [ ] **SSL Certificates**
  - [ ] DH parameters generated (dhparam.pem)
  - [ ] Let's Encrypt certificate obtained for app.astralisone.com
  - [ ] Certificate renewal cron job configured
  - [ ] HTTPS redirect tested

- [ ] **Database**
  - [ ] PostgreSQL container started
  - [ ] Database created: astralis_production
  - [ ] Database user created with appropriate permissions
  - [ ] All migrations run successfully (prisma migrate deploy)
  - [ ] Connection pooling configured
  - [ ] Backup script tested and working

### Deployment Execution Checklist

- [ ] **Code Deployment**
  - [ ] Latest code pulled from main branch
  - [ ] Dependencies installed (npm ci)
  - [ ] Prisma client generated
  - [ ] Next.js build completed successfully
  - [ ] Docker images built for all services

- [ ] **Container Startup**
  - [ ] All containers started via docker-compose
  - [ ] Health checks passing for all services
  - [ ] No errors in container logs
  - [ ] Services can communicate (app → postgres, app → redis)

- [ ] **SSL and Nginx**
  - [ ] Nginx container started and healthy
  - [ ] HTTP to HTTPS redirect working
  - [ ] SSL certificate valid and trusted
  - [ ] Security headers present in responses
  - [ ] Rate limiting tested and working

- [ ] **Application Testing**
  - [ ] Homepage loads at https://app.astralisone.com
  - [ ] Health check endpoint returns 200
  - [ ] Database connection successful
  - [ ] Redis connection successful
  - [ ] Authentication flow works (sign in/sign out)
  - [ ] Dashboard accessible for authenticated users
  - [ ] API endpoints responding correctly

- [ ] **Background Jobs**
  - [ ] Worker container started and healthy
  - [ ] BullMQ queues connecting to Redis
  - [ ] Test job processed successfully
  - [ ] Worker logs show no errors

- [ ] **Monitoring**
  - [ ] Prometheus scraping metrics
  - [ ] Grafana dashboards accessible
  - [ ] Postgres exporter collecting database metrics
  - [ ] Redis exporter collecting cache metrics
  - [ ] Application metrics endpoint responding

### Post-Deployment Checklist

- [ ] **Backups**
  - [ ] Initial database backup created
  - [ ] Backup uploaded to Spaces successfully
  - [ ] Backup cron job scheduled (daily at 2 AM)
  - [ ] Backup retention policy configured (30 days)
  - [ ] Database restore tested with backup

- [ ] **Monitoring Setup**
  - [ ] Grafana admin password changed from default
  - [ ] Key dashboards created (app, database, system)
  - [ ] Alert rules configured for critical metrics
  - [ ] Test alert triggered and verified

- [ ] **Performance Validation**
  - [ ] Page load times < 2 seconds
  - [ ] API response times < 500ms
  - [ ] Database query performance acceptable
  - [ ] Memory usage stable over 1 hour
  - [ ] No memory leaks detected

- [ ] **Security Validation**
  - [ ] Security headers present (HSTS, CSP, etc.)
  - [ ] Rate limiting working
  - [ ] Failed login attempts blocked by fail2ban
  - [ ] No sensitive data in logs
  - [ ] HTTPS enforcement working
  - [ ] Database not accessible from public internet

- [ ] **Documentation**
  - [ ] Deployment documented with timestamp
  - [ ] Environment variables documented
  - [ ] Backup/restore procedures documented
  - [ ] Rollback procedure tested
  - [ ] Monitoring access documented
  - [ ] On-call procedures documented

---

## Testing Checklist for Production Readiness

### Infrastructure Tests

1. **Server Access**
   ```bash
   # SSH access
   ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

   # Verify Docker installation
   docker --version
   docker-compose --version

   # Verify firewall
   sudo ufw status
   ```

2. **DNS Resolution**
   ```bash
   # Verify DNS
   dig app.astralisone.com
   nslookup app.astralisone.com

   # Should return 137.184.31.207
   ```

3. **SSL Certificate**
   ```bash
   # Test SSL
   curl -I https://app.astralisone.com

   # Verify certificate
   openssl s_client -connect app.astralisone.com:443 -servername app.astralisone.com

   # Check SSL rating
   # Visit: https://www.ssllabs.com/ssltest/analyze.html?d=app.astralisone.com
   ```

### Application Tests

1. **Health Checks**
   ```bash
   # App health
   curl https://app.astralisone.com/api/health
   # Expected: {"status":"healthy","timestamp":"...","uptime":123,"checks":{"database":{"status":"healthy"},...}}

   # Metrics endpoint
   curl https://app.astralisone.com/api/metrics
   # Expected: Prometheus format metrics
   ```

2. **Authentication Flow**
   - [ ] Navigate to https://app.astralisone.com
   - [ ] Click "Sign In"
   - [ ] Sign in with credentials (should work)
   - [ ] Sign in with Google OAuth (should work)
   - [ ] Sign out (should work)
   - [ ] Attempt to access /dashboard without auth (should redirect to signin)

3. **Dashboard Functionality**
   - [ ] Dashboard overview loads with stats
   - [ ] Pipeline Kanban board displays
   - [ ] Drag and drop works
   - [ ] Intake queue shows requests
   - [ ] Organization switcher works (if multiple orgs)

4. **API Endpoints**
   ```bash
   # Test authenticated endpoint (with valid session cookie)
   curl -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
        https://app.astralisone.com/api/pipelines

   # Should return pipelines JSON
   ```

5. **Document Upload (Phase 4)**
   - [ ] Upload document through UI
   - [ ] Verify upload to Spaces
   - [ ] Check OCR processing job queued
   - [ ] Verify OCR results after processing

6. **Calendar Integration (Phase 5)**
   - [ ] Connect Google Calendar
   - [ ] Create scheduling event
   - [ ] Verify event synced to Google Calendar
   - [ ] Check conflict detection working

### Performance Tests

1. **Load Testing**
   ```bash
   # Install Apache Bench
   sudo apt-get install apache2-utils

   # Test homepage
   ab -n 1000 -c 10 https://app.astralisone.com/

   # Test API endpoint
   ab -n 1000 -c 10 -H "Cookie: session=..." https://app.astralisone.com/api/health
   ```

2. **Database Performance**
   ```bash
   # Connect to database
   docker exec -it astralis-postgres psql -U astralis_user -d astralis_production

   # Check slow queries
   SELECT query, calls, mean_exec_time, max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;

   # Check table sizes
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Memory Usage**
   ```bash
   # Monitor containers
   docker stats

   # Check app memory
   docker stats astralis-app

   # Verify no memory leaks (monitor over 1 hour)
   watch -n 60 'docker stats --no-stream astralis-app'
   ```

### Security Tests

1. **HTTPS Enforcement**
   ```bash
   # HTTP should redirect to HTTPS
   curl -I http://app.astralisone.com
   # Expected: 301 redirect to https://

   # Verify HSTS header
   curl -I https://app.astralisone.com | grep -i strict-transport-security
   ```

2. **Security Headers**
   ```bash
   # Check all security headers
   curl -I https://app.astralisone.com

   # Should include:
   # - Strict-Transport-Security
   # - X-Frame-Options: SAMEORIGIN
   # - X-Content-Type-Options: nosniff
   # - X-XSS-Protection
   # - Content-Security-Policy
   # - Referrer-Policy
   ```

3. **Rate Limiting**
   ```bash
   # Test API rate limit (should block after 100 requests/min)
   for i in {1..150}; do curl https://app.astralisone.com/api/health; done
   # Should get 429 Too Many Requests after 100
   ```

4. **SQL Injection Prevention**
   - [ ] Attempt SQL injection in login form
   - [ ] Attempt SQL injection in search fields
   - [ ] All inputs should be safely escaped by Prisma

5. **XSS Prevention**
   - [ ] Attempt to inject `<script>` tags in form fields
   - [ ] Verify output is escaped in UI
   - [ ] Check CSP headers prevent inline scripts

### Backup and Recovery Tests

1. **Database Backup**
   ```bash
   # Run backup script
   /home/deploy/astralis-nextjs/scripts/backup.sh

   # Verify backup created
   ls -lh /home/deploy/backups/db/

   # Verify backup uploaded to Spaces
   s3cmd ls s3://astralis-backups-prod/
   ```

2. **Database Restore**
   ```bash
   # Test restore (use test database)
   /home/deploy/astralis-nextjs/scripts/restore.sh

   # Verify data integrity after restore
   docker exec -it astralis-postgres psql -U astralis_user -d astralis_production -c "SELECT COUNT(*) FROM \"Organization\";"
   ```

3. **Rollback**
   ```bash
   # Test rollback procedure
   /home/deploy/astralis-nextjs/scripts/rollback.sh

   # Verify application still works
   curl https://app.astralisone.com/api/health
   ```

### Monitoring Tests

1. **Prometheus**
   - [ ] Access Prometheus UI (port 9090, local network only)
   - [ ] Verify all targets are UP
   - [ ] Check metrics are being collected
   - [ ] Query test: `up{job="nextjs-app"}`

2. **Grafana**
   - [ ] Access Grafana UI (port 3003 or via Nginx /grafana/)
   - [ ] Log in with admin credentials
   - [ ] Verify dashboards exist and show data
   - [ ] Create test alert rule
   - [ ] Verify alert fires when condition met

3. **Log Aggregation**
   ```bash
   # Check application logs
   docker-compose -f docker-compose.prod.yml logs -f app

   # Check nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log

   # Check worker logs
   docker-compose -f docker-compose.prod.yml logs -f worker
   ```

### Stress Tests

1. **Concurrent Users**
   ```bash
   # Install wrk for load testing
   sudo apt-get install wrk

   # 100 concurrent connections for 30 seconds
   wrk -t12 -c100 -d30s https://app.astralisone.com/

   # Monitor application during test
   watch -n 1 'docker stats --no-stream'
   ```

2. **Background Job Processing**
   ```bash
   # Queue 1000 test jobs
   node -e "
   const { Queue } = require('bullmq');
   const queue = new Queue('test-queue', { connection: { host: 'localhost', port: 6379 } });
   for (let i = 0; i < 1000; i++) {
     queue.add('test-job', { data: i });
   }
   "

   # Monitor worker processing
   docker-compose -f docker-compose.prod.yml logs -f worker
   ```

3. **Database Connection Pool**
   ```bash
   # Check active connections
   docker exec -it astralis-postgres psql -U astralis_user -d astralis_production -c "SELECT COUNT(*) FROM pg_stat_activity;"

   # Should not exceed max_connections (100)
   ```

---

## Rollback Procedures

### Scenario 1: Bad Deployment (Application Issues)

**Symptoms**: Application errors, crashes, failed health checks

**Steps**:
1. Run rollback script immediately:
   ```bash
   cd /home/deploy/astralis-nextjs
   ./scripts/rollback.sh
   ```

2. Verify rollback successful:
   ```bash
   curl https://app.astralisone.com/api/health
   docker-compose -f docker-compose.prod.yml ps
   ```

3. Investigate issue in logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs app | tail -100
   ```

4. Fix issue locally, test, then redeploy

### Scenario 2: Database Migration Issues

**Symptoms**: Migration failed, database inconsistent state

**Steps**:
1. Stop application immediately:
   ```bash
   docker-compose -f docker-compose.prod.yml stop app worker
   ```

2. Restore database from latest backup:
   ```bash
   ./scripts/restore.sh
   # Select latest backup when prompted
   ```

3. Revert migration in code:
   ```bash
   git revert <migration-commit-hash>
   ```

4. Restart application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d app worker
   ```

### Scenario 3: SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate expired

**Steps**:
1. Check certificate status:
   ```bash
   docker exec astralis-nginx ls -l /etc/letsencrypt/live/app.astralisone.com/
   ```

2. Manually renew certificate:
   ```bash
   docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --force-renewal
   ```

3. Reload Nginx:
   ```bash
   docker exec astralis-nginx nginx -s reload
   ```

4. Verify HTTPS working:
   ```bash
   curl -I https://app.astralisone.com
   ```

### Scenario 4: Redis/Queue Issues

**Symptoms**: Background jobs not processing, Redis connection errors

**Steps**:
1. Check Redis status:
   ```bash
   docker exec astralis-redis redis-cli ping
   ```

2. Restart Redis container:
   ```bash
   docker-compose -f docker-compose.prod.yml restart redis
   ```

3. Clear failed jobs (if necessary):
   ```bash
   docker exec astralis-redis redis-cli FLUSHDB
   ```

4. Restart worker:
   ```bash
   docker-compose -f docker-compose.prod.yml restart worker
   ```

### Scenario 5: Complete System Failure

**Symptoms**: All services down, server unresponsive

**Steps**:
1. SSH to server:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
   ```

2. Check disk space:
   ```bash
   df -h
   # If disk full, clean up logs and old images
   docker system prune -a --volumes
   ```

3. Restart all containers:
   ```bash
   cd /home/deploy/astralis-nextjs
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. If still failing, restore from backup:
   ```bash
   # Restore latest database backup
   ./scripts/restore.sh

   # Checkout last known good commit
   git checkout <last-good-commit>

   # Rebuild and redeploy
   ./scripts/deploy.sh
   ```

5. If server itself is corrupted:
   - Create new DigitalOcean droplet
   - Run setup-server.sh
   - Restore database from Spaces backup
   - Deploy latest code
   - Update DNS to point to new droplet IP

---

## Handoff Summary

### What's Complete in Phase 6

- **Production Docker Environment**: Multi-stage Dockerfiles, production docker-compose.yml with all services
- **Nginx Reverse Proxy**: SSL termination, security headers, rate limiting, gzip compression
- **SSL Certificates**: Let's Encrypt integration with automatic renewal
- **Database Optimization**: PostgreSQL tuned for production, connection pooling configured
- **Redis Persistence**: AOF + RDB snapshots for queue durability
- **PM2 Cluster Mode**: 4 Node.js instances for high availability
- **Health Checks**: Comprehensive health checks for all services
- **Monitoring Stack**: Prometheus + Grafana with dashboards for app, database, and system metrics
- **Backup Automation**: Daily database backups to DigitalOcean Spaces with 30-day retention
- **Deployment Scripts**: Zero-downtime deployment, rollback, backup, and restore scripts
- **Security Hardening**: Firewall, fail2ban, security headers, rate limiting, HTTPS enforcement
- **Logging**: Structured logging with file output and rotation
- **Metrics Collection**: Application metrics endpoint for Prometheus scraping

### What's Next (Phase 7: Cleanup & Refactor)

- Code organization audit and cleanup
- Remove unused dependencies
- Add comprehensive JSDoc comments
- Standardize naming conventions
- Refactor duplicated code
- Optimize imports and bundle size
- Database query optimization
- Add missing indexes
- Security hardening final review
- TypeScript strict mode enforcement
- Testing infrastructure (unit, integration, E2E)
- Performance benchmarks
- Final documentation updates

### Current System State

**Docker Services**:
- nginx (ports 80, 443)
- app (internal 3001, PM2 cluster with 4 instances)
- postgres (internal 5432, tuned for production)
- redis (internal 6379, with persistence)
- worker (background jobs)
- prometheus (port 9090)
- grafana (port 3003)
- postgres-exporter (port 9187)
- redis-exporter (port 9121)

**Database**: PostgreSQL 16 with complete schema (Organizations, Users, Pipelines, Stages, PipelineItems, IntakeRequests, Documents, SchedulingEvents, Automations, Accounts, Sessions, ActivityLogs)

**Environment Variables**: 40+ variables configured across authentication, database, Redis, email, AI, storage, calendar, monitoring, and production settings

**Deployment**: Ready for production deployment to 137.184.31.207 with automated deployment, backup, and monitoring

### Critical Production URLs

- **Application**: https://app.astralisone.com
- **Health Check**: https://app.astralisone.com/api/health
- **Metrics**: https://app.astralisone.com/api/metrics
- **Grafana**: https://app.astralisone.com/grafana/ (local network only)
- **Prometheus**: http://137.184.31.207:9090 (local network only)

### Support Contacts

- **Server**: 137.184.31.207 (DigitalOcean Droplet)
- **SSH**: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- **Logs**: `/var/log/astralis/` and `docker-compose logs`
- **Backups**: DigitalOcean Spaces bucket `astralis-backups-prod`

---

**Phase 6 complete. Production deployment ready. Proceed to Phase 7 for cleanup and refactoring.**
