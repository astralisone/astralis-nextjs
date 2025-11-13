# Feature Release Deployment Guide

This guide outlines the steps to deploy new features to the Astralis production environment on the Digital Ocean droplet.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Your Local Machine                         │
│  - Build Next.js (avoid server OOM)        │
│  - Deploy via rsync                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Droplet: 137.184.31.207                    │
│  ┌──────────────────────────────────────┐  │
│  │  PM2 Process Manager                  │  │
│  │  ├─ astralis-server (port 3000)       │  │
│  │  └─ astralis-frontend (port 3001 x2)  │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the `deploy-from-local.sh` script for automated deployment from your local machine.

**Prerequisites:**
- SSH key authentication configured
- Local environment has latest code

**Steps:**

```bash
# From your local machine in the project directory
./deploy-from-local.sh
```

This script automatically:
1. ✅ Builds Next.js locally
2. ✅ Syncs files to droplet via rsync
3. ✅ Installs production dependencies
4. ✅ Restarts PM2
5. ✅ Runs health checks

---

### Method 2: Manual Deployment

For granular control or troubleshooting.

#### Frontend Deployment

```bash
# 1. SSH into droplet
ssh root@137.184.31.207

# 2. Navigate to frontend directory
cd /root/projects/astralis-next

# 3. Pull latest code
git pull origin main

# 4. Install dependencies (use yarn as configured)
yarn install

# 5. Build Next.js (if server has enough RAM, otherwise build locally)
# Note: This may cause OOM on 2GB droplets - use Method 1 instead
npm run build

# 6. Restart frontend
pm2 restart astralis-frontend

# 7. Check status
pm2 status
pm2 logs astralis-frontend --lines 50
```

#### Backend Deployment

```bash
# 1. Navigate to backend directory
cd /root/projects/astralis-server/server

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
yarn install

# 4. Run database migrations (if any)
npx prisma migrate deploy
npx prisma generate

# 5. Build TypeScript to JavaScript
yarn build

# 6. Restart backend
pm2 restart astralis-server

# 7. Check status
pm2 status
pm2 logs astralis-server --lines 50
```

---

## Quick Reference Commands

### PM2 Process Management

```bash
# View all processes
pm2 list
pm2 status

# Restart specific service
pm2 restart astralis-frontend
pm2 restart astralis-server

# Restart all services
pm2 restart all

# Stop services
pm2 stop astralis-frontend
pm2 stop astralis-server

# View logs
pm2 logs                               # All logs (live)
pm2 logs astralis-frontend             # Frontend logs (live)
pm2 logs astralis-server               # Backend logs (live)
pm2 logs --lines 100 --nostream        # Last 100 lines (static)
pm2 logs astralis-frontend --err       # Error logs only

# Monitor resources
pm2 monit

# Process details
pm2 describe astralis-frontend
pm2 describe astralis-server

# Save PM2 configuration
pm2 save

# Delete all processes (use with caution)
pm2 delete all
```

### System Health Checks

```bash
# Check if services are responding
curl -I http://localhost:3001          # Frontend
curl -I http://localhost:3000/api/health  # Backend (if health endpoint exists)

# Check nginx status
sudo systemctl status nginx
sudo nginx -t                          # Test nginx config

# Check PostgreSQL
sudo systemctl status postgresql
psql -U astralis_user -d astralis_db -c "SELECT 1;"

# System resources
htop                                   # Interactive
free -h                                # Memory
df -h                                  # Disk space
```

### Git Operations

```bash
# View current status
git status
git log --oneline -10

# Pull latest changes
git pull origin main

# View what changed
git diff origin/main

# Revert to specific commit (emergency rollback)
git log --oneline -10                  # Find commit hash
git checkout <commit-hash>
pm2 restart all
```

---

## Environment Configuration

### Frontend Environment (.env.local)

Location: `/root/projects/astralis-next/.env.local`

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_here

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api

# Payment Providers
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend Environment (.env)

Location: `/root/projects/astralis-server/server/.env`

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Server
PORT=3000
NODE_ENV=production

# JWT & Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Payment Providers
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
STRIPE_SECRET_KEY=your_stripe_secret
```

---

## Troubleshooting

### Frontend Issues

**Problem: Frontend won't start**
```bash
# Check logs for errors
pm2 logs astralis-frontend --err

# Common issues:
# 1. TypeScript not installed
cd /root/projects/astralis-next
yarn add --exact --dev typescript

# 2. Dependencies missing
yarn install --legacy-peer-deps

