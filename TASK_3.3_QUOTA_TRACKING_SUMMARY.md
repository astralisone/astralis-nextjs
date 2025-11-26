# Task 3.3: Quota Tracking by Plan - Implementation Summary

## Overview
Successfully implemented organization-level quota tracking with plan-based usage limits. The system supports FREE, STARTER, PROFESSIONAL, and ENTERPRISE plan tiers with configurable resource quotas.

## Implementation Status: COMPLETE ✅

---

## 1. Database Schema Changes

### Added PlanType Enum
**Location:** `/home/user/astralis-nextjs/prisma/schema.prisma` (lines 1801-1806)

```prisma
enum PlanType {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

### Updated Organization Model
**Location:** `/home/user/astralis-nextjs/prisma/schema.prisma` (lines 1081-1106)

Added fields:
- `plan`: PlanType enum (default: FREE)
- `quotaResetAt`: DateTime for tracking monthly quota reset periods
- Index on `plan` field for query optimization

### Migration File
**Location:** `/home/user/astralis-nextjs/prisma/migrations/20251126000001_add_plan_type_and_quota/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN "plan" "PlanType" NOT NULL DEFAULT 'FREE';
ALTER TABLE "organization" ADD COLUMN "quotaResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "organization_plan_idx" ON "organization"("plan");
```

**Note:** Migration will be applied when database is available. Prisma client has been regenerated with new types.

---

## 2. Quota Service Implementation

### File: `/home/user/astralis-nextjs/src/lib/services/quota.service.ts`
**Size:** 8.1 KB

#### Plan Limits Configuration

| Plan | Intakes/month | Pipelines | Documents | Users | Storage (MB) |
|------|---------------|-----------|-----------|-------|--------------|
| FREE | 10 | 5 | 100 | 3 | 100 |
| STARTER | 100 | 20 | 1,000 | 10 | 1,000 |
| PROFESSIONAL | 1,000 | Unlimited | 10,000 | 50 | 10,000 |
| ENTERPRISE | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

**Note:** -1 indicates unlimited resources

#### Key Methods

1. **`checkQuota(orgId, resource)`**
   - Checks if organization has quota available for a resource
   - Returns: `{ allowed: boolean, current: number, limit: number, remaining: number }`
   - Handles unlimited resources (-1) correctly

2. **`getUsage(orgId, resource, since?)`**
   - Calculates current usage for a resource
   - For monthly quotas (intakes): counts from `quotaResetAt`
   - For total limits (pipelines, documents, users): counts all active resources
   - For storage: aggregates file sizes and converts to MB

3. **`getAllUsage(orgId)`**
   - Returns usage summary for all resources
   - Format: `Record<resource, { current: number, limit: number }>`

4. **`enforceQuota(orgId, resource)`**
   - Throws `QuotaExceededError` if quota is exceeded
   - Used before creating new resources (intake requests, documents, etc.)

5. **`resetMonthlyQuotas()`**
   - Resets `quotaResetAt` for organizations where 30+ days have passed
   - Should be called by scheduled job (cron/BullMQ)

6. **`checkQuotaWarnings(orgId)`**
   - Returns resources at 80%+ usage
   - Useful for proactive notifications

7. **`updatePlan(orgId, plan)`**
   - Updates organization plan and resets quota counter

#### Custom Error Class

```typescript
export class QuotaExceededError extends Error {
  constructor(resource: string, limit: number) {
    super(`Quota exceeded for ${resource}. Limit: ${limit}`);
    this.name = 'QuotaExceededError';
  }
}
```

---

## 3. API Endpoint

### Route: `GET /api/organization/quota`
**File:** `/home/user/astralis-nextjs/src/app/api/organization/quota/route.ts`
**Size:** 1.9 KB

#### Authentication
- Requires valid session with `orgId`
- Returns 401 if unauthorized

#### Response Format

```json
{
  "usage": {
    "intakes": { "current": 5, "limit": 10 },
    "pipelines": { "current": 2, "limit": 5 },
    "documents": { "current": 45, "limit": 100 },
    "users": { "current": 2, "limit": 3 },
    "storage": { "current": 25, "limit": 100 }
  },
  "warnings": [
    {
      "resource": "documents",
      "current": 45,
      "limit": 100,
      "percentUsed": 85.5
    }
  ],
  "hasWarnings": true
}
```

#### Error Handling
- 401: Unauthorized (no session or orgId)
- 500: Internal server error (with error message)

---

## 4. Updated Existing Service

### File: `/home/user/astralis-nextjs/src/lib/services/quotaTracking.service.ts`

#### Changes Made

1. **Added FREE plan limits** (lines 33-38):
   ```typescript
   free: {
     intake: 10,
     documents: 50,
     teamMembers: 2,
     pipelines: 2,
   }
   ```

2. **Updated `getOrgPlan()` method** (lines 121-139):
   - Now retrieves `plan` field from database
   - Converts PlanType enum to lowercase string for compatibility
   - Removed TODO comment and hardcoded 'starter' default

---

## 5. Testing

### Test File: `/home/user/astralis-nextjs/src/lib/services/__tests__/quota.service.test.ts`

#### Test Coverage

1. **Plan Limits Configuration**
   - Verifies correct limits for FREE, STARTER, PROFESSIONAL, ENTERPRISE plans

2. **QuotaExceededError**
   - Tests error creation with correct message and properties

3. **checkQuota()**
   - Tests unlimited status for ENTERPRISE plan
   - Tests quota checking for FREE plan within limits
   - Tests quota checking when exceeded

4. **enforceQuota()**
   - Tests that it doesn't throw when quota is available
   - Tests that it throws QuotaExceededError when exceeded

5. **checkQuotaWarnings()**
   - Tests warning generation at 80%+ usage

**Note:** Tests use Jest mocking for Prisma client

---

## 6. Usage Examples

### Check Quota Before Creating Resource

```typescript
import { quotaService } from '@/lib/services/quota.service';

