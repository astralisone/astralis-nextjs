# n8n Workflow Templates

This directory contains pre-built n8n workflow templates for common AstralisOps automation scenarios.

## Available Templates

### 1. Intake Request Router (`intake-request-router.json`)
Routes incoming requests to appropriate pipelines using AI classification.

**Trigger**: Webhook
**Use Case**: Automatically route customer requests to the right team
**Services Used**: OpenAI, AstralisOps API, Slack

### 2. Document Processing Pipeline (`document-processing-pipeline.json`)
Automated document processing with OCR and embedding generation.

**Trigger**: Webhook (from upload endpoint)
**Use Case**: Extract text and generate searchable embeddings
**Services Used**: OpenAI, DigitalOcean Spaces, AstralisOps API

### 3. Payment Confirmation Workflow (`payment-confirmation.json`)
Handles payment confirmations from Stripe.

**Trigger**: Stripe Webhook
**Use Case**: Update subscriptions and send receipts
**Services Used**: Stripe, SendGrid, AstralisOps API, Google Sheets

### 4. Daily Summary Report (`daily-summary-report.json`)
Generates daily summary of activities and sends to team.

**Trigger**: Schedule (daily at 5 PM)
**Use Case**: Keep team informed of daily metrics
**Services Used**: AstralisOps API, Slack, Email

### 5. Lead Nurturing Campaign (`lead-nurturing.json`)
Automated email sequences for new leads.

**Trigger**: New user signup
**Use Case**: Welcome new users and guide onboarding
**Services Used**: SendGrid, AstralisOps API

## How to Import

### Method 1: n8n UI

1. Open n8n editor at http://localhost:5678
2. Click **Workflows** → **Import from File**
3. Select template JSON file
4. Configure credentials for each node
5. Activate workflow

### Method 2: CLI

```bash
# Copy workflow to n8n container
docker cp docs/workflows/intake-request-router.json astralis_n8n:/tmp/

# Import using n8n CLI
docker exec astralis_n8n n8n import:workflow --input=/tmp/intake-request-router.json

# Restart n8n to load workflow
docker-compose restart n8n
```

## Customization

### Update API Endpoints

Most workflows call AstralisOps API. Update the base URL in HTTP Request nodes:

```
Development: http://app:3001/api
Production: https://app.astralisone.com/api
```

### Add Authentication

For API calls to AstralisOps, add header:

```
X-API-Key: ${ASTRALIS_API_KEY}
```

### Configure Credentials

Each workflow requires credentials for services it uses:

1. OpenAI → Add OpenAI API key
2. SendGrid → Add SendGrid API key
3. Slack → Add Slack Webhook URL or OAuth token
4. Stripe → Add Stripe Secret Key

## Testing Workflows

### Test Webhook Workflows

```bash
# Get webhook URL from n8n workflow node
WEBHOOK_URL="http://localhost:5678/webhook/YOUR_WEBHOOK_ID"

# Send test request
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

### Test Scheduled Workflows

1. Open workflow in n8n
2. Click **Execute Workflow** button (instead of waiting for schedule)
3. Review execution results
4. Check for errors

## Best Practices

### Error Handling

- Add error workflow nodes to handle failures
- Log errors to Slack or email
- Implement retry logic for transient failures

### Logging

- Use Function nodes to log important data
- Store execution results in database
- Monitor workflow execution statistics

### Security

- Never hardcode API keys in workflows
- Use environment variables for sensitive data
- Validate webhook signatures
- Implement rate limiting for public webhooks

### Performance

- Batch API calls when possible
- Use async/await for parallel operations
- Prune old execution data regularly
- Monitor workflow execution times

## Creating New Templates

1. Build workflow in n8n UI
2. Test thoroughly with sample data
3. Export workflow: **...** → **Download**
4. Save to this directory with descriptive name
5. Update this README with template details
6. Commit to version control

## Support

For workflow issues:
1. Check n8n execution logs in UI
2. Review container logs: `docker logs astralis_n8n`
3. Verify credentials are configured correctly
4. Test individual nodes separately
5. Consult [n8n documentation](https://docs.n8n.io/)

---

**Last Updated**: November 2024
