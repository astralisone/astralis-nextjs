# Caddy Quick Reference - AstralisOne.com

Fast reference for common Caddy operations on production server.

## Connection

```bash
# SSH to production server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
```

## Service Management

```bash
# Start Caddy
systemctl start caddy

# Stop Caddy
systemctl stop caddy

# Restart Caddy (brief downtime)
systemctl restart caddy

# Reload configuration (zero downtime)
systemctl reload caddy

# Check status
systemctl status caddy

# Enable auto-start on boot
systemctl enable caddy

# Disable auto-start
systemctl disable caddy
```

## Configuration

```bash
# Edit Caddyfile
nano /etc/caddy/Caddyfile

# Validate syntax (before applying)
caddy validate --config /etc/caddy/Caddyfile

# Format Caddyfile (auto-format)
caddy fmt --overwrite /etc/caddy/Caddyfile

# Reload after changes
systemctl reload caddy

# Or reload using Caddy CLI
caddy reload --config /etc/caddy/Caddyfile
```

## Logs

```bash
# View service logs (last 100 lines)
journalctl -u caddy -n 100

# Follow logs in real-time
journalctl -u caddy -f

# View logs since specific time
journalctl -u caddy --since "1 hour ago"

# View logs for specific date
journalctl -u caddy --since "2025-11-26" --until "2025-11-27"

# View only errors
journalctl -u caddy -p err

# Access logs (JSON format)
tail -f /var/log/caddy/astralisone.log

# Parse JSON logs with jq
tail -f /var/log/caddy/astralisone.log | jq '.'

# n8n access logs
tail -f /var/log/caddy/automation.log
```

## Log Analysis

```bash
# Count requests by status code
cat /var/log/caddy/astralisone.log | jq -r '.status' | sort | uniq -c | sort -rn

# Top 10 requested URLs
cat /var/log/caddy/astralisone.log | jq -r '.request.uri' | sort | uniq -c | sort -rn | head -10

# Top 10 IP addresses
cat /var/log/caddy/astralisone.log | jq -r '.remote_ip' | sort | uniq -c | sort -rn | head -10

# Filter 5xx errors
cat /var/log/caddy/astralisone.log | jq 'select(.status >= 500)'

# Average response time (in seconds)
cat /var/log/caddy/astralisone.log | jq -r '.duration' | awk '{ sum += $1; n++ } END { if (n > 0) print sum / n; }'

# Requests in last hour
cat /var/log/caddy/astralisone.log | jq -r '.ts' | awk -v time=$(date -d '1 hour ago' +%s) '$1 > time' | wc -l
```

## SSL Certificates

```bash
# View certificate info
openssl s_client -connect astralisone.com:443 -servername astralisone.com < /dev/null | openssl x509 -noout -text

# Check expiration date
echo | openssl s_client -servername astralisone.com -connect astralisone.com:443 2>/dev/null | openssl x509 -noout -dates

# Force certificate renewal
caddy reload --config /etc/caddy/Caddyfile

# Certificate location
ls -la /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/

# Backup certificates
tar -czf ~/caddy-certs-backup-$(date +%Y%m%d).tar.gz /var/lib/caddy/.local/share/caddy/certificates/
```

## Testing

```bash
# Test HTTP to HTTPS redirect
curl -I http://astralisone.com

# Test HTTPS connection
curl -I https://astralisone.com

# Test with custom headers
curl -H "Host: astralisone.com" -I https://137.184.31.207

# Test WebSocket connection (requires wscat)
npm install -g wscat
wscat -c wss://automation.astralisone.com/ws

# Test from external server
curl -I https://astralisone.com
```

## Security Headers

```bash
# Check all headers
curl -I https://astralisone.com

# Check specific header
curl -I https://astralisone.com | grep -i "strict-transport-security"

# Online security analysis
# Visit: https://securityheaders.com/?q=astralisone.com
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=astralisone.com
```

## Performance

```bash
# Check response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://astralisone.com

# Detailed timing breakdown
curl -o /dev/null -s -w "DNS: %{time_namelookup}s\nConnect: %{time_connect}s\nSSL: %{time_appconnect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" https://astralisone.com

# Test HTTP/2 support
curl -I --http2 https://astralisone.com

# Test HTTP/3 support
curl -I --http3 https://astralisone.com
```

## Troubleshooting

```bash
# Check if Caddy is running
systemctl is-active caddy

# Check if Caddy is listening on ports
netstat -tlnp | grep caddy
# OR
ss -tlnp | grep caddy

# Check process
ps aux | grep caddy

# Test configuration syntax
caddy validate --config /etc/caddy/Caddyfile

# Check DNS resolution
dig astralisone.com +short
dig automation.astralisone.com +short

# Test backend connectivity
curl http://localhost:3001/api/health
curl http://localhost:5678/healthz

# Check Docker containers
docker ps | grep astralis

# Restart everything
systemctl restart caddy
docker-compose -f /home/deploy/astralis-nextjs/docker-compose.prod.yml restart
```

