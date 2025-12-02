# Phase 4 Deployment Guide: Document Processing & OCR

**Infrastructure Configuration for DigitalOcean Spaces and Worker Container**

This guide provides step-by-step instructions for configuring infrastructure needed for Phase 4 document processing capabilities. All steps require manual execution by the system administrator.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [DigitalOcean Spaces Configuration](#digitalocean-spaces-configuration)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Docker Container Updates](#docker-container-updates)
6. [CDN Configuration](#cdn-configuration)
7. [Security Configuration](#security-configuration)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 4 adds document processing capabilities to AstralisOps:

- **File Storage**: DigitalOcean Spaces (S3-compatible object storage)
- **CDN**: DigitalOcean Spaces CDN for fast global delivery
- **OCR Processing**: Tesseract.js in worker container
- **AI Extraction**: GPT-4 Vision for structured data parsing
- **Background Jobs**: Extends existing BullMQ worker from Phase 3

**Infrastructure Components**:
- DigitalOcean Spaces bucket with CDN enabled
- CORS configuration for browser uploads
- Access keys for S3-compatible API access
- Updated worker container with Tesseract dependencies

**No New Docker Containers**: Phase 4 extends the existing `worker` container from Phase 3.

---

## Prerequisites

Before starting, ensure:

- [ ] Phase 1 (Authentication & RBAC) is complete
- [ ] Phase 3 (AI Routing & Background Jobs) is complete
- [ ] Redis and worker containers are running
- [ ] DigitalOcean account with billing enabled
- [ ] Access to DigitalOcean Control Panel
- [ ] SSH access to production server (137.184.31.207)
- [ ] OpenAI API key with GPT-4 Vision access

**Estimated Cost**: DigitalOcean Spaces is $5/month for 250GB storage + $0.01/GB for CDN transfer

---

## DigitalOcean Spaces Configuration

### Step 1: Create Spaces Bucket

1. **Navigate to DigitalOcean Control Panel**:
   - Log in to https://cloud.digitalocean.com
   - Click **Manage** in left sidebar
   - Select **Spaces Object Storage**

2. **Create New Spaces Bucket**:
   - Click **Create Spaces Bucket** button

   **Bucket Configuration**:
   - **Choose a datacenter region**: `New York 3 (nyc3)`
     - Alternative regions: `sfo3` (San Francisco), `sgp1` (Singapore), `fra1` (Frankfurt)
     - Choose region closest to your users for best performance

   - **Choose a unique name**: `astralis-documents`
     - Must be globally unique across all DigitalOcean Spaces
     - Use lowercase, numbers, hyphens only (no underscores)
     - Alternative: `astralis-prod-docs`, `astralisone-files`

   - **Enable CDN**: Check **Enable CDN** checkbox
     - Enables global content delivery network
     - Provides faster access worldwide
     - Generates CDN endpoint: `https://astralis-documents.nyc3.cdn.digitaloceanspaces.com`

   - **File Listing**: Select **Restrict File Listing** (Private)
     - Prevents public directory browsing
     - Files only accessible with signed URLs or public ACL

   - **Project**: Select your DigitalOcean project (optional)

3. **Create Bucket**:
   - Click **Create Spaces Bucket** button
   - Wait for bucket creation (usually instant)

**Result**: Bucket created with endpoints:
- **Origin Endpoint**: `https://astralis-documents.nyc3.digitaloceanspaces.com`
- **Edge Endpoint (CDN)**: `https://astralis-documents.nyc3.cdn.digitaloceanspaces.com`

### Step 2: Configure CORS Policy

CORS (Cross-Origin Resource Sharing) allows browser uploads from your Next.js application.

1. **Navigate to Bucket Settings**:
   - Click on your newly created `astralis-documents` bucket
   - Click **Settings** tab at the top

2. **Add CORS Configuration**:
   - Scroll to **CORS Configurations** section
   - Click **Add** button

3. **CORS Policy JSON**:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3001",
         "https://app.astralisone.com",
         "https://astralisone.com"
       ],
       "AllowedMethods": [
         "GET",
         "PUT",
         "POST",
         "DELETE",
         "HEAD"
       ],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

4. **CORS Configuration Explanation**:
   - **AllowedOrigins**: Domains allowed to upload files
     - `http://localhost:3001`: Local development
     - `https://app.astralisone.com`: Production app subdomain
     - `https://astralisone.com`: Production main domain
     - Add staging URLs as needed: `https://staging.astralisone.com`

   - **AllowedMethods**: HTTP methods permitted
     - `GET`: Download files, view documents
     - `PUT`: Upload files via multipart upload
     - `POST`: Alternative upload method
     - `DELETE`: Remove files (admin only)
     - `HEAD`: Check file existence without downloading

   - **AllowedHeaders**: `["*"]` allows all request headers
     - Includes Content-Type, Authorization, etc.

   - **MaxAgeSeconds**: `3000` (50 minutes) for preflight cache
     - Browser caches CORS preflight responses

5. **Save CORS Configuration**:
   - Click **Save** button
   - Verify configuration appears in CORS list

**Security Note**: For production, limit AllowedOrigins to only your production domains. Remove localhost entries.

### Step 3: Generate API Access Keys

1. **Navigate to API Settings**:
   - In DigitalOcean Control Panel left sidebar
   - Click **API** under Account menu

2. **Generate Spaces Keys**:
   - Click **Spaces Keys** tab
   - Click **Generate New Key** button

3. **Key Configuration**:
   - **Name**: `astralis-production-spaces` (descriptive name for tracking)
   - Alternative names: `astralis-worker-key`, `astralis-app-key`
   - No other options needed

4. **Copy Credentials IMMEDIATELY**:

   After clicking **Generate**, you'll see:

   - **Access Key**: `DO00ABCDEFGHIJKLMNOP` (20 characters, alphanumeric)
   - **Secret Key**: `a1b2c3d4e5f6...` (64 characters, base64-encoded)

   **CRITICAL**: The Secret Key is only shown ONCE. Copy it immediately.

   - Save to password manager
   - Or save to temporary secure file
   - Cannot retrieve later (must regenerate if lost)

5. **Document Credentials**:

   Save these values for environment variable configuration:

   ```bash
   SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
   SPACES_SECRET_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
   ```

### Step 4: Note CDN Endpoint

1. **Find CDN URL**:
   - Return to Spaces bucket overview page
   - Look for **Edge Endpoint** or **CDN Endpoint**
   - Format: `https://{bucket-name}.{region}.cdn.digitaloceanspaces.com`

2. **Record CDN URL**:

   For `astralis-documents` bucket in `nyc3`:

   ```bash
   SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"
   ```

3. **Optional: Custom Domain**:

   To use custom domain like `https://cdn.astralisone.com`:

   - In Spaces bucket Settings, scroll to **Custom Domain**
   - Click **Add Domain**
   - Enter: `cdn.astralisone.com`
   - Add CNAME DNS record pointing to Edge endpoint
   - Wait for DNS propagation (5-60 minutes)
   - Use custom domain in `SPACES_CDN_URL`

---

## Environment Variables Setup

### Development Environment Variables

Update `/Users/gregorystarr/projects/astralis-nextjs/.env.local` (local development):

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
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# ===== REDIS (Phase 3) =====
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your-redis-password-min-32-chars"

# ===== OPENAI (Phase 3 + Phase 4) =====
OPENAI_API_KEY="sk-proj-your-openai-api-key"
OPENAI_ORG_ID="org-your-openai-org-id"  # Optional

# ===== DIGITALOCEAN SPACES (Phase 4 - NEW) =====

# Spaces API Credentials (from Step 3 above)
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

# Spaces Configuration
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"  # No https://, just hostname
SPACES_REGION="nyc3"  # Must match endpoint region
SPACES_BUCKET="astralis-documents"  # Your bucket name from Step 1

# CDN Configuration (from Step 4 above)
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"
# Or custom domain: "https://cdn.astralisone.com"

# Document Processing Configuration
OCR_LANGUAGE="eng"  # Tesseract language code: eng, spa, fra, deu, etc.
VISION_MODEL="gpt-4-vision-preview"  # OpenAI vision model

# File Upload Limits
MAX_FILE_SIZE="52428800"  # 50MB in bytes (50 * 1024 * 1024)
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

# ===== API =====
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# ===== ANALYTICS (existing) =====
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"
```

### Production Environment Variables

Update production `.env` file on server at `/home/deploy/astralis-nextjs/.env`:

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://astralis_user:SECURE_PASSWORD@localhost:5432/astralis_production"

# ===== NEXTAUTH.JS (Phase 1) =====
NEXTAUTH_SECRET="production-secret-min-64-chars-super-secure-random-string-here"
NEXTAUTH_URL="https://app.astralisone.com"

# ===== GOOGLE OAUTH (Phase 1) =====
GOOGLE_CLIENT_ID="production-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="production-client-secret"

# ===== EMAIL (Phase 1) =====
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-sendgrid-api-key"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="noreply@astralisone.com"

# ===== REDIS (Phase 3) =====
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="production-redis-password-super-secure-64-chars"

# ===== OPENAI (Phase 3 + Phase 4) =====
OPENAI_API_KEY="sk-proj-production-key"
OPENAI_ORG_ID="org-production-id"

# ===== DIGITALOCEAN SPACES (Phase 4 - NEW) =====

# Production Spaces Credentials
SPACES_ACCESS_KEY="DO00PRODUCTION_ACCESS_KEY"
SPACES_SECRET_KEY="production-secret-key-64-chars-long"

# Production Spaces Configuration
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"

# Production CDN (with custom domain recommended)
SPACES_CDN_URL="https://cdn.astralisone.com"
# Or: "https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# Document Processing Configuration
OCR_LANGUAGE="eng"
VISION_MODEL="gpt-4-vision-preview"

# Production File Upload Limits
MAX_FILE_SIZE="104857600"  # 100MB for production (100 * 1024 * 1024)
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

# ===== API =====
NEXT_PUBLIC_API_BASE_URL="https://app.astralisone.com"

# ===== ANALYTICS =====
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-PRODUCTION_ID"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-PRODUCTION_ID"
```

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPACES_ACCESS_KEY` | Yes | - | DigitalOcean Spaces access key (20 chars) |
| `SPACES_SECRET_KEY` | Yes | - | DigitalOcean Spaces secret key (64 chars) |
| `SPACES_ENDPOINT` | Yes | `nyc3.digitaloceanspaces.com` | Spaces API endpoint hostname |
| `SPACES_REGION` | Yes | `nyc3` | Spaces region code (must match endpoint) |
| `SPACES_BUCKET` | Yes | `astralis-documents` | Bucket name for file storage |
| `SPACES_CDN_URL` | Yes | - | Full CDN URL for fast delivery |
| `OCR_LANGUAGE` | No | `eng` | Tesseract language code |
| `VISION_MODEL` | No | `gpt-4-vision-preview` | OpenAI vision model identifier |
| `MAX_FILE_SIZE` | No | `52428800` | Max upload size in bytes (50MB) |
| `ALLOWED_FILE_TYPES` | No | See above | Comma-separated MIME types |

### Generate Secure Secrets

Use these commands to generate secure random values:

```bash
# Generate NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 48

# Generate REDIS_PASSWORD (32+ characters)
openssl rand -base64 32

# Generate strong password (for any purpose)
openssl rand -base64 64
```

### Update .env.local.template

Update the template file for team members:

```bash
# Add to /Users/gregorystarr/projects/astralis-nextjs/.env.local.template

# ===== DIGITALOCEAN SPACES (Phase 4) =====
# Create Spaces bucket: https://cloud.digitalocean.com/spaces
# Generate access keys: API → Spaces Keys → Generate New Key
SPACES_ACCESS_KEY="your-spaces-access-key-here"
SPACES_SECRET_KEY="your-spaces-secret-key-here"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# Document Processing
OCR_LANGUAGE="eng"
VISION_MODEL="gpt-4-vision-preview"
MAX_FILE_SIZE="52428800"
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

---

## Docker Container Updates

Phase 4 extends the existing `worker` container from Phase 3 with Tesseract OCR dependencies. No new containers are added.

### Current docker-compose.yml (Phase 3)

Your existing `docker-compose.yml` should look like this (from Phase 3):

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: astralis-app
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - postgres
      - redis
    networks:
      - astralis-network
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile
      target: worker
    container_name: astralis-worker
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - astralis-network
    restart: unless-stopped

  postgres:
    image: postgres:16
    container_name: astralis-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - astralis-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: astralis-redis
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - astralis-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres-data:
  redis-data:

networks:
  astralis-network:
    driver: bridge
```

### Updated docker-compose.yml (Phase 4)

Add Spaces environment variables to both `app` and `worker` services:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: astralis-app
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      # Phase 4: Add Spaces configuration
      - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
      - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
      - SPACES_ENDPOINT=${SPACES_ENDPOINT}
      - SPACES_REGION=${SPACES_REGION}
      - SPACES_BUCKET=${SPACES_BUCKET}
      - SPACES_CDN_URL=${SPACES_CDN_URL}
      - MAX_FILE_SIZE=${MAX_FILE_SIZE}
      - ALLOWED_FILE_TYPES=${ALLOWED_FILE_TYPES}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - postgres
      - redis
    networks:
      - astralis-network
    restart: unless-stopped

  worker:
    build:
      context: .
      dockerfile: Dockerfile
      target: worker
    container_name: astralis-worker
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      # Phase 4: Add Spaces and OCR configuration
      - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
      - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
      - SPACES_ENDPOINT=${SPACES_ENDPOINT}
      - SPACES_REGION=${SPACES_REGION}
      - SPACES_BUCKET=${SPACES_BUCKET}
      - SPACES_CDN_URL=${SPACES_CDN_URL}
      - OCR_LANGUAGE=${OCR_LANGUAGE:-eng}
      - VISION_MODEL=${VISION_MODEL:-gpt-4-vision-preview}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - astralis-network
    restart: unless-stopped

  postgres:
    image: postgres:16
    container_name: astralis-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - astralis-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: astralis-redis
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - astralis-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres-data:
  redis-data:

networks:
  astralis-network:
    driver: bridge
```

### Dockerfile Updates (Worker Target)

The worker Dockerfile target needs Tesseract OCR libraries. Your existing Dockerfile should have a `worker` target from Phase 3.

**Update the `worker` target** in your `Dockerfile`:

```dockerfile
# =============================================================================
# Worker Target (Phase 3 + Phase 4)
# Runs background jobs: intake routing, email sending, document OCR
# =============================================================================
FROM node:20-alpine AS worker

WORKDIR /app

# Phase 4: Install Tesseract OCR dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-spa \
    tesseract-ocr-data-fra \
    tesseract-ocr-data-deu \
    poppler-utils \
    imagemagick

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including Tesseract.js)
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build TypeScript (if needed for worker)
RUN npm run build:worker || echo "No worker build script"

# Set environment
ENV NODE_ENV=production

# Start worker
CMD ["node", "src/workers/index.ts"]
```

**Tesseract Language Pack Installation**:

The Dockerfile installs these Tesseract language packs by default:
- `eng`: English
- `spa`: Spanish
- `fra`: French
- `deu`: German

To add more languages, update the Dockerfile:

```dockerfile
# Add more languages as needed
RUN apk add --no-cache \
    tesseract-ocr-data-ita \  # Italian
    tesseract-ocr-data-por \  # Portuguese
    tesseract-ocr-data-jpn \  # Japanese
    tesseract-ocr-data-chi-sim  # Chinese Simplified
```

See full language list: https://pkgs.alpinelinux.org/packages?name=tesseract-ocr-data-*

### Rebuild Worker Container

After updating Dockerfile and docker-compose.yml:

```bash
# Stop existing containers
docker-compose down

# Rebuild worker with Tesseract dependencies
docker-compose build worker

# Start all services
docker-compose up -d

# Verify worker has Tesseract
docker exec astralis-worker tesseract --version

# Expected output:
# tesseract 5.x.x
#  leptonica-1.x.x
#  libjpeg 9e : libpng 1.6.x : libtiff 4.x.x : zlib 1.2.x
```

### Production Deployment

SSH to production server and update containers:

```bash
# SSH to production server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Navigate to project directory
cd /home/deploy/astralis-nextjs

# Pull latest code (including Dockerfile updates)
git pull origin main

# Update .env with Spaces credentials
nano .env
# Add SPACES_* variables from "Environment Variables Setup" section

# Rebuild and restart worker
docker-compose build worker
docker-compose up -d worker

# Verify worker is running
docker ps | grep worker
docker logs astralis-worker --tail 50

# Test Tesseract installation
docker exec astralis-worker tesseract --version
```

---

## CDN Configuration

DigitalOcean Spaces CDN provides fast global content delivery with edge caching.

### CDN Features

**Automatic Features** (enabled when CDN is turned on):
- Global edge network (multiple POPs worldwide)
- Automatic SSL/TLS certificates
- HTTP/2 support
- Gzip compression for text files
- 1-hour default cache TTL

**Manual Configuration Needed**:
- Custom caching headers
- Cache invalidation strategy
- Signed URLs for private documents

### Caching Headers Strategy

Configure caching headers in your `spaces.service.ts` when uploading files:

```typescript
// Public documents (blog images, public PDFs)
const publicCacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
  'Content-Type': mimeType,
};

// Private documents (user uploads, invoices)
const privateCacheHeaders = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Content-Type': mimeType,
};

// Semi-private (authenticated users, short cache)
const semiPrivateCacheHeaders = {
  'Cache-Control': 'private, max-age=3600', // 1 hour
  'Content-Type': mimeType,
};
```

**Implementation in PutObjectCommand**:

```typescript
const command = new PutObjectCommand({
  Bucket: this.bucket,
  Key: filePath,
  Body: fileBuffer,
  ContentType: mimeType,
  ACL: 'private', // or 'public-read' for public files
  CacheControl: 'private, max-age=3600', // Customize per file type
  Metadata: {
    'uploaded-by': userId,
    'org-id': orgId,
    'original-name': originalName,
  },
});
```

### Cache Duration Guidelines

| File Type | Visibility | Cache-Control | TTL | Rationale |
|-----------|-----------|---------------|-----|-----------|
| User documents | Private | `private, no-cache` | 0 | Always fresh, use signed URLs |
| Thumbnails | Private | `private, max-age=3600` | 1 hour | Can cache briefly |
| Public images | Public | `public, max-age=31536000, immutable` | 1 year | Static assets |
| OCR results | Private | `private, max-age=1800` | 30 min | Semi-static data |
| Document previews | Private | `private, max-age=3600` | 1 hour | Balance freshness/performance |

### Cache Invalidation Strategy

**Purge CDN Cache** when files are updated or deleted:

```typescript
// Method 1: Update file with new filename (recommended)
// Generates new filename with timestamp, automatically bypasses cache
const newFilename = `document-${Date.now()}-${randomId}.pdf`;

// Method 2: DigitalOcean Spaces CDN Purge (manual)
// Currently requires API call or manual purge in control panel
// Navigate to: Spaces → Your Bucket → Settings → CDN → Purge Cache

// Method 3: Cache busting query parameters
const cdnUrl = `https://cdn.astralisone.com/file.pdf?v=${timestamp}`;
```

**Best Practice**: Use unique filenames (with timestamps/hashes) so cache invalidation is automatic.

### Signed URLs for Private Documents

Use signed URLs to provide temporary access to private documents without making them public.

**Implementation example**:

```typescript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

async generateSignedUrl(
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: this.bucket,
    Key: filePath,
  });

  // Generate signed URL (valid for specified duration)
  const signedUrl = await getSignedUrl(this.client, command, {
    expiresIn, // Seconds until expiration
  });

  return signedUrl;
}
```

**Usage scenarios**:
- Document viewer: 1-hour signed URL
- Email attachments: 24-hour signed URL
- Temporary shares: Custom expiration (1-7 days)
- Download links: 15-minute signed URL

**Security notes**:
- Signed URLs expire automatically
- No CDN caching for signed URLs (query parameters bypass cache)
- URLs include signature in query string, keep confidential
- Regenerate for extended access (don't extend existing URLs)

### CDN Performance Optimization

**Headers to set**:

```typescript
// Optimal headers for document uploads
const headers = {
  'Cache-Control': 'private, max-age=3600',
  'Content-Type': mimeType,
  'Content-Disposition': `inline; filename="${sanitizedFilename}"`, // View in browser
  // Or: 'attachment; filename="..."' to force download
  'X-Content-Type-Options': 'nosniff', // Security
  'X-Frame-Options': 'DENY', // Prevent embedding
};
```

**Compression**:
- DigitalOcean CDN automatically gzips text files (HTML, CSS, JS, JSON, SVG)
- Binary files (PDF, images) are not compressed (already compressed)
- No additional configuration needed

**Regional Performance**:
- CDN automatically routes to nearest edge location
- Monitor performance: Use DigitalOcean Monitoring or external tools
- Consider multiple regional buckets for global apps (e.g., `nyc3` + `sgp1`)

---

## Security Configuration

### Bucket Access Control

**Default Configuration** (set during bucket creation):
- **File Listing**: Restricted (private)
- **Default ACL**: Private (files not publicly accessible)
- **Access Method**: S3 API with access keys + signed URLs

**Public Files** (if needed for marketing assets):

```typescript
// Upload with public-read ACL
const command = new PutObjectCommand({
  Bucket: this.bucket,
  Key: 'public/marketing/logo.png',
  Body: fileBuffer,
  ContentType: 'image/png',
  ACL: 'public-read', // Makes file publicly accessible
  CacheControl: 'public, max-age=31536000, immutable',
});
```

**Security Best Practices**:
1. Never set bucket to public by default
2. Use `private` ACL for user documents
3. Use `public-read` only for marketing/static assets
4. Organize files: `public/` folder for public, `org-{id}/` for private

### Access Key Security

**Key Management**:
- Generate separate keys for development vs production
- Rotate keys every 90 days
- Never commit keys to git (use `.env` files)
- Store keys in password manager or secrets manager

**Key Rotation Process**:

```bash
# 1. Generate new key in DigitalOcean Control Panel
# API → Spaces Keys → Generate New Key

