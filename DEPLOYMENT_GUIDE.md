# Digital Ocean Droplet Deployment Guide

**Last Updated:** 2025-11-13
**Droplet IP:** 137.184.31.207

## Directory Structure

### New Git-Based Structure
```
/home/deploy/
├── astralis-nextjs/          # Frontend (Next.js 15)
│   ├── .git/
│   ├── .next/                # Built files
│   ├── node_modules/
│   ├── src/
│   └── package.json
│
└── astralis-server/          # Backend (Express + Prisma)
    ├── .git/
    ├── server/
    │   ├── dist/             # Compiled TypeScript
    │   ├── src/
    │   └── package.json
    └── prisma/
```

### Old Structure (To Be Removed)
```
/root/projects/
├── astralis-next/            # Old frontend (rsync deployed)
└── astralis-server/          # Old backend
```

## GitHub Repositories

### Frontend
- **Repository:** https://github.com/astralisone/astralis-nextjs
- **Branch:** main
- **Latest Commit:** c602db9
- **Port:** 3001

### Backend
- **Repository:** https://github.com/astralisone/astralis-agency-server
- **Branch:** feature/nextjs-migration
- **Latest Commit:** e3958d7
- **Port:** 3000

## Initial Setup Commands

Run these commands on the droplet to prepare the environment:

### 1. Create Deploy Directory Structure
```bash
# Create deploy user home directory
mkdir -p /home/deploy
chown root:root /home/deploy
chmod 755 /home/deploy

# Create log directory for PM2
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2
```

### 2. Clone Repositories

#### Frontend (Next.js)
```bash
cd /home/deploy
git clone https://github.com/astralisone/astralis-nextjs.git
cd astralis-nextjs
git checkout main
```

#### Backend (Express)
```bash
cd /home/deploy
git clone https://github.com/astralisone/astralis-agency-server.git astralis-server
cd astralis-server
git checkout feature/nextjs-migration
```

### 3. Install Dependencies

#### Frontend
```bash
cd /home/deploy/astralis-nextjs
npm install
```

#### Backend
```bash
cd /home/deploy/astralis-server/server
npm install
```

### 4. Environment Variables

Ensure these files exist with proper configuration:

**Frontend:** `/home/deploy/astralis-nextjs/.env.local`
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here
```

**Backend:** `/home/deploy/astralis-server/server/.env`
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your-jwt-secret
```

### 5. Build Applications

#### Frontend
```bash
cd /home/deploy/astralis-nextjs
npm run build
```

#### Backend
```bash
cd /home/deploy/astralis-server/server
npm run build
```

### 6. Copy PM2 Configuration
```bash
# Copy the updated ecosystem config to /root/
cp /home/deploy/astralis-nextjs/ecosystem.production.cjs /root/ecosystem.config.cjs
```

### 7. Start Services with PM2

#### Stop old services (if running)
```bash
pm2 stop all
pm2 delete all
```

#### Start new services
```bash
pm2 start /root/ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

## Deployment Workflow (Git Pull Method)

### Update Frontend
```bash
# 1. Navigate to frontend directory
cd /home/deploy/astralis-nextjs

# 2. Pull latest changes
git pull origin main

# 3. Install any new dependencies
npm install

# 4. Build the application
npm run build

# 5. Restart PM2 service
pm2 restart astralis-frontend
```

### Update Backend
```bash
# 1. Navigate to backend directory
cd /home/deploy/astralis-server

# 2. Pull latest changes
git pull origin feature/nextjs-migration

# 3. Install any new dependencies
cd server
npm install

# 4. Build TypeScript
npm run build

# 5. Run database migrations (if needed)
cd ../prisma
npx prisma migrate deploy

# 6. Restart PM2 service
pm2 restart astralis-server
```

### Full Deployment (Both Services)
```bash
#!/bin/bash
# Full deployment script

echo "=== Deploying Backend ==="
cd /home/deploy/astralis-server
git pull origin feature/nextjs-migration
cd server
npm install
npm run build
cd ../prisma
npx prisma migrate deploy

echo "=== Deploying Frontend ==="
cd /home/deploy/astralis-nextjs
git pull origin main
npm install
npm run build

echo "=== Restarting Services ==="
pm2 restart all

echo "=== Deployment Complete ==="
pm2 status
```

## PM2 Management Commands

### Service Status
```bash
# View all services
pm2 status

# View logs (all services)
pm2 logs

# View specific service logs
pm2 logs astralis-frontend
pm2 logs astralis-server

# Monitor resources
pm2 monit
```

### Service Control
```bash
# Restart all services
pm2 restart all

# Restart specific service
pm2 restart astralis-frontend
pm2 restart astralis-server

# Stop all services
pm2 stop all

# Stop specific service
pm2 stop astralis-frontend

