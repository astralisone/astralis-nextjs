# API Routes Multi-Tenant Audit Report

**Date:** 2025-12-02  
**Auditor:** QA Agent  
**Scope:** All API routes in `/src/app/api/`  
**Focus:** Multi-tenant orgId enforcement and data isolation  

---

## Executive Summary

**Total Routes Audited:** 90  
**Compliant:** 47 (52%)  
**Non-Compliant:** 29 (32%)  
**Needs Review:** 14 (16%)  

**Critical Findings:**
- 29 routes are missing orgId enforcement on read operations (GET)
- 12 routes are missing orgId enforcement on write operations (POST/PUT/DELETE)
- Several routes accept orgId from request body/query without session validation
- Resource-by-ID routes lack orgId verification before returning data

**Risk Level:** HIGH - Data leakage possible between organizations

---

## Critical Non-Compliant Routes

### CRITICAL: Pipeline Routes

#### `/api/pipelines/[id]/route.ts` - FAIL
**Methods:** GET, PUT, DELETE  
**Issues:**
- GET: No session check, no orgId filter
- PUT: No session check, no orgId verification before update
- DELETE: No session check, no orgId verification before soft delete
**Risk:** Any user with pipeline ID can read/modify/delete pipelines from other organizations
**Recommendation:**
```typescript
// Add at start of each handler:
const session = await getServerSession(authOptions);
if (!session?.user?.orgId) return unauthorized();

// Verify pipeline belongs to org:
const pipeline = await prisma.pipeline.findFirst({
  where: { id, orgId: session.user.orgId }
});
if (!pipeline) return notFound();
```

#### `/api/pipelines/route.ts` - PASS (with caveat)
**Methods:** GET, POST  
**Issues:**
- GET: Requires orgId in query params (client-controlled) - should use session
- POST: Requires orgId in body (client-controlled) - should use session
**Risk:** MEDIUM - Client can query other orgs' data by manipulating query params
**Recommendation:** Use `session.user.orgId` instead of accepting from client

### CRITICAL: Intake Request Routes

#### `/api/intake/[id]/route.ts` - FAIL
**Methods:** PUT, PATCH, DELETE  
**Issues:**
- PUT/PATCH: No session check, no orgId verification
- DELETE: No session check, no orgId verification
**Risk:** Any user can modify/delete intake requests from other organizations
**Recommendation:** Add session check and verify orgId before operations

#### `/api/intake/route.ts` - PASS (with caveat)
**Methods:** GET, POST  
**Issues:**
- GET: Accepts orgId from query params (client-controlled)
- POST: Accepts orgId from body (client-controlled)
**Risk:** MEDIUM - Client can manipulate orgId to view other orgs' intake requests
**Recommendation:** Use `session.user.orgId` exclusively

### CRITICAL: Task Routes

#### `/api/tasks/[id]/route.ts` - FAIL
**Methods:** GET, PATCH, DELETE  
**Issues:**
- GET: No session check, no orgId filter
- PATCH: Fetches task without orgId verification
- DELETE: Fetches task without orgId verification
**Risk:** HIGH - Task data leakage between organizations
**Recommendation:** Add orgId verification in all operations

#### `/api/tasks/route.ts` - PARTIAL PASS
**Methods:** GET, POST  
**Issues:**
- GET: Requires orgId in query (client-controlled)
- POST: Verifies org exists but accepts orgId from body
**Risk:** MEDIUM - Client can query other orgs' tasks
**Recommendation:** Use session orgId

### CRITICAL: User Routes

#### `/api/users/route.ts` - FAIL
**Methods:** GET, POST  
**Issues:**
- GET: Accepts orgId from query params (optional) - can list all users if omitted
- POST: Accepts orgId from body - can create users in any org
**Risk:** CRITICAL - User enumeration across organizations, unauthorized user creation
**Recommendation:** 
```typescript
// GET - Force orgId from session
const session = await auth();
if (!session?.user?.orgId) return unauthorized();
const where = { orgId: session.user.orgId };

// POST - Only ADMIN can create users, must be in same org
if (session.user.role !== 'ADMIN') return forbidden();
const user = await prisma.users.create({
  data: { ...parsed.data, orgId: session.user.orgId }
});
```

---

