# Phase 4 Quick Reference: Infrastructure Setup

**Quick command reference for Phase 4 document processing infrastructure setup**

See full guide: `docs/PHASE_4_DEPLOYMENT.md`

---

## Environment Variables Checklist

Add to `.env.local` (development) and `.env` (production):

```bash
# DigitalOcean Spaces Configuration
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="your-spaces-secret-key-64-chars"
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

## DigitalOcean Spaces Setup Steps

### 1. Create Spaces Bucket

1. Log in: https://cloud.digitalocean.com
2. Navigate: **Manage → Spaces Object Storage → Create Spaces Bucket**
3. Configure:
   - Region: **New York 3 (nyc3)**
   - Name: **astralis-documents**
   - Enable CDN: **Yes** ✓
   - File Listing: **Restrict File Listing (Private)**
4. Click **Create Spaces Bucket**

### 2. Configure CORS

1. Navigate to bucket: **Settings → CORS Configurations → Add**
2. Paste CORS JSON:

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

3. Click **Save**

### 3. Generate Access Keys

1. Navigate: **API → Spaces Keys → Generate New Key**
2. Name: **astralis-production-spaces**
3. Copy **Access Key** and **Secret Key** immediately (secret shown once only)
4. Save to `.env.local` and `.env`

### 4. Note CDN Endpoint

Copy **Edge Endpoint** from Spaces bucket overview:
```
https://astralis-documents.nyc3.cdn.digitaloceanspaces.com
```

---

## Docker Updates

### Update docker-compose.yml

Add to `app` service environment:

```yaml
environment:
  # ... existing vars
  - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
  - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
  - SPACES_ENDPOINT=${SPACES_ENDPOINT}
  - SPACES_REGION=${SPACES_REGION}
  - SPACES_BUCKET=${SPACES_BUCKET}
  - SPACES_CDN_URL=${SPACES_CDN_URL}
  - MAX_FILE_SIZE=${MAX_FILE_SIZE}
  - ALLOWED_FILE_TYPES=${ALLOWED_FILE_TYPES}
```

Add to `worker` service environment:

```yaml
environment:
  # ... existing vars
  - SPACES_ACCESS_KEY=${SPACES_ACCESS_KEY}
  - SPACES_SECRET_KEY=${SPACES_SECRET_KEY}
  - SPACES_ENDPOINT=${SPACES_ENDPOINT}
  - SPACES_REGION=${SPACES_REGION}
  - SPACES_BUCKET=${SPACES_BUCKET}
  - SPACES_CDN_URL=${SPACES_CDN_URL}
  - OCR_LANGUAGE=${OCR_LANGUAGE:-eng}
  - VISION_MODEL=${VISION_MODEL:-gpt-4-vision-preview}
```

### Update Dockerfile (Worker Target)

Add Tesseract dependencies to `worker` target:

```dockerfile
FROM node:20-alpine AS worker

WORKDIR /app

# Install Tesseract OCR dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tesseract-ocr-data-spa \
    tesseract-ocr-data-fra \
    tesseract-ocr-data-deu \
    poppler-utils \
    imagemagick

# ... rest of Dockerfile
```

### Rebuild and Restart

```bash
# Stop containers
docker-compose down

# Rebuild worker with Tesseract
docker-compose build worker

# Start all services
docker-compose up -d

# Verify Tesseract installed
docker exec astralis-worker tesseract --version
```

---

## Verification Commands

### Test Spaces Access

```bash
# Install AWS CLI (if not installed)
brew install awscli  # macOS
apt install awscli   # Linux

# Configure credentials
aws configure set aws_access_key_id "DO00ABCDEFGHIJKLMNOP"
aws configure set aws_secret_access_key "your-secret-key"

# Test bucket access
aws s3 ls s3://astralis-documents \
  --endpoint-url https://nyc3.digitaloceanspaces.com

# Upload test file
echo "test" > test.txt
aws s3 cp test.txt s3://astralis-documents/test/test.txt \
  --endpoint-url https://nyc3.digitaloceanspaces.com

# Clean up
aws s3 rm s3://astralis-documents/test/test.txt \
  --endpoint-url https://nyc3.digitaloceanspaces.com
rm test.txt
```

### Verify Environment Variables

```bash
# Check .env.local has Spaces variables
grep "SPACES_" .env.local

# Check worker container has variables
docker exec astralis-worker env | grep SPACES
```

### Verify Docker Containers

```bash
# Check all containers running
docker ps

# Check worker has Tesseract
docker exec astralis-worker tesseract --version

# Check worker logs
docker logs astralis-worker --tail 50
```

### Test Application Upload

```bash
# Start dev server
npm run dev

# Open browser: http://localhost:3001/documents/upload
# Upload a test PDF or image
# Verify status changes: PENDING → PROCESSING → COMPLETED
```

---

## Production Deployment

### SSH to Server

```bash
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs
```

### Update Environment Variables

```bash
# Edit production .env
nano .env

# Add Spaces variables (see "Environment Variables Checklist" above)
# Save and exit (Ctrl+X, Y, Enter)
```

### Deploy Updates

```bash
# Pull latest code
git pull origin main

# Rebuild worker
docker-compose build worker

# Restart services
docker-compose up -d

# Verify containers
docker ps
docker logs astralis-worker --tail 50

# Test Tesseract
docker exec astralis-worker tesseract --version
```

---

## Common Issues & Quick Fixes

### CORS Error

```bash
# Add your domain to CORS AllowedOrigins
# DigitalOcean: Spaces → Settings → CORS
# Add: "http://localhost:3001" or "https://your-domain.com"
```

### Tesseract Not Found

```bash
# Rebuild worker with --no-cache
docker-compose build --no-cache worker
docker-compose up -d worker
docker exec astralis-worker tesseract --version
```

### 403 Forbidden on CDN

```bash
# Use signed URLs for private files
# Or set ACL to 'public-read' for public files
```

### Worker Crashes

```bash
# Check logs
docker logs astralis-worker --tail 100

# Verify DATABASE_URL uses postgres hostname (not localhost)
docker exec astralis-worker env | grep DATABASE_URL
# Should be: postgresql://postgres:5432/... (not localhost)
```

---

## Cost Optimization

**DigitalOcean Spaces Pricing**:
- Storage: $5/month for 250GB
- Bandwidth: $0.01/GB for CDN transfer
- API Requests: Included

**Tips to Reduce Costs**:

```bash
# 1. Enable aggressive CDN caching
Cache-Control: public, max-age=31536000  # 1 year

# 2. Compress images before upload
# Use sharp or imagemagick to reduce file size

# 3. Delete old thumbnails/temp files
# Run cleanup job weekly

# 4. Use lifecycle rules (if available)
# Auto-delete files after 365 days
```

---

## Support Resources

- **Full Deployment Guide**: `docs/PHASE_4_DEPLOYMENT.md`
- **DigitalOcean Spaces Docs**: https://docs.digitalocean.com/products/spaces/
- **AWS SDK for JavaScript**: https://docs.aws.amazon.com/sdk-for-javascript/
- **Tesseract.js**: https://tesseract.projectnaptha.com/
- **BullMQ**: https://docs.bullmq.io/

---

## Next Steps

After infrastructure setup:

1. Implement Spaces service: `src/lib/services/spaces.service.ts`
2. Create document upload API: `src/app/api/documents/upload/route.ts`
3. Build document processing worker: `src/workers/document-processing.worker.ts`
4. Add OCR integration with Tesseract.js
5. Implement GPT-4 Vision extraction
6. Create document viewer UI
7. Add document management pages

See Phase 4 implementation document for code details.
