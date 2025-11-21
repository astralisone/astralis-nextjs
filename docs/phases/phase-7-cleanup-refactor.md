# Phase 7: Cleanup & Refactor

**Duration**: 1-2 weeks
**Prerequisites**: Phases 1-6 complete
**Docker Changes**: None (optimization and hardening only)

---

## Phase Overview

This phase focuses on production readiness through comprehensive code cleanup, refactoring, testing infrastructure setup, and performance optimization. By the end of this phase, AstralisOps will have a clean, maintainable codebase with robust testing infrastructure, optimized performance, and hardened security.

### Success Criteria Checklist

- [ ] All unused dependencies and files removed
- [ ] Code organization follows established patterns
- [ ] All files have comprehensive JSDoc comments
- [ ] No code duplication - utilities extracted and reused
- [ ] TypeScript strict mode enabled with zero errors
- [ ] ESLint configured with no warnings
- [ ] Bundle size optimized (< 300kb initial load)
- [ ] Database queries optimized with proper indexes
- [ ] Testing infrastructure fully configured
- [ ] Unit tests for critical services (80%+ coverage)
- [ ] Integration tests for all API routes
- [ ] E2E tests for core user flows
- [ ] Security hardening checklist complete
- [ ] All documentation updated
- [ ] Performance benchmarks established

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 15 (App Router), TypeScript 5, Prisma ORM, PostgreSQL, Redis, Docker
**Infrastructure**: DigitalOcean Droplet + Spaces (S3-compatible object storage)

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

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) (Phase 2)
**Background Jobs**: BullMQ + Redis (Phase 3)
**AI Integration**: OpenAI GPT-4 for routing and scheduling (Phase 3, 5)
**Document Processing**: Tesseract.js + GPT-4 Vision (Phase 4)
**Calendar**: Google Calendar API integration (Phase 5)
**Deployment**: Docker Compose + Nginx + SSL (Phase 6)

**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 7 - No Changes)

```yaml
Production Containers (from Phase 6):
- nginx: Reverse proxy with SSL
  ├── Handles HTTPS termination
  ├── Static file serving
  ├── Rate limiting
  └── Load balancing to app instances

- app: Next.js application cluster
  ├── Production build
  ├── PM2 cluster mode (4 instances)
  ├── Health check endpoint
  └── Logging to stdout/stderr

- worker: Background job processor
  ├── BullMQ worker
  ├── Processes AI routing, document OCR, email sending
  ├── Scheduled reminders
  └── Auto-restart on failure

- postgres: PostgreSQL 16 database
  ├── Optimized connection pooling
  ├── Daily backups to Spaces
  ├── Performance tuning applied
  └── Monitoring enabled

- redis: Redis 7 cache and queue
  ├── Persistence enabled (AOF)
  ├── Pub/sub for real-time updates
  ├── Session storage
  └── Job queue storage

Volumes:
- postgres-data: Database persistence
- redis-data: Redis persistence (AOF files)
- nginx-certs: SSL certificates
- app-logs: Application logs

Networks:
- astralis-network: Internal bridge network

Status: All services hardened and optimized in this phase
```

---

## Database Schema State (Phase 7 - Indexes Added)

Complete Prisma schema with optimization indexes added in this phase:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  OPERATOR
  CLIENT
}

model Organization {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  users             User[]
  pipelines         Pipeline[]
  documents         Document[]
  intakeRequests    IntakeRequest[]
  automations       Automation[]
  schedulingEvents  SchedulingEvent[]

  // Phase 7: Added indexes for performance
  @@index([createdAt])
  @@index([name])
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  role         Role          @default(OPERATOR)
  orgId        String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  organization Organization  @relation(fields: [orgId], references: [id])
  pipelines    Pipeline[]    @relation("PipelineOperators")

  // Phase 7: Added composite indexes
  @@index([orgId, role])
  @@index([orgId, createdAt])
}

model Pipeline {
  id           String        @id @default(cuid())
  name         String
  orgId        String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  organization   Organization    @relation(fields: [orgId], references: [id])
  stages         Stage[]
  operators      User[]          @relation("PipelineOperators")
  intakeRequests IntakeRequest[]

  // Phase 7: Added indexes
  @@index([orgId, createdAt])
  @@index([orgId, name])
}

model Stage {
  id         String       @id @default(cuid())
  name       String
  order      Int
  pipelineId String

  pipeline   Pipeline     @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  items      PipelineItem[]

  // Phase 7: Added indexes for sorting
  @@index([pipelineId, order])
}

model PipelineItem {
  id        String       @id @default(cuid())
  title     String
  data      Json
  stageId   String
  createdAt DateTime     @default(now())

  stage     Stage        @relation(fields: [stageId], references: [id], onDelete: Cascade)

  // Phase 7: Added indexes
  @@index([stageId, createdAt])
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

model Document {
  id              String         @id @default(cuid())
  fileName        String
  filePath        String
  fileSize        Int
  mimeType        String
  status          DocumentStatus @default(PENDING)
  ocrText         String?        @db.Text
  extractedData   Json?
  metadata        Json?
  uploadedBy      String
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])

  // Phase 7: Optimized indexes
  @@index([orgId, status, createdAt])
  @@index([status, createdAt])
  @@index([uploadedBy, orgId])
}

model IntakeRequest {
  id              String         @id @default(cuid())
  source          IntakeSource
  status          IntakeStatus   @default(NEW)
  title           String
  description     String?        @db.Text
  requestData     Json
  aiRoutingMeta   Json?
  assignedPipeline String?
  priority        Int            @default(0)
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])
  pipeline        Pipeline?      @relation(fields: [assignedPipeline], references: [id])

  // Phase 7: Optimized composite indexes
  @@index([orgId, status, priority])
  @@index([orgId, createdAt])
  @@index([status, priority])
  @@index([assignedPipeline, status])
}

model Automation {
  id              String         @id @default(cuid())
  name            String
  description     String?        @db.Text
  workflowId      String?
  webhookUrl      String?
  isActive        Boolean        @default(true)
  triggerConfig   Json
  lastRunAt       DateTime?
  runCount        Int            @default(0)
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])

  // Phase 7: Added performance indexes
  @@index([orgId, isActive])
  @@index([workflowId])
  @@index([isActive, lastRunAt])
}