# 2. Update environment variables with new key
SPACES_ACCESS_KEY="new-key"
SPACES_SECRET_KEY="new-secret"

# 3. Restart application
docker-compose restart app worker

# 4. Verify uploads work with new key
# Test document upload in application

# 5. Delete old key in DigitalOcean Control Panel
# API → Spaces Keys → [Old Key] → Delete
```

**Production Key Restrictions**:
- Create dedicated key for production (don't reuse dev keys)
- Name keys descriptively: `astralis-prod-app`, `astralis-staging`
- Monitor key usage in DigitalOcean API usage dashboard

### File Upload Validation

**Server-Side Validation** (required):

```typescript
// Validate file size
if (fileSize > MAX_FILE_SIZE) {
  throw new Error(`File too large: ${fileSize} bytes (max: ${MAX_FILE_SIZE})`);
}

// Validate MIME type
const allowedTypes = ALLOWED_FILE_TYPES.split(',');
if (!allowedTypes.some(type => mimeType.match(new RegExp(type)))) {
  throw new Error(`Invalid file type: ${mimeType}`);
}

// Validate file extension matches MIME type
const ext = filename.split('.').pop()?.toLowerCase();
const mimeToExt: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  // ... more mappings
};
```

**Anti-Virus Scanning** (recommended for production):

Consider integrating ClamAV or VirusTotal API:

```typescript
// Pseudo-code for virus scanning
async function scanFile(fileBuffer: Buffer): Promise<boolean> {
  // Option 1: ClamAV (self-hosted)
  const clamav = require('clamscan');
  const result = await clamav.scanBuffer(fileBuffer);
  return result.isInfected;

  // Option 2: VirusTotal API (cloud)
  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    body: fileBuffer,
    headers: { 'x-apikey': VIRUSTOTAL_API_KEY },
  });
  return response.json().data.attributes.stats.malicious > 0;
}
```

### Content Security

**Prevent Path Traversal**:

```typescript
import sanitizeFilename from 'sanitize-filename';