# 3. Environment file missing
ls -la .env.local
cp .env.local.template .env.local  # If needed
```

**Problem: "Empty reply from server"**
```bash
# Frontend is starting but not ready yet
# Wait 30 seconds and try again
sleep 30 && curl -I http://localhost:3001
```

### Backend Issues

**Problem: Backend won't start**
```bash
# Check logs
pm2 logs astralis-server --err

# Common issues:
# 1. Database connection failed
sudo systemctl status postgresql
psql -U user -d dbname  # Test connection

# 2. Build missing or outdated
cd /root/projects/astralis-server/server
yarn build
pm2 restart astralis-server

# 3. Module not found errors
yarn install
npx prisma generate
yarn build
```

**Problem: Port 3000 already in use**
```bash
# Find process using port 3000
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000

# Kill the process (replace PID)
kill -9 <PID>
```

### Memory Issues

**Problem: Build process killed (OOM)**
```bash
# Check available memory
free -h

# Solution: Build locally instead
# Use deploy-from-local.sh script (Method 1)
```

**Problem: High memory usage**
```bash
# Check processes
pm2 monit
htop

# Restart services to free memory
pm2 restart all

# Consider reducing PM2 instances if needed
# Edit /root/ecosystem.config.cjs
# Change instances: 2 to instances: 1
pm2 reload /root/ecosystem.config.cjs
```

### Database Issues

**Problem: Migration failed**
```bash
# Check migration status
cd /root/projects/astralis-server/server
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

---

## Rollback Procedure

If a deployment causes issues:

```bash
# 1. Check recent commits
git log --oneline -10

# 2. Revert to last known good commit
git checkout <previous-commit-hash>

# 3. Rebuild (if needed)
yarn install
yarn build

# 4. Restart services
pm2 restart all

# 5. Verify health
curl -I http://localhost:3001
curl -I http://localhost:3000/api/health
```

---

## Deployment Checklist

Before deploying:
- [ ] Code reviewed and tested locally
- [ ] Database migrations tested
- [ ] Environment variables updated (if needed)
- [ ] Backup database (if schema changes)

During deployment:
- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Run migrations (backend only)
- [ ] Build applications
- [ ] Restart PM2

After deployment:
- [ ] Check PM2 status (`pm2 list`)
- [ ] Review logs (`pm2 logs --lines 50`)
- [ ] Test frontend (http://your-domain.com)
- [ ] Test backend API endpoints
- [ ] Monitor for errors (`pm2 logs`)

---

## Monitoring

### Application Logs

```bash
# Real-time monitoring
pm2 logs

# Last N lines
pm2 logs --lines 200 --nostream

# Error logs only
pm2 logs --err

# Specific service
pm2 logs astralis-frontend --lines 100
```

### System Logs

```bash
# Nginx access log
sudo tail -f /var/log/nginx/astralis_access.log

# Nginx error log
sudo tail -f /var/log/nginx/astralis_error.log

# PostgreSQL logs
sudo journalctl -u postgresql -n 50
```

### Performance Metrics

```bash
# CPU and memory usage
htop
top

# Disk usage
df -h
du -sh /root/projects/*

# Network connections
sudo netstat -an | grep ESTABLISHED | wc -l
```

---

## Security Notes

- **Never commit secrets** - Environment files should NOT be in git
- **Regular backups** - Database should be backed up before migrations
- **Keep updated** - Run `sudo apt update && sudo apt upgrade` monthly
- **Monitor logs** - Check for suspicious activity daily
- **SSL certificates** - Renew with `sudo certbot renew` (automatic via cron)

---

## Support

For issues:
1. Check PM2 logs: `pm2 logs --lines 100`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/astralis_error.log`
3. Check database: `sudo systemctl status postgresql`
4. Check system resources: `htop`, `free -h`, `df -h`

---

## File Locations

| Component | Location |
|-----------|----------|
| Frontend Code | `/root/projects/astralis-next` |
| Backend Code | `/root/projects/astralis-server/server` |
| PM2 Config | `/root/ecosystem.config.cjs` |
| Frontend Logs | `/root/logs/frontend-*.log` |
| Backend Logs | `/root/projects/astralis-server/server/logs/server-*.log` |
| Nginx Config | `/etc/nginx/sites-available/astralis` |
| SSL Certificates | `/etc/letsencrypt/live/your-domain.com/` |

---

## PM2 Configuration

The PM2 ecosystem configuration at `/root/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [
    {
      name: 'astralis-server',
      script: 'dist/index.js',
      cwd: '/root/projects/astralis-server/server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'astralis-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/root/projects/astralis-next',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

To reload configuration:
```bash
pm2 reload /root/ecosystem.config.cjs
```

---

**Last Updated:** 2025-11-13
**Server IP:** 137.184.31.207
**Maintainer:** Astralis Dev Team
