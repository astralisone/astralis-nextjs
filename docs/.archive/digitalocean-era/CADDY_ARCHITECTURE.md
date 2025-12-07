# Caddy Reverse Proxy Architecture - AstralisOne.com

## Executive Summary

This document describes the Caddy reverse proxy architecture for AstralisOne.com, deployed on DigitalOcean server 137.184.31.207. Caddy provides automatic HTTPS, WebSocket support, and production-grade security for the Next.js application and n8n automation platform.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DNS Resolution                                │
│  astralisone.com              → 137.184.31.207                   │
│  www.astralisone.com          → 137.184.31.207                   │
│  automation.astralisone.com   → 137.184.31.207                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DigitalOcean Firewall (UFW)                      │
│  Port 80/tcp   ✓ (Let's Encrypt HTTP-01 challenge)              │
│  Port 443/tcp  ✓ (HTTPS)                                         │
│  Port 443/udp  ✓ (HTTP/3 QUIC)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Caddy v2.7+ Reverse Proxy                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Let's Encrypt Auto-HTTPS                                  │  │
│  │ - Automatic certificate provisioning                      │  │
│  │ - Auto-renewal (30 days before expiry)                    │  │
│  │ - Certificates: /var/lib/caddy/.local/share/caddy/certs/  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Security Headers                                          │  │
│  │ - HSTS (max-age=15768000, includeSubDomains, preload)    │  │
│  │ - X-XSS-Protection: 1; mode=block                         │  │
│  │ - X-Content-Type-Options: nosniff                         │  │
│  │ - X-Frame-Options: SAMEORIGIN (app) / removed (n8n)      │  │
│  │ - Referrer-Policy: strict-origin-when-cross-origin       │  │
│  │ - CSP (n8n only for third-party integrations)            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Request Routing                                           │  │
│  │                                                           │  │
│  │  astralisone.com                                          │  │
│  │  www.astralisone.com         ──→  localhost:3001          │  │
│  │                                   (Next.js App)           │  │
│  │                                                           │  │
│  │  automation.astralisone.com  ──→  localhost:5678          │  │
│  │                                   (n8n Automation)        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ WebSocket Support                                         │  │
│  │ - Connection upgrade headers                             │  │
│  │ - Long-lived connections (90s keepalive)                 │  │
│  │ - Required for: n8n editor, Next.js HMR                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Upload Limits                                             │  │
│  │ - astralisone.com: 50MB (document uploads)               │  │
│  │ - automation.astralisone.com: 100MB (workflow data)      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Timeouts                                                  │  │
│  │ - astralisone.com: 300s (OCR, AI processing)             │  │
│  │ - automation.astralisone.com: 600s (long workflows)      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Health Checks                                             │  │
│  │ - /api/health (Next.js) every 30s                        │  │
│  │ - /healthz (n8n) every 30s                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Access Logging                                            │  │
│  │ - Format: JSON (structured logging)                      │  │
│  │ - Location: /var/log/caddy/*.log                         │  │
│  │ - Rotation: 100MB, keep 10 files, 30 days                │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Docker Container        │  │   Docker Container        │
│   astralis_app            │  │   astralis_n8n            │
│                          │  │                          │
│   Next.js 15 App         │  │   n8n Automation         │
│   Port: 3001             │  │   Port: 5678             │
│   Framework: Next.js     │  │   Platform: n8n          │
│   Runtime: Node 20       │  │   Runtime: Node 18       │
│                          │  │                          │
│   Endpoints:             │  │   Endpoints:             │
│   - /                    │  │   - /                    │
│   - /api/*               │  │   - /webhook/*           │
│   - /auth/*              │  │   - /rest/*              │
│   - /astralisops/*       │  │   - /healthz             │
│   - /api/health          │  │                          │
└────────────┬─────────────┘  └────────────┬─────────────┘
             │                            │
             └────────────┬───────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │   Docker Network               │
         │   astralis-network             │
         │   Subnet: 172.28.0.0/16        │
         └────────────┬───────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐   ┌──────────────────┐
│  PostgreSQL 16   │   │   Redis 7        │
│  Port: 5432      │   │   Port: 6379     │
│  Container:      │   │   Container:     │
│  astralis_postgres│   │  astralis_redis  │
└──────────────────┘   └──────────────────┘
```

## Component Specifications

### 1. Caddy Reverse Proxy

**Version:** 2.7+ (Alpine Linux)

**Installation Options:**
- **System Service** (recommended): Installed via apt, managed by systemd
- **Docker Container**: Runs alongside app containers

**Configuration File:**
- **System**: `/etc/caddy/Caddyfile`
- **Docker**: `./Caddyfile.docker` (mounted to container)

**Data Directories:**
- **Certificates**: `/var/lib/caddy/.local/share/caddy/certificates/`
- **Logs**: `/var/log/caddy/`
- **Config Cache**: `/var/lib/caddy/.local/share/caddy/config/`

**Ports:**
- **80/tcp**: HTTP (redirects to HTTPS, Let's Encrypt challenges)
- **443/tcp**: HTTPS (TLS 1.2, TLS 1.3)
- **443/udp**: HTTP/3 (QUIC protocol)
- **2019/tcp**: Admin API (localhost only)

### 2. Next.js Application (astralisone.com)

**Domain:** astralisone.com, www.astralisone.com

**Backend:** localhost:3001 (or app:3001 in Docker network)

**Caddy Configuration:**
```caddyfile
astralisone.com, www.astralisone.com {
    reverse_proxy localhost:3001 {
        health_uri /api/health
        health_interval 30s
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        transport http {
            read_timeout 300s
            write_timeout 300s
        }
    }
}
```

**Features:**
- **Auto-HTTPS**: Let's Encrypt certificates
- **HTTP/2**: Enabled by default
- **WebSocket**: Upgrade headers for Next.js HMR
- **Upload Limit**: 50MB (document uploads)
- **Timeout**: 300s (5 minutes for OCR, AI operations)
- **Health Check**: /api/health endpoint polled every 30s

### 3. n8n Automation Platform (automation.astralisone.com)

**Domain:** automation.astralisone.com

**Backend:** localhost:5678 (or n8n:5678 in Docker network)

**Caddy Configuration:**
```caddyfile
automation.astralisone.com {
    reverse_proxy localhost:5678 {
        health_uri /healthz
        health_interval 30s
        header_up Connection {>Connection}
        header_up Upgrade {>Upgrade}
        transport http {
            read_timeout 600s
            write_timeout 600s
            keepalive 90s
        }
    }
}
```

**Features:**
- **Auto-HTTPS**: Let's Encrypt certificates
- **WebSocket**: Critical for n8n editor and real-time workflows
- **Upload Limit**: 100MB (large workflow data)
- **Timeout**: 600s (10 minutes for long-running workflows)
- **CSP**: Relaxed policy for third-party integrations
- **Frame Options**: Removed (n8n embeds in some integrations)

## Security Architecture

### TLS Configuration

**Protocols:**
- TLS 1.2 (minimum)
- TLS 1.3 (preferred)
- HTTP/1.1, HTTP/2, HTTP/3 (QUIC)

**Cipher Suites:**
- Caddy uses secure defaults (Mozilla Intermediate profile)
- Forward secrecy enabled
- No weak ciphers (RC4, 3DES, etc.)

**Certificate Chain:**
```
Let's Encrypt Authority X3
├── R3 (Intermediate CA)
    └── astralisone.com
        ├── astralisone.com (SAN)
        └── www.astralisone.com (SAN)

Let's Encrypt Authority X3
├── R3 (Intermediate CA)
    └── automation.astralisone.com
```

**Certificate Lifecycle:**
- **Issuance**: Automatic via ACME protocol (HTTP-01 challenge)
- **Validity**: 90 days
- **Renewal**: Automatic 30 days before expiry
- **Storage**: `/var/lib/caddy/.local/share/caddy/certificates/`

### Security Headers

#### Main Application (astralisone.com)

```http
Strict-Transport-Security: max-age=15768000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

**Rationale:**
- **HSTS**: Force HTTPS for 6 months, include subdomains, eligible for browser preload list
- **XSS Protection**: Block reflected XSS attacks
- **Content Type Options**: Prevent MIME sniffing
- **Frame Options**: Allow same-origin embedding (for modals, iframes within app)
- **Referrer Policy**: Protect user privacy while maintaining security

#### n8n Platform (automation.astralisone.com)

```http
Strict-Transport-Security: max-age=15768000; includeSubDomains
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; frame-ancestors 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**Rationale:**
- **No X-Frame-Options**: n8n needs to embed external content
- **Relaxed CSP**: n8n uses inline scripts, eval, and loads third-party resources
- **Frame Ancestors**: Still restricted to same origin

### Access Control

**Authentication:**
- **astralisone.com**: NextAuth.js (JWT + database sessions)
- **automation.astralisone.com**: n8n basic auth + session cookies

**Authorization:**
- **astralisone.com**: RBAC (ADMIN, OPERATOR, CLIENT, PM roles)
- **automation.astralisone.com**: n8n user/credential system

**No Caddy-level authentication** - handled by backend applications

## Performance Optimizations

### HTTP/2 and HTTP/3

**HTTP/2:**
- Server push disabled (Next.js handles prefetching)
- Multiplexing enabled
- Header compression (HPACK)

**HTTP/3 (QUIC):**
- Enabled on port 443/udp
- Faster connection establishment (0-RTT)
- Better performance on lossy networks

### Timeouts and Keepalive

**Next.js App:**
```
read_timeout: 300s   # 5 minutes for OCR, AI processing
write_timeout: 300s  # 5 minutes for response writing
dial_timeout: 30s    # Backend connection
```

**n8n Platform:**
```
read_timeout: 600s   # 10 minutes for long workflows
write_timeout: 600s  # 10 minutes for response writing
keepalive: 90s       # Keep WebSocket connections alive
```

### Connection Pooling

Caddy maintains connection pools to backends:
- **Idle connections**: Reused for subsequent requests
- **Keepalive**: 90s for WebSocket, default for HTTP

### Compression

**Not enabled in base configuration** - Next.js handles compression:
- Next.js uses gzip/brotli for static assets
- API responses compressed by Next.js middleware

**Optional Caddy compression:**
```caddyfile
encode gzip zstd {
    match {
        header Content-Type text/*
        header Content-Type application/json
        header Content-Type application/javascript
    }
}
```

## Monitoring and Logging

### Access Logs

**Format:** JSON (structured logging)

**Location:**
- `/var/log/caddy/astralisone.log` (main app)
- `/var/log/caddy/automation.log` (n8n)

**Rotation:**
- **Size**: 100MB per file
- **Keep**: 10 files (1GB total)
- **Retention**: 720 hours (30 days)

**Log Fields:**
```json
{
  "ts": 1732598400.123,
  "request": {
    "remote_ip": "192.0.2.1",
    "remote_port": "54321",
    "client_ip": "192.0.2.1",
    "proto": "HTTP/2.0",
    "method": "GET",
    "host": "astralisone.com",
    "uri": "/api/health",
    "headers": { ... }
  },
  "user_id": "",
  "duration": 0.042,
  "size": 1234,
  "status": 200,
  "resp_headers": { ... }
}
```

### Service Logs

**Systemd Journal** (system Caddy installation):
```bash
journalctl -u caddy -f
```

**Docker Logs** (containerized Caddy):
```bash
docker logs -f astralis_caddy
```

### Metrics

**Admin API** (localhost:2019):
- `/config/`: Current configuration
- `/metrics`: Prometheus-compatible metrics (optional)

**Health Checks:**
- Next.js: `curl http://localhost:3001/api/health`
- n8n: `curl http://localhost:5678/healthz`
- Caddy: `curl http://localhost:2019/config/`

## Disaster Recovery

### Backup Strategy

**What to Backup:**
1. Caddyfile configuration
2. SSL certificates (auto-renewed, but backup before major changes)
3. Access logs (for compliance/audit)

**Backup Commands:**
```bash
# Backup Caddyfile
cp /etc/caddy/Caddyfile /root/caddy-backup/Caddyfile.$(date +%Y%m%d)

# Backup certificates
tar -czf /root/caddy-backup/certs-$(date +%Y%m%d).tar.gz \
  /var/lib/caddy/.local/share/caddy/certificates/

# Backup logs
tar -czf /root/caddy-backup/logs-$(date +%Y%m%d).tar.gz \
  /var/log/caddy/
```

**Backup Frequency:**
- Caddyfile: Before each change
- Certificates: Weekly (automated)
- Logs: Monthly (automated)

### Restore Procedures

**Restore Caddyfile:**
```bash
cp /root/caddy-backup/Caddyfile.YYYYMMDD /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

**Restore Certificates:**
```bash
systemctl stop caddy
tar -xzf /root/caddy-backup/certs-YYYYMMDD.tar.gz -C /
systemctl start caddy
```

**Emergency Rollback:**
```bash
# Stop Caddy
systemctl stop caddy

# Restore environment to HTTP
cd /home/deploy/astralis-nextjs
nano .env  # Change URLs to HTTP
docker-compose -f docker-compose.prod.yml restart

# Access via:
# http://137.184.31.207:3001 (app)
# http://137.184.31.207:5678 (n8n)
```

## Deployment Modes

### Mode 1: System Service (Recommended)

**Pros:**
- Independent of application lifecycle
- Managed by systemd (auto-restart)
- Standard Linux tooling (journalctl, systemctl)
- Easier to troubleshoot

**Cons:**
- Requires root access to configure
- Not portable across environments

**Install:**
```bash
apt install caddy
cp Caddyfile /etc/caddy/Caddyfile
systemctl enable caddy
systemctl start caddy
```

### Mode 2: Docker Container

**Pros:**
- Portable across environments
- Version-pinned (caddy:2.7-alpine)
- Integrated with docker-compose
- Easy to update (docker-compose pull)

**Cons:**
- Coupled with application lifecycle
- Docker networking complexity
- Logs via docker logs (not journalctl)

**Deploy:**
```bash
docker-compose -f docker-compose.caddy.yml up -d
```

## Integration Points

### Next.js Application

**Headers Received:**
- `Host`: Original hostname (astralisone.com)
- `X-Real-IP`: Client IP address
- `X-Forwarded-For`: Client IP (for proxy chains)
- `X-Forwarded-Proto`: https
- `X-Forwarded-Host`: astralisone.com

**Used For:**
- NextAuth.js redirect URLs
- Absolute URL generation
- IP-based rate limiting
- Geographic detection

### n8n Automation

**WebSocket Upgrade:**
- `Connection: Upgrade`
- `Upgrade: websocket`

**Headers Required:**
- `Host`: automation.astralisone.com (for n8n routing)
- `X-Forwarded-Proto`: https (for webhook URL generation)

**Webhook URLs:**
- Generated by n8n as: `https://automation.astralisone.com/webhook/{id}`
- Must use HTTPS for security (webhook signing)

## Troubleshooting Guide

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Certificate not provisioning | `certificate signed by unknown authority` | Verify DNS, wait for propagation, check port 80 open |
| 502 Bad Gateway | Caddy responds, backend doesn't | Check Docker containers, verify backend health endpoints |
| WebSocket fails | n8n editor doesn't load, timeout errors | Verify WebSocket headers in Caddyfile, check firewall |
| Upload fails | `request too large` error | Increase `request_body` limit in Caddyfile |
| Slow responses | Timeouts, incomplete page loads | Increase timeout values, check backend performance |

### Diagnostic Commands

```bash
# Check Caddy status
systemctl status caddy

# Validate configuration
caddy validate --config /etc/caddy/Caddyfile

# Test backend health
curl http://localhost:3001/api/health
curl http://localhost:5678/healthz

# Check DNS
dig astralisone.com +short

# Test HTTPS
curl -I https://astralisone.com

# View logs
journalctl -u caddy -f
tail -f /var/log/caddy/astralisone.log | jq '.'
```

## Performance Benchmarks

**Expected Performance:**

| Metric | Target | Notes |
|--------|--------|-------|
| TTFB (Time to First Byte) | < 200ms | For cached routes |
| SSL Handshake | < 100ms | TLS 1.3 |
| Page Load | < 2s | First contentful paint |
| WebSocket Latency | < 50ms | Editor responsiveness |
| Upload Speed | > 10MB/s | 50MB file upload in < 5s |

**Load Testing:**
```bash
# Install Apache Bench
apt install apache2-utils

# Test homepage (100 requests, 10 concurrent)
ab -n 100 -c 10 https://astralisone.com/

# Test API endpoint
ab -n 1000 -c 50 https://astralisone.com/api/health
```

## Related Documentation

- **Setup Guide**: `docs/CADDY_SETUP.md` - Detailed installation instructions
- **Quick Reference**: `docs/CADDY_QUICK_REFERENCE.md` - Command cheatsheet
- **Deployment Checklist**: `docs/DEPLOYMENT_CHECKLIST.md` - Pre/post deployment tasks
- **Caddyfile**: `/etc/caddy/Caddyfile` - Production configuration
- **Docker Caddyfile**: `Caddyfile.docker` - Docker-specific configuration
- **Docker Compose**: `docker-compose.caddy.yml` - Caddy + app in Docker

## References

- **Caddy Documentation**: https://caddyserver.com/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **ACME Protocol**: https://tools.ietf.org/html/rfc8555
- **HTTP/3 Spec**: https://www.rfc-editor.org/rfc/rfc9114.html
- **Security Headers**: https://owasp.org/www-project-secure-headers/

---

**Last Updated:** 2025-11-26
**Version:** 1.0
**Author:** Systems Architect Agent
**Server:** 137.184.31.207
**Status:** Ready for Production
