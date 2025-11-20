# Phase 5: Scheduling & Calendar Integration

**Duration**: 3 weeks
**Prerequisites**: Phase 1 (Authentication & RBAC), Phase 3 (AI Routing & Background Jobs), Phase 4 (Document Processing)
**Docker Changes**: Worker queue extended with `scheduling-reminders` queue

---

## Phase Overview

This phase implements comprehensive calendar and scheduling capabilities for AstralisOps, including Google Calendar integration, conflict detection, automated reminders, and AI-powered time slot suggestions. By the end of this phase, users can schedule events, sync with external calendars, receive automated reminders, and leverage AI to find optimal meeting times.

### Success Criteria Checklist

- [ ] Users can connect their Google Calendar via OAuth
- [ ] Two-way sync works (AstralisOps ↔ Google Calendar)
- [ ] Scheduling UI shows calendar view with events
- [ ] Conflict detection prevents double-booking
- [ ] Users can set availability preferences
- [ ] AI suggests optimal time slots for meetings
- [ ] Automated email reminders sent 24h and 1h before events
- [ ] Multi-participant scheduling works correctly
- [ ] ICS files generated and attached to emails
- [ ] Calendar events can be created, updated, deleted
- [ ] Worker processes reminder queue successfully
- [ ] All tests pass

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 16 (App Router), TypeScript 5, Prisma ORM, PostgreSQL 16, Redis 7, Docker
**Infrastructure**: DigitalOcean Droplet + Spaces (S3-compatible object storage)

**Brand Design System**:
- **Astralis Navy**: `#0A1B2B` (headings, sidebar, dark backgrounds)
- **Astralis Blue**: `#2B6CB0` (primary buttons, links, accents)
- **Status Colors**: Success `#38A169`, Warning `#DD6B20`, Error `#E53E3E`, Info `#3182CE`
- **Neutrals**: Slate palette (50-950)
- **Font**: Inter (via next/font/google)
- **Border Radius**: 6px (md), 8px (lg), 4px (sm)
- **Spacing**: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

**Database**: Multi-tenant architecture
- Organization → Users → Pipelines → PipelineItems
- Organization → IntakeRequests → Documents → SchedulingEvents
- Organization → CalendarConnections → AvailabilityRules

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) (Phase 2)
**Background Jobs**: BullMQ + Redis (Phase 3)
**AI Services**: OpenAI GPT-4 for routing and scheduling suggestions (Phase 3)
**Document Storage**: DigitalOcean Spaces (Phase 4)
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 5)

```yaml
Active Containers:
- app: Next.js application (port 3001)
  ├── Handles all web requests
  ├── Marketing pages + authenticated dashboard
  ├── NextAuth routes (Phase 1)
  ├── Google Calendar OAuth callback handlers (Phase 5 NEW)
  └── Calendar API endpoints (Phase 5 NEW)

- postgres: PostgreSQL 16 database
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  ├── Auth tables (Phase 1)
  ├── Calendar-related tables (Phase 5 NEW)
  └── AvailabilityRule, CalendarConnection, EventReminder tables

- redis: Redis 7 (Phase 3)
  ├── Job queue storage
  ├── Session cache
  └── Calendar sync cache (Phase 5 NEW)

- worker: Background job processor (Phase 3)
  ├── Queue: intake-routing (Phase 3)
  ├── Queue: email-sending (Phase 3)
  ├── Queue: document-processing (Phase 4)
  ├── Queue: scheduling-reminders (Phase 5 NEW)
  └── Queue: calendar-sync (Phase 5 NEW)

Volumes:
- postgres-data: Database persistence
- redis-data: Redis persistence

Networks:
- astralis-network: Bridge network

Status: Extended worker with scheduling queues
```

---

## Database Schema State (After Phase 5)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// ENUMS
// ========================================

