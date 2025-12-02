# Phase 1: Authentication & RBAC

**Duration**: 2 weeks
**Prerequisites**: None (first phase)
**Docker Changes**: None (uses main app container)

---

## Phase Overview

This phase implements the complete authentication and authorization system for AstralisOps using NextAuth.js v5. By the end of this phase, users can register accounts, sign in/out, reset passwords, and access is controlled by role-based permissions (ADMIN, OPERATOR, CLIENT).

### Success Criteria Checklist

- [ ] Users can register with email/password
- [ ] Users can sign in with email/password
- [ ] Users can sign in with Google OAuth
- [ ] Email verification workflow works
- [ ] Password reset workflow works
- [ ] Protected routes require authentication
- [ ] Role-based access control enforces permissions
- [ ] Activity logging captures all critical actions
- [ ] Database migrations applied successfully
- [ ] All tests pass

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 15 (App Router), TypeScript 5, Prisma ORM, PostgreSQL, Redis, Docker
**Infrastructure**: DigitalOcean Droplet + Spaces (S3-compatible object storage)
**Brand Colors**:
- Astralis Navy: `#0A1B2B` (headings, dark backgrounds)
- Astralis Blue: `#2B6CB0` (primary buttons, links)
- Status: Success `#38A169`, Warning `#DD6B20`, Error `#E53E3E`, Info `#3182CE`

**Database**: Multi-tenant architecture
- Organization → Users → Pipelines → PipelineItems
- Organization → IntakeRequests → Documents → SchedulingEvents

**Authentication Strategy**: NextAuth.js v5 with JWT + database sessions
**State Management**: Zustand (client), TanStack Query (server)
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 1)

```yaml
Active Containers:
- app: Next.js application (port 3001)
  ├── Handles all web requests
  ├── Serves marketing pages and API routes
  └── Will include NextAuth routes after this phase

- postgres: PostgreSQL 16 database
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  └── Will include auth tables after this phase

Volumes:
- postgres-data: Database persistence

Networks:
- astralis-network: Bridge network (created in future phase)
  Note: For Phase 1, using default Docker network

Status: No Docker changes in this phase, using existing setup
```

---

## Database Schema State (After Phase 1)

### Existing Tables (Before Phase 1)
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users             User[]
  pipelines         Pipeline[]
  documents         Document[]
  intakeRequests    IntakeRequest[]
  automations       Automation[]
  schedulingEvents  SchedulingEvent[]

  @@index([createdAt])
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  role             Role      @default(OPERATOR)
  orgId            String
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  organization     Organization  @relation(fields: [orgId], references: [id])
  pipelines        Pipeline[]    @relation("PipelineOperators")

  @@index([orgId])
  @@index([email])
}

enum Role {
  ADMIN
  OPERATOR
  CLIENT
}

// ... (Pipeline, Stage, PipelineItem, Document, IntakeRequest, Automation, SchedulingEvent models exist)
```

### New Tables (Added in Phase 1)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth" | "email" | "credentials"
  provider          String  // "google", "microsoft", "credentials"
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionToken])
}

model VerificationToken {
  identifier String   // Email or phone number
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@index([token])
}

model ActivityLog {
  id          String    @id @default(cuid())
  userId      String?   // null for system actions
  orgId       String
  action      String    // CREATE, UPDATE, DELETE, LOGIN, etc.
  entity      String    // USER, PIPELINE, DOCUMENT, etc.
  entityId    String?
  changes     Json?     // Before/after values
  metadata    Json?     // Additional context
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([orgId])
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}
```

### Updated User Model

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  emailVerified    DateTime? // NEW: Email verification timestamp
  name             String?
  password         String?   // NEW: Hashed password for credentials auth
  image            String?   // NEW: Profile picture URL
  role             Role      @default(OPERATOR)
  orgId            String
  isActive         Boolean   @default(true) // NEW: Soft delete flag
  lastLoginAt      DateTime? // NEW: Track last login
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  organization     Organization  @relation(fields: [orgId], references: [id])
  pipelines        Pipeline[]    @relation("PipelineOperators")
  accounts         Account[]     // NEW
  sessions         Session[]     // NEW
  activityLogs     ActivityLog[] // NEW

  @@index([orgId])
  @@index([email])
  @@index([isActive])
}
```

---

## Environment Variables (Cumulative After Phase 1)

Create/update `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-generated-with-openssl-rand"
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Email (for verification and password reset)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# Analytics (existing)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"
```

### Generating NEXTAUTH_SECRET

```bash
# Run this command to generate a secure secret
openssl rand -base64 32

