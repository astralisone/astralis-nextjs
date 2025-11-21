# Phase 6: n8n Automation - Setup Checklist

## Pre-Setup Verification

### Environment
- [ ] Docker Desktop installed and running
- [ ] Docker Compose 2.0+ installed
- [ ] PostgreSQL container accessible
- [ ] Redis container accessible
- [ ] Node.js 18+ installed (for Prisma migrations)

### Files
- [ ] `.env.local.template` exists with Phase 6 configuration (lines 80-181)
- [ ] `docker-compose.yml` exists with n8n service (lines 173-250)
- [ ] `scripts/setup-phase6.sh` exists and is executable
- [ ] `scripts/init-n8n-schema.sql` exists
- [ ] Documentation files created in `docs/`

Verify with:
```bash
ls -la .env.local.template docker-compose.yml
ls -la scripts/setup-phase6.sh scripts/init-n8n-schema.sql
ls -la docs/PHASE6_*.md
```

---

## Local Development Setup

### Step 1: Environment Configuration
- [ ] Copy `.env.local.template` to `.env.local`
  ```bash
  cp .env.local.template .env.local
  ```

- [ ] Review Phase 6 variables (lines 80-181)
  ```bash
  grep -A 100 "Phase 6:" .env.local
  ```

- [ ] Verify database credentials match PostgreSQL setup
  ```bash
  grep "DATABASE_" .env.local
  ```

### Step 2: Run Automated Setup
- [ ] Make setup script executable
  ```bash
  chmod +x scripts/setup-phase6.sh
  ```

- [ ] Run setup script
  ```bash
  ./scripts/setup-phase6.sh
  ```

- [ ] Verify script completed without errors
- [ ] Note generated encryption key saved to `.env.local`
- [ ] Note generated API key saved to `.env.local`

### Step 3: Verify n8n Container
- [ ] Check container is running
  ```bash
  docker ps --filter "name=astralis_n8n"
  ```

- [ ] Check container health
  ```bash
  docker inspect astralis_n8n --format='{{.State.Health.Status}}'
  ```

- [ ] Test health endpoint
  ```bash
  curl http://localhost:5678/healthz
  ```

- [ ] View logs for any errors
  ```bash
  docker logs --tail 50 astralis_n8n
  ```

### Step 4: Verify Database Schema
- [ ] Check n8n schema exists
  ```bash
  docker exec astralis_postgres psql -U astralis -d astralis_one -c "\dn"
  ```

- [ ] Should see `n8n` in schema list

- [ ] Check n8n can access database
  ```bash
  docker logs astralis_n8n | grep -i "database\|connected"
  ```

### Step 5: Access n8n Editor
- [ ] Open browser to http://localhost:5678
- [ ] Enter credentials:
  - Username: `admin` (or value from `N8N_BASIC_AUTH_USER`)
  - Password: Check `N8N_BASIC_AUTH_PASSWORD` in `.env.local`
- [ ] Verify n8n welcome screen appears
- [ ] Explore n8n interface

### Step 6: Run Database Migrations
- [ ] Run Prisma migration for automation tables
  ```bash
  npx prisma migrate dev --name add_automation_tables_phase_6
  ```

- [ ] Regenerate Prisma client
  ```bash
  npx prisma generate
  ```

- [ ] Verify migration successful
  ```bash
  npx prisma migrate status
  ```

### Step 7: Configure Credentials in n8n
- [ ] Navigate to **Credentials** in n8n UI
- [ ] Add OpenAI credential
  - Name: OpenAI
  - API Key: From `OPENAI_API_KEY` in `.env.local`
- [ ] Add SendGrid credential (if using email automation)
- [ ] Add Slack credential (if using notifications)
- [ ] Add Stripe credential (if using payments)
- [ ] Add any other integration credentials needed

### Step 8: Create Test Workflow
- [ ] Click **Workflows** → **Add Workflow**
- [ ] Add **Manual Trigger** node
- [ ] Add **HTTP Request** node
  - Method: GET
  - URL: http://app:3001/api/health
- [ ] Connect nodes
- [ ] Click **Execute Workflow**
- [ ] Verify execution successful

---

## Production Deployment Checklist

### DNS Configuration
- [ ] Create A record: `automation.astralisone.com` → `137.184.31.207`
- [ ] Verify DNS propagation
  ```bash
  dig automation.astralisone.com +short
  ```

### Server Access
- [ ] SSH to production server
  ```bash
  ssh -i ~/.ssh/id_ed25519 root@137.184.31.207
  ```

- [ ] Navigate to project directory
  ```bash
  cd /home/deploy/astralis-nextjs
  ```

### Environment Configuration
- [ ] Update `.env.local` for production:
  - `N8N_HOST=automation.astralisone.com`
  - `N8N_PROTOCOL=https`
  - `N8N_WEBHOOK_URL=https://automation.astralisone.com/`
  - `N8N_SECURE_COOKIE=true`

- [ ] Verify all production API keys are set

### Nginx Configuration
- [ ] Create Nginx config: `/etc/nginx/sites-available/n8n`
- [ ] Enable site: `ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/`
- [ ] Test Nginx config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### SSL Certificate
- [ ] Run certbot
  ```bash
  sudo certbot --nginx -d automation.astralisone.com
  ```

- [ ] Verify SSL certificate installed
  ```bash
  curl https://automation.astralisone.com/healthz
  ```

### Deploy Application
- [ ] Pull latest code
  ```bash
  git pull origin main
  ```

