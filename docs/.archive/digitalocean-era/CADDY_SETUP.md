# Caddy Reverse Proxy Setup for AstralisOne.com

This guide covers installing and configuring Caddy as a reverse proxy for AstralisOne.com on DigitalOcean server 137.184.31.207.

## Architecture Overview

```
Internet
    ↓
Caddy (Port 80/443)
    ├── astralisone.com → localhost:3001 (Next.js App)
    └── automation.astralisone.com → localhost:5678 (n8n)
```

### Key Features
- **Automatic HTTPS**: Let's Encrypt SSL certificates (auto-renewal)
- **WebSocket Support**: For Next.js SSR and n8n workflows
- **Large Uploads**: Up to 50MB for documents, 100MB for n8n
- **Long Timeouts**: 5-10 minutes for OCR, AI processing, workflow execution
- **Security Headers**: HSTS, CSP, XSS protection, frame options
- **Health Checks**: Automatic backend monitoring
- **Access Logging**: JSON-formatted logs with rotation

## Prerequisites

### 1. DNS Configuration

Before installing Caddy, configure your DNS records:

```dns
# A Records (IPv4) - Point to your DigitalOcean server
astralisone.com              A    137.184.31.207
www.astralisone.com          A    137.184.31.207
automation.astralisone.com   A    137.184.31.207

# Optional: AAAA Records (IPv6) if you have IPv6 enabled
# astralisone.com            AAAA  your:ipv6:address
```

**Verify DNS propagation:**
```bash
# Check A records
dig astralisone.com +short
dig www.astralisone.com +short
dig automation.astralisone.com +short

# Should all return: 137.184.31.207
```

**DNS Propagation Time**: Allow 5-60 minutes for DNS changes to propagate globally.

### 2. Firewall Configuration

Ensure ports are open on your DigitalOcean droplet:

```bash
# Allow HTTP (port 80) for Let's Encrypt challenge
ufw allow 80/tcp

# Allow HTTPS (port 443)
ufw allow 443/tcp

# Optional: Allow HTTP/3 (QUIC)
ufw allow 443/udp

# Verify rules
ufw status
```

**Expected output:**
```
Status: active

To                         Action      From
--                         ------      ----
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
443/udp                    ALLOW       Anywhere
```

### 3. Verify Services Running

Before proxying, ensure backend services are operational:

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Check Docker containers
cd /home/deploy/astralis-nextjs
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# astralis_app      running   0.0.0.0:3001->3001/tcp
# astralis_n8n      running   0.0.0.0:5678->5678/tcp
# astralis_postgres running   0.0.0.0:5433->5432/tcp
# astralis_redis    running   0.0.0.0:6379->6379/tcp

# Test Next.js app
curl -I http://localhost:3001/api/health
# Should return: HTTP/1.1 200 OK

# Test n8n
curl -I http://localhost:5678/healthz
# Should return: HTTP/1.1 200 OK
```

## Installation

### Option 1: Install Caddy (Debian/Ubuntu - Recommended)

```bash
# 1. Install dependencies
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https

# 2. Add Caddy's GPG key
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

# 3. Add Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# 4. Update package list
sudo apt update

# 5. Install Caddy
sudo apt install caddy

# 6. Verify installation
caddy version
# Should output: v2.7.x or higher
```

### Option 2: Install via Docker (Alternative)

If you prefer to run Caddy in Docker alongside your app:

```bash
# See docker-compose.caddy.yml section below
```

## Configuration

### 1. Copy Caddyfile to Server

```bash
# From your local machine (macOS)
cd /Users/gadmin/Projects/astralis-nextjs

# Copy Caddyfile to server
scp -i ~/.ssh/id_ed25519 Caddyfile root@137.184.31.207:/etc/caddy/Caddyfile

# Or if using Docker deployment, copy to deployment directory
scp -i ~/.ssh/id_ed25519 Caddyfile root@137.184.31.207:/home/deploy/astralis-nextjs/
```

### 2. Verify Caddyfile Syntax

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207

# Validate configuration
caddy validate --config /etc/caddy/Caddyfile

# Expected output: "Valid configuration"
```

### 3. Create Log Directory

```bash
# Create log directory for Caddy access logs
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy
```

### 4. Start Caddy Service

```bash
# Enable Caddy to start on boot
sudo systemctl enable caddy

# Start Caddy service
sudo systemctl start caddy

# Check status
sudo systemctl status caddy

# Expected output: "active (running)"
```

### 5. Monitor SSL Certificate Provisioning

Caddy will automatically request Let's Encrypt certificates on first startup:

```bash
# Watch Caddy logs in real-time
sudo journalctl -u caddy -f

# Expected log output:
# [INFO] [astralisone.com] acme: Obtaining bundled SAN certificate
# [INFO] [astralisone.com] acme: Certificate obtained successfully
# [INFO] [automation.astralisone.com] acme: Obtaining bundled SAN certificate
# [INFO] [automation.astralisone.com] acme: Certificate obtained successfully
```

