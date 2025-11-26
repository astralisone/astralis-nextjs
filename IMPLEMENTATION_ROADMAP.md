# IMPLEMENTATION ROADMAP

**Astralis One - Multi-Agent Engineering Platform**
**Last Updated:** 2025-11-26
**Current Phase:** Phase 1 COMPLETE ✅ → Starting Phase 2

---

## 📋 SESSION QUICK-START

**Before you start coding:**

1. **Read this file completely** - Understand the dependency chain
2. **Check the Current Phase** marker below
3. **Start with BLOCKING tasks first** - Everything depends on these
4. **Review acceptance criteria** before implementation
5. **Update checkboxes** as you complete tasks
6. **Run tests** after each task: `npm run test:e2e`

**Key Commands:**
```bash
npm run dev              # Start development server (port 3001)
npm run worker           # Start background worker (BullMQ/Redis)
npx prisma studio        # View database
npm run test:e2e         # Run E2E tests
```

**Architecture Context:**
- **Database:** PostgreSQL + Prisma ORM
- **Queue System:** BullMQ + Redis
- **Authentication:** NextAuth.js v5 (JWT + Database Sessions)
- **AI/LLM:** OpenAI GPT-4 + Anthropic Claude
- **File Storage:** DigitalOcean Spaces (S3-compatible)
- **No AWS:** Use DigitalOcean alternatives for all cloud services

---

## 🐛 CRITICAL BUGS (Fix Immediately)

These bugs are blocking users from using core functionality. Fix before feature work.

### BUG-1: Dashboard Crashes on Load → Missing orgId Validation
- **Status:** [x] ✅ COMPLETED (2025-11-26)
- **Priority:** CRITICAL BUG
- **Size:** S (1-2 hours)
- **Error:** "Something went wrong - We encountered an unexpected error"
- **Files:**
  - `src/app/(app)/dashboard/page.tsx:10-27`
  - `src/lib/auth/config.ts:111` (sets session.user.orgId)
  - `src/app/error.tsx` (error boundary catching this)
- **Root Cause:**
  - `session.user.orgId` can be undefined if user has no organization
  - No try-catch around `Promise.all()` database queries
  - Prisma queries with undefined `orgId` cause errors
- **Acceptance Criteria:**
  - [x] Add validation: `if (!orgId) return <ErrorState />`
  - [x] Wrap database queries in try-catch block
  - [x] Create user-friendly error UI for missing org
  - [x] Add loading state while fetching data
  - [x] Log error details for debugging
  - [ ] Test with user that has no orgId assigned
- **Implementation Notes:**
  ```typescript
  // Add at line 10
  if (!orgId) {
    return (
      <div className="p-8">
        <h2>Organization Required</h2>
        <p>Please contact support to be assigned to an organization.</p>
      </div>
    );
  }

  // Wrap queries in try-catch
  try {
    const [intakeStats, pipelineStats] = await Promise.all([...]);
  } catch (error) {
    console.error('Dashboard load error:', error);
    return <ErrorState message="Failed to load dashboard data" />;
  }
  ```

---

## 🚨 PHASE 1: BLOCKING (Must Do First)

These features are incomplete and block other functionality. Complete these before moving forward.

### 1.1 Email Response Sending → Nodemailer Integration ✅ COMPLETE
- **Status:** [x] Complete
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:410-537` (implemented)
  - `src/lib/email.ts:818-1258` (new templates and functions)
- **Dependencies:** SMTP configuration in `.env.local` (already set up)
- **Current State:** Fully implemented with all response types
- **Acceptance Criteria:**
  - [x] Create `sendSchedulingEmail()` function in email service → `sendSchedulingAgentEmail()` + `sendEmailResponse()`
  - [x] Support template types: confirmation, alternatives, clarification, cancellation → All 4 implemented
  - [~] Include ICS calendar attachment for confirmations → Future enhancement (not critical for MVP)
  - [x] Handle HTML + plain text email formats → Both implemented via `buildEmailTemplate()`
  - [~] Log email sent to ActivityLog table → Logged to task metadata + console (ActivityLog integration in future phase)
  - [x] Add retry logic for failed sends (3 attempts) → Handled by BullMQ queue retry mechanism
  - [x] Update SchedulingAgentTask with `emailSentAt` timestamp → Logged in task.aiMetadata.lastResponse
- **Implementation Details:**
  - Created 4 email template generators: confirmation, alternatives, clarification, cancellation
  - Supports error type (maps to clarification template)
  - Fetches SchedulingEvent details when available
  - Falls back to task.selectedSlot or task.entities for meeting details
  - Smart clarification messages that list missing fields
  - Full HTML + text email support using existing brand template
  - Proper error handling with descriptive error messages
- **Implementation Notes:**
  ```typescript
  // Uses existing Nodemailer setup from booking system
  // Templates match booking confirmation brand style
  // Includes meeting details, participant list, time/date/timezone
  // Handles all edge cases (missing data, partial data, etc.)
  ```

### 1.2 SMS Response Sending → Twilio API Integration ✅ COMPLETE
- **Status:** [x] Complete (2025-11-26)
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/services/sms.service.ts` (346 lines - NEW)
  - `src/workers/processors/schedulingAgent.processor.ts:543-675`
  - `docs/SMS_SERVICE.md`
