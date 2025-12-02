# @astralis/database - Quick Start

## Installation (In Workspace)

```json
// package.json
{
  "dependencies": {
    "@astralis/database": "workspace:*"
  }
}
```

Then run:
```bash
npm install
```

---

## Usage

### Import the Client

```typescript
import { prisma } from '@astralis/database';

// Query users
const users = await prisma.users.findMany();

// Create organization
const org = await prisma.organization.create({
  data: {
    name: "Acme Corp",
    plan: "PROFESSIONAL"
  }
});
```

### Import Types

```typescript
import { User, Organization, Pipeline, Task } from '@astralis/database';

// Use types
const user: User = await prisma.users.findUnique({
  where: { id: userId }
});

const org: Organization = await prisma.organization.findFirst({
  where: { slug: "acme" }
});
```

### Import Enums

```typescript
import { UserRole, TaskStatus, PipelineType } from '@astralis/database';

// Use enums
const adminRole: UserRole = "ADMIN";
const newTask: TaskStatus = "NEW";
const salesPipeline: PipelineType = "SALES";
```

---

## Common Queries

### User Operations

```typescript
import { prisma, UserRole } from '@astralis/database';

// Find user by email
const user = await prisma.users.findUnique({
  where: { email: "user@example.com" }
});

// Find users by role
const admins = await prisma.users.findMany({
  where: { role: "ADMIN", isActive: true }
});

// Create user with organization
const newUser = await prisma.users.create({
  data: {
    email: "new@example.com",
    name: "New User",
    password: hashedPassword,
    role: "USER",
    organization: {
      create: {
        name: "New Org",
        plan: "FREE"
      }
    }
  },
  include: { organization: true }
});
```

### Organization Operations

```typescript
// Find organization with users
const org = await prisma.organization.findUnique({
  where: { id: orgId },
  include: {
    users: true,
    pipelines: true,
    documents: true
  }
});

// Update organization plan
await prisma.organization.update({
  where: { id: orgId },
  data: { plan: "ENTERPRISE" }
});
```

### Task Operations

```typescript
import { prisma, TaskStatus } from '@astralis/database';

// Find tasks by status
const newTasks = await prisma.task.findMany({
  where: {
    orgId: orgId,
    status: "NEW"
  },
  include: {
    template: true,
    pipeline: true,
    stage: true
  }
});

// Update task status
await prisma.task.update({
  where: { id: taskId },
  data: {
    status: "IN_PROGRESS",
    assignedToUserId: userId
  }
});
```

### Pipeline Operations

```typescript
// Get pipeline with stages and tasks
const pipeline = await prisma.pipeline.findUnique({
  where: { id: pipelineId },
  include: {
    stages: {
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          where: { status: { not: "CANCELLED" } }
        }
      }
    }
  }
});
```

### Document Operations

```typescript
import { prisma, DocumentStatus } from '@astralis/database';

// Find documents by organization
const docs = await prisma.document.findMany({
  where: {
    orgId: orgId,
    status: "COMPLETED"
  },
  include: {
    embeddings: true,
    chats: true
  }
});

// Update document status
await prisma.document.update({
  where: { id: docId },
  data: {
    status: "COMPLETED",
    ocrText: extractedText,
    processedAt: new Date()
  }
});
```

---

## Transactions

For operations that require atomicity:

```typescript
import { prisma } from '@astralis/database';

const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.users.create({
    data: {
      email: "user@example.com",
      name: "New User",
      password: hashedPassword,
      role: "OPERATOR",
      orgId: orgId
    }
  });

  // Log activity
  await tx.activityLog.create({
    data: {
      userId: user.id,
      orgId: orgId,
      action: "CREATE",
      entity: "USER",
      entityId: user.id,
      changes: { email: user.email, role: user.role }
    }
  });

  return user;
});
```

---

## Environment Variables

Required in your `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

---

## Commands

### Development

```bash
# Generate Prisma client (after schema changes)
cd packages/database
npm run generate

# Create migration (development)
npm run migrate:dev

# Open Prisma Studio
npm run studio
```

### Production

```bash
# Apply migrations
npm run migrate:deploy

# Generate client
npm run generate
```

---

## TypeScript Intellisense

All Prisma types are fully typed with excellent IDE support:

```typescript
import { prisma } from '@astralis/database';

// Full autocomplete available
prisma.users.      // IDE shows: findMany, findUnique, create, update, etc.
prisma.organization. // IDE shows all organization methods
```

Type safety for all operations:

```typescript
// Compile-time error if field doesn't exist
const user = await prisma.users.create({
  data: {
    email: "test@example.com",
    invalidField: "value"  // ❌ TypeScript error
  }
});
```

---

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

```typescript
// ✅ Good
await prisma.$transaction([
  prisma.users.update(...),
  prisma.activityLog.create(...)
]);

// ❌ Bad (not atomic)
await prisma.users.update(...);
await prisma.activityLog.create(...);
```

### 2. Use Include for Relations

```typescript
// ✅ Good - single query
const user = await prisma.users.findUnique({
  where: { id: userId },
  include: { organization: true }
});

// ❌ Bad - two queries
const user = await prisma.users.findUnique({ where: { id: userId } });
const org = await prisma.organization.findUnique({ where: { id: user.orgId } });
```

### 3. Use Select for Performance

```typescript
// ✅ Good - only fetch needed fields
const user = await prisma.users.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true }
});

// ❌ Bad - fetches all fields
const user = await prisma.users.findUnique({
  where: { id: userId }
});
```

### 4. Always Handle Errors

```typescript
// ✅ Good
try {
  const user = await prisma.users.create({ data: userData });
  return user;
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    throw new Error('Email already exists');
  }
  throw error;
}
```

---

## Common Prisma Error Codes

- **P2002**: Unique constraint violation
- **P2003**: Foreign key constraint violation
- **P2025**: Record not found
- **P2016**: Query interpretation error

---

## Support

For questions or issues:
1. Check the full README.md in this package
2. Review the Prisma schema: `packages/database/prisma/schema.prisma`
3. Consult Prisma docs: https://www.prisma.io/docs

---

## Example: Complete CRUD Operations

```typescript
import { prisma, UserRole, Organization, User } from '@astralis/database';

// CREATE
async function createUser(email: string, name: string, orgId: string) {
  return await prisma.users.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "USER",
      orgId
    }
  });
}

// READ
async function getUser(userId: string) {
  return await prisma.users.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
}

// UPDATE
async function updateUserRole(userId: string, role: UserRole) {
  return await prisma.users.update({
    where: { id: userId },
    data: { role }
  });
}

// DELETE
async function deleteUser(userId: string) {
  return await prisma.users.delete({
    where: { id: userId }
  });
}

// LIST
async function listUsers(orgId: string, role?: UserRole) {
  return await prisma.users.findMany({
    where: {
      orgId,
      ...(role && { role }),
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

That's it! You're ready to use `@astralis/database` in your workspace. 🚀