**Certificate locations:**
- `/var/lib/caddy/.local/share/caddy/certificates/`
- Auto-renewed 30 days before expiration

## Verification

### 1. Test HTTP to HTTPS Redirect

```bash
# From your local machine
curl -I http://astralisone.com

# Should return:
# HTTP/1.1 308 Permanent Redirect
# Location: https://astralisone.com
```

### 2. Test HTTPS Connection

```bash
# Test main domain
curl -I https://astralisone.com

# Should return:
# HTTP/2 200
# strict-transport-security: max-age=15768000; includeSubDomains; preload

# Test n8n subdomain
curl -I https://automation.astralisone.com

# Should return:
# HTTP/2 200
```

### 3. Verify SSL Certificate

```bash
# Check certificate details
openssl s_client -connect astralisone.com:443 -servername astralisone.com < /dev/null

# Look for:
# - Issuer: C = US, O = Let's Encrypt
# - Validity: Not After (expiration date)
# - Subject Alternative Names: astralisone.com, www.astralisone.com
```

### 4. Test WebSocket Support

```bash
# Test n8n WebSocket endpoint (requires wscat)
npm install -g wscat
wscat -c wss://automation.astralisone.com/ws

# Should connect without errors
```

### 5. Browser Testing

**Main Application:**
1. Open https://astralisone.com in browser
2. Check browser console for errors
3. Verify SSL padlock icon in address bar
4. Test booking flow (end-to-end)

**n8n Automation:**
1. Open https://automation.astralisone.com
2. Login with n8n credentials
3. Create test workflow
4. Verify webhook URLs use HTTPS

### 6. Security Headers Check

Use online tool: https://securityheaders.com

```bash
curl -I https://astralisone.com

# Should include:
# strict-transport-security: max-age=15768000
# x-xss-protection: 1; mode=block
# x-content-type-options: nosniff
# x-frame-options: SAMEORIGIN
```

## Troubleshooting

### Issue: "certificate signed by unknown authority"

**Cause:** Let's Encrypt challenge failed, likely DNS not propagated.

**Solution:**
```bash
# 1. Verify DNS points to your server
dig astralisone.com +short
# Should return: 137.184.31.207

# 2. Force certificate renewal
sudo caddy reload --config /etc/caddy/Caddyfile

# 3. Check logs
sudo journalctl -u caddy -n 100
```

### Issue: "connection refused" or 502 Bad Gateway

**Cause:** Backend service not running or wrong port.

**Solution:**
```bash
# 1. Check if Next.js is listening on port 3001
curl http://localhost:3001/api/health

# 2. Check if n8n is listening on port 5678
curl http://localhost:5678/healthz

# 3. Verify Docker containers are running
docker ps | grep astralis

# 4. Check container logs
docker logs astralis_app
docker logs astralis_n8n
```

### Issue: "request body too large"

**Cause:** Upload exceeds 50MB limit.

**Solution:**
```bash
# Edit Caddyfile and increase limit
sudo nano /etc/caddy/Caddyfile

# Change:
# request_body {
#   max_size 100MB  # Increase as needed
# }

# Reload Caddy
sudo systemctl reload caddy
```

### Issue: WebSocket connections failing

**Cause:** Missing WebSocket headers or timeouts.

**Solution:**
```bash
# Verify WebSocket headers in Caddyfile:
# header_up Connection {>Connection}
# header_up Upgrade {>Upgrade}

# Check if client sends Upgrade header
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://automation.astralisone.com/ws
```

### Issue: Slow response times

**Cause:** Timeout settings too aggressive.

**Solution:**
```bash
# Check Caddy access logs
sudo tail -f /var/log/caddy/astralisone.log

# Look for timeout errors
# Increase timeouts in Caddyfile if needed (currently 300s/600s)
```

## Maintenance

### Reload Configuration

After editing Caddyfile:

```bash
# Graceful reload (zero downtime)
sudo systemctl reload caddy

# Or using Caddy CLI
caddy reload --config /etc/caddy/Caddyfile
```

### View Access Logs

```bash
# Real-time logs
sudo tail -f /var/log/caddy/astralisone.log

# Parse JSON logs with jq
sudo tail -f /var/log/caddy/astralisone.log | jq '.'

# Filter by status code
sudo cat /var/log/caddy/astralisone.log | jq 'select(.status >= 500)'
```

### View Error Logs

```bash
# Caddy service logs
sudo journalctl -u caddy -n 100

# Follow in real-time
sudo journalctl -u caddy -f

# Filter by priority (error and above)
sudo journalctl -u caddy -p err
```

### Certificate Renewal

Caddy auto-renews certificates 30 days before expiration. Manual renewal:

```bash
# Force renewal for all domains
caddy reload --config /etc/caddy/Caddyfile

# Check certificate expiration
echo | openssl s_client -servername astralisone.com -connect astralisone.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Backup Configuration

```bash
# Backup Caddyfile
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)