enum Role {
  ADMIN
  OPERATOR
  CLIENT
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum IntakeSource {
  FORM
  EMAIL
  CHAT
  API
}

enum IntakeStatus {
  NEW
  ROUTING
  ASSIGNED
  PROCESSING
  COMPLETED
  REJECTED
}

enum EventStatus {
  SCHEDULED
  CONFIRMED
  CANCELLED
  COMPLETED
  CONFLICT
}

enum CalendarProvider {
  GOOGLE
  MICROSOFT
  APPLE
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
}

// ========================================
// CORE MODELS (Phase 1)
// ========================================

model Organization {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  users                User[]
  pipelines            Pipeline[]
  documents            Document[]
  intakeRequests       IntakeRequest[]
  automations          Automation[]
  schedulingEvents     SchedulingEvent[]
  calendarConnections  CalendarConnection[]  // Phase 5
  availabilityRules    AvailabilityRule[]    // Phase 5

  @@index([createdAt])
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  emailVerified    DateTime?
  name             String?
  password         String?
  image            String?
  role             Role      @default(OPERATOR)
  orgId            String
  isActive         Boolean   @default(true)
  lastLoginAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  organization         Organization          @relation(fields: [orgId], references: [id])
  pipelines            Pipeline[]            @relation("PipelineOperators")
  accounts             Account[]
  sessions             Session[]
  activityLogs         ActivityLog[]
  calendarConnections  CalendarConnection[]  // Phase 5
  availabilityRules    AvailabilityRule[]    // Phase 5

  @@index([orgId])
  @@index([email])
  @@index([isActive])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
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
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@index([token])
}

model ActivityLog {
  id          String    @id @default(cuid())
  userId      String?
  orgId       String
  action      String
  entity      String
  entityId    String?
  changes     Json?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([orgId])
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// ========================================
// PIPELINE MODELS (Phase 2)
// ========================================

model Pipeline {
  id           String        @id @default(cuid())
  name         String
  orgId        String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  organization   Organization    @relation(fields: [orgId], references: [id])
  stages         Stage[]
  operators      User[]          @relation("PipelineOperators")
  intakeRequests IntakeRequest[]

  @@index([orgId])
  @@index([createdAt])
}

model Stage {
  id         String       @id @default(cuid())
  name       String
  order      Int
  pipelineId String

  pipeline   Pipeline       @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  items      PipelineItem[]

  @@index([pipelineId])
  @@index([order])
}

model PipelineItem {
  id        String       @id @default(cuid())
  title     String
  data      Json
  stageId   String
  createdAt DateTime     @default(now())

  stage     Stage        @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@index([stageId])
  @@index([createdAt])
}

// ========================================
// DOCUMENT MODELS (Phase 4)
// ========================================

model Document {
  id              String         @id @default(cuid())
  fileName        String
  filePath        String
  fileSize        Int
  mimeType        String
  status          DocumentStatus @default(PENDING)
  ocrText         String?        @db.Text
  extractedData   Json?
  metadata        Json?
  uploadedBy      String
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([createdAt])
}

// ========================================
// INTAKE MODELS (Phase 3)
// ========================================

model IntakeRequest {
  id              String         @id @default(cuid())
  source          IntakeSource
  status          IntakeStatus   @default(NEW)
  title           String
  description     String?        @db.Text
  requestData     Json
  aiRoutingMeta   Json?
  assignedPipeline String?
  priority        Int            @default(0)
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])
  pipeline        Pipeline?      @relation(fields: [assignedPipeline], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([source])
  @@index([createdAt])
  @@index([priority])
}

// ========================================
// AUTOMATION MODELS (Phase 3)
// ========================================

model Automation {
  id              String         @id @default(cuid())
  name            String
  description     String?        @db.Text
  workflowId      String?
  webhookUrl      String?
  isActive        Boolean        @default(true)
  triggerConfig   Json
  lastRunAt       DateTime?
  runCount        Int            @default(0)
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  organization    Organization   @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([isActive])
  @@index([workflowId])
}

// ========================================
// SCHEDULING MODELS (Phase 5 - Enhanced)
// ========================================

model SchedulingEvent {
  id                  String         @id @default(cuid())
  title               String
  description         String?        @db.Text
  startTime           DateTime
  endTime             DateTime
  participants        Json           // Array of { userId, email, name, status }
  location            String?        // Physical or virtual location
  meetingLink         String?        // Zoom, Google Meet, etc.
  calendarIntegration Json?          // External calendar IDs
  aiScheduled         Boolean        @default(false)
  aiSuggestionMeta    Json?          // AI reasoning for suggested time
  status              EventStatus    @default(SCHEDULED)
  conflictData        Json?          // Details about conflicts
  orgId               String
  createdBy           String?
  reminders           EventReminder[] // Phase 5
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  organization        Organization   @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([startTime])
  @@index([endTime])
  @@index([aiScheduled])
  @@index([createdBy])
}

// Phase 5: NEW - Calendar Connections
model CalendarConnection {
  id              String            @id @default(cuid())
  userId          String
  orgId           String
  provider        CalendarProvider
  providerEmail   String
  providerCalendarId String?        // The specific calendar ID (for providers with multiple calendars)
  accessToken     String            @db.Text
  refreshToken    String?           @db.Text
  tokenExpiry     DateTime?
  isActive        Boolean           @default(true)
  lastSyncAt      DateTime?
  syncEnabled     Boolean           @default(true)
  metadata        Json?             // Provider-specific data
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization      @relation(fields: [orgId], references: [id])

  @@unique([userId, provider, providerCalendarId])
  @@index([userId])
  @@index([orgId])
  @@index([provider])
  @@index([isActive])
  @@index([lastSyncAt])
}

// Phase 5: NEW - Availability Rules
model AvailabilityRule {
  id              String       @id @default(cuid())
  userId          String
  orgId           String
  dayOfWeek       DayOfWeek
  startTime       String       // Format: "09:00"
  endTime         String       // Format: "17:00"
  timezone        String       // IANA timezone (e.g., "America/New_York")
  isActive        Boolean      @default(true)
  metadata        Json?        // Additional settings (buffer time, etc.)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [orgId], references: [id])

  @@index([userId])
  @@index([orgId])
  @@index([dayOfWeek])
  @@index([isActive])
}

// Phase 5: NEW - Event Reminders
model EventReminder {
  id              String         @id @default(cuid())
  eventId         String
  recipientEmail  String
  reminderTime    DateTime       // When to send the reminder
  status          ReminderStatus @default(PENDING)
  sentAt          DateTime?
  errorMessage    String?        @db.Text
  metadata        Json?          // Template data, retry count, etc.
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  event           SchedulingEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([status])
  @@index([reminderTime])
  @@index([recipientEmail])
}
```

---

## Environment Variables (Cumulative After Phase 5)

Create/update `.env.local`:

```bash
# ========================================
# DATABASE
# ========================================
DATABASE_URL="postgresql://astralis_user:secure_password@postgres:5432/astralis_one"

# ========================================
# NEXTAUTH (Phase 1)
# ========================================
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-generated-with-openssl-rand"
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth for Authentication (Phase 1)
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# ========================================
# EMAIL (Phase 1)
# ========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ========================================
# API
# ========================================
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# ========================================
# ANALYTICS (Existing)
# ========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"

# ========================================
# REDIS (Phase 3)
# ========================================
REDIS_URL="redis://redis:6379"
REDIS_PASSWORD="your-secure-redis-password"

# ========================================
# OPENAI (Phase 3)
# ========================================
OPENAI_API_KEY="sk-proj-your-openai-api-key"
OPENAI_MODEL="gpt-4"

# ========================================
# DIGITALOCEAN SPACES (Phase 4)
# ========================================
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_BUCKET="astralis-documents"
SPACES_ACCESS_KEY="your-spaces-access-key"
SPACES_SECRET_KEY="your-spaces-secret-key"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"
SPACES_REGION="nyc3"

# ========================================
# GOOGLE CALENDAR (Phase 5 - NEW)
# ========================================
# Google Calendar API OAuth credentials (separate from auth OAuth)
# Get these from Google Cloud Console with Calendar API enabled
GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3001/api/calendar/callback"

# Google Calendar API Scopes (space-separated, used in OAuth)
GOOGLE_CALENDAR_SCOPES="https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"

# Production values:
# GOOGLE_CALENDAR_REDIRECT_URI="https://app.astralisone.com/api/calendar/callback"
```

### Setting Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3001/api/calendar/callback` (development)
   - `https://app.astralisone.com/api/calendar/callback` (production)
7. Copy **Client ID** and **Client Secret** to `.env.local`

---

## File Structure (After Phase 5)

```
src/
├── app/
│   ├── (marketing)/                    # Existing marketing pages
│   ├── (app)/                          # Authenticated dashboard (Phase 2)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── pipelines/
│   │   ├── intake/
│   │   ├── calendar/                   # [ADDED IN PHASE 5]
│   │   │   ├── page.tsx               # Calendar view with events
│   │   │   ├── availability/
│   │   │   │   └── page.tsx           # Availability settings
│   │   │   └── connections/
│   │   │       └── page.tsx           # Manage calendar connections
│   │   └── settings/
│   ├── api/
│   │   ├── auth/                       # Phase 1
│   │   ├── calendar/                   # [ADDED IN PHASE 5]
│   │   │   ├── connect/
│   │   │   │   └── route.ts           # Initiate OAuth flow
│   │   │   ├── callback/
│   │   │   │   └── route.ts           # OAuth callback handler
│   │   │   ├── disconnect/
│   │   │   │   └── route.ts           # Disconnect calendar
│   │   │   ├── sync/
│   │   │   │   └── route.ts           # Manual sync trigger
│   │   │   └── events/
│   │   │       ├── route.ts           # GET (list), POST (create)
│   │   │       └── [id]/
│   │   │           └── route.ts       # GET, PUT, DELETE event
│   │   ├── availability/               # [ADDED IN PHASE 5]
│   │   │   ├── route.ts               # GET, POST availability rules
│   │   │   └── [id]/
│   │   │       └── route.ts           # PUT, DELETE rule
│   │   ├── scheduling/                 # [ADDED IN PHASE 5]
│   │   │   ├── suggest/
│   │   │   │   └── route.ts           # AI time slot suggestions
│   │   │   └── conflicts/
│   │   │       └── route.ts           # Check for conflicts
│   │   ├── booking/                    # Existing
│   │   ├── contact/                    # Existing
│   │   ├── intake/                     # Phase 3
│   │   └── pipelines/                  # Existing
│   ├── auth/                           # Phase 1
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                             # Existing (Button, Input, Card, etc.)
│   ├── auth/                           # Phase 1
│   ├── dashboard/                      # Phase 2
│   ├── calendar/                       # [ADDED IN PHASE 5]
│   │   ├── CalendarView.tsx           # Month/week/day calendar grid
│   │   ├── EventCard.tsx              # Display event details
│   │   ├── EventForm.tsx              # Create/edit event form
│   │   ├── ConflictDetector.tsx       # Show conflicts visually
│   │   ├── AvailabilityEditor.tsx     # Set weekly availability
│   │   ├── CalendarConnectionCard.tsx # Connected calendar card
│   │   ├── TimeSlotSuggestions.tsx    # AI suggested slots
│   │   └── ReminderSettings.tsx       # Configure reminders
│   ├── layout/                         # Existing
│   └── sections/                       # Existing
├── hooks/                              # Phase 2
│   ├── useCalendar.ts                 # [ADDED IN PHASE 5]
│   ├── useAvailability.ts             # [ADDED IN PHASE 5]
│   ├── useScheduling.ts               # [ADDED IN PHASE 5]
│   ├── usePipelines.ts
│   ├── useIntake.ts
│   └── index.ts
├── lib/
│   ├── auth/                           # Phase 1
│   ├── middleware/                     # Phase 1
│   ├── services/
│   │   ├── authService.ts             # Phase 1
│   │   ├── emailService.ts            # Phase 1, 3
│   │   ├── aiRoutingService.ts        # Phase 3
│   │   ├── documentService.ts         # Phase 4
│   │   ├── calendarService.ts         # [ADDED IN PHASE 5]
│   │   ├── googleCalendarService.ts   # [ADDED IN PHASE 5]
│   │   ├── schedulingService.ts       # [ADDED IN PHASE 5]
│   │   └── conflictService.ts         # [ADDED IN PHASE 5]
│   ├── validators/
│   │   ├── authSchemas.ts             # Phase 1
│   │   ├── intakeSchemas.ts           # Phase 3
│   │   ├── documentSchemas.ts         # Phase 4
│   │   └── schedulingSchemas.ts       # [ADDED IN PHASE 5]
│   ├── calendar.ts                     # Enhanced ICS generation [UPDATED IN PHASE 5]
│   ├── email.ts                        # Existing
│   ├── prisma.ts                       # Existing
│   └── utils.ts                        # Existing
├── workers/                            # Phase 3
│   ├── index.ts                        # Main worker entry
│   ├── queues/
│   │   ├── intakeRoutingQueue.ts      # Phase 3
│   │   ├── emailSendingQueue.ts       # Phase 3
│   │   ├── documentProcessingQueue.ts # Phase 4
│   │   ├── schedulingRemindersQueue.ts # [ADDED IN PHASE 5]
│   │   └── calendarSyncQueue.ts       # [ADDED IN PHASE 5]
│   └── jobs/
│       ├── intakeRoutingJob.ts        # Phase 3
│       ├── emailSendingJob.ts         # Phase 3
│       ├── documentProcessingJob.ts   # Phase 4
│       ├── schedulingReminderJob.ts   # [ADDED IN PHASE 5]
│       └── calendarSyncJob.ts         # [ADDED IN PHASE 5]
├── stores/                             # Phase 2
│   ├── dashboardStore.ts
│   ├── pipelineStore.ts
│   ├── calendarStore.ts               # [ADDED IN PHASE 5]
│   └── index.ts
└── types/
    ├── next-auth.d.ts                  # Phase 1
    ├── dashboard.ts                    # Phase 2
    ├── scheduling.ts                   # [ADDED IN PHASE 5]
    └── calendar.ts                     # [ADDED IN PHASE 5]
```

---

## Implementation Steps

### Step 1: Database Migration for Calendar Tables

Create new Prisma migration:

```bash
cd /home/deploy/astralis-nextjs

# Create migration file
npx prisma migrate dev --name add_calendar_tables
```

The migration will create:
- `CalendarConnection` table
- `AvailabilityRule` table
- `EventReminder` table
- Updates to `SchedulingEvent` table
- New enums: `CalendarProvider`, `DayOfWeek`, `ReminderStatus`

Verify migration:

```bash
# Check database
npx prisma studio

# Verify tables exist
psql $DATABASE_URL -c "\dt"
```

### Step 2: Install Calendar Dependencies

```bash
cd /home/deploy/astralis-nextjs

# Install Google Calendar API client
npm install googleapis

# Install date/time utilities
npm install date-fns date-fns-tz

# Install calendar UI library
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Install timezone support
npm install luxon

# Verify installation
npm list googleapis @fullcalendar/react date-fns-tz
```

### Step 3: Create TypeScript Types

Create `src/types/calendar.ts`:

```typescript
import { CalendarProvider, EventStatus, ReminderStatus } from '@prisma/client';

// ========================================
// GOOGLE CALENDAR TYPES
// ========================================

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    conferenceSolution?: {
      name: string;
    };
    entryPoints?: Array<{
      uri: string;
      entryPointType: string;
    }>;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
}

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole: 'owner' | 'writer' | 'reader';
  primary?: boolean;
}

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type: string;
  scope: string;
}

// ========================================
// CALENDAR CONNECTION TYPES
// ========================================

export interface CalendarConnection {
  id: string;
  userId: string;
  orgId: string;
  provider: CalendarProvider;
  providerEmail: string;
  providerCalendarId: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncEnabled: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarConnectionCreateInput {
  provider: CalendarProvider;
  providerEmail: string;
  providerCalendarId?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

// ========================================
// SCHEDULING EVENT TYPES
// ========================================

export interface EventParticipant {
  userId?: string;
  email: string;
  name: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  isOptional?: boolean;
}

export interface SchedulingEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  participants: EventParticipant[];
  location: string | null;
  meetingLink: string | null;
  calendarIntegration: Record<string, string> | null; // { google: 'event_id', microsoft: 'event_id' }
  aiScheduled: boolean;
  aiSuggestionMeta: any | null;
  status: EventStatus;
  conflictData: any | null;
  orgId: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchedulingEventCreateInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participants: EventParticipant[];
  location?: string;
  meetingLink?: string;
  aiScheduled?: boolean;
  aiSuggestionMeta?: any;
}

// ========================================
// AVAILABILITY TYPES
// ========================================

export interface AvailabilityRule {
  id: string;
  userId: string;
  orgId: string;
  dayOfWeek: string; // MONDAY, TUESDAY, etc.
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  isActive: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityRuleCreateInput {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  metadata?: Record<string, any>;
}

export interface WeeklyAvailability {
  [key: string]: Array<{ startTime: string; endTime: string }>; // key is DayOfWeek
}

// ========================================
// TIME SLOT SUGGESTION TYPES
// ========================================

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  score: number; // 0-100, higher is better
  reason: string;
  conflicts: number;
}

export interface TimeSlotSuggestionRequest {
  participants: string[]; // User IDs or emails
  duration: number; // Minutes
  preferredDateRange: {
    start: Date;
    end: Date;
  };
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  timezone: string;
}

export interface TimeSlotSuggestionResponse {
  suggestions: TimeSlot[];
  aiReasoning: string;
  metadata: {
    totalSlotsAnalyzed: number;
    participantsAnalyzed: number;
    conflictsFound: number;
  };
}

// ========================================
// CONFLICT DETECTION TYPES
// ========================================

export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: Array<{
    eventId: string;
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    participants: string[];
    source: 'internal' | 'google' | 'microsoft';
  }>;
}

// ========================================
// REMINDER TYPES
// ========================================

export interface EventReminder {
  id: string;
  eventId: string;
  recipientEmail: string;
  reminderTime: Date;
  status: ReminderStatus;
  sentAt: Date | null;
  errorMessage: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// CALENDAR VIEW TYPES
// ========================================

export interface CalendarViewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  textColor?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    participants?: EventParticipant[];
    status?: EventStatus;
    source?: 'internal' | 'google' | 'microsoft';
  };
}
```

Create `src/types/scheduling.ts`:

```typescript
import { z } from 'zod';

// ========================================
// ZOD VALIDATION SCHEMAS
// ========================================

export const participantSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  status: z.enum(['pending', 'accepted', 'declined', 'tentative']),
  isOptional: z.boolean().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  participants: z.array(participantSchema).min(1, 'At least one participant required'),
  location: z.string().max(500).optional(),
  meetingLink: z.string().url().optional(),
  aiScheduled: z.boolean().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const updateEventSchema = createEventSchema.partial();

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:mm)'),
  timezone: z.string(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const suggestTimeSlotsSchema = z.object({
  participants: z.array(z.string()).min(1, 'At least one participant required'),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  preferredDateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  preferredTimeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
  timezone: z.string(),
});

export const checkConflictSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  participants: z.array(z.string()).min(1),
  excludeEventId: z.string().optional(), // When editing existing event
});

// ========================================
// TYPE EXPORTS
// ========================================

export type ParticipantInput = z.infer<typeof participantSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;
export type SuggestTimeSlotsInput = z.infer<typeof suggestTimeSlotsSchema>;
export type CheckConflictInput = z.infer<typeof checkConflictSchema>;
```

### Step 4: Create Google Calendar Service

Create `src/lib/services/googleCalendarService.ts`:

```typescript
import { google, calendar_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarEvent, GoogleOAuthTokens, GoogleCalendarListEntry } from '@/types/calendar';

/**
 * Google Calendar Service
 * Handles all interactions with Google Calendar API
 */

export class GoogleCalendarService {
  private static SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  /**
   * Get OAuth2 client for authorization flow
   */
  static getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );

    return oauth2Client;
  }

  /**
   * Generate authorization URL for user to connect calendar
   */
  static getAuthorizationUrl(userId: string, orgId: string): string {
    const oauth2Client = this.getOAuth2Client();

    const state = Buffer.from(JSON.stringify({ userId, orgId })).toString('base64');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      state,
      prompt: 'consent', // Force consent to get refresh token
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  static async getTokensFromCode(code: string): Promise<GoogleOAuthTokens> {
    const oauth2Client = this.getOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope || this.SCOPES.join(' '),
    };
  }

  /**
   * Get authenticated calendar client for a user's connection
   */
  static async getAuthenticatedClient(connectionId: string) {
    const connection = await prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.isActive) {
      throw new Error('Calendar connection not found or inactive');
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.tokenExpiry ? connection.tokenExpiry.getTime() : undefined,
    });

    // Refresh token if expired
    if (connection.tokenExpiry && connection.tokenExpiry < new Date()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update stored tokens
        await prisma.calendarConnection.update({
          where: { id: connectionId },
          data: {
            accessToken: credentials.access_token!,
            refreshToken: credentials.refresh_token || connection.refreshToken,
            tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        });

        oauth2Client.setCredentials(credentials);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Mark connection as inactive
        await prisma.calendarConnection.update({
          where: { id: connectionId },
          data: { isActive: false },
        });
        throw new Error('Calendar connection expired. Please reconnect.');
      }
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    return { calendar, connection };
  }

  /**
   * List user's calendars
   */
  static async listCalendars(connectionId: string): Promise<GoogleCalendarListEntry[]> {
    const { calendar } = await this.getAuthenticatedClient(connectionId);

    const response = await calendar.calendarList.list();

    return (response.data.items || []).map((item) => ({
      id: item.id!,
      summary: item.summary || 'Unnamed Calendar',
      description: item.description,
      timeZone: item.timeZone || 'UTC',
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      accessRole: item.accessRole as any,
      primary: item.primary,
    }));
  }

  /**
   * Get events from Google Calendar
   */
  static async getEvents(
    connectionId: string,
    options: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
      calendarId?: string;
    } = {}
  ): Promise<GoogleCalendarEvent[]> {
    const { calendar, connection } = await this.getAuthenticatedClient(connectionId);

    const calendarId = options.calendarId || connection.providerCalendarId || 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin: options.timeMin?.toISOString(),
      timeMax: options.timeMax?.toISOString(),
      maxResults: options.maxResults || 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []) as GoogleCalendarEvent[];
  }

  /**
   * Create event in Google Calendar
   */
  static async createEvent(
    connectionId: string,
    event: {
      summary: string;
      description?: string;
      location?: string;
      startTime: Date;
      endTime: Date;
      attendees?: Array<{ email: string; displayName?: string }>;
      conferenceData?: boolean;
    },
    calendarId?: string
  ): Promise<GoogleCalendarEvent> {
    const { calendar, connection } = await this.getAuthenticatedClient(connectionId);

    const targetCalendarId = calendarId || connection.providerCalendarId || 'primary';

    const eventData: calendar_v3.Schema$Event = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        displayName: a.displayName,
      })),
    };

    const params: any = {
      calendarId: targetCalendarId,
      requestBody: eventData,
    };

    if (event.conferenceData) {
      params.conferenceDataVersion = 1;
      eventData.conferenceData = {
        createRequest: {
          requestId: `astralis-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const response = await calendar.events.insert(params);

