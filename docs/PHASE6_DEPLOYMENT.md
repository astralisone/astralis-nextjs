# Phase 6: n8n Automation Engine - Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Configuration Reference](#configuration-reference)
6. [Troubleshooting](#troubleshooting)
7. [Security Best Practices](#security-best-practices)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

Phase 6 introduces n8n, an open-source workflow automation engine that enables:

- **Business Process Automation**: Automate repetitive tasks and workflows
- **Multi-Channel Integration**: Connect with 350+ services and APIs
- **Event-Driven Actions**: Trigger workflows from webhooks, schedules, and data changes
- **Visual Workflow Builder**: No-code/low-code interface for workflow creation
- **Scalable Execution**: Run workflows in parallel with proper queue management

### Architecture

```
┌─────────────────┐
│   AstralisOps   │
│   Application   │
└────────┬────────┘
         │ API Calls
         │ Webhooks
         ▼
┌─────────────────┐
│      n8n        │
│  Automation     │
│    Engine       │
└────────┬────────┘
         │
         ├──────► OpenAI (GPT-4)
         ├──────► SendGrid (Email)
         ├──────► Slack (Notifications)
         ├──────► Stripe (Payments)
         ├──────► Google Sheets (CRM)
         └──────► Custom Webhooks
```

---

## Prerequisites

### Required

- Docker 20.10+ and Docker Compose 2.0+
- PostgreSQL 12+ (shared with main application)
- Redis 6+ (for background jobs)
- `.env.local` file configured
- Node.js 18+ (for Prisma migrations)

### Optional

- Nginx (for reverse proxy in production)
- Let's Encrypt SSL certificate
- Custom domain for n8n editor

### API Keys Required

Depending on your automation needs:

- OpenAI API key (for AI-powered workflows)
- SendGrid API key (for email automation)
- Slack webhook URL or bot token
- Stripe API key (for payment workflows)
- Google OAuth credentials (for Calendar, Sheets, Gmail)

---

## Local Development Setup

### Step 1: Configure Environment Variables

1. **Copy the template**:
   ```bash
   cp .env.local.template .env.local
   ```

2. **Generate encryption key**:
   ```bash
   openssl rand -hex 32
   ```

3. **Update `.env.local`** with the following minimum required variables:

   ```bash
   # N8N Core Configuration
   N8N_ENCRYPTION_KEY=your-generated-64-char-hex-key
   N8N_BASIC_AUTH_PASSWORD=your-secure-password
   N8N_HOST=localhost
   N8N_PROTOCOL=http

   # Database (should match your PostgreSQL settings)
   DATABASE_NAME=astralis_one
   DATABASE_USER=astralis
   DATABASE_PASSWORD=your-db-password

   # Internal API
   ASTRALIS_API_KEY=your-internal-api-key
   ```

4. **Add integration API keys** (optional, as needed):
   ```bash
   OPENAI_API_KEY=sk-...
   SENDGRID_API_KEY=SG...
   SLACK_WEBHOOK_URL=https://hooks.slack.com/...
   ```

### Step 2: Run Automated Setup

```bash
# Make script executable
chmod +x scripts/setup-phase6.sh

# Run setup script
./scripts/setup-phase6.sh
```

The script will:
- Verify prerequisites
- Generate missing encryption keys
- Pull Docker images
- Initialize PostgreSQL schema
- Start n8n container
- Perform health checks

### Step 3: Initialize Database Tables

Run Prisma migration for automation-related tables:

```bash
npx prisma migrate dev --name add_automation_tables_phase_6
npx prisma generate
```

### Step 4: Access n8n Editor

1. Open browser to `http://localhost:5678`
2. Login with credentials from `.env.local`:
   - Username: Value of `N8N_BASIC_AUTH_USER` (default: admin)
   - Password: Value of `N8N_BASIC_AUTH_PASSWORD`

3. You should see the n8n welcome screen

### Step 5: Configure Credentials

In n8n editor, add credentials for integrations:

1. Click **Credentials** in left sidebar
2. Click **Add Credential**
3. Search for service (e.g., "OpenAI")
4. Enter API key from `.env.local`
5. Click **Save**

Repeat for all services you plan to use.

---

## Production Deployment

### DigitalOcean Droplet Setup

#### 1. Update Environment Variables

Update `.env.local` for production:

```bash
# Production URLs
N8N_HOST=automation.astralisone.com
N8N_PROTOCOL=https
N8N_EDITOR_BASE_URL=https://automation.astralisone.com
N8N_WEBHOOK_URL=https://automation.astralisone.com/
N8N_WEBHOOK_TUNNEL_URL=https://automation.astralisone.com/

# Secure webhooks
N8N_SECURE_COOKIE=true

# Production database
DATABASE_URL=postgresql://astralis:prod-password@localhost:5432/astralis_one
```

#### 2. Configure DNS

Add A record for n8n subdomain:

```
Type: A
Name: automation
Value: 137.184.31.207
TTL: 3600
```

#### 3. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/n8n`:

```nginx
server {
    listen 80;
    server_name automation.astralisone.com;

    # WebSocket support
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Long timeout for workflow executions
        proxy_read_timeout 86400;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;

        # Buffer settings
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Enable SSL with Let's Encrypt

```bash
sudo certbot --nginx -d automation.astralisone.com
```

Follow prompts. Certbot will:
- Obtain SSL certificate
- Update Nginx configuration
- Setup auto-renewal

#### 5. Deploy to Server

1. **SSH to server**:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
   ```

2. **Navigate to project**:
   ```bash
   cd /home/deploy/astralis-nextjs
   ```

3. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

4. **Update environment**:
   ```bash
   nano .env.local
   # Update production settings
   ```

5. **Run setup script**:
   ```bash
   ./scripts/setup-phase6.sh
   ```

6. **Verify deployment**:
   ```bash
   curl https://automation.astralisone.com/healthz
   ```

#### 6. Firewall Configuration

Ensure port 5678 is NOT exposed to the internet (only localhost):

```bash
# UFW rules (n8n should only be accessible via Nginx)
sudo ufw status
# Should NOT show: 5678/tcp ALLOW Anywhere

# If 5678 is exposed, remove it:
sudo ufw delete allow 5678/tcp
```

Access should only be through Nginx on ports 80/443.

---

## Configuration Reference

### Environment Variables

#### Core Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `N8N_HOST` | Hostname for n8n | localhost | Yes |
| `N8N_PORT` | Port for n8n service | 5678 | Yes |
| `N8N_PROTOCOL` | HTTP or HTTPS | http | Yes |
| `N8N_ENCRYPTION_KEY` | 64-char hex key for credentials | - | Yes |
| `N8N_BASIC_AUTH_USER` | Admin username | admin | Yes |
| `N8N_BASIC_AUTH_PASSWORD` | Admin password | - | Yes |

#### Database Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_NAME` | PostgreSQL database name | astralis_one |
| `DATABASE_USER` | PostgreSQL user | astralis |
| `DATABASE_PASSWORD` | PostgreSQL password | - |
| `N8N_DATABASE_SCHEMA` | Schema for n8n tables | n8n |

#### Execution Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `EXECUTIONS_PROCESS` | Execution mode (main/own) | main |
| `EXECUTIONS_DATA_SAVE_ON_ERROR` | Save failed executions | all |
| `EXECUTIONS_DATA_SAVE_ON_SUCCESS` | Save successful executions | all |
| `EXECUTIONS_DATA_MAX_AGE` | Days to keep execution data | 336 (14 days) |

### Docker Compose Configuration

The `docker-compose.yml` includes:

- **Service**: n8n
- **Image**: n8nio/n8n:latest
- **Ports**: 5678:5678
- **Volumes**: n8n-data (persistent storage)
- **Network**: astralis-network (shared with app)
- **Dependencies**: postgres, redis

---

## Troubleshooting

### N8N Won't Start

**Symptoms**: Container exits immediately after startup

**Diagnosis**:
```bash
docker logs astralis_n8n
```

**Common Issues**:

1. **Missing encryption key**:
   ```
   Error: N8N_ENCRYPTION_KEY is required
   ```
   Solution: Generate and set in `.env.local`

2. **Database connection failure**:
   ```
   Error: Connection to database failed
   ```
   Solutions:
   - Verify PostgreSQL is running: `docker ps | grep postgres`
   - Check DATABASE_PASSWORD in `.env.local`
   - Verify n8n schema exists: `docker exec -i astralis_postgres psql -U astralis -d astralis_one -c "\dn"`

3. **Port already in use**:
   ```
   Error: bind: address already in use
   ```
   Solution: Change N8N_PORT in `.env.local` or stop conflicting service

### Database Schema Not Found

**Symptoms**: n8n starts but can't create tables

**Solution**:
```bash
docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql
docker-compose restart n8n
```

### Webhooks Not Working

**Symptoms**: External services can't trigger n8n workflows

**Diagnosis**:
1. Check webhook URL in workflow
2. Verify firewall allows inbound traffic
3. Test locally: `curl http://localhost:5678/webhook-test/YOUR_WEBHOOK_ID`

**Solutions**:

1. **Production**: Ensure `N8N_WEBHOOK_URL` matches public domain
2. **Development**: Use ngrok for local testing:
   ```bash
   ngrok http 5678
   # Update N8N_WEBHOOK_TUNNEL_URL with ngrok URL
   ```

### Credentials Not Saving

**Symptoms**: Credentials disappear after restart

**Cause**: Missing or changed encryption key

**Solution**:
1. Never change `N8N_ENCRYPTION_KEY` after first use
2. If you must change it, you'll need to re-enter all credentials
3. Backup encryption key securely

### High Memory Usage

**Symptoms**: n8n container using excessive RAM

**Solutions**:

1. **Increase memory limit** in docker-compose.yml:
   ```yaml
   environment:
     - NODE_OPTIONS=--max-old-space-size=4096  # 4GB
   ```

2. **Prune old executions**:
   ```yaml
   environment:
     - EXECUTIONS_DATA_PRUNE=true
     - EXECUTIONS_DATA_MAX_AGE=168  # 7 days
   ```

3. **Use external execution mode** for complex workflows

---

## Security Best Practices

### 1. Encryption Key Management

- **Generate securely**: Use `openssl rand -hex 32`
- **Store safely**: Add to password manager
- **Never commit**: Ensure `.env.local` is in `.gitignore`
- **Backup**: Store encrypted backup in secure location
- **Rotate**: Plan key rotation strategy (requires re-entering credentials)

### 2. Authentication

#### Basic Auth (Development)

```bash
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=strong-unique-password
```

#### OAuth2 (Production - Recommended)

For production, consider integrating SSO:

```yaml
environment:
  - N8N_JWT_AUTH_ACTIVE=true
  - N8N_JWKS_URI=https://your-identity-provider.com/.well-known/jwks.json
```

### 3. Network Security

- **Firewall**: Block direct access to port 5678
- **Reverse Proxy**: Only expose through Nginx with SSL
- **IP Whitelist**: Restrict editor access to known IPs
- **VPN**: Require VPN for editor access in production

Example Nginx IP whitelist:

```nginx
location / {
    allow 203.0.113.0/24;  # Office IP range
    allow 198.51.100.5;    # VPN gateway
    deny all;

    proxy_pass http://localhost:5678;
    # ... rest of config
}
```

### 4. API Key Rotation

Schedule regular rotation of integration API keys:

- **OpenAI**: Rotate every 90 days
- **SendGrid**: Rotate every 90 days
- **Slack**: Regenerate webhooks yearly
- **Stripe**: Use restricted keys, rotate every 90 days

### 5. Webhook Security

Secure incoming webhooks:

1. **Use HTTPS**: Always use SSL for webhook URLs
2. **Validate signatures**: Verify webhook signatures from services
3. **Use unique IDs**: Don't use predictable webhook paths
4. **Rate limiting**: Implement rate limiting in Nginx

Example webhook signature validation in n8n workflow:

```javascript
// In Function node
const crypto = require('crypto');
const signature = $node["Webhook"].json.headers['x-signature'];
const payload = JSON.stringify($node["Webhook"].json.body);
const secret = process.env.WEBHOOK_SECRET;

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}
```

### 6. Database Security

- **Separate schema**: Keep n8n tables isolated
- **Limited permissions**: Grant only necessary permissions
- **Regular backups**: Backup n8n schema separately
- **Encryption at rest**: Enable PostgreSQL encryption

### 7. Monitoring & Alerts

Set up alerts for:

- Failed login attempts
- Workflow execution failures
- High resource usage
- Database connection errors
- SSL certificate expiration

---

## Monitoring & Maintenance

### Health Checks

#### Container Health

```bash
# Check n8n container status
docker ps --filter "name=astralis_n8n"

# View recent logs
docker logs --tail 100 astralis_n8n

# Follow logs in real-time
docker logs -f astralis_n8n

# Check health endpoint
curl http://localhost:5678/healthz
```

#### Application Health

```bash
# Check n8n API
curl -u admin:password http://localhost:5678/rest/active-workflows

# Check database connection
docker exec astralis_n8n n8n info
```

### Performance Monitoring

#### Resource Usage

```bash
# Container stats
docker stats astralis_n8n

# Disk usage
docker exec astralis_n8n du -sh /home/node/.n8n

# Database size
docker exec astralis_postgres psql -U astralis -d astralis_one -c \
  "SELECT pg_size_pretty(pg_database_size('astralis_one'));"
```

#### Workflow Metrics

Access in n8n UI:
- **Executions**: View all workflow runs
- **Errors**: Filter failed executions
- **Duration**: Analyze execution times
- **Stats**: Workflow execution statistics

### Backup & Recovery

#### Backup n8n Data

```bash
# Backup n8n volume
docker run --rm -v astralis_n8n-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data

# Backup database (n8n schema)
docker exec astralis_postgres pg_dump -U astralis -d astralis_one \
  --schema=n8n > n8n-db-backup-$(date +%Y%m%d).sql
```

#### Restore from Backup

```bash
# Restore n8n volume
docker run --rm -v astralis_n8n-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/n8n-backup-YYYYMMDD.tar.gz -C /

# Restore database
docker exec -i astralis_postgres psql -U astralis -d astralis_one < n8n-db-backup-YYYYMMDD.sql

# Restart n8n
docker-compose restart n8n
```

### Maintenance Tasks

#### Weekly

- [ ] Review failed workflow executions
- [ ] Check error logs for issues
- [ ] Monitor disk usage
- [ ] Review new workflow deployments

#### Monthly

- [ ] Update n8n Docker image
- [ ] Review and optimize slow workflows
- [ ] Audit user access and permissions
- [ ] Clean up old execution data
- [ ] Review and update credentials
- [ ] Backup workflow configurations

#### Quarterly

- [ ] Rotate API keys and passwords
- [ ] Review and update SSL certificates (Let's Encrypt auto-renews)
- [ ] Performance audit and optimization
- [ ] Security audit
- [ ] Documentation updates

### Updating n8n

```bash
# Pull latest image
docker pull n8nio/n8n:latest

# Stop current container
docker-compose stop n8n

# Remove old container
docker-compose rm -f n8n

# Start with new image
docker-compose up -d n8n

# Verify update
docker exec astralis_n8n n8n --version
```

### Common Maintenance Commands

```bash
# Restart n8n
docker-compose restart n8n

# Stop n8n
docker-compose stop n8n

# Start n8n
docker-compose start n8n

# View logs
docker logs -f astralis_n8n

# Execute n8n CLI commands
docker exec astralis_n8n n8n --help

# List active workflows
docker exec astralis_n8n n8n list:workflow

# Clear execution data
docker exec astralis_postgres psql -U astralis -d astralis_one -c \
  "DELETE FROM n8n.execution_entity WHERE \"finishedAt\" < NOW() - INTERVAL '30 days';"
```

---

## Additional Resources

- [n8n Official Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Workflow Templates](https://n8n.io/workflows/)
- [AstralisOps API Documentation](./API_ROUTES.md)
- [Phase 6 Architecture](./phases/phase-6-automation.md)

---

## Support

For issues or questions:

1. Check logs: `docker logs astralis_n8n`
2. Review this troubleshooting guide
3. Check n8n community forum
4. Review application logs for API integration issues

---

**Last Updated**: November 2024
**Version**: 1.0
**Phase**: 6 - Business Automation & n8n Integration