// Always sanitize user-provided filenames
const safeName = sanitizeFilename(originalName);

// Prevent directory traversal
const filePath = `org-${orgId}/documents/${safeName}`;
// ✅ Result: org-abc123/documents/invoice.pdf
// ❌ Blocks: ../../../etc/passwd
```

**Prevent MIME Type Spoofing**:

```typescript
// Use magic-bytes detection (file-type package)
import { fileTypeFromBuffer } from 'file-type';

const detectedType = await fileTypeFromBuffer(fileBuffer);
if (detectedType.mime !== providedMimeType) {
  throw new Error('MIME type mismatch');
}
```

### Network Security

**Firewall Rules** (DigitalOcean Droplet):
- Allow outbound HTTPS to DigitalOcean Spaces endpoints
- Block direct Spaces access from internet (use application proxy)
- Rate limit file uploads (use NGINX or application middleware)

**HTTPS Enforcement**:
- Always use HTTPS endpoints for Spaces API
- CDN automatically provides HTTPS (Let's Encrypt certificates)
- Reject HTTP uploads in production

---

## Verification Steps

### Step 1: Verify Spaces Bucket Configuration

```bash
# Test Spaces bucket accessibility using AWS CLI (S3 compatible)
# Install AWS CLI: brew install awscli (macOS) or apt install awscli (Linux)

