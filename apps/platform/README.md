# Astralis One Platform

Multi-tenant SaaS application for the Astralis One platform.

## Overview

This is the platform application that runs on `app.astralisone.com`. It provides the multi-tenant dashboard, booking system, pipeline management, and all core features for Astralis One customers.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand + TanStack Query
- **Auth**: NextAuth.js v4
- **Database**: PostgreSQL via `@astralis/database`
- **UI Components**: `@astralis/ui` package

## Development

```bash
# Install dependencies (from workspace root)
pnpm install

# Run development server
pnpm --filter @astralis/platform dev

# Type check
pnpm --filter @astralis/platform type-check

# Lint
pnpm --filter @astralis/platform lint
```

The dev server runs on port 3001.

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Protected routes (dashboard, etc.)
│   ├── auth/           # Authentication pages
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── lib/
│   └── tenant/         # Multi-tenancy utilities
└── middleware.ts       # Request middleware
```

## Multi-Tenancy

The platform uses organization-based multi-tenancy:

- Each user belongs to one or more organizations
- Organization context is provided via `OrgProvider`
- Use `useOrg()` and `useOrgId()` hooks to access current org
- Middleware resolves organization from subdomain or path

## Environment Variables

See `packages/env/src/index.ts` for required environment variables.

## Build

```bash
pnpm --filter @astralis/platform build
```

The build output uses Next.js standalone mode for Docker deployment.