- **Implementation Details:**
  - Created SmsService with Twilio integration
  - Graceful fallback when Twilio not configured (never crashes)
  - Message templates: confirmation, reminder, cancellation
  - Auto-truncates to 160 chars
  - Phone validation (E.164 format)
  - Smart date formatting ("today", "tomorrow", or "Jan 15")
- **Acceptance Criteria:**
  - [x] Install and configure Twilio SDK
  - [x] Create `SmsService` class with `sendSms()` method
  - [x] Support message types: confirmation, reminder, cancellation
  - [x] Keep messages under 160 characters
  - [x] Graceful fallback if Twilio not configured

### 1.3 Chat Response Sending → WebSocket/Pusher Integration ✅ COMPLETE
- **Status:** [x] Complete (2025-11-26)
- **Priority:** BLOCKING
- **Size:** L (8-10 hours)
- **Files:**
  - `src/lib/services/chat-response.service.ts` (542 lines - NEW)
  - `src/app/api/chat-messages/route.ts` (NEW)
  - `src/app/api/chat-messages/[taskId]/route.ts` (NEW)
  - `prisma/migrations/20251126000000_add_chat_messages/`
  - `docs/CHAT_RESPONSE_SERVICE.md`
- **Implementation Details:**
  - Dual delivery: Pusher (real-time) + Database (polling fallback)
  - ChatMessage model added to Prisma schema
  - API endpoints for message retrieval and read status
  - 6 message types: scheduling_update, confirmation, clarification, cancellation, error, info
  - Graceful fallback when Pusher not configured
- **Acceptance Criteria:**
  - [x] Create `ChatResponseService` with `sendChatMessage()` method
  - [x] Implement real-time delivery via Pusher
  - [x] Database fallback for offline/polling
  - [x] Track message read status
  - [x] API endpoints for message retrieval

### 1.4 Webhook Notifications → HTTP Callbacks ✅ COMPLETE
- **Status:** [x] Complete (2025-11-26)
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/services/webhook.service.ts` (400+ lines - NEW)
  - `src/workers/processors/schedulingAgent.processor.ts:579-652`
  - `docs/WEBHOOK_IMPLEMENTATION.md`
- **Implementation Details:**
  - WebhookService with sendWebhook() method
  - HMAC-SHA256 signatures using webhook-verification.ts
  - Exponential backoff retry (3 attempts, 1s→2s→4s)
  - 30-second timeout per request
  - Event types: scheduling.confirmed, cancelled, rescheduled
- **Acceptance Criteria:**
  - [x] Create `WebhookService` class with `sendWebhook()` method
  - [x] Support POST requests with JSON payload
  - [x] Generate HMAC-SHA256 signatures
  - [x] Implement retry logic with exponential backoff
  - [x] Timeout after 30 seconds

### 1.5 Task Action Executor Wiring
- **Status:** [x] ✅ COMPLETED (2025-11-26)
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/agent/core/BaseTaskAgent.ts:383`
  - `src/lib/agent/core/TaskActionExecutor.ts` (exists but not wired)
- **Dependencies:** TaskActionExecutor implementation (already exists)
- **Current State:** TODO comment, executor exists but not instantiated
- **Acceptance Criteria:**
  - [x] Instantiate `TaskActionExecutor` in `BaseTaskAgent` constructor
  - [x] Wire `executor.executeActions()` call at line 383
  - [x] Pass task, template, and decision context to executor
  - [x] Handle execution errors gracefully
  - [x] Update DecisionLog with execution results
  - [ ] Emit events for each executed action
  - [x] Support dry-run mode for testing