# Configure AWS CLI with Spaces credentials
aws configure set aws_access_key_id "DO00ABCDEFGHIJKLMNOP"
aws configure set aws_secret_access_key "your-secret-key"

# Test bucket listing
aws s3 ls s3://astralis-documents \
  --endpoint-url https://nyc3.digitaloceanspaces.com

# Expected output: (empty or list of folders)
# PRE org-abc123/
# PRE public/

# Test file upload
echo "test file" > test.txt
aws s3 cp test.txt s3://astralis-documents/test/test.txt \
  --endpoint-url https://nyc3.digitaloceanspaces.com \
  --acl private

# Expected output:
# upload: ./test.txt to s3://astralis-documents/test/test.txt

# Verify CDN access (should return 403 for private file)
curl -I https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/test/test.txt

# Expected output:
# HTTP/2 403 Forbidden (private file, correct)

# Clean up test file
aws s3 rm s3://astralis-documents/test/test.txt \
  --endpoint-url https://nyc3.digitaloceanspaces.com
rm test.txt
```

### Step 2: Verify Environment Variables

```bash
# In project directory
cd /Users/gregorystarr/projects/astralis-nextjs

# Check .env.local exists and has Spaces variables
grep "SPACES_" .env.local

# Expected output:
# SPACES_ACCESS_KEY="DO00..."
# SPACES_SECRET_KEY="..."
# SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
# SPACES_REGION="nyc3"
# SPACES_BUCKET="astralis-documents"
# SPACES_CDN_URL="https://..."