- [ ] Run setup script
  ```bash
  ./scripts/setup-phase6.sh
  ```

- [ ] Verify n8n running
  ```bash
  docker ps --filter "name=astralis_n8n"
  ```

- [ ] Test health endpoint
  ```bash
  curl https://automation.astralisone.com/healthz
  ```

### Firewall Configuration
- [ ] Verify port 5678 NOT exposed to internet
  ```bash
  sudo ufw status | grep 5678
  ```

- [ ] Should NOT show: `5678/tcp ALLOW Anywhere`
- [ ] If exposed, remove rule:
  ```bash
  sudo ufw delete allow 5678/tcp
  ```

### Security Verification
- [ ] Changed default `N8N_BASIC_AUTH_PASSWORD`
- [ ] Generated secure `N8N_ENCRYPTION_KEY`
- [ ] Rotated all API keys to production versions
- [ ] Enabled HTTPS everywhere
- [ ] Configured webhook signature validation
- [ ] Setup IP whitelist or VPN requirement (optional)

### Monitoring Setup
- [ ] Configure health check monitoring
- [ ] Setup alerts for container down
- [ ] Setup alerts for workflow failures
- [ ] Configure log aggregation
- [ ] Setup backup schedule

---

## Testing Checklist

### Basic Functionality
- [ ] n8n UI accessible at http://localhost:5678 (dev) or https://automation.astralisone.com (prod)
- [ ] Login successful with credentials
- [ ] Can create new workflow
- [ ] Can save workflow
- [ ] Can execute workflow manually
- [ ] Execution shows in history

### Integration Testing
- [ ] OpenAI credential works
  - Create workflow with OpenAI node
  - Execute successfully
- [ ] SendGrid credential works (if configured)
  - Send test email
- [ ] Slack webhook works (if configured)
  - Send test notification
- [ ] AstralisOps API accessible from n8n
  - Test HTTP request to app API

### Webhook Testing
- [ ] Create webhook workflow
- [ ] Get webhook URL from workflow
- [ ] Send test POST request
  ```bash
  curl -X POST http://localhost:5678/webhook/YOUR_ID \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
  ```
- [ ] Verify workflow executed
- [ ] Check workflow received correct data

### Database Testing
- [ ] Workflows persist after restart
  ```bash
  docker-compose restart n8n
  ```
- [ ] Credentials remain accessible
- [ ] Execution history preserved

### Performance Testing
- [ ] Execute workflow 10+ times rapidly
- [ ] Monitor resource usage
  ```bash
  docker stats astralis_n8n
  ```
- [ ] Verify no memory leaks
- [ ] Check execution times reasonable

---

## Troubleshooting Quick Reference

### Container Won't Start
```bash
# Check logs
docker logs astralis_n8n

# Check environment variables
docker exec astralis_n8n env | grep N8N

# Verify dependencies
docker ps | grep -E "postgres|redis"
```

### Can't Access UI
```bash
# Check port binding
docker port astralis_n8n

# Check firewall
sudo ufw status | grep 5678

# Test locally
curl http://localhost:5678/healthz
```

### Database Errors
```bash
# Verify schema exists
docker exec astralis_postgres psql -U astralis -d astralis_one -c "\dn"

# Reinitialize schema
docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql

# Restart n8n
docker-compose restart n8n
```

### Credentials Not Saving
```bash
# Check encryption key set
grep N8N_ENCRYPTION_KEY .env.local

# Verify it's not placeholder
# Should be 64-character hex string

# If missing, generate new one:
openssl rand -hex 32

# Add to .env.local and restart
docker-compose restart n8n
```

---

## Maintenance Checklist

### Daily
- [ ] Check n8n container status
- [ ] Review failed workflow executions
- [ ] Monitor error logs

### Weekly
- [ ] Review workflow performance metrics
- [ ] Check disk usage
- [ ] Review execution history
- [ ] Update workflow documentation

### Monthly
- [ ] Update n8n Docker image
- [ ] Clean old execution data
- [ ] Review and optimize workflows
- [ ] Audit credentials and permissions
- [ ] Backup workflows and data

### Quarterly
- [ ] Rotate API keys
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation review
- [ ] Disaster recovery test

---

## Success Criteria

Phase 6 setup is complete when:

- [✓] All files created (scripts, docs, workflows)
- [✓] `.env.local` configured with Phase 6 variables
- [✓] `docker-compose.yml` includes n8n service
- [ ] Setup script runs without errors
- [ ] n8n container running and healthy
- [ ] Database schema initialized
- [ ] n8n UI accessible
- [ ] Credentials configured
- [ ] Test workflow executes successfully
- [ ] Webhooks work
- [ ] Integration with AstralisOps API functional
- [ ] Documentation complete and accessible

---

## Quick Command Reference

```bash
# Start n8n
docker-compose up -d n8n

# Stop n8n
docker-compose stop n8n

# Restart n8n
docker-compose restart n8n

# View logs
docker logs -f astralis_n8n

# Check health
curl http://localhost:5678/healthz

# Access database
docker exec -it astralis_postgres psql -U astralis -d astralis_one

# Execute n8n CLI
docker exec astralis_n8n n8n --help

# Backup workflows
docker exec astralis_n8n n8n export:workflow --all --output=/tmp/workflows.json

# Import workflow
docker exec astralis_n8n n8n import:workflow --input=/tmp/workflow.json
```

---

**Last Updated**: November 2024
**Phase**: 6 - Business Automation & n8n Integration
**Status**: Configuration Complete - Ready for Setup