enum EventStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  CONFLICT
}

model SchedulingEvent {
  id              String         @id @default(cuid())
  title           String
  description     String?        @db.Text
  startTime       DateTime
  endTime         DateTime
  participants    Json
  calendarIntegration Json?
  aiScheduled     Boolean        @default(false)
  status          EventStatus    @default(SCHEDULED)
  conflictData    Json?
  orgId           String
  createdBy       String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])

  // Phase 7: Optimized for calendar queries
  @@index([orgId, startTime, endTime])
  @@index([status, startTime])
  @@index([aiScheduled, status])
  @@index([createdBy, orgId])
}

// Phase 7: NEW - Activity log for audit trail
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  orgId       String
  action      String
  entityType  String
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([orgId, createdAt])
  @@index([userId, createdAt])
  @@index([entityType, entityId])
  @@index([action, createdAt])
}

// Phase 7: NEW - Session management
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([sessionToken])
  @@index([expires])
}

// Phase 7: NEW - Account for OAuth
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

  @@unique([provider, providerAccountId])
  @@index([userId])
}

// Phase 7: NEW - Verification tokens
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@index([expires])
}
```

---

## Environment Variables (Phase 7 - Complete)

All environment variables across all phases:

```bash
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL="postgresql://astralis_user:secure_password@postgres:5432/astralis_one"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ============================================================================
# NEXTAUTH.JS (Phase 1)
# ============================================================================
NEXTAUTH_SECRET="<generated-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://app.astralisone.com"
GOOGLE_CLIENT_ID="<google-oauth-client-id>"
GOOGLE_CLIENT_SECRET="<google-oauth-client-secret>"

# ============================================================================
# EMAIL (Phase 1)
# ============================================================================
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="<sendgrid-api-key>"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ============================================================================
# REDIS (Phase 3)
# ============================================================================
REDIS_URL="redis://redis:6379"
REDIS_PASSWORD="<generated-redis-password>"
REDIS_TLS="false"

# ============================================================================
# OPENAI (Phase 3)
# ============================================================================
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"
OPENAI_MAX_TOKENS=2000

# ============================================================================
# DIGITALOCEAN SPACES (Phase 4)
# ============================================================================
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_ACCESS_KEY="<spaces-access-key>"
SPACES_SECRET_KEY="<spaces-secret-key>"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# ============================================================================
# GOOGLE CALENDAR (Phase 5)
# ============================================================================
GOOGLE_CALENDAR_CLIENT_ID="<calendar-oauth-client-id>"
GOOGLE_CALENDAR_CLIENT_SECRET="<calendar-oauth-secret>"
GOOGLE_CALENDAR_REDIRECT_URI="https://app.astralisone.com/api/calendar/callback"

# ============================================================================
# ANALYTICS (Existing)
# ============================================================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"

# ============================================================================
# APPLICATION
# ============================================================================
NEXT_PUBLIC_API_BASE_URL="https://app.astralisone.com"
NODE_ENV="production"
PORT=3001

# ============================================================================
# SECURITY (Phase 7)
# ============================================================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
CORS_ALLOWED_ORIGINS="https://astralisone.com,https://www.astralisone.com"
SESSION_MAX_AGE=86400
BCRYPT_ROUNDS=12

# ============================================================================
# MONITORING (Phase 6/7)
# ============================================================================
LOG_LEVEL="info"
SENTRY_DSN="<sentry-dsn-if-using>"
ENABLE_PROFILING="false"