# Example output: Xf8k2Pk9mL3nQ5wR7vY2tH6jB4cZ1sD0aG9uI3oK5pM=
# Copy this value to .env.local as NEXTAUTH_SECRET
```

---

## File Structure (After Phase 1)

```
src/
├── app/
│   ├── (marketing)/              # Existing marketing pages
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── marketplace/
│   │   └── services/
│   ├── api/
│   │   ├── auth/                 # NEW: NextAuth routes
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── booking/              # Existing
│   │   ├── contact/              # Existing
│   │   ├── intake/               # Existing
│   │   ├── pipelines/            # Existing
│   │   └── users/                # Existing
│   ├── auth/                     # NEW: Auth pages
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── astralisops/              # Existing product page
│   ├── solutions/                # Existing
│   ├── layout.tsx                # Existing root layout
│   ├── page.tsx                  # Existing homepage
│   ├── globals.css               # Existing
│   ├── error.tsx                 # Existing
│   └── loading.tsx               # Existing
├── components/
│   ├── ui/                       # Existing (Button, Input, Card, etc.)
│   ├── auth/                     # NEW: Auth components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── OAuthButtons.tsx
│   ├── layout/                   # Existing (Navigation, Footer)
│   └── sections/                 # Existing
├── lib/
│   ├── auth/                     # NEW: Auth utilities
│   │   ├── config.ts            # NextAuth configuration
│   │   ├── session.ts           # Session utilities
│   │   └── rbac.ts              # RBAC utilities
│   ├── middleware/               # NEW: Middleware utilities
│   │   ├── auth.middleware.ts
│   │   └── rbac.middleware.ts
│   ├── services/                 # NEW: Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── activity-log.service.ts
│   ├── validators/               # NEW: Zod schemas
│   │   └── auth.validators.ts
│   ├── utils/
│   │   ├── crypto.ts            # NEW: Password hashing
│   │   └── email-templates.ts  # NEW: Email templates
│   ├── prisma.ts                 # Existing
│   ├── email.ts                  # Existing (extend for verification)
│   ├── calendar.ts               # Existing
│   └── utils.ts                  # Existing
├── types/
│   └── next-auth.d.ts            # NEW: NextAuth type extensions
└── middleware.ts                 # NEW: Root middleware for route protection
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
cd /home/deploy/astralis-nextjs

# Install NextAuth.js v5 and Prisma adapter
npm install next-auth@beta @auth/prisma-adapter

# Install password hashing library
npm install bcryptjs
npm install -D @types/bcryptjs

# Verify installation
npm list next-auth @auth/prisma-adapter bcryptjs
```

### Step 2: Create Prisma Migration

Create migration file:

```bash
npx prisma migrate dev --name add_auth_tables
```

This will:
1. Generate migration SQL based on schema changes
2. Apply migration to development database
3. Regenerate Prisma client

**Expected Output**:
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "astralis_one"

Applying migration `20250120120000_add_auth_tables`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250120120000_add_auth_tables/
      └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.8.0) to ./node_modules/@prisma/client
```

### Step 3: Create NextAuth Configuration

Create `src/lib/auth/config.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils/crypto";
import { loginSchema } from "@/lib/validators/auth.validators";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate input
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true }
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is disabled");
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          image: user.image,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
      }

      // Google OAuth - find or create organization
      if (account?.provider === "google" && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { organization: true }
        });

        if (dbUser) {
          token.orgId = dbUser.orgId;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow email verification without full profile
      if (account?.provider === "email") {
        return true;
      }

      // For OAuth, ensure user has organization
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
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

          await prisma.user.update({
            where: { id: dbUser!.id },
            data: { orgId: org.id, role: 'ADMIN' }
          });
        }

        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-in
      if (user.id) {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            orgId: user.orgId || '',
            action: 'LOGIN',
            entity: 'USER',
            entityId: user.id,
          }
        });
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

### Step 4: Create API Route for NextAuth

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export { GET, POST } from "@/lib/auth/config";
```

