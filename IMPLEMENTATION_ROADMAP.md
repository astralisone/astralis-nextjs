# IMPLEMENTATION ROADMAP

**Astralis One - Multi-Agent Engineering Platform**
**Last Updated:** 2025-11-26
**Current Phase:** Phase 2 - Core Agent Infrastructure

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

## 🚨 PHASE 1: BLOCKING (Must Do First)

These features are incomplete and block other functionality. Complete these before moving forward.

### 1.1 Email Response Sending → Nodemailer Integration
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:440`
  - `src/lib/services/email.service.ts` (needs enhancement)
- **Dependencies:** SMTP configuration in `.env.local` (already set up)
- **Current State:** TODO comment, no implementation
- **Acceptance Criteria:**
  - [ ] Create `sendSchedulingEmail()` function in email service
  - [ ] Support template types: confirmation, alternatives, clarification, cancellation
  - [ ] Include ICS calendar attachment for confirmations
  - [ ] Handle HTML + plain text email formats
  - [ ] Log email sent to ActivityLog table
  - [ ] Add retry logic for failed sends (3 attempts)
  - [ ] Update SchedulingAgentTask with `emailSentAt` timestamp
- **Implementation Notes:**
  ```typescript
  // Use existing Nodemailer setup from booking system
  // Templates should match booking confirmation format
  // Include meeting details, participant list, time/date
  ```

### 1.2 SMS Response Sending → Twilio API Integration
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:444`
  - Create: `src/lib/services/sms.service.ts`
- **Dependencies:**
  - Twilio account credentials (not yet configured)
  - Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Current State:** TODO comment, no implementation
- **Acceptance Criteria:**
  - [ ] Install and configure Twilio SDK: `npm install twilio`
  - [ ] Create `SmsService` class with `sendSms()` method
  - [ ] Support message types: confirmation, reminder, cancellation
  - [ ] Keep messages under 160 characters (SMS best practice)
  - [ ] Include booking link for confirmations
  - [ ] Log SMS sent to ActivityLog table
  - [ ] Handle delivery status webhooks
  - [ ] Add cost tracking (SMS credits)
- **Implementation Notes:**
  ```typescript
  // SMS format: "Meeting confirmed: [Title] on [Date] at [Time]. Details: [Link]"
  // Use short URLs for links (consider bit.ly integration)
  // Respect opt-out requests (check user preferences)
  ```

