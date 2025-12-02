# Phase 9: AI Intake Routing

**Duration**: 1-2 weeks
**Prerequisites**: Phase 6 complete (automation infrastructure)
**Priority**: Critical - Core AstralisOps feature

---

## Overview

Implement the AI-powered intake routing system that automatically classifies, tags, prioritizes, and routes incoming requests to the appropriate team member, pipeline, or workflow.

**Marketing Promise:**
> "Client emails and form submissions automatically get organized and assigned to the right person on your team. No more manual sorting through your inbox to figure out who should handle what."

---

## Current State (as of Phase 6)

### What Exists
- `intakeRequest` database model with status, source, priority, AI routing metadata
- `/api/intake` endpoints (GET, POST, PATCH, DELETE)
- Authenticated intake dashboard at `/(app)/intake`
- IntakeSource enum: FORM, EMAIL, CHAT, API
- IntakeStatus enum: NEW, ROUTING, ASSIGNED, PROCESSING, COMPLETED, REJECTED
- `aiRoutingMeta` JSON field for storing routing decisions

### What's Missing
- AI classification engine (no OpenAI/Anthropic integration)
- Auto-routing algorithm (no assignment logic)
- Email ingestion system (no IMAP/webhook integration)
- Form submission triggers (contact forms don't create intake requests)
- Tagging system (no automated tagging based on content)
- Monthly quota tracking (no 500 requests/month enforcement for Starter plan)

---

## Implementation Plan

### 1. AI Classification Service

Create `src/lib/services/aiRouting.service.ts`:

```typescript
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { IntakeStatus, IntakeSource } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ClassificationResult {
  category: string;
  subcategory: string;
  priority: number; // 1-5 (5 = highest)
  tags: string[];
  suggestedAssignee?: string;
  suggestedPipeline?: string;
  confidence: number;
  reasoning: string;
}

interface RoutingDecision {
  assignedToId?: string;
  assignedPipelineId?: string;
  priority: number;
  tags: string[];
  routingMeta: Record<string, unknown>;
}

export class AIRoutingService {
  /**
   * Classify incoming request using GPT-4
   */
  async classifyRequest(
    title: string,
    description: string,
    source: IntakeSource,
    metadata?: Record<string, unknown>
  ): Promise<ClassificationResult> {
    const systemPrompt = `You are an AI intake routing assistant for a professional services business.
Analyze incoming requests and classify them for routing.

Categories:
- SALES_INQUIRY: New business opportunities, pricing questions, demos
- SUPPORT_REQUEST: Existing client issues, bugs, help needed
- BILLING_QUESTION: Invoice questions, payment issues, subscription changes
- PARTNERSHIP: Collaboration proposals, integration requests
- GENERAL: Everything else

Priority Levels (1-5):
1 = Low: General inquiries, no urgency
2 = Normal: Standard requests, reasonable timeline
3 = Medium: Business impact, needs attention this week
4 = High: Urgent client issue, revenue impact
5 = Critical: Emergency, immediate action required

Return JSON with: category, subcategory, priority, tags (array), suggestedAssignee (role), confidence (0-1), reasoning`;

    const userPrompt = `Request Details:
Title: ${title}
Description: ${description}
Source: ${source}
${metadata ? `Metadata: ${JSON.stringify(metadata)}` : ''}

Classify this request and return JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No classification response from AI');
    }

    return JSON.parse(content) as ClassificationResult;
  }

  /**
   * Route request to appropriate team member or pipeline
   */
  async routeRequest(
    orgId: string,
    classification: ClassificationResult
  ): Promise<RoutingDecision> {
    // Fetch organization's routing rules and team members
    const [teamMembers, pipelines] = await Promise.all([
      prisma.users.findMany({
        where: { orgId, isActive: true },
        select: { id: true, role: true, email: true, name: true },
      }),
      prisma.pipeline.findMany({
        where: { orgId, isActive: true },
        select: { id: true, name: true, description: true },
      }),
    ]);

    // Match category to pipeline
    let assignedPipelineId: string | undefined;
    const pipelineMatch = pipelines.find((p) =>
      p.name.toLowerCase().includes(classification.category.toLowerCase()) ||
      p.description?.toLowerCase().includes(classification.category.toLowerCase())
    );
    if (pipelineMatch) {
      assignedPipelineId = pipelineMatch.id;
    }

    // Match suggested role to team member
    let assignedToId: string | undefined;
    if (classification.suggestedAssignee) {
      const roleMapping: Record<string, string[]> = {
        sales: ['ADMIN', 'OPERATOR'],
        support: ['OPERATOR', 'ADMIN'],
        billing: ['ADMIN'],
        technical: ['OPERATOR'],
      };

      const targetRoles = roleMapping[classification.suggestedAssignee.toLowerCase()] || ['OPERATOR'];
      const availableMember = teamMembers.find((m) =>
        targetRoles.includes(m.role)
      );
      if (availableMember) {
        assignedToId = availableMember.id;
      }
    }

    // Load balance if no specific assignment
    if (!assignedToId && teamMembers.length > 0) {
      // Get current workload per team member
      const workloads = await prisma.intakeRequest.groupBy({
        by: ['assignedPipeline'],
        where: {
          orgId,
          status: { in: ['NEW', 'ROUTING', 'ASSIGNED', 'PROCESSING'] },
        },
        _count: true,
      });

      // Assign to team member with lowest workload
      // (simplified - in production, track actual assignee workload)
      assignedToId = teamMembers[0].id;
    }

    return {
      assignedToId,
      assignedPipelineId,
      priority: classification.priority,
      tags: classification.tags,
      routingMeta: {
        category: classification.category,
        subcategory: classification.subcategory,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        classifiedAt: new Date().toISOString(),
        aiModel: 'gpt-4-turbo-preview',
      },
    };
  }

  /**
   * Process intake request through full AI routing pipeline
   */
  async processIntakeRequest(intakeId: string): Promise<void> {
    const intake = await prisma.intakeRequest.findUnique({
      where: { id: intakeId },
      include: { organization: true },
    });

    if (!intake) {
      throw new Error(`Intake request ${intakeId} not found`);
    }

    // Update status to ROUTING
    await prisma.intakeRequest.update({
      where: { id: intakeId },
      data: { status: 'ROUTING' },
    });

    try {
      // Classify the request
      const classification = await this.classifyRequest(
        intake.title,
        intake.description || '',
        intake.source,
        intake.requestData as Record<string, unknown>
      );

      // Route the request
      const routing = await this.routeRequest(intake.orgId, classification);

      // Update intake with routing decision
      await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          status: routing.assignedToId ? 'ASSIGNED' : 'NEW',
          priority: routing.priority,
          assignedPipeline: routing.assignedPipelineId,
          aiRoutingMeta: routing.routingMeta,
        },
      });

      // TODO: Send notification to assigned team member
    } catch (error) {
      // Update with error status
      await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          status: 'NEW', // Fallback to manual routing
          aiRoutingMeta: {
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString(),
          },
        },
      });
      throw error;
    }
  }
}