    return response.data as GoogleCalendarEvent;
  }

  /**
   * Update event in Google Calendar
   */
  static async updateEvent(
    connectionId: string,
    eventId: string,
    updates: {
      summary?: string;
      description?: string;
      location?: string;
      startTime?: Date;
      endTime?: Date;
      attendees?: Array<{ email: string; displayName?: string }>;
    },
    calendarId?: string
  ): Promise<GoogleCalendarEvent> {
    const { calendar, connection } = await this.getAuthenticatedClient(connectionId);

    const targetCalendarId = calendarId || connection.providerCalendarId || 'primary';

    const eventData: calendar_v3.Schema$Event = {};

    if (updates.summary) eventData.summary = updates.summary;
    if (updates.description !== undefined) eventData.description = updates.description;
    if (updates.location !== undefined) eventData.location = updates.location;
    if (updates.startTime) {
      eventData.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'UTC',
      };
    }
    if (updates.endTime) {
      eventData.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'UTC',
      };
    }
    if (updates.attendees) {
      eventData.attendees = updates.attendees.map((a) => ({
        email: a.email,
        displayName: a.displayName,
      }));
    }

    const response = await calendar.events.patch({
      calendarId: targetCalendarId,
      eventId,
      requestBody: eventData,
    });

    return response.data as GoogleCalendarEvent;
  }

  /**
   * Delete event from Google Calendar
   */
  static async deleteEvent(
    connectionId: string,
    eventId: string,
    calendarId?: string
  ): Promise<void> {
    const { calendar, connection } = await this.getAuthenticatedClient(connectionId);

    const targetCalendarId = calendarId || connection.providerCalendarId || 'primary';

    await calendar.events.delete({
      calendarId: targetCalendarId,
      eventId,
    });
  }

  /**
   * Sync events from Google Calendar to AstralisOps
   */
  static async syncEventsToAstralis(
    connectionId: string,
    orgId: string,
    options: {
      timeMin?: Date;
      timeMax?: Date;
    } = {}
  ): Promise<{ imported: number; updated: number; errors: number }> {
    const googleEvents = await this.getEvents(connectionId, options);

    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const gEvent of googleEvents) {
      try {
        if (!gEvent.start?.dateTime || !gEvent.end?.dateTime) {
          // Skip all-day events for now
          continue;
        }

        const startTime = new Date(gEvent.start.dateTime);
        const endTime = new Date(gEvent.end.dateTime);

        // Check if event already exists
        const existing = await prisma.schedulingEvent.findFirst({
          where: {
            orgId,
            calendarIntegration: {
              path: ['google'],
              equals: gEvent.id,
            },
          },
        });

        const eventData = {
          title: gEvent.summary || 'Untitled Event',
          description: gEvent.description,
          startTime,
          endTime,
          participants: (gEvent.attendees || []).map((a) => ({
            email: a.email!,
            name: a.displayName || a.email!,
            status: a.responseStatus === 'accepted' ? 'accepted' : 'pending',
          })),
          location: gEvent.location,
          meetingLink: gEvent.hangoutLink || gEvent.conferenceData?.entryPoints?.[0]?.uri,
          calendarIntegration: { google: gEvent.id },
          status: gEvent.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
        };

        if (existing) {
          await prisma.schedulingEvent.update({
            where: { id: existing.id },
            data: eventData,
          });
          updated++;
        } else {
          await prisma.schedulingEvent.create({
            data: {
              ...eventData,
              orgId,
            },
          });
          imported++;
        }
      } catch (error) {
        console.error(`Failed to sync event ${gEvent.id}:`, error);
        errors++;
      }
    }

    // Update last sync time
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    return { imported, updated, errors };
  }

  /**
   * Sync AstralisOps event to Google Calendar
   */
  static async syncEventToGoogle(
    eventId: string,
    connectionId: string
  ): Promise<string> {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const googleEventId = (event.calendarIntegration as any)?.google;

    const eventData = {
      summary: event.title,
      description: event.description || undefined,
      location: event.location || undefined,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: (event.participants as any[]).map((p) => ({
        email: p.email,
        displayName: p.name,
      })),
      conferenceData: !!event.meetingLink,
    };

    let newGoogleEventId: string;

    if (googleEventId) {
      // Update existing
      const updated = await this.updateEvent(connectionId, googleEventId, eventData);
      newGoogleEventId = updated.id!;
    } else {
      // Create new
      const created = await this.createEvent(connectionId, eventData);
      newGoogleEventId = created.id!;
    }

    // Update AstralisOps event with Google event ID
    await prisma.schedulingEvent.update({
      where: { id: eventId },
      data: {
        calendarIntegration: {
          ...(event.calendarIntegration as object || {}),
          google: newGoogleEventId,
        },
      },
    });

    return newGoogleEventId;
  }
}
```

### Step 5: Create Scheduling Service with Conflict Detection

Create `src/lib/services/schedulingService.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import {
  SchedulingEvent,
  SchedulingEventCreateInput,
  EventParticipant,
  ConflictCheck,
} from '@/types/calendar';
import { EventStatus } from '@prisma/client';
import { GoogleCalendarService } from './googleCalendarService';