# ============================================================================
# FEATURE FLAGS (Phase 7)
# ============================================================================
ENABLE_AI_ROUTING="true"
ENABLE_DOCUMENT_OCR="true"
ENABLE_CALENDAR_SYNC="true"
ENABLE_EMAIL_NOTIFICATIONS="true"
```

---

## File Structure (Final - After Phase 7)

```
/home/deploy/astralis-nextjs/
├── .github/
│   └── workflows/
│       └── ci.yml                        # [Phase 7] CI/CD pipeline
│
├── docs/
│   ├── phases/                           # Phase documentation
│   │   ├── PROGRESS.md
│   │   ├── phase-1-authentication-rbac.md
│   │   ├── phase-2-dashboard-ui-pipelines.md
│   │   ├── phase-3-ai-routing-background-jobs.md
│   │   ├── phase-4-document-processing-ocr.md
│   │   ├── phase-5-scheduling-calendar.md
│   │   ├── phase-6-production-deployment.md
│   │   ├── phase-7-cleanup-refactor.md
│   │   └── README.md
│   ├── api/                              # [Phase 7] API documentation
│   │   ├── README.md                     # API overview
│   │   ├── authentication.md
│   │   ├── pipelines.md
│   │   ├── intake.md
│   │   ├── documents.md
│   │   └── scheduling.md
│   ├── architecture/                     # [Phase 7] Architecture docs
│   │   ├── system-overview.md
│   │   ├── database-schema.md
│   │   ├── ai-routing.md
│   │   └── security.md
│   └── deployment/                       # [Phase 7] Deployment guides
│       ├── production-checklist.md
│       ├── backup-restore.md
│       └── monitoring.md
│
├── prisma/
│   ├── schema.prisma                     # [Phase 7] Optimized with indexes
│   ├── migrations/                       # All migrations
│   └── seed.ts                           # [Phase 7] Database seeding
│
├── src/
│   ├── __tests__/                        # [Phase 7] Test files
│   │   ├── unit/
│   │   │   ├── lib/
│   │   │   │   ├── email.test.ts
│   │   │   │   ├── calendar.test.ts
│   │   │   │   └── validators.test.ts
│   │   │   └── services/
│   │   │       ├── ai-routing.test.ts
│   │   │       └── auth.test.ts
│   │   ├── integration/
│   │   │   ├── api/
│   │   │   │   ├── auth.test.ts
│   │   │   │   ├── pipelines.test.ts
│   │   │   │   ├── intake.test.ts
│   │   │   │   └── documents.test.ts
│   │   │   └── database/
│   │   │       └── queries.test.ts
│   │   └── e2e/
│   │       ├── auth-flow.test.ts
│   │       ├── pipeline-management.test.ts
│   │       └── document-upload.test.ts
│   │
│   ├── app/
│   │   ├── (marketing)/                  # Public pages
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   ├── contact/
│   │   │   ├── marketplace/
│   │   │   └── services/
│   │   ├── (app)/                        # [Phase 2] Authenticated dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── pipelines/
│   │   │   ├── intake/
│   │   │   ├── documents/                # [Phase 4]
│   │   │   ├── calendar/                 # [Phase 5]
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/                     # [Phase 1] NextAuth routes
│   │   │   ├── booking/                  # Booking endpoint
│   │   │   ├── contact/                  # Contact form
│   │   │   ├── intake/                   # [Phase 3] AI routing
│   │   │   ├── pipelines/
│   │   │   ├── documents/                # [Phase 4] Upload/OCR
│   │   │   ├── calendar/                 # [Phase 5] Google Calendar
│   │   │   ├── automations/
│   │   │   ├── orgs/
│   │   │   ├── users/
│   │   │   └── health/                   # [Phase 7] Health check
│   │   ├── astralisops/
│   │   ├── solutions/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── index.ts
│   │   ├── auth/                         # [Phase 1]
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/                    # [Phase 2]
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── KanbanCard.tsx
│   │   │   ├── StatsWidget.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── IntakeQueueTable.tsx
│   │   │   ├── PipelineList.tsx
│   │   │   └── index.ts
│   │   ├── documents/                    # [Phase 4]
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── DocumentQueue.tsx
│   │   │   └── index.ts
│   │   ├── calendar/                     # [Phase 5]
│   │   │   ├── CalendarView.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── AvailabilitySettings.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── navigation.tsx
│   │   │   ├── DashboardSidebar.tsx     # [Phase 2]
│   │   │   ├── DashboardHeader.tsx      # [Phase 2]
│   │   │   ├── OrgSwitcher.tsx          # [Phase 2]
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   ├── GoogleAnalytics.tsx
│   │   │   └── index.ts
│   │   ├── booking/
│   │   │   ├── BookingModal.tsx
│   │   │   └── index.ts
│   │   ├── sections/
│   │   │   ├── hero.tsx
│   │   │   ├── feature-grid.tsx
│   │   │   ├── stats-section.tsx
│   │   │   ├── cta-section.tsx
│   │   │   └── index.ts
│   │   └── effects/
│   │       └── ParticleField.tsx
│   │
│   ├── lib/
│   │   ├── auth/                         # [Phase 1]
│   │   │   ├── config.ts                # NextAuth config
│   │   │   ├── providers.ts             # Auth providers
│   │   │   └── index.ts
│   │   ├── middleware/                   # [Phase 1]
│   │   │   ├── auth-guard.ts
│   │   │   ├── rbac.ts
│   │   │   ├── rate-limit.ts            # [Phase 7]
│   │   │   ├── error-handler.ts         # [Phase 7]
│   │   │   └── index.ts
│   │   ├── services/                     # [Phase 1+]
│   │   │   ├── auth-service.ts
│   │   │   ├── user-service.ts
│   │   │   ├── organization-service.ts
│   │   │   ├── pipeline-service.ts      # [Phase 7] Extracted
│   │   │   ├── intake-service.ts        # [Phase 7] Extracted
│   │   │   ├── document-service.ts      # [Phase 7] Extracted
│   │   │   ├── calendar-service.ts      # [Phase 7] Extracted
│   │   │   └── index.ts
│   │   ├── validators/                   # [Phase 1]
│   │   │   ├── auth-schemas.ts
│   │   │   ├── pipeline-schemas.ts
│   │   │   ├── intake-schemas.ts
│   │   │   ├── document-schemas.ts
│   │   │   ├── calendar-schemas.ts
│   │   │   └── index.ts
│   │   ├── ai/                           # [Phase 3]
│   │   │   ├── routing-engine.ts
│   │   │   ├── openai-client.ts
│   │   │   └── index.ts
│   │   ├── storage/                      # [Phase 4]
│   │   │   ├── spaces-client.ts
│   │   │   ├── file-upload.ts
│   │   │   └── index.ts
│   │   ├── ocr/                          # [Phase 4]
│   │   │   ├── tesseract-service.ts
│   │   │   ├── vision-service.ts
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   ├── gtag.ts
│   │   │   └── index.ts
│   │   ├── utils/                        # [Phase 7] Consolidated
│   │   │   ├── date-utils.ts
│   │   │   ├── string-utils.ts
│   │   │   ├── number-utils.ts
│   │   │   ├── validation-utils.ts
│   │   │   └── index.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts                      # [Phase 3]
│   │   ├── email.ts
│   │   ├── calendar.ts
│   │   ├── logger.ts                     # [Phase 7] Centralized logging
│   │   └── utils.ts
│   │
│   ├── workers/                          # [Phase 3]
│   │   ├── queues/
│   │   │   ├── intake-routing.ts
│   │   │   ├── document-processing.ts
│   │   │   ├── email-sending.ts
│   │   │   └── scheduling-reminders.ts
│   │   ├── jobs/
│   │   │   ├── process-intake.ts
│   │   │   ├── process-document.ts
│   │   │   ├── send-email.ts
│   │   │   └── send-reminder.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── usePipelines.ts              # [Phase 2]
│   │   ├── useIntake.ts                 # [Phase 2]
│   │   ├── useOrganization.ts           # [Phase 2]
│   │   ├── useDocuments.ts              # [Phase 4]
│   │   ├── useCalendar.ts               # [Phase 5]
│   │   ├── useAnalytics.ts
│   │   ├── animations/
│   │   │   ├── useCountUp.ts
│   │   │   ├── useStepTransition.ts
│   │   │   ├── useIntersectionAnimation.ts
│   │   │   ├── useHoverGlow.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── stores/                           # [Phase 2]
│   │   ├── dashboardStore.ts
│   │   ├── pipelineStore.ts
│   │   ├── authStore.ts                 # [Phase 7] Extracted
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── auth.ts                      # [Phase 1]
│   │   ├── dashboard.ts                 # [Phase 2]
│   │   ├── pipeline.ts                  # [Phase 7] Extracted
│   │   ├── intake.ts                    # [Phase 7] Extracted
│   │   ├── document.ts                  # [Phase 7] Extracted
│   │   ├── calendar.ts                  # [Phase 7] Extracted
│   │   ├── api.ts                       # [Phase 7] Common API types
│   │   └── index.ts
│   │
│   ├── data/
│   │   ├── homepage-content.ts
│   │   ├── solutions-content.ts
│   │   └── astralisops-content.ts
│   │
│   └── styles/
│       └── effects.css
│
├── public/
│   ├── images/
│   │   └── [existing images]
│   ├── favicon.ico
│   └── robots.txt                        # [Phase 7] SEO
│
├── scripts/                              # [Phase 7] Utility scripts
│   ├── db-backup.sh
│   ├── db-restore.sh
│   ├── deploy.sh
│   └── health-check.sh
│
├── .storybook/                           # Storybook config
│   ├── main.ts
│   └── preview.ts
│
├── docker/                               # [Phase 6]
│   ├── app/
│   │   └── Dockerfile
│   ├── worker/
│   │   └── Dockerfile
│   └── nginx/
│       ├── Dockerfile
│       └── nginx.conf
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # [Phase 7] CI/CD
│
├── .env.local.template                   # [Phase 7] Updated
├── .env.production.template              # [Phase 6]
├── .eslintrc.json                        # [Phase 7] Enhanced
├── .gitignore
├── .prettierrc                           # [Phase 7] Code formatting
├── docker-compose.yml                    # Development
├── docker-compose.prod.yml               # [Phase 6] Production
├── jest.config.js                        # [Phase 7] Jest config
├── next.config.js                        # [Phase 7] Optimized
├── package.json                          # [Phase 7] Cleaned
├── tsconfig.json                         # [Phase 7] Strict mode
├── tailwind.config.ts
├── postcss.config.js
├── README.md                             # [Phase 7] Updated
└── CLAUDE.md
```

---

## Implementation Steps

### Step 1: TypeScript Strict Mode & ESLint Configuration

**Update `tsconfig.json` for strict mode:**

```bash
cd /home/deploy/astralis-nextjs
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": false,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },

    // STRICT MODE SETTINGS (Phase 7)
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "exactOptionalPropertyTypes": false,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "out", "dist"]
}
```

**Create `.eslintrc.json`:**

```json
{
  "root": true,
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Import organization
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],

    // React
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn",

    // General
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  }
}
```

**Create `.prettierrc`:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Install ESLint dependencies:**

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import prettier
```

