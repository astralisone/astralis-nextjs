# Deployment Guide - Digital Ocean Droplet

This guide covers deploying the Astralis Next.js application and Express backend on a Digital Ocean droplet.

## Architecture Overview

```
Internet → Nginx (Port 80/443)
         ↓
         ├→ Next.js Frontend (Port 3001)
         └→ Express Backend (Port 3000)
                ↓
         PostgreSQL Database (Port 5432)
```

## Prerequisites

### 1. Droplet Requirements
- **Minimum:** 2GB RAM, 1 vCPU, 50GB SSD
- **Recommended:** 4GB RAM, 2 vCPU, 80GB SSD
- **OS:** Ubuntu 22.04 LTS or later

### 2. Domain Setup
- Point your domain (e.g., `astralis.one`) to your droplet's IP address
- Set up DNS A records:
  - `@` → Your droplet IP
  - `www` → Your droplet IP

---

## Step 1: Initial Server Setup

### SSH into your droplet
```bash
ssh root@your-droplet-ip
```

### Update system packages
```bash
apt update && apt upgrade -y
```

### Create a deploy user (recommended for security)
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## Step 2: Install Node.js

### Install Node.js 20.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify installation
```bash
node --version  # Should be v20.x.x
npm --version   # Should be v10.x.x
```

### Install Yarn (optional, if backend uses it)
```bash
sudo npm install -g yarn
```

---

## Step 3: Install PostgreSQL

### Install PostgreSQL 15
```bash
sudo apt install postgresql postgresql-contrib -y
```

### Start and enable PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create database and user
```bash
sudo -u postgres psql

-- Inside PostgreSQL shell:
CREATE DATABASE astralis_db;
CREATE USER astralis_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE astralis_db TO astralis_user;
\q
```

---

## Step 4: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## Step 5: Clone and Setup Backend

### Navigate to projects directory
```bash
cd /home/deploy
mkdir -p projects
cd projects
```

### Clone the Express backend
```bash
git clone https://github.com/YOUR_USERNAME/astralis-agency-server.git
cd astralis-agency-server
```

### Install dependencies
```bash
yarn install
# or
npm install
```

### Create .env file for backend
```bash
nano .env
```

Add the following (update with your values):
```env
# Database
DATABASE_URL="postgresql://astralis_user:your_secure_password_here@localhost:5432/astralis_db"

# Server
PORT=3000
NODE_ENV=production

# JWT & Auth
JWT_SECRET=your_jwt_secret_here_use_openssl_rand_base64_32
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Frontend URL
FRONTEND_URL=https://astralis.one

# CORS
CORS_ORIGIN=https://astralis.one

# Payment Providers
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Run database migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### Build backend (if TypeScript)
```bash
npm run build
# or
yarn build
```

---

## Step 6: Clone and Setup Frontend

### Clone the Next.js frontend
```bash
cd /home/deploy/projects
git clone https://github.com/YOUR_USERNAME/astralis-nextjs.git
cd astralis-nextjs
```

### Install dependencies
```bash
npm install
```

### Create .env.local file
```bash
nano .env.local
```

Add the following:
```env
# Database (same as backend)
DATABASE_URL="postgresql://astralis_user:your_secure_password_here@localhost:5432/astralis_db"

# NextAuth
NEXTAUTH_URL=https://astralis.one
NEXTAUTH_SECRET=your_nextauth_secret_here_use_openssl_rand_base64_32

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://astralis.one/api

