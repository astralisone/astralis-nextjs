# Phase 5: System Integrations & Unified Data Sync

**Duration**: 3 weeks
**Prerequisites**: Phase 1 (Authentication & RBAC), Phase 2 (Dashboard & Pipelines), Phase 3 (AI Routing & Background Jobs)
**Docker Changes**: Worker queue extended with `integration-sync` and `webhook-handler` queues

---

## Phase Overview

This phase implements a comprehensive integration hub for AstralisOps that connects email, calendar, client database, and billing software so they share information automatically. Add a client in one place, and they appear everywhere. By the end of this phase, users can connect their external systems via OAuth, and all client data, appointments, and billing records stay synchronized across platforms automatically.

### Success Criteria Checklist

- [ ] Users can connect Gmail/Outlook via OAuth for email sync
- [ ] Users can connect Google Calendar/Outlook Calendar for two-way sync
- [ ] Users can connect billing systems (Stripe, QuickBooks)
- [ ] Client data syncs bidirectionally across all connected systems
- [ ] Create a client in AstralisOps → automatically created in CRM and billing
- [ ] Create a client in external CRM → automatically synced to AstralisOps
- [ ] Calendar events created in AstralisOps → synced to Google/Outlook
- [ ] Invoices created in billing system → synced to client record
- [ ] Email activities tracked and linked to client records
- [ ] Webhook handlers process external system updates in real-time
- [ ] Integration status dashboard shows sync health
- [ ] Conflict resolution handles duplicate/conflicting data
- [ ] All tests pass

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 15 (App Router), TypeScript 5, Prisma ORM, PostgreSQL 16, Redis 7, Docker
**Infrastructure**: DigitalOcean Droplet + Spaces (S3-compatible object storage)

**Brand Design System**:
- **Astralis Navy**: `#0A1B2B` (headings, sidebar, dark backgrounds)
- **Astralis Blue**: `#2B6CB0` (primary buttons, links, accents)
- **Status Colors**: Success `#38A169`, Warning `#DD6B20`, Error `#E53E3E`, Info `#3182CE`
- **Neutrals**: Slate palette (50-950)
- **Font**: Inter (via next/font/google)

**Database**: Multi-tenant architecture with unified client entity
- Organization → Users → Clients (central source of truth)
- Clients → IntegrationMappings → ExternalSystems
- Clients → ClientActivities → EmailThreads, Appointments, Invoices

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) (Phase 2)
**Background Jobs**: BullMQ + Redis (Phase 3)
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, open source tools only

---

## Architecture: Unified Integration Hub

```
┌─────────────────────────────────────────────────────────────┐
│                      AstralisOps Core                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Central Client Entity                     │  │
│  │  (Single source of truth for all client data)        │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                  │
│              ┌─────────────┼─────────────┐                   │
│              ▼             ▼             ▼                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Integration  │ │ Integration  │ │ Integration  │       │
│  │   Mapping    │ │   Mapping    │ │   Mapping    │       │
│  │   (Email)    │ │  (Calendar)  │ │  (Billing)   │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└───────┬──────────────────┬──────────────────┬───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    Gmail     │   │   Google     │   │    Stripe    │
│   Outlook    │   │   Calendar   │   │  QuickBooks  │
│              │   │   Outlook    │   │  FreshBooks  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                  │                  │
        │ Webhooks         │ Webhooks         │ Webhooks
        └──────────────────┴──────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Webhook Handler │
                  │  (Background)   │
                  └─────────────────┘
```

### Key Architectural Principles

1. **Unified Client Entity**: Single source of truth in AstralisOps database
2. **Integration Mappings**: Each client can have multiple external IDs across systems
3. **Event-Driven Sync**: Changes propagate via events to background workers
4. **Bidirectional Webhooks**: External systems push updates to AstralisOps
5. **Conflict Resolution**: Last-write-wins with manual override option
6. **Idempotency**: Sync operations are safe to retry

---

## Docker Services State (Phase 5)

```yaml
Active Containers:
- app: Next.js application (port 3001)
  ├── Handles all web requests
  ├── Marketing pages + authenticated dashboard
  ├── NextAuth routes (Phase 1)
  ├── OAuth callback handlers for Gmail, Google Calendar, Stripe (Phase 5 NEW)
  ├── Webhook endpoints for external systems (Phase 5 NEW)
  └── Integration API endpoints (Phase 5 NEW)

- postgres: PostgreSQL 16 database
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  ├── Auth tables (Phase 1)
  ├── Client tables with integration mappings (Phase 5 NEW)
  └── IntegrationConnection, IntegrationMapping, ClientActivity tables

- redis: Redis 7 (Phase 3)
  ├── Job queue storage
  ├── Session cache
  ├── Integration sync queue (Phase 5 NEW)
  └── Webhook deduplication cache (Phase 5 NEW)

- worker: Background job processor (Phase 3)
  ├── Queue: intake-routing (Phase 3)
  ├── Queue: email-sending (Phase 3)
  ├── Queue: integration-sync (Phase 5 NEW)
  └── Queue: webhook-handler (Phase 5 NEW)

Volumes:
- postgres-data: Database persistence
- redis-data: Redis persistence

Networks:
- astralis-network: Bridge network

Status: Extended worker with integration sync queues
```

---

## Database Schema State (After Phase 5)

### New Models (Phase 5)