## Common Issues

### Issue: 502 Bad Gateway

```bash
# Check backend service
curl http://localhost:3001/api/health

# Check Docker containers
docker ps

# Restart backend
docker-compose -f /home/deploy/astralis-nextjs/docker-compose.prod.yml restart app

# Check Caddy logs
journalctl -u caddy -n 50
```

### Issue: Certificate Error

```bash
# Force certificate renewal
systemctl reload caddy

# Check DNS
dig astralisone.com +short

# Check Let's Encrypt logs
journalctl -u caddy | grep -i "acme\|certificate"

# Verify firewall allows port 80
ufw status | grep 80
```

### Issue: WebSocket Connection Failed

```bash
# Check Caddyfile for WebSocket headers
grep -A 5 "WebSocket" /etc/caddy/Caddyfile

# Should include:
# header_up Connection {>Connection}
# header_up Upgrade {>Upgrade}

# Test WebSocket upgrade
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://automation.astralisone.com/ws
```

## Admin API (Local Access Only)

```bash
# Get current configuration
curl http://localhost:2019/config/

# Get formatted JSON config
curl http://localhost:2019/config/ | jq '.'

# Check uptime
curl http://localhost:2019/metrics

# Remote access via SSH tunnel (from local machine)
ssh -i ~/.ssh/id_ed25519 -L 2019:localhost:2019 root@137.184.31.207
# Then visit: http://localhost:2019/config/
```

## Backup and Restore

```bash
# Backup Caddyfile
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d)

# Backup certificates
tar -czf ~/caddy-backup-$(date +%Y%m%d).tar.gz \
  /etc/caddy/Caddyfile \
  /var/lib/caddy/.local/share/caddy/certificates/

# Restore Caddyfile
cp /etc/caddy/Caddyfile.backup.20251126 /etc/caddy/Caddyfile
systemctl reload caddy

# Restore certificates (emergency only)
tar -xzf ~/caddy-backup-20251126.tar.gz -C /
systemctl restart caddy
```

## Monitoring

```bash
# Watch access logs
tail -f /var/log/caddy/astralisone.log | jq 'select(.status >= 400)'

# Count requests per minute
tail -f /var/log/caddy/astralisone.log | awk '{print strftime("%Y-%m-%d %H:%M", systime())}' | uniq -c

# Watch for errors
journalctl -u caddy -f | grep -i "error\|fail\|warn"

# Check memory usage
ps aux | grep caddy | awk '{print $6}'

# Check disk space for logs
du -sh /var/log/caddy/
```

## Updates

```bash
# Check current version
caddy version

# Update Caddy
apt update
apt upgrade caddy

# Verify after update
caddy version
systemctl status caddy
```

## Emergency Commands

```bash
# Stop Caddy immediately
systemctl stop caddy

# Expose ports directly (bypass Caddy)
# Already exposed in docker-compose.prod.yml:
# - App: http://137.184.31.207:3001
# - n8n: http://137.184.31.207:5678

# Restart all services
systemctl restart caddy
docker-compose -f /home/deploy/astralis-nextjs/docker-compose.prod.yml restart

# Nuclear option: full rebuild
cd /home/deploy/astralis-nextjs
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
systemctl restart caddy
```

## Useful Environment Variables

```bash
# Set Caddy environment
export CADDY_ADMIN=localhost:2019

# Set log level
export CADDY_LOG_LEVEL=DEBUG

# Apply
systemctl restart caddy
```

## Health Check Endpoints

```bash
# Next.js health
curl http://localhost:3001/api/health

# n8n health
curl http://localhost:5678/healthz

# Via Caddy (HTTPS)
curl https://astralisone.com/api/health
curl https://automation.astralisone.com/healthz
```

## Log Rotation

```bash
# Check log sizes
du -sh /var/log/caddy/*.log

# Manually rotate (if needed)
mv /var/log/caddy/astralisone.log /var/log/caddy/astralisone.log.1
systemctl reload caddy

# Configure logrotate (optional)
nano /etc/logrotate.d/caddy
```

## Related Files

- **Caddyfile**: `/etc/caddy/Caddyfile`
- **Service**: `/lib/systemd/system/caddy.service`
- **Certificates**: `/var/lib/caddy/.local/share/caddy/certificates/`
- **Logs**: `/var/log/caddy/`
- **PID**: `/run/caddy/caddy.pid`

## External Resources

- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/
- **DNS Checker**: https://dnschecker.org/
- **WebSocket Test**: https://www.websocket.org/echo.html
- **Caddy Docs**: https://caddyserver.com/docs/

---

**Last Updated:** 2025-11-26
**Server:** 137.184.31.207
**Domains:** astralisone.com, automation.astralisone.com
