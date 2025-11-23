# Deployment Guide

Complete guide for deploying Astralis One to production.

## Table of Contents

- [Quick Start](#quick-start)
- [Deployment Scripts](#deployment-scripts)
- [Manual Deployment](#manual-deployment)
- [Service Management](#service-management)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Interactive Quick Deploy (Recommended)

```bash
./scripts/quick-deploy.sh
```

The script will:
1. Auto-detect your ticket number from branch name
2. Prompt for commit message
3. Build, commit, push, and deploy automatically

### Option 2: Full Deploy with Custom Message

```bash
./scripts/deploy.sh production "SIT-1234 add Phase 6 automation features"
```

---

## Deployment Scripts

### `deploy.sh` - Master Deployment Script

**Full deployment automation:**
- ✅ Pre-flight checks (SSH, git status, build)
- ✅ Local build and testing
- ✅ Git operations (commit, push)
- ✅ Remote deployment
- ✅ Database migrations
- ✅ Service management (Redis, Docker, PM2, Caddy)
- ✅ Post-deployment health checks

**Usage:**
```bash
./scripts/deploy.sh [environment] "commit message"

# Examples:
./scripts/deploy.sh production "SIT-1234 implement booking system"
./scripts/deploy.sh staging "SIT-5678 fix calendar sync bug"
```

**What it does:**

1. **Pre-flight Checks:**
   - Validates project directory
   - Checks SSH connectivity
   - Verifies git status

2. **Local Operations:**
   - `npm install` - Install dependencies
   - `npm run lint` - Run linter
   - `npm run build` - Production build
   - `git add .` - Stage changes
   - `git commit` - Commit with proper format
   - `git push` - Push to remote

3. **Remote Deployment:**
   - SSH to server: `root@137.184.31.207`
   - Navigate to: `/home/deploy/astralis-nextjs`
   - `git pull` - Pull latest code
   - `npm install` - Install dependencies
   - `npx prisma generate` - Generate Prisma client
   - `npx prisma migrate deploy` - Run migrations
   - `npm run build` - Build on server

4. **Service Management:**
   - **Redis:** `systemctl restart redis`
   - **Docker:** `docker-compose down && docker-compose up -d`
   - **n8n:** Starts via Docker Compose
   - **PM2:** `pm2 restart astralis` or `pm2 start ecosystem.config.js`
   - **Caddy:** `systemctl reload caddy`

5. **Health Checks:**
   - Check site response
   - Check n8n accessibility
   - Display service status

### `quick-deploy.sh` - Simplified Interactive Deploy

**Interactive wrapper for common scenarios:**
- Auto-detects ticket number from branch name
- Prompts for commit message
- Calls full deployment script

**Usage:**
```bash
./scripts/quick-deploy.sh

# Interactive prompts:
# > Enter commit message: add Phase 6 automation features
# > Deploying with: SIT-1234 add Phase 6 automation features
```

---

## Manual Deployment

If you need to deploy manually without scripts:

### 1. Local Build

```bash
npm install
npm run lint
npm run build
```

### 2. Git Operations

```bash
# Stage changes
git add .

# Commit with proper format
git commit -m "SIT-1234 your message here

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin feature/your-branch
```

### 3. Server Deployment

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Navigate to project
cd /home/deploy/astralis-nextjs

# Pull latest code
git pull origin main  # or your branch

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build production bundle
npm run build

# Restart services (see Service Management below)
```

---

## Service Management

### Redis

```bash
# Start
sudo systemctl start redis

# Restart
sudo systemctl restart redis

# Status
sudo systemctl status redis

# Enable on boot
sudo systemctl enable redis
```

### Docker & n8n

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Check running containers
docker ps

# Restart n8n only
docker-compose restart n8n

# View n8n logs
docker logs -f astralis_n8n
```

### PM2 Application

```bash
# Start application
pm2 start ecosystem.config.js

# Restart application
pm2 restart astralis

# Stop application
pm2 stop astralis

# View logs
pm2 logs astralis

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
```

### Caddy Web Server

```bash
# Start
sudo systemctl start caddy

# Restart
sudo systemctl restart caddy

# Reload (zero-downtime)
sudo systemctl reload caddy

# Status
sudo systemctl status caddy

# View logs
sudo journalctl -u caddy -f

# Test configuration
caddy validate --config /etc/caddy/Caddyfile
```

---

## Post-Deployment Checks

### 1. Verify Services

```bash
# Check all services
./scripts/check-services.sh  # If available

# Or manually:
systemctl status redis
docker ps
pm2 list
systemctl status caddy
```

### 2. Test Application

```bash
# Main application
curl http://137.184.31.207

# n8n editor
curl http://137.184.31.207:5678

# Health endpoint (if available)
curl http://137.184.31.207/api/health
```

### 3. Check Database

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Connect to database
psql postgresql://user@localhost:5432/astralis

# Check migrations
npx prisma migrate status
```

### 4. Monitor Logs

```bash
# PM2 application logs
pm2 logs astralis --lines 100

# Caddy logs
sudo journalctl -u caddy -n 100

# n8n logs
docker logs astralis_n8n --tail 100

# Redis logs
sudo journalctl -u redis -n 100
```

---

## Troubleshooting

### Deployment Script Fails

**SSH Connection Error:**
```bash
# Test SSH manually
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Check SSH key permissions
chmod 600 ~/.ssh/id_ed25519
```

**Build Fails:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Git Issues:**
```bash
# Check git status
git status

# Discard local changes (CAREFUL!)
git reset --hard HEAD

# Pull latest
git pull origin main
```

### Service Issues

**Redis Not Starting:**
```bash
# Check logs
sudo journalctl -u redis -n 50

# Check if port is in use
sudo lsof -i :6379

# Restart
sudo systemctl restart redis
```

**Docker/n8n Issues:**
```bash
# Check logs
docker-compose logs n8n

# Restart containers
docker-compose down
docker-compose up -d

# Check Docker daemon
sudo systemctl status docker
```

**PM2 Application Crashes:**
```bash
# View error logs
pm2 logs astralis --err

# Restart with full logs
pm2 restart astralis --update-env

# Check for port conflicts
sudo lsof -i :3001

# Delete and recreate
pm2 delete astralis
pm2 start ecosystem.config.js
pm2 save
```

**Caddy Configuration Error:**
```bash
# Validate config
caddy validate --config /etc/caddy/Caddyfile

# View detailed errors
sudo journalctl -u caddy -n 100 --no-pager

# Restart
sudo systemctl restart caddy
```

### Database Issues

**Migration Fails:**
```bash
# Check migration status
npx prisma migrate status

# Reset database (CAREFUL - DELETES DATA!)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate deploy
```

**Connection Error:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql postgresql://user@localhost:5432/astralis

# Check environment variables
cat .env | grep DATABASE_URL
```

---

## Environment Variables

Ensure these are set on the server:

### Required (Production)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralis"

# Next.js
NEXT_PUBLIC_API_BASE_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_EMAIL="noreply@your-domain.com"

# n8n
N8N_ENCRYPTION_KEY="your-encryption-key"
N8N_HOST="https://your-domain.com"
N8N_WEBHOOK_URL="https://your-domain.com/webhook"
```

### Optional (Integrations)

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Other integrations...
```

---

## Git Flow Reference

Following the project's Git Flow guidelines:

### Branch Naming

```bash
# Features
feature/SIT-1234-short-description

# Fixes
fix/SIT-1234-short-description

# Examples
feature/SIT-5001-phase-6-automation
fix/SIT-5002-calendar-sync-bug
```

### Commit Messages

```bash
# Format: TICKET-NUMBER description
SIT-1234 add Phase 6 automation features
SIT-5678 fix calendar timezone handling

# Auto-appended by deploy script:
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Workflow

1. **Create branch from `prod`:**
   ```bash
   git checkout prod
   git pull origin prod
   git checkout -b feature/SIT-1234-description
   ```

2. **Make changes and deploy:**
   ```bash
   ./scripts/quick-deploy.sh
   ```

3. **Create PR to merge into `main`:**
   ```bash
   # Via GitHub UI or:
   gh pr create --title "SIT-1234: Description" --base main
   ```

---

## Support

For deployment issues:
1. Check logs (see Troubleshooting section)
2. Verify all services are running
3. Test database connectivity
4. Review recent commits for breaking changes

**Server Access:**
- SSH: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- Project: `/home/deploy/astralis-nextjs`
- Logs: `pm2 logs`, `docker-compose logs`, `journalctl -u caddy`
