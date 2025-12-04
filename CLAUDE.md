# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Astralis One** - Multi-Agent Engineering Platform built with Next.js 15, TypeScript, and Prisma. Enterprise-grade AI operations platform featuring booking systems, email notifications, analytics tracking, queue processing with BullMQ, and a comprehensive UI component library.

## Essential Commands

### Development
```bash
npm run dev              # Start dev server on port 3001
npm run build            # Production build
npm run start            # Start production server on port 3001
npm run lint             # Run ESLint
npm run worker           # Start background worker (BullMQ/Redis)
npm run worker:prod      # Start production worker
```

### Testing
```bash
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run tests with UI mode
npm run test:e2e:headed  # Run tests in headed browser
npm run test:e2e:debug   # Debug tests step by step
npm run test:e2e:report  # Show HTML test report
```

### Database
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migrations
npx prisma migrate deploy # Apply migrations in production
npx prisma studio        # Open database GUI
npx prisma db seed       # Run database seed script
```

### Production Management (PM2)
```bash
npm run prod:start       # Start PM2 processes (app + worker)
npm run prod:stop        # Stop all PM2 processes
npm run prod:restart     # Restart all PM2 processes
npm run prod:reload      # Zero-downtime reload
npm run prod:logs        # View PM2 logs
npm run prod:status      # Show PM2 process status
```

### Storybook
```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