**Run linter and fix issues:**

```bash
# Check for errors
npm run lint

# Auto-fix what can be fixed
npx eslint . --ext .ts,.tsx --fix

# Format with Prettier
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
```

### Step 2: Testing Infrastructure Setup

**Install testing dependencies:**

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @types/jest \
  ts-node \
  @playwright/test
```

**Create `jest.config.js`:**

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/**', // Exclude Next.js app directory (mostly routing)
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/out/'],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**Create `jest.setup.js`:**

```javascript
import '@testing-library/jest-dom';

// Mock environment variables
process.env = {
  ...process.env,
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3001',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  REDIS_URL: 'redis://localhost:6379',
};

// Mock fetch globally
global.fetch = jest.fn();
```

**Create `playwright.config.ts` for E2E tests:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Update `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "postinstall": "prisma generate",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Step 3: Create Unit Tests for Critical Services

**Create `src/__tests__/unit/lib/email.test.ts`:**

```typescript
import { generateCustomerConfirmationEmail, generateInternalNotificationEmail } from '@/lib/email';

describe('Email Generation', () => {
  describe('generateCustomerConfirmationEmail', () => {
    it('should generate valid HTML email with all booking details', () => {
      const bookingData = {
        bookingId: 'BK-12345',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
        service: 'AI Integration Consultation',
        date: '2025-02-15',
        time: '14:00',
        notes: 'Looking forward to discussing AI solutions',
      };

      const result = generateCustomerConfirmationEmail(bookingData);

      expect(result.html).toContain('BK-12345');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('AI Integration Consultation');
      expect(result.html).toContain('February 15, 2025');
      expect(result.html).toContain('2:00 PM');

      expect(result.text).toContain('BK-12345');
      expect(result.text).toContain('John Doe');

      expect(result.subject).toBe('Booking Confirmation - BK-12345');
    });

    it('should handle missing optional fields gracefully', () => {
      const bookingData = {
        bookingId: 'BK-12345',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '',
        service: 'Consultation',
        date: '2025-02-20',
        time: '10:00',
        notes: '',
      };

      const result = generateCustomerConfirmationEmail(bookingData);

      expect(result.html).toContain('BK-12345');
      expect(result.html).toContain('Jane Smith');
      expect(result.html).not.toContain('Notes:');
    });
  });

  describe('generateInternalNotificationEmail', () => {
    it('should generate internal notification with complete details', () => {
      const bookingData = {
        bookingId: 'BK-67890',
        name: 'Alice Johnson',
        email: 'alice@company.com',
        phone: '555-9876',
        service: 'Enterprise Setup',
        date: '2025-03-01',
        time: '09:00',
        notes: 'Fortune 500 company',
      };

      const result = generateInternalNotificationEmail(bookingData);

      expect(result.html).toContain('New Booking: BK-67890');
      expect(result.html).toContain('Alice Johnson');
      expect(result.html).toContain('alice@company.com');
      expect(result.html).toContain('555-9876');
      expect(result.html).toContain('Fortune 500 company');

      expect(result.subject).toBe('New Booking Received - BK-67890');
    });
  });
});
```

**Create `src/__tests__/unit/lib/calendar.test.ts`:**

```typescript
import { generateICS } from '@/lib/calendar';

describe('Calendar ICS Generation', () => {
  it('should generate valid ICS file with event details', () => {
    const eventData = {
      title: 'AI Consultation',
      description: 'Discuss AI integration strategies',
      startTime: new Date('2025-02-15T14:00:00Z'),
      endTime: new Date('2025-02-15T15:00:00Z'),
      location: 'Virtual Meeting',
      attendees: ['client@example.com', 'consultant@astralisone.com'],
    };

    const ics = generateICS(eventData);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('SUMMARY:AI Consultation');
    expect(ics).toContain('DESCRIPTION:Discuss AI integration strategies');
    expect(ics).toContain('LOCATION:Virtual Meeting');
    expect(ics).toContain('ATTENDEE:mailto:client@example.com');
    expect(ics).toContain('ATTENDEE:mailto:consultant@astralisone.com');
  });

  it('should handle events without optional fields', () => {
    const eventData = {
      title: 'Quick Call',
      startTime: new Date('2025-02-20T10:00:00Z'),
      endTime: new Date('2025-02-20T10:30:00Z'),
    };

    const ics = generateICS(eventData);

    expect(ics).toContain('SUMMARY:Quick Call');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });
});
```

