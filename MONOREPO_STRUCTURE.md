# Astralis One - Turborepo Monorepo Structure

This document describes the monorepo structure initialized for Astralis One using Turborepo.

## Directory Structure

```
astralis-nextjs/
├── apps/                    # Application packages
│   ├── platform/           # Main Astralis One application
│   └── marketing/          # Static marketing site (AstralisOne.com)
├── packages/               # Shared packages
│   ├── ui/                # Shared UI components and design system
│   ├── database/          # Shared Prisma schema and database utilities
│   └── lib/               # Shared utilities, types, and helpers
├── pnpm-workspace.yaml    # PNPM workspace configuration
├── turbo.json             # Turborepo pipeline configuration
└── package.json           # Root package.json with turbo scripts
```

## Configuration Files

### pnpm-workspace.yaml
Defines the workspace structure for PNPM package manager:
- `apps/*` - All application packages
- `packages/*` - All shared packages

### turbo.json
Defines the Turborepo build pipeline:
- **build**: Builds all packages with dependency graph support
- **lint**: Runs linting across all packages
- **dev**: Runs development servers (no caching, persistent)
- **type-check**: TypeScript type checking

## Installation

To install Turbo as a dev dependency:

```bash
npm install turbo --save-dev
```

## Available Scripts

### Turborepo Commands

```bash
npm run turbo:build       # Build all packages in dependency order
npm run turbo:dev         # Start all dev servers concurrently
npm run turbo:lint        # Lint all packages
npm run turbo:type-check  # Type check all packages
```

### Direct Turbo Usage

```bash
npx turbo run build       # Run build task
npx turbo run dev         # Run dev task
npx turbo run lint        # Run lint task
npx turbo --version       # Check Turbo version
```

## Migration Plan

### Phase 1: Structure Setup (COMPLETED)
- [x] Create pnpm-workspace.yaml
- [x] Create turbo.json
- [x] Create directory structure (apps/, packages/)
- [x] Install turbo dependency
- [x] Add turbo scripts to package.json

### Phase 2: Package Migration (NEXT)
1. **packages/database**:
   - Move Prisma schema from root to packages/database
   - Create package.json for @astralis/database
   - Export Prisma client and utilities

2. **packages/ui**:
   - Move shared components from src/components/ui/
   - Set up package.json for @astralis/ui
   - Configure Tailwind for shared styles

3. **packages/lib**:
   - Move shared utilities from src/lib/
   - Create package.json for @astralis/lib
   - Export types, helpers, and utilities

4. **apps/platform**:
   - Move existing Next.js app to apps/platform/
   - Update imports to use workspace packages
   - Configure to use @astralis/* packages

5. **apps/marketing**:
   - Create new Next.js app for marketing site
   - Use @astralis/ui components
   - Static generation for performance

### Phase 3: Build Optimization
- Configure Turborepo caching
- Set up remote caching (optional)
- Optimize build pipeline
- Configure Docker for monorepo

## Benefits

1. **Code Sharing**: Shared packages across apps and marketing site
2. **Type Safety**: Shared types ensure consistency
3. **Build Performance**: Turborepo caching and parallel execution
4. **Developer Experience**: Clear boundaries and dependencies
5. **Scalability**: Easy to add new apps or packages

## Tech Stack Alignment

This monorepo structure maintains alignment with Astralis One's tech stack:
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with Astralis brand theme
- **Database**: PostgreSQL + Prisma ORM (shared in packages/database)
- **UI Components**: Radix UI primitives (shared in packages/ui)
- **Infrastructure**: DigitalOcean deployment remains unchanged

## Next Steps

1. Install Turbo: `npm install turbo --save-dev`
2. Verify installation: `npx turbo --version`
3. Begin package migration (see Phase 2 above)
4. Update CI/CD to use turbo commands

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Turborepo Examples](https://github.com/vercel/turbo/tree/main/examples)
