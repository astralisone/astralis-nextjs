# Phase 6: n8n Automation - Quick Start Guide

## 5-Minute Setup

### Prerequisites Check

```bash
# Verify Docker is running
docker --version

# Verify PostgreSQL is accessible
docker ps | grep postgres

# Verify .env.local exists
ls -la .env.local
```

### Quick Setup

```bash
# 1. Run automated setup
chmod +x scripts/setup-phase6.sh
./scripts/setup-phase6.sh

# 2. Run database migration
npx prisma migrate dev --name add_automation_tables_phase_6

# 3. Access n8n editor
open http://localhost:5678
```

### Default Credentials

- **Username**: admin (from `N8N_BASIC_AUTH_USER`)
- **Password**: Check `N8N_BASIC_AUTH_PASSWORD` in `.env.local`

---

## Essential Commands

### Container Management

```bash
# Start n8n
docker-compose up -d n8n

# Stop n8n
docker-compose stop n8n

# Restart n8n
docker-compose restart n8n

# View logs
docker logs -f astralis_n8n

# Check status
docker ps --filter "name=astralis_n8n"
```

### Health Checks

```bash
# Check n8n health
curl http://localhost:5678/healthz

# Check container status
docker exec astralis_n8n n8n info

# Check database connection
docker exec astralis_postgres psql -U astralis -d astralis_one -c "SELECT 1 FROM n8n.settings LIMIT 1;"
```

### Troubleshooting

```bash
# View recent errors
docker logs --tail 50 astralis_n8n

# Restart all services
docker-compose restart

# Rebuild n8n container
docker-compose up -d --force-recreate n8n

# Initialize schema manually
docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql
```

---

## Common Tasks

### Add API Credentials to n8n

1. Open http://localhost:5678
2. Navigate to **Credentials** (left sidebar)
3. Click **Add Credential**
4. Select service type (e.g., OpenAI)
5. Enter API key from `.env.local`
6. Click **Save**

### Create Your First Workflow

1. Click **Workflows** → **Add Workflow**
2. Add trigger node (e.g., Webhook)
3. Add action node (e.g., HTTP Request to AstralisOps API)
4. Connect nodes
5. Click **Save** and **Execute**

### Test Webhook Workflow

```bash
# Get webhook URL from n8n workflow
WEBHOOK_URL="http://localhost:5678/webhook/YOUR_WEBHOOK_ID"

# Send test request
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Export Workflow

1. Open workflow in n8n
2. Click **...** (menu) → **Download**
3. Save JSON file
4. Commit to `docs/workflows/` directory

---

## Environment Variables Quick Reference

### Required

```bash
N8N_ENCRYPTION_KEY=generated-with-openssl-rand-hex-32
N8N_BASIC_AUTH_PASSWORD=your-secure-password
DATABASE_PASSWORD=your-db-password
ASTRALIS_API_KEY=your-internal-api-key
```

### Optional (add as needed)

```bash
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
STRIPE_API_KEY=sk_test_...
```

---

## Workflow Templates

### 1. Intake Request Router

**Trigger**: Webhook from intake form
**Actions**:
1. Extract email and message
2. Call OpenAI to classify request
3. Create pipeline item in AstralisOps
4. Send Slack notification
5. Send confirmation email

### 2. Document Processing

**Trigger**: File upload to DigitalOcean Spaces
**Actions**:
1. Download file
2. Call OpenAI Vision for OCR
3. Generate embeddings
4. Store in database
5. Notify user

### 3. Payment Confirmation

**Trigger**: Stripe webhook
**Actions**:
1. Verify payment
2. Update user subscription in database
3. Send invoice email via SendGrid
4. Log to Google Sheets
5. Notify team on Slack

---

## File Locations

- **Docker Compose**: `/Users/gregorystarr/projects/astralis-nextjs/docker-compose.yml`
- **Environment**: `/Users/gregorystarr/projects/astralis-nextjs/.env.local`
- **Setup Script**: `/Users/gregorystarr/projects/astralis-nextjs/scripts/setup-phase6.sh`
- **Schema Init**: `/Users/gregorystarr/projects/astralis-nextjs/scripts/init-n8n-schema.sql`
- **Documentation**: `/Users/gregorystarr/projects/astralis-nextjs/docs/PHASE6_DEPLOYMENT.md`

---

## Next Steps

1. **Configure Credentials**: Add API keys for services you'll use
2. **Import Templates**: Load pre-built workflows from `docs/workflows/`
3. **Create Custom Workflows**: Build automation for your specific needs
4. **Test Thoroughly**: Verify all workflows work as expected
5. **Monitor**: Set up logging and alerting
6. **Deploy to Production**: Follow production deployment guide

---

## Support

- **Full Documentation**: `docs/PHASE6_DEPLOYMENT.md`
- **Docker Compose Reference**: `docker-compose.yml`
- **Environment Template**: `.env.local.template`
- **n8n Documentation**: https://docs.n8n.io/

---

**Last Updated**: November 2024