### Deployment
```bash
# Vercel (Next.js app + API routes)
git push origin main      # Automatic Vercel deployment

# Fly.io (Background workers)
fly deploy -c fly.toml    # Deploy workers
fly logs                  # View worker logs
fly ssh console           # SSH into worker machine
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) on port 3001
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS 3 with Astralis brand theme
- **Database**: Prisma Postgres (db.prisma.io - managed PostgreSQL)
- **Queue System**: BullMQ + Upstash Redis for background jobs
- **UI Components**: Radix UI primitives + custom styling
- **State Management**: Zustand + React Query
- **Email**: Nodemailer SMTP
- **Calendar**: ICS generation for bookings
- **Analytics**: Google Analytics 4 + Google Ads
- **Authentication**: NextAuth.js with Prisma adapter
- **File Storage**: Vercel Blob (serverless object storage)
- **AI/ML**: OpenAI API for embeddings + chat, Anthropic Claude API
- **OCR**: Tesseract.js for document processing
- **Deployment**: Vercel (app) + Fly.io (workers)

### Brand Design System

**Astralis Colors** (in `tailwind.config.ts`):
- **Navy**: `#0A1B2B` - Headings, dark backgrounds
- **Blue**: `#2B6CB0` - Primary actions, links
- **Status**: Success (#38A169), Warning (#DD6B20), Error (#E53E3E), Info (#3182CE)
- **Neutrals**: Slate palette (50-950)

**Design Specs**:
- Border radius: 4px (sm), 6px (md), 8px (lg)
- Transitions: 150ms (fast), 200ms (normal), 250ms (slow)
- Shadows: `card`, `card-hover` variants
- Spacing: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

### Core Architecture Patterns

**1. Background Processing**:
- BullMQ queues in `src/workers/` for async tasks
- Document processing, email sending, OCR, embeddings
- Redis-backed job persistence and retries

**2. Multi-Step Wizards**:
- Engagement creation wizard in `src/app/engagements/`
- Uses React Hook Form + Zod validation
- Step components: Company, Contacts, Engagement, Access, Environments, Review

**3. Authentication Flow**:
- NextAuth.js with custom pages
- Auth pages: `/auth/signin`, `/auth/signup`, `/auth/verify-email`, `/auth/reset-password`
- Protected routes use middleware checks
- Support for invite acceptance flow

**4. Real-time Features**:
- React Query for data fetching/caching
- Optimistic updates for UI responsiveness
- WebSocket support via n8n webhooks

**5. Document Processing Pipeline**:
```typescript
Upload → Queue → OCR → Embeddings → Vector Storage → RAG Chat
```

### Key Architectural Patterns

**Path Aliasing**: Use `@/` prefix for imports:
```typescript
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
```

**API Routes**: RESTful endpoints with Zod validation:
```typescript
// src/app/api/[resource]/route.ts
const schema = z.object({ /* validation */ });
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  // Process and return NextResponse
}
```

**Component Structure**:
- UI primitives: `src/components/ui/`
- Page sections: `src/components/sections/`
- Auth components: `src/components/auth/`
- All have `.stories.tsx` for Storybook

**Queue Processing**:
```typescript
// src/workers/queues/[queue-name].ts
export const processQueue = async (job: Job) => {
  // Process job with retries, logging
};
```

## Database Schema

### Core Models
- **Organization**: Multi-tenant root entity
- **User**: Roles (ADMIN, OPERATOR, CLIENT, PM)
- **Pipeline/PipelineStage**: Kanban workflow
- **IntakeRequest**: AI-powered routing
- **Document**: File storage + OCR + embeddings
- **Automation**: n8n workflow integration
- **SchedulingEvent**: Calendar with conflict detection
- **Engagement/Company/Contact**: Client management

### Queue-Related Tables
- **WorkflowExecution**: Automation run history
- **WorkflowTrigger**: Event-based triggers
- **SchedulingAgentTask**: AI scheduling tasks
- **OrchestrationAgent**: LLM decision system
- **AgentDecision**: AI action audit trail

## Environment Variables

Critical variables in `.env.local`:
```bash
# Database & Auth
DATABASE_URL="postgresql://..."  # Prisma Postgres for production
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3001"

# Redis (Upstash for production, local for dev)
REDIS_URL="redis://localhost:6379"  # Local dev
UPSTASH_REDIS_REST_URL="..."       # Production (Vercel)
UPSTASH_REDIS_REST_TOKEN="..."     # Production (Vercel)

# Email (SMTP)
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# n8n Integration
N8N_WEBHOOK_URL="https://automation.astralisone.com"
```

See `.env.local.template` for complete reference.

## Testing Strategy

### E2E Tests (Playwright)
```
tests/e2e/
├── auth/          # Authentication flows
├── booking/       # Booking system
├── pipeline/      # Kanban pipeline
└── fixtures/      # Test data & helpers
```

Run specific test:
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### Component Tests (Storybook)
Every UI component has a `.stories.tsx` file for visual testing and documentation.

## Common Development Tasks

### Add a New API Endpoint
1. Create route file: `src/app/api/[resource]/route.ts`
2. Define Zod schema for validation
3. Implement GET/POST/PUT/DELETE handlers
4. Add Prisma operations with error handling
5. Update types in `src/types/`

### Create a Background Job
1. Define queue in `src/workers/queues/`
2. Implement processor with retry logic
3. Add job to queue from API/webhook
4. Monitor via Redis/BullMQ dashboard

### Add a New Page
1. Create folder in `src/app/`
2. Add `page.tsx` with metadata export
3. Use brand components from `src/components/ui/`
4. Follow Astralis color scheme
5. Add loading.tsx and error.tsx boundaries

### Implement a Multi-Step Form
1. Use React Hook Form for state
2. Define Zod schemas per step
3. Store draft in localStorage/session
4. Validate on step transition
5. Submit final data to API

## Production Deployment

### Deployment Architecture
- **Vercel**: Hosts Next.js application and API routes
- **Fly.io**: Runs background workers (2 machines in iad region)
- **Prisma Postgres**: Managed database at db.prisma.io
- **Upstash Redis**: Managed Redis for BullMQ queues
- **Vercel Blob**: Document and file storage

### Pre-deployment Checklist
- [ ] Run `npm run build` locally
- [ ] Run `npm run test:e2e`
- [ ] Check environment variables in Vercel dashboard
- [ ] Review database migrations
- [ ] Test email sending
- [ ] Verify Upstash Redis connection

### Deployment Process

#### Vercel (Automatic on push to main)
```bash
git push origin main
# Vercel automatically:
# 1. Runs `npm install --legacy-peer-deps`
# 2. Executes `prisma generate && prisma migrate deploy && next build`
# 3. Deploys to production
```

**Manual Deploy:**
```bash
vercel --prod
```

#### Fly.io Workers (Manual deployment)
```bash
# 1. Set secrets (first time only)
fly secrets set \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="..." \
  OPENAI_API_KEY="..." \
  ANTHROPIC_API_KEY="..." \
  BLOB_READ_WRITE_TOKEN="..."

# 2. Deploy workers
fly deploy -c fly.toml

# 3. Scale workers (if needed)
fly scale count 2 --region iad

# 4. Monitor
fly logs
fly status
```

### Monitoring

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs`
- Analytics: Built-in Vercel Analytics

**Fly.io Workers:**
- Status: `fly status`
- Logs: `fly logs`
- SSH access: `fly ssh console`
- Metrics: https://fly.io/dashboard

**Database:**
- Prisma Studio: `npx prisma studio`
- Prisma Postgres dashboard: https://console.prisma.io

**Redis:**
- Upstash Console: https://console.upstash.com
- BullBoard (if enabled): `/admin/queues`

## Important Implementation Notes

### Security
- Never expose sensitive keys in client code
- Validate all inputs with Zod
- Use parameterized queries (Prisma handles this)
- Implement rate limiting on APIs
- Sanitize file uploads

### Performance
- Use React Query for data caching
- Implement pagination for lists
- Optimize images with Next.js Image
- Use dynamic imports for large components
- Queue heavy operations (OCR, embeddings)

### Database Operations
- **CRITICAL**: Always verify with user before writes
- Use transactions for multi-table operations
- Add indexes for frequently queried fields
- Handle Prisma errors gracefully
- Log all mutations for audit trail

### Email System
- Always provide HTML + text versions
- Attach ICS files for calendar events
- Handle SMTP failures gracefully
- Queue emails for retry on failure
- Log all email operations

## Common Pitfalls to Avoid

1. **Port conflicts**: Dev runs on 3001, not 3000
2. **Database writes**: Triple-verify with user first
3. **Missing envs**: Check all required variables
4. **Import paths**: Use `@/` alias, not relative
5. **Brand colors**: Don't override without reason
6. **Silent failures**: Always surface errors to user
7. **Blob token**: Ensure BLOB_READ_WRITE_TOKEN is set in Vercel
8. **Redis connection**: Workers need REDIS_URL (Upstash in production, local in dev)
9. **Worker deployment**: Fly.io workers must be deployed separately from Vercel app
10. **Database migrations**: Run in Vercel build step via `vercel-build` script

## Related Documentation

- `README.md` - Quick start guide
- `SETUP_GUIDE.md` - Detailed setup instructions
- `.env.local.template` - All environment variables
- `docs/BOOKING_SETUP.md` - Email configuration
- `prisma/schema.prisma` - Complete data model
- `vercel.json` - Vercel deployment configuration
- `fly.toml` - Fly.io worker configuration
- `Dockerfile.workers` - Worker container definition
- `playwright.config.ts` - E2E test setup