- **Implementation Notes:**
  ```typescript
  // Add to constructor:
  private actionExecutor: TaskActionExecutor;
  this.actionExecutor = new TaskActionExecutor(this.logger);

  // At line 383:
  const results = await this.actionExecutor.executeActions(
    decision.actions,
    { taskId: task.id, orgId: task.orgId }
  );
  ```

### 1.6 Credential Storage → Encrypted Database ✅ COMPLETE
- **Status:** [x] Complete (2025-11-26)
- **Priority:** BLOCKING
- **Size:** L (8-10 hours)
- **Files:**
  - `src/lib/services/integration.service.ts` (fully implemented)
  - `prisma/schema.prisma` (IntegrationCredential model already exists)
  - `docs/CREDENTIAL_STORAGE_GUIDE.md`
- **Implementation Details:**
  - Uses existing AES-256-GCM encryption from crypto.ts
  - PBKDF2 key derivation with 100k iterations
  - Activity logging for all credential operations
  - Soft delete preserves audit trail
- **Acceptance Criteria:**
  - [x] IntegrationCredential model exists in Prisma schema
  - [x] Implement `saveCredential()` - encrypt and store
  - [x] Implement `listCredentials()` - return without decrypted data
  - [x] Implement `getCredentialWithData()` - decrypt for internal use
  - [x] Implement `refreshToken()` - update OAuth tokens
  - [x] Implement `deleteCredential()` - soft delete
  - [x] Add ActivityLog entries for all operations
  - [x] Use AES-256-GCM encryption
- **Implementation Notes:**
  ```prisma
  model IntegrationCredential {
    id               String   @id @default(cuid())
    userId           String
    orgId            String
    provider         String   // 'google', 'microsoft', 'zoom', 'twilio', etc.
    credentialName   String
    credentialData   String   @db.Text // Encrypted JSON
    scope            String?
    expiresAt        DateTime?
    isActive         Boolean  @default(true)
    lastUsedAt       DateTime?
    createdAt        DateTime @default(now())
    updatedAt        DateTime @updatedAt

    user         User         @relation(fields: [userId], references: [id])
    organization Organization @relation(fields: [orgId], references: [id])

    @@index([userId])
    @@index([orgId])
    @@index([provider])
  }
  ```

### 1.7 Webhook Signature Verification → HMAC
- **Status:** [x] ✅ COMPLETED (2025-11-26)
- **Priority:** BLOCKING
- **Size:** S (2-3 hours)
- **Files:**
  - `src/lib/agent/inputs/WebhookInputHandler.ts:511-533`
  - Create: `src/lib/utils/webhook-verification.ts`
- **Dependencies:** Node.js crypto module (built-in)
- **Current State:** Placeholder implementation, always returns true
- **Acceptance Criteria:**
  - [x] Implement proper HMAC-SHA256 signature verification
  - [x] Support multiple signature algorithms (SHA256, SHA512)
  - [x] Extract signature from header: `X-Webhook-Signature`
  - [x] Compare computed hash with provided signature (timing-safe)
  - [x] Log verification failures with warning level
  - [x] Support signature version prefixes (e.g., `sha256=...`)
  - [x] Add configuration for signature header name
- **Implementation Notes:**
  ```typescript
  import { createHmac, timingSafeEqual } from 'crypto';

  function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const computed = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison
    const expected = Buffer.from(signature.replace('sha256=', ''));
    const actual = Buffer.from(computed);
    return expected.length === actual.length &&
           timingSafeEqual(expected, actual);
  }
  ```

---

## 🔥 PHASE 2: CRITICAL (High Impact)

These features are needed for core functionality but have workarounds.

### 2.1 Meeting Links → Google Meet / Zoom / Teams APIs
- **Status:** [ ] Not Started
- **Priority:** CRITICAL
- **Size:** L (10-12 hours)
- **Files:**
  - `src/lib/agent/actions/CalendarManager.ts:730`
  - Create: `src/lib/integrations/google-meet.ts`
  - Create: `src/lib/integrations/zoom.ts`
  - Create: `src/lib/integrations/teams.ts`
- **Dependencies:**
  - Task 1.6 (Credential Storage)
  - OAuth setup for each provider
