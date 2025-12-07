# Caddy Deployment Checklist - AstralisOne.com

Complete pre-deployment and post-deployment checklist for Caddy reverse proxy setup.

## Pre-Deployment Checklist

### DNS Configuration
- [ ] A record for `astralisone.com` points to `137.184.31.207`
- [ ] A record for `www.astralisone.com` points to `137.184.31.207`
- [ ] A record for `automation.astralisone.com` points to `137.184.31.207`
- [ ] DNS propagation verified with `dig astralisone.com +short`
- [ ] Wait 5-60 minutes after DNS changes before proceeding

### Server Access
- [ ] SSH access to server: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- [ ] Server has at least 2GB RAM free
- [ ] Server has at least 10GB disk space free

### Backend Services Running
- [ ] Docker containers running: `docker ps | grep astralis`
- [ ] Next.js app responding: `curl http://localhost:3001/api/health` returns 200
- [ ] n8n responding: `curl http://localhost:5678/healthz` returns 200
- [ ] PostgreSQL running: `docker exec astralis_postgres pg_isready`
- [ ] Redis running: `docker exec astralis_redis redis-cli ping`

### Firewall Configuration
- [ ] UFW installed: `ufw --version`
- [ ] Port 80/tcp allowed (HTTP for Let's Encrypt)
- [ ] Port 443/tcp allowed (HTTPS)
- [ ] Port 443/udp allowed (HTTP/3 QUIC - optional)
- [ ] Firewall status: `ufw status`

### Environment Variables
- [ ] `.env` file exists on server: `/home/deploy/astralis-nextjs/.env`
- [ ] `NEXTAUTH_URL` will be updated to `https://astralisone.com`
- [ ] `NEXT_PUBLIC_APP_URL` will be updated to `https://astralisone.com`
- [ ] `N8N_WEBHOOK_URL` will be updated to `https://automation.astralisone.com/`
- [ ] `N8N_EDITOR_BASE_URL` will be updated to `https://automation.astralisone.com`

## Installation Checklist

### Option A: Automated Script
- [ ] Clone repository on local machine
- [ ] Navigate to repository root: `cd /Users/gadmin/Projects/astralis-nextjs`
- [ ] Make script executable: `chmod +x scripts/setup-caddy.sh`
- [ ] Run setup script: `./scripts/setup-caddy.sh`
- [ ] Script completes without errors

### Option B: Manual Installation
- [ ] Copy Caddyfile to server: `scp -i ~/.ssh/id_ed25519 Caddyfile root@137.184.31.207:/etc/caddy/`
- [ ] SSH to server: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
- [ ] Install Caddy (see docs/CADDY_SETUP.md)
- [ ] Create log directory: `mkdir -p /var/log/caddy && chown caddy:caddy /var/log/caddy`
- [ ] Validate Caddyfile: `caddy validate --config /etc/caddy/Caddyfile`
- [ ] Start Caddy: `systemctl enable caddy && systemctl start caddy`

### Option C: Docker Installation
- [ ] Update docker-compose to use `docker-compose.caddy.yml`
- [ ] Copy Docker Caddyfile: `cp Caddyfile.docker Caddyfile.docker`
- [ ] Update environment variables in `.env`
- [ ] Deploy: `docker-compose -f docker-compose.caddy.yml up -d`

## Post-Deployment Verification

### SSL Certificate Provisioning
- [ ] Wait 30-60 seconds after Caddy starts
- [ ] Check logs: `journalctl -u caddy -n 50 | grep "certificate"`
- [ ] Should see: "Certificate obtained successfully"
- [ ] Certificate files exist: `ls /var/lib/caddy/.local/share/caddy/certificates/`

### HTTP to HTTPS Redirect
- [ ] HTTP redirects to HTTPS: `curl -I http://astralisone.com`
  - Expected: `HTTP/1.1 308 Permanent Redirect` or `301 Moved Permanently`
  - Location header: `https://astralisone.com`
- [ ] www redirects: `curl -I http://www.astralisone.com`

### HTTPS Endpoints
- [ ] Main site responds: `curl -I https://astralisone.com`
  - Expected: `HTTP/2 200`
- [ ] www responds: `curl -I https://www.astralisone.com`
  - Expected: `HTTP/2 200`
- [ ] n8n responds: `curl -I https://automation.astralisone.com`
  - Expected: `HTTP/2 200`

### Security Headers
- [ ] HSTS header present: `curl -I https://astralisone.com | grep -i "strict-transport"`
  - Expected: `strict-transport-security: max-age=15768000`
- [ ] XSS protection: `curl -I https://astralisone.com | grep -i "x-xss"`
- [ ] Content type options: `curl -I https://astralisone.com | grep -i "x-content-type"`
- [ ] Frame options: `curl -I https://astralisone.com | grep -i "x-frame"`

### SSL Certificate Validation
- [ ] Certificate issuer is Let's Encrypt:
  ```bash
  openssl s_client -connect astralisone.com:443 -servername astralisone.com < /dev/null | grep "Issuer"
  ```
  - Expected: `Issuer: C = US, O = Let's Encrypt`
- [ ] Certificate valid for 90 days (Let's Encrypt default)
- [ ] Certificate includes SANs: astralisone.com, www.astralisone.com

### Browser Testing
- [ ] Open https://astralisone.com in browser
- [ ] SSL padlock icon appears (green/secure)
- [ ] No mixed content warnings in console
- [ ] Page loads completely
- [ ] Navigation works
- [ ] Forms submit successfully

### n8n Testing
- [ ] Open https://automation.astralisone.com
- [ ] n8n login page appears
- [ ] SSL padlock icon appears
- [ ] Login works
- [ ] Create test workflow
- [ ] Webhook URLs use HTTPS

### WebSocket Testing
- [ ] n8n editor loads (uses WebSocket)
- [ ] Test WebSocket connection:
  ```bash
  npm install -g wscat
  wscat -c wss://automation.astralisone.com/ws
  ```
- [ ] Connection successful (no timeout/error)

### Performance Testing
- [ ] Response time acceptable:
  ```bash
  curl -o /dev/null -s -w "Time: %{time_total}s\n" https://astralisone.com
  ```
  - Expected: < 2 seconds for first request, < 500ms for cached requests
- [ ] HTTP/2 working: `curl -I --http2 https://astralisone.com`
  - Expected: `HTTP/2 200`

### Upload Testing
- [ ] Test document upload (< 50MB) on main site
- [ ] No "request too large" errors
- [ ] Upload completes successfully
- [ ] n8n workflow file uploads work (< 100MB)

## Environment Variable Updates

After successful deployment, update environment variables:

### On Server
```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs

# Edit .env file
nano .env

# Update these values:
NEXTAUTH_URL="https://astralisone.com"
NEXT_PUBLIC_APP_URL="https://astralisone.com"
N8N_PROTOCOL="https"
N8N_HOST="automation.astralisone.com"
N8N_WEBHOOK_URL="https://automation.astralisone.com/"
N8N_EDITOR_BASE_URL="https://automation.astralisone.com"

# Save and exit (Ctrl+X, Y, Enter)

# Restart services
docker-compose -f docker-compose.prod.yml restart app n8n
```

### Verify Changes
- [ ] NextAuth works: Login at https://astralisone.com/auth/signin
- [ ] OAuth redirects use HTTPS
- [ ] n8n webhooks use HTTPS URLs
- [ ] Email links use HTTPS
- [ ] No mixed content warnings

## Monitoring Setup

### Log Monitoring
- [ ] Access logs rotating: `ls -lh /var/log/caddy/`
- [ ] Logs readable: `tail /var/log/caddy/astralisone.log`
- [ ] JSON format valid: `tail /var/log/caddy/astralisone.log | jq '.'`

### Service Monitoring
- [ ] Caddy enabled on boot: `systemctl is-enabled caddy`
- [ ] Health check endpoints working:
  - https://astralisone.com/api/health
  - https://automation.astralisone.com/healthz

### External Monitoring (Recommended)
- [ ] Set up UptimeRobot or StatusCake
  - Monitor: https://astralisone.com/api/health (5-min interval)
  - Monitor: https://automation.astralisone.com/healthz (5-min interval)
- [ ] Configure alerting (email/Slack)

## Security Hardening

### Security Headers Validation
- [ ] Test with https://securityheaders.com/?q=astralisone.com
  - Expected: Grade A or A+
- [ ] SSL test: https://www.ssllabs.com/ssltest/analyze.html?d=astralisone.com
  - Expected: Grade A or A+

### Fail2Ban (Optional)
- [ ] Install fail2ban: `apt install fail2ban`
- [ ] Configure Caddy filter (see docs/CADDY_SETUP.md)
- [ ] Test ban/unban functionality

### Rate Limiting (Optional)
- [ ] Enable rate limiting in Caddyfile
- [ ] Test rate limit triggers correctly

## Backup Configuration

- [ ] Backup Caddyfile:
  ```bash
  cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)
  ```
- [ ] Backup SSL certificates:
  ```bash
  tar -czf ~/caddy-certs-backup-$(date +%Y%m%d).tar.gz \
    /var/lib/caddy/.local/share/caddy/certificates/
  ```
- [ ] Store backups off-server (DigitalOcean Spaces, S3, etc.)

## Documentation

- [ ] Update deployment docs with any deviations
- [ ] Document custom configuration changes
- [ ] Share credentials with team (1Password, LastPass, etc.)
- [ ] Update runbook with any issues encountered

## Post-Deployment Testing (End-to-End)

### Main Application
- [ ] Visit https://astralisone.com
- [ ] Navigate all pages
- [ ] Test booking flow (end-to-end)
- [ ] Test document upload
- [ ] Test authentication (login/logout)
- [ ] Test OAuth (Google login)
- [ ] Verify email notifications sent with HTTPS links

### n8n Automation
- [ ] Visit https://automation.astralisone.com
- [ ] Login to n8n
- [ ] Create test workflow
- [ ] Add webhook trigger
- [ ] Verify webhook URL is HTTPS
- [ ] Test workflow execution
- [ ] Verify workflow can call AstralisOps API

### Integration Testing
- [ ] Test intake form submission → pipeline creation
- [ ] Test scheduling → calendar invite (HTTPS links)
- [ ] Test document upload → OCR → embedding
- [ ] Test n8n webhook → AstralisOps API
- [ ] Test AI chat with RAG

## Rollback Plan (If Issues Occur)

### Quick Rollback (Keep Caddy, Revert Config)
```bash
# Restore previous Caddyfile
cp /etc/caddy/Caddyfile.backup.YYYYMMDD /etc/caddy/Caddyfile
systemctl reload caddy
```

### Full Rollback (Remove Caddy, Expose Ports)
```bash
# Stop Caddy
systemctl stop caddy
systemctl disable caddy

# Update .env to use HTTP
nano /home/deploy/astralis-nextjs/.env
# Change URLs back to HTTP

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Access via direct ports
# App: http://137.184.31.207:3001
# n8n: http://137.184.31.207:5678
```

## Troubleshooting Common Issues

### Issue: Certificate not provisioning
- [ ] Verify DNS: `dig astralisone.com +short` returns `137.184.31.207`
- [ ] Verify port 80 open: `ufw status | grep 80`
- [ ] Check logs: `journalctl -u caddy | grep -i "acme\|error"`
- [ ] Wait 5 minutes and retry: `systemctl reload caddy`

### Issue: 502 Bad Gateway
- [ ] Check backend: `curl http://localhost:3001/api/health`
- [ ] Check Docker: `docker ps | grep astralis_app`
- [ ] Restart app: `docker-compose -f docker-compose.prod.yml restart app`

### Issue: WebSocket connections failing
- [ ] Verify WebSocket headers in Caddyfile
- [ ] Check browser console for errors
- [ ] Test with wscat: `wscat -c wss://automation.astralisone.com/ws`

### Issue: Upload fails (file too large)
- [ ] Check Caddyfile `request_body` limit
- [ ] Increase limit if needed (currently 50MB for app, 100MB for n8n)
- [ ] Reload Caddy: `systemctl reload caddy`

## Success Criteria

All items below should be TRUE for successful deployment:

- [ ] ✅ All DNS records point to correct IP
- [ ] ✅ SSL certificates auto-provisioned by Let's Encrypt
- [ ] ✅ HTTPS working for all domains
- [ ] ✅ HTTP redirects to HTTPS
- [ ] ✅ Security headers present (A grade on securityheaders.com)
- [ ] ✅ WebSocket connections working
- [ ] ✅ File uploads working (up to limits)
- [ ] ✅ Backend services healthy
- [ ] ✅ Environment variables updated to HTTPS
- [ ] ✅ No mixed content warnings
- [ ] ✅ Monitoring configured
- [ ] ✅ Logs rotating properly
- [ ] ✅ Backups created
- [ ] ✅ Team notified of changes

## Timeline

Estimated deployment time: **60-90 minutes**

- DNS configuration: 5-60 minutes (propagation)
- Caddy installation: 5 minutes
- Configuration: 10 minutes
- SSL provisioning: 1-2 minutes
- Testing: 15-30 minutes
- Environment updates: 5 minutes
- Final verification: 10 minutes

## Sign-Off

**Deployed by:** ___________________
**Date:** ___________________
**Time:** ___________________
**Version:** ___________________
**Verified by:** ___________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Last Updated:** 2025-11-26
**Server:** 137.184.31.207
**Domains:** astralisone.com, automation.astralisone.com