// Before creating an intake request
try {
  await quotaService.enforceQuota(orgId, 'intakes');

  // Quota available, proceed with creation
  const intake = await prisma.intakeRequest.create({
    data: { /* ... */ }
  });
} catch (error) {
  if (error instanceof QuotaExceededError) {
    return NextResponse.json(
      { error: 'Monthly intake quota exceeded. Please upgrade your plan.' },
      { status: 403 }
    );
  }
  throw error;
}
```

### Display Quota in Dashboard

```typescript
import { quotaService } from '@/lib/services/quota.service';

export async function getQuotaStats(orgId: string) {
  const usage = await quotaService.getAllUsage(orgId);
  const warnings = await quotaService.checkQuotaWarnings(orgId);

  return {
    usage,
    warnings,
    hasWarnings: warnings.length > 0
  };
}
```

### Upgrade Organization Plan

```typescript
import { quotaService } from '@/lib/services/quota.service';
import { PlanType } from '@prisma/client';

export async function upgradePlan(orgId: string, newPlan: PlanType) {
  await quotaService.updatePlan(orgId, newPlan);

  // Optionally log activity
  await prisma.activityLog.create({
    data: {
      orgId,
      action: 'UPDATE',
      entity: 'ORGANIZATION',
      entityId: orgId,
      changes: { plan: newPlan }
    }
  });
}
```

### Scheduled Monthly Reset (BullMQ/Cron)

```typescript
import { quotaService } from '@/lib/services/quota.service';

// Run this daily or weekly
export async function resetExpiredQuotas() {
  await quotaService.resetMonthlyQuotas();
  console.log('Monthly quotas reset for organizations with expired periods');
}
```

---

## 7. Integration Points

### Where to Enforce Quotas

1. **Intake Request Creation** (`POST /api/intake`)
   ```typescript
   await quotaService.enforceQuota(orgId, 'intakes');
   ```

2. **Document Upload** (`POST /api/documents/upload`)
   ```typescript
   await quotaService.enforceQuota(orgId, 'documents');
   await quotaService.enforceQuota(orgId, 'storage');
   ```

3. **Pipeline Creation** (`POST /api/pipelines`)
   ```typescript
   await quotaService.enforceQuota(orgId, 'pipelines');
   ```

4. **User Invitation** (`POST /api/organization/users`)
   ```typescript
   await quotaService.enforceQuota(orgId, 'users');
   ```

### Frontend Integration

```typescript
// Fetch quota data in dashboard
const response = await fetch('/api/organization/quota');
const { usage, warnings } = await response.json();

// Display quota meters
<QuotaMeter
  label="Intake Requests"
  current={usage.intakes.current}
  limit={usage.intakes.limit}
  unlimited={usage.intakes.limit === -1}
