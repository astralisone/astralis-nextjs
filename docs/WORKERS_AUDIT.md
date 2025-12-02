# Workers Multi-Tenant orgId Enforcement Audit

**Date**: 2025-12-02
**Status**: CRITICAL VULNERABILITIES FOUND AND FIXED

## Executive Summary

Audited all background workers in `/src/workers/processors/` for multi-tenant isolation enforcement. Found **5 workers with critical security gaps** where orgId was either missing from job data or not being enforced in database queries.

**Risk**: Without proper orgId enforcement, workers could potentially access or modify data across organization boundaries, leading to data leakage or corruption.

## Workers Audited

| Worker | Job Interface | orgId Present | orgId Enforced | Status |
|--------|--------------|---------------|----------------|--------|
| ocr.processor.ts | DocumentProcessingJobData | YES | NO | FIXED |
| embedding.processor.ts | DocumentEmbeddingJobData | YES | NO | FIXED |
| intakeRouting.processor.ts | IntakeRoutingJobData | YES | YES | PASS |
| schedulingAgent.processor.ts | SchedulingAgentJobData | YES (optional) | PARTIAL | FIXED |
| schedulingReminder.processor.ts | ReminderJobData | NO | N/A | FIXED |
| calendarSync.processor.ts | CalendarSyncJobData | NO (userId only) | NO | FIXED |
| slaMonitor.processor.ts | SLAMonitorJobData | YES | YES | PASS |

## Critical Findings

### 1. OCR Processor (ocr.processor.ts)
**Issue**: Job data includes `orgId` but ALL database queries ignore it.

**Vulnerable Code**:
```typescript
const document = await prisma.document.findUnique({
  where: { id: documentId },
});
```

**Risk**: Worker could process documents from ANY organization, not just the one that queued the job.

**Fix Applied**: Added orgId validation and defense-in-depth filtering:
```typescript
// Validate orgId
if (!orgId) {
  throw new Error('orgId is required for multi-tenant isolation');
}

// Get document with orgId filter
const document = await prisma.document.findFirst({
  where: {
    id: documentId,
    orgId: orgId, // Defense in depth
  },
});

if (!document) {
  throw new Error('Document not found or access denied');
}
```

### 2. Embedding Processor (embedding.processor.ts)
**Issue**: Job data includes `orgId` but it's only used in `storeEmbeddings()`, not for fetching the document.

**Vulnerable Code**:
```typescript
const document = await prisma.document.findUnique({
  where: { id: documentId },
});
```

**Risk**: Could generate embeddings for documents from other organizations.

**Fix Applied**: Added orgId validation and filtering:
```typescript
if (!orgId) {
  throw new Error('orgId is required for multi-tenant isolation');
}

const document = await prisma.document.findFirst({
  where: {
    id: documentId,
    orgId: orgId,
  },
});

if (!document) {
  throw new Error('Document not found or access denied');
}
```

### 3. Scheduling Agent Processor (schedulingAgent.processor.ts)
**Issue**: `orgId` is optional in all job data interfaces and not consistently enforced.

**Vulnerable Code**:
```typescript
export interface ProcessInboxJobData {
  taskId: string;
  orgId?: string; // Optional!
  userId: string;
  priority?: number;
}
```

**Risk**: Tasks could be fetched without orgId verification.

**Fix Applied**:
- Made `orgId` **required** in ProcessInboxJobData
- Added orgId validation and enforcement in processInbox()
- Added orgId filtering to task queries

### 4. Scheduling Reminder Processor (schedulingReminder.processor.ts)
**Issue**: Job data does NOT include `orgId` at all. Relies on nested relationships.

**Vulnerable Code**:
```typescript
export interface ReminderJobData {
  reminderId: string;
  eventId: string;
  // NO orgId!
}
```

**Risk**: While the nested `event.organization` relationship provides some protection, there's no explicit validation that the reminder belongs to the expected organization.

**Fix Applied**:
- Added `orgId` to ReminderJobData interface
- Added orgId validation in processor
- Added defense-in-depth filtering to reminder fetch

### 5. Calendar Sync Processor (calendarSync.processor.ts)
**Issue**: Job data only includes `userId`, not `orgId`. No org-level validation.

**Vulnerable Code**:
```typescript
export interface CalendarSyncJobData {
  connectionId: string;
  userId: string; // Only userId!
  syncType: 'full' | 'incremental';
}
```

**Risk**: While userId provides some isolation, organization-level enforcement is missing.

**Fix Applied**:
- Added `orgId` to CalendarSyncJobData interface
- Added orgId validation in processor
- Added orgId filtering to connection fetch