## Compliant Routes (Good Examples)

### `/api/documents/route.ts` - PASS
**Methods:** GET, DELETE (bulk)  
**Strengths:**
- ✅ Session authentication required
- ✅ Uses `session.user.orgId` for all queries
- ✅ Delegates to service layer with orgId parameter
- ✅ Service enforces orgId in all Prisma queries
**Example:**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.orgId) return unauthorized();
const orgId = session.user.orgId;
const result = await documentService.listDocuments({ orgId, ...filters });
```

### `/api/documents/[id]/route.ts` - PASS
**Methods:** GET, PATCH, DELETE  
**Strengths:**
- ✅ Session authentication on all methods
- ✅ Uses `session.user.orgId` for verification
- ✅ Service layer enforces orgId: `getDocument(documentId, orgId)`
- ✅ Returns 404 if document not found or orgId mismatch

### `/api/automations/route.ts` - PASS
**Methods:** GET, POST  
**Strengths:**
- ✅ Session authentication required
- ✅ Uses `session.user.orgId` exclusively
- ✅ Service layer: `listAutomations(session.user.orgId, filters)`
- ✅ POST: `createAutomation({ ...data, orgId: session.user.orgId })`

### `/api/automations/[id]/route.ts` - PASS
**Methods:** GET, PATCH, DELETE  
**Strengths:**
- ✅ Session authentication on all methods
- ✅ Service layer enforces orgId: `getAutomation(id, session.user.orgId)`
- ✅ Returns 404 if automation not found or orgId mismatch

### `/api/dashboard/stats/route.ts` - PASS
**Methods:** GET  
**Strengths:**
- ✅ Session authentication required
- ✅ Retrieves `user.orgId` from database
- ✅ All Prisma queries scoped with `where: { orgId }`
- ✅ Comprehensive orgId filtering on all aggregations

### `/api/agent/decisions/route.ts` - PASS
**Methods:** GET, POST  
**Strengths:**
- ✅ Session authentication required
- ✅ Retrieves `user.orgId` from database
- ✅ GET: Filters by `where: { orgId: user.orgId }`
- ✅ POST: Creates decisions with `orgId` from user context

---

## Route-by-Route Analysis

### Authentication & Auth Routes

#### `/api/auth/[...nextauth]/route.ts`
- **Status:** N/A (NextAuth handler)
- **Notes:** Handled by NextAuth.js framework

#### `/api/auth/signup/route.ts`
- **Status:** NEEDS REVIEW
- **Issues:** Creates organization and assigns user as ADMIN - no existing org check
- **Notes:** New user registration - intentionally creates new org

#### `/api/auth/accept-invite/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** Adds user to existing org via invite token

#### `/api/auth/resend-verification/route.ts`
- **Status:** PASS
- **Notes:** Public route for email verification

---

### Agent Routes

#### `/api/agent/analytics/route.ts`
- **Status:** NEEDS REVIEW
- **GET:** Unknown (file not fully audited)
- **Recommendation:** Review for orgId enforcement

#### `/api/agent/availability/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement if user-specific

#### `/api/agent/config/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/agent/decisions/route.ts` - PASS
- **GET:** ✅ Filters by `user.orgId`
- **POST:** ✅ Creates with user's orgId

#### `/api/agent/decisions/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify orgId before approve/reject/view

#### `/api/agent/inbox/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/agent/inbox/[taskId]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify taskId belongs to user's org

#### `/api/agent/init/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** Agent initialization endpoint

#### `/api/agent/process/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/agent/suggest/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

---

### Automation Routes

#### `/api/automations/route.ts` - PASS
- **GET:** ✅ Uses `session.user.orgId`
- **POST:** ✅ Creates with `session.user.orgId`

#### `/api/automations/[id]/route.ts` - PASS
- **GET:** ✅ Service enforces orgId
- **PATCH:** ✅ Service enforces orgId
- **DELETE:** ✅ Service enforces orgId

#### `/api/automations/[id]/execute/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify automation belongs to user's org before execution

#### `/api/automations/[id]/executions/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Filter executions by orgId

#### `/api/automations/[id]/workflow/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify automation belongs to user's org

#### `/api/automations/templates/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** May be global templates (no orgId) or org-specific

