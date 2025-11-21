# Phase 4: Document Processing & OCR

**Duration**: 2-3 weeks
**Prerequisites**: Phase 1 (Authentication & RBAC), Phase 3 (AI Routing & Background Jobs)
**Docker Changes**: None (extends existing worker container from Phase 3)

---

## Phase Overview

This phase implements the complete document processing pipeline for AstralisOps, including file uploads to DigitalOcean Spaces, OCR extraction using Tesseract.js, and structured data extraction using GPT-4 Vision. By the end of this phase, users can upload documents (PDFs, images, scans), have text automatically extracted via OCR, and get structured data parsed from documents using AI.

### Success Criteria Checklist

- [ ] Users can upload files through drag-and-drop UI
- [ ] Files stored in DigitalOcean Spaces with CDN URLs
- [ ] File validation (type, size, virus scan) works
- [ ] OCR extraction completes for images and PDFs
- [ ] GPT-4 Vision extracts structured data from documents
- [ ] Document status workflow (PENDING → PROCESSING → COMPLETED) updates correctly
- [ ] Document viewer displays files with OCR overlay
- [ ] Document queue shows all uploads with filters
- [ ] Background worker processes documents asynchronously
- [ ] Error handling and retry logic works
- [ ] CDN serves files with proper caching headers
- [ ] All tests pass

---

## Complete Project Context

**Project**: AstralisOps - AI Operations Automation Platform
**Repository**: `/home/deploy/astralis-nextjs` on 137.184.31.207
**Stack**: Next.js 15 (App Router), TypeScript 5, Prisma ORM, PostgreSQL, Redis, Docker
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

**Authentication**: NextAuth.js v5 with JWT + database sessions (Phase 1)
**State Management**: Zustand (client), TanStack Query (server) (Phase 2)
**Background Jobs**: BullMQ + Redis (Phase 3)
**AI Integration**: OpenAI GPT-4 and GPT-4 Vision (Phase 3 + this phase)
**Validation**: Zod schemas for all inputs
**No AWS Dependencies**: DigitalOcean Spaces, Tesseract.js, open source tools only

---

## Docker Services State (Phase 4)

```yaml
Active Containers:
- app: Next.js application (port 3001)
  ├── Handles all web requests
  ├── Serves marketing pages and API routes
  ├── Includes NextAuth routes (Phase 1)
  ├── Includes dashboard UI routes (Phase 2)
  ├── Now includes file upload endpoints (Phase 4)
  └── Connects to DigitalOcean Spaces for file storage

- postgres: PostgreSQL 16 database
  ├── Stores all application data
  ├── Multi-tenant with Organization as root entity
  ├── Includes auth tables (Phase 1)
  ├── Includes pipeline/intake tables (Phase 2)
  └── Document table stores file metadata and OCR results

- redis: Redis 7 (added in Phase 3)
  ├── Job queue storage (BullMQ)
  ├── Cache layer for frequently accessed data
  └── Pub/sub for real-time updates

- worker: Background job processor (added in Phase 3)
  ├── Processes intake routing jobs (Phase 3)
  ├── Sends email notifications (Phase 3)
  ├── NEW: Processes document OCR jobs (Phase 4)
  ├── NEW: Extracts structured data with GPT-4 Vision (Phase 4)
  └── NEW: Generates document thumbnails (Phase 4)

Volumes:
- postgres-data: Database persistence
- redis-data: Redis persistence (AOF + RDB)

Networks:
- astralis-network: Bridge network connecting all services

External Services:
- DigitalOcean Spaces: S3-compatible object storage
  ├── Endpoint: nyc3.digitaloceanspaces.com
  ├── CDN: astralis-documents.nyc3.cdn.digitaloceanspaces.com
  └── Bucket: astralis-documents

Status: No new Docker containers, extending worker from Phase 3
```

---

## Database Schema State (After Phase 4)

Phase 4 uses the existing Document model from the base schema. No schema changes required, but we'll add indexes for performance.

### Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== ENUMS =====

enum Role {
  ADMIN
  OPERATOR
  CLIENT
}

enum DocumentStatus {
  PENDING      // Uploaded, awaiting processing
  PROCESSING   // OCR/extraction in progress
  COMPLETED    // Successfully processed
  FAILED       // Processing failed
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

// ===== CORE MODELS (Phase 1) =====

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

  organization     Organization  @relation(fields: [orgId], references: [id])
  pipelines        Pipeline[]    @relation("PipelineOperators")
  accounts         Account[]
  sessions         Session[]
  activityLogs     ActivityLog[]

  @@index([orgId])
  @@index([email])
  @@index([isActive])
}

// ===== AUTH MODELS (Phase 1) =====

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
  id          String   @id @default(cuid())
  userId      String?
  orgId       String
  action      String
  entity      String
  entityId    String?
  changes     Json?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([orgId])
  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// ===== PIPELINE MODELS (Phase 2) =====

model Pipeline {
  id           String   @id @default(cuid())
  name         String
  description  String?  @db.Text
  color        String?
  isActive     Boolean  @default(true)
  orgId        String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  organization   Organization    @relation(fields: [orgId], references: [id])
  stages         Stage[]
  operators      User[]          @relation("PipelineOperators")
  intakeRequests IntakeRequest[]

  @@index([orgId])
  @@index([isActive])
}

model Stage {
  id         String @id @default(cuid())
  name       String
  order      Int
  pipelineId String

  pipeline Pipeline       @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  items    PipelineItem[]

  @@index([pipelineId])
  @@index([order])
}

model PipelineItem {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  data        Json
  priority    Int      @default(0)
  assignedTo  String?
  tags        String[]
  stageId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  stage Stage @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@index([stageId])
  @@index([priority])
  @@index([createdAt])
}

// ===== DOCUMENT MODEL (Phase 4 - Enhanced) =====

model Document {
  id              String         @id @default(cuid())
  fileName        String
  originalName    String         // Original upload filename
  filePath        String         // Full Spaces path
  cdnUrl          String?        // CDN URL for fast access
  thumbnailUrl    String?        // Thumbnail CDN URL
  fileSize        Int            // Bytes
  mimeType        String
  status          DocumentStatus @default(PENDING)
  ocrText         String?        @db.Text
  ocrConfidence   Float?         // Average confidence score
  extractedData   Json?          // Structured data from GPT-4 Vision
  metadata        Json?          // File metadata, dimensions, etc.
  processingError String?        @db.Text
  uploadedBy      String
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  processedAt     DateTime?      // When OCR completed

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([uploadedBy])
  @@index([createdAt])
  @@index([processedAt])
  @@index([mimeType])
}

// ===== INTAKE MODEL (Phase 3) =====

model IntakeRequest {
  id               String       @id @default(cuid())
  source           IntakeSource
  status           IntakeStatus @default(NEW)
  title            String
  description      String?      @db.Text
  requestData      Json
  aiRoutingMeta    Json?        // AI routing decision metadata
  routingConfidence Float?      // Confidence score (0-1)
  assignedPipeline String?
  priority         Int          @default(0)
  orgId            String
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])
  pipeline     Pipeline?    @relation(fields: [assignedPipeline], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([source])
  @@index([createdAt])
  @@index([priority])
  @@index([assignedPipeline])
}

// ===== AUTOMATION MODEL =====