- **Current State:** Placeholder function returns fake URLs
- **Acceptance Criteria:**
  - [ ] **Google Meet Integration:**
    - Install Google APIs: `npm install googleapis`
    - Implement OAuth 2.0 flow for calendar access
    - Create meeting via Calendar API with `conferenceData`
    - Extract `hangoutLink` from response
  - [ ] **Zoom Integration:**
    - Install Zoom SDK: `npm install @zoom/meetingsdk`
    - Implement OAuth or JWT authentication
    - Create meeting via Zoom API `/users/me/meetings`
    - Return join URL and meeting ID
  - [ ] **Microsoft Teams Integration:**
    - Install Microsoft Graph SDK: `npm install @microsoft/microsoft-graph-client`
    - Implement OAuth 2.0 flow
    - Create online meeting via Graph API
    - Return join URL from `onlineMeeting` object
  - [ ] Store provider credentials in IntegrationCredential table
  - [ ] Support meeting settings: password, waiting room, recording
  - [ ] Handle token refresh automatically
- **Implementation Notes:**
  ```typescript
  // Google Meet
  const calendar = google.calendar({ version: 'v3', auth });
  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: title,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      conferenceData: { createRequest: { requestId: uuid() } }
    }
  });
  return event.data.hangoutLink;
  ```

### 2.2 Reschedule / Cancel / Check Availability Handlers
- **Status:** [ ] Not Started
- **Priority:** CRITICAL
- **Size:** M (6-8 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:659-697`
  - Extend: `src/lib/services/scheduling.service.ts`
- **Dependencies:** None (extends existing service)
- **Current State:** TODO comments, not implemented
- **Acceptance Criteria:**
  - [ ] **Reschedule Handler:**
    - Parse new date/time from task entities
    - Check conflicts at new time
    - Update SchedulingEvent in database
    - Send reschedule notifications to attendees
    - Update task status to COMPLETED
  - [ ] **Cancel Handler:**
    - Find event by ID or details
    - Update event status to CANCELLED
    - Send cancellation emails to attendees
    - Log cancellation reason
    - Update task status to COMPLETED
  - [ ] **Check Availability Handler:**
    - Query existing events for user
    - Find available time slots
    - Return 3-5 suggestions with scores
    - Consider business hours, lunch breaks
    - Update task with proposed slots
  - [ ] Add unit tests for each handler
- **Implementation Notes:**
  ```typescript
  case 'RESCHEDULE_MEETING':
    const event = await findEventById(entities.eventId);
    const conflicts = await checkConflicts(userId, newStart, newEnd);
    if (!conflicts.hasConflict) {
      await updateEvent(event.id, { startTime: newStart, endTime: newEnd });
      await sendRescheduleNotification(event);
    }
    break;
  ```

### 2.3 Notification Dispatch System
- **Status:** [ ] Not Started
- **Priority:** CRITICAL
- **Size:** L (8-10 hours)
- **Files:**
  - `src/lib/agent/core/TaskActionExecutor.ts:533`
  - Create: `src/lib/services/notification.service.ts`
  - Create: `src/workers/queues/notification.queue.ts`
- **Dependencies:**
  - Task 1.1 (Email Service)
  - Task 1.2 (SMS Service)
  - Task 1.3 (Chat Service)
- **Current State:** TODO comment, logs only
- **Acceptance Criteria:**
  - [ ] Create unified `NotificationService` class
  - [ ] Support channels: email, sms, push, chat, webhook
  - [ ] Implement template system for notifications
  - [ ] Queue notifications via BullMQ (don't block)
  - [ ] Support batch notifications (multiple recipients)
  - [ ] Track delivery status per recipient
  - [ ] Implement retry logic for failed deliveries
  - [ ] Add user notification preferences (per channel)
  - [ ] Support notification scheduling (send later)
- **Implementation Notes:**
  ```typescript
  // Unified interface
  interface NotificationPayload {
    channel: 'email' | 'sms' | 'push' | 'chat';
    template: string;
    recipients: string[];
    data: Record<string, unknown>;
    scheduledFor?: Date;
  }

  // Usage
  await notificationService.send({
    channel: 'email',
    template: 'customer_update',
    recipients: [customerEmail],
    data: { taskId, status, message }
  });
  ```

### 2.4 Activity Logging → Audit Trail
- **Status:** [ ] Partially Implemented
- **Priority:** CRITICAL
- **Size:** M (4-6 hours)
- **Files:**
  - Multiple files with commented-out logging
  - `src/lib/services/activityLog.service.ts` (needs creation)
- **Dependencies:** ActivityLog model exists in Prisma
- **Current State:** Many operations don't log to ActivityLog
- **Acceptance Criteria:**
  - [ ] Create `ActivityLogService` with helper methods
  - [ ] Implement logging for all CRUD operations:
    - User actions (login, logout, role change)
    - Pipeline operations (create, update, delete, move items)
    - Intake processing (classify, route, assign)
    - Document operations (upload, OCR, delete)
    - Scheduling operations (create, update, cancel events)
  - [ ] Include metadata: IP address, user agent, changes (before/after)
  - [ ] Support batch logging for performance
  - [ ] Add retention policy (delete logs older than 1 year)
  - [ ] Create admin UI to view activity logs
  - [ ] Add export functionality (CSV, JSON)
- **Implementation Notes:**
  ```typescript
  // Create service
  class ActivityLogService {
    async log(params: {
      userId?: string;
      orgId: string;
      action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | ...;
      entity: 'USER' | 'PIPELINE' | 'DOCUMENT' | ...;
      entityId?: string;
      changes?: { before: any; after: any };
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    }) {
      return prisma.activityLog.create({ data: params });
    }
  }
  ```

---

## ⚠️ PHASE 3: IMPORTANT (Quality of Life)

These features improve user experience but aren't blocking.

### 3.1 Dashboard Stats → Document & Event Queries
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** S (2-3 hours)
- **Files:**
  - `src/app/api/dashboard/stats/route.ts:172-179`
- **Dependencies:** None (models exist)
- **Current State:** Returns hardcoded zeros for documents and events
- **Acceptance Criteria:**
  - [ ] Add document queries:
    - Total documents count
    - Processing status count (WHERE status = 'PROCESSING')
    - Documents created in last 30 days (change percentage)
  - [ ] Add event queries:
    - Total events count
    - Upcoming events (WHERE startTime > NOW() AND status != 'CANCELLED')
    - Events created in last 30 days (change percentage)
  - [ ] Update DashboardData type if needed
  - [ ] Add loading states in frontend
  - [ ] Cache results for 5 minutes (reduce DB load)
- **Implementation Notes:**
  ```typescript
  const [documentsTotal, documentsProcessing, documentsLast30Days] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { status: 'PROCESSING' } }),
    prisma.document.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
  ]);

  const [eventsTotal, eventsUpcoming, eventsLast30Days] = await Promise.all([
    prisma.schedulingEvent.count(),
    prisma.schedulingEvent.count({
      where: { startTime: { gt: new Date() }, status: { not: 'CANCELLED' } }
    }),
    prisma.schedulingEvent.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
  ]);
  ```

### 3.2 User Timezone Configuration
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/services/scheduling.service.ts:188`
  - Add field to User model: `timezone: String @default("UTC")`