# Payment Providers (Public keys)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
```

### Build the Next.js application
```bash
npm run build
```

This will create an optimized production build in `.next/`

---

## Step 7: Setup PM2 Process Management

### Create PM2 ecosystem file
```bash
cd /home/deploy/projects
nano ecosystem.config.js
```

Add the following configuration:
```javascript
module.exports = {
  apps: [
    {
      name: 'astralis-backend',
      cwd: '/home/deploy/projects/astralis-agency-server',
      script: 'dist/index.js', // or 'src/index.js' if not using TypeScript
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/deploy/logs/backend-error.log',
      out_file: '/home/deploy/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'astralis-frontend',
      cwd: '/home/deploy/projects/astralis-nextjs',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/deploy/logs/frontend-error.log',
      out_file: '/home/deploy/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
};
```

### Create logs directory
```bash
mkdir -p /home/deploy/logs
```

### Start applications with PM2
```bash
pm2 start ecosystem.config.js
```

### Verify processes are running
```bash
pm2 status
pm2 logs
```

### Setup PM2 to start on system boot
```bash
pm2 startup
# Follow the command it gives you (run with sudo)
pm2 save
```

---

## Step 8: Install and Configure Nginx

### Install Nginx
```bash
sudo apt install nginx -y
```

### Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/astralis
```

Add the following configuration:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web_limit:10m rate=30r/s;

# Upstream servers
upstream backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name astralis.one www.astralis.one;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name astralis.one www.astralis.one;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/astralis.one/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/astralis.one/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/astralis_access.log;
    error_log /var/log/nginx/astralis_error.log;

    # Max upload size
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json image/svg+xml;

    # Backend API proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend/api/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js static files (cached)
    location /_next/static/ {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # Cache static files for 1 year
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js public files
    location /images/ {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Frontend application
    location / {
        limit_req zone=web_limit burst=50 nodelay;

        proxy_pass http://frontend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/astralis /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Step 9: Setup SSL with Let's Encrypt

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain SSL certificate
```bash
sudo certbot --nginx -d astralis.one -d www.astralis.one
```

Follow the prompts:
- Enter your email address
- Agree to Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Setup auto-renewal
```bash
sudo systemctl status certbot.timer  # Should be active
sudo certbot renew --dry-run  # Test renewal
```

---

## Step 10: Setup Firewall

### Configure UFW firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Step 11: Monitoring and Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor CPU/Memory
pm2 monit

# View process info
pm2 info astralis-frontend
pm2 info astralis-backend

# Restart apps
pm2 restart all
pm2 restart astralis-frontend
pm2 restart astralis-backend
```

### Nginx Logs
```bash
# View access logs
sudo tail -f /var/log/nginx/astralis_access.log

# View error logs
sudo tail -f /var/log/nginx/astralis_error.log
```

### Database Backup Script
Create `/home/deploy/scripts/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U astralis_user astralis_db > $BACKUP_DIR/astralis_db_$DATE.sql
gzip $BACKUP_DIR/astralis_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: astralis_db_$DATE.sql.gz"
```

Make it executable and schedule with cron:
```bash
chmod +x /home/deploy/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/deploy/scripts/backup-db.sh
```

---

## Step 12: Deployment Updates

### Create deployment script
Create `/home/deploy/scripts/deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Backend deployment
echo "📦 Updating backend..."
cd /home/deploy/projects/astralis-agency-server
git pull origin main
yarn install --production=false
npx prisma migrate deploy
npx prisma generate
yarn build
pm2 restart astralis-backend

# Frontend deployment
echo "🎨 Updating frontend..."
cd /home/deploy/projects/astralis-nextjs
git pull origin main
npm install
npm run build
pm2 restart astralis-frontend

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:
```bash
chmod +x /home/deploy/scripts/deploy.sh
```

### Deploy updates
```bash
/home/deploy/scripts/deploy.sh
```

---

## Troubleshooting

### Check if apps are running
```bash
pm2 status
curl http://localhost:3000/health  # Backend health check
curl http://localhost:3001  # Frontend
```

### View application logs
```bash
pm2 logs astralis-backend --lines 100
pm2 logs astralis-frontend --lines 100
```

### Restart services
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### Check disk space
```bash
df -h
du -sh /home/deploy/projects/*
```

### Database connection test
```bash
psql -U astralis_user -d astralis_db -h localhost
```

---

## Performance Optimization

### Enable Redis for caching (optional)
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

Update backend to use Redis for sessions and caching.

### Setup monitoring with PM2 Plus (optional)
```bash
pm2 link your_secret_key your_public_key
```

### Database optimization
```bash
# Analyze and optimize database
sudo -u postgres psql astralis_db
VACUUM ANALYZE;
REINDEX DATABASE astralis_db;
```

---

## Security Checklist

- ✅ Use SSH keys instead of password authentication
- ✅ Disable root login via SSH
- ✅ Enable UFW firewall
- ✅ Install fail2ban for brute-force protection
- ✅ Keep system packages updated
- ✅ Use strong passwords for database
- ✅ Enable SSL/HTTPS with Let's Encrypt
- ✅ Set up automated backups
- ✅ Use environment variables for secrets
- ✅ Enable security headers in Nginx

---

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## Support

For issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/astralis_error.log`
3. Database logs: `sudo journalctl -u postgresql`
4. System resources: `htop` or `top`
