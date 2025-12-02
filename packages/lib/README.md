# @astralis/lib

Shared utilities package for Astralis One platform.

## Installation

This is an internal package used via workspace protocol:

```json
{
  "dependencies": {
    "@astralis/lib": "workspace:*"
  }
}
```

## Exports

### Tenant Utilities (`tenant.ts`)

Multi-tenant utilities for organization-scoped operations:

```typescript
import { requireOrgId, withOrgId, withOrgIdData, hasOrgId } from '@astralis/lib';

// Validate orgId is present
const orgId = requireOrgId(session.user.orgId);

// Add orgId to Prisma WHERE clause
const where = withOrgId(orgId, { status: 'ACTIVE' });
// Result: { status: 'ACTIVE', orgId: 'abc123' }

// Add orgId to Prisma create data
const data = withOrgIdData(orgId, { name: 'New Item' });
// Result: { name: 'New Item', orgId: 'abc123' }

// Type guard for session validation
if (hasOrgId(session)) {
  // TypeScript knows session.user.orgId exists
  console.log(session.user.orgId);
}
```

### Validators (`validators.ts`)

Common Zod validation schemas:

```typescript
import {
  idSchema,
  orgIdSchema,
  emailSchema,
  nameSchema,
  paginationSchema,
  sortSchema
} from '@astralis/lib';

// Single field validation
const userId = idSchema.parse(req.params.id);
const email = emailSchema.parse(req.body.email);

// Pagination with defaults
const { page, limit } = paginationSchema.parse(req.query);
// Defaults: page=1, limit=20

// Sorting with defaults
const { sortBy, sortOrder } = sortSchema.parse(req.query);
// Default: sortOrder='desc'
```

### Constants (`constants.ts`)

Application-wide constants:

```typescript
import {
  APP_NAME,
  APP_DESCRIPTION,
  ROLES,
  Role,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  API_VERSION
} from '@astralis/lib';

// Role constants
if (user.role === ROLES.ADMIN) {
  // Admin-only logic
}

// Type-safe role type
const role: Role = 'ADMIN'; // 'ADMIN' | 'OPERATOR' | 'CLIENT' | 'PM'

// Pagination constants
const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
```

## Development

```bash
# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Usage in API Routes

Example API route using shared utilities:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  requireOrgId,
  withOrgId,
  paginationSchema,
  idSchema
} from '@astralis/lib';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate orgId
    const orgId = requireOrgId(session.user.orgId);

    // 3. Parse and validate pagination
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const { page, limit } = paginationSchema.parse(searchParams);

    // 4. Query with org scoping
    const items = await prisma.item.findMany({
      where: withOrgId(orgId, { status: 'ACTIVE' }),
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ items, page, limit });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate inputs
    const orgId = requireOrgId(session.user.orgId);
    const itemId = idSchema.parse(params.id);

    // 3. Delete with org scoping
    await prisma.item.delete({
      where: withOrgId(orgId, { id: itemId }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
```

## License

Private - Astralis One Internal Use Only