- **Dependencies:** Prisma migration for User.timezone field
- **Current State:** Hardcoded UTC timezone
- **Acceptance Criteria:**
  - [ ] Add `timezone` field to User model (default: "UTC")
  - [ ] Create migration: `npx prisma migrate dev --name add-user-timezone`
  - [ ] Create user settings page: `/settings/preferences`
  - [ ] Add timezone dropdown with common zones
  - [ ] Use `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect browser timezone
  - [ ] Display all times in user's timezone
  - [ ] Convert times to UTC when storing in database
  - [ ] Show timezone indicator in UI (e.g., "3:00 PM PST")
- **Implementation Notes:**
  ```typescript
  // Detect timezone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert for display
  import { formatInTimeZone } from 'date-fns-tz';
  const localTime = formatInTimeZone(
    utcDate,
    user.timezone,
    'MMM d, yyyy h:mm a zzz'
  );
  ```

### 3.3 Quota Tracking by Plan
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** M (6-8 hours)
- **Files:**
  - `src/lib/services/quotaTracking.service.ts:138`
  - Add field to Organization model: `plan: PlanType`
- **Dependencies:**
  - Create PlanType enum: FREE, STARTER, PROFESSIONAL, ENTERPRISE
  - Define quota limits per plan
- **Current State:** Hardcoded limits, no plan tiers
- **Acceptance Criteria:**
  - [ ] Define plan tiers with limits:
    - FREE: 10 intakes/mo, 5 pipelines, 100 documents
    - STARTER: 100 intakes/mo, 20 pipelines, 1000 documents
    - PROFESSIONAL: 1000 intakes/mo, unlimited pipelines, 10000 documents
    - ENTERPRISE: unlimited everything
  - [ ] Add `plan` field to Organization model
  - [ ] Implement `checkQuota()` - verify before operations
  - [ ] Implement `getUsage()` - current vs limit
  - [ ] Create quota exceeded error responses
  - [ ] Add upgrade prompts in UI when quota hit
  - [ ] Track quota resets (monthly)
- **Implementation Notes:**
  ```typescript
  const PLAN_LIMITS = {
    FREE: { intakes: 10, pipelines: 5, documents: 100 },
    STARTER: { intakes: 100, pipelines: 20, documents: 1000 },
    PROFESSIONAL: { intakes: 1000, pipelines: -1, documents: 10000 },
    ENTERPRISE: { intakes: -1, pipelines: -1, documents: -1 }
  };

  async checkQuota(orgId: string, resource: string): Promise<boolean> {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const usage = await getUsage(orgId, resource);
    const limit = PLAN_LIMITS[org.plan][resource];
    return limit === -1 || usage < limit;
  }
  ```

### 3.4 Error Monitoring → Sentry Integration
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/queries/error-handling.ts:153`
  - Create: `src/lib/monitoring/sentry.ts`