# Verify no accidental whitespace or quotes
cat -A .env.local | grep SPACES

# Should NOT see: SPACES_ACCESS_KEY=" DO00..." (space after quote)
# Should see: SPACES_ACCESS_KEY="DO00..." (no space)
```

### Step 3: Verify Docker Containers

```bash
# Check all containers are running
docker ps

# Expected output includes:
# astralis-app        (healthy)
# astralis-worker     (healthy)
# astralis-postgres   (healthy)
# astralis-redis      (healthy)

# Check worker container has Tesseract
docker exec astralis-worker tesseract --version

# Expected output:
# tesseract 5.3.x
# leptonica-1.x.x

# Check worker container has Spaces environment variables
docker exec astralis-worker env | grep SPACES

# Expected output:
# SPACES_ACCESS_KEY=DO00...
# SPACES_SECRET_KEY=...
# SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
# SPACES_REGION=nyc3
# SPACES_BUCKET=astralis-documents
# SPACES_CDN_URL=https://...

# Check worker logs for errors
docker logs astralis-worker --tail 50

# Should NOT see:
# ❌ Error: Spaces credentials not configured
# ❌ Error connecting to Redis
# ❌ Missing environment variable: SPACES_ACCESS_KEY

# Should see:
# ✅ Worker started successfully
# ✅ Connected to Redis
# ✅ Listening for jobs on queues: [document-processing, intake-routing]
```

### Step 4: Test File Upload (Application)

```bash
# Start development server
npm run dev