**Create `src/__tests__/unit/services/auth-service.test.ts`:**

```typescript
import { hashPassword, verifyPassword, generateVerificationToken } from '@/lib/services/auth-service';

describe('Auth Service', () => {
  describe('hashPassword', () => {
    it('should hash password securely', async () => {
      const password = 'SecureP@ssw0rd123';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'CorrectPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPassword456', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate unique token', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();

      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThanOrEqual(32);
    });
  });
});
```

### Step 4: Create Integration Tests for API Routes

**Create `src/__tests__/integration/api/pipelines.test.ts`:**

```typescript
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/pipelines/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    pipeline: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock NextAuth session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: {
      id: 'user-123',
      orgId: 'org-123',
      role: 'ADMIN',
    },
  })),
}));

describe('/api/pipelines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/pipelines', () => {
    it('should return pipelines for organization', async () => {
      const mockPipelines = [
        {
          id: 'pipeline-1',
          name: 'Sales Pipeline',
          orgId: 'org-123',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          stages: [
            { id: 'stage-1', name: 'Lead', order: 0 },
            { id: 'stage-2', name: 'Qualified', order: 1 },
          ],
        },
      ];

      (prisma.pipeline.findMany as jest.Mock).mockResolvedValue(mockPipelines);

      const request = new NextRequest('http://localhost:3001/api/pipelines?orgId=org-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Sales Pipeline');
      expect(prisma.pipeline.findMany).toHaveBeenCalledWith({
        where: { orgId: 'org-123' },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { stages: true },
          },
        },
      });
    });

    it('should return 400 if orgId is missing', async () => {
      const request = new NextRequest('http://localhost:3001/api/pipelines');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/pipelines', () => {
    it('should create new pipeline', async () => {
      const mockPipeline = {
        id: 'pipeline-new',
        name: 'Support Pipeline',
        orgId: 'org-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pipeline.create as jest.Mock).mockResolvedValue(mockPipeline);

      const request = new NextRequest('http://localhost:3001/api/pipelines', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Support Pipeline',
          orgId: 'org-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Support Pipeline');
      expect(prisma.pipeline.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3001/api/pipelines', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name
          orgId: 'org-123',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

**Create `src/__tests__/integration/api/intake.test.ts`:**

```typescript
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/intake/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
jest.mock('@/lib/ai/routing-engine');

describe('/api/intake', () => {
  it('should create intake request and trigger AI routing', async () => {
    const mockIntake = {
      id: 'intake-123',
      source: 'FORM',
      status: 'NEW',
      title: 'Need help with onboarding',
      requestData: {},
      orgId: 'org-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.intakeRequest.create as jest.Mock).mockResolvedValue(mockIntake);

    const request = new NextRequest('http://localhost:3001/api/intake', {
      method: 'POST',
      body: JSON.stringify({
        source: 'FORM',
        title: 'Need help with onboarding',
        description: 'Customer needs onboarding assistance',
        requestData: {
          customerEmail: 'customer@example.com',
        },
        orgId: 'org-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('intake-123');
    expect(prisma.intakeRequest.create).toHaveBeenCalled();
  });
});
```

### Step 5: Create E2E Tests

**Create `src/__tests__/e2e/auth-flow.test.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to sign up', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'SecureP@ssw0rd123');
    await page.fill('input[name="confirmPassword"]', 'SecureP@ssw0rd123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to verification page
    await expect(page).toHaveURL(/\/auth\/verify/);
    await expect(page.locator('h1')).toContainText('Check Your Email');
  });

  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill signin form
    await page.fill('input[name="email"]', 'demo@astralisone.com');
    await page.fill('input[name="password"]', 'DemoPassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/auth/signin');

    // Submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });
});
```

**Create `src/__tests__/e2e/pipeline-management.test.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Pipeline Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'demo@astralisone.com');
    await page.fill('input[name="password"]', 'DemoPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should display pipelines list', async ({ page }) => {
    await page.goto('/pipelines');

    await expect(page.locator('h1')).toContainText('Pipelines');
    await expect(page.locator('[data-testid="pipeline-card"]')).toHaveCount.greaterThan(0);
  });

  test('should open pipeline kanban board', async ({ page }) => {
    await page.goto('/pipelines');

    // Click first pipeline
    await page.click('[data-testid="pipeline-card"]:first-child');

    // Should show kanban board
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-column"]')).toHaveCount.greaterThan(0);
  });

  test('should drag and drop card between columns', async ({ page }) => {
    await page.goto('/pipelines/pipeline-123');

    const card = page.locator('[data-testid="kanban-card"]:first-child');
    const targetColumn = page.locator('[data-testid="kanban-column"]:nth-child(2)');

    // Drag card to new column
    await card.dragTo(targetColumn);

    // Should show success message
    await expect(page.locator('text=Item moved successfully')).toBeVisible();
  });
});
```

### Step 6: Extract Service Layer and Remove Duplication

**Create `src/lib/services/pipeline-service.ts`:**

```typescript
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Pipeline Service
 * Centralized business logic for pipeline operations
 */

export interface CreatePipelineInput {
  name: string;
  description?: string;
  orgId: string;
  stages?: {
    name: string;
    order: number;
  }[];
}

