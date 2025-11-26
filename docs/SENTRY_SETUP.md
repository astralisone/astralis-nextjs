# Sentry Error Monitoring Setup Guide

This guide walks through setting up Sentry error monitoring for the Astralis One platform (Phase 3: Task 3.4).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

Sentry provides real-time error tracking and performance monitoring for the Astralis One platform. It captures:

- **Client-side errors**: JavaScript errors in the browser
- **Server-side errors**: API errors, server-side rendering errors
- **Edge runtime errors**: Middleware and edge function errors
- **Performance data**: Transaction traces, slow queries
- **Session replays**: Video-like recordings of user sessions with errors

## Prerequisites

- Node.js 18+ and npm
- Astralis One project cloned and set up
- Sentry account (free tier available at https://sentry.io/signup/)

## Installation

### Step 1: Create Sentry Project

1. Sign up or log in at https://sentry.io
2. Create a new project:
   - Platform: **Next.js**
   - Alert frequency: **On every new issue** (recommended for production)
   - Name: `astralis-nextjs` (or your preferred name)
3. Keep the setup page open - you'll need the DSN

### Step 2: Install Sentry Package

```bash
cd /home/user/astralis-nextjs
npm install @sentry/nextjs --legacy-peer-deps
```

### Step 3: Run Sentry Wizard

The wizard will automatically configure most files:

```bash
npx @sentry/wizard@latest -i nextjs
```

The wizard will:
- Create or update `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Update `next.config.mjs` with Sentry webpack plugin
- Add `SENTRY_DSN` to your `.env.local`

**Note**: Our pre-configured files may be overwritten by the wizard. Review changes before committing.

### Step 4: Add Environment Variables

Copy the template values to your `.env.local`:

```bash
# Sentry DSN (from Sentry project settings)
SENTRY_DSN="https://[PUBLIC_KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]"
NEXT_PUBLIC_SENTRY_DSN="https://[PUBLIC_KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]"

# Sentry Auth Token (for source maps upload)
SENTRY_AUTH_TOKEN="your-auth-token-here"

# Organization and project slugs
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="astralis-nextjs"

# Optional: Enable in development for testing
SENTRY_DEBUG="false"

# Optional: Release tracking
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Step 5: Generate Auth Token

To upload source maps (improves error debugging):

1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Name: `Astralis NextJS Source Maps`
4. Scopes: Select `project:releases` and `org:read`
5. Copy token to `SENTRY_AUTH_TOKEN` in `.env.local`

### Step 6: Update next.config.mjs

Uncomment the Sentry wrapper at the bottom of `next.config.mjs`:

```javascript
import { withSentryConfig } from '@sentry/nextjs';

// ... existing nextConfig ...

export default withSentryConfig(nextConfig, {
  silent: true, // Suppresses all logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better error tracking
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
});
```

## Configuration

### Client Configuration (`sentry.client.config.ts`)

Already configured with:
- Performance monitoring (10% sample rate in production)
- Session replay (10% normal, 100% on error)
- Error filtering (browser extensions, chunk loading errors)
- Custom beforeSend hook for filtering

### Server Configuration (`sentry.server.config.ts`)

Already configured with:
- Performance monitoring (10% sample rate)
- Console error capture
- Unhandled promise rejection capture
- Server context (Node.js version, platform)

### Edge Configuration (`sentry.edge.config.ts`)

Minimal configuration for Edge Runtime (middleware, edge functions).

### Utility Functions (`src/lib/monitoring/sentry.ts`)

Pre-built helpers for common use cases:

- `captureException(error, context)` - Capture errors with context
- `captureMessage(message, level, context)` - Log non-error events
- `setUserContext(user)` - Associate errors with users
- `clearUserContext()` - Clear user context on logout
- `addBreadcrumb(message, category, data)` - Add debugging breadcrumbs
- `withErrorTracking(operation, fn, context)` - Wrap async functions
- `withTransaction(name, op, callback)` - Performance monitoring

## Usage Examples

### Basic Error Capture

```typescript
import { captureException } from '@/lib/monitoring/sentry';

try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    operation: 'riskyOperation',
    userId: session.user.id,
    orgId: session.user.orgId,
  });
  throw error;
}
```

### API Route Error Handling

```typescript
// src/app/api/engagements/route.ts
import { captureException } from '@/lib/monitoring/sentry';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // ... validation ...
    const engagement = await prisma.engagement.create({ data });
    return NextResponse.json(engagement, { status: 201 });
  } catch (error) {
    captureException(error, {
      operation: 'createEngagement',
      metadata: { requestBody: data },
      tags: { api: 'engagements' },
    });
    return NextResponse.json(
      { error: 'Failed to create engagement' },
      { status: 500 }
    );
  }
}
```

### User Context (After Login)

```typescript
// src/app/auth/signin/page.tsx
import { setUserContext } from '@/lib/monitoring/sentry';

async function handleSignIn(credentials: Credentials) {
  const session = await signIn('credentials', credentials);

  if (session?.user) {
    setUserContext({
      id: session.user.id,
      email: session.user.email,
      orgId: session.user.orgId,
      role: session.user.role,
    });
  }
}
```

### User Context (After Logout)

```typescript
// src/components/auth/LogoutButton.tsx
import { clearUserContext } from '@/lib/monitoring/sentry';

async function handleLogout() {
  clearUserContext();
  await signOut({ callbackUrl: '/auth/signin' });
}
```

### Breadcrumbs for Debugging

```typescript
import { addBreadcrumb } from '@/lib/monitoring/sentry';

function handleDeleteEngagement(id: string) {
  addBreadcrumb('User initiated delete', 'action', {
    engagementId: id,
    timestamp: new Date().toISOString(),
  });

  // ... perform delete ...
}
```

### Wrap Async Functions

```typescript
import { withErrorTracking } from '@/lib/monitoring/sentry';

async function createEngagement(data: EngagementData) {
  return withErrorTracking(
    'createEngagement',
    () => engagementService.create(data),
    { userId: session.user.id }
  );
}
```

### Performance Monitoring

```typescript
import { withTransaction } from '@/lib/monitoring/sentry';

async function processLargeDataset(data: Data[]) {
  return withTransaction(
    'processLargeDataset',
    'data.processing',
    async (transaction) => {
      transaction.setTag('dataSize', data.length.toString());

      const result = await heavyProcessing(data);

      transaction.setData('processedCount', result.length);
      return result;
    }
  );
}
```

### Error Handling Utility Integration

The error handling utility (`src/lib/queries/error-handling.ts`) is already integrated:

```typescript
import { logError, parseApiError } from '@/lib/queries/error-handling';

try {
  const response = await fetch('/api/engagements');
  if (!response.ok) throw response;
} catch (error) {
  const apiError = parseApiError(error);
  logError(apiError, 'fetchEngagements'); // Automatically sends to Sentry in production
}
```

## Testing

### Test in Development

Enable Sentry in development to test integration:

```bash
# In .env.local
SENTRY_DEBUG="true"
```

### Trigger Test Error

Create a test endpoint:

```typescript
// src/app/api/test/sentry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { captureException, captureMessage } from '@/lib/monitoring/sentry';

export async function GET(req: NextRequest) {
  // Test message
  captureMessage('Sentry test message', 'info');

  // Test error
  try {
    throw new Error('Sentry test error');
  } catch (error) {
    captureException(error, {
      operation: 'testSentry',
      metadata: { source: 'test-endpoint' },
    });
  }

  return NextResponse.json({ message: 'Test errors sent to Sentry' });
}
```

Visit: http://localhost:3001/api/test/sentry

Check Sentry dashboard: https://sentry.io/organizations/[your-org]/issues/

### Test User Context

```typescript
// After login
import { setUserContext } from '@/lib/monitoring/sentry';

setUserContext({
  id: 'test-user-id',
  email: 'test@example.com',
  orgId: 'test-org-id',
  role: 'ADMIN',
});

// Trigger error - should show user context in Sentry
throw new Error('Test error with user context');
```

## Production Deployment

### Step 1: Set Production Environment Variables

On your production server (DigitalOcean):

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Navigate to project
cd /home/deploy/astralis-nextjs

# Edit .env.local (or use environment variables in your deployment system)
nano .env.local
```

Add the same Sentry variables from development.

### Step 2: Build with Source Maps

```bash
# On production server
npm run build
```

Source maps will be automatically uploaded to Sentry during build (if `SENTRY_AUTH_TOKEN` is set).

### Step 3: Restart Application

```bash
npm run prod:reload
```

### Step 4: Verify Integration

1. Check Sentry dashboard for "Release" created with your version
2. Check that source maps were uploaded (Settings > Source Maps)
3. Monitor for errors in real-time

## Troubleshooting

### Source Maps Not Uploading

**Problem**: Errors in Sentry show minified code, not original source.

**Solution**:
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check token has `project:releases` scope
3. Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry account
4. Run `npm run build` and check for Sentry upload logs

### Too Many Errors

**Problem**: Sentry quota exceeded due to high error volume.

**Solution**:
1. Lower `tracesSampleRate` in config files (e.g., 0.05 = 5%)
2. Add more errors to `ignoreErrors` array in `sentry.client.config.ts`
3. Use `beforeSend` hook to filter errors:

```typescript
beforeSend(event, hint) {
  // Filter out specific errors
  if (event.exception?.values?.[0]?.type === 'SpecificError') {
    return null; // Don't send to Sentry
  }
  return event;
}
```

### Errors Not Appearing in Development

**Problem**: No errors showing in Sentry when testing locally.

**Solution**:
1. Set `SENTRY_DEBUG="true"` in `.env.local`
2. Check browser console for Sentry initialization logs
3. Verify `NEXT_PUBLIC_SENTRY_DSN` is set (must have `NEXT_PUBLIC_` prefix)

### Build Fails After Installing Sentry

**Problem**: Build fails with Sentry-related errors.

**Solution**:
1. Ensure `@sentry/nextjs` is installed: `npm install @sentry/nextjs --legacy-peer-deps`
2. Check that config files exist: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
3. If issues persist, comment out Sentry wrapper in `next.config.mjs` temporarily

### Performance Impact

**Problem**: Application feels slower after enabling Sentry.

**Solution**:
1. Lower `tracesSampleRate` to 0.1 or less
2. Disable session replay in production:

```typescript
replaysSessionSampleRate: 0, // Disable normal session replay
replaysOnErrorSampleRate: 1.0, // Keep error session replay
```

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)

## Support

For issues or questions:
- Check Sentry documentation: https://docs.sentry.io
- Contact Astralis One engineering team
- Review implementation in Phase 3: Task 3.4