/>
```

---

## 8. Next Steps

### Required Actions

1. **Apply Database Migration**
   ```bash
   npx prisma migrate deploy
   ```
   This will create the PlanType enum and add plan/quotaResetAt fields.

2. **Update Existing Organizations**
   ```sql
   -- Set plan for existing orgs (default is FREE)
   UPDATE organization SET plan = 'STARTER' WHERE id IN ('org1', 'org2');
   ```

3. **Enforce Quotas in API Routes**
   - Add `enforceQuota()` calls before creating resources
   - Return 403 Forbidden with upgrade message when exceeded

4. **Setup Monthly Reset Job**
   - Create BullMQ job to call `resetMonthlyQuotas()` daily
   - Or use cron job: `0 0 * * * node scripts/reset-quotas.js`

5. **Create Frontend Quota UI**
   - Dashboard widget showing usage meters
   - Warning banners at 80%+ usage
   - Upgrade prompts when quota exceeded

6. **Add Activity Logging**
   - Log plan changes to ActivityLog
   - Log quota exceeded events for analytics

### Optional Enhancements

1. **Soft Limits vs Hard Limits**
   - Add `softLimit` at 80% with warnings
   - Add `hardLimit` at 100% with enforcement

2. **Grace Period**
   - Allow 10% overage with warning before blocking

3. **Email Notifications**
   - Send email at 80%, 90%, 100% usage
   - Weekly digest of quota status

4. **Analytics Dashboard**
   - Track quota trends over time
   - Predict when quotas will be exceeded

5. **Self-Service Upgrade**
   - Stripe integration for plan upgrades
   - Immediate quota increase upon payment

---

## 9. Files Modified/Created

### Created Files (3)
1. `/home/user/astralis-nextjs/src/lib/services/quota.service.ts` (8.1 KB)
2. `/home/user/astralis-nextjs/src/app/api/organization/quota/route.ts` (1.9 KB)
3. `/home/user/astralis-nextjs/prisma/migrations/20251126000001_add_plan_type_and_quota/migration.sql`
4. `/home/user/astralis-nextjs/src/lib/services/__tests__/quota.service.test.ts` (test file)

### Modified Files (2)
1. `/home/user/astralis-nextjs/prisma/schema.prisma`
   - Added PlanType enum (lines 1801-1806)
   - Updated organization model (added plan, quotaResetAt fields, index)

2. `/home/user/astralis-nextjs/src/lib/services/quotaTracking.service.ts`
   - Added FREE plan limits
   - Updated getOrgPlan() to use database plan field

---

## 10. Acceptance Criteria Checklist

- ✅ Add PlanType enum to Prisma schema
- ✅ Add plan field to Organization model
- ✅ Create QuotaService with checkQuota() and getUsage()
- ✅ Define limits for FREE, STARTER, PROFESSIONAL, ENTERPRISE
- ✅ Create API endpoint for quota info
- ✅ Handle unlimited (-1) correctly
- ✅ Support monthly quota resets for intakes
- ✅ Created migration file for schema changes
- ✅ Updated existing quotaTracking.service.ts to use plan field
- ✅ Added comprehensive error handling
- ✅ Created unit tests for quota service

---

## 11. Security Considerations

1. **Authorization**
   - API endpoint checks session.user.orgId
   - Users can only view their own organization's quotas
   - Plan changes should require ADMIN role (not implemented yet)

2. **Input Validation**
   - Zod schema validation for plan updates (recommended)
   - Validate resource names against allowed types

3. **Rate Limiting**
   - Consider rate limiting quota API endpoint
   - Prevent quota check spamming

4. **Audit Trail**
   - Log all plan changes to ActivityLog
   - Track quota exceeded events

---

## Summary

Task 3.3 has been successfully implemented with a comprehensive quota tracking system. The implementation includes:

- **Database schema updates** with PlanType enum and organization fields
- **QuotaService** with full quota checking, enforcement, and management
- **REST API endpoint** for frontend quota display
- **Updated existing service** to use database plan field
- **Test coverage** for core functionality
- **Migration file** ready for deployment

The system is production-ready pending database migration and frontend integration. All acceptance criteria have been met, with additional features like quota warnings, monthly resets, and comprehensive error handling.

**Next Immediate Steps:**
1. Apply database migration: `npx prisma migrate deploy`
2. Enforce quotas in API routes (intake, documents, pipelines, users)
3. Build frontend quota dashboard widget
4. Setup scheduled job for monthly quota resets

---

**Implementation Date:** November 26, 2025
**Status:** COMPLETE ✅
**Backend Agent:** Astralis Backend API Agent