model Automation {
  id            String    @id @default(cuid())
  name          String
  description   String?   @db.Text
  workflowId    String?   // n8n workflow ID
  webhookUrl    String?
  isActive      Boolean   @default(true)
  triggerConfig Json
  lastRunAt     DateTime?
  runCount      Int       @default(0)
  orgId         String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([isActive])
  @@index([workflowId])
}

// ===== SCHEDULING MODEL (Phase 5) =====

model SchedulingEvent {
  id                  String      @id @default(cuid())
  title               String
  description         String?     @db.Text
  startTime           DateTime
  endTime             DateTime
  participants        Json        // Array of participant emails/IDs
  calendarIntegration Json?       // Google Calendar metadata
  aiScheduled         Boolean     @default(false)
  status              EventStatus @default(SCHEDULED)
  conflictData        Json?       // Conflict detection results
  orgId               String
  createdBy           String?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([startTime])
  @@index([endTime])
  @@index([aiScheduled])
  @@index([createdBy])
}
```

### Schema Changes Summary

**No new tables added in Phase 4**. The existing `Document` model is used with these field purposes clarified:

- `originalName`: User's original filename
- `fileName`: Sanitized filename stored in Spaces
- `filePath`: Full path in Spaces bucket (e.g., `org-abc123/docs/uuid.pdf`)
- `cdnUrl`: CDN URL for fast public access
- `thumbnailUrl`: Thumbnail image CDN URL (for previews)
- `ocrText`: Extracted text from OCR
- `ocrConfidence`: Average confidence score from Tesseract
- `extractedData`: Structured JSON from GPT-4 Vision (e.g., `{ "invoiceNumber": "INV-001", "total": 150.00 }`)
- `metadata`: File metadata (dimensions, page count, etc.)
- `processingError`: Error message if processing fails

---

## Environment Variables (Cumulative After Phase 4)

Update `.env.local` with new DigitalOcean Spaces variables:

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"

# ===== NEXTAUTH.JS (Phase 1) =====
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-generated-with-openssl-rand"
NEXTAUTH_URL="http://localhost:3001"

# ===== GOOGLE OAUTH (Phase 1) =====
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# ===== EMAIL (Phase 1) =====
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ===== REDIS (Phase 3) =====
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your-redis-password-min-32-chars"

# ===== OPENAI (Phase 3 + Phase 4) =====
OPENAI_API_KEY="sk-proj-your-openai-api-key"
OPENAI_ORG_ID="org-your-openai-org-id"  # Optional

# ===== DIGITALOCEAN SPACES (Phase 4 - NEW) =====
# Spaces credentials (create in DigitalOcean Control Panel → API → Spaces Keys)
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="your-spaces-secret-key-64-chars-long"

# Spaces configuration
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"  # Or: sfo3, sgp1, fra1, etc.
SPACES_REGION="nyc3"  # Must match endpoint
SPACES_BUCKET="astralis-documents"  # Your bucket name

# CDN configuration (enable Spaces CDN in DigitalOcean)
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"
# Or custom domain: "https://cdn.astralisone.com"

# File upload limits
MAX_FILE_SIZE="52428800"  # 50MB in bytes
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# ===== API =====
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# ===== ANALYTICS (existing) =====
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"
```

### Generating Spaces Credentials

```bash
# 1. Create Spaces bucket in DigitalOcean Control Panel
# Navigate to: Manage → Spaces → Create Spaces Bucket
# - Choose region: New York 3 (nyc3)
# - Bucket name: astralis-documents
# - Enable CDN
# - Set CORS policy (see implementation steps)

# 2. Generate Spaces access keys
# Navigate to: API → Spaces Keys → Generate New Key
# - Key name: astralis-production
# - Copy Access Key and Secret Key immediately (secret shown once only)

# 3. Generate Redis password
openssl rand -base64 32
```

---

## File Structure (After Phase 4)

```
src/
├── app/
│   ├── (marketing)/              # Existing marketing pages
│   ├── (app)/                    # Authenticated dashboard
│   │   ├── dashboard/
│   │   ├── pipelines/
│   │   ├── intake/
│   │   ├── documents/           # NEW: Document management pages
│   │   │   ├── page.tsx         # Document queue list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Document detail viewer
│   │   │   └── upload/
│   │   │       └── page.tsx     # Upload interface
│   │   └── settings/
│   ├── api/
│   │   ├── auth/                # Phase 1
│   │   ├── booking/             # Existing
│   │   ├── contact/             # Existing
│   │   ├── intake/              # Phase 3
│   │   ├── pipelines/           # Phase 2
│   │   ├── documents/           # NEW: Document API routes
│   │   │   ├── route.ts         # List/create documents
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts     # Get/update/delete document
│   │   │   │   └── download/
│   │   │   │       └── route.ts # Download original file
│   │   │   └── upload/
│   │   │       └── route.ts     # File upload handler
│   │   └── users/               # Existing
│   ├── astralisops/             # Existing
│   ├── solutions/               # Existing
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/
│   ├── ui/                      # Existing (Button, Input, Card, etc.)
│   ├── auth/                    # Phase 1
│   ├── dashboard/               # Phase 2
│   │   ├── KanbanBoard.tsx
│   │   ├── StatsWidget.tsx
│   │   ├── IntakeQueueTable.tsx
│   │   ├── DocumentUploader.tsx  # NEW [ADDED IN PHASE 4]
│   │   ├── DocumentQueue.tsx     # NEW [ADDED IN PHASE 4]
│   │   ├── DocumentViewer.tsx    # NEW [ADDED IN PHASE 4]
│   │   └── OCROverlay.tsx        # NEW [ADDED IN PHASE 4]
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── OrgSwitcher.tsx
│   └── sections/                # Existing
├── hooks/                       # Phase 2
│   ├── usePipelines.ts
│   ├── useIntake.ts
│   ├── useOrganization.ts
│   ├── useDocuments.ts          # NEW [ADDED IN PHASE 4]
│   └── index.ts
├── lib/
│   ├── auth/                    # Phase 1
│   ├── middleware/              # Phase 1
│   ├── services/
│   │   ├── auth.service.ts      # Phase 1
│   │   ├── user.service.ts      # Phase 1
│   │   ├── activity-log.service.ts  # Phase 1
│   │   ├── ai-routing.service.ts    # Phase 3
│   │   ├── spaces.service.ts    # NEW [ADDED IN PHASE 4]
│   │   ├── ocr.service.ts       # NEW [ADDED IN PHASE 4]
│   │   └── document.service.ts  # NEW [ADDED IN PHASE 4]
│   ├── validators/
│   │   ├── auth.validators.ts   # Phase 1
│   │   ├── intake.validators.ts # Phase 3
│   │   └── document.validators.ts  # NEW [ADDED IN PHASE 4]
│   ├── utils/
│   │   ├── crypto.ts            # Phase 1
│   │   ├── email-templates.ts   # Phase 1
│   │   ├── file-validation.ts   # NEW [ADDED IN PHASE 4]
│   │   └── mime-types.ts        # NEW [ADDED IN PHASE 4]
│   ├── prisma.ts                # Existing
│   ├── email.ts                 # Existing
│   ├── calendar.ts              # Existing
│   └── utils.ts                 # Existing
├── workers/                     # Phase 3
│   ├── index.ts                 # Worker entry point
│   ├── queues/
│   │   ├── intake-routing.queue.ts   # Phase 3
│   │   ├── email-sending.queue.ts    # Phase 3
│   │   └── document-processing.queue.ts  # NEW [ADDED IN PHASE 4]
│   └── processors/
│       ├── intake-routing.processor.ts   # Phase 3
│       ├── email-sending.processor.ts    # Phase 3
│       ├── ocr.processor.ts              # NEW [ADDED IN PHASE 4]
│       └── data-extraction.processor.ts  # NEW [ADDED IN PHASE 4]
├── stores/                      # Phase 2
│   ├── dashboardStore.ts
│   ├── pipelineStore.ts
│   └── index.ts
└── types/
    ├── next-auth.d.ts           # Phase 1
    ├── dashboard.ts             # Phase 2
    └── document.ts              # NEW [ADDED IN PHASE 4]
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
cd /home/deploy/astralis-nextjs

# Install DigitalOcean Spaces SDK (AWS SDK v3 - S3 compatible)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Install OCR libraries
npm install tesseract.js

# Install file processing utilities
npm install sharp  # Image processing and thumbnails
npm install pdf-parse  # PDF text extraction
npm install file-type  # MIME type detection
npm install sanitize-filename  # Filename sanitization

# Install drag-and-drop uploader (if not already installed)
npm install react-dropzone

# Verify installation
npm list @aws-sdk/client-s3 tesseract.js sharp pdf-parse
```

