# @astralis/database

Shared database package for Astralis One platform.

## Overview

This package contains the Prisma schema, client configuration, and all database-related utilities used across the Astralis One monorepo.

## Structure

```
packages/database/
├── src/
│   ├── client.ts       # Prisma client singleton
│   └── index.ts        # Main exports
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Migration history
│   └── seeds/          # Seed scripts
├── package.json
└── tsconfig.json
```

## Usage

In any workspace that needs database access:

```typescript
import { prisma, User, Organization } from '@astralis/database';

// Use prisma client
const users = await prisma.user.findMany();

// Use types
const user: User = await prisma.user.findUnique({
  where: { id: '123' }
});
```

## Commands

```bash
# Generate Prisma client
npm run generate

# Create and apply migrations (development)
npm run migrate:dev

# Apply migrations (production)
npm run migrate:deploy

# Open Prisma Studio
npm run studio

# Build TypeScript
npm run build
```

## Key Features

- **Singleton Pattern**: Prisma client is cached in global scope to avoid multiple instances
- **Development Logging**: Query logging enabled in development mode
- **Type Safety**: All Prisma types are re-exported for use throughout the application
- **Migration History**: Complete migration history in `prisma/migrations/`

## Schema Highlights

The database schema includes:

- **Multi-tenant**: Organization-based isolation
- **Authentication**: Users, sessions, accounts (NextAuth.js compatible)
- **RBAC**: Role-based access control (ADMIN, OPERATOR, CLIENT, PM)
- **Pipeline System**: Kanban-style workflow management
- **Agentic Tasks**: AI-powered task routing and management
- **Document Processing**: OCR, embeddings, RAG chat
- **Scheduling**: Calendar integration, event management
- **Automation**: n8n workflow integration
- **Audit Trail**: Activity logging for all sensitive operations

## Environment Variables

Required environment variables:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

## Notes

- Always run migrations before starting the application
- Use `prisma studio` for GUI-based database exploration
- All models use `cuid()` for ID generation except where UUIDs are explicitly needed
- Timestamps (`createdAt`, `updatedAt`) are automatically managed by Prisma