export interface UpdatePipelineInput {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface MovePipelineItemInput {
  itemId: string;
  targetStageId: string;
  userId: string;
}

/**
 * Get all pipelines for an organization
 */
export async function getPipelinesByOrg(orgId: string) {
  try {
    const pipelines = await prisma.pipeline.findMany({
      where: { orgId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
        _count: {
          select: { stages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pipelines;
  } catch (error) {
    logger.error('Error fetching pipelines', { orgId, error });
    throw new Error('Failed to fetch pipelines');
  }
}

/**
 * Get a single pipeline with all stages and items
 */
export async function getPipelineById(pipelineId: string, orgId: string) {
  try {
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id: pipelineId,
        orgId,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        operators: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    return pipeline;
  } catch (error) {
    logger.error('Error fetching pipeline', { pipelineId, orgId, error });
    throw error;
  }
}

/**
 * Create a new pipeline with optional stages
 */
export async function createPipeline(input: CreatePipelineInput) {
  try {
    const pipeline = await prisma.pipeline.create({
      data: {
        name: input.name,
        description: input.description,
        orgId: input.orgId,
        stages: input.stages
          ? {
              create: input.stages.map((stage) => ({
                name: stage.name,
                order: stage.order,
              })),
            }
          : undefined,
      },
      include: {
        stages: true,
      },
    });

    logger.info('Pipeline created', { pipelineId: pipeline.id, orgId: input.orgId });
    return pipeline;
  } catch (error) {
    logger.error('Error creating pipeline', { input, error });
    throw new Error('Failed to create pipeline');
  }
}

/**
 * Update pipeline details
 */
export async function updatePipeline(input: UpdatePipelineInput) {
  try {
    const pipeline = await prisma.pipeline.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        isActive: input.isActive,
      },
    });

    logger.info('Pipeline updated', { pipelineId: input.id });
    return pipeline;
  } catch (error) {
    logger.error('Error updating pipeline', { input, error });
    throw new Error('Failed to update pipeline');
  }
}

/**
 * Move a pipeline item to a different stage
 */
export async function movePipelineItem(input: MovePipelineItemInput) {
  try {
    const item = await prisma.pipelineItem.update({
      where: { id: input.itemId },
      data: {
        stageId: input.targetStageId,
      },
    });

    // Log the move activity
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: 'MOVE_PIPELINE_ITEM',
        entityType: 'PIPELINE_ITEM',
        entityId: input.itemId,
        metadata: {
          targetStageId: input.targetStageId,
        },
      },
    });

    logger.info('Pipeline item moved', {
      itemId: input.itemId,
      targetStageId: input.targetStageId,
      userId: input.userId,
    });

    return item;
  } catch (error) {
    logger.error('Error moving pipeline item', { input, error });
    throw new Error('Failed to move pipeline item');
  }
}

/**
 * Delete a pipeline (soft delete - mark as inactive)
 */
export async function deletePipeline(pipelineId: string, userId: string) {
  try {
    const pipeline = await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { isActive: false },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE_PIPELINE',
        entityType: 'PIPELINE',
        entityId: pipelineId,
      },
    });

    logger.info('Pipeline deleted', { pipelineId, userId });
    return pipeline;
  } catch (error) {
    logger.error('Error deleting pipeline', { pipelineId, error });
    throw new Error('Failed to delete pipeline');
  }
}
```

**Create `src/lib/logger.ts`:**

```typescript
/**
 * Centralized Logging Service
 * Provides structured logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
```

**Create `src/lib/utils/date-utils.ts`:**

```typescript
import { format, parseISO, formatDistance, addDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Date utility functions
 * Centralized date formatting and manipulation
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date to time string
 */
export function formatTime(date: Date | string, formatStr: string = 'p'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get date range for queries
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  const start = startOfDay(addDays(end, -days));
  return { start, end };
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
}
```

### Step 7: Database Optimization - Add Missing Indexes

**Create migration for additional indexes:**

```bash
npx prisma migrate dev --name add-performance-indexes
```

**Update `prisma/schema.prisma` with optimized indexes (already shown in Database Schema State section above)**

**Create database optimization script `scripts/optimize-db.sql`:**

```sql
-- Analyze tables for query optimization
ANALYZE Organization;
ANALYZE User;
ANALYZE Pipeline;
ANALYZE Stage;
ANALYZE PipelineItem;
ANALYZE Document;
ANALYZE IntakeRequest;
ANALYZE Automation;
ANALYZE SchedulingEvent;

-- Add partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_intake_new_priority
ON "IntakeRequest" (priority DESC)
WHERE status = 'NEW';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_pending
ON "Document" (createdAt DESC)
WHERE status = 'PENDING';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_upcoming
ON "SchedulingEvent" (startTime ASC)
WHERE status IN ('SCHEDULED', 'CONFIRMED');

-- Vacuum and analyze for optimal performance
VACUUM ANALYZE;
```

### Step 8: Bundle Size Optimization

**Update `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    domains: ['astralis-documents.nyc3.cdn.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Bundle analysis
  webpack: (config, { isServer }) => {
    // Analyze bundle size in development
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          reportFilename: './analyze-client.html',
        })
      );
    }

    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Install bundle analyzer:**

```bash
npm install --save-dev webpack-bundle-analyzer
```

**Add script to package.json:**

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Step 9: Security Hardening

**Create `src/lib/middleware/rate-limit.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Rate limiting middleware using Redis
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    keyPrefix = 'rate-limit',
  } = options;

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Get client identifier (IP or user ID)
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const key = `${keyPrefix}:${clientIp}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Get request count in window
      const requests = await redis.zcount(key, windowStart, now);

      if (requests >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);

      // Clean up old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Set expiry
      await redis.expire(key, Math.ceil(windowMs / 1000));

      // Continue to handler
      return await handler();
    } catch (error) {
      // If Redis fails, allow request but log error
      console.error('Rate limiting error:', error);
      return await handler();
    }
  };
}
```

**Create `src/lib/middleware/error-handler.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Global error handler for API routes
 */