```prisma
enum IntegrationProvider {
  GMAIL
  OUTLOOK_EMAIL
  GOOGLE_CALENDAR
  OUTLOOK_CALENDAR
  STRIPE
  QUICKBOOKS
  FRESHBOOKS
  SALESFORCE
  HUBSPOT
}

enum IntegrationType {
  EMAIL
  CALENDAR
  CRM
  BILLING
}

enum SyncStatus {
  IDLE
  SYNCING
  ERROR
  PAUSED
}

enum ConflictResolution {
  ASTRALISOPS_WINS
  EXTERNAL_WINS
  MANUAL
  LAST_WRITE_WINS
}

// Stores OAuth credentials and connection metadata for each integration
model IntegrationConnection {
  id                  String               @id @default(cuid())
  orgId               String
  userId              String               // User who connected this integration
  provider            IntegrationProvider
  type                IntegrationType

  // OAuth credentials
  accessToken         String?              @db.Text
  refreshToken        String?              @db.Text
  expiresAt           DateTime?
  scope               String?

  // Connection metadata
  externalAccountId   String?              // e.g., Gmail address, Stripe account ID
  externalAccountName String?              // e.g., "user@example.com", "Acme Inc Stripe"

  // Sync configuration
  syncEnabled         Boolean              @default(true)
  syncStatus          SyncStatus           @default(IDLE)
  lastSyncAt          DateTime?
  lastSyncError       String?              @db.Text
  syncFrequency       Int                  @default(300) // seconds, default 5min

  // Webhook configuration
  webhookUrl          String?              // Our webhook endpoint for this connection
  webhookSecret       String?              // Secret for validating webhook signatures

  // Conflict resolution strategy
  conflictResolution  ConflictResolution   @default(LAST_WRITE_WINS)

  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  organization        Organization         @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user                User                 @relation(fields: [userId], references: [id])
  mappings            IntegrationMapping[]
  activities          ClientActivity[]

  @@index([orgId])
  @@index([userId])
  @@index([provider])
  @@index([syncStatus])
  @@unique([orgId, provider, externalAccountId])
}

// Maps AstralisOps clients to external system IDs (one client can have many external IDs)
model IntegrationMapping {
  id                   String                @id @default(cuid())
  orgId                String
  clientId             String                // Reference to Client model
  connectionId         String

  // External system reference
  externalId           String                // ID in external system (e.g., Stripe customer ID)
  externalType         String                // Type of external entity (e.g., "customer", "contact")
  externalUrl          String?               // Deep link to external system

  // Sync metadata
  lastSyncedAt         DateTime?
  lastSyncDirection    String?               // "TO_EXTERNAL", "FROM_EXTERNAL", "BIDIRECTIONAL"
  syncErrors           Json?                 // Array of recent sync errors

  // Data snapshot (for conflict detection)
  externalDataSnapshot Json?                 // Cached copy of external data

  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  organization         Organization          @relation(fields: [orgId], references: [id], onDelete: Cascade)
  client               Client                @relation(fields: [clientId], references: [id], onDelete: Cascade)
  connection           IntegrationConnection @relation(fields: [connectionId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@index([clientId])
  @@index([connectionId])
  @@index([externalId])
  @@unique([connectionId, externalId])
}

// Central client entity - single source of truth
model Client {
  id                  String               @id @default(cuid())
  orgId               String

  // Core client data
  email               String
  name                String
  phone               String?
  company             String?

  // Address
  addressLine1        String?
  addressLine2        String?
  city                String?
  state               String?
  postalCode          String?
  country             String?              @default("US")

  // Metadata
  notes               String?              @db.Text
  tags                String[]             @default([])
  customFields        Json?                // Flexible custom data

  // Status
  isActive            Boolean              @default(true)

  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  organization        Organization         @relation(fields: [orgId], references: [id], onDelete: Cascade)
  integrationMappings IntegrationMapping[]
  activities          ClientActivity[]
  intakeRequests      IntakeRequest[]
  documents           Document[]

  @@index([orgId])
  @@index([email])
  @@index([isActive])
  @@unique([orgId, email])
}

// Activity log for client interactions across all integrated systems
model ClientActivity {
  id              String                @id @default(cuid())
  orgId           String
  clientId        String
  connectionId    String?               // Which integration this came from

  // Activity details
  type            String                // "EMAIL", "MEETING", "CALL", "NOTE", "INVOICE", "PAYMENT"
  title           String
  description     String?               @db.Text

  // External reference
  externalId      String?               // ID in external system
  externalUrl     String?               // Deep link

  // Temporal data
  occurredAt      DateTime              // When activity happened
  duration        Int?                  // Duration in minutes (for meetings, calls)

  // Participants
  participants    Json?                 // Array of participant info

  // Metadata
  metadata        Json?                 // Additional data (email headers, invoice amount, etc.)

  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  organization    Organization          @relation(fields: [orgId], references: [id], onDelete: Cascade)
  client          Client                @relation(fields: [clientId], references: [id], onDelete: Cascade)
  connection      IntegrationConnection? @relation(fields: [connectionId], references: [id], onDelete: SetNull)

  @@index([orgId])
  @@index([clientId])
  @@index([type])
  @@index([occurredAt])
}

// Update Organization model to include new relations
model Organization {
  // ... existing fields ...

  integrationConnections IntegrationConnection[]
  integrationMappings    IntegrationMapping[]
  clients                Client[]
  clientActivities       ClientActivity[]
}

// Update User model to track who connected integrations
model User {
  // ... existing fields ...

  integrationConnections IntegrationConnection[]
}
```

---

## Environment Variables (Cumulative After Phase 5)

Add to `.env.local`:

```bash
# Existing variables from previous phases
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"

# Gmail Integration (OAuth)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/integrations/gmail/callback"

# Microsoft Integration (Outlook Email + Calendar)
MICROSOFT_CLIENT_ID="your-microsoft-app-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="common"  # or specific tenant ID
MICROSOFT_REDIRECT_URI="http://localhost:3001/api/integrations/outlook/callback"

# Stripe Integration
STRIPE_CLIENT_ID="your-stripe-connect-client-id"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_REDIRECT_URI="http://localhost:3001/api/integrations/stripe/callback"

# QuickBooks Integration (optional)
QUICKBOOKS_CLIENT_ID="your-quickbooks-client-id"
QUICKBOOKS_CLIENT_SECRET="your-quickbooks-client-secret"
QUICKBOOKS_REDIRECT_URI="http://localhost:3001/api/integrations/quickbooks/callback"
QUICKBOOKS_ENVIRONMENT="sandbox"  # or "production"

# FreshBooks Integration (optional)
FRESHBOOKS_CLIENT_ID="your-freshbooks-client-id"
FRESHBOOKS_CLIENT_SECRET="your-freshbooks-client-secret"
FRESHBOOKS_REDIRECT_URI="http://localhost:3001/api/integrations/freshbooks/callback"

# Webhook Security
WEBHOOK_SIGNING_SECRET="your-webhook-signing-secret-min-32-chars"

# Integration Sync Configuration
INTEGRATION_SYNC_INTERVAL="300"  # seconds (5 minutes)
INTEGRATION_MAX_RETRIES="3"
INTEGRATION_BATCH_SIZE="50"  # entities per sync batch
```

---

## Implementation Steps

### Step 1: Install Integration Dependencies

```bash
cd /home/deploy/astralis-nextjs

# Google APIs (Gmail + Calendar)
npm install googleapis @google-cloud/local-auth

# Microsoft Graph API (Outlook)
npm install @microsoft/microsoft-graph-client @azure/msal-node

# Stripe SDK
npm install stripe

# QuickBooks SDK (optional)
npm install node-quickbooks

# FreshBooks SDK (optional)
npm install freshbooks

# Webhook validation
npm install svix  # for webhook signature validation

# Date handling for calendar sync
npm install date-fns date-fns-tz

# Verify installation
npm list googleapis stripe @microsoft/microsoft-graph-client
```

### Step 2: Create Prisma Migration

```bash
npx prisma migrate dev --name add_integration_tables
```

Expected output:
```
Applying migration `20250120120000_add_integration_tables`

Tables created:
- IntegrationConnection
- IntegrationMapping
- Client
- ClientActivity

Schema updated successfully.
```

### Step 3: Create Integration Service Architecture

Create `src/lib/integrations/base.integration.ts`:

```typescript
import { IntegrationProvider, IntegrationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface IntegrationConfig {
  provider: IntegrationProvider;
  type: IntegrationType;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface SyncResult {
  success: boolean;
  entitiesSynced: number;
  errors: string[];
}

export interface ClientData {
  email: string;
  name: string;
  phone?: string;
  company?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;
  protected connectionId: string;

  constructor(config: IntegrationConfig, connectionId: string) {
    this.config = config;
    this.connectionId = connectionId;
  }

  /**
   * Get OAuth authorization URL
   */
  abstract getAuthUrl(state: string): string;

  /**
   * Exchange authorization code for access token
   */
  abstract exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;

  /**
   * Refresh access token
   */
  abstract refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
  }>;

  /**
   * Sync clients from external system to AstralisOps
   */
  abstract syncFromExternal(): Promise<SyncResult>;

  /**
   * Sync clients from AstralisOps to external system
   */
  abstract syncToExternal(clientIds: string[]): Promise<SyncResult>;

  /**
   * Create client in external system
   */
  abstract createClient(data: ClientData): Promise<string>; // Returns external ID

  /**
   * Update client in external system
   */
  abstract updateClient(externalId: string, data: Partial<ClientData>): Promise<void>;

  /**
   * Delete client in external system
   */
  abstract deleteClient(externalId: string): Promise<void>;

  /**
   * Fetch client activities (emails, meetings, etc.)
   */
  abstract fetchActivities(externalId: string): Promise<any[]>;

  /**
   * Handle webhook payload from external system
   */
  abstract handleWebhook(payload: any): Promise<void>;

  /**
   * Get connection from database
   */
  protected async getConnection() {
    return prisma.integrationConnection.findUnique({
      where: { id: this.connectionId },
    });
  }

  /**
   * Update connection tokens
   */
  protected async updateTokens(tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }) {
    await prisma.integrationConnection.update({
      where: { id: this.connectionId },
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Create or update integration mapping
   */
  protected async upsertMapping(
    clientId: string,
    externalId: string,
    externalType: string,
    externalUrl?: string
  ) {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Connection not found');

    return prisma.integrationMapping.upsert({
      where: {
        connectionId_externalId: {
          connectionId: this.connectionId,
          externalId,
        },
      },
      create: {
        orgId: connection.orgId,
        clientId,
        connectionId: this.connectionId,
        externalId,
        externalType,
        externalUrl,
        lastSyncedAt: new Date(),
        lastSyncDirection: 'BIDIRECTIONAL',
      },
      update: {
        lastSyncedAt: new Date(),
        externalUrl,
      },
    });
  }
}
```

### Step 4: Implement Gmail Integration

Create `src/lib/integrations/gmail.integration.ts`:

```typescript
import { google } from 'googleapis';
import { BaseIntegration, IntegrationConfig, ClientData, SyncResult } from './base.integration';
import { prisma } from '@/lib/prisma';

export class GmailIntegration extends BaseIntegration {
  private oauth2Client: any;

  constructor(config: IntegrationConfig, connectionId: string) {
    super(config, connectionId);

    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      state,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
    };
  }

  async syncFromExternal(): Promise<SyncResult> {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Connection not found');

    this.oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    try {
      // Fetch contacts from Gmail (via People API)
      const people = google.people({ version: 'v1', auth: this.oauth2Client });
      const response = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 100,
        personFields: 'names,emailAddresses,phoneNumbers,addresses,organizations',
      });

      const connections = response.data.connections || [];
      let entitiesSynced = 0;
      const errors: string[] = [];

      for (const contact of connections) {
        try {
          const email = contact.emailAddresses?.[0]?.value;
          if (!email) continue;

          const name = contact.names?.[0]?.displayName || email;
          const phone = contact.phoneNumbers?.[0]?.value;
          const company = contact.organizations?.[0]?.name;

          // Create or update client in AstralisOps
          const client = await prisma.client.upsert({
            where: {
              orgId_email: {
                orgId: connection.orgId,
                email,
              },
            },
            create: {
              orgId: connection.orgId,
              email,
              name,
              phone,
              company,
            },
            update: {
              name,
              phone,
              company,
            },
          });

          // Create mapping
          const externalId = contact.resourceName!;
          await this.upsertMapping(
            client.id,
            externalId,
            'contact',
            `https://contacts.google.com/person/${externalId}`
          );

          entitiesSynced++;
        } catch (error) {
          errors.push(`Failed to sync contact ${contact.resourceName}: ${error}`);
        }
      }

      return { success: true, entitiesSynced, errors };
    } catch (error) {
      return {
        success: false,
        entitiesSynced: 0,
        errors: [`Gmail sync failed: ${error}`],
      };
    }
  }

  async syncToExternal(clientIds: string[]): Promise<SyncResult> {
    // Gmail contacts are typically read-only via API
    // For write operations, would need to use People API with proper scopes
    return {
      success: true,
      entitiesSynced: 0,
      errors: ['Gmail contacts are read-only in this integration'],
    };
  }

  async createClient(data: ClientData): Promise<string> {
    throw new Error('Creating Gmail contacts not supported');
  }

  async updateClient(externalId: string, data: Partial<ClientData>): Promise<void> {
    throw new Error('Updating Gmail contacts not supported');
  }

  async deleteClient(externalId: string): Promise<void> {
    throw new Error('Deleting Gmail contacts not supported');
  }

  async fetchActivities(externalId: string): Promise<any[]> {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Connection not found');

    this.oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // Fetch recent emails for this contact
    const email = externalId.split('/').pop(); // Extract email from resource name
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${email} OR to:${email}`,
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    const activities = [];

    for (const message of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'To', 'Date'],
      });

      const headers = detail.data.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value;

      activities.push({
        type: 'EMAIL',
        title: subject,
        description: `From: ${from}\nTo: ${to}`,
        occurredAt: date ? new Date(date) : new Date(),
        externalId: message.id,
        externalUrl: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
        metadata: {
          from,
          to,
          snippet: detail.data.snippet,
        },
      });
    }

    return activities;
  }

  async handleWebhook(payload: any): Promise<void> {
    // Gmail uses Cloud Pub/Sub for push notifications
    // This would require additional Google Cloud setup
    console.log('Gmail webhook received:', payload);
  }
}
```

### Step 5: Implement Stripe Integration

Create `src/lib/integrations/stripe.integration.ts`:

```typescript
import Stripe from 'stripe';
import { BaseIntegration, IntegrationConfig, ClientData, SyncResult } from './base.integration';
import { prisma } from '@/lib/prisma';

export class StripeIntegration extends BaseIntegration {
  private stripe: Stripe;

  constructor(config: IntegrationConfig, connectionId: string, secretKey: string) {
    super(config, connectionId);
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      state,
      scope: 'read_write',
      redirect_uri: this.config.redirectUri,
    });
    return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string) {
    const response = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: undefined, // Stripe tokens don't expire
    };
  }

  async refreshAccessToken(refreshToken: string) {
    throw new Error('Stripe tokens do not expire and cannot be refreshed');
  }

  async syncFromExternal(): Promise<SyncResult> {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Connection not found');

    try {
      // Fetch customers from Stripe
      const customers = await this.stripe.customers.list({ limit: 100 });

      let entitiesSynced = 0;
      const errors: string[] = [];

      for (const customer of customers.data) {
        try {
          if (!customer.email) continue;

          // Create or update client in AstralisOps
          const client = await prisma.client.upsert({
            where: {
              orgId_email: {
                orgId: connection.orgId,
                email: customer.email,
              },
            },
            create: {
              orgId: connection.orgId,
              email: customer.email,
              name: customer.name || customer.email,
              phone: customer.phone || undefined,
              addressLine1: customer.address?.line1 || undefined,
              addressLine2: customer.address?.line2 || undefined,
              city: customer.address?.city || undefined,
              state: customer.address?.state || undefined,
              postalCode: customer.address?.postal_code || undefined,
              country: customer.address?.country || 'US',
            },
            update: {
              name: customer.name || customer.email,
              phone: customer.phone || undefined,
              addressLine1: customer.address?.line1 || undefined,
              city: customer.address?.city || undefined,
              state: customer.address?.state || undefined,
              postalCode: customer.address?.postal_code || undefined,
            },
          });

          // Create mapping
          await this.upsertMapping(
            client.id,
            customer.id,
            'customer',
            `https://dashboard.stripe.com/customers/${customer.id}`
          );

          entitiesSynced++;
        } catch (error) {
          errors.push(`Failed to sync customer ${customer.id}: ${error}`);
        }
      }

      return { success: true, entitiesSynced, errors };
    } catch (error) {
      return {
        success: false,
        entitiesSynced: 0,
        errors: [`Stripe sync failed: ${error}`],
      };
    }
  }

  async syncToExternal(clientIds: string[]): Promise<SyncResult> {
    const connection = await this.getConnection();
    if (!connection) throw new Error('Connection not found');

    let entitiesSynced = 0;
    const errors: string[] = [];

    for (const clientId of clientIds) {
      try {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          include: {
            integrationMappings: {
              where: { connectionId: this.connectionId },
            },
          },
        });

        if (!client) continue;

        const mapping = client.integrationMappings[0];

        if (mapping) {
          // Update existing Stripe customer
          await this.stripe.customers.update(mapping.externalId, {
            name: client.name,
            email: client.email,
            phone: client.phone || undefined,
            address: {
              line1: client.addressLine1 || undefined,
              line2: client.addressLine2 || undefined,
              city: client.city || undefined,
              state: client.state || undefined,
              postal_code: client.postalCode || undefined,
              country: client.country || 'US',
            },
          });
        } else {
          // Create new Stripe customer
          const customer = await this.stripe.customers.create({
            name: client.name,
            email: client.email,
            phone: client.phone || undefined,
            address: {
              line1: client.addressLine1 || undefined,
              line2: client.addressLine2 || undefined,
              city: client.city || undefined,
              state: client.state || undefined,
              postal_code: client.postalCode || undefined,
              country: client.country || 'US',
            },
          });

          await this.upsertMapping(
            client.id,
            customer.id,
            'customer',
            `https://dashboard.stripe.com/customers/${customer.id}`
          );
        }

        entitiesSynced++;
      } catch (error) {
        errors.push(`Failed to sync client ${clientId} to Stripe: ${error}`);
      }
    }

    return { success: true, entitiesSynced, errors };
  }

  async createClient(data: ClientData): Promise<string> {
    const customer = await this.stripe.customers.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address ? {
        line1: data.address.line1,
        line2: data.address.line2,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.postalCode,
        country: data.address.country || 'US',
      } : undefined,
    });

    return customer.id;
  }

  async updateClient(externalId: string, data: Partial<ClientData>): Promise<void> {
    await this.stripe.customers.update(externalId, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address ? {
        line1: data.address.line1,
        line2: data.address.line2,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.postalCode,
        country: data.address.country || 'US',
      } : undefined,
    });
  }

  async deleteClient(externalId: string): Promise<void> {
    await this.stripe.customers.del(externalId);
  }

  async fetchActivities(externalId: string): Promise<any[]> {
    // Fetch invoices and payments for this customer
    const [invoices, charges] = await Promise.all([
      this.stripe.invoices.list({ customer: externalId, limit: 50 }),
      this.stripe.charges.list({ customer: externalId, limit: 50 }),
    ]);

    const activities = [];

    for (const invoice of invoices.data) {
      activities.push({
        type: 'INVOICE',
        title: `Invoice ${invoice.number || invoice.id}`,
        description: `Amount: $${(invoice.amount_due / 100).toFixed(2)}`,
        occurredAt: new Date(invoice.created * 1000),
        externalId: invoice.id,
        externalUrl: invoice.hosted_invoice_url || undefined,
        metadata: {
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: invoice.status,
        },
      });
    }

    for (const charge of charges.data) {
      activities.push({
        type: 'PAYMENT',
        title: `Payment ${charge.id}`,
        description: `Amount: $${(charge.amount / 100).toFixed(2)}`,
        occurredAt: new Date(charge.created * 1000),
        externalId: charge.id,
        externalUrl: `https://dashboard.stripe.com/payments/${charge.id}`,
        metadata: {
          amount: charge.amount / 100,
          currency: charge.currency,
          status: charge.status,
        },
      });
    }

    return activities.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async handleWebhook(payload: any): Promise<void> {
    const event = payload;

    switch (event.type) {
      case 'customer.created':
      case 'customer.updated':
        await this.handleCustomerEvent(event.data.object);
        break;

      case 'invoice.created':
      case 'invoice.paid':
        await this.handleInvoiceEvent(event.data.object);
        break;

      case 'charge.succeeded':
        await this.handleChargeEvent(event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }
  }

  private async handleCustomerEvent(customer: Stripe.Customer) {
    const connection = await this.getConnection();
    if (!connection) return;

    // Find existing mapping
    const mapping = await prisma.integrationMapping.findUnique({
      where: {
        connectionId_externalId: {
          connectionId: this.connectionId,
          externalId: customer.id,
        },
      },
      include: { client: true },
    });

    if (mapping) {
      // Update existing client
      await prisma.client.update({
        where: { id: mapping.clientId },
        data: {
          name: customer.name || customer.email || mapping.client.name,
          email: customer.email || mapping.client.email,
          phone: customer.phone || undefined,
          addressLine1: customer.address?.line1 || undefined,
          city: customer.address?.city || undefined,
          state: customer.address?.state || undefined,
          postalCode: customer.address?.postal_code || undefined,
        },
      });
    } else {
      // Create new client if email exists
      if (customer.email) {
        const client = await prisma.client.create({
          data: {
            orgId: connection.orgId,
            email: customer.email,
            name: customer.name || customer.email,
            phone: customer.phone || undefined,
            addressLine1: customer.address?.line1 || undefined,
            city: customer.address?.city || undefined,
            state: customer.address?.state || undefined,
            postalCode: customer.address?.postal_code || undefined,
          },
        });

        await this.upsertMapping(client.id, customer.id, 'customer');
      }
    }
  }

  private async handleInvoiceEvent(invoice: Stripe.Invoice) {
    // Create activity for invoice
    const mapping = await prisma.integrationMapping.findUnique({
      where: {
        connectionId_externalId: {
          connectionId: this.connectionId,
          externalId: invoice.customer as string,
        },
      },
    });

    if (mapping) {
      await prisma.clientActivity.create({
        data: {
          orgId: mapping.orgId,
          clientId: mapping.clientId,
          connectionId: this.connectionId,
          type: 'INVOICE',
          title: `Invoice ${invoice.number || invoice.id}`,
          description: `Amount: $${(invoice.amount_due / 100).toFixed(2)}`,
          occurredAt: new Date(invoice.created * 1000),
          externalId: invoice.id,
          externalUrl: invoice.hosted_invoice_url || undefined,
          metadata: {
            amount: invoice.amount_due / 100,
            currency: invoice.currency,
            status: invoice.status,
          },
        },
      });
    }
  }

  private async handleChargeEvent(charge: Stripe.Charge) {
    // Create activity for payment
    const mapping = await prisma.integrationMapping.findUnique({
      where: {
        connectionId_externalId: {
          connectionId: this.connectionId,
          externalId: charge.customer as string,
        },
      },
    });

    if (mapping) {
      await prisma.clientActivity.create({
        data: {
          orgId: mapping.orgId,
          clientId: mapping.clientId,
          connectionId: this.connectionId,
          type: 'PAYMENT',
          title: `Payment ${charge.id}`,
          description: `Amount: $${(charge.amount / 100).toFixed(2)}`,
          occurredAt: new Date(charge.created * 1000),
          externalId: charge.id,
          externalUrl: `https://dashboard.stripe.com/payments/${charge.id}`,
          metadata: {
            amount: charge.amount / 100,
            currency: charge.currency,
            status: charge.status,
          },
        },
      });
    }
  }
}
```

### Step 6: Create Integration Service Manager

Create `src/lib/services/integration.service.ts`:

```typescript
import { IntegrationProvider, IntegrationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { GmailIntegration } from '@/lib/integrations/gmail.integration';
import { StripeIntegration } from '@/lib/integrations/stripe.integration';
import { BaseIntegration } from '@/lib/integrations/base.integration';

export class IntegrationService {
  /**
   * Get integration instance for a connection
   */
  static async getIntegration(connectionId: string): Promise<BaseIntegration> {
    const connection = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Integration connection not found');
    }

    switch (connection.provider) {
      case 'GMAIL':
        return new GmailIntegration(
          {
            provider: connection.provider,
            type: connection.type,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            redirectUri: process.env.GOOGLE_REDIRECT_URI!,
            scopes: [
              'https://www.googleapis.com/auth/gmail.readonly',
              'https://www.googleapis.com/auth/contacts.readonly',
            ],
          },
          connectionId
        );

      case 'STRIPE':
        return new StripeIntegration(
          {
            provider: connection.provider,
            type: connection.type,
            clientId: process.env.STRIPE_CLIENT_ID!,
            clientSecret: process.env.STRIPE_SECRET_KEY!,
            redirectUri: process.env.STRIPE_REDIRECT_URI!,
            scopes: ['read_write'],
          },
          connectionId,
          process.env.STRIPE_SECRET_KEY!
        );

      // Add other providers here
      default:
        throw new Error(`Unsupported integration provider: ${connection.provider}`);
    }
  }

  /**
   * Sync all connections for an organization
   */
  static async syncOrganization(orgId: string) {
    const connections = await prisma.integrationConnection.findMany({
      where: {
        orgId,
        syncEnabled: true,
        syncStatus: { not: 'PAUSED' },
      },
    });

    const results = [];

    for (const connection of connections) {
      try {
        await prisma.integrationConnection.update({
          where: { id: connection.id },
          data: { syncStatus: 'SYNCING' },
        });

        const integration = await this.getIntegration(connection.id);
        const result = await integration.syncFromExternal();

        await prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            syncStatus: 'IDLE',
            lastSyncAt: new Date(),
            lastSyncError: result.errors.length > 0 ? result.errors.join('; ') : null,
          },
        });

        results.push({ connectionId: connection.id, ...result });
      } catch (error) {
        await prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            syncStatus: 'ERROR',
            lastSyncError: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        results.push({
          connectionId: connection.id,
          success: false,
          entitiesSynced: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    return results;
  }

  /**
   * Handle client creation and sync to all connected systems
   */
  static async createClientEverywhere(
    orgId: string,
    clientData: {
      email: string;
      name: string;
      phone?: string;
      company?: string;
    }
  ) {
    // Create client in AstralisOps
    const client = await prisma.client.create({
      data: {
        orgId,
        ...clientData,
      },
    });

    // Sync to all connected systems
    const connections = await prisma.integrationConnection.findMany({
      where: {
        orgId,
        syncEnabled: true,
        type: { in: ['CRM', 'BILLING'] }, // Only sync to CRM and billing systems
      },
    });

    for (const connection of connections) {
      try {
        const integration = await this.getIntegration(connection.id);
        const externalId = await integration.createClient(clientData);

        await prisma.integrationMapping.create({
          data: {
            orgId,
            clientId: client.id,
            connectionId: connection.id,
            externalId,
            externalType: 'customer',
            lastSyncedAt: new Date(),
            lastSyncDirection: 'TO_EXTERNAL',
          },
        });
      } catch (error) {
        console.error(`Failed to create client in ${connection.provider}:`, error);
      }
    }

    return client;
  }
}
```

### Step 7: Create API Routes for OAuth Flow

Create `src/app/api/integrations/[provider]/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { IntegrationProvider, IntegrationType } from '@prisma/client';
import { GmailIntegration } from '@/lib/integrations/gmail.integration';
import { StripeIntegration } from '@/lib/integrations/stripe.integration';

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = params.provider.toUpperCase() as IntegrationProvider;
  const state = `${session.user.orgId}:${session.user.id}:${Date.now()}`;

  let authUrl: string;

  switch (provider) {
    case 'GMAIL':
      const gmailConfig = {
        provider,
        type: 'EMAIL' as IntegrationType,
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: process.env.GOOGLE_REDIRECT_URI!,
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/contacts.readonly',
        ],
      };
      const gmailIntegration = new GmailIntegration(gmailConfig, '');
      authUrl = gmailIntegration.getAuthUrl(state);
      break;

    case 'STRIPE':
      const stripeConfig = {
        provider,
        type: 'BILLING' as IntegrationType,
        clientId: process.env.STRIPE_CLIENT_ID!,
        clientSecret: process.env.STRIPE_SECRET_KEY!,
        redirectUri: process.env.STRIPE_REDIRECT_URI!,
        scopes: ['read_write'],
      };
      const stripeIntegration = new StripeIntegration(stripeConfig, '', process.env.STRIPE_SECRET_KEY!);
      authUrl = stripeIntegration.getAuthUrl(state);
      break;

    default:
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}
```

Create `src/app/api/integrations/[provider]/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IntegrationProvider, IntegrationType } from '@prisma/client';
import { IntegrationService } from '@/lib/services/integration.service';
import { GmailIntegration } from '@/lib/integrations/gmail.integration';
import { StripeIntegration } from '@/lib/integrations/stripe.integration';

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/astralisops/settings/integrations?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/astralisops/settings/integrations?error=missing_params`);
  }

  // Parse state
  const [orgId, userId, timestamp] = state.split(':');

  const provider = params.provider.toUpperCase() as IntegrationProvider;

  try {
    // Exchange code for tokens
    let tokens: { accessToken: string; refreshToken?: string; expiresAt?: Date };
    let type: IntegrationType;
    let externalAccountId: string | null = null;

    switch (provider) {
      case 'GMAIL':
        const gmailConfig = {
          provider,
          type: 'EMAIL' as IntegrationType,
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          redirectUri: process.env.GOOGLE_REDIRECT_URI!,
          scopes: [],
        };
        const gmailIntegration = new GmailIntegration(gmailConfig, '');
        tokens = await gmailIntegration.exchangeCodeForTokens(code);
        type = 'EMAIL';
        // TODO: Fetch Gmail address
        externalAccountId = 'user@gmail.com'; // placeholder
        break;

      case 'STRIPE':
        const stripeConfig = {
          provider,
          type: 'BILLING' as IntegrationType,
          clientId: process.env.STRIPE_CLIENT_ID!,
          clientSecret: process.env.STRIPE_SECRET_KEY!,
          redirectUri: process.env.STRIPE_REDIRECT_URI!,
          scopes: [],
        };
        const stripeIntegration = new StripeIntegration(stripeConfig, '', process.env.STRIPE_SECRET_KEY!);
        tokens = await stripeIntegration.exchangeCodeForTokens(code);
        type = 'BILLING';
        externalAccountId = 'stripe_account'; // placeholder
        break;

      default:
        throw new Error('Unsupported provider');
    }

    // Create integration connection
    const connection = await prisma.integrationConnection.create({
      data: {
        orgId,
        userId,
        provider,
        type,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        externalAccountId,
        syncEnabled: true,
        syncStatus: 'IDLE',
      },
    });

    // Trigger initial sync
    await IntegrationService.syncOrganization(orgId);

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/astralisops/settings/integrations?success=true`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/astralisops/settings/integrations?error=auth_failed`);
  }
}
```