# Application should start on http://localhost:3001

# Open browser and navigate to document upload page
# http://localhost:3001/documents/upload

# Upload test file:
# 1. Click "Choose File" or drag-and-drop
# 2. Select a PDF or image file
# 3. Click "Upload"

# Expected behavior:
# ✅ File uploads successfully
# ✅ Progress bar shows upload progress
# ✅ Success message appears
# ✅ File appears in document queue with status "PENDING"
# ✅ After 5-10 seconds, status changes to "PROCESSING"
# ✅ After 30-60 seconds, status changes to "COMPLETED"
# ✅ OCR text appears in document viewer

# Check browser console (F12) for errors
# Should NOT see:
# ❌ CORS error
# ❌ 403 Forbidden
# ❌ Network error

# Check server logs
npm run dev
# Should see:
# ✅ POST /api/documents/upload 200 (file uploaded)
# ✅ File uploaded to Spaces: org-abc123/documents/file.pdf
# ✅ Document processing job enqueued: job-123
```

### Step 5: Test CDN Delivery

```bash
# After uploading a file, get its CDN URL from database
npx prisma studio

# Open Document table
# Copy `cdnUrl` field for a completed document

# Test CDN access (signed URL)
curl -I "https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/org-abc123/documents/file.pdf?X-Amz-Signature=..."

# Expected output:
# HTTP/2 200 OK
# Content-Type: application/pdf
# Cache-Control: private, max-age=3600
# X-Amz-Request-Id: ...
# ETag: "..."

# Test CDN caching (repeat request)
curl -I "https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/..."

# Second request should be faster (served from edge cache)
# Header should include: X-Cache: HIT

# Test invalid/expired signed URL
curl -I "https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/org-abc123/documents/file.pdf"

# Expected output:
# HTTP/2 403 Forbidden (no signature, correct)
```

### Step 6: Test OCR Processing

```bash
# Upload a document with text (PDF or image)
# Use test file with known text: "Invoice #12345"

# Check worker logs
docker logs astralis-worker --follow

# Should see:
# ✅ [document-processing] Processing job: job-123
# ✅ [document-processing] Downloading file from Spaces
# ✅ [document-processing] Running Tesseract OCR
# ✅ [document-processing] OCR confidence: 94.3%
# ✅ [document-processing] Extracted text: "Invoice #12345..."
# ✅ [document-processing] Running GPT-4 Vision extraction
# ✅ [document-processing] Structured data: {"invoiceNumber":"12345",...}
# ✅ [document-processing] Job completed successfully

# Verify in database (Prisma Studio)
npx prisma studio

