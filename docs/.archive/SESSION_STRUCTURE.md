# NextAuth Session Structure

## Overview

The Astralis One application uses NextAuth.js v4 with JWT-based sessions for authentication. This document describes the required session structure and how to troubleshoot session-related issues.

---

## Required Session Fields

The application requires these fields in the NextAuth session:

### session.user object

- `id: string` - User's database ID (from Prisma)
- `email: string` - User's email address
- `name: string | null` - User's display name
- `orgId: string` - **REQUIRED** - User's organization ID (for multi-tenancy)
- `role: UserRole` - User's role (ADMIN, OPERATOR, CLIENT, etc.)
- `image: string | null` - User's profile image URL (optional)

### Example Session Object

```typescript
{
  user: {
    id: "cmi7c0uh10002pa82fz4oookv",
    email: "test@example.com",
    name: "Test User",
    orgId: "cmi7gcl9d00006tac2o2ftlwv",  // ← CRITICAL for multi-tenant operations
    role: "ADMIN",
    image: null
  },
  expires: "2025-12-20T00:00:00.000Z"
}
```

---

## Configuration

Session fields are populated in `/src/lib/auth/config.ts`:

### 1. JWT Callback (Lines 72-93)

Adds fields to the JWT token when user signs in:

```typescript
async jwt({ token, user, account }) {
  // Initial sign in
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.orgId = user.orgId;  // ← Add orgId to token
  }

  // Google OAuth - find or create organization
  if (account?.provider === "google" && user) {
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (dbUser) {
      token.orgId = dbUser.orgId || '';
      token.role = dbUser.role;
    }
  }

  return token;
}
```

### 2. Session Callback (Lines 95-102)

Adds fields to the session from the token:

```typescript
async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    session.user.orgId = token.orgId as string;  // ← Add orgId to session
  }
  return session;
}
```

### 3. TypeScript Types

Type definitions in `/src/types/next-auth.d.ts` ensure type safety:

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      orgId: string;  // ← Type includes orgId
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    orgId: string;  // ← Type includes orgId
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    orgId: string;  // ← Type includes orgId
  }
}
```

---

## Database Schema

The `users` table in Prisma schema includes:

```prisma
model users {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String?
  password          String
  role              UserRole       @default(USER)
  orgId             String?        // ← Nullable, but REQUIRED for app operations
  organization      organization?  @relation(fields: [orgId], references: [id])

  // ... other fields

  @@index([orgId])
}
```

**Important:** While `orgId` is nullable in the schema (to allow user creation), it **MUST** be populated before users can perform any operations that require organization context (pipelines, intake requests, etc.).

---

## Common Issues and Troubleshooting

### Issue 1: "Organization ID not found" Error

**Symptoms:**
- User is logged in successfully
- Cannot create pipelines or intake requests
- Error message: "Organization ID not found. Please sign in again."

**Root Cause:**
User's `orgId` field in the database is `NULL`, or the session token was created before callbacks were configured.

**Fix:**

1. **Run the fix script:**
   ```bash
   npx tsx scripts/fix-test-user-orgid.ts
   ```

2. **Sign out and sign in again** to get a fresh JWT token

3. **Verify the fix:**
   ```typescript
   // Add this temporarily to CreatePipelineModal or any component
   console.log('Session:', session);
   console.log('OrgId:', session?.user?.orgId);
   ```

### Issue 2: User Has No Organization in Database

**Diagnosis:**
```sql
SELECT id, email, "orgId", name FROM users WHERE email = 'your@email.com';
```

If `orgId` is `NULL`:

**Fix:**

1. **Create an organization:**
   ```sql
   INSERT INTO organization (id, name, "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), 'Your Organization', NOW(), NOW())
   RETURNING id;
   ```

2. **Update user with orgId:**
   ```sql
   UPDATE users
   SET "orgId" = '[organization-id-from-above]'
   WHERE email = 'your@email.com';
   ```

3. **Sign out and sign in again**

### Issue 3: TypeScript Errors on session.user.orgId

**Symptoms:**
- TypeScript shows `Property 'orgId' does not exist on type 'Session["user"]'`

**Fix:**
Ensure `/src/types/next-auth.d.ts` is properly configured with the module augmentation shown above.

### Issue 4: Session Doesn't Update After Database Change

**Symptoms:**
- Updated user's orgId in database
- Still shows "Organization ID not found" error

**Root Cause:**
JWT tokens are stateless and include orgId at time of creation. Changing the database doesn't affect existing tokens.

**Fix:**
**MUST sign out and sign in again** to get a new token with updated orgId.

---

## Testing Session Structure

### In Browser Console

```javascript
// Check session in browser (add to any client component)
import { useSession } from 'next-auth/react';

function DebugSession() {
  const { data: session } = useSession();

  console.log('Full Session:', JSON.stringify(session, null, 2));
  console.log('User ID:', session?.user?.id);
  console.log('Org ID:', session?.user?.orgId);  // ← Should have a value
  console.log('Role:', session?.user?.role);

  return null;
}
```

### In Server Components

```typescript
import { auth } from '@/lib/auth/config';

export default async function Page() {
  const session = await auth();

  console.log('Session:', session);
  console.log('OrgId:', session?.user?.orgId);  // ← Should have a value

  return <div>...</div>;
}
```

---

## New User Signup Flow

When a new user signs up via credentials:

1. **User record is created** in `users` table (via signup API)
2. **Organization is NOT automatically created** - must be done separately
3. **User must be assigned to an organization** before they can use the app

### Recommended Signup Flow:

```typescript
// In signup API route
const user = await prisma.users.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: 'USER',
    // Option 1: Create org inline
    organization: {
      create: {
        name: `${name}'s Organization`
      }
    }
  }
});