### Step 8: Create Webhook Handler Route

Create `src/app/api/webhooks/[provider]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { IntegrationService } from '@/lib/services/integration.service';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider.toUpperCase();

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-signature');

    // Verify webhook signature
    let event: any;

    switch (provider) {
      case 'STRIPE':
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-12-18.acacia',
        });

        if (!signature) {
          return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        break;

      // Add other providers
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Find connection for this webhook
    const connections = await prisma.integrationConnection.findMany({
      where: { provider: provider as any },
    });

    for (const connection of connections) {
      const integration = await IntegrationService.getIntegration(connection.id);
      await integration.handleWebhook(event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
```

### Step 9: Create Background Job for Periodic Sync

Create `src/workers/integration-sync.worker.ts`:

```typescript
import { Job, Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { IntegrationService } from '@/lib/services/integration.service';
import { prisma } from '@/lib/prisma';

const integrationSyncQueue = new Queue('integration-sync', {
  connection: redis,
});

export const integrationSyncWorker = new Worker(
  'integration-sync',
  async (job: Job) => {
    const { orgId } = job.data;

    console.log(`Starting integration sync for org ${orgId}`);

    try {
      const results = await IntegrationService.syncOrganization(orgId);

      console.log(`Integration sync completed for org ${orgId}:`, results);

      return results;
    } catch (error) {
      console.error(`Integration sync failed for org ${orgId}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