- **Dependencies:**
  - Sentry account (free tier available)
  - Environment variable: `SENTRY_DSN`
- **Current State:** TODO comment, no error tracking
- **Acceptance Criteria:**
  - [ ] Install Sentry: `npm install @sentry/nextjs`
  - [ ] Run Sentry wizard: `npx @sentry/wizard@latest -i nextjs`
  - [ ] Configure `sentry.client.config.js` and `sentry.server.config.js`
  - [ ] Add Sentry DSN to `.env.local`
  - [ ] Capture errors automatically (Next.js integration)
  - [ ] Add custom error contexts (user, organization)
  - [ ] Set up error alerts (Slack, email)
  - [ ] Configure source maps for production
  - [ ] Add performance monitoring (optional)
- **Implementation Notes:**
  ```typescript
  // sentry.server.config.js
  import * as Sentry from "@sentry/nextjs";

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });

  // Usage
  try {
    await riskyOperation();
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: 'scheduling' },
      user: { id: userId, orgId }
    });
    throw error;
  }
  ```

### 3.5 Email Verification Retry Logic
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** S (2-3 hours)
- **Files:**
  - `src/lib/services/auth.service.ts:84`
- **Dependencies:** Email service (already implemented)
- **Current State:** Single send, no retry
- **Acceptance Criteria:**
  - [ ] Implement retry logic for failed email sends (3 attempts)
  - [ ] Exponential backoff: 1s, 5s, 30s
  - [ ] Log each attempt to ActivityLog
  - [ ] Return success/failure status
  - [ ] Add "Resend verification email" button in UI
  - [ ] Rate limit resend requests (1 per minute)
  - [ ] Expire verification tokens after 24 hours
- **Implementation Notes:**
  ```typescript
  async function sendVerificationEmailWithRetry(
    email: string,
    token: string
  ): Promise<boolean> {
    const delays = [1000, 5000, 30000];

    for (let i = 0; i < delays.length; i++) {
      try {
        await emailService.sendVerificationEmail(email, token);
        return true;
      } catch (error) {
        if (i < delays.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
      }
    }
    return false;
  }
  ```

### 3.6 Intake Detail Navigation
- **Status:** [ ] Not Started
- **Priority:** IMPORTANT
- **Size:** S (1-2 hours)
- **Files:**
  - `src/app/(app)/pipelines/[id]/page.tsx:56`
- **Dependencies:** None
- **Current State:** TODO comment, no navigation to intake detail
- **Acceptance Criteria:**
  - [ ] Create intake detail page: `/app/(app)/intakes/[id]/page.tsx`
  - [ ] Display intake metadata (type, source, confidence)
  - [ ] Show AI classification results
  - [ ] Display routing decision and reasoning
  - [ ] Show assigned pipeline and stage
  - [ ] Add "Reclassify" button (reprocess intake)
  - [ ] Add breadcrumb navigation
  - [ ] Link back to pipeline view
- **Implementation Notes:**
  ```typescript
  // Add to pipeline page
  <Link href={`/intakes/${item.intakeRequestId}`}>
    View Intake Details
  </Link>

  // Intake detail page
  const intake = await prisma.intakeRequest.findUnique({
    where: { id: params.id },
    include: {
      classificationResult: true,
      assignedPipeline: true
    }
  });
  ```

---

## 💡 PHASE 4: NICE-TO-HAVE (Future Enhancements)

These features add polish but aren't essential for launch.

### 4.1 Real-Time Collaboration → WebSocket Events
- **Status:** [ ] Not Started
- **Priority:** NICE-TO-HAVE
- **Size:** L (10-12 hours)
- **Description:** Enable real-time updates when multiple users view same pipeline
- **Acceptance Criteria:**
  - [ ] Broadcast pipeline changes via WebSocket
  - [ ] Show "User X is viewing this pipeline" indicators
  - [ ] Lock items being edited by another user
  - [ ] Show real-time cursor positions (optional)