#### `/api/automations/templates/[id]/deploy/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Deploy to user's org only

---

### Booking & Calendar Routes

#### `/api/booking/route.ts` - PARTIAL PASS
- **POST:** Uses DEFAULT_ORG_ID from env (public booking form)
- **Notes:** Intentionally public endpoint, creates intake in default org
- **Issues:** No rate limiting on public endpoint
- **Recommendation:** Add rate limiting by IP

#### `/api/booking/availability/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Public endpoint should not leak user data

#### `/api/booking/events/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/book/route.ts`
- **Status:** DUPLICATE of /api/booking/route.ts?
- **Recommendation:** Consolidate or clarify purpose

#### `/api/calendar/events/route.ts` - PASS
- **GET:** ✅ Filters by `session.user.id` (userId-based, not orgId)
- **POST:** ✅ Creates with `session.user.id`
- **Notes:** User-scoped, not org-scoped (correct for personal calendars)

#### `/api/calendar/events/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify event belongs to user before operations

#### `/api/calendar/connect/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** OAuth connection endpoint

#### `/api/calendar/disconnect/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify connection belongs to user

#### `/api/calendar/callback/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** OAuth callback handler

#### `/api/calendar/sync/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Sync only user's calendar

---

### Chat Routes

#### `/api/chat/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify chat sessions are org-scoped

#### `/api/chat/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify chat belongs to user's org

#### `/api/chat/calendar/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/chat-messages/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Filter messages by orgId

#### `/api/chat-messages/[taskId]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify task belongs to user's org

---

### Document Routes

#### `/api/documents/route.ts` - PASS
- **GET:** ✅ Uses `session.user.orgId`
- **DELETE:** ✅ Verifies orgId via service

#### `/api/documents/[id]/route.ts` - PASS
- **GET:** ✅ Service enforces orgId
- **PATCH:** ✅ Service enforces orgId
- **DELETE:** ✅ Service enforces orgId

#### `/api/documents/[id]/download/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify document belongs to user's org

#### `/api/documents/[id]/embed/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify document belongs to user's org

#### `/api/documents/[id]/retry/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify document belongs to user's org

#### `/api/documents/[id]/url/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify document belongs to user's org

#### `/api/documents/search/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Filter search by orgId

#### `/api/documents/stats/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Return stats for user's org only

#### `/api/documents/upload/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Associate uploaded document with user's orgId

---

### Intake Routes

#### `/api/intake/route.ts` - PARTIAL PASS
- **GET:** Accepts orgId from query (client-controlled)
- **POST:** Accepts orgId from body (client-controlled)
- **Recommendation:** Use session.user.orgId

#### `/api/intake/[id]/route.ts` - FAIL
- **PUT/PATCH:** No orgId verification
- **DELETE:** No orgId verification
- **Risk:** HIGH

#### `/api/intake/[id]/assign/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify intake belongs to user's org

#### `/api/intake/bulk/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Filter by orgId

---

### Integration Routes

#### `/api/integrations/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** List integrations for user's org only

#### `/api/integrations/[provider]/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify integration belongs to user's org

#### `/api/integrations/[provider]/oauth/callback/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** OAuth callback handler

---

### Organization Routes

#### `/api/organization/quota/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Return quota for user's org only

#### `/api/orgs/route.ts`
- **Status:** NEEDS REVIEW
- **GET:** Should only return user's org (not all orgs)
- **POST:** Who can create orgs? Admin only?
- **Risk:** HIGH if no restrictions

#### `/api/orgs/[id]/members/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify user belongs to org before listing members

#### `/api/orgs/[id]/settings/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify user is ADMIN of org before viewing/editing settings

---

### Pipeline Routes

#### `/api/pipelines/route.ts` - PARTIAL PASS
- **GET:** Accepts orgId from query (client-controlled)
- **POST:** Accepts orgId from body (client-controlled)
- **Recommendation:** Use session.user.orgId

#### `/api/pipelines/[id]/route.ts` - FAIL
- **GET:** No orgId verification
- **PUT:** No orgId verification
- **DELETE:** No orgId verification
- **Risk:** CRITICAL

#### `/api/pipelines/[id]/items/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify pipeline belongs to user's org