// Option 2: Assign to existing org
const user = await prisma.users.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: 'USER',
    orgId: existingOrgId  // ← Assign to existing org
  }
});
```

---

## OAuth (Google) Flow

For OAuth sign-ins, the `signIn` callback (lines 103-137 in `/src/lib/auth/config.ts`) handles organization assignment:

```typescript
async signIn({ user, account, profile }) {
  if (account?.provider === "google") {
    const dbUser = await prisma.users.findUnique({
      where: { email: user.email! },
      include: { organization: true }
    });

    // If user doesn't have org, create one (first-time OAuth)
    if (!dbUser?.organization) {
      const org = await prisma.organization.create({
        data: {
          name: `${user.name}'s Organization`,
          users: {
            connect: { id: dbUser!.id }
          }
        }
      });

      await prisma.users.update({
        where: { id: dbUser!.id },
        data: { orgId: org.id, role: 'ADMIN' }
      });
    }

    return true;
  }

  return true;
}
```

This ensures OAuth users always have an organization.

---

## Multi-Tenancy and Organization Isolation

Every operation in the app uses `orgId` to ensure data isolation:

### Pipeline Creation Example

```typescript
// In CreatePipelineModal.tsx
const onSubmit = async (data) => {
  if (!session?.user?.orgId) {
    setError('Organization ID not found. Please sign in again.');
    return;  // ← BLOCKS operation if no orgId
  }

  await createPipeline.mutateAsync({
    name: data.name,
    description: data.description,
    orgId: session.user.orgId  // ← Uses orgId from session
  });
};
```

### API Route Example

```typescript
// In /api/pipelines/route.ts
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.orgId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const pipelines = await prisma.pipeline.findMany({
    where: { orgId: session.user.orgId }  // ← Filter by orgId
  });

  return NextResponse.json(pipelines);
}
```

---

## Summary Checklist

Before deploying or adding new users:

- [ ] NextAuth callbacks add `orgId` to JWT and session
- [ ] TypeScript types include `orgId` in Session, User, and JWT interfaces
- [ ] All users in database have a valid `orgId` value
- [ ] All API routes check `session?.user?.orgId` before operations
- [ ] All client components check `session?.user?.orgId` before mutations
- [ ] New user signup flow creates or assigns an organization
- [ ] OAuth flow creates an organization for first-time users
- [ ] `npm run build` passes with no TypeScript errors

---

## Related Files

- `/src/lib/auth/config.ts` - NextAuth configuration with callbacks
- `/src/types/next-auth.d.ts` - TypeScript type augmentation
- `/prisma/schema.prisma` - Database schema with users and organization models
- `/scripts/fix-test-user-orgid.ts` - Script to fix test user's orgId
- `/src/hooks/usePipelineMutations.ts` - Example of using orgId in mutations
- `/src/components/pipelines/CreatePipelineModal.tsx` - Example of session validation

---

## Support

If you encounter session-related issues:

1. Check this documentation first
2. Run the debug snippets to inspect session structure
3. Verify database records have valid orgId values
4. **Always sign out and sign in again** after database changes
5. Check browser console for errors
6. Ensure NextAuth callbacks are properly configured

Last updated: 2025-01-20