# Backup certificates (before major changes)
sudo tar -czf /root/caddy-certs-backup-$(date +%Y%m%d).tar.gz /var/lib/caddy/.local/share/caddy/certificates/
```

## Docker Compose Integration (Alternative)

If you prefer to run Caddy in Docker, add this service to `docker-compose.prod.yml`:

```yaml
services:
  caddy:
    image: caddy:2.7-alpine
    container_name: astralis_caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
      - /var/log/caddy:/var/log/caddy
    networks:
      - astralis-network
    depends_on:
      - app
      - n8n

volumes:
  caddy-data:
  caddy-config:
```

**Important:** If using Docker, update Caddyfile reverse_proxy targets:
- Change `localhost:3001` → `app:3001`
- Change `localhost:5678` → `n8n:5678`

## Performance Tuning

### Enable HTTP/3 (QUIC)

Already enabled in global options. Verify:

```bash
# Check if HTTP/3 is working
curl --http3 -I https://astralisone.com

# Should see HTTP/3 in response
```

### Enable Gzip Compression

Add to site blocks in Caddyfile:

```caddyfile
astralisone.com {
    encode gzip zstd
    # ... rest of config
}
```

### Cache Static Assets

Add to site blocks:

```caddyfile
astralisone.com {
    # Cache static files
    @static {
        path *.css *.js *.jpg *.jpeg *.png *.gif *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # ... rest of config
}
```

### Rate Limiting

Protect against DDoS and abuse:

```caddyfile
astralisone.com {
    # Rate limit: 100 requests per minute per IP
    rate_limit {
        zone dynamic {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # ... rest of config
}
```

## Security Best Practices

### 1. Enable Fail2Ban for Caddy

```bash
# Install fail2ban
sudo apt install fail2ban

# Create Caddy filter
sudo nano /etc/fail2ban/filter.d/caddy.conf
```

Add:
```ini
[Definition]
failregex = ^.*"remote_ip":"<HOST>".*"status":(?:401|403|404).*$
ignoreregex =
```

Create jail:
```bash
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[caddy]
enabled = true
port = http,https
filter = caddy
logpath = /var/log/caddy/astralisone.log
maxretry = 5
bantime = 3600
```

Restart fail2ban:
```bash
sudo systemctl restart fail2ban
```

### 2. Restrict Admin API

Caddy admin API is restricted to localhost in the configuration. To access remotely:

```bash
# Create SSH tunnel
ssh -i ~/.ssh/id_ed25519 -L 2019:localhost:2019 root@137.184.31.207

# Access admin API locally
curl http://localhost:2019/config/
```

### 3. Regular Security Updates

```bash
# Update Caddy
sudo apt update && sudo apt upgrade caddy

# Check for security advisories
curl -s https://github.com/caddyserver/caddy/security/advisories
```

## Monitoring and Alerts

### Uptime Monitoring

Use external service like UptimeRobot or StatusCake:
- Monitor: https://astralisone.com/api/health
- Monitor: https://automation.astralisone.com/healthz
- Alert interval: 5 minutes
- Notification: Email/Slack

### Log Analysis

```bash
# Count requests by status code
cat /var/log/caddy/astralisone.log | jq -r '.status' | sort | uniq -c | sort -rn

# Top 10 requested URLs
cat /var/log/caddy/astralisone.log | jq -r '.request.uri' | sort | uniq -c | sort -rn | head -10

# Requests by remote IP
cat /var/log/caddy/astralisone.log | jq -r '.remote_ip' | sort | uniq -c | sort -rn | head -10

# Average response time
cat /var/log/caddy/astralisone.log | jq -r '.duration' | awk '{ sum += $1; n++ } END { if (n > 0) print sum / n; }'
```

## Environment Variable Updates

After Caddy setup, update `.env` on server:

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
cd /home/deploy/astralis-nextjs

# Edit environment file
nano .env

# Update URLs to use HTTPS
NEXTAUTH_URL="https://astralisone.com"
NEXT_PUBLIC_APP_URL="https://astralisone.com"
N8N_WEBHOOK_URL="https://automation.astralisone.com/"
N8N_EDITOR_BASE_URL="https://automation.astralisone.com"

# Restart services to pick up changes
docker-compose -f docker-compose.prod.yml restart app n8n
```

## Related Documentation

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
- [HTTP/3 Support](https://caddyserver.com/docs/http3)
- [Security Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

## Support

For issues or questions:
1. Check Caddy logs: `sudo journalctl -u caddy -n 100`
2. Verify DNS: `dig astralisone.com +short`
3. Test backend: `curl http://localhost:3001/api/health`
4. Review this documentation
5. Contact DevOps team

---

**Last Updated:** 2025-11-26
**Caddy Version:** 2.7.x
**Server:** 137.184.31.207