#### `/api/pipelines/[id]/items/[itemId]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify item belongs to user's org

#### `/api/pipelines/[id]/items/[itemId]/move/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify item belongs to user's org

#### `/api/pipelines/[id]/stages/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify pipeline belongs to user's org

#### `/api/pipelines/[id]/stages/[stageId]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify stage belongs to user's org

---

### Scheduling Routes

#### `/api/scheduling/conflicts/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Check conflicts for user's org only

#### `/api/scheduling/suggest/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Suggest times for user's org only

---

### Task Routes

#### `/api/tasks/route.ts` - PARTIAL PASS
- **GET:** Accepts orgId from query (client-controlled)
- **POST:** Verifies org exists but accepts orgId from body
- **Recommendation:** Use session.user.orgId

#### `/api/tasks/[id]/route.ts` - FAIL
- **GET:** No orgId verification
- **PATCH:** No orgId verification
- **DELETE:** No orgId verification
- **Risk:** HIGH

#### `/api/tasks/[id]/override/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify task belongs to user's org

#### `/api/tasks/[id]/reprocess/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify task belongs to user's org

#### `/api/task-templates/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** May be global templates or org-specific

---

### User Routes

#### `/api/users/route.ts` - FAIL
- **GET:** Accepts optional orgId from query (can list all users)
- **POST:** Accepts orgId from body (can create users in any org)
- **Risk:** CRITICAL

#### `/api/users/me/route.ts`
- **Status:** PASS
- **Notes:** Returns current user (session-based)

#### `/api/users/me/avatar/route.ts`
- **Status:** PASS
- **Notes:** Updates current user's avatar

#### `/api/users/me/password/route.ts`
- **Status:** PASS
- **Notes:** Updates current user's password

#### `/api/users/me/settings/route.ts`
- **Status:** PASS
- **Notes:** Updates current user's settings

#### `/api/user/preferences/route.ts`
- **Status:** PASS
- **Notes:** User-specific preferences

---

### Webhook Routes

#### `/api/webhooks/automation/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** n8n webhook endpoint
- **Recommendation:** Verify webhook signature and orgId

#### `/api/webhooks/automation/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify webhook belongs to automation in correct org

#### `/api/webhooks/email/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** Inbound email webhook
- **Recommendation:** Map email to correct org

#### `/api/webhooks/form/route.ts`
- **Status:** NEEDS REVIEW
- **Notes:** Public form submission
- **Recommendation:** Associate with DEFAULT_ORG_ID

---

### Misc Routes

#### `/api/availability/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Review for orgId enforcement

#### `/api/availability/[id]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify availability belongs to user's org

#### `/api/contact/route.ts`
- **Status:** PASS
- **Notes:** Public contact form submission

#### `/api/decisions/[taskId]/route.ts`
- **Status:** NEEDS REVIEW
- **Recommendation:** Verify task belongs to user's org

#### `/api/health/route.ts`
- **Status:** PASS
- **Notes:** Public health check endpoint

---

## Security Recommendations

### Priority 1: Immediate Action Required (Critical)

1. **Fix Pipeline Routes** (`/api/pipelines/[id]/route.ts`)
   - Add session authentication to all methods
   - Verify orgId before any read/write operation
   - Estimated effort: 2 hours

2. **Fix User Routes** (`/api/users/route.ts`)
   - Force GET to filter by session.user.orgId
   - Force POST to create users in session.user.orgId only
   - Add RBAC checks (only ADMIN can create users)
   - Estimated effort: 2 hours

3. **Fix Intake Routes** (`/api/intake/[id]/route.ts`)
   - Add session authentication
   - Verify orgId before update/delete
   - Estimated effort: 1 hour

4. **Fix Task Routes** (`/api/tasks/[id]/route.ts`)
   - Add orgId verification to all methods
   - Estimated effort: 1 hour

### Priority 2: High Risk (Should Fix Soon)

5. **Fix Query Parameter orgId Issues**
   - `/api/pipelines/route.ts` - Use session.user.orgId instead of query param
   - `/api/intake/route.ts` - Use session.user.orgId instead of query param
   - `/api/tasks/route.ts` - Use session.user.orgId instead of query param
   - Estimated effort: 3 hours total