This single file exports both GET and POST handlers from the NextAuth configuration.

### Step 5: Create Password Hashing Utilities

Create `src/lib/utils/crypto.ts`:

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * @param password Plain text password
 * @param hash Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random token for email verification
 * @returns Random token string
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
```

### Step 6: Create Validation Schemas

Create `src/lib/validators/auth.validators.ts`:

```typescript
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  orgName: z.string().min(2, "Organization name required").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

### Step 7: Create Auth Service

Create `src/lib/services/auth.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/crypto';
import { generateToken } from '@/lib/utils/crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/utils/email-templates';
import { SignUpInput } from '@/lib/validators/auth.validators';

export class AuthService {
  /**
   * Register new user with organization
   */
  async signUp(data: SignUpInput) {
    const { email, password, name, orgName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name: orgName,
        }
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN', // First user is admin
          orgId: org.id,
          isActive: true,
        }
      });

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry,
        }
      });

      // Log account creation
      await tx.activityLog.create({
        data: {
          userId: user.id,
          orgId: org.id,
          action: 'CREATE',
          entity: 'USER',
          entityId: user.id,
          metadata: {
            email,
            name,
            source: 'SIGNUP',
          }
        }
      });

      return { user, org, verificationToken };
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return {
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      userId: result.user.id,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    if (new Date() > verificationToken.expires) {
      throw new Error('Verification token has expired');
    }

    // Update user email verification
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      }
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return {
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > verificationToken.expires) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}

export const authService = new AuthService();
```

### Step 8: Create Email Templates

Create `src/lib/utils/email-templates.ts`:

```typescript
import { sendEmail } from '@/lib/email';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Verify Your Email Address</h2>

        <p>Thank you for signing up for AstralisOps! Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verifyUrl}" style="color: #2B6CB0; word-break: break-all;">${verifyUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 24 hours.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't create an account with AstralisOps, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email Address

    Thank you for signing up for AstralisOps!

    Please verify your email address by visiting this link:
    ${verifyUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with AstralisOps, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - AstralisOps',
    html,
    text,
  });
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Reset Your Password</h2>

        <p>We received a request to reset your password. Click the button below to set a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2B6CB0; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This password reset link will expire in 1 hour.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Reset Your Password

    We received a request to reset your password.

    Visit this link to set a new password:
    ${resetUrl}

    This password reset link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - AstralisOps',
    html,
    text,
  });
}
```

### Step 9: Create Root Middleware for Route Protection

Create `src/middleware.ts` (in project root):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