# Delete all services (careful!)
pm2 delete all
```

### PM2 Configuration
```bash
# Save current PM2 process list
pm2 save

# Restore saved processes
pm2 resurrect

# Setup PM2 to start on boot
pm2 startup
```

## Health Checks

### Frontend Health Check
```bash
# Check if Next.js is running
curl http://localhost:3001

# Check specific endpoint
curl http://localhost:3001/api/health
```

### Backend Health Check
```bash
# Check if Express is running
curl http://localhost:3000/health

# Check API endpoint
curl http://localhost:3000/api/blog/posts
```

### Full System Check
```bash
# Check all services
pm2 status

# Check ports
netstat -tlnp | grep -E '3000|3001'

# Check processes
ps aux | grep -E 'node|next'

# Check logs for errors
tail -50 /var/log/pm2/astralis-frontend-error.log
tail -50 /var/log/pm2/astralis-server-error.log
```

## Caddy Configuration

The Caddy web server should be configured to reverse proxy to the Next.js frontend.

**Expected Caddyfile location:** `/etc/caddy/Caddyfile`

**Typical configuration:**
```
your-domain.com {
    reverse_proxy localhost:3001
    encode gzip

    # API requests can go directly to frontend (which proxies to backend)
    # Or you can route /api/* directly to backend:
    # reverse_proxy /api/* localhost:3000
}
```

**Caddy commands:**
```bash
# Test configuration
caddy validate --config /etc/caddy/Caddyfile

# Reload configuration
systemctl reload caddy

# Restart Caddy
systemctl restart caddy

# Check status
systemctl status caddy
```

## Troubleshooting

### Frontend not starting
```bash
# Check build was successful
ls -la /home/deploy/astralis-nextjs/.next

# Check node_modules installed
ls -la /home/deploy/astralis-nextjs/node_modules/next

# Check environment variables
cat /home/deploy/astralis-nextjs/.env.local

# Check PM2 logs
pm2 logs astralis-frontend --lines 100
```

### Backend not starting
```bash
# Check build was successful
ls -la /home/deploy/astralis-server/server/dist

# Check database connection
cd /home/deploy/astralis-server/server
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# Check PM2 logs
pm2 logs astralis-server --lines 100
```

### Port conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 3001
lsof -i :3001

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Database issues
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Connect to database
psql -U your_user -d your_database

# Run migrations
cd /home/deploy/astralis-server/prisma
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Rollback Procedure

### Rollback Frontend
```bash
# 1. Navigate to frontend
cd /home/deploy/astralis-nextjs

# 2. Check git log to find previous commit
git log --oneline -10

# 3. Revert to previous commit
git checkout COMMIT_HASH

# 4. Rebuild
npm run build

# 5. Restart
pm2 restart astralis-frontend
```

### Rollback Backend
```bash
# 1. Navigate to backend
cd /home/deploy/astralis-server

# 2. Check git log
git log --oneline -10

# 3. Revert to previous commit
git checkout COMMIT_HASH

# 4. Rebuild
cd server
npm run build

# 5. Restart
pm2 restart astralis-server
```

## Security Notes

1. **SSH Access:** Ensure only authorized keys can access the droplet
2. **Environment Variables:** Never commit .env files to git
3. **Database Credentials:** Rotate regularly
4. **PM2 Logs:** Contain sensitive data, protect with proper permissions
5. **Caddy SSL:** Ensure HTTPS is properly configured

## Monitoring

### Log Locations
- Frontend errors: `/var/log/pm2/astralis-frontend-error.log`
- Frontend output: `/var/log/pm2/astralis-frontend-out.log`
- Backend errors: `/var/log/pm2/astralis-server-error.log`
- Backend output: `/var/log/pm2/astralis-server-out.log`
- Caddy logs: `/var/log/caddy/`

### Resource Monitoring
```bash
# CPU and Memory usage
pm2 monit

# Disk usage
df -h

# Memory details
free -h

# Process list
htop
```

## Migration from Old Structure

Once the new git-based deployment is confirmed working:

```bash
# 1. Stop old PM2 processes (if any)
pm2 stop all
pm2 delete all

# 2. Backup old directories
mv /root/projects/astralis-next /root/backup-astralis-next-$(date +%Y%m%d)
mv /root/projects/astralis-server /root/backup-astralis-server-$(date +%Y%m%d)

# 3. Start new services
pm2 start /root/ecosystem.config.cjs --env production
pm2 save
```

## Support Contacts

- **Repository Issues:** GitHub Issues on respective repos
- **Server Access:** Contact system administrator for SSH access issues
- **Database Issues:** Contact database administrator

## Changelog

- **2025-11-13:** Initial deployment guide created
  - Documented new git-based deployment structure
  - Created PM2 configuration for /home/deploy paths
  - Documented health checks and troubleshooting procedures
