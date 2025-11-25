# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

- Install deps (as documented in README):
  - `npm install --legacy-peer-deps`
- App (Next.js 15 on port 3001):
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Start (prod): `npm run start`
  - Lint: `npm run lint`
- Database (Prisma + Postgres):
  - Generate client: `npx prisma generate` or `npm run prisma:gen`
  - Migrate (deploy to prod): `npm run prisma:migrate`
  - Studio (GUI): `npx prisma studio`
- Background workers (BullMQ):
  - Dev (watch): `npm run worker`
  - Prod (one‑off): `npm run worker:prod`
  - PM2 controls (if using process manager on server):
    - `npm run prod:start` | `npm run prod:restart` | `npm run prod:reload` | `npm run prod:stop` | `npm run prod:status`
- Storybook (component development):
  - Dev: `npm run storybook`
  - Build: `npm run build-storybook`
- E2E tests (Playwright):
  - All tests: `npm run test:e2e`
  - UI mode: `npm run test:e2e:ui`
  - Headed: `npm run test:e2e:headed`
  - Debug: `npm run test:e2e:debug`
  - Report: `npm run test:e2e:report`
  - Single test file: `npx playwright test tests/e2e/auth/signin.spec.ts`
  - Single test by name: `npx playwright test -g "should sign in with valid credentials"`
- Phase 6 automation (n8n) helpers in `scripts/`:
  - Full setup: `./scripts/setup-phase6.sh` (make executable first: `chmod +x scripts/setup-phase6.sh`)

## Environment setup

- Copy and edit envs: `cp .env.local.template .env.local`.
- Minimum needed to boot web app locally (see README for full list):
  - `DATABASE_URL`, `NEXT_PUBLIC_API_BASE_URL` (defaults assume `http://localhost:3001`).
- Workers additionally require: `OPENAI_API_KEY`, `REDIS_URL` (see `src/workers/index.ts`).

## High‑level architecture

- Framework and conventions
  - Next.js App Router with route groups and API routes.
  - TypeScript (strict), path alias `@/*` → `src/*` (set in `tsconfig.json` and `next.config.mjs`).
  - Tailwind CSS for styling; Storybook for UI components.

- App surfaces (`src/app`)
  - Route groups:
    - `(marketing)` for public marketing pages; `(app)` for authenticated product surfaces.
  - Key areas: dashboard, pipelines, documents, integrations, scheduling, automations, settings, calendar‑chat.
  - API routes under `src/app/api/**` expose domain endpoints (auth, booking/scheduling, documents, intake, automations, integrations, orgs, users, webhooks, etc.).

- Domain and services (`src/lib`)
  - `lib/services/*`: cohesive domain services (auth, automations, calendar, documents/OCR, embeddings, vector search, AI routing/scheduling, n8n integration, quotas, profiles/settings). App/API layers call into these.
  - `lib/validators/*`: zod validators colocated with service domains.
  - `lib/queries/*`: client-side data helpers (optimistic updates, error handling) for React Query.
  - `lib/middleware/rbac.middleware.ts`: role/permission checks for protected operations.
  - `lib/analytics/*`: GA/gtag integration and helpers.
  - `lib/utils/*`: cross‑cutting utilities (crypto, file validation, email templates, embedding helpers).

- Orchestration agent system (`src/lib/agent`)
  - Core: `core/*` (LLM clients/factory, decision engine, orchestration agent).
  - Inputs: `inputs/*` (email, webhook, DB triggers, worker events) feed the agent.
  - Actions: `actions/*` execute decisions (pipeline assigner, calendar manager, notification dispatcher, automation trigger).
  - Prompts: `prompts/*` contain task‑specific and system prompts.
  - Types and utils under `types/*` and `utils/*`.

- Background processing (`src/workers`)
  - Entrypoint: `src/workers/index.ts` starts BullMQ workers for:
    - Document OCR (`document-processing`),
    - Embedding (`document-embedding`),
    - Intake routing (`intake-routing`),
    - Calendar sync (`calendar-sync`),
    - Scheduling reminders (`scheduling-reminders`).
  - Requires `OPENAI_API_KEY`, `DATABASE_URL`, `REDIS_URL`; graceful shutdown handlers included.

- Data layer (Prisma / Postgres)
  - Schema in `prisma/schema.prisma` covers organizations, users/roles, pipelines/stages/items, documents + embeddings, intake requests, scheduling events + reminders, newsletter/marketplace modules, automations (templates, triggers, executions), and orchestration‑agent audit models.

- UI system
  - Storybook configured via `.storybook/` with `@storybook/nextjs` and a11y addon; stories colocated next to components under `src/components/**`.

## Testing (Playwright)

- Config: `playwright.config.ts` (testDir `tests/e2e`, baseURL `http://localhost:3001`, retries on CI, traces/screenshots/videos on failure).
- `tests/README.md` documents structure, fixtures, helpers, and common commands. Tests auto‑start the dev server per config.

## Important project rules (from CLAUDE.md and README)

- Use the `@/*` import alias; avoid deep relative paths.
- Local dev server and tests assume port `3001`.
- When operating programmatically, avoid mutating production data. For any operation that writes to the database, require explicit user approval and prefer running against local/dev with Prisma migrations applied.
- Prefer calling domain services in `src/lib/services/*` from API routes and server actions instead of duplicating logic in route handlers.

## Notes for agents

- Prefer high‑level entry points:
  - Web/API: adjust code under `src/app/**` and call `lib/services/*`.
  - Workers: add processors and queues via `src/workers/**` and corresponding service methods.
- Keep path aliasing intact when moving files (update `tsconfig.json`/`next.config.mjs` only if necessary).
- For UI work, run Storybook and colocate stories next to components.
- For new endpoints, colocate validators in `lib/validators/*` and reuse service functions to keep route handlers thin.