// Routes that require authentication
const protectedRoutes = [
  '/astralisops/dashboard',
  '/astralisops/pipelines',
  '/astralisops/intake',
  '/astralisops/documents',
  '/astralisops/scheduling',
  '/astralisops/automations',
  '/astralisops/settings',
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session
  const session = await auth();

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to signin if accessing protected route without auth
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/astralisops/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### Step 10: Create RBAC Middleware

Create `src/lib/middleware/rbac.middleware.ts`:

```typescript
import { auth } from '@/lib/auth/config';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userRole = session.user.role as Role;
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    );
  }

  return null; // Allow request to continue
}

/**
 * Check if user belongs to specified organization
 */
export async function requireOrganization(orgId: string) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (session.user.orgId !== orgId) {
    return NextResponse.json(
      { error: 'Forbidden - access to other organizations not allowed' },
      { status: 403 }
    );
  }

  return null; // Allow request to continue
}

/**
 * Permission matrix
 */
export const permissions = {
  // User management
  'user:create': ['ADMIN'],
  'user:update': ['ADMIN'],
  'user:delete': ['ADMIN'],
  'user:view': ['ADMIN', 'OPERATOR'],

  // Pipeline management
  'pipeline:create': ['ADMIN'],
  'pipeline:update': ['ADMIN', 'OPERATOR'],
  'pipeline:delete': ['ADMIN'],
  'pipeline:view': ['ADMIN', 'OPERATOR'],

  // Intake management
  'intake:create': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'intake:update': ['ADMIN', 'OPERATOR'],
  'intake:delete': ['ADMIN'],
  'intake:view': ['ADMIN', 'OPERATOR', 'CLIENT'],

  // Document management
  'document:upload': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'document:view': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'document:delete': ['ADMIN', 'OPERATOR'],

  // Organization settings
  'org:settings': ['ADMIN'],
  'org:billing': ['ADMIN'],
};

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: keyof typeof permissions): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user) {
    return false;
  }

  const userRole = session.user.role as Role;
  const allowedRoles = permissions[permission];

  return allowedRoles.includes(userRole);
}
```

### Step 11: Create NextAuth Type Definitions

Create `src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      orgId: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    orgId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    orgId: string;
  }
}
```

### Step 12: Create Sign-Up Page

Create `src/app/auth/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpInput } from '@/lib/validators/auth.validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sign up failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <Alert variant="success" showIcon>
            <AlertTitle>Account Created!</AlertTitle>
            <AlertDescription>
              Please check your email to verify your account before signing in.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/auth/signin">
              <Button variant="outline">Go to Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-astralis-navy">Create Account</h1>
          <p className="text-slate-600 mt-2">Get started with AstralisOps</p>
        </div>

        {error && (
          <Alert variant="error" showIcon className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Min 8 characters, 1 uppercase, 1 number"
            />
          </div>

          <div>
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              {...register('orgName')}
              error={errors.orgName?.message}
              placeholder="Acme Inc."
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-astralis-blue hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 13: Create Sign-In Page

Create `src/app/auth/signin/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validators/auth.validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/astralisops/dashboard';

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError('An error occurred during sign in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      setError('An error occurred during Google sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-astralis-navy">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <Alert variant="error" showIcon className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-astralis-blue hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-astralis-blue hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Step 14: Create API Endpoint for Sign-Up

Create `src/app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    // Create account
    const result = await authService.signUp(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Sign up error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 15: Create Email Verification Page

Create `src/app/auth/verify-email/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      setStatus('success');
      setMessage(result.message);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue mx-auto"></div>
            <p className="mt-4 text-slate-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <Alert variant="success" showIcon>
            <AlertTitle>Email Verified!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <div className="mt-4">
              <Link href="/auth/signin">
                <Button variant="primary">Sign In</Button>
              </Link>
            </div>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="error" showIcon>
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            <div className="mt-4">
              <Link href="/auth/signup">
                <Button variant="outline">Sign Up Again</Button>
              </Link>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}
```

### Step 16: Create API Endpoint for Email Verification

Create `src/app/api/auth/verify-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const result = await authService.verifyEmail(token);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Testing Checklist

### Manual Testing Steps

**1. Sign Up Flow**:
- [ ] Navigate to `/auth/signup`
- [ ] Fill in all fields with valid data
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Check email inbox for verification email
- [ ] Click verification link
- [ ] Verify success message on verification page
- [ ] Verify user record created in database
- [ ] Verify organization created with user as ADMIN

**2. Email Verification**:
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Verify redirect to verification success page
- [ ] Check database: `emailVerified` timestamp set
- [ ] Check database: verification token deleted

**3. Sign In Flow**:
- [ ] Navigate to `/auth/signin`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify redirect to dashboard (Phase 2)
- [ ] Check database: `lastLoginAt` updated
- [ ] Check `ActivityLog` table: LOGIN action logged

**4. Google OAuth**:
- [ ] Click "Sign in with Google" button
- [ ] Complete Google OAuth flow
- [ ] Verify redirect to dashboard
- [ ] Check database: Account record created
- [ ] Check database: User linked to organization

**5. Password Reset**:
- [ ] Navigate to `/auth/forgot-password`
- [ ] Enter email address
- [ ] Submit form
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Submit form
- [ ] Verify success message
- [ ] Sign in with new password

**6. Protected Routes**:
- [ ] Sign out
- [ ] Try to access `/astralisops/dashboard` (Phase 2)
- [ ] Verify redirect to `/auth/signin`
- [ ] Verify `callbackUrl` parameter set
- [ ] Sign in
- [ ] Verify redirect back to dashboard

**7. RBAC**:
- [ ] Create users with different roles (ADMIN, OPERATOR, CLIENT)
- [ ] Test API endpoints with different roles
- [ ] Verify ADMIN can access all endpoints
- [ ] Verify OPERATOR has limited access
- [ ] Verify CLIENT has minimal access

### Database Verification

```sql
-- Check user created
SELECT * FROM "User" WHERE email = 'test@example.com';

-- Check organization created
SELECT * FROM "Organization" WHERE id = '<user-orgId>';

-- Check email verified
SELECT "emailVerified" FROM "User" WHERE email = 'test@example.com';

-- Check activity log
SELECT * FROM "ActivityLog" WHERE "userId" = '<user-id>' ORDER BY "createdAt" DESC;

-- Check sessions
SELECT * FROM "Session" WHERE "userId" = '<user-id>';

-- Check OAuth accounts
SELECT * FROM "Account" WHERE "userId" = '<user-id>';
```

---

## Handoff to Next Phase

### What's Complete

✅ **Authentication System**:
- NextAuth.js v5 configured with credentials + Google OAuth
- Sign-up, sign-in, sign-out flows working
- Email verification implemented
- Password reset implemented

✅ **Authorization System**:
- RBAC middleware created
- Permission matrix defined
- Protected route middleware working
- Organization context validation

✅ **Database**:
- Account, Session, VerificationToken tables added
- ActivityLog table for audit trail
- User model extended with auth fields
- All migrations applied

✅ **Email System**:
- Verification email templates
- Password reset email templates
- Email sending working via SMTP

✅ **Security**:
- Passwords hashed with bcrypt (12 rounds)
- Session tokens secure (HTTP-only cookies)
- CSRF protection via NextAuth
- Activity logging for all critical actions

### What's Next (Phase 2)

**Dashboard UI Development**:
- Create authenticated app shell layout
- Build dashboard sidebar with navigation
- Implement organization switcher
- Create dashboard overview page with stats
- Build Kanban board for pipeline management
- Create intake queue interface

**Data Fetching**:
- Set up TanStack Query for server state
- Create Zustand stores for client state
- Implement optimistic updates

**Components**:
- DashboardSidebar component
- StatsWidget components
- DataTable component with filters
- KanbanBoard with drag-and-drop

### Docker State

No changes to Docker setup in this phase.

**Current Containers**:
- `app`: Next.js application (includes new NextAuth routes)
- `postgres`: PostgreSQL 16 database (includes new auth tables)

### Environment Variables Added

```bash
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="<oauth-client-id>"
GOOGLE_CLIENT_SECRET="<oauth-client-secret>"
```

### Database Migrations

Migration created: `20250120120000_add_auth_tables`

**Tables Added**:
- Account
- Session
- VerificationToken
- ActivityLog

**Tables Modified**:
- User (added: emailVerified, password, image, isActive, lastLoginAt)

### Next Steps

1. Exit plan mode and proceed to Phase 2
2. Or test authentication system thoroughly
3. Or customize email templates
4. Or configure additional OAuth providers (Microsoft, GitHub)

---

## Troubleshooting

### Issue: "Invalid credentials" even with correct password

**Solution**: Check that password is being hashed correctly

```typescript
// Test password hashing
import { hashPassword, verifyPassword } from '@/lib/utils/crypto';

const password = 'TestPassword123';
const hashed = await hashPassword(password);
console.log('Hashed:', hashed);

const isValid = await verifyPassword(password, hashed);
console.log('Valid:', isValid); // Should be true
```

### Issue: Email verification link expired

**Solution**: Tokens expire after 24 hours. Request new verification email.

```typescript
// Resend verification email (add to auth service)
async resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    return { success: false, message: 'Invalid request' };
  }

  const token = generateToken();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  });

  await sendVerificationEmail(email, token);
  return { success: true, message: 'Verification email sent' };
}
```

### Issue: Google OAuth fails with redirect URI mismatch

**Solution**: Add redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
6. For production: `https://app.astralisone.com/api/auth/callback/google`

### Issue: Session not persisting across requests

**Solution**: Check NEXTAUTH_SECRET is set

```bash
# Verify environment variable
echo $NEXTAUTH_SECRET

# If empty, generate new secret
openssl rand -base64 32
```

### Issue: Database migration fails

**Solution**: Check PostgreSQL connection

```bash
# Test database connection
npx prisma db pull

# Reset database (DEVELOPMENT ONLY)
npx prisma migrate reset

# Reapply migrations
npx prisma migrate deploy
```

---

**END OF PHASE 1 DOCUMENTATION**

This documentation is complete and self-contained. Any AI session can use this document to implement Phase 1 without requiring prior conversation context.