export const aiRoutingService = new AIRoutingService();
```

### 2. Intake Routing Worker

Create `src/workers/processors/intakeRouting.processor.ts`:

```typescript
import { Job } from 'bullmq';
import { aiRoutingService } from '@/lib/services/aiRouting.service';

interface IntakeRoutingJobData {
  intakeId: string;
  orgId: string;
}

export async function processIntakeRouting(
  job: Job<IntakeRoutingJobData>
): Promise<void> {
  const { intakeId } = job.data;

  console.log(`[IntakeRouting] Processing intake ${intakeId}`);

  await aiRoutingService.processIntakeRequest(intakeId);

  console.log(`[IntakeRouting] Completed routing for intake ${intakeId}`);
}
```

### 3. Email Ingestion Webhook

Create `src/app/api/webhooks/email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { intakeRoutingQueue } from '@/workers/queues/intakeRouting.queue';
import crypto from 'crypto';

// Webhook for email ingestion (SendGrid, Postmark, or Mailgun)
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (example for SendGrid)
    const signature = req.headers.get('x-sendgrid-signature');
    const timestamp = req.headers.get('x-sendgrid-timestamp');

    if (!verifyWebhookSignature(signature, timestamp, await req.text())) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = await req.json();

    // Parse email data (structure depends on provider)
    const email = {
      from: body.from || body.envelope?.from,
      subject: body.subject,
      text: body.text || body.plain,
      html: body.html,
      attachments: body.attachments || [],
    };

    // Find organization by recipient email domain
    // (assumes emails like support@clientdomain.com are forwarded)
    const recipientDomain = extractDomain(body.to);
    const org = await prisma.organization.findFirst({
      where: {
        // Match on custom email domain or default org
        // This needs customization per deployment
      },
    });

    if (!org) {
      console.warn(`[EmailIngestion] No org found for domain ${recipientDomain}`);
      return NextResponse.json({ error: 'Unknown recipient' }, { status: 404 });
    }

    // Create intake request from email
    const intake = await prisma.intakeRequest.create({
      data: {
        source: 'EMAIL',
        status: 'NEW',
        title: email.subject || 'Email Inquiry',
        description: email.text?.substring(0, 2000),
        requestData: {
          fromEmail: email.from,
          subject: email.subject,
          bodyPreview: email.text?.substring(0, 500),
          hasAttachments: email.attachments.length > 0,
          receivedAt: new Date().toISOString(),
        },
        priority: 2,
        orgId: org.id,
      },
    });

    // Queue for AI routing
    await intakeRoutingQueue.add('route-intake', {
      intakeId: intake.id,
      orgId: org.id,
    });

    return NextResponse.json({ success: true, intakeId: intake.id });
  } catch (error) {
    console.error('[EmailIngestion] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(
  signature: string | null,
  timestamp: string | null,
  body: string
): boolean {
  if (!signature || !timestamp) return false;

  const secret = process.env.EMAIL_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(timestamp + body)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function extractDomain(email: string): string {
  return email.split('@')[1] || '';
}
```

### 4. Contact Form Integration

Update `src/app/api/contact/route.ts` to create intake requests:

```typescript
// Add after existing contact form logic:

// Create intake request for AI routing
const intake = await prisma.intakeRequest.create({
  data: {
    source: 'FORM',
    status: 'NEW',
    title: `Contact Form: ${parsed.data.subject}`,
    description: parsed.data.message,
    requestData: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      formType: 'contact',
      submittedAt: new Date().toISOString(),
    },
    priority: 2,
    orgId: defaultOrgId, // Configure default org for public forms
  },
});

// Queue for AI routing
await intakeRoutingQueue.add('route-intake', {
  intakeId: intake.id,
  orgId: defaultOrgId,
});
```

### 5. Monthly Quota Tracking

Create `src/lib/services/quotaTracking.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';

interface QuotaLimits {
  intake: number;
  documents: number;
  teamMembers: number;
  pipelines: number;
}

const PLAN_LIMITS: Record<string, QuotaLimits> = {
  starter: {
    intake: 500,
    documents: 100,
    teamMembers: 3,
    pipelines: 5,
  },
  professional: {
    intake: 5000,
    documents: 1000,
    teamMembers: 15,
    pipelines: -1, // unlimited
  },
  enterprise: {
    intake: -1, // unlimited
    documents: -1,
    teamMembers: -1,
    pipelines: -1,
  },
};

export class QuotaTrackingService {
  async checkIntakeQuota(orgId: string): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
  }> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      // Assumes plan field added to organization model
    });

    const plan = 'starter'; // TODO: Get from org.plan
    const limits = PLAN_LIMITS[plan];

    if (limits.intake === -1) {
      return { allowed: true, used: 0, limit: -1, remaining: -1 };
    }

    // Count this month's intake requests
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const used = await prisma.intakeRequest.count({
      where: {
        orgId,
        createdAt: { gte: startOfMonth },
      },
    });

    const remaining = limits.intake - used;

    return {
      allowed: remaining > 0,
      used,
      limit: limits.intake,
      remaining: Math.max(0, remaining),
    };
  }
}

export const quotaTrackingService = new QuotaTrackingService();
```

---

## Testing Checklist

- [ ] AI classification returns valid category, priority, and tags
- [ ] Routing assigns requests to appropriate team members
- [ ] Email webhook creates intake requests from inbound emails
- [ ] Contact form submissions create intake requests
- [ ] Quota tracking enforces 500 requests/month for Starter plan
- [ ] Notifications sent to assigned team members
- [ ] Error handling preserves requests when AI fails
- [ ] Classification confidence scores are accurate

---

## Environment Variables Required

```bash
# AI Routing
OPENAI_API_KEY="sk-..."

# Email Webhook (choose one provider)
EMAIL_WEBHOOK_SECRET="<webhook-secret>"
SENDGRID_INBOUND_PARSE_WEBHOOK_URL="<your-webhook-url>"

# Default organization for public forms
DEFAULT_ORG_ID="<default-org-id>"
```

---

## Success Criteria

1. Incoming emails automatically create intake requests
2. Contact form submissions route through AI classification
3. Requests are assigned to team members based on category
4. Priority is set based on content analysis
5. Monthly quota enforced at 500 requests for Starter plan
6. <5 second average routing time per request
7. >85% classification accuracy on test dataset