### 6. SLA Monitor Processor (slaMonitor.processor.ts)
**Status**: PASS - Already correctly implemented.

**Good Code**:
```typescript
export interface SLAMonitorJobData {
  orgId?: string; // Optional to allow checking all orgs
  taskId?: string;
}

// When orgId provided, it's used correctly:
const summary = await slaService.checkAllPendingTasks(orgId);
```

**Notes**: This worker is designed to optionally check all organizations (for admin/cron jobs), so optional orgId is acceptable. When provided, it's enforced correctly.

### 7. Intake Routing Processor (intakeRouting.processor.ts)
**Status**: PASS - Already correctly implemented.

**Good Code**:
```typescript
export interface IntakeRoutingJobData {
  intakeRequestId: string;
  orgId: string; // Required!
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  // ...
}

// Used correctly in queries:
const pipelines = await prisma.pipeline.findMany({
  where: {
    orgId: orgId,
    isActive: true,
  },
});
```

## Security Best Practices Applied

### 1. Defense in Depth
Always filter by orgId even when using unique IDs:
```typescript
// GOOD: Defense in depth
const document = await prisma.document.findFirst({
  where: {
    id: documentId,
    orgId: orgId, // Extra layer of protection
  },
});

// BAD: Assumes documentId is globally unique
const document = await prisma.document.findUnique({
  where: { id: documentId },
});
```

### 2. Explicit Validation
Always validate orgId exists before processing:
```typescript
if (!orgId) {
  throw new Error('orgId is required for multi-tenant isolation');
}
```

### 3. Clear Error Messages
Don't leak information about whether a resource exists in another org:
```typescript
if (!document) {
  throw new Error('Document not found or access denied');
  // NOT: 'Document not found' vs 'Access denied'
}
```

## Changes Made

### Modified Files

1. **/src/workers/processors/ocr.processor.ts**
   - Added orgId validation at start of processor
   - Changed `findUnique` to `findFirst` with orgId filter
   - Updated error messages for security

2. **/src/workers/processors/embedding.processor.ts**
   - Added orgId validation at start of processor
   - Changed `findUnique` to `findFirst` with orgId filter
   - Updated error messages for security

3. **/src/workers/processors/schedulingAgent.processor.ts**
   - Made `orgId` required in ProcessInboxJobData
   - Added orgId validation in processInbox()
   - Added orgId filter to task fetch queries

4. **/src/workers/queues/schedulingReminders.queue.ts**
   - Added `orgId: string` to ReminderJobData interface

5. **/src/workers/processors/schedulingReminder.processor.ts**
   - Added orgId validation
   - Added orgId filter to reminder fetch
   - Updated error handling

6. **/src/workers/queues/calendarSync.queue.ts**
   - Added `orgId: string` to CalendarSyncJobData interface

7. **/src/workers/processors/calendarSync.processor.ts**
   - Added orgId validation
   - Added orgId filter to connection fetch
   - Updated error handling

8. **/src/workers/queues/schedulingAgent.queue.ts**
   - Made `orgId` required (non-optional) in ProcessInboxJobData

## Testing Recommendations

1. **Unit Tests**: Create tests that attempt to access resources from different organizations
2. **Integration Tests**: Verify workers reject jobs with missing orgId
3. **Penetration Tests**: Attempt to queue jobs with mismatched orgId values

## Compliance Status

- **BEFORE**: 2/7 workers (28.6%) properly enforced multi-tenant isolation
- **AFTER**: 7/7 workers (100%) enforce multi-tenant isolation

## Future Recommendations

1. **Type System Enforcement**: Consider creating a branded type for orgId that can't be accidentally omitted:
   ```typescript
   type OrgId = string & { readonly __brand: 'OrgId' };
   ```

2. **Shared Validation Helper**: Extract orgId validation to a shared utility:
   ```typescript
   // src/lib/workers/validation.ts
   export function validateOrgId(orgId: string | undefined): asserts orgId is string {
     if (!orgId) {
       throw new Error('orgId is required for multi-tenant isolation');
     }
   }
   ```

3. **Database-Level Constraints**: Add Row-Level Security (RLS) policies in PostgreSQL for additional protection

4. **Audit Logging**: Log all worker operations with orgId for forensic analysis

5. **Monitoring**: Set up alerts for workers that fail orgId validation checks

## Conclusion

All workers have been updated to enforce multi-tenant isolation through required `orgId` validation and defense-in-depth filtering. This eliminates the risk of cross-tenant data access through background job processing.

**Status**: COMPLETE - All critical security vulnerabilities have been addressed.