### Step 2: Configure DigitalOcean Spaces Bucket

**Manual Setup in DigitalOcean Console**:

1. Log in to DigitalOcean Control Panel
2. Navigate to **Manage → Spaces → Create**
3. Configure bucket:
   - **Region**: New York 3 (nyc3)
   - **Bucket name**: `astralis-documents`
   - **Enable CDN**: Yes
   - **File Listing**: Private (default)
4. Click **Create Spaces Bucket**
5. Navigate to **Settings** tab
6. Click **Add CORS Configuration**:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3001", "https://app.astralisone.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

7. Save CORS configuration
8. Note the **Edge endpoint** (CDN URL): `https://astralis-documents.nyc3.cdn.digitaloceanspaces.com`

**Generate API Keys**:

1. Navigate to **API → Spaces Keys**
2. Click **Generate New Key**
3. Name: `astralis-production`
4. Copy **Access Key** and **Secret Key** immediately
5. Add to `.env.local`

### Step 3: Create Spaces Service

Create `src/lib/services/spaces.service.ts`:

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sanitizeFilename from 'sanitize-filename';
import crypto from 'crypto';

/**
 * DigitalOcean Spaces Service
 *
 * Handles all file storage operations using DigitalOcean Spaces
 * (S3-compatible object storage).
 */
export class SpacesService {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;

  constructor() {
    // Validate required environment variables
    if (!process.env.SPACES_ACCESS_KEY || !process.env.SPACES_SECRET_KEY) {
      throw new Error('Spaces credentials not configured');
    }

    this.bucket = process.env.SPACES_BUCKET || 'astralis-documents';
    this.cdnUrl = process.env.SPACES_CDN_URL || '';

    // Initialize S3 client with DigitalOcean Spaces endpoint
    this.client = new S3Client({
      endpoint: `https://${process.env.SPACES_ENDPOINT}`,
      region: process.env.SPACES_REGION || 'nyc3',
      credentials: {
        accessKeyId: process.env.SPACES_ACCESS_KEY,
        secretAccessKey: process.env.SPACES_SECRET_KEY,
      },
      // Force path-style URLs for compatibility
      forcePathStyle: false,
    });
  }

  /**
   * Generate unique filename with organization prefix
   */
  private generateFilename(orgId: string, originalName: string): string {
    const sanitized = sanitizeFilename(originalName);
    const ext = sanitized.split('.').pop() || '';
    const baseName = sanitized.slice(0, -(ext.length + 1));
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');

    return `${baseName}-${timestamp}-${random}.${ext}`;
  }

  /**
   * Generate file path with organization prefix
   */
  private getFilePath(orgId: string, filename: string, folder: string = 'documents'): string {
    return `org-${orgId}/${folder}/${filename}`;
  }

  /**
   * Upload file to Spaces
   *
   * @param file - File buffer
   * @param originalName - Original filename
   * @param mimeType - MIME type
   * @param orgId - Organization ID
   * @param folder - Optional folder name (default: 'documents')
   * @returns Object with file metadata
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    orgId: string,
    folder: string = 'documents'
  ): Promise<{
    fileName: string;
    filePath: string;
    cdnUrl: string;
    fileSize: number;
  }> {
    try {
      const fileName = this.generateFilename(orgId, originalName);
      const filePath = this.getFilePath(orgId, fileName, folder);

      // Upload to Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: file,
        ContentType: mimeType,
        // Set cache control for CDN
        CacheControl: 'public, max-age=31536000', // 1 year
        // ACL for public read (if needed)
        ACL: 'private', // Change to 'public-read' if files should be publicly accessible
        // Metadata
        Metadata: {
          'original-name': originalName,
          'org-id': orgId,
          'uploaded-at': new Date().toISOString(),
        },
      });

      await this.client.send(command);

      // Generate CDN URL
      const cdnUrl = this.getCdnUrl(filePath);

      return {
        fileName,
        filePath,
        cdnUrl,
        fileSize: file.length,
      };
    } catch (error) {
      console.error('Spaces upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from Spaces
   *
   * @param filePath - File path in Spaces
   * @returns File buffer
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('No file body received');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Spaces download error:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Spaces
   *
   * @param filePath - File path in Spaces
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Spaces delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   *
   * @param filePath - File path in Spaces
   * @returns File metadata
   */
  async getFileMetadata(filePath: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      const response = await this.client.send(command);

      return {
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata || {},
      };
    } catch (error) {
      console.error('Spaces metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate signed URL for temporary access
   *
   * @param filePath - File path in Spaces
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Spaces signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get CDN URL for file
   *
   * @param filePath - File path in Spaces
   * @returns CDN URL
   */
  getCdnUrl(filePath: string): string {
    if (!this.cdnUrl) {
      // Fallback to direct Spaces URL if CDN not configured
      return `https://${this.bucket}.${process.env.SPACES_ENDPOINT}/${filePath}`;
    }

    return `${this.cdnUrl}/${filePath}`;
  }

  /**
   * Copy file within Spaces
   *
   * @param sourcePath - Source file path
   * @param destinationPath - Destination file path
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourcePath}`,
        Key: destinationPath,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Spaces copy error:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists
   *
   * @param filePath - File path in Spaces
   * @returns True if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}

export const spacesService = new SpacesService();
```

### Step 4: Create File Validation Utilities

Create `src/lib/utils/file-validation.ts`:

```typescript
import { fromBuffer } from 'file-type';

/**
 * File validation utilities for secure file uploads
 */

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
];

// Maximum file size (50MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10);

/**
 * Validate file type and size
 */
export async function validateFile(
  file: Buffer,
  filename: string,
  declaredMimeType?: string
): Promise<{
  valid: boolean;
  mimeType?: string;
  error?: string;
}> {
  // Check file size
  if (file.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file size minimum (1KB)
  if (file.length < 1024) {
    return {
      valid: false,
      error: 'File size too small (minimum 1KB)',
    };
  }

  // Detect actual MIME type from file buffer
  const fileTypeResult = await fromBuffer(file);

  if (!fileTypeResult) {
    // If file-type can't detect, check if it's plain text
    const isText = isTextFile(file);
    if (isText && declaredMimeType === 'text/plain') {
      return {
        valid: true,
        mimeType: 'text/plain',
      };
    }

    return {
      valid: false,
      error: 'Unable to determine file type',
    };
  }

  const { mime: detectedMimeType } = fileTypeResult;

  // Check if detected MIME type is allowed
  if (!ALLOWED_MIME_TYPES.includes(detectedMimeType)) {
    return {
      valid: false,
      error: `File type ${detectedMimeType} is not allowed`,
    };
  }

  // Verify declared MIME type matches detected type (prevent spoofing)
  if (declaredMimeType && declaredMimeType !== detectedMimeType) {
    console.warn(`MIME type mismatch: declared=${declaredMimeType}, detected=${detectedMimeType}`);
    // Allow some exceptions (e.g., .docx detected as application/zip)
    if (!isMimeTypeException(declaredMimeType, detectedMimeType)) {
      return {
        valid: false,
        error: `File type mismatch: declared ${declaredMimeType} but detected ${detectedMimeType}`,
      };
    }
  }

  return {
    valid: true,
    mimeType: detectedMimeType,
  };
}

/**
 * Check if buffer contains text
 */
function isTextFile(buffer: Buffer): boolean {
  // Check first 8KB for text content
  const sample = buffer.slice(0, 8192);
  let textChars = 0;

  for (const byte of sample) {
    // Check if byte is printable ASCII or common whitespace
    if (
      (byte >= 0x20 && byte <= 0x7e) || // Printable ASCII
      byte === 0x09 || // Tab
      byte === 0x0a || // Line feed
      byte === 0x0d    // Carriage return
    ) {
      textChars++;
    }
  }

  // Consider text if >90% printable characters
  return textChars / sample.length > 0.9;
}

/**
 * Check if MIME type mismatch is acceptable
 */
function isMimeTypeException(declared: string, detected: string): boolean {
  // Office documents are ZIP archives
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (officeTypes.includes(declared) && detected === 'application/zip') {
    return true;
  }

  return false;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/^.*[\/\\]/, '');

  // Remove or replace unsafe characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '-');

  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop() || '';
    const baseName = sanitized.slice(0, maxLength - ext.length - 1);
    sanitized = `${baseName}.${ext}`;
  }

  return sanitized;
}

/**
 * Get file extension from filename or MIME type
 */
export function getFileExtension(filename?: string, mimeType?: string): string {
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext) return ext;
  }

  if (mimeType) {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/tiff': 'tiff',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'text/csv': 'csv',
    };

    return mimeToExt[mimeType] || 'bin';
  }

  return 'bin';
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if file requires OCR processing
 */