/**
 * Scheduling Service
 * Core business logic for event creation, updates, and conflict detection
 */

export class SchedulingService {
  /**
   * Create a new scheduling event
   */
  static async createEvent(
    orgId: string,
    createdBy: string,
    input: SchedulingEventCreateInput
  ): Promise<SchedulingEvent> {
    // Check for conflicts
    const conflicts = await this.checkConflicts(
      orgId,
      input.startTime,
      input.endTime,
      input.participants.map((p) => p.email)
    );

    const status: EventStatus = conflicts.hasConflict ? 'CONFLICT' : 'SCHEDULED';

    const event = await prisma.schedulingEvent.create({
      data: {
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        participants: input.participants,
        location: input.location,
        meetingLink: input.meetingLink,
        aiScheduled: input.aiScheduled || false,
        aiSuggestionMeta: input.aiSuggestionMeta,
        status,
        conflictData: conflicts.hasConflict ? conflicts.conflicts : null,
        orgId,
        createdBy,
      },
    });

    // Create reminders (24h and 1h before)
    await this.createReminders(event.id, input.participants, input.startTime);

    // Sync to connected calendars
    await this.syncEventToConnectedCalendars(orgId, createdBy, event.id);

    return event as SchedulingEvent;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    eventId: string,
    updates: Partial<SchedulingEventCreateInput>
  ): Promise<SchedulingEvent> {
    const existing = await prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      throw new Error('Event not found');
    }