# Open Document table
# Find uploaded document
# Verify fields populated:
# - ocrText: Contains extracted text "Invoice #12345"
# - ocrConfidence: Number between 0-100 (e.g., 94.3)
# - extractedData: JSON object with structured data
# - status: "COMPLETED"
# - processedAt: Timestamp when processing finished
```

### Verification Checklist

After completing all steps, confirm:

- [ ] Spaces bucket created and accessible
- [ ] CORS configuration allows browser uploads
- [ ] CDN enabled and serving files
- [ ] Access keys generated and stored securely
- [ ] Environment variables set in `.env.local` (dev) and `.env` (prod)
- [ ] Worker container rebuilt with Tesseract
- [ ] Worker container has Spaces environment variables
- [ ] File upload works from application UI
- [ ] Files appear in Spaces bucket with correct paths
- [ ] CDN URLs are generated correctly
- [ ] Signed URLs work for private documents
- [ ] OCR processing completes successfully
- [ ] Extracted text appears in database
- [ ] GPT-4 Vision extraction returns structured data
- [ ] Document status updates: PENDING → PROCESSING → COMPLETED
- [ ] Worker logs show no errors
- [ ] Application logs show successful uploads

---

## Troubleshooting

### Issue: "Spaces credentials not configured"

**Symptoms**:
- Error on application startup
- File upload fails immediately
- Worker crashes on startup

**Solution**:

```bash
# Check environment variables are set
grep "SPACES_" .env.local

# Ensure no spaces around equals sign
# ❌ Wrong: SPACES_ACCESS_KEY = "key"
# ✅ Correct: SPACES_ACCESS_KEY="key"

# Restart application
docker-compose restart app worker

# Or in development:
npm run dev
```

### Issue: CORS Error on File Upload

**Symptoms**:
- Browser console shows: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Upload fails with network error
- Browser preflight request (OPTIONS) fails

**Solution**:

```bash
# Verify CORS configuration in Spaces bucket
# DigitalOcean Control Panel → Spaces → astralis-documents → Settings → CORS