export function requiresOCR(mimeType: string): boolean {
  return isImage(mimeType) || isPDF(mimeType);
}
```

### Step 5: Create OCR Service

Create `src/lib/services/ocr.service.ts`:

```typescript
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { isPDF, isImage } from '@/lib/utils/file-validation';

/**
 * OCR Service using Tesseract.js
 *
 * Handles text extraction from images and PDFs
 */
export class OCRService {
  /**
   * Extract text from file buffer
   *
   * @param buffer - File buffer
   * @param mimeType - MIME type
   * @returns Extracted text and confidence score
   */
  async extractText(
    buffer: Buffer,
    mimeType: string
  ): Promise<{
    text: string;
    confidence: number;
    pageCount?: number;
  }> {
    if (isPDF(mimeType)) {
      return this.extractFromPDF(buffer);
    } else if (isImage(mimeType)) {
      return this.extractFromImage(buffer);
    } else {
      throw new Error(`OCR not supported for MIME type: ${mimeType}`);
    }
  }

  /**
   * Extract text from PDF
   *
   * First tries native PDF text extraction,
   * falls back to OCR if no text found
   */
  private async extractFromPDF(buffer: Buffer): Promise<{
    text: string;
    confidence: number;
    pageCount: number;
  }> {
    try {
      // Try native PDF text extraction first
      const pdfData = await pdfParse(buffer);

      if (pdfData.text && pdfData.text.trim().length > 100) {
        // PDF has extractable text
        return {
          text: pdfData.text.trim(),
          confidence: 1.0, // Native extraction is 100% confident
          pageCount: pdfData.numpages,
        };
      }

      // No text found, PDF is likely scanned - use OCR
      console.log('PDF has no extractable text, using OCR...');

      // Convert PDF to images and OCR each page
      // For simplicity, we'll just OCR the first page
      // In production, you'd convert all pages and OCR each one

      // This is a simplified approach - in production, use pdf2pic or similar
      throw new Error('PDF OCR not fully implemented - requires pdf-to-image conversion');

    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from image using Tesseract.js
   */
  private async extractFromImage(buffer: Buffer): Promise<{
    text: string;
    confidence: number;
  }> {
    try {
      // Preprocess image for better OCR accuracy
      const preprocessedBuffer = await this.preprocessImage(buffer);

      // Perform OCR
      const result = await Tesseract.recognize(preprocessedBuffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence / 100, // Convert to 0-1 range
      };
    } catch (error) {
      console.error('Image OCR error:', error);
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   *
   * - Convert to grayscale
   * - Increase contrast
   * - Resize to optimal DPI (300)
   */
  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Calculate resize dimensions for 300 DPI
      const targetDPI = 300;
      const currentDPI = metadata.density || 72;
      const scaleFactor = targetDPI / currentDPI;

      return await image
        .resize({
          width: Math.round((metadata.width || 0) * scaleFactor),
          height: Math.round((metadata.height || 0) * scaleFactor),
          fit: 'inside',
        })
        .greyscale()
        .normalize() // Auto-adjust contrast
        .sharpen()
        .toBuffer();
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return buffer;
    }
  }

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(
    buffer: Buffer,
    width: number = 300,
    height: number = 300
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const ocrService = new OCRService();
```

### Step 6: Create GPT-4 Vision Data Extraction Service

Create `src/lib/services/data-extraction.service.ts`:

```typescript
import OpenAI from 'openai';
import { z } from 'zod';

/**
 * Data Extraction Service using GPT-4 Vision
 *
 * Extracts structured data from document images using AI
 */
export class DataExtractionService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }

  /**
   * Extract structured data from document image
   *
   * @param imageBuffer - Image buffer
   * @param documentType - Type of document (invoice, receipt, form, etc.)
   * @param schema - Zod schema for validation
   * @returns Extracted structured data
   */
  async extractStructuredData<T>(
    imageBuffer: Buffer,
    documentType: string,
    schema?: z.ZodSchema<T>
  ): Promise<{
    data: T;
    confidence: number;
    raw: string;
  }> {
    try {
      // Convert image to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      // Build prompt based on document type
      const prompt = this.buildPrompt(documentType);

      // Call GPT-4 Vision
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high', // Use high detail for better accuracy
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for consistent extraction
      });

      const rawResponse = response.choices[0]?.message?.content || '';

      if (!rawResponse) {
        throw new Error('No response from GPT-4 Vision');
      }

      // Parse JSON from response
      const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       rawResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      const parsedData = JSON.parse(jsonString);

      // Validate with schema if provided
      if (schema) {
        const validated = schema.parse(parsedData);
        return {
          data: validated,
          confidence: this.calculateConfidence(parsedData),
          raw: rawResponse,
        };
      }

      return {
        data: parsedData as T,
        confidence: this.calculateConfidence(parsedData),
        raw: rawResponse,
      };
    } catch (error) {
      console.error('Data extraction error:', error);
      throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build extraction prompt based on document type
   */
  private buildPrompt(documentType: string): string {
    const basePrompt = `Extract structured data from this ${documentType} image and return it as JSON.`;

    const typeSpecificPrompts: Record<string, string> = {
      invoice: `${basePrompt}

Include the following fields:
- invoiceNumber: string
- invoiceDate: string (ISO 8601 format)
- dueDate: string (ISO 8601 format)
- vendor: { name: string, address?: string, email?: string, phone?: string }
- customer: { name: string, address?: string, email?: string, phone?: string }
- lineItems: Array<{ description: string, quantity: number, unitPrice: number, total: number }>
- subtotal: number
- tax: number
- total: number
- currency: string (ISO 4217 code)

Return ONLY valid JSON, no additional text. Wrap the JSON in \`\`\`json code blocks.`,

      receipt: `${basePrompt}

Include the following fields:
- merchant: string
- date: string (ISO 8601 format)
- time: string (HH:MM format)
- items: Array<{ description: string, price: number }>
- subtotal: number
- tax: number
- total: number
- paymentMethod: string
- currency: string (ISO 4217 code)

Return ONLY valid JSON, no additional text. Wrap the JSON in \`\`\`json code blocks.`,

      form: `${basePrompt}

Identify all form fields and their values. Return as:
- fields: Array<{ label: string, value: string, fieldType: string }>
- formTitle: string

Return ONLY valid JSON, no additional text. Wrap the JSON in \`\`\`json code blocks.`,

      generic: `${basePrompt}

Extract all relevant structured information you can identify. Return as:
- type: string (document type you detected)
- data: object (extracted fields)
- entities: Array<{ type: string, value: string }> (named entities like dates, amounts, names)

Return ONLY valid JSON, no additional text. Wrap the JSON in \`\`\`json code blocks.`,
    };

    return typeSpecificPrompts[documentType] || typeSpecificPrompts.generic;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(data: any): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data completeness
    const fields = Object.keys(data);
    const filledFields = fields.filter(key => {
      const value = data[key];
      return value !== null && value !== undefined && value !== '';
    });

    confidence += (filledFields.length / fields.length) * 0.3;

    // Check for specific high-confidence fields
    const highConfidenceFields = ['invoiceNumber', 'total', 'date'];
    const hasHighConfidenceFields = highConfidenceFields.some(field =>
      fields.includes(field) && data[field]
    );

    if (hasHighConfidenceFields) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Detect MIME type from buffer magic numbers
   */
  private detectMimeType(buffer: Buffer): string {
    // Check PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    }

    // Check JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    }

    // Check WebP
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return 'image/webp';
    }

    // Default
    return 'image/jpeg';
  }
}

export const dataExtractionService = new DataExtractionService();
```

### Step 7: Create Document Validation Schema

Create `src/lib/validators/document.validators.ts`:

```typescript
import { z } from 'zod';

/**
 * Document upload validation schema
 */
export const documentUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(52428800), // 50MB
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i),
  orgId: z.string().cuid(),
});

