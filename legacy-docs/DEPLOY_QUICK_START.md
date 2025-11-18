# Quick Deployment Reference

## Initial Setup (One-time)

```bash
# 1. SSH into droplet
ssh root@your-droplet-ip

# 2. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql postgresql-contrib
sudo npm install -g pm2 yarn

# 3. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE astralis_db;
CREATE USER astralis_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE astralis_db TO astralis_user;
\q

# 4. Clone repositories
mkdir -p ~/projects && cd ~/projects
git clone YOUR_BACKEND_REPO astralis-agency-server
git clone YOUR_FRONTEND_REPO astralis-nextjs

# 5. Setup backend
cd astralis-agency-server
cp .env.example .env  # Edit with your values
npm install
npx prisma migrate deploy
npm run build

# 6. Setup frontend
cd ~/projects/astralis-nextjs
cp .env.local.template .env.local  # Edit with your values
npm install
npm run build

# 7. Start with PM2
cd ~/projects
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions

# 8. Configure Nginx
sudo nano /etc/nginx/sites-available/astralis
# Paste config from DEPLOYMENT.md
sudo ln -s /etc/nginx/sites-available/astralis /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 9. Setup SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 10. Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Daily Operations

### View Application Status
```bash
pm2 status
pm2 monit           # Real-time monitoring
pm2 logs            # View all logs
pm2 logs backend    # View specific app logs
```

### Deploy Updates
```bash
# Backend
cd ~/projects/astralis-agency-server
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart astralis-backend

# Frontend
cd ~/projects/astralis-nextjs
git pull
npm install
npm run build
pm2 restart astralis-frontend
```

### Restart Services
```bash
pm2 restart all                    # Restart all apps
pm2 restart astralis-frontend      # Restart frontend only
pm2 restart astralis-backend       # Restart backend only
sudo systemctl restart nginx       # Restart Nginx
```

### Check Logs
```bash
# Application logs
pm2 logs --lines 100
pm2 logs astralis-frontend --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/astralis_access.log
sudo tail -f /var/log/nginx/astralis_error.log

# PostgreSQL logs
sudo journalctl -u postgresql -n 50
```

---

## Troubleshooting

### App won't start
```bash
# Check PM2 status
pm2 status
pm2 describe astralis-frontend

# View logs for errors
pm2 logs --err

# Restart with fresh logs
pm2 flush  # Clear logs
pm2 restart all
```

### 502 Bad Gateway
```bash
# Check if apps are running
pm2 status
curl http://localhost:3001  # Test frontend
curl http://localhost:3000  # Test backend

# Check Nginx config
sudo nginx -t
sudo systemctl status nginx

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

### Database Connection Errors
```bash
# Test database connection
psql -U astralis_user -d astralis_db -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Run migrations
cd ~/projects/astralis-agency-server
npx prisma migrate deploy
```

### Out of Disk Space
```bash
# Check disk usage
df -h
du -sh ~/projects/*
du -sh ~/.pm2/logs/*

# Clear PM2 logs
pm2 flush

# Clear old logs
find ~/.pm2/logs -mtime +7 -delete
sudo journalctl --vacuum-time=7d

# Clear npm cache
npm cache clean --force
```

### High Memory Usage
```bash
# Check memory
free -h
pm2 monit

# Restart memory-heavy processes
pm2 restart astralis-frontend --update-env
pm2 restart astralis-backend --update-env
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secret_here
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_here
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
```

---

## Useful Commands

```bash
# System info
htop                    # Interactive process viewer
df -h                   # Disk usage
free -h                 # Memory usage
netstat -tulpn          # Open ports

# PM2 commands
pm2 list                # List all processes
pm2 stop all            # Stop all processes
pm2 delete all          # Delete all processes
pm2 save                # Save current process list
pm2 resurrect           # Restore saved processes

# Nginx commands
sudo nginx -t           # Test config
sudo nginx -s reload    # Reload config
sudo systemctl status nginx
sudo systemctl restart nginx

# Database commands
psql -U user -d dbname  # Connect to database
pg_dump dbname > backup.sql  # Backup database
psql dbname < backup.sql     # Restore database

# SSL renewal
sudo certbot renew     # Renew certificates
sudo certbot certificates  # List certificates
```

---

## Security Best Practices

```bash
# Keep system updated
sudo apt update && sudo apt upgrade -y

# Setup fail2ban (anti brute-force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Setup automated backups
crontab -e
# Add: 0 2 * * * pg_dump -U user dbname | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz
```

---

## Performance Monitoring

```bash
# CPU and Memory
htop
top

# Disk I/O
iostat -x 1

# Network
netstat -an | grep ESTABLISHED | wc -l  # Active connections
iftop  # Network bandwidth (install with: sudo apt install iftop)

# PM2 Metrics
pm2 monit
pm2 show astralis-frontend
```

---

## Quick Health Checks

```bash
# Is everything running?
pm2 status && \
curl -I http://localhost:3001 && \
curl -I http://localhost:3000 && \
sudo systemctl is-active nginx postgresql

# Application health
curl -I https://yourdomain.com
curl https://yourdomain.com/api/health

# SSL certificate expiry
sudo certbot certificates
```

---

## Emergency Recovery

### Complete restart
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### Reset everything
```bash
pm2 delete all
cd ~/projects/astralis-nextjs && npm run build
cd ~/projects/astralis-agency-server && npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Rollback deployment
```bash
cd ~/projects/astralis-nextjs
git log --oneline -5  # Find commit hash
git checkout COMMIT_HASH
npm install && npm run build
pm2 restart astralis-frontend
```

---

## Getting Help

1. **Check logs first**: `pm2 logs --lines 100`
2. **Google the error**: Most errors are documented
3. **Check GitHub issues**: Look for similar problems
4. **Stack Overflow**: Search for error messages

## Need Full Documentation?
See `DEPLOYMENT.md` for complete step-by-step guide.