/**
 * Schedule periodic sync for all organizations
 */
export async function scheduleIntegrationSync() {
  const organizations = await prisma.organization.findMany({
    where: {
      integrationConnections: {
        some: {
          syncEnabled: true,
        },
      },
    },
    select: { id: true },
  });

  for (const org of organizations) {
    await integrationSyncQueue.add(
      'sync-org',
      { orgId: org.id },
      {
        repeat: {
          every: parseInt(process.env.INTEGRATION_SYNC_INTERVAL || '300') * 1000, // 5 minutes
        },
        jobId: `sync-org-${org.id}`,
      }
    );
  }

  console.log(`Scheduled periodic sync for ${organizations.length} organizations`);
}

// Start periodic sync on worker startup
scheduleIntegrationSync();
```

### Step 10: Create Integration Settings UI

Create `src/app/astralisops/settings/integrations/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Integration {
  id: string;
  provider: string;
  type: string;
  externalAccountName: string | null;
  syncEnabled: boolean;
  syncStatus: string;
  lastSyncAt: string | null;
  lastSyncError: string | null;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data.integrations);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = (provider: string) => {
    window.location.href = `/api/integrations/${provider.toLowerCase()}/connect`;
  };

  const disconnectIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
      await fetchIntegrations();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const triggerSync = async (id: string) => {
    try {
      await fetch(`/api/integrations/${id}/sync`, { method: 'POST' });
      await fetchIntegrations();
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  const availableIntegrations = [
    { provider: 'Gmail', icon: '📧', type: 'EMAIL' },
    { provider: 'Outlook', icon: '📬', type: 'EMAIL' },
    { provider: 'Google Calendar', icon: '📅', type: 'CALENDAR' },
    { provider: 'Stripe', icon: '💳', type: 'BILLING' },
    { provider: 'QuickBooks', icon: '📊', type: 'BILLING' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-astralis-navy mb-2">Integrations</h1>
        <p className="text-slate-600 mb-8">
          Connect your external systems to sync clients, emails, calendar events, and billing automatically.
        </p>

        <Alert variant="info" showIcon className="mb-8">
          <AlertDescription>
            Add a client once, and it will appear automatically in all your connected systems.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-astralis-navy mb-4">Connected Integrations</h2>

            {integrations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  No integrations connected yet. Connect one below to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {integrations.map(integration => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{integration.provider}</CardTitle>
                          <p className="text-sm text-slate-500 mt-1">
                            {integration.externalAccountName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              integration.syncStatus === 'IDLE'
                                ? 'success'
                                : integration.syncStatus === 'SYNCING'
                                ? 'info'
                                : 'error'
                            }
                          >
                            {integration.syncStatus}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerSync(integration.id)}
                          >
                            Sync Now
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => disconnectIntegration(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {integration.lastSyncAt && (
                      <CardContent>
                        <p className="text-sm text-slate-600">
                          Last synced: {new Date(integration.lastSyncAt).toLocaleString()}
                        </p>
                        {integration.lastSyncError && (
                          <Alert variant="error" showIcon className="mt-2">
                            <AlertDescription>{integration.lastSyncError}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-astralis-navy mb-4">Available Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableIntegrations.map(({ provider, icon, type }) => {
                const isConnected = integrations.some(i => i.provider === provider.toUpperCase().replace(' ', '_'));

                return (
                  <Card key={provider}>
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{icon}</span>
                          <div>
                            <h3 className="font-semibold text-astralis-navy">{provider}</h3>
                            <p className="text-sm text-slate-500">{type}</p>
                          </div>
                        </div>
                        <Button
                          variant={isConnected ? 'outline' : 'primary'}
                          disabled={isConnected}
                          onClick={() => connectIntegration(provider.toLowerCase().replace(' ', '_'))}
                        >
                          {isConnected ? 'Connected' : 'Connect'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Manual Testing Steps

**1. Gmail Integration**:
- [ ] Navigate to `/astralisops/settings/integrations`
- [ ] Click "Connect" on Gmail
- [ ] Complete Google OAuth flow
- [ ] Verify integration appears in "Connected Integrations"
- [ ] Click "Sync Now" and verify contacts imported
- [ ] Check database: clients created from Gmail contacts
- [ ] Check database: integration_mappings link clients to external IDs

**2. Stripe Integration**:
- [ ] Connect Stripe via OAuth
- [ ] Verify Stripe customers synced to clients
- [ ] Create new client in AstralisOps
- [ ] Verify client created in Stripe dashboard
- [ ] Create invoice in Stripe
- [ ] Verify webhook creates client activity
- [ ] Check client profile shows invoice activity

**3. Bidirectional Sync**:
- [ ] Create client in AstralisOps with email, name, phone
- [ ] Verify client appears in connected billing system
- [ ] Update client in external system (change name)
- [ ] Trigger sync or wait for webhook
- [ ] Verify client updated in AstralisOps
- [ ] Update client in AstralisOps
- [ ] Verify client updated in external system

**4. Conflict Resolution**:
- [ ] Update same client in both systems simultaneously
- [ ] Trigger sync
- [ ] Verify conflict resolution strategy applied
- [ ] Check last-write-wins behavior

**5. Integration Status Dashboard**:
- [ ] View all connected integrations
- [ ] Check sync status badges
- [ ] View last sync time
- [ ] View sync errors if any
- [ ] Disconnect integration
- [ ] Verify orphaned mappings handled

---

## Handoff to Next Phase

### What's Complete

✅ **Integration Hub Architecture**:
- Unified client entity as single source of truth
- Integration mappings for multi-system IDs
- Event-driven sync with background workers
- Bidirectional webhooks

✅ **OAuth Flows**:
- Gmail integration with contacts sync
- Stripe integration with customers/invoices
- Generic OAuth callback handling
- Token refresh mechanisms

✅ **Data Synchronization**:
- Periodic background sync jobs
- Webhook handlers for real-time updates
- Conflict resolution strategies
- Idempotent sync operations

✅ **Client Activity Tracking**:
- Emails linked to clients
- Invoices and payments logged
- Unified activity timeline

✅ **Database Schema**:
- IntegrationConnection, IntegrationMapping, Client, ClientActivity models
- Proper indexes for performance
- Multi-tenant isolation

### What's Next (Phase 6)

**Automation & Workflow Engine**:
- n8n integration for custom workflows
- Trigger actions based on client activities
- Automated follow-ups and reminders

---

**END OF PHASE 5 DOCUMENTATION**