# Ensure your domain is in AllowedOrigins:
[
  {
    "AllowedOrigins": [
      "http://localhost:3001",  # ← Add if missing
      "https://app.astralisone.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]

# Save CORS configuration
# Wait 30-60 seconds for changes to propagate
# Retry upload
```

### Issue: 403 Forbidden on CDN Access

**Symptoms**:
- Signed URLs return 403
- Images don't load in document viewer
- CDN URL returns "Access Denied"

**Possible Causes**:

**1. Signed URL expired**:

```bash
# Signed URLs expire after specified duration (default 1 hour)
# Regenerate signed URL:
const newSignedUrl = await spacesService.generateSignedUrl(filePath, 3600);
```

**2. Wrong CDN URL format**:

```bash
# ❌ Wrong: Using origin endpoint
https://nyc3.digitaloceanspaces.com/astralis-documents/file.pdf

# ✅ Correct: Using CDN endpoint
https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/file.pdf
```

**3. File has private ACL (correct for security)**:

```bash
# Private files require signed URLs
# Generate signed URL for access:
const signedUrl = await spacesService.generateSignedUrl(filePath);

# Or make file public (only for marketing assets):
ACL: 'public-read'
```

### Issue: Tesseract Not Found in Worker

**Symptoms**:
- Worker logs show: "tesseract: command not found"
- OCR processing fails
- Document status stuck at "PROCESSING"

**Solution**:

```bash
# Rebuild worker container with Tesseract
docker-compose build --no-cache worker
docker-compose up -d worker

# Verify Tesseract installed
docker exec astralis-worker tesseract --version

# If still missing, check Dockerfile has:
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

# Verify Dockerfile target is correct:
docker-compose exec worker cat /etc/alpine-release
# Should show Alpine Linux version (e.g., 3.18.4)
```

### Issue: OCR Processing Timeout

**Symptoms**:
- Large PDFs (>10 pages) never complete
- Worker logs show: "Job timed out"
- Document status stuck at "PROCESSING"

**Solution**:

```bash
# Increase job timeout in worker configuration
# Edit: src/workers/queues/document-processing.queue.ts

// Increase timeout from 60s to 300s (5 minutes)
documentQueue.process({
  concurrency: 2,
  timeout: 300000, // 5 minutes (was 60000)
});

# Or split large PDFs into chunks
# Process first 20 pages only:
tesseract.process(pdfPath, {
  pages: '1-20', // Limit page range
});

# Restart worker
docker-compose restart worker
```

### Issue: GPT-4 Vision API Error

**Symptoms**:
- OCR completes but extraction fails
- Worker logs show: "OpenAI API error: 429 Too Many Requests"
- Document status: "FAILED" with error message

**Solution**:

```bash
# Check OpenAI API key has GPT-4 Vision access
# https://platform.openai.com/api-keys

# Verify API key in environment
docker exec astralis-worker env | grep OPENAI_API_KEY

# Check OpenAI usage limits
# https://platform.openai.com/account/usage

# Implement retry logic with exponential backoff
# BullMQ automatically retries failed jobs:
documentQueue.add('process-document', data, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 10000, // Start at 10s, double each retry
  },
});

# If rate limited, reduce worker concurrency
# Edit docker-compose.yml:
environment:
  - WORKER_CONCURRENCY=1  # Process 1 job at a time (was 2)
```

### Issue: High DigitalOcean Spaces Costs

**Symptoms**:
- Monthly Spaces bill higher than expected
- High bandwidth charges
- Large number of API requests

**Solution**:

```bash
# Audit Spaces usage
# DigitalOcean Control Panel → Spaces → astralis-documents → Usage

# Check for:
# 1. Bandwidth spikes (CDN transfer)
# 2. Storage growth (files not being deleted)
# 3. High request count (API calls)

# Optimization strategies:

# 1. Enable CDN caching (reduce bandwidth)
Cache-Control: public, max-age=31536000  # 1 year for static files

# 2. Delete old thumbnails and temp files
# Run cleanup job weekly:
const oldThumbnails = await prisma.document.findMany({
  where: {
    thumbnailUrl: { not: null },
    createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // 90 days
  },
});
for (const doc of oldThumbnails) {
  await spacesService.deleteFile(doc.thumbnailUrl);
}

# 3. Compress images before upload
# Use sharp or imagemagick:
const compressed = await sharp(buffer)
  .resize(2000, 2000, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();

# 4. Use lifecycle rules (DigitalOcean feature)
# Spaces → Settings → Lifecycle Rules
# - Delete files after 365 days
# - Transition old files to cheaper storage (if available)
```

### Issue: Slow File Uploads

**Symptoms**:
- File uploads take >30 seconds
- Progress bar stalls at 50-70%
- Timeout errors

**Solution**:

```bash
# 1. Use multipart upload for large files (>5MB)
# AWS SDK automatically uses multipart for files >5MB

# 2. Optimize client-side chunk size
const chunkSize = 5 * 1024 * 1024; // 5MB chunks

# 3. Check network latency to Spaces region
ping nyc3.digitaloceanspaces.com

# 4. Consider regional bucket closer to users
# Create bucket in different region (e.g., sfo3 for west coast)

# 5. Compress files client-side before upload
# Use browser-image-compression library:
import imageCompression from 'browser-image-compression';

const options = { maxSizeMB: 1, maxWidthOrHeight: 1920 };
const compressedFile = await imageCompression(file, options);

# 6. Use resumable uploads (S3 Multipart Upload API)
# Allows retrying failed chunks without re-uploading entire file
```

### Issue: Database Connection Errors in Worker

**Symptoms**:
- Worker crashes with "Connection terminated"
- Prisma errors: "Can't reach database server"
- OCR jobs fail to update document status

**Solution**:

```bash
# Check DATABASE_URL in worker container
docker exec astralis-worker env | grep DATABASE_URL

# Ensure using correct hostname for Dockerized postgres
# ❌ Wrong: DATABASE_URL="postgresql://localhost:5432/astralis"
# ✅ Correct: DATABASE_URL="postgresql://postgres:5432/astralis"
# Docker services use service name as hostname

# Verify postgres container is reachable from worker
docker exec astralis-worker ping -c 3 astralis-postgres

# Check postgres connection limit
docker exec astralis-postgres psql -U postgres -c "SHOW max_connections;"

# Increase connection pool size in Prisma (if needed)
# Add to prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_size = 20  # Increase from default 10
}

# Regenerate Prisma client
npx prisma generate

# Restart worker
docker-compose restart worker
```

### Getting Help

If issues persist after troubleshooting:

1. **Check Logs**:
   ```bash
   # Application logs
   docker logs astralis-app --tail 100

   # Worker logs
   docker logs astralis-worker --tail 100 --follow

   # Redis logs (for job queue issues)
   docker logs astralis-redis --tail 50
   ```

2. **Enable Debug Logging**:
   ```bash
   # Add to .env
   LOG_LEVEL=debug
   DEBUG=spaces:*,worker:*

   # Restart containers
   docker-compose restart
   ```

3. **Test Individual Components**:
   ```bash
   # Test Spaces connectivity
   npm run test:spaces

   # Test OCR processing
   npm run test:ocr

   # Test worker job processing
   npm run test:worker
   ```

4. **Consult Documentation**:
   - DigitalOcean Spaces: https://docs.digitalocean.com/products/spaces/
   - AWS SDK for JavaScript: https://docs.aws.amazon.com/sdk-for-javascript/
   - Tesseract.js: https://tesseract.projectnaptha.com/
   - BullMQ: https://docs.bullmq.io/

5. **Contact Support**:
   - DigitalOcean Support: https://www.digitalocean.com/support
   - Create issue in project repository
   - Reach out to team in Slack/Discord

---

## Summary

This deployment guide covered:

1. Creating and configuring DigitalOcean Spaces bucket with CDN
2. Setting up CORS policy for browser uploads
3. Generating API access keys
4. Configuring environment variables for dev and production
5. Updating Docker containers with Tesseract dependencies
6. Implementing CDN caching and signed URLs
7. Security best practices for file storage
8. Verification steps for all components
9. Troubleshooting common issues

**Next Steps**:

After completing infrastructure setup:

1. Implement file upload UI components (see Phase 4 implementation doc)
2. Create Spaces service class (`src/lib/services/spaces.service.ts`)
3. Build document processing workers (`src/workers/document-processing.worker.ts`)
4. Add OCR and GPT-4 Vision integration
5. Create document viewer and management UI
6. Test complete document processing pipeline
7. Monitor usage and optimize costs

**Infrastructure Checklist**:

- [ ] Spaces bucket created with CDN enabled
- [ ] CORS policy configured
- [ ] API access keys generated and secured
- [ ] Environment variables set in `.env.local` and `.env`
- [ ] Worker Dockerfile updated with Tesseract
- [ ] docker-compose.yml updated with Spaces env vars
- [ ] Containers rebuilt and restarted
- [ ] All verification steps passed
- [ ] Team members have access to credentials
- [ ] Documentation shared with team

You are now ready to proceed with Phase 4 code implementation.