    // Re-check conflicts if time or participants changed
    let conflictData = existing.conflictData;
    let status = existing.status;

    if (updates.startTime || updates.endTime || updates.participants) {
      const conflicts = await this.checkConflicts(
        existing.orgId,
        updates.startTime || existing.startTime,
        updates.endTime || existing.endTime,
        (updates.participants || existing.participants as EventParticipant[]).map((p) => p.email),
        eventId // Exclude current event from conflict check
      );

      if (conflicts.hasConflict) {
        status = 'CONFLICT';
        conflictData = conflicts.conflicts;
      } else if (status === 'CONFLICT') {
        // Conflict resolved
        status = 'SCHEDULED';
        conflictData = null;
      }
    }

    const updated = await prisma.schedulingEvent.update({
      where: { id: eventId },
      data: {
        ...updates,
        status,
        conflictData,
      },
    });

    // Update reminders if time changed
    if (updates.startTime) {
      await this.updateReminders(
        eventId,
        updates.participants || existing.participants as EventParticipant[],
        updates.startTime
      );
    }

    // Sync to connected calendars
    if (existing.createdBy) {
      await this.syncEventToConnectedCalendars(existing.orgId, existing.createdBy, eventId);
    }

    return updated as SchedulingEvent;
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    const event = await prisma.schedulingEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Delete from connected calendars
    const calendarIntegration = event.calendarIntegration as any;
    if (calendarIntegration?.google && event.createdBy) {
      try {
        const connections = await prisma.calendarConnection.findMany({
          where: {
            userId: event.createdBy,
            provider: 'GOOGLE',
            isActive: true,
          },
        });

        for (const conn of connections) {
          try {
            await GoogleCalendarService.deleteEvent(conn.id, calendarIntegration.google);
          } catch (error) {
            console.error('Failed to delete from Google Calendar:', error);
          }
        }
      } catch (error) {
        console.error('Error deleting from calendars:', error);
      }
    }

    // Delete reminders and event
    await prisma.eventReminder.deleteMany({
      where: { eventId },
    });

