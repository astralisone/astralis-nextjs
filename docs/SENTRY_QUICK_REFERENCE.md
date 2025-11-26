# Sentry Quick Reference

Quick reference for common Sentry error monitoring patterns in Astralis One.

## Import Statement

```typescript
import {
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  withErrorTracking,
  withTransaction,
} from '@/lib/monitoring/sentry';
```

## Common Patterns

### 1. Basic Error Capture

```typescript
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    operation: 'operationName',
    userId: session.user.id,
    orgId: session.user.orgId,
  });
  throw error;
}
```

### 2. API Route Error Handling

```typescript
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // ... process ...
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    captureException(error, {
      operation: 'createResource',
      metadata: { requestBody: data },
      tags: { api: 'resource' },
    });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### 3. Set User Context (After Login)

```typescript
// In auth callback or after successful login
setUserContext({
  id: user.id,
  email: user.email,
  orgId: user.orgId,
  role: user.role,
});
```

### 4. Clear User Context (After Logout)

```typescript
// In logout handler
clearUserContext();
await signOut({ callbackUrl: '/auth/signin' });
```

### 5. Add Breadcrumbs

```typescript
addBreadcrumb('User clicked delete', 'action', {
  resourceId: id,
  resourceType: 'engagement',
});
```

### 6. Wrap Async Functions

```typescript
const result = await withErrorTracking(
  'createEngagement',
  () => engagementService.create(data),
  { userId: user.id, orgId: user.orgId }
);
```

### 7. Performance Monitoring

```typescript
const result = await withTransaction(
  'processLargeDataset',
  'data.processing',
  async (transaction) => {
    transaction.setTag('dataSize', data.length.toString());
    return await heavyProcessing(data);
  }
);
```

### 8. Capture Non-Error Events

```typescript
captureMessage('User attempted restricted action', 'warning', {
  userId: user.id,
  action: 'deleteProtectedResource',
});
```

### 9. Worker Error Handling

```typescript
// In BullMQ worker
export const processQueue = async (job: Job) => {
  try {
    await processJob(job.data);
  } catch (error) {
    captureException(error, {
      operation: 'processQueue',
      metadata: {
        jobId: job.id,
        jobData: job.data,
        attemptsMade: job.attemptsMade,
      },
      tags: { queue: 'engagement-processing' },
    });
    throw error;
  }
};
```

### 10. Service Layer Error Handling

```typescript
// In service class
async createEngagement(data: EngagementData) {
  return withErrorTracking(
    'EngagementService.create',
    async () => {
      addBreadcrumb('Creating engagement', 'service', { data });

      const engagement = await prisma.engagement.create({ data });

      addBreadcrumb('Engagement created', 'service', {
        id: engagement.id,
      });

      return engagement;
    },
    { metadata: { companyId: data.companyId } }
  );
}
```

## Environment Variables

```bash
# Required
SENTRY_DSN="https://xxx@o0.ingest.sentry.io/0"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@o0.ingest.sentry.io/0"

# For source maps
SENTRY_AUTH_TOKEN="your-token"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"

# Optional
SENTRY_DEBUG="false"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## Testing in Development

```bash
# Enable Sentry in development
echo 'SENTRY_DEBUG="true"' >> .env.local

# Restart dev server
npm run dev
```

## Common Error Contexts

```typescript
// Authentication errors
{ operation: 'login', userId: user.id }

// API errors
{ operation: 'apiEndpoint', tags: { endpoint: '/api/resource' } }

// Database errors
{ operation: 'dbQuery', metadata: { query: 'SELECT ...' } }

// Worker errors
{ operation: 'workerJob', metadata: { jobId, queue, attempts } }

// Webhook errors
{ operation: 'webhookHandler', metadata: { source, payload } }
```

## Filter Sensitive Data

```typescript
// In sentry.client.config.ts or sentry.server.config.ts
beforeSend(event, hint) {
  // Remove sensitive data
  if (event.request?.data) {
    delete event.request.data.password;
    delete event.request.data.token;
    delete event.request.data.apiKey;
  }
  return event;
}
```

## Useful Links

- Full Documentation: `/docs/SENTRY_SETUP.md`
- Sentry Dashboard: `https://sentry.io/organizations/[your-org]/issues/`
- Utility Source: `/src/lib/monitoring/sentry.ts`
- Error Handling: `/src/lib/queries/error-handling.ts`

## Support

For detailed examples and troubleshooting, see `/docs/SENTRY_SETUP.md`.
