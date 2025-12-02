# AstralisOps Phase Implementation Guide

**Last Updated**: 2025-01-20
**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start for New AI Sessions](#quick-start-for-new-ai-sessions)
3. [Phase Overview](#phase-overview)
4. [Phase Dependencies](#phase-dependencies)
5. [Using Phase Documents](#using-phase-documents)
6. [Docker Evolution Timeline](#docker-evolution-timeline)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Common Troubleshooting](#common-troubleshooting)
9. [Phase Selection Guide](#phase-selection-guide)
10. [Architecture Decisions](#architecture-decisions)
11. [Contributing](#contributing)

---

## Introduction

### Why Phase-Based Documentation?

This documentation system was designed to solve a critical challenge in AI-assisted development: **context exhaustion**. Large, complex projects exceed the context window of AI assistants, making it difficult to maintain consistency and quality across implementation sessions.

Our solution is a **phase-based architecture** where each phase document is:

- **Self-Contained**: Contains all project context, schemas, and code needed to implement that phase
- **Context-Exhaustion-Proof**: Designed to fit within AI context limits while providing complete implementation details
- **Production-Ready**: Includes full code examples (200+ lines for complex functions), not pseudocode or placeholders
- **Independently Executable**: Any AI session can pick up any phase document and implement it without prior conversation history

### What Makes These Documents Different

Traditional documentation assumes human readers who can reference multiple files and maintain mental context. Our phase documents are optimized for AI assistants by:

1. **Complete Schemas**: Every phase includes the full database schema (not just changes) to prevent referencing errors
2. **Cumulative Environment Variables**: Each phase lists all required variables from all previous phases
3. **Full File Structure Maps**: Complete directory trees with `[ADDED IN PHASE X]` annotations
4. **Docker State Tracking**: Explicit documentation of all containers, volumes, and networks at each phase
5. **Production-Grade Code**: No TODOs, no placeholders, no "implement this later" comments
6. **Manual Testing Checklists**: Detailed verification steps with database queries and API curl commands

### Document Statistics

- **Total Phases**: 7
- **Average Length**: 7,000-11,000 words per phase
- **Code Examples**: 200+ lines for complex functions
- **Testing Items**: 10-15+ verification steps per phase
- **Total Content**: ~60,000+ words of comprehensive implementation guidance

---

## Quick Start for New AI Sessions

### If You're Starting Fresh

1. **Read This README First**: Understand the phase-based approach and project architecture

2. **Check Project Status**:
   ```bash
   # View phase completion status
   cat /Users/gregorystarr/projects/astralis-nextjs/docs/phases/PROGRESS.md
   ```

3. **Identify Current Phase**:
   - See which phases are complete
   - Determine which phase you'll be implementing
   - Review prerequisites

4. **Read Prerequisites**:
   - If implementing Phase 3, read Phase 1 and Phase 2 documents first
   - Understand the cumulative state of the project
   - Review the handoff section of the previous phase

5. **Open Phase Document**:
   ```bash
   # Example: Starting Phase 3
   cat /Users/gregorystarr/projects/astralis-nextjs/docs/phases/phase-3-ai-routing-background-jobs.md
   ```

6. **Follow Implementation Steps**:
   - Each phase has numbered steps with exact bash commands
   - Copy/paste commands directly (they're production-ready)
   - Follow the testing checklist after implementation

### If You're Continuing Existing Work

1. **Check Git Status**:
   ```bash
   cd /Users/gregorystarr/projects/astralis-nextjs
   git status
   git log -5 --oneline
   ```

2. **Review Recent Phase Document**:
   - Read the "Handoff" section of the last completed phase
   - Understand what was implemented
   - Check for any incomplete items

3. **Verify Environment**:
   ```bash
   # Check database connection
   docker ps
   docker exec -it astralis-postgres psql -U postgres -d astralis_one -c "\dt"

   # Verify environment variables
   cat .env.local | grep -v "^#" | grep -v "^$"
   ```

4. **Proceed with Next Phase**:
   - Open the next phase document
   - Start from Step 1 of the implementation

---

## Phase Overview

### All Phases at a Glance

| Phase | Name | Duration | Prerequisites | Docker Changes | Status |
|-------|------|----------|---------------|----------------|--------|
| 1 | Authentication & RBAC | 2 weeks | None | None | ✅ Complete |
| 2 | Dashboard UI & Pipelines | 2 weeks | Phase 1 | None | ✅ Complete |
| 3 | AI Routing & Background Jobs | 3 weeks | Phase 1-2 | Add Redis, Worker | ⏳ Pending |
| 4 | Document Processing & OCR | 3 weeks | Phase 1-3 | None | ⏳ Pending |
| 5 | Scheduling & Calendar | 2 weeks | Phase 1-4 | None | ⏳ Pending |
| 6 | Production Deployment | 2 weeks | Phase 1-5 | Add Nginx | ⏳ Pending |
| 7 | Cleanup & Refactor | 1 week | Phase 1-6 | None | ⏳ Pending |

**Total Timeline**: 15 weeks (approximately 3.5 months)

### Phase 1: Authentication & RBAC

**What You'll Build**:
- NextAuth.js v5 integration (credentials + Google OAuth)
- Sign-up, sign-in, email verification, password reset flows
- Role-based access control (ADMIN, OPERATOR, CLIENT)
- Protected route middleware
- Activity logging for security audits
- Database migrations for auth tables

**Key Technologies**: NextAuth.js, bcrypt, nodemailer, Zod

**File**: `phase-1-authentication-rbac.md` (~6,000 words)

### Phase 2: Dashboard UI & Pipelines

**What You'll Build**:
- Complete authenticated dashboard layout with sidebar
- Organization switcher for multi-tenant support
- Dashboard overview with metrics widgets
- Kanban board with drag-and-drop pipeline management
- Intake queue interface with filters
- TanStack Query + Zustand state management setup

**Key Technologies**: TanStack Query, Zustand, @dnd-kit/core, Radix UI

**File**: `phase-2-dashboard-ui-pipelines.md` (~5,350 words)

### Phase 3: AI Routing & Background Jobs

**What You'll Build**:
- OpenAI GPT-4 integration for intelligent request routing
- BullMQ + Redis queue system for background jobs
- Background worker container for job processing
- AI routing engine with confidence scoring
- Job dashboard UI for monitoring queue status
- Email sending queue and retry logic

**Key Technologies**: OpenAI API, BullMQ, Redis, Docker multi-container

**File**: `phase-3-ai-routing-background-jobs.md` (~10,000 words estimated)

**Docker Changes**: Add `redis` and `worker` containers

### Phase 4: Document Processing & OCR

**What You'll Build**:
- DigitalOcean Spaces integration for file storage
- File upload endpoint with validation and virus scanning
- Tesseract.js OCR pipeline for text extraction
- GPT-4 Vision API for structured data extraction
- Document viewer UI with annotations
- Document processing queue with status tracking

**Key Technologies**: DigitalOcean Spaces SDK, Tesseract.js, GPT-4 Vision, BullMQ

**File**: `phase-4-document-processing-ocr.md` (~10,000 words estimated)

**Docker Changes**: None (uses existing worker container)

### Phase 5: Scheduling & Calendar

**What You'll Build**:
- Google Calendar API integration with OAuth
- Two-way calendar sync (read/write events)
- Conflict detection algorithm
- Calendar view UI with week/month views
- Availability configuration for operators
- AI-powered time slot suggestions
- Automated email reminders (24h, 1h before)

**Key Technologies**: Google Calendar API, ICS generation, BullMQ reminders

**File**: `phase-5-scheduling-calendar.md` (~9,000 words estimated)

**Docker Changes**: None (uses existing infrastructure)

### Phase 6: Production Deployment

**What You'll Build**:
- Production docker-compose.yml with optimizations
- Multi-stage Dockerfile for minimal image size
- Nginx reverse proxy with SSL (Let's Encrypt)
- Automated database backup to DigitalOcean Spaces
- Log aggregation and monitoring setup
- Health checks and auto-restart policies
- Zero-downtime deployment scripts
- Secrets management and environment security

**Key Technologies**: Nginx, Certbot, PM2, Docker production patterns

**File**: `phase-6-production-deployment.md` (~8,000 words estimated)

**Docker Changes**: Add `nginx` container, modify all containers for production

### Phase 7: Cleanup & Refactor

**What You'll Build**:
- Comprehensive code audit and cleanup
- Remove unused dependencies and files
- Standardize naming conventions across codebase
- Add JSDoc comments to all functions
- Bundle size optimization
- Database query optimization and indexing
- Security hardening checklist
- Testing infrastructure setup (unit, integration, E2E examples)
- Final performance benchmarks

**Key Technologies**: ESLint, TypeScript strict mode, Jest, Playwright

**File**: `phase-7-cleanup-refactor.md` (~7,000 words estimated)

**Docker Changes**: None (optimization only)

---

## Phase Dependencies

### Dependency Chart

```
Phase 1: Authentication & RBAC
    ↓
Phase 2: Dashboard UI & Pipelines
    ↓
Phase 3: AI Routing & Background Jobs ← ADDS: Redis, Worker
    ↓
Phase 4: Document Processing & OCR
    ↓
Phase 5: Scheduling & Calendar
    ↓
Phase 6: Production Deployment ← ADDS: Nginx, SSL
    ↓
Phase 7: Cleanup & Refactor
```

### Critical Path Notes

1. **Phase 1 is Foundational**: Authentication must be complete before building any protected features
2. **Phase 3 Enables Async Work**: Background jobs are required for Phases 4 and 5
3. **Phases 4-5 are Parallel-Ready**: After Phase 3, you can theoretically implement Phases 4 and 5 in parallel
4. **Phase 6 Requires All Features**: Production deployment assumes all features are implemented
5. **Phase 7 is Final Polish**: Cleanup should happen after all features are complete

### Soft Dependencies

- **Analytics** (existing): Already implemented in marketing site, extends to dashboard in Phase 2
- **Booking System** (existing): Marketing booking flow already exists, will integrate with scheduling in Phase 5
- **Email Templates** (Phase 1): Email infrastructure built in Phase 1, extended in Phases 3-5

---

## Using Phase Documents

### Document Structure

Every phase document follows this standardized structure:

#### 1. Header (5% of document)
- Phase number, name, duration estimate
- Prerequisites checklist
- Docker changes summary
- Success criteria checklist

#### 2. Complete Project Context (10% of document)
- Full tech stack
- Brand design specifications
- Database architecture overview
- Key constraints (no AWS, DigitalOcean only)

#### 3. Docker Services State (5% of document)
- All active containers with annotations
- Volume mappings
- Network configuration
- Explicit statement of what changed this phase

#### 4. Database Schema State (10% of document)
- **Complete Prisma schema** (not just changes)
- Annotations for which tables were added in which phase
- Key relationships diagram
- Index documentation

#### 5. Environment Variables (5% of document)
- **Cumulative list** of all variables from all phases
- Organized by phase added
- Example values and descriptions
- Security notes for sensitive values

#### 6. File Structure Map (10% of document)
- Complete `src/` directory tree
- `[ADDED IN PHASE X]` annotations
- File purpose descriptions
- Import path examples

#### 7. Implementation Steps (40% of document)
- Numbered steps with exact bash commands
- Full code examples (200+ lines for complex functions)
- No pseudocode or placeholders
- Includes imports, types, error handling, comments

#### 8. Testing Checklist (10% of document)
- Manual verification steps
- Database queries to verify data
- API curl commands to test endpoints
- Browser testing scenarios
- Expected results for each test

#### 9. Handoff Section (5% of document)
- Summary of what's complete
- What the next phase will build
- Current Docker state
- Current database state
- New environment variables added

### How to Read Phase Documents

#### For AI Assistants

1. **Load Entire Document**: Read the complete phase document before starting implementation
2. **Reference Back Frequently**: Use the schema section to verify table structures when writing queries
3. **Copy Code Exactly**: Code examples are production-ready, copy them directly
4. **Follow Testing Checklist**: Complete all items before marking phase as done
5. **Update PROGRESS.md**: Mark phase as complete and update word count

#### For Human Developers

1. **Skim the Header**: Understand scope and prerequisites
2. **Review Context**: Refresh your memory on project architecture
3. **Focus on Implementation**: Steps 1-N are your work plan
4. **Use Testing as Acceptance Criteria**: Checklist items = definition of done

### Best Practices

- **Don't Skip Phases**: Each phase builds on previous work
- **Verify Prerequisites**: Check that previous phases are truly complete
- **Test Thoroughly**: Complete all testing checklist items
- **Update Documentation**: If you find issues, update the phase document
- **Commit Frequently**: Commit after each major step (not just at phase completion)

---

## Docker Evolution Timeline

### Phase 1-2: Basic Stack

```yaml
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=astralis_one
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

**Containers**: 2 (app, postgres)
**Volumes**: 1 (postgres-data)
**Exposed Ports**: 3001 (app), 5432 (postgres - internal only)

### Phase 3: Add Background Processing

```yaml
services:
  app:
    # ... existing config
    environment:
      - REDIS_URL=redis://redis:6379

  postgres:
    # ... no changes

  redis:                    # NEW
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  worker:                   # NEW
    build:
      context: .
      target: worker       # Multi-stage build target
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis

volumes:
  postgres-data:
  redis-data:              # NEW
```

**Containers**: 4 (app, postgres, redis, worker)
**Volumes**: 2 (postgres-data, redis-data)
**New Services**: Redis for queues, Worker for background jobs

### Phase 6: Production Configuration

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production     # Production build target
    restart: unless-stopped  # Auto-restart policy
    healthcheck:             # Health monitoring
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    # ... existing config
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    # ... existing config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  worker:
    # ... existing config
    restart: unless-stopped
    deploy:
      replicas: 2           # Multiple worker instances

  nginx:                    # NEW
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  nginx-cache:              # NEW
```

**Containers**: 5 (app, postgres, redis, worker, nginx)
**Volumes**: 3 (postgres-data, redis-data, nginx-cache)
**New Features**: Health checks, auto-restart, SSL, reverse proxy, multiple workers

### Key Changes Summary

| Phase | Containers | New Services | Purpose |
|-------|-----------|--------------|---------|
| 1-2 | 2 | None | Basic app + database |
| 3 | 4 | Redis, Worker | Background jobs, AI routing |
| 6 | 5 | Nginx | SSL termination, reverse proxy, production hardening |

---

## Environment Variables Reference

### Complete Cumulative List

```bash
# ============================================================================
# DATABASE (Phase 1)
# ============================================================================
DATABASE_URL="postgresql://postgres:password@postgres:5432/astralis_one"
POSTGRES_PASSWORD="your-secure-postgres-password"

# ============================================================================
# NEXTAUTH.JS AUTHENTICATION (Phase 1)
# ============================================================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth (optional in Phase 1)
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# ============================================================================
# EMAIL / SMTP (Phase 1)
# ============================================================================
SMTP_HOST="smtp.gmail.com"                    # Or your SMTP provider
SMTP_PORT="587"                               # Use 465 for SSL
SMTP_SECURE="false"                           # true for port 465
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"   # Not your regular password
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ============================================================================
# API CONFIGURATION (Existing)
# ============================================================================
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# ============================================================================
# ANALYTICS (Existing - Optional)
# ============================================================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"

# ============================================================================
# OPENAI API (Phase 3)
# ============================================================================
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_MODEL="gpt-4-turbo-preview"           # Or gpt-4, gpt-3.5-turbo

# ============================================================================
# REDIS / QUEUES (Phase 3)
# ============================================================================
REDIS_URL="redis://redis:6379"
REDIS_PASSWORD=""                             # Leave empty for dev, set in prod

# ============================================================================
# DIGITALOCEAN SPACES (Phase 4)
# ============================================================================
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_ACCESS_KEY="your-spaces-access-key"
SPACES_SECRET_KEY="your-spaces-secret-key"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# ============================================================================
# GOOGLE CALENDAR API (Phase 5)
# ============================================================================
GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3001/api/calendar/callback"

# ============================================================================
# PRODUCTION SETTINGS (Phase 6)
# ============================================================================
NODE_ENV="production"                         # development | production | test
LOG_LEVEL="info"                              # error | warn | info | debug
ENABLE_METRICS="true"                         # Enable Prometheus metrics

# SSL Configuration
SSL_CERT_PATH="/etc/nginx/ssl/fullchain.pem"
SSL_KEY_PATH="/etc/nginx/ssl/privkey.pem"

# Security
ALLOWED_ORIGINS="https://astralisone.com,https://www.astralisone.com"
RATE_LIMIT_MAX="100"                          # Requests per minute
```

### Environment Variable Organization Tips

1. **Use .env.local for Development**: Never commit this file
2. **Use .env.example for Templates**: Check this into git with dummy values
3. **Use Docker Secrets in Production**: For Phase 6, migrate sensitive values to Docker secrets
4. **Validate on Startup**: Add environment validation in `src/lib/env.ts` (Phase 7)

### Generating Secure Values

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -base64 24

# REDIS_PASSWORD
openssl rand -base64 24

# General random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Common Troubleshooting

### Database Connection Issues

**Problem**: `Error: Can't reach database server at postgres:5432`

**Solutions**:
```bash
# 1. Check if postgres container is running
docker ps | grep postgres

# 2. Verify database is accepting connections
docker exec -it astralis-postgres psql -U postgres -c "SELECT 1"

# 3. Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://postgres:password@postgres:5432/astralis_one

# 4. Restart postgres container
docker-compose restart postgres
```

### Prisma Migration Failures

**Problem**: `Migration failed: relation already exists`

**Solutions**:
```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# 3. Mark migration as applied without running
npx prisma migrate resolve --applied "migration_name"

# 4. Create new migration for changes
npx prisma migrate dev --name describe_changes
```

### NextAuth Session Issues

**Problem**: `[next-auth][error][SESSION_ERROR]`

**Solutions**:
```bash
# 1. Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET | wc -c
# Should be 32+ characters

# 2. Check NEXTAUTH_URL matches your app URL
echo $NEXTAUTH_URL
# Should match: http://localhost:3001 (dev) or https://yourdomain.com (prod)

# 3. Clear browser cookies and try again

# 4. Check database sessions table
docker exec -it astralis-postgres psql -U postgres -d astralis_one \
  -c "SELECT * FROM \"Session\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### Redis Connection Issues (Phase 3+)

**Problem**: `Error: connect ECONNREFUSED redis:6379`

**Solutions**:
```bash
# 1. Check if redis container is running
docker ps | grep redis

# 2. Test redis connection
docker exec -it astralis-redis redis-cli ping
# Should return: PONG

# 3. Verify REDIS_URL in environment
echo $REDIS_URL
# Should be: redis://redis:6379

# 4. Check redis logs
docker logs astralis-redis --tail 50
```

### Worker Process Not Running Jobs (Phase 3+)

**Problem**: Jobs stuck in queue, not being processed

**Solutions**:
```bash
# 1. Check if worker container is running
docker ps | grep worker

# 2. View worker logs
docker logs astralis-worker --tail 100 -f

# 3. Check Redis queue contents
docker exec -it astralis-redis redis-cli KEYS "bull:*"

# 4. Restart worker container
docker-compose restart worker

# 5. Verify environment variables in worker
docker exec -it astralis-worker env | grep -E "(DATABASE_URL|REDIS_URL|OPENAI_API_KEY)"
```

### File Upload Issues (Phase 4+)

**Problem**: Files not uploading to DigitalOcean Spaces

**Solutions**:
```bash
# 1. Verify Spaces credentials
echo $SPACES_ACCESS_KEY
echo $SPACES_SECRET_KEY

# 2. Test Spaces connection with curl
curl -X GET "https://${SPACES_BUCKET}.${SPACES_ENDPOINT}/"

# 3. Check bucket CORS configuration in DigitalOcean dashboard

# 4. Verify file size limits in next.config.js
# Should have: experimental.serverActions.bodySizeLimit
```

### Production Build Failures (Phase 6)

**Problem**: `Error: Build failed` during Docker production build

**Solutions**:
```bash
# 1. Build locally to see full errors
npm run build

# 2. Check TypeScript errors
npm run type-check

# 3. Verify all environment variables are available at build time
# PUBLIC variables needed at build time must be in .env.local

# 4. Clear Next.js cache
rm -rf .next

# 5. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Phase Selection Guide

### "Start Here If..."

#### You're Building Authentication First
**→ Start with Phase 1: Authentication & RBAC**

Perfect if:
- Fresh project setup
- No authentication system exists
- You need user management and RBAC
- You want Google OAuth support

#### You Have Auth, Need a Dashboard
**→ Start with Phase 2: Dashboard UI & Pipelines**

Perfect if:
- Phase 1 is complete
- You need a Kanban board interface
- You want intake queue management
- You need organization switching

#### You Want AI-Powered Features
**→ Start with Phase 3: AI Routing & Background Jobs**

Perfect if:
- Phases 1-2 are complete
- You need intelligent request routing
- You want background job processing
- You need email queues with retry logic

#### You Need Document Processing
**→ Start with Phase 4: Document Processing & OCR**

Perfect if:
- Phases 1-3 are complete
- You need file upload and storage
- You want OCR text extraction
- You need GPT-4 Vision for data extraction

#### You Want Calendar Integration
**→ Start with Phase 5: Scheduling & Calendar**

Perfect if:
- Phases 1-4 are complete
- You need Google Calendar sync
- You want conflict detection
- You need automated reminders

#### You're Ready for Production
**→ Start with Phase 6: Production Deployment**

Perfect if:
- Phases 1-5 are complete
- You need SSL and Nginx setup
- You want automated backups
- You need monitoring and health checks

#### You Want to Polish the Codebase
**→ Start with Phase 7: Cleanup & Refactor**

Perfect if:
- All feature phases are complete
- You want code quality improvements
- You need testing infrastructure
- You want performance optimization

### Common Starting Points

**Scenario 1: Brand New Project**
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```
Follow the phases in order.

**Scenario 2: Existing Auth, Need Features**
```
Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```
Skip Phase 1, ensure your auth system is compatible with NextAuth.js v5.

**Scenario 3: MVP Sprint (Core Features Only)**
```
Phase 1 → Phase 2 → Phase 3 → Phase 6 (minimal) → Phase 7 (basic)
```
Skip document processing (Phase 4) and scheduling (Phase 5) for now.

**Scenario 4: Document-Focused Application**
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 6 → Phase 7
```
Skip scheduling (Phase 5) if not needed.

---

## Architecture Decisions

### ADR-001: Why Phase-Based Documentation?

**Status**: Accepted
**Date**: 2025-01-20

**Context**: Large AI-assisted projects suffer from context exhaustion where conversation history exceeds AI context limits, leading to inconsistent implementations and repeated mistakes.

**Decision**: Implement a phase-based documentation system where each phase is a self-contained document with complete project context.

**Consequences**:
- **Positive**: AI assistants can implement any phase without prior conversation history
- **Positive**: Human developers have comprehensive implementation guides
- **Positive**: Onboarding new team members is faster
- **Negative**: High upfront documentation effort (60,000+ words)
- **Negative**: Must maintain consistency across all phase documents

### ADR-002: DigitalOcean Only, No AWS

**Status**: Accepted
**Date**: 2025-01-20

**Context**: AWS has a complex pricing structure and requires extensive configuration knowledge. DigitalOcean provides simpler, more predictable infrastructure.

**Decision**: Use DigitalOcean for all infrastructure needs (Droplets, Spaces, Managed Databases in production).

**Consequences**:
- **Positive**: Simpler pricing and billing
- **Positive**: Faster setup and configuration
- **Positive**: Spaces is S3-compatible, easy migration if needed
- **Negative**: Less feature-rich than AWS
- **Negative**: Fewer regions and availability zones

### ADR-003: Docker for All Environments

**Status**: Accepted
**Date**: 2025-01-20

**Context**: Environment consistency between development, staging, and production is critical for preventing deployment issues.

**Decision**: Use Docker for development, staging, and production with docker-compose for orchestration.

**Consequences**:
- **Positive**: "Works on my machine" issues eliminated
- **Positive**: Easy onboarding for new developers
- **Positive**: Consistent environment across all stages
- **Negative**: Requires Docker knowledge from all developers
- **Negative**: Slight performance overhead in development

### ADR-004: Full Schemas in Every Phase

**Status**: Accepted
**Date**: 2025-01-20

**Context**: AI assistants referencing partial schemas or "see previous phase" create errors due to context limitations.

**Decision**: Include the complete database schema in every phase document, annotated with phase additions.

**Consequences**:
- **Positive**: No reference errors in AI implementations
- **Positive**: Complete context in a single document
- **Negative**: Duplication across phase documents
- **Negative**: Schema updates require changes in multiple files

### ADR-005: Production-Ready Code Only

**Status**: Accepted
**Date**: 2025-01-20

**Context**: Placeholder code and TODOs in documentation lead to incomplete implementations and technical debt.

**Decision**: All code examples must be production-ready with full error handling, types, and comments. No pseudocode.

**Consequences**:
- **Positive**: Implementations are immediately deployable
- **Positive**: Best practices are demonstrated in examples
- **Negative**: Much longer documentation writing time
- **Negative**: Examples are verbose (200+ lines)

---

## Contributing

### Extending Phase Documents

If you need to add information to a phase document:

1. **Read the Document Structure Standard** in `PROGRESS.md`
2. **Maintain Consistency**: Follow the exact structure of existing phases
3. **Update All Affected Phases**: If adding a database table, update schemas in all subsequent phases
4. **Test Your Changes**: Verify code examples actually work
5. **Update Word Count**: Record new word count in `PROGRESS.md`

### Adding a New Phase

If the project scope expands beyond 7 phases:

1. **Create Phase Document**: Follow the structure in `PROGRESS.md`
2. **Update This README**:
   - Add to Phase Overview table
   - Update dependency chart
   - Add to Docker Evolution if applicable
   - Update environment variables reference
3. **Update PROGRESS.md**: Add to remaining phases section
4. **Create Handoff**: Update previous phase's handoff section

### Reporting Issues

If you find errors or omissions:

1. **Check Git History**: Verify the current state of the codebase
2. **Document the Issue**: What's wrong, expected behavior, actual behavior
3. **Suggest a Fix**: Propose specific changes to the phase document
4. **Update Multiple Phases**: Many issues affect cumulative sections (schemas, env vars)

### Style Guide

When writing or updating phase documents:

- **Use Active Voice**: "Create the file" not "The file should be created"
- **Be Explicit**: "Run `npm install`" not "Install dependencies"
- **Include Full Paths**: `/Users/gregorystarr/projects/astralis-nextjs/src/app/api/...`
- **Show Expected Output**: After bash commands, show what success looks like
- **Number All Steps**: Even sub-steps should be numbered (1.1, 1.2, etc.)
- **Use Code Blocks**: Always specify the language (```bash, ```typescript, etc.)
- **Add Context**: Explain *why* before showing *how*

---

## Questions?

### For AI Assistants

If you're an AI assistant reading this:

1. **Start with the Phase Overview**: Understand all 7 phases before beginning
2. **Read Prerequisites**: Don't skip earlier phases
3. **Follow Steps Exactly**: Commands are production-ready, copy them directly
4. **Complete Testing Checklists**: Every item must pass before marking phase done
5. **Update PROGRESS.md**: Mark your phase as complete when finished

### For Human Developers

If you're a human reading this:

1. **Review Architecture Decisions**: Understand the "why" behind our approach
2. **Check Phase Dependencies**: Don't try to implement out of order
3. **Use Testing Checklists as Acceptance Criteria**: These define "done"
4. **Contribute Improvements**: Update docs when you find issues
5. **Ask Questions**: If something is unclear, update the docs to clarify

---

**Last Updated**: 2025-01-20
**Maintainers**: Astralis Development Team
**License**: Proprietary - Internal Use Only

---

## Quick Reference Card

**Phase Documents Location**: `/Users/gregorystarr/projects/astralis-nextjs/docs/phases/`

**Essential Files**:
- `README.md` (this file) - Navigation guide
- `PROGRESS.md` - Implementation tracker
- `phase-1-authentication-rbac.md` - Auth system
- `phase-2-dashboard-ui-pipelines.md` - Dashboard UI
- `phase-3-ai-routing-background-jobs.md` - AI + jobs
- `phase-4-document-processing-ocr.md` - Documents
- `phase-5-scheduling-calendar.md` - Calendar
- `phase-6-production-deployment.md` - Production
- `phase-7-cleanup-refactor.md` - Polish

**Most Common Commands**:
```bash
# Check phase progress
cat docs/phases/PROGRESS.md

# View current phase
cat docs/phases/phase-X-name.md

# Start development
docker-compose up -d
npm run dev

# Check database
docker exec -it astralis-postgres psql -U postgres -d astralis_one

# View logs
docker-compose logs -f app
docker-compose logs -f worker  # Phase 3+
```

**Emergency Contacts**:
- Repository: `/home/deploy/astralis-nextjs` on 137.184.31.207
- SSH: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- Development Port: 3001
- Database: PostgreSQL on port 5432 (internal)