    await prisma.schedulingEvent.delete({
      where: { id: eventId },
    });
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkConflicts(
    orgId: string,
    startTime: Date,
    endTime: Date,
    participantEmails: string[],
    excludeEventId?: string
  ): Promise<ConflictCheck> {
    // Find all events in the time range for these participants
    const conflictingEvents = await prisma.schedulingEvent.findMany({
      where: {
        orgId,
        id: excludeEventId ? { not: excludeEventId } : undefined,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          {
            // Event starts during the new event
            startTime: {
              gte: startTime,
              lt: endTime,
            },
          },
          {
            // Event ends during the new event
            endTime: {
              gt: startTime,
              lte: endTime,
            },
          },
          {
            // Event completely encompasses the new event
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    // Filter to events with overlapping participants
    const conflicts = conflictingEvents.filter((event) => {
      const eventParticipants = event.participants as EventParticipant[];
      return eventParticipants.some((p) => participantEmails.includes(p.email));
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map((event) => ({
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        participants: (event.participants as EventParticipant[]).map((p) => p.email),
        source: 'internal',
      })),
    };
  }

  /**
   * Create reminders for an event
   */
  private static async createReminders(
    eventId: string,
    participants: EventParticipant[],
    eventStartTime: Date
  ): Promise<void> {
    const now = new Date();

    // 24 hours before
    const reminder24h = new Date(eventStartTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      for (const participant of participants) {
        await prisma.eventReminder.create({
          data: {
            eventId,
            recipientEmail: participant.email,
            reminderTime: reminder24h,
            status: 'PENDING',
          },
        });
      }
    }

    // 1 hour before
    const reminder1h = new Date(eventStartTime.getTime() - 60 * 60 * 1000);
    if (reminder1h > now) {
      for (const participant of participants) {
        await prisma.eventReminder.create({
          data: {
            eventId,
            recipientEmail: participant.email,
            reminderTime: reminder1h,
            status: 'PENDING',
          },
        });
      }
    }
  }

  /**
   * Update reminders when event time changes
   */
  private static async updateReminders(
    eventId: string,
    participants: EventParticipant[],
    newStartTime: Date
  ): Promise<void> {
    // Delete existing pending reminders
    await prisma.eventReminder.deleteMany({
      where: {
        eventId,
        status: 'PENDING',
      },
    });

    // Create new reminders
    await this.createReminders(eventId, participants, newStartTime);
  }

  /**
   * Sync event to user's connected calendars
   */
  private static async syncEventToConnectedCalendars(
    orgId: string,
    userId: string,
    eventId: string
  ): Promise<void> {
    try {
      const connections = await prisma.calendarConnection.findMany({
        where: {
          userId,
          orgId,
          isActive: true,
          syncEnabled: true,
        },
      });

      for (const connection of connections) {
        try {
          if (connection.provider === 'GOOGLE') {
            await GoogleCalendarService.syncEventToGoogle(eventId, connection.id);
          }
          // Add support for other providers (Microsoft, Apple) here
        } catch (error) {
          console.error(`Failed to sync to ${connection.provider}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing to calendars:', error);
    }
  }

  /**
   * Get events for a user within a date range
   */
  static async getEvents(
    orgId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      status?: EventStatus[];
    } = {}
  ): Promise<SchedulingEvent[]> {
    const where: any = { orgId };

    if (options.startDate || options.endDate) {
      where.AND = [];
      if (options.startDate) {
        where.AND.push({ endTime: { gte: options.startDate } });
      }
      if (options.endDate) {
        where.AND.push({ startTime: { lte: options.endDate } });
      }
    }

    if (options.status) {
      where.status = { in: options.status };
    }

    const events = await prisma.schedulingEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    return events as SchedulingEvent[];
  }
}
```

### Step 6: Create AI-Powered Time Slot Suggestion Service

Create `src/lib/services/aiSchedulingService.ts`:

```typescript
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import {
  TimeSlot,
  TimeSlotSuggestionRequest,
  TimeSlotSuggestionResponse,
} from '@/types/calendar';
import { addDays, addMinutes, format, setHours, setMinutes, startOfDay } from 'date-fns';

/**
 * AI Scheduling Service
 * Uses OpenAI to suggest optimal meeting times based on availability and preferences
 */

export class AISchedulingService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Suggest optimal time slots for a meeting
   */
  static async suggestTimeSlots(
    orgId: string,
    request: TimeSlotSuggestionRequest
  ): Promise<TimeSlotSuggestionResponse> {
    // 1. Gather availability data for all participants
    const availabilityData = await this.gatherAvailability(orgId, request);

    // 2. Find all potential time slots
    const potentialSlots = this.generatePotentialSlots(request);

    // 3. Score each slot based on availability and conflicts
    const scoredSlots = await this.scoreTimeSlots(
      orgId,
      potentialSlots,
      availabilityData,
      request
    );

    // 4. Use AI to rank and provide reasoning
    const aiRankedSlots = await this.rankSlotsWithAI(
      scoredSlots,
      availabilityData,
      request
    );

    return {
      suggestions: aiRankedSlots.slice(0, 5), // Top 5 suggestions
      aiReasoning: aiRankedSlots.length > 0
        ? `Analyzed ${potentialSlots.length} potential time slots. ${aiRankedSlots[0].reason}`
        : 'No suitable time slots found in the specified range.',
      metadata: {
        totalSlotsAnalyzed: potentialSlots.length,
        participantsAnalyzed: request.participants.length,
        conflictsFound: scoredSlots.filter((s) => s.conflicts > 0).length,
      },
    };
  }

  /**
   * Gather availability rules and existing events for participants
   */
  private static async gatherAvailability(
    orgId: string,
    request: TimeSlotSuggestionRequest
  ) {
    // Get user IDs from emails
    const users = await prisma.user.findMany({
      where: {
        orgId,
        email: { in: request.participants },
      },
      include: {
        availabilityRules: {
          where: { isActive: true },
        },
      },
    });

    // Get existing events for participants in date range
    const existingEvents = await prisma.schedulingEvent.findMany({
      where: {
        orgId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        startTime: { gte: request.preferredDateRange.start },
        endTime: { lte: request.preferredDateRange.end },
      },
    });

    return {
      users,
      existingEvents,
    };
  }

  /**
   * Generate all potential time slots within the date range
   */
  private static generatePotentialSlots(
    request: TimeSlotSuggestionRequest
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const { start, end } = request.preferredDateRange;
    const duration = request.duration;

    let currentDay = startOfDay(start);

    while (currentDay <= end) {
      // Determine time range based on preference
      let dayStart: Date;
      let dayEnd: Date;

      switch (request.preferredTimeOfDay) {
        case 'morning':
          dayStart = setMinutes(setHours(currentDay, 9), 0); // 9:00 AM
          dayEnd = setMinutes(setHours(currentDay, 12), 0); // 12:00 PM
          break;
        case 'afternoon':
          dayStart = setMinutes(setHours(currentDay, 13), 0); // 1:00 PM
          dayEnd = setMinutes(setHours(currentDay, 17), 0); // 5:00 PM
          break;
        case 'evening':
          dayStart = setMinutes(setHours(currentDay, 17), 0); // 5:00 PM
          dayEnd = setMinutes(setHours(currentDay, 20), 0); // 8:00 PM
          break;
        default:
          dayStart = setMinutes(setHours(currentDay, 9), 0); // 9:00 AM
          dayEnd = setMinutes(setHours(currentDay, 17), 0); // 5:00 PM
      }

      // Generate 30-minute intervals
      let slotStart = dayStart;
      while (addMinutes(slotStart, duration) <= dayEnd) {
        slots.push({
          startTime: slotStart,
          endTime: addMinutes(slotStart, duration),
          score: 0,
          reason: '',
          conflicts: 0,
        });
        slotStart = addMinutes(slotStart, 30); // 30-minute increments
      }

      currentDay = addDays(currentDay, 1);
    }

    return slots;
  }

  /**
   * Score time slots based on availability and conflicts
   */
  private static async scoreTimeSlots(
    orgId: string,
    slots: TimeSlot[],
    availabilityData: any,
    request: TimeSlotSuggestionRequest
  ): Promise<TimeSlot[]> {
    const { users, existingEvents } = availabilityData;

    return slots.map((slot) => {
      let score = 100;
      let conflicts = 0;
      const reasons: string[] = [];

      const slotDay = format(slot.startTime, 'EEEE').toUpperCase();
      const slotStartTime = format(slot.startTime, 'HH:mm');
      const slotEndTime = format(slot.endTime, 'HH:mm');

      // Check availability rules for each participant
      for (const user of users) {
        const hasAvailability = user.availabilityRules.some((rule: any) => {
          return (
            rule.dayOfWeek === slotDay &&
            slotStartTime >= rule.startTime &&
            slotEndTime <= rule.endTime
          );
        });

        if (!hasAvailability) {
          score -= 20;
          reasons.push(`Outside ${user.name || user.email}'s availability`);
        }
      }

      // Check for conflicts with existing events
      for (const event of existingEvents) {
        const participants = event.participants as any[];
        const hasOverlap = participants.some((p: any) =>
          request.participants.includes(p.email)
        );

        if (hasOverlap) {
          const eventStart = event.startTime;
          const eventEnd = event.endTime;

          if (
            (slot.startTime >= eventStart && slot.startTime < eventEnd) ||
            (slot.endTime > eventStart && slot.endTime <= eventEnd) ||
            (slot.startTime <= eventStart && slot.endTime >= eventEnd)
          ) {
            score -= 50;
            conflicts++;
            reasons.push(`Conflicts with "${event.title}"`);
          }
        }
      }

      // Prefer slots earlier in the week
      const dayOfWeek = slot.startTime.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 3) {
        score += 5;
      }

      return {
        ...slot,
        score: Math.max(0, score),
        conflicts,
        reason: reasons.join('; ') || 'Available',
      };
    });
  }

  /**
   * Use AI to rank slots and provide intelligent reasoning
   */
  private static async rankSlotsWithAI(
    slots: TimeSlot[],
    availabilityData: any,
    request: TimeSlotSuggestionRequest
  ): Promise<TimeSlot[]> {
    // Filter out slots with conflicts or very low scores
    const viableSlots = slots.filter((s) => s.conflicts === 0 && s.score >= 40);

    if (viableSlots.length === 0) {
      return [];
    }

    // Sort by score
    viableSlots.sort((a, b) => b.score - a.score);

    // Take top 10 for AI analysis
    const topSlots = viableSlots.slice(0, 10);

    try {
      const prompt = `You are a scheduling assistant. Analyze these potential meeting times and rank them based on:
1. Participant availability
2. Time of day preferences (${request.preferredTimeOfDay || 'any'})
3. Work-life balance (avoid early mornings, late evenings)
4. Meeting duration (${request.duration} minutes)

Potential slots:
${topSlots
  .map(
    (slot, idx) =>
      `${idx + 1}. ${format(slot.startTime, 'EEEE, MMMM d, yyyy h:mm a')} - ${format(
        slot.endTime,
        'h:mm a'
      )} (Score: ${slot.score})`
  )
  .join('\n')}

Provide:
1. Ranking (1-${topSlots.length})
2. Brief reason for each ranking

Format: JSON array of { rank: number, slotIndex: number, reason: string }`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a scheduling expert. Provide concise, actionable insights.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const aiResponse = response.choices[0].message.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      const rankings = JSON.parse(aiResponse).rankings || [];

      // Apply AI rankings
      const rankedSlots = rankings
        .map((ranking: any) => {
          const slot = topSlots[ranking.slotIndex];
          return {
            ...slot,
            score: slot.score + (topSlots.length - ranking.rank) * 5, // Boost score
            reason: ranking.reason || slot.reason,
          };
        })
        .sort((a: TimeSlot, b: TimeSlot) => b.score - a.score);

      return rankedSlots;
    } catch (error) {
      console.error('AI ranking failed, using fallback:', error);
      // Fallback: return top slots by score
      return topSlots;
    }
  }
}
```

### Step 7: Create Calendar API Routes

Create `src/app/api/calendar/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { GoogleCalendarService } from '@/lib/services/googleCalendarService';

/**
 * GET /api/calendar/connect
 * Initiate Google Calendar OAuth flow
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;

    const authUrl = GoogleCalendarService.getAuthorizationUrl(userId, orgId);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate calendar connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/calendar/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/services/googleCalendarService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calendar/callback
 * Handle Google Calendar OAuth callback
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL('/calendar/connections?error=oauth_failed', req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/calendar/connections?error=missing_params', req.url)
      );
    }

    // Decode state
    const { userId, orgId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for tokens
    const tokens = await GoogleCalendarService.getTokensFromCode(code);

    // Get primary calendar and user email
    const oauth2Client = GoogleCalendarService.getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const google = require('googleapis').google;
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const providerEmail = userInfo.data.email;

    // Save calendar connection
    await prisma.calendarConnection.create({
      data: {
        userId,
        orgId,
        provider: 'GOOGLE',
        providerEmail: providerEmail!,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true,
        syncEnabled: true,
      },
    });

    return NextResponse.redirect(
      new URL('/calendar/connections?success=true', req.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/calendar/connections?error=connection_failed', req.url)
    );
  }
}
```

Create `src/app/api/calendar/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { SchedulingService } from '@/lib/services/schedulingService';
import { createEventSchema } from '@/types/scheduling';

/**
 * GET /api/calendar/events
 * List events for current user's organization
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const events = await SchedulingService.getEvents(session.user.orgId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId: session.user.id,
      status: status ? status.split(',') as any : undefined,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 * Create a new event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const eventData = {
      ...parsed.data,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
    };

    const event = await SchedulingService.createEvent(
      session.user.orgId,
      session.user.id,
      eventData
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      {
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/scheduling/suggest/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { AISchedulingService } from '@/lib/services/aiSchedulingService';
import { suggestTimeSlotsSchema } from '@/types/scheduling';

/**
 * POST /api/scheduling/suggest
 * Get AI-powered time slot suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = suggestTimeSlotsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const request = {
      ...parsed.data,
      preferredDateRange: {
        start: new Date(parsed.data.preferredDateRange.start),
        end: new Date(parsed.data.preferredDateRange.end),
      },
    };

    const suggestions = await AISchedulingService.suggestTimeSlots(
      session.user.orgId,
      request
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Failed to suggest time slots:', error);
    return NextResponse.json(
      {
        error: 'Failed to suggest time slots',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### Step 8: Create Scheduling Reminder Worker Queue

Create `src/workers/queues/schedulingRemindersQueue.ts`:

```typescript
import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export interface SchedulingReminderJob {
  reminderId: string;
  eventId: string;
  recipientEmail: string;
  eventTitle: string;
  eventStartTime: string;
  eventEndTime: string;
  location?: string;
  meetingLink?: string;
}

export const schedulingRemindersQueue = new Queue<SchedulingReminderJob>(
  'scheduling-reminders',
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 60 * 60, // 24 hours
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60, // 7 days
      },
    },
  }
);
```

Create `src/workers/jobs/schedulingReminderJob.ts`:

```typescript
import { Job, Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { SchedulingReminderJob } from '../queues/schedulingRemindersQueue';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateICS } from '@/lib/calendar';
import { format } from 'date-fns';

/**
 * Process scheduling reminder jobs
 * Sends email reminders for upcoming events
 */

async function processReminderJob(job: Job<SchedulingReminderJob>) {
  const {
    reminderId,
    eventId,
    recipientEmail,
    eventTitle,
    eventStartTime,
    eventEndTime,
    location,
    meetingLink,
  } = job.data;

  console.log(`Processing reminder ${reminderId} for event ${eventId}`);

  try {
    // Get reminder from database
    const reminder = await prisma.eventReminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      console.error(`Reminder ${reminderId} not found`);
      return { success: false, error: 'Reminder not found' };
    }

    if (reminder.status === 'SENT') {
      console.log(`Reminder ${reminderId} already sent`);
      return { success: true, skipped: true };
    }

    // Generate ICS file
    const icsContent = generateICS({
      title: eventTitle,
      description: `You have an upcoming event: ${eventTitle}`,
      startTime: new Date(eventStartTime),
      endTime: new Date(eventEndTime),
      location: location || undefined,
      attendees: [{ email: recipientEmail, name: recipientEmail }],
    });

    // Calculate time until event
    const now = new Date();
    const eventStart = new Date(eventStartTime);
    const hoursUntil = Math.round((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60));

    const timeLabel = hoursUntil >= 24 ? '24 hours' : '1 hour';

    // Send email
    const emailSubject = `Reminder: ${eventTitle} in ${timeLabel}`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0A1B2B; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A1B2B; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .event-card { background: #f8fafc; padding: 20px; border-left: 4px solid #2B6CB0; margin: 20px 0; border-radius: 4px; }
    .button { background: #2B6CB0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Reminder</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>This is a reminder that you have an upcoming event in <strong>${timeLabel}</strong>:</p>

      <div class="event-card">
        <h2 style="margin-top: 0; color: #0A1B2B;">${eventTitle}</h2>
        <p><strong>When:</strong> ${format(new Date(eventStartTime), 'EEEE, MMMM d, yyyy h:mm a')}</p>
        <p><strong>Duration:</strong> ${Math.round((new Date(eventEndTime).getTime() - new Date(eventStartTime).getTime()) / (1000 * 60))} minutes</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        ${meetingLink ? `<p><strong>Join:</strong> <a href="${meetingLink}" style="color: #2B6CB0;">${meetingLink}</a></p>` : ''}
      </div>

      ${meetingLink ? `<a href="${meetingLink}" class="button">Join Meeting</a>` : ''}

      <p style="margin-top: 24px;">See you there!</p>
    </div>
    <div class="footer">
      <p>Astralis - AI Operations Platform</p>
    </div>
  </div>
</body>
</html>
    `;

    const emailText = `
Event Reminder

You have an upcoming event in ${timeLabel}:

${eventTitle}
When: ${format(new Date(eventStartTime), 'EEEE, MMMM d, yyyy h:mm a')}
${location ? `Location: ${location}` : ''}
${meetingLink ? `Join: ${meetingLink}` : ''}

See you there!
    `;

    await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: 'event.ics',
          content: icsContent,
          contentType: 'text/calendar',
        },
      ],
    });

    // Mark reminder as sent
    await prisma.eventReminder.update({
      where: { id: reminderId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    console.log(`✅ Reminder ${reminderId} sent to ${recipientEmail}`);

    return { success: true };
  } catch (error) {
    console.error(`Failed to process reminder ${reminderId}:`, error);

    // Mark reminder as failed
    await prisma.eventReminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export const schedulingReminderWorker = new Worker<SchedulingReminderJob>(
  'scheduling-reminders',
  processReminderJob,
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

schedulingReminderWorker.on('completed', (job) => {
  console.log(`✅ Reminder job ${job.id} completed`);
});

schedulingReminderWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
});
```

### Step 9: Create Reminder Scheduler (Cron Job)

Create `src/workers/jobs/reminderScheduler.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { schedulingRemindersQueue } from '../queues/schedulingRemindersQueue';
import { addMinutes } from 'date-fns';

/**
 * Reminder Scheduler
 * Runs periodically to queue upcoming reminders
 * Should run every 5 minutes via cron or setInterval
 */

export async function scheduleUpcomingReminders() {
  console.log('🔔 Checking for upcoming reminders...');

  const now = new Date();
  const checkWindow = addMinutes(now, 10); // Look 10 minutes ahead

  try {
    // Find pending reminders due within the next 10 minutes
    const upcomingReminders = await prisma.eventReminder.findMany({
      where: {
        status: 'PENDING',
        reminderTime: {
          gte: now,
          lte: checkWindow,
        },
      },
      include: {
        event: true,
      },
    });

    console.log(`Found ${upcomingReminders.length} reminders to schedule`);

    for (const reminder of upcomingReminders) {
      const { event } = reminder;

      // Calculate delay until reminder should be sent
      const delay = Math.max(0, reminder.reminderTime.getTime() - now.getTime());

      await schedulingRemindersQueue.add(
        'send-reminder',
        {
          reminderId: reminder.id,
          eventId: event.id,
          recipientEmail: reminder.recipientEmail,
          eventTitle: event.title,
          eventStartTime: event.startTime.toISOString(),
          eventEndTime: event.endTime.toISOString(),
          location: event.location || undefined,
          meetingLink: event.meetingLink || undefined,
        },
        {
          delay, // Send at exact reminder time
          jobId: `reminder-${reminder.id}`, // Prevent duplicates
        }
      );

      console.log(`Scheduled reminder ${reminder.id} with ${delay}ms delay`);
    }

    return { scheduled: upcomingReminders.length };
  } catch (error) {
    console.error('Failed to schedule reminders:', error);
    throw error;
  }
}

// Run every 5 minutes
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_REMINDER_SCHEDULER === 'true') {
  setInterval(
    () => {
      scheduleUpcomingReminders().catch(console.error);
    },
    5 * 60 * 1000
  ); // 5 minutes

  // Run immediately on start
  scheduleUpcomingReminders().catch(console.error);
}
```

### Step 10: Update Worker Index

Update `src/workers/index.ts`:

```typescript
import './jobs/intakeRoutingJob';
import './jobs/emailSendingJob';
import './jobs/documentProcessingJob';
import './jobs/schedulingReminderJob'; // NEW
import './jobs/reminderScheduler'; // NEW

console.log('🚀 AstralisOps Worker started');
console.log('📋 Active queues:');
console.log('  - intake-routing');
console.log('  - email-sending');
console.log('  - document-processing');
console.log('  - scheduling-reminders'); // NEW
console.log('  - reminder-scheduler (cron)'); // NEW

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  process.exit(0);
});
```

---

## Testing Checklist

### Calendar Connection

- [ ] User can initiate Google Calendar OAuth from `/calendar/connections`
- [ ] OAuth flow redirects to Google consent screen
- [ ] After consent, user is redirected back to app with success message
- [ ] Calendar connection appears in database (`CalendarConnection` table)
- [ ] User can view connected calendars in UI
- [ ] User can disconnect calendar
- [ ] Disconnecting marks connection as `isActive: false`

### Event Creation

- [ ] User can create event via UI form
- [ ] Event validation works (end time > start time, valid emails)
- [ ] Event appears in database with correct data
- [ ] Event appears in calendar view UI
- [ ] Event syncs to Google Calendar (check Google Calendar web/app)
- [ ] Participants receive event invitations
- [ ] ICS file attached to invitation emails

### Conflict Detection

- [ ] Creating overlapping event shows conflict warning
- [ ] Conflict detected events have status `CONFLICT`
- [ ] Conflict data stored in `conflictData` field
- [ ] UI shows conflicts visually (red border, warning icon)
- [ ] Resolving conflict (moving time) updates status to `SCHEDULED`

### Availability Rules

- [ ] User can set weekly availability from `/calendar/availability`
- [ ] Rules saved with correct day/time/timezone
- [ ] Rules enforce availability during event creation
- [ ] Creating event outside availability shows warning
- [ ] Inactive rules are ignored

### AI Time Slot Suggestions

- [ ] Requesting suggestions returns top 5 slots
- [ ] Suggestions respect participant availability
- [ ] Suggestions avoid conflicts with existing events
- [ ] AI reasoning provided makes sense
- [ ] Selecting suggested slot creates event correctly

### Reminders

- [ ] Creating event creates 2 reminders (24h, 1h)
- [ ] Reminders appear in `EventReminder` table with `PENDING` status
- [ ] Reminder scheduler runs every 5 minutes
- [ ] Reminders queued to `scheduling-reminders` queue
- [ ] Worker processes reminder jobs
- [ ] Reminder emails sent at correct time
- [ ] Email contains event details and ICS attachment
- [ ] Reminder status updated to `SENT` after sending
- [ ] Failed reminders marked with status `FAILED` and error message

### Calendar Sync

- [ ] Creating event in AstralisOps syncs to Google Calendar
- [ ] Updating event in AstralisOps updates Google Calendar
- [ ] Deleting event in AstralisOps deletes from Google Calendar
- [ ] Manual sync button fetches latest Google Calendar events
- [ ] Google Calendar events imported to AstralisOps
- [ ] `lastSyncAt` timestamp updated after sync

### Multi-Participant Scheduling

- [ ] Event with multiple participants saves all emails
- [ ] All participants receive invitation emails
- [ ] Conflict detection checks all participants
- [ ] Suggestions consider all participants' availability
- [ ] Participant status tracked (pending/accepted/declined)

### Error Handling

- [ ] Invalid OAuth code shows error message
- [ ] Expired calendar tokens automatically refresh
- [ ] Failed token refresh marks connection inactive
- [ ] Network errors during sync handled gracefully
- [ ] Failed reminder sends don't crash worker
- [ ] Validation errors return clear messages

---

## Handoff Summary

### What's Complete (Phase 5)

✅ **Database Schema**: CalendarConnection, AvailabilityRule, EventReminder tables
✅ **Google Calendar Integration**: OAuth flow, two-way sync, event CRUD
✅ **Conflict Detection**: Algorithm checks overlapping events and participants
✅ **Availability Management**: Weekly availability rules per user
✅ **AI Scheduling**: GPT-4-powered time slot suggestions
✅ **Automated Reminders**: 24h and 1h before events via worker queue
✅ **ICS Generation**: Enhanced calendar.ts with full event support
✅ **API Endpoints**: Calendar connection, events, suggestions, conflicts
✅ **Worker Queues**: scheduling-reminders, reminder-scheduler cron
✅ **Multi-Participant**: Support for multiple attendees per event

### What's Next (Phase 6: Production Deployment)

📋 **Production Docker Configuration**:
- Multi-stage Dockerfile optimizations
- docker-compose.prod.yml with production settings
- Environment variable security (secrets management)
- Health checks and restart policies

📋 **Nginx Setup**:
- Reverse proxy configuration
- SSL/TLS with Let's Encrypt
- Rate limiting and security headers
- Static asset caching

📋 **Database & Redis**:
- Automated backups to DigitalOcean Spaces
- Connection pooling configuration
- Redis persistence (AOF + RDB)
- Migration rollback procedures

📋 **Monitoring & Logging**:
- Log aggregation (Winston + file rotation)
- DigitalOcean Monitoring setup
- Error tracking (Sentry or similar)
- Performance metrics dashboard

📋 **Deployment Automation**:
- Zero-downtime deployment script
- Automated database migrations
- Health check validation
- Rollback procedures

### Environment Variables Added (Phase 5)

```bash
GOOGLE_CALENDAR_CLIENT_ID="..."
GOOGLE_CALENDAR_CLIENT_SECRET="..."
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3001/api/calendar/callback"
GOOGLE_CALENDAR_SCOPES="https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
```

### Docker State After Phase 5

```yaml
services:
  app: Next.js (with calendar routes)
  postgres: PostgreSQL 16 (with calendar tables)
  redis: Redis 7 (with scheduling queues)
  worker: Background processor (with reminder scheduler)
```

### Database State After Phase 5

New tables:
- `CalendarConnection` (21 rows in development, 0 in fresh install)
- `AvailabilityRule` (35 rows in development, 0 in fresh install)
- `EventReminder` (42 rows in development, 0 in fresh install)

Updated tables:
- `SchedulingEvent` (added fields: location, meetingLink, aiSuggestionMeta)

### Key Files Modified/Added

**Added**:
- `src/lib/services/googleCalendarService.ts` (450+ lines)
- `src/lib/services/schedulingService.ts` (380+ lines)
- `src/lib/services/aiSchedulingService.ts` (320+ lines)
- `src/types/calendar.ts` (200+ lines)
- `src/types/scheduling.ts` (120+ lines)
- `src/app/api/calendar/connect/route.ts`
- `src/app/api/calendar/callback/route.ts`
- `src/app/api/calendar/events/route.ts`
- `src/app/api/scheduling/suggest/route.ts`
- `src/workers/queues/schedulingRemindersQueue.ts`
- `src/workers/jobs/schedulingReminderJob.ts`
- `src/workers/jobs/reminderScheduler.ts`

**Updated**:
- `src/lib/calendar.ts` (enhanced ICS generation)
- `src/workers/index.ts` (added reminder workers)
- `prisma/schema.prisma` (calendar tables and enums)

---

**Phase 5 Complete** - Calendar and scheduling capabilities fully implemented with Google Calendar integration, AI-powered suggestions, conflict detection, and automated reminders. Ready for production deployment in Phase 6.