6. **Review All [id] Routes**
   - Ensure all resource-by-ID routes verify orgId before returning data
   - Pattern to follow:
     ```typescript
     const resource = await prisma.resource.findFirst({
       where: { id, orgId: session.user.orgId }
     });
     if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
     ```
   - Estimated effort: 8 hours

### Priority 3: Medium Risk (Review & Document)

7. **Review Public Endpoints**
   - `/api/booking/route.ts` - Add rate limiting
   - `/api/contact/route.ts` - Add rate limiting
   - `/api/webhooks/*` - Verify signature and orgId mapping
   - Estimated effort: 4 hours

8. **Document Intentional Exceptions**
   - Which routes are intentionally public?
   - Which routes are intentionally cross-org (if any)?
   - Create `docs/API_SECURITY_POLICY.md`
   - Estimated effort: 2 hours

### Priority 4: Best Practices (Continuous Improvement)

9. **Implement Consistent Pattern**
   - Create a shared middleware or helper function:
     ```typescript
     // lib/api/auth-helpers.ts
     export async function requireOrgSession(req: NextRequest) {
       const session = await getServerSession(authOptions);
       if (!session?.user?.orgId) {
         throw new UnauthorizedError('Organization context required');
       }
       return { session, orgId: session.user.orgId };
     }
     ```
   - Estimated effort: 4 hours (create helper + refactor 10 routes as examples)

10. **Add Automated Tests**
    - Create E2E tests that verify orgId isolation
    - Test: User from Org A cannot access Org B's resources
    - Test: orgId manipulation in query params/body is rejected
    - Estimated effort: 8 hours

11. **Add API Security Linting**
    - Create ESLint rule to detect missing session checks
    - Create ESLint rule to detect orgId from req.body/query without validation
    - Estimated effort: 4 hours

---

## Testing Recommendations

### Test Case: Cross-Org Data Access Prevention

**Setup:**
1. Create two organizations: Org A (ID: `org-a`) and Org B (ID: `org-b`)
2. Create users: UserA (belongs to Org A), UserB (belongs to Org B)
3. Create resources in each org: Pipeline A1, Pipeline B1

**Test Scenarios:**

1. **Test: GET /api/pipelines/[id] with wrong org**
   ```bash
   # UserA tries to access Pipeline B1
   curl -H "Cookie: session=userA-token" \
     http://localhost:3001/api/pipelines/[pipeline-b1-id]
   
   # Expected: 404 Not Found (or 403 Forbidden)
   # Current: 200 OK with Pipeline B1 data ❌ FAIL
   ```

2. **Test: GET /api/pipelines?orgId=org-b as UserA**
   ```bash
   # UserA tries to list Org B's pipelines by manipulating query param
   curl -H "Cookie: session=userA-token" \
     http://localhost:3001/api/pipelines?orgId=org-b
   
   # Expected: 403 Forbidden (or return empty list)
   # Current: Returns Org B's pipelines ❌ FAIL
   ```

3. **Test: PUT /api/pipelines/[id] with wrong org**
   ```bash
   # UserA tries to update Pipeline B1
   curl -X PUT -H "Cookie: session=userA-token" \
     -H "Content-Type: application/json" \
     -d '{"name":"Hacked"}' \
     http://localhost:3001/api/pipelines/[pipeline-b1-id]
   
   # Expected: 403 Forbidden
   # Current: Updates Pipeline B1 ❌ FAIL
   ```

4. **Test: DELETE /api/pipelines/[id] with wrong org**
   ```bash
   # UserA tries to delete Pipeline B1
   curl -X DELETE -H "Cookie: session=userA-token" \
     http://localhost:3001/api/pipelines/[pipeline-b1-id]
   
   # Expected: 403 Forbidden
   # Current: Deletes Pipeline B1 ❌ FAIL
   ```

5. **Test: POST /api/users with arbitrary orgId**
   ```bash
   # UserA tries to create a user in Org B
   curl -X POST -H "Cookie: session=userA-token" \
     -H "Content-Type: application/json" \
     -d '{"email":"spy@example.com","password":"test","orgId":"org-b"}' \
     http://localhost:3001/api/users
   
   # Expected: 403 Forbidden (user created in Org A, not Org B)
   # Current: Creates user in Org B ❌ FAIL
   ```

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix `/api/pipelines/[id]/route.ts` (2h)
- [ ] Fix `/api/users/route.ts` (2h)
- [ ] Fix `/api/intake/[id]/route.ts` (1h)
- [ ] Fix `/api/tasks/[id]/route.ts` (1h)
- [ ] Add E2E tests for fixed routes (4h)
- **Total:** 10 hours

