# Agent Handoff Document

**Project:** Astralis One - Multi-Agent Engineering Platform
**Last Updated:** December 7, 2025
**Previous Agent:** Claude Opus 4.5

---

## Current State Summary

### What Was Just Completed

1. **Database Migration Deployed** - Migration `20251207120000_add_operational_agent_support` successfully ran on Vercel production. This added:
   - `DocumentType` enum: INVOICE, BILL, CONTRACT, POLICY, CERTIFICATE, PACKING_SLIP, BOL, RECEIVING_REPORT, PURCHASE_ORDER, QUOTE, UNKNOWN
   - `OperationalAgentType` enum: AP_CLERK, COMPLIANCE_SENTINEL, LOGISTICS_COORDINATOR
   - New Document columns: `documentType`, `classificationConfidence`, `agentProcessed`, `agentProcessedAt`, `originalName`

2. **Icon Sizes Standardized** - All `h-3 w-3` icons updated to `h-5 w-5` across 11 component files for better visibility.

3. **Production Working** - The documents page error (missing `documentType` column) is resolved. The app is live at https://astralisone.com

---

## Pending Tasks (Priority Order)

### 1. Skeleton Loading States (Paused)
Replace spinner loading indicators with Skeleton components across these pages:
- `src/app/(app)/pipelines/page.tsx`
- `src/app/(app)/pipelines/[id]/page.tsx`
- `src/app/(app)/scheduling/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/(app)/settings/preferences/page.tsx`
- `src/app/(app)/intake/page.tsx`
- `src/app/(app)/automations/new/page.tsx`
- `src/app/(app)/documents/page.tsx`

**Pattern to follow:** Look at how `src/app/(app)/integrations/page.tsx` handles loading states with `<Skeleton>` components instead of spinners.

### 2. Operational Agents Implementation (From Plan File)
Full implementation plan exists at: `~/.claude/plans/sprightly-weaving-dongarra.md`

**Phase 2-6 remaining:**

#### Phase 2: New Action Handlers
Create in `src/lib/agent/actions/`:
- `DbLookupHandler.ts` - Query Prisma for duplicate detection, PO matching
- `ApiPostHandler.ts` - POST to external systems (QuickBooks, ERP)
- `DateCalculationHandler.ts` - Calculate due dates, renewal windows
- `ArrayComparisonHandler.ts` - Compare line items between documents

#### Phase 3: Document Event Wiring
- Modify `src/workers/processors/ocr.processor.ts` to emit `DOCUMENT_PROCESSED` events
- Register event in `src/lib/agent/events/EventBus.ts`

#### Phase 4: Agent Implementation
Create in `src/lib/agent/operational/`:
- `BaseOperationalAgent.ts` (~100 lines) - Abstract base class
- `APClerkAgent.ts` (~200 lines) - Invoice/bill processing
- `ComplianceSentinelAgent.ts` (~180 lines) - Contract monitoring
- `LogisticsCoordinatorAgent.ts` (~220 lines) - Goods received reconciliation

#### Phase 5: Extraction Schemas
Create `config/extraction-schemas.json` with field definitions for each document type.

#### Phase 6: Integration
- Register agents with `OrchestrationAgent`
- Update `src/lib/agent/types/agent.types.ts`

#### Phase 7: E2E Tests
Create Playwright tests in `tests/e2e/pipelines/` for each pipeline type.

---

## Key Files Reference

### Core Configuration
- `CLAUDE.md` - Full project documentation and conventions
- `prisma/schema.prisma` - Database schema (includes new Document fields)
- `.env.local.template` - Environment variable reference
- `package.json` - Dependencies and scripts

### Agent System (Existing)
- `src/lib/agent/core/OrchestrationAgent.ts` - Main coordinator
- `src/lib/agent/core/DecisionEngine.ts` - AI decision making
- `src/lib/agent/core/ActionExecutor.ts` - Action handler registry
- `src/lib/agent/events/EventBus.ts` - Event pub/sub system

### Document Processing (Existing)
- `src/lib/services/document.service.ts` - Document CRUD + upload
- `src/lib/services/ocr.service.ts` - Tesseract OCR
- `src/lib/services/vision.service.ts` - GPT-4 Vision extraction
- `src/workers/processors/ocr.processor.ts` - Background OCR worker

### UI Components
- `src/components/ui/` - Base UI primitives (Button, Card, Skeleton, etc.)
- `src/components/documents/` - Document-specific components
- `src/app/(app)/` - Main app pages (requires auth)

---

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | Prisma + PostgreSQL (Prisma Postgres) |
| Queue | BullMQ + Upstash Redis |
| Auth | NextAuth.js |
| Styling | Tailwind CSS |
| State | Zustand + React Query |
| AI | OpenAI API, Anthropic Claude |
| OCR | Tesseract.js |
| Storage | Vercel Blob |
| Deployment | Vercel (app) + Fly.io (workers) |

---

## Development Commands

```bash
# Start development
npm run dev              # Port 3001

# Database
npx prisma generate      # Generate client
npx prisma migrate dev   # Create migration
npx prisma studio        # GUI browser

# Build & Deploy
npm run build            # Local build
vercel --prod --force    # Deploy with cache purge

# Workers
npm run worker           # Dev worker
npm run worker:prod      # Production worker
```

---

## Important Conventions

1. **Imports** - Always use `@/` path alias
2. **Port** - Dev server runs on 3001, not 3000
3. **Colors** - Use Astralis brand: navy (#0A1B2B), blue (#2B6CB0)
4. **Icons** - Standard size is `h-5 w-5` (just updated from h-3)
5. **Loading** - Use `<Skeleton>` components, not spinners
6. **Commits** - Include Claude footer with co-author

---

## Environment Variables Required

```bash
DATABASE_URL              # Prisma Postgres connection
DIRECT_URL                # Direct DB connection (for migrations)
NEXTAUTH_SECRET           # Auth encryption key
NEXTAUTH_URL              # http://localhost:3001 for dev
REDIS_URL                 # Upstash Redis for BullMQ
OPENAI_API_KEY            # For embeddings + vision
ANTHROPIC_API_KEY         # For Claude AI
BLOB_READ_WRITE_TOKEN     # Vercel Blob storage
```

---

## Known Issues / Gotchas

1. **Prisma JSON fields** - Use `Prisma.JsonNull` for null values, not `null`
2. **Document select** - `listDocuments()` uses explicit `select` to avoid schema drift issues
3. **Background shells** - Many stale background processes may exist; kill with `lsof -ti:3001 | xargs kill`
4. **Vercel cache** - Use `vercel --prod --force` if changes don't appear

---

## Next Steps Recommendation

1. **Quick Win:** Complete skeleton loading states (simple UI update, ~30 min)
2. **Medium Effort:** Implement action handlers (Phase 2, ~2 hours)
3. **Full Feature:** Complete operational agents (Phases 4-6, ~1 day)
4. **Testing:** E2E test suite (Phase 7, ~4 hours)

---

## Contact / Resources

- **Repository:** Local at `/Users/gadmin/Projects/astralis-nextjs`
- **Production URL:** https://astralisone.com
- **Vercel Dashboard:** Check via `vercel ls`
- **Full Docs:** See `CLAUDE.md` in project root