/**
 * Document metadata validation
 */
export const documentMetadataSchema = z.object({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  colorSpace: z.string().optional(),
  hasAlpha: z.boolean().optional(),
});

/**
 * Invoice extraction schema
 */
export const invoiceDataSchema = z.object({
  invoiceNumber: z.string(),
  invoiceDate: z.string(), // ISO 8601
  dueDate: z.string().optional(),
  vendor: z.object({
    name: z.string(),
    address: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  customer: z.object({
    name: z.string(),
    address: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number(),
    })
  ),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  currency: z.string().length(3), // ISO 4217
});

/**
 * Receipt extraction schema
 */
export const receiptDataSchema = z.object({
  merchant: z.string(),
  date: z.string(),
  time: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string(),
      price: z.number(),
    })
  ),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  paymentMethod: z.string().optional(),
  currency: z.string().length(3),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type InvoiceData = z.infer<typeof invoiceDataSchema>;
export type ReceiptData = z.infer<typeof receiptDataSchema>;
```

### Step 8: Create Document Service

Create `src/lib/services/document.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { spacesService } from './spaces.service';
import { ocrService } from './ocr.service';
import { dataExtractionService } from './data-extraction.service';
import { validateFile, isImage, requiresOCR } from '@/lib/utils/file-validation';
import { DocumentStatus } from '@prisma/client';
import { addJob } from '@/workers/queues/document-processing.queue';

/**
 * Document Service
 *
 * Handles document lifecycle management
 */
export class DocumentService {
  /**
   * Upload and process document
   *
   * @param file - File buffer
   * @param originalName - Original filename
   * @param mimeType - MIME type
   * @param uploadedBy - User ID
   * @param orgId - Organization ID
   * @returns Created document record
   */
  async uploadDocument(
    file: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string,
    orgId: string
  ): Promise<any> {
    // Validate file
    const validation = await validateFile(file, originalName, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    const validatedMimeType = validation.mimeType || mimeType;

    // Upload to Spaces
    const uploadResult = await spacesService.uploadFile(
      file,
      originalName,
      validatedMimeType,
      orgId,
      'documents'
    );

    // Generate thumbnail for images
    let thumbnailUrl: string | undefined;
    if (isImage(validatedMimeType)) {
      try {
        const thumbnail = await ocrService.generateThumbnail(file);
        const thumbnailUpload = await spacesService.uploadFile(
          thumbnail,
          `thumb-${originalName}`,
          'image/jpeg',
          orgId,
          'thumbnails'
        );
        thumbnailUrl = thumbnailUpload.cdnUrl;
      } catch (error) {
        console.error('Thumbnail generation failed:', error);
        // Continue without thumbnail
      }
    }

    // Get image metadata
    let metadata: any = {};
    if (isImage(validatedMimeType)) {
      try {
        const sharp = (await import('sharp')).default;
        const imageMetadata = await sharp(file).metadata();
        metadata = {
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
          colorSpace: imageMetadata.space,
          hasAlpha: imageMetadata.hasAlpha,
        };
      } catch (error) {
        console.error('Metadata extraction failed:', error);
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        fileName: uploadResult.fileName,
        originalName,
        filePath: uploadResult.filePath,
        cdnUrl: uploadResult.cdnUrl,
        thumbnailUrl,
        fileSize: uploadResult.fileSize,
        mimeType: validatedMimeType,
        status: DocumentStatus.PENDING,
        metadata,
        uploadedBy,
        orgId,
      },
    });

    // Queue for processing if OCR required
    if (requiresOCR(validatedMimeType)) {
      await addJob('document-processing', {
        documentId: document.id,
        orgId,
      });
    } else {
      // Mark as completed if no processing needed
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.COMPLETED,
          processedAt: new Date(),
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: uploadedBy,
        orgId,
        action: 'UPLOAD',
        entity: 'DOCUMENT',
        entityId: document.id,
        metadata: {
          fileName: originalName,
          fileSize: uploadResult.fileSize,
          mimeType: validatedMimeType,
        },
      },
    });

    return document;
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string, orgId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  /**
   * List documents for organization
   */
  async listDocuments(
    orgId: string,
    filters?: {
      status?: DocumentStatus;
      mimeType?: string;
      uploadedBy?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { orgId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.mimeType) {
      where.mimeType = { startsWith: filters.mimeType };
    }

    if (filters?.uploadedBy) {
      where.uploadedBy = filters.uploadedBy;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.document.count({ where }),
    ]);

    return { documents, total };
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, orgId: string, userId: string) {
    const document = await this.getDocument(documentId, orgId);

    // Delete from Spaces
    try {
      await spacesService.deleteFile(document.filePath);
      if (document.thumbnailUrl) {
        // Extract thumbnail path from CDN URL
        const thumbnailPath = document.thumbnailUrl.split('/').slice(-3).join('/');
        await spacesService.deleteFile(thumbnailPath);
      }
    } catch (error) {
      console.error('Failed to delete files from Spaces:', error);
      // Continue with database deletion
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        orgId,
        action: 'DELETE',
        entity: 'DOCUMENT',
        entityId: documentId,
        metadata: {
          fileName: document.originalName,
        },
      },
    });
  }

  /**
   * Download document file
   */
  async downloadDocument(documentId: string, orgId: string): Promise<{
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }> {
    const document = await this.getDocument(documentId, orgId);

    const buffer = await spacesService.downloadFile(document.filePath);

    return {
      buffer,
      fileName: document.originalName,
      mimeType: document.mimeType,
    };
  }
}