export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('Validation error', { errors: error.flatten() });
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Known application errors
  if (error instanceof Error) {
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

    logger.error('Application error', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  // Unknown errors
  logger.error('Unknown error', { error });
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
```

**Create `src/app/api/health/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = 'healthy';
  } catch (error) {
    checks.services.database = 'unhealthy';
    checks.status = 'degraded';
  }

  try {
    // Check Redis
    await redis.ping();
    checks.services.redis = 'healthy';
  } catch (error) {
    checks.services.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  const status = checks.status === 'healthy' ? 200 : 503;
  return NextResponse.json(checks, { status });
}
```

### Step 10: Documentation Updates

**Create `docs/api/README.md`:**

```markdown
# AstralisOps API Documentation

## Overview

The AstralisOps API is a RESTful API built with Next.js App Router. All endpoints return JSON and require authentication unless otherwise specified.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://app.astralisone.com/api`

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Include credentials in requests:

```javascript
fetch('/api/pipelines', {
  credentials: 'include',
})
```

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Document upload**: 20 requests per minute per IP

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {
    "field": ["validation error"]
  }
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Endpoints

### Authentication

- [POST /api/auth/signin](./authentication.md#signin)
- [POST /api/auth/signup](./authentication.md#signup)
- [POST /api/auth/signout](./authentication.md#signout)
- [POST /api/auth/reset-password](./authentication.md#reset-password)

### Pipelines

- [GET /api/pipelines](./pipelines.md#list-pipelines)
- [POST /api/pipelines](./pipelines.md#create-pipeline)
- [GET /api/pipelines/:id](./pipelines.md#get-pipeline)
- [PATCH /api/pipelines/:id](./pipelines.md#update-pipeline)
- [DELETE /api/pipelines/:id](./pipelines.md#delete-pipeline)
- [POST /api/pipelines/:id/items/:itemId/move](./pipelines.md#move-item)

### Intake

- [GET /api/intake](./intake.md#list-requests)
- [POST /api/intake](./intake.md#create-request)
- [GET /api/intake/:id](./intake.md#get-request)
- [PATCH /api/intake/:id](./intake.md#update-request)

### Documents

- [POST /api/documents/upload](./documents.md#upload-document)
- [GET /api/documents](./documents.md#list-documents)
- [GET /api/documents/:id](./documents.md#get-document)
- [DELETE /api/documents/:id](./documents.md#delete-document)

### Calendar

- [GET /api/calendar/events](./scheduling.md#list-events)
- [POST /api/calendar/events](./scheduling.md#create-event)
- [GET /api/calendar/availability](./scheduling.md#check-availability)
- [POST /api/calendar/sync](./scheduling.md#sync-calendar)

## Pagination

List endpoints support pagination:

```
GET /api/pipelines?page=1&limit=20
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

## Filtering & Sorting

Most list endpoints support filtering and sorting:

```
GET /api/intake?status=NEW&priority=gte:5&sort=-createdAt
```

- Filter operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`
- Sort prefix: `-` for descending, `+` or none for ascending

## Webhooks

Configure webhooks for real-time notifications:

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["intake.created", "pipeline.updated"],
  "secret": "webhook-secret-key"
}
```

See [Webhooks Documentation](./webhooks.md) for details.
```

**Update `README.md`:**

```markdown
# AstralisOps - AI Operations Automation Platform

Multi-tenant operations automation platform with AI-powered routing, document processing, and intelligent scheduling.

## Features

- **AI-Powered Routing**: Automatically route intake requests to appropriate pipelines
- **Document Processing**: OCR and structured data extraction from uploaded files
- **Calendar Integration**: Two-way sync with Google Calendar
- **Pipeline Management**: Kanban-style workflow visualization
- **Real-time Updates**: Live dashboard with WebSocket support
- **Multi-tenant**: Organization-based data isolation
- **Role-Based Access**: Admin, Operator, and Client roles

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (Strict Mode)
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache/Queue**: Redis 7 + BullMQ
- **AI**: OpenAI GPT-4
- **Storage**: DigitalOcean Spaces
- **Infrastructure**: Docker + Nginx
- **Testing**: Jest + Playwright

## Quick Start

### Development

```bash
# Clone repository
git clone <repo-url>
cd astralis-nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.local.template .env.local
# Edit .env.local with your values

# Start Docker services
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3001`

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Production Deployment

See [Production Deployment Guide](./docs/deployment/production-checklist.md)

## Documentation

- [API Documentation](./docs/api/README.md)
- [Architecture Overview](./docs/architecture/system-overview.md)
- [Phase Documentation](./docs/phases/README.md)
- [Deployment Guide](./docs/deployment/production-checklist.md)

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/              # Utilities and services
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── __tests__/        # Test files
```

## Environment Variables

See [.env.local.template](./.env.local.template) for all required variables.

## Contributing

1. Create feature branch from `main`
2. Make changes with tests
3. Ensure all tests pass
4. Submit pull request

## License

Proprietary - Astralis One
```

### Step 11: Performance Benchmarking

**Create `scripts/benchmark.ts`:**

```typescript
import { performance } from 'perf_hooks';
import { prisma } from '@/lib/prisma';

/**
 * Performance benchmarking script
 * Run with: ts-node scripts/benchmark.ts
 */

interface BenchmarkResult {
  name: string;
  duration: number;
  iterations: number;
  avgTime: number;
}

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn();
  }

  const end = performance.now();
  const duration = end - start;
  const avgTime = duration / iterations;

  return {
    name,
    duration,
    iterations,
    avgTime,
  };
}

async function runBenchmarks() {
  console.log('Starting performance benchmarks...\n');

  // Database query benchmarks
  const orgId = 'test-org-id';

  const results: BenchmarkResult[] = [];

  // Benchmark: List pipelines
  results.push(
    await benchmark(
      'List Pipelines',
      async () => {
        await prisma.pipeline.findMany({
          where: { orgId },
          include: { stages: true },
        });
      },
      50
    )
  );

  // Benchmark: Get single pipeline
  results.push(
    await benchmark(
      'Get Pipeline with Items',
      async () => {
        await prisma.pipeline.findFirst({
          where: { orgId },
          include: {
            stages: {
              include: {
                items: true,
              },
            },
          },
        });
      },
      50
    )
  );

  // Benchmark: List intake requests
  results.push(
    await benchmark(
      'List Intake Requests',
      async () => {
        await prisma.intakeRequest.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
      },
      50
    )
  );

  // Print results
  console.log('Benchmark Results:');
  console.log('==================\n');

  results.forEach((result) => {
    console.log(`${result.name}:`);
    console.log(`  Total: ${result.duration.toFixed(2)}ms`);
    console.log(`  Iterations: ${result.iterations}`);
    console.log(`  Average: ${result.avgTime.toFixed(2)}ms`);
    console.log('');
  });

  // Performance targets
  console.log('Performance Targets:');
  console.log('===================');
  console.log('List operations: < 50ms average');
  console.log('Single queries: < 20ms average');
  console.log('Complex joins: < 100ms average\n');

  // Check if targets met
  const failed = results.filter((r) => {
    if (r.name.includes('List')) return r.avgTime > 50;
    if (r.name.includes('Get')) return r.avgTime > 100;
    return false;
  });

  if (failed.length > 0) {
    console.log('⚠️  Performance targets not met:');
    failed.forEach((r) => {
      console.log(`  - ${r.name}: ${r.avgTime.toFixed(2)}ms`);
    });
  } else {
    console.log('✅ All performance targets met!');
  }

  await prisma.$disconnect();
}

runBenchmarks().catch(console.error);
```

---

## Complete Cleanup Checklist (50 Items)

### Code Organization (10 items)

- [ ] All files follow consistent naming conventions (kebab-case for files, PascalCase for components)
- [ ] No unused imports in any file
- [ ] All exports organized in index.ts barrel files
- [ ] Services extracted from API routes into /lib/services
- [ ] Utilities consolidated in /lib/utils with clear categorization
- [ ] Type definitions centralized in /src/types
- [ ] No code duplication (DRY principle enforced)
- [ ] All magic numbers replaced with named constants
- [ ] Environment variables properly typed and validated
- [ ] All file paths use @ alias (no relative imports)

### TypeScript & Code Quality (10 items)

- [ ] TypeScript strict mode enabled with zero errors
- [ ] All functions have explicit return types or type inference
- [ ] No usage of `any` type (all replaced with proper types)
- [ ] All async functions properly typed with Promise<T>
- [ ] Zod schemas defined for all API inputs
- [ ] Custom type guards created where needed
- [ ] All React component props properly typed
- [ ] Discriminated unions used for state management
- [ ] Generic types used appropriately for reusable functions
- [ ] All third-party library types properly imported

### Documentation (10 items)

- [ ] JSDoc comments on all exported functions
- [ ] README.md updated with current setup instructions
- [ ] API documentation complete for all endpoints
- [ ] Architecture diagrams created and up-to-date
- [ ] Database schema documented with relationships
- [ ] Environment variables documented in .env.template
- [ ] Deployment checklist created and tested
- [ ] Troubleshooting guide created
- [ ] Code comments explain WHY not WHAT
- [ ] Storybook stories for all UI components

### Testing (10 items)

- [ ] Jest configured and working
- [ ] Unit tests for all service layer functions
- [ ] Integration tests for all API routes
- [ ] E2E tests for critical user flows
- [ ] Test coverage above 80% for business logic
- [ ] Mock data factories created for testing
- [ ] Database test utilities created
- [ ] Playwright configured for E2E testing
- [ ] CI/CD pipeline runs all tests
- [ ] Test documentation written

### Performance (10 items)

- [ ] Database indexes optimized for common queries
- [ ] Bundle size analyzed and optimized (< 300kb initial)
- [ ] Images optimized and served from CDN
- [ ] API response times benchmarked
- [ ] Database connection pooling configured
- [ ] Redis caching implemented for frequent queries
- [ ] Next.js Image component used for all images
- [ ] Dynamic imports used for heavy components
- [ ] Unnecessary re-renders eliminated
- [ ] Performance monitoring configured

### Security (10 items)

- [ ] All API routes protected with authentication
- [ ] RBAC implemented and tested
- [ ] Rate limiting configured on all endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection protection verified
- [ ] XSS protection implemented
- [ ] CSRF tokens implemented where needed
- [ ] Environment variables never committed to git
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured in Nginx

---

## Testing Checklist

### Unit Tests

- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:coverage` - coverage above 80%
- [ ] All service functions have tests
- [ ] All utility functions have tests
- [ ] All validators have tests
- [ ] Edge cases covered in tests

### Integration Tests

- [ ] All API routes have integration tests
- [ ] Authentication flow tested
- [ ] Authorization checks tested
- [ ] Database operations tested
- [ ] Error handling tested

### E2E Tests

- [ ] Run `npm run test:e2e` - all tests pass
- [ ] User authentication flow tested
- [ ] Pipeline management tested
- [ ] Document upload tested
- [ ] Calendar integration tested

### Performance Tests

- [ ] Run `ts-node scripts/benchmark.ts`
- [ ] All queries meet performance targets
- [ ] Bundle size under 300kb
- [ ] Lighthouse score > 90 for all pages

### Code Quality

- [ ] Run `npm run lint` - zero errors or warnings
- [ ] Run `npm run format` - all files formatted
- [ ] TypeScript compilation - zero errors
- [ ] No console.log statements in production code
- [ ] All TODOs resolved or tracked

---

## Handoff Summary

### What's Complete (Phase 7)

**Code Quality**:
- TypeScript strict mode enabled and enforced
- ESLint configured with comprehensive rules
- Prettier configured for consistent formatting
- All code duplication eliminated
- Service layer properly extracted
- Utilities consolidated and organized

**Testing Infrastructure**:
- Jest configured for unit and integration tests
- Playwright configured for E2E tests
- Test examples created for all layers
- Code coverage tracking enabled
- CI/CD pipeline ready for test automation

**Performance**:
- Database indexes optimized for all common queries
- Bundle size analyzed and optimized
- Performance benchmarking script created
- Query performance measured and documented

**Security**:
- Rate limiting middleware implemented
- Error handling middleware standardized
- Health check endpoint created
- Security headers configured
- Input validation enforced with Zod

**Documentation**:
- API documentation complete
- Architecture documentation created
- Deployment guides written
- All environment variables documented
- Code properly commented with JSDoc

### Database State After Phase 7

All tables optimized with composite indexes:
- Organization, User, Pipeline, Stage, PipelineItem
- Document, IntakeRequest, Automation, SchedulingEvent
- New tables: ActivityLog, Session, Account, VerificationToken

### Environment Variables (No Changes)

Same as Phase 6 - all variables documented in comprehensive .env templates

### Docker Services (No Changes)

Same as Phase 6:
- nginx (reverse proxy)
- app (Next.js cluster)
- worker (background jobs)
- postgres (database)
- redis (cache/queue)

### What's Next

The application is now production-ready with:
- Clean, maintainable codebase
- Comprehensive test coverage
- Optimized performance
- Hardened security
- Complete documentation

**Recommended Next Steps**:
1. Set up continuous integration with automated testing
2. Configure production monitoring (Sentry, DataDog, etc.)
3. Implement feature flags for gradual rollout
4. Set up automated backup verification
5. Create runbooks for common operations

---

**Production Readiness**: ✅ Complete

The application is fully tested, documented, optimized, and ready for production deployment.