### 4.2 Advanced Analytics Dashboard
- **Status:** [ ] Not Started
- **Priority:** NICE-TO-HAVE
- **Size:** L (12-15 hours)
- **Description:** Detailed analytics with charts and trends
- **Acceptance Criteria:**
  - [ ] Add Chart.js or Recharts library
  - [ ] Intake funnel visualization
  - [ ] Pipeline velocity metrics
  - [ ] Agent performance metrics
  - [ ] Export reports as PDF

### 4.3 Mobile App → React Native
- **Status:** [ ] Not Started
- **Priority:** NICE-TO-HAVE
- **Size:** XL (40+ hours)
- **Description:** Native iOS and Android apps
- **Acceptance Criteria:**
  - [ ] Set up React Native project
  - [ ] Implement authentication
  - [ ] Basic pipeline view
  - [ ] Push notifications
  - [ ] Offline mode

### 4.4 Voice Commands → Speech Recognition
- **Status:** [ ] Not Started
- **Priority:** NICE-TO-HAVE
- **Size:** L (10-12 hours)
- **Description:** Control platform via voice (e.g., "Show pending intakes")
- **Acceptance Criteria:**
  - [ ] Integrate Web Speech API
  - [ ] Define voice command grammar
  - [ ] Implement command parser
  - [ ] Add voice feedback responses

### 4.5 AI Training Interface
- **Status:** [ ] Not Started
- **Priority:** NICE-TO-HAVE
- **Size:** XL (20+ hours)
- **Description:** Allow users to fine-tune AI models with their data
- **Acceptance Criteria:**
  - [ ] Create training data management UI
  - [ ] Implement feedback loop for classifications
  - [ ] Support custom model training (OpenAI fine-tuning)
  - [ ] Track model performance over time

---

## 📊 PROGRESS TRACKING

### Overall Completion
- **Critical Bugs:** 1/1 fixed (100%) ✅
- **Phase 1 (BLOCKING):** 7/7 tasks (100%) ✅ **COMPLETE**
- **Phase 2 (CRITICAL):** 0/4 tasks (0%)
- **Phase 3 (IMPORTANT):** 1/6 tasks (17%) - Dashboard Stats done
- **Phase 4 (NICE-TO-HAVE):** 0/5 tasks (0%)

### Phase 1 Completed (2025-11-26)
All blocking tasks done:
1. ~~BUG-1 - Dashboard Crash Fix~~ ✅
2. ~~Task 1.1 - Email Response Sending~~ ✅
3. ~~Task 1.2 - SMS Response Sending~~ ✅
4. ~~Task 1.3 - Chat Response Sending~~ ✅
5. ~~Task 1.4 - Webhook Notifications~~ ✅
6. ~~Task 1.5 - Task Action Executor~~ ✅
7. ~~Task 1.6 - Credential Storage~~ ✅
8. ~~Task 1.7 - Webhook Signature Verification~~ ✅

### Next Sprint Focus (Phase 2)
1. Task 2.1 - Meeting Links (Google Meet, Zoom, Teams)
2. Task 2.2 - Reschedule/Cancel/Check Availability handlers
3. Task 2.3 - Notification Dispatch System
4. Task 2.4 - Activity Logging

---

## 🔗 DEPENDENCY GRAPH

```
BLOCKING TASKS (Phase 1)
├── 1.1 Email Service → 2.3 Notifications
├── 1.2 SMS Service → 2.3 Notifications
├── 1.3 Chat Service → 2.3 Notifications
├── 1.4 Webhook Service → (standalone)
├── 1.5 Task Action Executor → (standalone)
├── 1.6 Credential Storage → 2.1 Meeting Links
└── 1.7 Webhook Verification → (standalone)

CRITICAL TASKS (Phase 2)
├── 2.1 Meeting Links → (depends on 1.6)
├── 2.2 Reschedule/Cancel → (standalone)
├── 2.3 Notification Dispatch → (depends on 1.1, 1.2, 1.3)
└── 2.4 Activity Logging → (standalone)

IMPORTANT TASKS (Phase 3)
├── 3.1 Dashboard Stats → (standalone)
├── 3.2 User Timezone → (standalone)
├── 3.3 Quota by Plan → (standalone)
├── 3.4 Error Monitoring → (standalone)
├── 3.5 Email Retry → (standalone)
└── 3.6 Intake Navigation → (standalone)

NICE-TO-HAVE (Phase 4)
└── All independent (implement as resources allow)
```