export const documentService = new DocumentService();
```

### Step 9: Create Document Processing Queue and Processor

Create `src/workers/queues/document-processing.queue.ts`:

```typescript
import { Queue } from 'bullmq';
import { redisConnection } from '../index';

/**
 * Document Processing Queue
 *
 * Handles asynchronous document OCR and data extraction
 */
export const documentProcessingQueue = new Queue('document-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Add document processing job
 */
export async function addJob(
  name: string,
  data: {
    documentId: string;
    orgId: string;
    documentType?: string; // invoice, receipt, form, generic
  }
) {
  return await documentProcessingQueue.add(name, data, {
    jobId: `doc-${data.documentId}`,
  });
}
```

Create `src/workers/processors/ocr.processor.ts`:

```typescript
import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { spacesService } from '@/lib/services/spaces.service';
import { ocrService } from '@/lib/services/ocr.service';
import { dataExtractionService } from '@/lib/services/data-extraction.service';
import { DocumentStatus } from '@prisma/client';
import { requiresOCR, isImage } from '@/lib/utils/file-validation';

/**
 * Document OCR Processor
 *
 * Extracts text and structured data from documents
 */
export async function processDocumentOCR(job: Job) {
  const { documentId, orgId, documentType } = job.data;

  try {
    // Update status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: DocumentStatus.PROCESSING },
    });

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Download file from Spaces
    await job.updateProgress(10);
    const fileBuffer = await spacesService.downloadFile(document.filePath);

    // Extract text via OCR
    await job.updateProgress(30);
    let ocrText = '';
    let ocrConfidence = 0;

    if (requiresOCR(document.mimeType)) {
      const ocrResult = await ocrService.extractText(fileBuffer, document.mimeType);
      ocrText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;
    }

    // Extract structured data with GPT-4 Vision (images only)
    await job.updateProgress(60);
    let extractedData: any = null;

    if (isImage(document.mimeType) && ocrText.length > 50) {
      try {
        const extractionResult = await dataExtractionService.extractStructuredData(
          fileBuffer,
          documentType || 'generic'
        );
        extractedData = extractionResult.data;
      } catch (error) {
        console.error('Data extraction failed:', error);
        // Continue without structured data
      }
    }

    // Update document with results
    await job.updateProgress(90);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.COMPLETED,
        ocrText,
        ocrConfidence,
        extractedData,
        processedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        orgId,
        action: 'PROCESS',
        entity: 'DOCUMENT',
        entityId: documentId,
        metadata: {
          ocrConfidence,
          textLength: ocrText.length,
          hasStructuredData: !!extractedData,
        },
      },
    });

    await job.updateProgress(100);

    return {
      success: true,
      documentId,
      ocrTextLength: ocrText.length,
      confidence: ocrConfidence,
    };
  } catch (error) {
    console.error('Document processing error:', error);

    // Update document status to FAILED
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.FAILED,
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}
```

Update `src/workers/index.ts` to include document processor:

```typescript
import { Worker } from 'bullmq';
import { createClient } from 'redis';
import { processIntakeRouting } from './processors/intake-routing.processor';
import { processEmailSending } from './processors/email-sending.processor';
import { processDocumentOCR } from './processors/ocr.processor';  // NEW

// Redis connection
export const redisConnection = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
});

redisConnection.on('error', (err) => console.error('Redis connection error:', err));
redisConnection.on('connect', () => console.log('Redis connected'));

async function startWorkers() {
  await redisConnection.connect();

  // Intake routing worker (Phase 3)
  const intakeWorker = new Worker('intake-routing', processIntakeRouting, {
    connection: redisConnection,
    concurrency: 5,
  });

  // Email sending worker (Phase 3)
  const emailWorker = new Worker('email-sending', processEmailSending, {
    connection: redisConnection,
    concurrency: 10,
  });

  // Document processing worker (Phase 4 - NEW)
  const documentWorker = new Worker('document-processing', processDocumentOCR, {
    connection: redisConnection,
    concurrency: 3, // Lower concurrency due to CPU-intensive OCR
  });

  console.log('Workers started: intake-routing, email-sending, document-processing');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await intakeWorker.close();
    await emailWorker.close();
    await documentWorker.close();
    await redisConnection.quit();
  });
}

startWorkers().catch(console.error);
```

### Step 10: Create File Upload API Endpoint

Create `src/app/api/documents/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { documentService } from '@/lib/services/document.service';