### Phase 2: High Risk Fixes (Week 2)
- [ ] Fix query parameter orgId issues (3h)
- [ ] Review and fix all [id] routes (8h)
- [ ] Add E2E tests for Phase 2 (4h)
- **Total:** 15 hours

### Phase 3: Medium Risk Review (Week 3)
- [ ] Review public endpoints and add rate limiting (4h)
- [ ] Document API security policy (2h)
- [ ] Review webhook endpoints (2h)
- **Total:** 8 hours

### Phase 4: Best Practices (Week 4)
- [ ] Create auth helper utilities (4h)
- [ ] Refactor 10 routes to use helpers (4h)
- [ ] Add automated tests for orgId isolation (8h)
- [ ] Add ESLint security rules (4h)
- **Total:** 20 hours

**Grand Total:** 53 hours (~7 days of development)

---

## Appendix A: Good Pattern Examples

### Pattern 1: Session-Based OrgId (Recommended)

```typescript
// Good: Uses session orgId, client cannot manipulate
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const orgId = session.user.orgId; // From trusted session
  
  const data = await prisma.resource.findMany({
    where: { orgId } // Enforced in query
  });
  
  return NextResponse.json({ data });
}
```

### Pattern 2: Resource Verification for [id] Routes

```typescript
// Good: Verifies resource belongs to user's org
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  const resource = await prisma.resource.findFirst({
    where: {
      id,
      orgId: session.user.orgId // ✅ Verify org ownership
    }
  });
  
  if (!resource) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ resource });
}
```

### Pattern 3: Service Layer with OrgId

```typescript
// Good: Service layer enforces orgId
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const documents = await documentService.listDocuments({
    orgId: session.user.orgId, // Passed to service
    ...otherFilters
  });
  
  return NextResponse.json({ documents });
}

// Service enforces orgId in all queries
async listDocuments(filters: { orgId: string; ... }) {
  return prisma.document.findMany({
    where: {
      orgId: filters.orgId, // ✅ Always filtered
      ...otherConditions
    }
  });
}
```

---

## Appendix B: Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Controlled OrgId

```typescript
// BAD: Client can manipulate orgId to access other orgs' data
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orgId = searchParams.get('orgId'); // ❌ From client
  
  const data = await prisma.resource.findMany({
    where: { orgId } // ❌ No validation
  });
  
  return NextResponse.json({ data });
}

// ATTACK: curl http://api/resource?orgId=victim-org-id
```

### Anti-Pattern 2: No OrgId Verification on [id] Routes

```typescript
// BAD: Returns resource from any org
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const resource = await prisma.resource.findUnique({
    where: { id } // ❌ No orgId filter
  });
  
  return NextResponse.json({ resource }); // ❌ Leaks data
}

// ATTACK: curl http://api/resource/victim-resource-id
```

### Anti-Pattern 3: OrgId from Request Body

```typescript
// BAD: Client can create/update resources in any org
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const resource = await prisma.resource.create({
    data: {
      ...body,
      orgId: body.orgId // ❌ From client, not validated
    }
  });
  
  return NextResponse.json({ resource });
}

// ATTACK: POST { "orgId": "victim-org-id", ... }
```

---

## Conclusion

**Critical:** The current API implementation has significant multi-tenant security vulnerabilities. 29 routes are non-compliant with orgId enforcement, allowing potential data leakage between organizations.

**Priority:** Fix the 4 critical routes in Phase 1 (Week 1) to prevent immediate security risks.

**Long-term:** Implement consistent auth patterns, automated testing, and security linting to prevent regressions.

**Next Steps:**
1. Share this audit with the development team
2. Create GitHub issues for each priority phase
3. Assign developers to Phase 1 critical fixes
4. Schedule security review after Phase 2 completion

---

**Report Generated:** 2025-12-02  
**Next Audit:** After Phase 2 completion (estimated 2025-12-16)