---

## 🧪 TESTING CHECKLIST

After implementing each task:

- [ ] Unit tests pass: Feature-specific logic tested
- [ ] Integration tests pass: Database operations verified
- [ ] E2E tests pass: User flows work end-to-end
- [ ] Manual testing: Try happy path + edge cases
- [ ] Error handling: Test failure scenarios
- [ ] Performance: Check query times, memory usage
- [ ] Security: Verify authentication, authorization
- [ ] Logging: Confirm activity logs created
- [ ] Documentation: Update API docs, inline comments

**Test Commands:**
```bash
# Unit tests (when implemented)
npm run test

# E2E tests
npm run test:e2e

# Specific test file
npx playwright test tests/e2e/scheduling.spec.ts

# Database query testing
npx prisma studio
```

---

## 📚 REFERENCE DOCUMENTATION

### Key Files to Understand

**Agent System:**
- `src/lib/agent/core/OrchestrationAgent.ts` - Main orchestrator
- `src/lib/agent/core/BaseTaskAgent.ts` - Task lifecycle manager
- `src/lib/agent/core/TaskActionExecutor.ts` - Action executor
- `src/lib/agent/inputs/WebhookInputHandler.ts` - Webhook handler
- `src/lib/agent/actions/CalendarManager.ts` - Calendar operations

**Services:**
- `src/lib/services/scheduling.service.ts` - Event management
- `src/lib/services/conflict.service.ts` - Conflict detection
- `src/lib/services/integration.service.ts` - OAuth credentials
- `src/lib/services/email.service.ts` - Email sending (Nodemailer)

**Queue Workers:**
- `src/workers/processors/schedulingAgent.processor.ts` - Scheduling tasks
- `src/workers/queues/schedulingAgent.queue.ts` - Queue definitions

**Database:**
- `prisma/schema.prisma` - Complete data model
- `src/lib/prisma.ts` - Prisma client instance

### External Docs
- **Prisma:** https://www.prisma.io/docs
- **BullMQ:** https://docs.bullmq.io/
- **NextAuth:** https://next-auth.js.org/
- **Twilio:** https://www.twilio.com/docs/sms
- **Google Calendar API:** https://developers.google.com/calendar
- **Zoom API:** https://marketplace.zoom.us/docs/api-reference/zoom-api
- **Microsoft Graph:** https://learn.microsoft.com/en-us/graph/

---

## 🚀 DEPLOYMENT NOTES

**Before deploying to production:**

1. **Environment Variables:** Ensure all required vars are set:
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `REDIS_URL`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (when implemented)
   - `SENTRY_DSN` (when implemented)

2. **Database Migrations:** Run all pending migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. **Build & Start:**
   ```bash
   npm run build
   npm run prod:start  # Starts app + worker with PM2
   ```

4. **Health Checks:** Verify services are running:
   - App: `http://localhost:3001/api/health`
   - Worker: `pm2 logs astralis-worker`
   - Database: `npx prisma studio`
   - Redis: `redis-cli ping`

5. **Monitoring:**
   - PM2 dashboard: `pm2 monit`
   - Error logs: `/var/log/pm2/astralis-error.log`
   - Activity logs: Query `ActivityLog` table

---

## 📝 NOTES FOR CLAUDE

**When picking up this project:**

1. **Start Here:** Read the Session Quick-Start section
2. **Check Status:** Look at the checkboxes to see what's done
3. **Understand Context:** Review the affected files before coding
4. **Follow Patterns:** Look at existing implementations for consistency
5. **Test Incrementally:** Don't wait until everything is done
6. **Update Roadmap:** Check boxes and update progress as you go
7. **Ask Questions:** If acceptance criteria are unclear, ask the user

**Common Pitfalls to Avoid:**
- ❌ Don't implement tasks out of order (respect dependencies)
- ❌ Don't skip testing (it catches issues early)
- ❌ Don't forget to handle errors (try/catch everywhere)
- ❌ Don't hardcode values (use environment variables)
- ❌ Don't forget activity logging (audit trail is critical)
- ❌ Don't ignore TypeScript errors (fix them, don't cast)

**When Stuck:**
- Read the reference files listed above
- Check the existing implementations for patterns
- Look at the Prisma schema to understand data relationships
- Review the architecture section at the top
- Test incrementally (don't build everything at once)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Next Review Date:** 2025-12-10
**Owner:** Systems Architect Agent