/**
 * File upload endpoint
 *
 * Accepts multipart/form-data with file upload
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { user } = session;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload and process document
    const document = await documentService.uploadDocument(
      buffer,
      file.name,
      file.type,
      user.id,
      user.orgId
    );

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        status: document.status,
        cdnUrl: document.cdnUrl,
        thumbnailUrl: document.thumbnailUrl,
        createdAt: document.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);

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

// Configure max file size (50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};
```

Create `src/app/api/documents/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { documentService } from '@/lib/services/document.service';
import { DocumentStatus } from '@prisma/client';

/**
 * List documents
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as DocumentStatus | null;
    const mimeType = searchParams.get('mimeType');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await documentService.listDocuments(session.user.orgId, {
      status: status || undefined,
      mimeType: mimeType || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/documents/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { documentService } from '@/lib/services/document.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get document by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await documentService.getDocument(id, session.user.orgId);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Get document error:', error);

    if (error instanceof Error && error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete document
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await documentService.deleteDocument(id, session.user.orgId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);

    if (error instanceof Error && error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/documents/[id]/download/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { documentService } from '@/lib/services/document.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Download document file
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { buffer, fileName, mimeType } = await documentService.downloadDocument(
      id,
      session.user.orgId
    );

    // Return file as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download document error:', error);

    if (error instanceof Error && error.message === 'Document not found') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 11: Create Document Hook

Create `src/hooks/useDocuments.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { DocumentStatus } from '@prisma/client';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  cdnUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  ocrText: string | null;
  ocrConfidence: number | null;
  extractedData: any;
  metadata: any;
  uploadedBy: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  processingError: string | null;
}

export function useDocuments(filters?: {
  status?: DocumentStatus;
  mimeType?: string;
  limit?: number;
  offset?: number;
}) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const queryParams = new URLSearchParams({
    ...(filters?.status && { status: filters.status }),
    ...(filters?.mimeType && { mimeType: filters.mimeType }),
    ...(filters?.limit && { limit: filters.limit.toString() }),
    ...(filters?.offset && { offset: filters.offset.toString() }),
  });

  return useQuery({
    queryKey: ['documents', orgId, filters],
    queryFn: async () => {
      const response = await fetch(`/api/documents?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch documents');

      return response.json() as Promise<{
        documents: Document[];
        total: number;
      }>;
    },
    enabled: !!orgId,
    staleTime: 10000, // 10 seconds
  });
}

export function useDocument(documentId: string) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');

      const data = await response.json();
      return data.document as Document;
    },
    enabled: !!documentId && !!orgId,
    refetchInterval: (data) => {
      // Refetch every 5s if document is still processing
      return data?.status === 'PROCESSING' ? 5000 : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate documents list to show new upload
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate documents list
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
```

### Step 12: Create Document Uploader Component

Create `src/components/dashboard/DocumentUploader.tsx`:

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadDocument } from '@/hooks/useDocuments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadingFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function DocumentUploader() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const uploadMutation = useUploadDocument();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Add files to uploading state
    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially
    for (const uploadingFile of newFiles) {
      try {
        await uploadMutation.mutateAsync(uploadingFile.file);

        // Mark as success
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === uploadingFile.file
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );

        // Remove from list after 2 seconds
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
        }, 2000);
      } catch (error) {
        // Mark as error
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === uploadingFile.file
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        );
      }
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.tiff'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card variant="default">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-astralis-blue bg-astralis-blue/5'
                : 'border-slate-300 hover:border-astralis-blue hover:bg-slate-50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-astralis-blue font-medium">
                Drop files here...
              </p>
            ) : (
              <>
                <p className="text-lg text-slate-700 font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-slate-500">
                  Supports: Images, PDFs, Word docs (max 50MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <Card variant="default">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-astralis-navy mb-3">
              Uploading {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-2">
              {uploadingFiles.map((uploadingFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {uploadingFile.status === 'uploading' && (
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-astralis-blue rounded-full animate-pulse" />
                    </div>
                  )}

                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}

                  {uploadingFile.status === 'error' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <button
                        onClick={() => removeFile(uploadingFile.file)}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Step 13: Create Document Queue Page

Create `src/app/(app)/documents/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentUploader } from '@/components/dashboard/DocumentUploader';
import { DocumentQueue } from '@/components/dashboard/DocumentQueue';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Upload } from 'lucide-react';
import { DocumentStatus } from '@prisma/client';

export default function DocumentsPage() {
  const [showUploader, setShowUploader] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | undefined>();

  const { data, isLoading, error } = useDocuments({
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Documents</h1>
          <p className="text-slate-600 mt-1">
            Upload and process documents with OCR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setStatusFilter(undefined)}
          >
            <Filter className="w-4 h-4" />
            All
          </Button>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => setShowUploader(!showUploader)}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      {showUploader && (
        <DocumentUploader />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          Failed to load documents
        </div>
      ) : (
        <DocumentQueue documents={data?.documents || []} />
      )}
    </div>
  );
}
```

Create `src/components/dashboard/DocumentQueue.tsx`:

```typescript
'use client';

import { format } from 'date-fns';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteDocument } from '@/hooks/useDocuments';
import Link from 'next/link';

interface Document {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  ocrConfidence: number | null;
  createdAt: string;
  processedAt: string | null;
}

interface DocumentQueueProps {
  documents: Document[];
}

const statusColors = {
  PENDING: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export function DocumentQueue({ documents }: DocumentQueueProps) {
  const deleteMutation = useDeleteDocument();

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteMutation.mutateAsync(documentId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  const handleDownload = (documentId: string) => {
    window.open(`/api/documents/${documentId}/download`, '_blank');
  };

  return (
    <Card variant="default">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                OCR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Uploaded
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-astralis-navy truncate max-w-xs">
                      {doc.originalName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {doc.mimeType.split('/')[1]?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={
                      statusColors[doc.status as keyof typeof statusColors] ||
                      statusColors.PENDING
                    }
                  >
                    {doc.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {doc.ocrConfidence !== null ? (
                    <span className="text-sm text-slate-600">
                      {Math.round(doc.ocrConfidence * 100)}%
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/astralisops/documents/${doc.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDownload(doc.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {documents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No documents found. Upload your first document to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

---

## Testing Checklist

### Manual Testing Steps

**1. DigitalOcean Spaces Setup**:
- [ ] Spaces bucket created in DigitalOcean
- [ ] CDN enabled on bucket
- [ ] CORS policy configured correctly
- [ ] Access keys generated and saved
- [ ] Environment variables set in `.env.local`

**2. File Upload**:
- [ ] Navigate to `/astralisops/documents`
- [ ] Click "Upload" button
- [ ] Drag and drop image file
- [ ] Verify file upload progress shows
- [ ] Check success notification appears
- [ ] Verify document appears in queue immediately with "PENDING" status

**3. File Validation**:
- [ ] Try uploading file > 50MB (should fail)
- [ ] Try uploading unsupported file type (should fail)
- [ ] Try uploading file with spoofed MIME type (should fail)
- [ ] Verify error messages are clear

**4. OCR Processing**:
- [ ] Upload image with text (e.g., screenshot, scanned document)
- [ ] Verify status changes to "PROCESSING"
- [ ] Wait for processing (check worker logs)
- [ ] Verify status changes to "COMPLETED"
- [ ] Check OCR confidence score appears
- [ ] Click document to view details
- [ ] Verify extracted text is accurate

**5. PDF Processing**:
- [ ] Upload PDF with native text
- [ ] Verify text extracted without OCR
- [ ] Verify 100% confidence score
- [ ] Upload scanned PDF (image-based)
- [ ] Verify OCR processing triggers
- [ ] Check extracted text accuracy

**6. GPT-4 Vision Extraction**:
- [ ] Upload invoice image
- [ ] Wait for processing
- [ ] View document details
- [ ] Verify structured data extracted (invoice number, total, etc.)
- [ ] Check extracted data matches invoice

**7. Document Queue**:
- [ ] Verify all uploaded documents appear in list
- [ ] Check status badges show correct colors
- [ ] Verify file size displays correctly
- [ ] Check upload dates format correctly
- [ ] Filter by status (PENDING, PROCESSING, COMPLETED)

**8. Document Viewer**:
- [ ] Click document in queue
- [ ] Verify image/PDF displays
- [ ] Check OCR text overlay works
- [ ] Verify extracted data displays in structured format
- [ ] Test download button
- [ ] Test delete button

**9. CDN Functionality**:
- [ ] Upload file
- [ ] Copy CDN URL from database
- [ ] Open CDN URL in browser
- [ ] Verify file loads quickly
- [ ] Check browser DevTools: verify CDN headers (`Cache-Control`, `X-Cache`)

**10. Error Handling**:
- [ ] Disconnect from internet and try upload
- [ ] Verify error message displays
- [ ] Stop worker container and upload file
- [ ] Verify status stuck on "PENDING"
- [ ] Restart worker
- [ ] Verify processing resumes

**11. Background Worker**:
- [ ] Check worker logs: `docker logs astralis-worker`
- [ ] Verify jobs being processed
- [ ] Check Redis queue: `redis-cli KEYS document-processing:*`
- [ ] Verify job count matches uploads

### Database Verification

```sql
-- Check documents created
SELECT * FROM "Document" WHERE "orgId" = '<your-org-id>' ORDER BY "createdAt" DESC;

-- Check document statuses
SELECT status, COUNT(*) FROM "Document" GROUP BY status;

-- Check OCR confidence scores
SELECT "originalName", "ocrConfidence", "status" FROM "Document" WHERE "ocrConfidence" IS NOT NULL;

-- Check extracted data
SELECT "originalName", "extractedData" FROM "Document" WHERE "extractedData" IS NOT NULL;

-- Check file sizes
SELECT AVG("fileSize") as avg_size, MAX("fileSize") as max_size FROM "Document";

-- Check activity logs
SELECT * FROM "ActivityLog" WHERE entity = 'DOCUMENT' ORDER BY "createdAt" DESC LIMIT 10;
```

### Spaces Verification

```bash
# Install s3cmd for testing (optional)
pip install s3cmd

# Configure s3cmd with Spaces credentials
s3cmd --configure

# List files in bucket
s3cmd ls s3://astralis-documents/

# Check file exists
s3cmd ls s3://astralis-documents/org-abc123/documents/

# Get file info
s3cmd info s3://astralis-documents/org-abc123/documents/file-name.pdf
```

---

## Handoff to Next Phase

### What's Complete

**Document Upload & Storage**:
- DigitalOcean Spaces integration with S3-compatible SDK
- File upload API endpoint with multipart/form-data handling
- File validation (type, size, MIME type verification)
- Thumbnail generation for images
- CDN URL generation for fast file access

**OCR Processing**:
- Tesseract.js integration for image text extraction
- PDF text extraction (native + OCR fallback)
- Image preprocessing for better OCR accuracy
- Confidence scoring for extracted text
- Background processing with BullMQ

**Data Extraction**:
- GPT-4 Vision integration for structured data extraction
- Invoice parsing with field validation
- Receipt parsing with itemization
- Generic document entity extraction
- Confidence calculation based on data completeness

**Document Management**:
- Document queue UI with status filtering
- Document viewer with OCR overlay
- File download functionality
- Document deletion with Spaces cleanup
- Activity logging for all document operations

**Background Processing**:
- Document processing queue (extends Phase 3 worker)
- OCR processor with retry logic
- Data extraction processor
- Status tracking (PENDING → PROCESSING → COMPLETED/FAILED)
- Error handling and recovery

### What's Next (Phase 5)

**Scheduling & Calendar Integration**:
- Google Calendar API integration
- OAuth flow for calendar connection
- Two-way calendar sync (read/write events)
- Conflict detection algorithm
- Scheduling UI with calendar view
- Availability configuration
- AI-powered time slot suggestions
- Automated email reminders (24h, 1h before)
- Worker queue: `scheduling-reminders`
- ICS generation enhancement
- Multi-participant scheduling

**Environment Variables to Add**:
```bash
GOOGLE_CALENDAR_CLIENT_ID="<calendar-client-id>"
GOOGLE_CALENDAR_CLIENT_SECRET="<calendar-secret>"
GOOGLE_CALENDAR_REDIRECT_URI="https://app.astralisone.com/api/calendar/callback"
```

### Docker State (No Changes)

**Current Containers**:
- `app`: Next.js application (includes Phase 1-4 features)
- `postgres`: PostgreSQL 16 database
- `redis`: Redis 7 for job queues and caching
- `worker`: Background job processor (intake routing, email, **document processing**)

### Environment Variables Added

```bash
# DigitalOcean Spaces
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="<spaces-secret-key-64-chars>"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# File upload limits
MAX_FILE_SIZE="52428800"
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

### Database State (No Schema Changes)

Using existing `Document` model with enhanced usage:
- `originalName`: User's original filename
- `fileName`: Sanitized stored filename
- `filePath`: Full Spaces path
- `cdnUrl`: CDN URL for access
- `thumbnailUrl`: Thumbnail CDN URL
- `ocrText`: Extracted text via OCR
- `ocrConfidence`: Confidence score (0-1)
- `extractedData`: Structured JSON from GPT-4 Vision
- `metadata`: File metadata (dimensions, etc.)
- `processingError`: Error message if failed

---

## Troubleshooting

### Issue: Spaces upload fails with "Access Denied"

**Solution**: Verify Spaces credentials and bucket permissions

```bash
# Test Spaces connection with curl
curl -X PUT \
  -H "Host: astralis-documents.nyc3.digitaloceanspaces.com" \
  -H "Date: $(date -u +%a,\ %d\ %b\ %Y\ %H:%M:%S\ GMT)" \
  -H "Authorization: AWS <ACCESS_KEY>:<SIGNATURE>" \
  --data-binary "@test.txt" \
  https://nyc3.digitaloceanspaces.com/astralis-documents/test.txt

# Or use AWS CLI with Spaces endpoint
aws s3 ls s3://astralis-documents/ \
  --endpoint-url=https://nyc3.digitaloceanspaces.com
```

### Issue: OCR produces garbled text

**Solution**: Image preprocessing may need adjustment

```typescript
// Try different preprocessing settings in ocr.service.ts
private async preprocessImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize({ width: 3000 }) // Higher resolution
    .greyscale()
    .normalize()
    .threshold(128) // Binary threshold
    .toBuffer();
}
```

### Issue: GPT-4 Vision extraction returns empty data

**Solution**: Check image quality and prompt

1. Verify image is high resolution (> 300 DPI)
2. Check OpenAI API key has Vision access
3. Review API response in logs
4. Try more specific prompt for document type

### Issue: File upload times out

**Solution**: Increase timeout or optimize file size

```typescript
// In next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
  // Increase timeout
  serverOptions: {
    requestTimeout: 300000, // 5 minutes
  },
};
```

### Issue: Thumbnails not generating

**Solution**: Check Sharp installation

```bash
# Rebuild Sharp for your platform
npm rebuild sharp

# Or reinstall
npm uninstall sharp
npm install sharp
```

### Issue: Worker not processing documents

**Solution**: Check worker logs and Redis connection

```bash
# Check worker is running
docker ps | grep worker

# View worker logs
docker logs -f astralis-worker

# Check Redis queue
docker exec -it astralis-redis redis-cli
KEYS document-processing:*
LLEN document-processing:wait

# Restart worker if needed
docker restart astralis-worker
```

---

**END OF PHASE 4 DOCUMENTATION**

This documentation is complete and self-contained. Any AI session can use this document to implement Phase 4 without requiring prior conversation context.