### 1.3 Chat Response Sending → WebSocket/Pusher Integration
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** L (8-10 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:448`
  - Create: `src/lib/services/chat.service.ts`
  - Create: `src/lib/websocket/` directory structure
- **Dependencies:**
  - WebSocket server or Pusher account
  - Environment variable: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- **Current State:** TODO comment, no implementation
- **Acceptance Criteria:**
  - [ ] Choose WebSocket solution: Pusher (recommended) or Socket.io
  - [ ] Install Pusher SDK: `npm install pusher pusher-js`
  - [ ] Create `ChatService` class with `sendChatMessage()` method
  - [ ] Implement real-time message delivery
  - [ ] Support rich message formats (text, cards, buttons)
  - [ ] Add typing indicators
  - [ ] Track message read status
  - [ ] Handle offline message queue
- **Implementation Notes:**
  ```typescript
  // Use Pusher channels for organization-scoped messages
  // Channel naming: `org-{orgId}-chat-{userId}`
  // Message format: { type: 'scheduling_update', data: {...}, timestamp: ISO }
  ```

### 1.4 Webhook Notifications → HTTP Callbacks
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/workers/processors/schedulingAgent.processor.ts:452`
  - Create: `src/lib/services/webhook.service.ts`
- **Dependencies:** None (uses native fetch)
- **Current State:** TODO comment, no implementation
- **Acceptance Criteria:**
  - [ ] Create `WebhookService` class with `sendWebhook()` method
  - [ ] Support POST requests with JSON payload
  - [ ] Generate HMAC-SHA256 signatures for webhook security
  - [ ] Implement retry logic with exponential backoff (3 attempts)
  - [ ] Store webhook delivery logs in `WebhookLog` table (create model)
  - [ ] Support custom headers per webhook
  - [ ] Handle 2xx success, 4xx client error, 5xx server error
  - [ ] Timeout after 30 seconds
- **Implementation Notes:**
  ```typescript
  // Signature header: X-Astralis-Signature
  // Payload format: { event: 'task.scheduled', data: {...}, timestamp: ISO }
  // Store webhook URLs in Organization settings
  ```

### 1.5 Task Action Executor Wiring
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** M (4-6 hours)
- **Files:**
  - `src/lib/agent/core/BaseTaskAgent.ts:383`
  - `src/lib/agent/core/TaskActionExecutor.ts` (exists but not wired)
- **Dependencies:** TaskActionExecutor implementation (already exists)
- **Current State:** TODO comment, executor exists but not instantiated
- **Acceptance Criteria:**
  - [ ] Instantiate `TaskActionExecutor` in `BaseTaskAgent` constructor
  - [ ] Wire `executor.executeActions()` call at line 383
  - [ ] Pass task, template, and decision context to executor
  - [ ] Handle execution errors gracefully
  - [ ] Update DecisionLog with execution results
  - [ ] Emit events for each executed action
  - [ ] Support dry-run mode for testing
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

### 1.6 Credential Storage → Encrypted Database
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** L (8-10 hours)
- **Files:**
  - `src/lib/services/integration.service.ts:71-130`
  - `prisma/schema.prisma` (add IntegrationCredential model)
  - Create migration: `npx prisma migrate dev --name add-integration-credentials`
- **Dependencies:**
  - Phase 6 migration (can implement now if prioritized)
  - Encryption utility already exists: `src/lib/utils/crypto.ts`
- **Current State:** Stubbed implementation with placeholders
- **Acceptance Criteria:**
  - [ ] Create Prisma model `IntegrationCredential` with fields:
    - `id`, `userId`, `orgId`, `provider`, `credentialName`
    - `credentialData` (encrypted text), `scope`, `expiresAt`
    - `isActive`, `lastUsedAt`, `createdAt`, `updatedAt`
  - [ ] Implement `saveCredential()` - encrypt and store
  - [ ] Implement `listCredentials()` - return without decrypted data
  - [ ] Implement `getCredentialWithData()` - decrypt for internal use
  - [ ] Implement `refreshToken()` - update OAuth tokens
  - [ ] Implement `deleteCredential()` - soft delete
  - [ ] Add ActivityLog entries for all credential operations
  - [ ] Use AES-256-GCM encryption (already in crypto.ts)
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
- **Status:** [ ] Not Started
- **Priority:** BLOCKING
- **Size:** S (2-3 hours)
- **Files:**
  - `src/lib/agent/inputs/WebhookInputHandler.ts:511-533`
  - Create: `src/lib/utils/webhook-verification.ts`
- **Dependencies:** Node.js crypto module (built-in)
- **Current State:** Placeholder implementation, always returns true
- **Acceptance Criteria:**
  - [ ] Implement proper HMAC-SHA256 signature verification
  - [ ] Support multiple signature algorithms (SHA256, SHA512)
  - [ ] Extract signature from header: `X-Webhook-Signature`
  - [ ] Compare computed hash with provided signature (timing-safe)
  - [ ] Log verification failures with warning level
  - [ ] Support signature version prefixes (e.g., `sha256=...`)
  - [ ] Add configuration for signature header name
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
- **Phase 1 (BLOCKING):** 0/7 tasks (0%)
- **Phase 2 (CRITICAL):** 0/4 tasks (0%)
- **Phase 3 (IMPORTANT):** 0/6 tasks (0%)
- **Phase 4 (NICE-TO-HAVE):** 0/5 tasks (0%)

### Current Sprint Focus
**Recommended order for next 2 weeks:**
1. Task 1.1 - Email Response Sending (M)
2. Task 1.5 - Task Action Executor Wiring (M)
3. Task 1.7 - Webhook Signature Verification (S)
4. Task 1.6 - Credential Storage (L)
5. Task 2.3 - Notification Dispatch System (L)

**Estimated Time:** ~35 hours (1.5 sprints)

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
