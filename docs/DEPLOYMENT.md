# Astralis One - Production Deployment Guide

Comprehensive guide for deploying Astralis One Multi-Agent Engineering Platform to production using Vercel (Next.js app) and Fly.io (background workers).

**Last Updated:** December 2024

---

## Table of Contents

1. [Overview](#1-overview)
2. [Infrastructure](#2-infrastructure)
3. [Prerequisites](#3-prerequisites)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Fly.io Workers Deployment](#5-flyio-workers-deployment)
6. [Environment Configuration](#6-environment-configuration)
7. [Managed Services](#7-managed-services)
8. [Deployment Process](#8-deployment-process)
9. [Monitoring and Observability](#9-monitoring-and-observability)
10. [Troubleshooting](#10-troubleshooting)
11. [Rollback Procedures](#11-rollback-procedures)

---

## 1. Overview

### 1.1 Production Environment

**Infrastructure:**
- **Application Hosting:** Vercel (serverless)
- **Workers Hosting:** Fly.io (2 machines, iad region)
- **Database:** Prisma Postgres (db.prisma.io)
- **Redis:** Upstash (managed Redis)
- **File Storage:** Vercel Blob

**Domains:**
- **Primary:** astralisone.com
- **API:** astralisone.com/api/*

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                    Vercel Edge Network                          │
│                  - Global CDN                                   │
│                  - Automatic HTTPS                              │
│                  - DDoS Protection                              │
└──────────────────┬────────────────────────────────┬─────────────┘
                   │                                │
         ┌─────────▼─────────┐            ┌────────▼────────┐
         │   Vercel Functions │            │  Vercel Blob    │
         │   (Next.js App)    │            │  (File Storage) │
         │   - App Router     │            └─────────────────┘
         │   - API Routes     │
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────────────────────┐
    │              │                              │
┌───▼──────────┐   │                    ┌────────▼────────┐
│Prisma Postgres│  │                    │  Upstash Redis  │
│ (db.prisma.io)│  │                    │  (Queue/Cache)  │
└───────────────┘  │                    └────────┬────────┘
                   │                             │
                   │    ┌────────────────────────▼────────┐
                   │    │          Fly.io Workers         │
                   │    │     (BullMQ Job Processing)     │
                   │    │  - Document OCR                 │
                   │    │  - Embedding Generation         │
                   │    │  - Email Sending                │
                   │    │  - AI Agent Tasks               │
                   └────┤  (2 machines, iad region)       │
                        └─────────────────────────────────┘
```

### 1.3 Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web Framework | Next.js 15 (App Router) | Application and API routes |
| Language | TypeScript 5 | Type-safe development |
| Database | Prisma Postgres | Managed PostgreSQL |
| ORM | Prisma | Database access layer |
| Queue | BullMQ + Upstash Redis | Background job processing |
| Storage | Vercel Blob | Document and file storage |
| AI | OpenAI + Anthropic | Embeddings and chat |
| Auth | NextAuth.js | Authentication |

---

## 2. Infrastructure

### 2.1 Vercel (Application)

Vercel hosts the Next.js application including:
- Server-side rendering
- API routes (50+ endpoints)
- Static assets and CDN
- Edge middleware

**Configuration Files:**
- `vercel.json` - Deployment settings
- `next.config.js` - Next.js configuration

### 2.2 Fly.io (Workers)

Fly.io runs background worker processes:
- Document processing (OCR)
- Embedding generation
- Email sending
- AI agent tasks

**Configuration Files:**
- `fly.toml` - Fly.io deployment config
- `Dockerfile.workers` - Worker container definition

**Machine Specs:**
- Region: iad (Ashburn, Virginia)
- Count: 2 machines
- Memory: 512MB each
- CPU: shared

### 2.3 Service Endpoints

| Service | Endpoint | Dashboard |
|---------|----------|-----------|
| Vercel | astralisone.com | vercel.com/dashboard |
| Fly.io | N/A (internal workers) | fly.io/dashboard |
| Prisma Postgres | db.prisma.io | console.prisma.io |
| Upstash Redis | REST API | console.upstash.com |
| Vercel Blob | Vercel dashboard | vercel.com/storage |

---

## 3. Prerequisites

### 3.1 CLI Tools

```bash
# Vercel CLI
npm i -g vercel

# Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Authenticate
vercel login
fly auth login
```

### 3.2 Required Accounts

- Vercel account (linked to GitHub)
- Fly.io account
- Prisma Postgres (via Prisma Console)
- Upstash account (for Redis)
- OpenAI account (API key)
- Anthropic account (API key)

---

## 4. Vercel Deployment

### 4.1 Initial Setup

```bash
# Link project to Vercel
cd astralis-nextjs
vercel link

# Select your team/account
# Link to existing project or create new
```

### 4.2 Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://..."  # From Prisma Postgres

# Auth
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="https://astralisone.com"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# File Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
SMTP_FROM="noreply@astralisone.com"

# Email (Brevo - verification emails)
BREVO_API_KEY="..."
BREVO_SENDER_EMAIL="..."
BREVO_SENDER_NAME="Astralis One"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 4.3 Build Configuration

The `vercel-build` script in `package.json` handles:
1. Prisma client generation
2. Database migrations
3. Next.js build

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### 4.4 Deployment

```bash
# Automatic (recommended)
git push origin main  # Triggers automatic deployment

# Manual
vercel --prod
```

---

## 5. Fly.io Workers Deployment

### 5.1 Initial Setup

```bash
# Create app (first time only)
fly apps create astralis-workers --region iad

# Or import from fly.toml
fly launch --no-deploy
```

### 5.2 Set Secrets

```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="redis://default:TOKEN@HOST:PORT" \
  OPENAI_API_KEY="sk-..." \
  ANTHROPIC_API_KEY="sk-ant-..." \
  BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 5.3 Deploy Workers

```bash
# Deploy
fly deploy -c fly.toml

# Check status
fly status

# View logs
fly logs
```

### 5.4 fly.toml Configuration

```toml
app = "astralis-workers"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile.workers"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"

[processes]
  worker = "npm run worker:prod"
```

### 5.5 Scaling

```bash
# Scale to 2 machines
fly scale count 2 --region iad

# Show current scaling
fly scale show

# Adjust memory
fly scale memory 512
```

---

## 6. Environment Configuration

### 6.1 Local Development (.env.local)

```bash
# Database (local PostgreSQL or Prisma Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/astralis"

# Redis (local)
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="dev-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# Storage (Vercel Blob works locally)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 6.2 Production Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| DATABASE_URL | Vercel + Fly.io | Prisma Postgres connection |
| REDIS_URL | Fly.io only | Upstash Redis URL |
| UPSTASH_REDIS_REST_URL | Vercel only | Upstash REST endpoint |
| UPSTASH_REDIS_REST_TOKEN | Vercel only | Upstash REST token |
| BLOB_READ_WRITE_TOKEN | Vercel + Fly.io | Vercel Blob access |
| OPENAI_API_KEY | Vercel + Fly.io | OpenAI API access |
| ANTHROPIC_API_KEY | Vercel + Fly.io | Claude API access |

---

## 7. Managed Services

### 7.1 Prisma Postgres

**Setup:**
1. Go to console.prisma.io
2. Create new project
3. Copy DATABASE_URL

**Migrations:**
```bash
# Run migrations (production)
npx prisma migrate deploy

# Generate client
npx prisma generate
```

**Dashboard:**
```bash
npx prisma studio  # Opens on localhost:5555
```

### 7.2 Upstash Redis

**Setup:**
1. Go to console.upstash.com
2. Create Redis database
3. Copy REST URL and token

**Connection:**
- Vercel uses REST API (UPSTASH_REDIS_REST_URL)
- Fly.io uses native Redis URL (REDIS_URL)

### 7.3 Vercel Blob

**Setup:**
1. Go to Vercel Dashboard → Storage
2. Create Blob store
3. Copy BLOB_READ_WRITE_TOKEN

**Usage:**
- Documents stored with CDN URLs
- Automatic content-type detection
- Public and private access modes

---

## 8. Deployment Process

### 8.1 Standard Deployment (Vercel)

```bash
# 1. Commit changes
git add .
git commit -m "feat: your changes"

# 2. Push to main (triggers deployment)
git push origin main

# 3. Monitor deployment
vercel logs
```

### 8.2 Worker Deployment (Fly.io)

```bash
# 1. Deploy workers
fly deploy -c fly.toml

# 2. Monitor deployment
fly logs --follow

# 3. Verify health
fly status
```

### 8.3 Database Migrations

```bash
# Migrations run automatically during Vercel build
# Manual run if needed:
npx prisma migrate deploy
```

---

## 9. Monitoring and Observability

### 9.1 Vercel Logs

```bash
# View recent logs
vercel logs

# Stream logs
vercel logs --follow

# Filter by deployment
vercel logs <deployment-url>
```

### 9.2 Fly.io Logs

```bash
# View worker logs
fly logs

# Stream logs
fly logs --follow

# Filter by app
fly logs --app astralis-workers
```

### 9.3 Dashboards

| Service | Dashboard URL |
|---------|---------------|
| Vercel | vercel.com/dashboard |
| Fly.io | fly.io/dashboard |
| Prisma | console.prisma.io |
| Upstash | console.upstash.com |

### 9.4 Health Checks

```bash
# Application health
curl https://astralisone.com/api/health

# Worker status
fly status
fly checks list
```

---

## 10. Troubleshooting

### 10.1 Common Vercel Issues

**Build Failures:**
```bash
# Check build logs
vercel logs --type build

# Common fixes:
# - Ensure all env vars are set
# - Check for TypeScript errors: npm run build locally
# - Verify prisma schema is valid
```

**Function Timeouts:**
- Default: 10s (hobby), 60s (pro)
- Increase in vercel.json for specific routes

### 10.2 Common Fly.io Issues

**Worker Not Starting:**
```bash
# Check logs
fly logs

# SSH into machine
fly ssh console

# Common fixes:
# - Verify all secrets are set: fly secrets list
# - Check REDIS_URL format
# - Ensure DATABASE_URL is accessible
```

**Memory Issues:**
```bash
# Increase memory
fly scale memory 1024
```

### 10.3 Database Issues

**Connection Errors:**
```bash
# Test connection
npx prisma db pull

# Check connection string format
# postgresql://user:password@host:port/database?sslmode=require
```

**Migration Issues:**
```bash
# Reset migrations (development only!)
npx prisma migrate reset

# Force deploy (skip shadow database)
npx prisma migrate deploy
```

### 10.4 Redis Issues

**Connection Failures:**
```bash
# Test Upstash REST API
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

---

## 11. Rollback Procedures

### 11.1 Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or via dashboard
# Vercel Dashboard → Deployments → ... → Rollback
```

### 11.2 Fly.io Rollback

```bash
# List releases
fly releases

# Rollback to previous release
fly releases rollback <version>

# Redeploy previous version
fly deploy --image <previous-image>
```

### 11.3 Database Rollback

**Prisma Postgres supports point-in-time recovery via console.prisma.io**

```bash
# Revert last migration (development only)
npx prisma migrate reset
```

---

## Appendix A: Quick Reference

### Deployment Commands

```bash
# Vercel
vercel --prod                    # Deploy to production
vercel logs                      # View logs
vercel env ls                    # List env vars
vercel rollback                  # Rollback deployment

# Fly.io
fly deploy                       # Deploy workers
fly logs                         # View logs
fly status                       # Check status
fly secrets list                 # List secrets
fly scale count 2                # Scale workers
fly releases rollback            # Rollback

# Database
npx prisma generate              # Generate client
npx prisma migrate deploy        # Run migrations
npx prisma studio                # Open GUI
```

### Important URLs

- Production: https://astralisone.com
- Vercel Dashboard: https://vercel.com/dashboard
- Fly.io Dashboard: https://fly.io/dashboard
- Prisma Console: https://console.prisma.io
- Upstash Console: https://console.upstash.com

---

## Appendix B: Previous Architecture

For documentation on the previous DigitalOcean/Caddy deployment, see:
`docs/.archive/digitalocean-era/`

This includes Caddy configuration, PM2 setup, and self-hosted deployment guides that may be useful if reverting to self-hosted infrastructure.
