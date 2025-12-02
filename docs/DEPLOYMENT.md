# Astralis One - Production Deployment Guide

Comprehensive guide for deploying Astralis One Multi-Agent Engineering Platform to production infrastructure.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Infrastructure](#2-infrastructure)
3. [Prerequisites](#3-prerequisites)
4. [Initial Server Setup](#4-initial-server-setup)
5. [Environment Configuration](#5-environment-configuration)
6. [Deployment Process](#6-deployment-process)
7. [PM2 Process Management](#7-pm2-process-management)
8. [Monitoring and Observability](#8-monitoring-and-observability)
9. [Backup and Recovery](#9-backup-and-recovery)
10. [Troubleshooting](#10-troubleshooting)
11. [Scaling Strategies](#11-scaling-strategies)
12. [Security Hardening](#12-security-hardening)

---

## 1. Overview

### 1.1 Production Environment

**Infrastructure Provider:** DigitalOcean
**Server IP:** 137.184.31.207
**Deployment Directory:** /home/deploy/astralis-nextjs
**Primary Domain:** astralisone.com
**Automation Domain:** automation.astralisone.com

### 1.2 Application Stack

```
┌─────────────────────────────────────────────────────┐
│                    Internet                         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│           Caddy Reverse Proxy (443/80)              │
│  - Auto HTTPS (Let's Encrypt)                       │
│  - Security Headers                                  │
│  - Request Routing                                   │
└──────────────┬─────────────────┬────────────────────┘
               │                 │
       ┌───────▼─────────┐  ┌───▼────────────────┐
       │   Next.js App   │  │   n8n Automation   │
       │    (PM2:3001)   │  │   (Docker:5678)    │
       └───────┬─────────┘  └────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐   ┌────────▼──────┐
│ PostgreSQL │   │  Redis (6379) │
│  (5433)    │   │  - BullMQ     │
└────────────┘   └───────────────┘
```

### 1.3 Key Technologies

- **Runtime:** Node.js 20+ on Ubuntu 22.04 LTS
- **Web Framework:** Next.js 15 (App Router) with TypeScript
- **Process Manager:** PM2 (app + worker processes)
- **Reverse Proxy:** Caddy 2 (automatic HTTPS)
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Cache/Queue:** Redis 7 with BullMQ
- **Automation:** n8n (containerized)
- **Storage:** DigitalOcean Spaces (S3-compatible)

---

## 2. Infrastructure

### 2.1 Server Specifications

**DigitalOcean Droplet Configuration:**
- **OS:** Ubuntu 22.04 LTS (Long Term Support)
- **CPU:** 4 vCPUs (shared or dedicated)
- **RAM:** 8GB (minimum recommended)
- **Storage:** 160GB SSD (NVMe)
- **Network:** 5TB transfer/month
- **IPv4:** 137.184.31.207
- **Region:** New York (nyc3) or nearest to target users

**Recommended Upgrades:**
- **Production:** 8 vCPUs / 16GB RAM for high-traffic scenarios
- **Storage:** Additional block storage for database backups
- **Networking:** Load balancer for multi-server deployments

### 2.2 Service Architecture

#### Application Services

| Service | Port | Process Manager | Purpose |
|---------|------|-----------------|---------|
| Next.js App | 3001 | PM2 | Main web application |
| Worker Process | N/A | PM2 | Background job processing (BullMQ) |
| n8n | 5678 | Docker Compose | Workflow automation |
| PostgreSQL | 5433 | systemd | Primary database |
| Redis | 6379 | systemd | Cache and job queue |
| Caddy | 80/443 | systemd | Reverse proxy and HTTPS |

#### External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Object Storage | DigitalOcean Spaces | Document uploads, file storage |
| Email (SMTP) | Brevo (smtp-relay.brevo.com) | Transactional emails |
| OpenAI API | OpenAI | Embeddings, vision, chat |
| Anthropic API | Anthropic | Claude AI integration |
| Twilio | Twilio | SMS and voice capabilities |
| Google OAuth | Google Cloud | Authentication |

### 2.3 Network Topology

```
                       ┌─────────────┐
                       │   Firewall  │
                       │   (UFW)     │
                       └──────┬──────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐           ┌────▼────┐          ┌────▼────┐
   │  80/443 │           │  5678   │          │  22     │
   │  HTTP/S │           │  n8n    │          │  SSH    │
   └─────────┘           └─────────┘          └─────────┘
       │                       │                    │
       │               (Docker Network)     (Admin Access)
       │                       │                    │
   ┌───▼───────────────────────▼────────────────────▼───┐
   │              Internal Services                      │
   │  PostgreSQL: localhost:5433                         │
   │  Redis: localhost:6379                              │
   │  Next.js: localhost:3001                            │
   └─────────────────────────────────────────────────────┘
```

---

## 3. Prerequisites

### 3.1 Required Software

Before deployment, ensure the following are installed on the server:

```bash
# Node.js 20+ and npm
node --version  # Should be v20.x or higher
npm --version   # Should be 10.x or higher

# PM2 (process manager)
pm2 --version

# PostgreSQL
psql --version  # Should be 15.x or higher

# Redis
redis-cli --version  # Should be 7.x or higher

# Docker and Docker Compose (for n8n)
docker --version
docker-compose --version

# Caddy (web server)
caddy version
```

### 3.2 Required Access

- **SSH Key:** `~/.ssh/id_ed25519` with access to `root@137.184.31.207`
- **Git Access:** SSH key added to GitHub repository
- **Domain DNS:** A records pointing to server IP
  - `astralisone.com → 137.184.31.207`
  - `www.astralisone.com → 137.184.31.207`
  - `automation.astralisone.com → 137.184.31.207`
- **External Services:** API keys for OpenAI, Anthropic, Twilio, etc.

### 3.3 Local Development Requirements

```bash
# Install dependencies locally before deploying
npm install --legacy-peer-deps

# Test build locally
npm run build

# Verify linting
npm run lint

# Run E2E tests (optional but recommended)
npm run test:e2e
```

---

## 4. Initial Server Setup

This section covers first-time server configuration. Skip if server is already configured.

### 4.1 System Updates

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential ufw
```

### 4.2 Install Node.js 20

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

# Verify installation
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 4.3 Install PM2 Globally

```bash
# Install PM2 as global package
npm install -g pm2

# Configure PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions

# Verify PM2 is running
pm2 --version
```

### 4.4 Install PostgreSQL

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install PostgreSQL 15
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE astralis;
CREATE USER gregorystarr WITH PASSWORD 'p05tgr355P455!';
GRANT ALL PRIVILEGES ON DATABASE astralis TO gregorystarr;
ALTER DATABASE astralis OWNER TO gregorystarr;
\q
EOF
```

**Note:** Change the database name, username, and password to match your `.env.local.template` configuration.

### 4.5 Install Redis

```bash
# Install Redis server
sudo apt install -y redis-server

# Configure Redis to use password authentication
sudo sed -i 's/# requirepass foobared/requirepass astralisRedis2024/' /etc/redis/redis.conf

# Enable Redis to start on boot
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG (or AUTH error if password is set)
redis-cli -a astralisRedis2024 ping  # Should return PONG
```

### 4.6 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (optional, for non-root access)
sudo usermod -aG docker $USER

# Install Docker Compose V2
sudo apt install -y docker-compose-plugin

# Verify installations
docker --version
docker compose version

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 4.7 Install Caddy Web Server

```bash
# Install dependencies
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https

# Add Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Update and install Caddy
sudo apt update
sudo apt install -y caddy

# Verify Caddy is running
sudo systemctl status caddy
caddy version
```

### 4.8 Configure Firewall (UFW)

```bash
# Enable UFW firewall
sudo ufw --force enable

# Allow SSH (critical - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow n8n (if direct access needed)
sudo ufw allow 5678/tcp

# Verify firewall status
sudo ufw status verbose
```

**Expected Output:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
5678/tcp                   ALLOW       Anywhere
```

### 4.9 Configure Caddy

```bash
# Create Caddy configuration directory
sudo mkdir -p /etc/caddy

# Copy Caddyfile to server (from project root)
# Option 1: Copy from local machine
scp -i ~/.ssh/id_ed25519 Caddyfile root@137.184.31.207:/etc/caddy/Caddyfile

# Option 2: Create directly on server
sudo nano /etc/caddy/Caddyfile
# Paste contents from project's Caddyfile

# Validate Caddy configuration
caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy with new configuration
sudo systemctl reload caddy

# View Caddy logs to verify
sudo journalctl -u caddy -f
```

**Caddyfile Configuration Highlights:**

- **Automatic HTTPS:** Let's Encrypt certificates automatically provisioned
- **Security Headers:** HSTS, XSS protection, content type options
- **Health Checks:** `/api/health` endpoint monitored every 30s
- **WebSocket Support:** Required for Next.js HMR and n8n editor
- **Extended Timeouts:** 5-minute timeouts for long AI operations
- **Logging:** JSON logs to `/var/log/caddy/astralisone.log`

### 4.10 Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /home/deploy
cd /home/deploy

# Clone repository (requires SSH key)
git clone git@github.com:astralisone/astralis-nextjs.git
cd astralis-nextjs

# Verify correct branch
git branch  # Should show current branch
git status  # Should be clean
```

---

## 5. Environment Configuration

### 5.1 Create Production Environment File

```bash
# Navigate to project directory
cd /home/deploy/astralis-nextjs

# Copy template to production environment file
cp .env.local.template .env.production

# Edit environment file with production values
nano .env.production
```

### 5.2 Required Environment Variables

#### Database and Authentication

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://gregorystarr:p05tgr355P455!@localhost:5433/astralis"

# NextAuth.js configuration
NEXTAUTH_SECRET="your-generated-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://astralisone.com"
```

#### Redis and Queue System

```bash
# Redis connection for BullMQ
REDIS_URL="redis://:astralisRedis2024@localhost:6379"
REDIS_PASSWORD="astralisRedis2024"
REDIS_PORT=6379
```

#### Application Settings

```bash
# Node environment
NODE_ENV="production"

# Application port (proxied by Caddy)
APP_PORT=3001

# Public API URL
NEXT_PUBLIC_API_BASE_URL="https://astralisone.com/api"
```

#### Email (SMTP)

```bash
# Brevo SMTP credentials
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="Astralis One"
SMTP_FROM_EMAIL="no-reply@astralisone.com"
SMTP_SECURE=false
BREVO_API_KEY="your-brevo-api-key"
SYSTEM_NOTIFICATION_EMAIL="gregory.a.starr@gmail.com"
```

#### AI Services

```bash
# OpenAI API
OPENAI_API_KEY="sk-proj-..."
VISION_MODEL="gpt-4-vision-preview"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Alternative AI provider (xAI Grok)
GROK_API_KEY="xai-..."
GROK_COMPLETIONS_URL="https://api.x.ai/v1/chat/completions"
USE_OPENAI_FALLBACK=true
```

#### DigitalOcean Spaces (S3-compatible storage)

```bash
SPACES_ACCESS_KEY="DO00EFT8GE4WBBXWP32Z"
SPACES_SECRET_KEY="your-secret-key-here"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralisone-documents"
SPACES_CDN_URL="https://astralisone-documents.nyc3.cdn.digitaloceanspaces.com"

# File upload settings
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
OCR_LANGUAGE="eng"
```

#### n8n Automation

```bash
# n8n configuration
N8N_HOST="localhost"
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_API_KEY="your-n8n-api-key"
N8N_BASE_URL="137.184.31.207:5678"
N8N_WEBHOOK_URL="137.184.31.207:5678/"
N8N_WEBHOOK_TUNNEL_URL="137.184.31.207:5678/"
N8N_ENCRYPTION_KEY="your-64-character-hex-encryption-key"
N8N_BASIC_AUTH_USER="gstarrltd"
N8N_BASIC_AUTH_PASSWORD="5t4rrCl0ud"
```

#### Google Services

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# Google Analytics 4
NEXT_PUBLIC_GA_TRACKING_ID="G-49DWRM7K4G"
```

#### Twilio (SMS/Voice)

```bash
TWILIO_ACCOUNT_SID="AC04a6faa9b27f37171b7206af0feb2d77"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+15188887827"
FALLBACK_PHONE_NUMBER="+1987654321"
TWILIO_API_KEY_SID="SK3a03abb4051370e19bb96b4a3e372660"
TWILIO_API_KEY_SECRET="your-api-key-secret"
```

#### Default IDs (Create after first deployment)

```bash
# These will be generated after database seeding
DEFAULT_USER_ID="will-be-generated"
DEFAULT_ORG_ID="will-be-generated"
```

### 5.3 Secure Environment File

```bash
# Restrict permissions (readable only by owner)
chmod 600 .env.production

# Verify ownership
chown root:root .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- 1 root root
```

### 5.4 Load Environment Variables

For PM2, environment variables are loaded automatically from `.env.production` when using the ecosystem configuration. Verify this is set correctly in your PM2 ecosystem file.

---

## 6. Deployment Process

### 6.1 Automated Deployment (Recommended)

The project includes an automated deployment script that handles the entire process.

#### Using the Deploy Script

```bash
# From your local machine (not the server)
./scripts/deploy.sh -y
```

The script performs:
1. **Pre-flight checks:** SSH connectivity, git status
2. **Server connection:** SSH to 137.184.31.207
3. **Code update:** `git pull origin main`
4. **Dependencies:** `npm install --legacy-peer-deps`
5. **Database migrations:** `npx prisma migrate deploy`
6. **Build:** `npm run build`
7. **Container restart:** `docker-compose up -d --build`
8. **Health checks:** Verify services are responding

#### Script Options

```bash
# Auto-confirm all prompts
./scripts/deploy.sh -y

# Verbose output
./scripts/deploy.sh

# View script help
./scripts/deploy.sh --help
```

### 6.2 Manual Deployment Steps

If you prefer manual control or the script fails:

#### Step 1: SSH to Server

```bash
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs
```

#### Step 2: Pull Latest Code

```bash
# Stash any local changes (if needed)
git stash

# Pull from main branch
git pull origin main

# View recent commits
git log --oneline -5
```

#### Step 3: Install Dependencies

```bash
# Install npm packages
npm install --legacy-peer-deps

# This may take 2-5 minutes depending on changes
```

#### Step 4: Generate Prisma Client

```bash
# Generate Prisma client from schema
npx prisma generate

# Expected output: "Generated Prisma Client to ./node_modules/@prisma/client"
```

#### Step 5: Run Database Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Expected output: "Database schema is up to date!"
```

**Important:** Always review migrations before applying to production:

```bash
# View pending migrations
ls -la prisma/migrations/

# Review migration SQL
cat prisma/migrations/[migration-folder]/migration.sql
```

#### Step 6: Build Production Bundle

```bash
# Build Next.js application with increased memory
NODE_OPTIONS='--max-old-space-size=4096' npm run build

# This creates optimized production build in .next/ folder
# Build typically takes 1-3 minutes
```

**Build Output Verification:**
- Check for any TypeScript errors
- Verify route compilation
- Ensure static pages are generated

#### Step 7: Restart Services

```bash
# Option A: Restart PM2 processes (zero-downtime)
pm2 reload ecosystem.config.js

# Option B: Full restart (brief downtime)
pm2 restart ecosystem.config.js

# Option C: Start from scratch
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

#### Step 8: Restart Docker Containers

```bash
# Rebuild and restart n8n and related services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# View container status
docker ps

# View n8n logs
docker logs astralis_n8n --tail 50 -f
```

#### Step 9: Reload Caddy

```bash
# Reload Caddy configuration (zero-downtime)
sudo systemctl reload caddy

# Verify Caddy status
sudo systemctl status caddy

# Check for configuration errors
sudo journalctl -u caddy -n 50 --no-pager
```

### 6.3 Post-Deployment Verification

#### Check Application Health

```bash
# Test main application
curl -I https://astralisone.com
# Expected: HTTP/2 200

# Test health endpoint
curl https://astralisone.com/api/health | jq
# Expected: JSON response with status: "healthy"

# Test n8n automation
curl -I https://automation.astralisone.com
# Expected: HTTP/2 200
```

#### Verify PM2 Processes

```bash
pm2 list
```

**Expected Output:**
```
┌─────┬─────────────────┬─────┬─────┬────────┬───────┐
│ id  │ name            │ mode│ ↺   │ status │ cpu   │
├─────┼─────────────────┼─────┼─────┼────────┼───────┤
│ 0   │ astralis-nextjs │ fork│ 0   │ online │ 2%    │
│ 1   │ astralis-worker │ fork│ 0   │ online │ 1%    │
└─────┴─────────────────┴─────┴─────┴────────┴───────┘
```

#### Check Database Connection

```bash
# Test database connectivity
npx prisma db execute --stdin <<< "SELECT NOW();"

# Expected output: Current timestamp
```

#### Verify Redis Connection

```bash
# Ping Redis
redis-cli -a astralisRedis2024 ping
# Expected: PONG

# Check Redis info
redis-cli -a astralisRedis2024 info server
```

#### Monitor Application Logs

```bash
# PM2 application logs (live tail)
pm2 logs astralis-nextjs --lines 50

# PM2 worker logs
pm2 logs astralis-worker --lines 50

# Caddy access logs
sudo tail -f /var/log/caddy/astralisone.log

# System logs
sudo journalctl -xe
```

### 6.4 Database Seeding (Initial Setup Only)

For first-time deployments, seed the database with initial data:

```bash
# Run main seed script
npx prisma db seed

# Seed pipeline stages
npm run seed:pipelines

# Seed task templates
npm run seed:templates
```

**Note:** Save the generated `DEFAULT_USER_ID` and `DEFAULT_ORG_ID` and add them to `.env.production`.

---

## 7. PM2 Process Management

### 7.1 Ecosystem Configuration

The `ecosystem.config.js` file defines two PM2 processes:

#### Process 1: Next.js Application

```javascript
{
  name: 'astralis-nextjs',
  script: 'npm',
  args: 'run start',
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  error_file: '/var/log/pm2/astralis-error.log',
  out_file: '/var/log/pm2/astralis-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
}
```

**Key Settings:**
- **max_memory_restart:** Restart if memory exceeds 1GB
- **autorestart:** Automatically restart on crashes
- **watch:** Disabled for production (prevents unnecessary restarts)

#### Process 2: Background Worker

```javascript
{
  name: 'astralis-worker',
  script: 'npm',
  args: 'run worker',
  cwd: '/home/deploy/astralis-nextjs',
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  watch: false,
  max_memory_restart: '512M',
  error_file: '/var/log/pm2/astralis-worker-error.log',
  out_file: '/var/log/pm2/astralis-worker-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
}
```

**Key Settings:**
- **cwd:** Explicit working directory
- **max_memory_restart:** 512MB limit (worker uses less memory)

### 7.2 PM2 Commands Reference

#### Starting Processes

```bash
# Start all processes from ecosystem file
pm2 start ecosystem.config.js

# Start specific process
pm2 start ecosystem.config.js --only astralis-nextjs

# Start with specific environment
pm2 start ecosystem.config.js --env production

# Save PM2 process list (persists across reboots)
pm2 save
```

#### Restarting Processes

```bash
# Zero-downtime reload (recommended)
pm2 reload ecosystem.config.js

# Hard restart (brief downtime)
pm2 restart ecosystem.config.js

# Restart specific process
pm2 restart astralis-nextjs

# Restart and update environment variables
pm2 restart ecosystem.config.js --update-env
```

#### Stopping Processes

```bash
# Stop all processes
pm2 stop ecosystem.config.js

# Stop specific process
pm2 stop astralis-nextjs

# Delete process from PM2
pm2 delete astralis-nextjs

# Delete all processes
pm2 delete all
```

#### Monitoring and Logs

```bash
# List all processes with status
pm2 list

# Real-time monitoring dashboard
pm2 monit

# View logs (all processes)
pm2 logs

# View logs for specific process
pm2 logs astralis-nextjs

# View last 100 lines
pm2 logs astralis-nextjs --lines 100

# View only error logs
pm2 logs astralis-nextjs --err

# Clear all logs
pm2 flush
```

#### Process Information

```bash
# Detailed info for specific process
pm2 show astralis-nextjs

# Process metrics
pm2 describe astralis-nextjs

# View environment variables
pm2 env 0  # 0 is the process ID
```

### 7.3 PM2 Startup Configuration

Ensure PM2 starts automatically on server reboot:

```bash
# Generate startup script
pm2 startup systemd

# Follow the output instructions (will ask for sudo)
# Example output:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# After starting your processes, save the list
pm2 save

# Verify startup is configured
systemctl status pm2-root
```

### 7.4 Log Rotation

PM2 has built-in log rotation, but you can also use `pm2-logrotate`:

```bash
# Install PM2 log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

**Manual log rotation:**

```bash
# Rotate logs manually
pm2 reloadLogs

# View log rotation configuration
pm2 conf pm2-logrotate
```

### 7.5 PM2 Health Monitoring

Set up PM2 Plus for advanced monitoring (optional):

```bash
# Link to PM2 Plus (free tier available)
pm2 link <secret_key> <public_key>

# Enable monitoring
pm2 web
```

Visit https://app.pm2.io for web dashboard.

---

## 8. Monitoring and Observability

### 8.1 Application Health Checks

#### Built-in Health Endpoint

**Endpoint:** `GET /api/health`

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "uptime": {
    "seconds": 86400,
    "formatted": "1d 0h 0m 0s"
  },
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": {
      "status": "connected",
      "latency": 5
    },
    "redis": {
      "status": "connected"
    }
  },
  "apis": {
    "total": 45,
    "byCategory": {
      "intake": 3,
      "pipeline": 5,
      "automation": 4
    }
  },
  "serverLogs": {
    "path": "/var/log/pm2/astralis-*.log",
    "description": "PM2 application logs on production server"
  }
}
```

**Test Health:**
```bash
curl https://astralisone.com/api/health | jq
```

#### Automated Monitoring Script

Create a monitoring script at `/usr/local/bin/check-astralis.sh`:

```bash
#!/bin/bash

HEALTH_URL="https://astralisone.com/api/health"
ALERT_EMAIL="gregory.a.starr@gmail.com"

# Check health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$RESPONSE" != "200" ]; then
  echo "ALERT: Astralis health check failed with HTTP $RESPONSE" | \
    mail -s "Astralis Health Alert" "$ALERT_EMAIL"
fi
```

Make executable and add to crontab:

```bash
chmod +x /usr/local/bin/check-astralis.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add line:
# */5 * * * * /usr/local/bin/check-astralis.sh
```

### 8.2 Log Management

#### Log Locations

| Component | Log Path | Rotation |
|-----------|----------|----------|
| PM2 App | /var/log/pm2/astralis-out.log | PM2 logrotate |
| PM2 App Errors | /var/log/pm2/astralis-error.log | PM2 logrotate |
| PM2 Worker | /var/log/pm2/astralis-worker-out.log | PM2 logrotate |
| PM2 Worker Errors | /var/log/pm2/astralis-worker-error.log | PM2 logrotate |
| Caddy | /var/log/caddy/astralisone.log | Caddy (100MB, 10 files) |
| n8n | Docker logs (container) | Docker driver |
| PostgreSQL | /var/log/postgresql/ | logrotate |
| Redis | /var/log/redis/redis-server.log | logrotate |

#### Viewing Logs

```bash
# PM2 logs (live tail)
pm2 logs astralis-nextjs --lines 100

# PM2 logs (all)
pm2 logs --lines 200

# Caddy logs (live tail)
sudo tail -f /var/log/caddy/astralisone.log | jq

# Caddy logs (last 100 lines, formatted)
sudo tail -100 /var/log/caddy/astralisone.log | jq -r '[.ts, .status, .request.method, .request.uri] | @tsv'

# n8n logs
docker logs astralis_n8n --tail 100 -f

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Redis logs
sudo journalctl -u redis-server -f

# System logs
sudo journalctl -xe
```

#### Log Analysis

```bash
# Count HTTP status codes in Caddy logs (last 1000 requests)
sudo tail -1000 /var/log/caddy/astralisone.log | jq -r '.status' | sort | uniq -c

# Find errors in PM2 logs
grep -i "error" /var/log/pm2/astralis-error.log | tail -20

# Find slow requests in Caddy logs (>1 second)
sudo cat /var/log/caddy/astralisone.log | jq 'select(.duration > 1000)'

# Monitor database queries in real-time
sudo tail -f /var/log/postgresql/postgresql-15-main.log | grep "duration"
```

### 8.3 Performance Monitoring

#### PM2 Real-time Monitoring

```bash
# Interactive monitoring dashboard
pm2 monit

# Process resource usage
pm2 list
```

#### System Resource Monitoring

```bash
# CPU and memory usage
htop

# Disk usage
df -h

# Disk I/O
iostat -x 1

# Network connections
netstat -tulpn | grep -E '(3001|5678|5433|6379)'

# Active connections to Next.js
ss -ant | grep 3001 | wc -l
```

#### Database Performance

```bash
# Connect to PostgreSQL
psql postgresql://gregorystarr:p05tgr355P455!@localhost:5433/astralis

# View active connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

# View slow queries (>1 second)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '1 second';

# Database size
SELECT pg_size_pretty(pg_database_size('astralis'));

# Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

#### Redis Monitoring

```bash
# Redis info
redis-cli -a astralisRedis2024 info

# Monitor Redis commands in real-time
redis-cli -a astralisRedis2024 monitor

# Check queue sizes (BullMQ)
redis-cli -a astralisRedis2024 keys "bull:*"

# Memory usage
redis-cli -a astralisRedis2024 info memory
```

### 8.4 Error Tracking and Alerting

#### Email Alerts on Critical Errors

Add to PM2 ecosystem for email notifications:

```javascript
error_file: '/var/log/pm2/astralis-error.log',
max_memory_restart: '1G',
on_error: function() {
  // Send email notification
}
```

#### Integration with External Services

Consider integrating:
- **Sentry:** Error tracking and performance monitoring
- **Datadog:** Full-stack observability
- **New Relic:** Application performance monitoring
- **UptimeRobot:** Uptime monitoring and alerts

---

## 9. Backup and Recovery

### 9.1 Database Backups

#### Automated Daily Backups

Create backup script at `/usr/local/bin/backup-astralis-db.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/deploy/backups/database"
DB_NAME="astralis"
DB_USER="gregorystarr"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup with compression
PGPASSWORD='p05tgr355P455!' pg_dump -h localhost -p 5433 -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_FILE"

  # Upload to DigitalOcean Spaces (optional)
  # s3cmd put "$BACKUP_FILE" s3://astralisone-backups/database/

  # Delete backups older than retention period
  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
else
  echo "Backup failed!" >&2
  exit 1
fi
```

Make executable and schedule:

```bash
chmod +x /usr/local/bin/backup-astralis-db.sh

# Add to root's crontab (daily at 2 AM)
sudo crontab -e
# Add line:
# 0 2 * * * /usr/local/bin/backup-astralis-db.sh >> /var/log/astralis-backup.log 2>&1
```

#### Manual Database Backup

```bash
# Create backup directory
mkdir -p /home/deploy/backups/database

# Backup with compression
PGPASSWORD='p05tgr355P455!' pg_dump -h localhost -p 5433 -U gregorystarr astralis | gzip > /home/deploy/backups/database/astralis_$(date +%Y%m%d).sql.gz

# Verify backup
ls -lh /home/deploy/backups/database/
```

### 9.2 Database Recovery

#### Restore from Backup

```bash
# Stop application first
pm2 stop ecosystem.config.js

# Drop existing database (DESTRUCTIVE!)
PGPASSWORD='p05tgr355P455!' dropdb -h localhost -p 5433 -U gregorystarr astralis

# Create fresh database
PGPASSWORD='p05tgr355P455!' createdb -h localhost -p 5433 -U gregorystarr astralis

# Restore from compressed backup
gunzip -c /home/deploy/backups/database/astralis_20251202.sql.gz | \
  PGPASSWORD='p05tgr355P455!' psql -h localhost -p 5433 -U gregorystarr astralis

# Regenerate Prisma client
npx prisma generate

# Restart application
pm2 start ecosystem.config.js
```

### 9.3 File Backups

#### Application Code

```bash
# Backup application directory (excluding node_modules)
tar -czf /home/deploy/backups/astralis-nextjs_$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  /home/deploy/astralis-nextjs
```

#### Environment Files

```bash
# Backup environment configuration (encrypted)
gpg --symmetric --cipher-algo AES256 .env.production
mv .env.production.gpg /home/deploy/backups/env/
```

#### Uploaded Documents

Documents are stored in DigitalOcean Spaces, which has built-in redundancy. Enable versioning for additional protection:

```bash
# Using s3cmd
s3cmd setversioning s3://astralisone-documents/ --enable
```

### 9.4 Disaster Recovery Plan

#### Complete System Recovery Steps

1. **Provision new server** with same specifications
2. **Install all dependencies** (Section 4)
3. **Restore database** from latest backup
4. **Clone repository** from GitHub
5. **Restore environment files** from encrypted backup
6. **Run migrations** (if any pending)
7. **Start services** (PM2, Docker, Caddy)
8. **Update DNS** (if IP changed)
9. **Verify health checks** pass

#### Recovery Time Objective (RTO)

- **Database restore:** 5-15 minutes (depending on size)
- **Application deployment:** 10-20 minutes
- **Full system rebuild:** 1-2 hours

#### Recovery Point Objective (RPO)

- **Database:** 24 hours (daily backups)
- **Application code:** Near-zero (Git version control)
- **Uploaded files:** Near-zero (DigitalOcean Spaces redundancy)

---

## 10. Troubleshooting

### 10.1 Common Deployment Issues

#### Issue: SSH Connection Failed

**Symptoms:**
```
ssh: connect to host 137.184.31.207 port 22: Connection refused
```

**Solutions:**
```bash
# Check if server is reachable
ping 137.184.31.207

# Check SSH key permissions
chmod 600 ~/.ssh/id_ed25519

# Try with verbose output
ssh -v -i ~/.ssh/id_ed25519 root@137.184.31.207

# Check firewall rules on server
sudo ufw status
```

#### Issue: Build Fails with Out of Memory

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solutions:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS='--max-old-space-size=4096' npm run build

# If still failing, upgrade server RAM or build locally
npm run build  # On local machine
rsync -avz .next/ root@137.184.31.207:/home/deploy/astralis-nextjs/.next/
```

#### Issue: Database Migration Fails

**Symptoms:**
```
Error: P1001: Can't reach database server at localhost:5433
```

**Solutions:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection manually
psql postgresql://gregorystarr:p05tgr355P455!@localhost:5433/astralis

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Issue: PM2 Process Crashes Immediately

**Symptoms:**
```
pm2 list
# Shows status: "errored" or "stopped"
```

**Solutions:**
```bash
# View error logs
pm2 logs astralis-nextjs --err --lines 50

# Check for port conflicts
sudo lsof -i :3001

# Verify environment variables
pm2 env 0

# Delete and recreate process
pm2 delete astralis-nextjs
pm2 start ecosystem.config.js
pm2 save
```

### 10.2 Service-Specific Issues

#### PostgreSQL Connection Errors

```bash
# Check PostgreSQL is listening on correct port
sudo netstat -tlnp | grep 5433

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
PGPASSWORD='p05tgr355P455!' psql -h localhost -p 5433 -U gregorystarr -d astralis -c "SELECT version();"
```

#### Redis Connection Errors

```bash
# Check Redis is running
sudo systemctl status redis-server

# Test Redis connection
redis-cli -a astralisRedis2024 ping

# Check Redis logs
sudo journalctl -u redis-server -n 50

# Restart Redis
sudo systemctl restart redis-server

# Check Redis configuration
sudo cat /etc/redis/redis.conf | grep -E '(bind|port|requirepass)'
```

#### Caddy Configuration Errors

```bash
# Validate Caddyfile
caddy validate --config /etc/caddy/Caddyfile

# Check Caddy logs for errors
sudo journalctl -u caddy -n 100 --no-pager

# Test Caddy with specific config
caddy run --config /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy

# Check Caddy status
sudo systemctl status caddy
```

#### Docker/n8n Issues

```bash
# Check Docker daemon
sudo systemctl status docker

# View all containers
docker ps -a

# Check n8n logs
docker logs astralis_n8n --tail 100

# Restart n8n container
docker-compose restart n8n

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Check Docker network
docker network ls
docker network inspect astralis-network
```

### 10.3 Performance Issues

#### High Memory Usage

```bash
# Check memory usage
free -h

# Check which process is using memory
ps aux --sort=-%mem | head

# Restart PM2 processes to clear memory leaks
pm2 reload ecosystem.config.js

# Clear PM2 logs (can consume disk space)
pm2 flush
```

#### High CPU Usage

```bash
# Check CPU usage
top -o %CPU

# Check PM2 process CPU
pm2 monit

# Identify slow database queries
psql postgresql://gregorystarr:p05tgr355P455!@localhost:5433/astralis -c \
  "SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state = 'active'
   ORDER BY duration DESC;"
```

#### Slow Response Times

```bash
# Check Caddy logs for slow requests
sudo cat /var/log/caddy/astralisone.log | jq 'select(.duration > 5000)'

# Check PM2 logs for performance warnings
pm2 logs astralis-nextjs | grep -i "slow\|performance"

# Monitor Redis latency
redis-cli -a astralisRedis2024 --latency

# Check disk I/O
iostat -x 1 5
```

#### Disk Space Issues

```bash
# Check disk usage
df -h

# Find large files
du -h /home/deploy | sort -rh | head -20

# Clean up old logs
pm2 flush
sudo journalctl --vacuum-time=7d

# Clean up Docker images
docker system prune -a

# Clear npm cache
npm cache clean --force

# Remove old backups
find /home/deploy/backups -mtime +30 -delete
```

### 10.4 SSL/HTTPS Issues

#### Certificate Errors

```bash
# Check Caddy logs for certificate issues
sudo journalctl -u caddy | grep -i "certificate\|acme"

# Force certificate renewal
sudo systemctl restart caddy

# Check certificate expiration
echo | openssl s_client -connect astralisone.com:443 2>/dev/null | openssl x509 -noout -dates

# View Caddy certificate storage
sudo ls -la /var/lib/caddy/certificates/
```

### 10.5 Application-Specific Errors

#### "Cannot find module" Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Rebuild Next.js
npm run build

# Regenerate Prisma client
npx prisma generate
```

#### NextAuth Session Errors

```bash
# Check NEXTAUTH_SECRET is set
grep NEXTAUTH_SECRET .env.production

# Regenerate secret if needed
openssl rand -base64 32

# Clear Redis sessions
redis-cli -a astralisRedis2024 FLUSHDB

# Restart application
pm2 restart astralis-nextjs
```

#### Email Sending Failures

```bash
# Check SMTP credentials
grep SMTP .env.production

# Test SMTP connection
telnet smtp-relay.brevo.com 587

# Check PM2 logs for email errors
pm2 logs astralis-worker | grep -i "email\|smtp"

# Verify Nodemailer configuration
# Check src/lib/email.ts
```

---

## 11. Scaling Strategies

### 11.1 Vertical Scaling (Scale Up)

Increase server resources without architectural changes.

#### Upgrade Droplet Size

```bash
# From DigitalOcean dashboard:
# 1. Power off droplet
# 2. Resize to larger plan
# 3. Power on droplet

# Recommended progression:
# Current: 4 vCPU / 8GB RAM
# Next tier: 8 vCPU / 16GB RAM
# Enterprise: 16 vCPU / 32GB RAM
```

#### Optimize PM2 for More Resources

```javascript
// ecosystem.config.js
{
  name: 'astralis-nextjs',
  instances: 4,  // Use multiple CPU cores
  exec_mode: 'cluster',  // Enable cluster mode
  max_memory_restart: '2G'  // Increase memory limit
}
```

### 11.2 Horizontal Scaling (Scale Out)

Add more servers for redundancy and load distribution.

#### Load Balancer Architecture

```
                    ┌──────────────┐
                    │ Load Balancer│
                    │  (DO LB)     │
                    └──────┬───────┘
                           │
        ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
        ┃                                      ┃
┌───────▼────────┐                  ┌──────────▼───────┐
│   App Server 1 │                  │   App Server 2   │
│  137.184.31.207│                  │  <new-ip>        │
│  - Next.js     │                  │  - Next.js       │
│  - Worker      │                  │  - Worker        │
└───────┬────────┘                  └──────────┬───────┘
        │                                      │
        └──────────────┬───────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   Shared Services     │
           │  - PostgreSQL (RDS)   │
           │  - Redis (Managed)    │
           │  - DigitalOcean Spaces│
           └───────────────────────┘
```

#### Setup Steps

1. **Deploy additional server(s)** with identical configuration
2. **Use managed PostgreSQL** (DigitalOcean Managed Database)
3. **Use managed Redis** (DigitalOcean Managed Redis)
4. **Configure DigitalOcean Load Balancer** to distribute traffic
5. **Update environment variables** to point to managed services

### 11.3 Database Scaling

#### Read Replicas

```bash
# Configure read replica in PostgreSQL
# Update DATABASE_URL for read operations
DATABASE_URL_READ="postgresql://user:pass@read-replica:5432/astralis"
```

#### Connection Pooling

```bash
# Install PgBouncer
sudo apt install pgbouncer

# Configure connection pooling
# Edit /etc/pgbouncer/pgbouncer.ini
```

#### Database Sharding (Advanced)

For very large datasets, consider sharding by organization ID.

### 11.4 Caching Strategies

#### Redis Caching

Already implemented via BullMQ. Expand caching:

```typescript
// Cache API responses
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache for 5 minutes
await redis.setex(`cache:${key}`, 300, JSON.stringify(data));
```

#### CDN for Static Assets

```bash
# Use DigitalOcean Spaces CDN
# Already configured via SPACES_CDN_URL
```

### 11.5 Queue Scaling

#### Multiple Worker Instances

```javascript
// ecosystem.config.js
{
  name: 'astralis-worker',
  instances: 4,  // Run 4 worker processes
  exec_mode: 'fork'
}
```

#### Dedicated Queue Workers

Separate heavy processing to dedicated servers:

```bash
# Worker Server 1: OCR and embeddings
# Worker Server 2: Email sending
# Worker Server 3: Document processing
```

---

## 12. Security Hardening

### 12.1 Server Hardening

#### SSH Security

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Disable password authentication
# Set: PasswordAuthentication no

# Allow only specific users
# Add: AllowUsers deploy

# Restart SSH
sudo systemctl restart ssh
```

#### Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### Fail2Ban (Intrusion Prevention)

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local
# Ensure SSH jail is enabled

# Restart Fail2Ban
sudo systemctl restart fail2ban

# Check banned IPs
sudo fail2ban-client status sshd
```

### 12.2 Application Security

#### Environment Variable Protection

```bash
# Restrict environment file permissions
chmod 600 .env.production

# Never commit environment files
echo ".env*" >> .gitignore

# Use secrets management for production
# Consider: HashiCorp Vault, AWS Secrets Manager
```

#### API Rate Limiting

Implement in Next.js middleware:

```typescript
// middleware.ts
import { rateLimiter } from './lib/rate-limiter';

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success } = await rateLimiter.limit(ip);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

#### Input Validation

All API routes use Zod schemas for validation (already implemented).

#### SQL Injection Prevention

Prisma ORM automatically prevents SQL injection (already implemented).

### 12.3 Network Security

#### Firewall Rules

```bash
# Review UFW rules
sudo ufw status numbered

# Remove unnecessary open ports
sudo ufw delete <rule-number>

# Only allow necessary services
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 5433/tcp  # Block external PostgreSQL access
sudo ufw deny 6379/tcp  # Block external Redis access
```

#### Restrict Database Access

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Only allow local connections
# host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 12.4 HTTPS and Certificates

#### Force HTTPS

Caddy automatically redirects HTTP to HTTPS (already configured).

#### HSTS (HTTP Strict Transport Security)

Already enabled in Caddyfile:

```
Strict-Transport-Security "max-age=15768000; includeSubDomains; preload"
```

#### Certificate Monitoring

```bash
# Check certificate expiration
echo | openssl s_client -connect astralisone.com:443 2>/dev/null | openssl x509 -noout -dates

# Set up expiration alerts (30 days before)
# Add to crontab:
# 0 0 * * * /usr/local/bin/check-cert-expiration.sh
```

### 12.5 Backup Security

```bash
# Encrypt backups
gpg --symmetric --cipher-algo AES256 backup.sql

# Upload encrypted backups to Spaces
s3cmd put backup.sql.gpg s3://astralisone-backups/

# Set lifecycle policy to delete old backups
# Via DigitalOcean dashboard or s3cmd
```

### 12.6 Monitoring and Alerting

#### Security Monitoring

```bash
# Monitor failed login attempts
sudo tail -f /var/log/auth.log | grep "Failed password"

# Check for suspicious processes
ps aux | grep -E '(nc|netcat|/dev/tcp)'

# Monitor open ports
sudo netstat -tulpn | grep LISTEN
```

#### Audit Logging

Enable audit logging for sensitive operations in application code.

### 12.7 Compliance Considerations

#### GDPR Compliance

- **Data encryption:** At rest (database encryption) and in transit (HTTPS)
- **Data retention:** Implement policies for deleting old data
- **User data export:** Provide API for users to export their data

#### Security Checklist

- [ ] SSH key-only authentication
- [ ] Firewall configured and enabled
- [ ] Automatic security updates enabled
- [ ] Database and Redis restricted to localhost
- [ ] HTTPS enforced with HSTS
- [ ] Environment variables secured
- [ ] Backups encrypted
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Fail2Ban configured
- [ ] Security headers configured in Caddy
- [ ] Regular security audits scheduled

---

## Appendix A: Quick Reference Commands

### Deployment

```bash
# Automated deployment
./scripts/deploy.sh -y

# Manual deployment
ssh root@137.184.31.207
cd /home/deploy/astralis-nextjs
git pull origin main
npm install --legacy-peer-deps
npx prisma migrate deploy
npm run build
pm2 reload ecosystem.config.js
docker-compose up -d --build
sudo systemctl reload caddy
```

### Service Management

```bash
# PM2
pm2 list
pm2 logs astralis-nextjs
pm2 restart astralis-nextjs
pm2 reload ecosystem.config.js

# Docker
docker ps
docker logs astralis_n8n
docker-compose restart n8n

# Caddy
sudo systemctl status caddy
sudo systemctl reload caddy
sudo journalctl -u caddy -f

# PostgreSQL
sudo systemctl status postgresql
psql postgresql://gregorystarr:p05tgr355P455!@localhost:5433/astralis

# Redis
redis-cli -a astralisRedis2024 ping
redis-cli -a astralisRedis2024 info
```

### Monitoring

```bash
# Health check
curl https://astralisone.com/api/health | jq

# PM2 monitoring
pm2 monit

# System resources
htop
df -h
iostat -x 1

# Logs
pm2 logs
sudo tail -f /var/log/caddy/astralisone.log | jq
docker logs astralis_n8n -f
```

### Troubleshooting

```bash
# Check all services
pm2 list
docker ps
sudo systemctl status postgresql redis-server caddy

# View errors
pm2 logs astralis-nextjs --err
sudo journalctl -xe

# Restart everything
pm2 restart all
docker-compose restart
sudo systemctl restart caddy postgresql redis-server
```

---

## Appendix B: Environment Variables Reference

See `.env.local.template` for complete list of environment variables with descriptions.

**Critical Production Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Production domain (https://astralisone.com)
- `OPENAI_API_KEY` - OpenAI API key for embeddings and chat
- `ANTHROPIC_API_KEY` - Claude API key
- `SMTP_*` - Email service credentials
- `SPACES_*` - DigitalOcean Spaces credentials

---

## Appendix C: Support and Documentation

### Related Documentation

- [README.md](../README.md) - Quick start guide
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Local development setup
- [CLAUDE.md](../CLAUDE.md) - Project overview for Claude Code
- [BOOKING_SETUP.md](./BOOKING_SETUP.md) - Email configuration

### External Resources

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **PM2:** https://pm2.keymetrics.io/docs
- **Caddy:** https://caddyserver.com/docs
- **n8n:** https://docs.n8n.io

### Contact and Support

- **Production Server:** 137.184.31.207
- **SSH Access:** `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- **Project Directory:** `/home/deploy/astralis-nextjs`
- **System Admin:** gregory.a.starr@gmail.com

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-02
**Maintained By:** Astralis One Documentation Agent
