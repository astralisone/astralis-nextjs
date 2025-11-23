/**
 * Specialized Prompt for Intake Request Classification
 *
 * This prompt is used for detailed intake classification when the main orchestration
 * agent needs specialized handling of incoming requests (emails, forms, webhooks).
 *
 * Focuses on:
 * - Intent categorization with granular sub-categories
 * - Urgency assessment with specific criteria
 * - Keyword and entity extraction
 * - Pipeline matching with confidence scores
 *
 * Example Input:
 * ```typescript
 * const intakeData = {
 *   source: 'FORM',
 *   subject: 'Partnership Inquiry',
 *   body: 'We are a software company interested in integrating...',
 *   senderEmail: 'john@company.com',
 *   senderName: 'John Smith',
 *   formFields: { company: 'TechCorp', interest: 'API Integration' }
 * };
 * ```
 */

/**
 * Intent categories for intake classification
 */
export const INTENT_CATEGORIES = {
  SALES_INQUIRY: {
    code: 'SALES_INQUIRY',
    description: 'Product inquiries, pricing questions, demo requests, purchase interest',
    keywords: [
      'pricing',
      'price',
      'cost',
      'demo',
      'trial',
      'buy',
      'purchase',
      'subscribe',
      'plan',
      'enterprise',
      'discount',
      'quote',
      'proposal',
      'interested in',
      'learn more',
      'features',
      'comparison',
      'alternative',
    ],
    defaultPipeline: 'sales-inquiries',
    defaultUrgency: 3,
    notifyRoles: ['SALES'],
  },
  SUPPORT_REQUEST: {
    code: 'SUPPORT_REQUEST',
    description: 'Technical issues, bug reports, help requests, troubleshooting',
    keywords: [
      'help',
      'issue',
      'problem',
      'error',
      'bug',
      'not working',
      "doesn't work",
      'broken',
      'crash',
      'fix',
      'troubleshoot',
      'support',
      'assistance',
      'stuck',
      'confused',
      'how to',
      'unable to',
      "can't",
      'failing',
    ],
    defaultPipeline: 'support-requests',
    defaultUrgency: 3,
    notifyRoles: ['SUPPORT', 'OPERATOR'],
  },
  BILLING_QUESTION: {
    code: 'BILLING_QUESTION',
    description: 'Invoice questions, payment issues, subscription changes, refunds',
    keywords: [
      'invoice',
      'bill',
      'billing',
      'payment',
      'charge',
      'refund',
      'cancel',
      'subscription',
      'upgrade',
      'downgrade',
      'receipt',
      'credit',
      'transaction',
      'overcharge',
      'dispute',
      'renewal',
    ],
    defaultPipeline: 'billing-questions',
    defaultUrgency: 2,
    notifyRoles: ['ADMIN', 'BILLING'],
  },
  PARTNERSHIP: {
    code: 'PARTNERSHIP',
    description: 'Collaboration proposals, integration requests, reseller inquiries',
    keywords: [
      'partner',
      'partnership',
      'collaborate',
      'collaboration',
      'integrate',
      'integration',
      'reseller',
      'affiliate',
      'white-label',
      'API',
      'SDK',
      'co-marketing',
      'joint venture',
      'alliance',
    ],
    defaultPipeline: 'partnerships',
    defaultUrgency: 2,
    notifyRoles: ['ADMIN', 'SALES'],
  },
  GENERAL: {
    code: 'GENERAL',
    description: 'General inquiries that do not fit other categories',
    keywords: ['question', 'inquiry', 'information', 'general', 'other'],
    defaultPipeline: 'general-intake',
    defaultUrgency: 2,
    notifyRoles: ['ADMIN'],
  },
  SPAM: {
    code: 'SPAM',
    description: 'Unsolicited marketing, irrelevant content, automated spam',
    keywords: [
      'unsubscribe',
      'click here',
      'limited time',
      'act now',
      'free money',
      'lottery',
      'winner',
      'congratulations',
      'viagra',
      'casino',
      'bitcoin opportunity',
      'make money fast',
    ],
    defaultPipeline: null,
    defaultUrgency: 1,
    notifyRoles: [],
  },
} as const;

/**
 * Urgency keywords and their associated levels
 */
export const URGENCY_KEYWORDS = {
  critical: {
    level: 5,
    keywords: [
      'emergency',
      'critical',
      'down',
      'outage',
      'production issue',
      'security breach',
      'data loss',
      'urgent asap',
      'immediately',
      'crisis',
    ],
    responseTime: '15 minutes',
  },
  high: {
    level: 4,
    keywords: [
      'urgent',
      'asap',
      'important',
      'deadline',
      'blocking',
      'escalate',
      'priority',
      'time-sensitive',
      'as soon as possible',
    ],
    responseTime: '2 hours',
  },
  medium: {
    level: 3,
    keywords: [
      'soon',
      'this week',
      'need help',
      'waiting',
      'follow up',
      'reminder',
    ],
    responseTime: '24 hours',
  },
  low: {
    level: 2,
    keywords: [
      'when possible',
      'no rush',
      'whenever',
      'low priority',
      'fyi',
      'just wondering',
    ],
    responseTime: '48-72 hours',
  },
  minimal: {
    level: 1,
    keywords: ['newsletter', 'update', 'announcement', 'information only'],
    responseTime: 'N/A',
  },
} as const;

/**
 * Main intake routing prompt
 */
export const INTAKE_ROUTING_PROMPT = `
You are an intake classification specialist. Your task is to analyze incoming requests and provide detailed classification for routing purposes.

## Input to Analyze
Source: {source}
Subject: {subject}
Body: {body}
Sender Email: {senderEmail}
Sender Name: {senderName}
Additional Fields: {additionalFields}
Timestamp: {timestamp}

## Your Tasks

### 1. Intent Classification
Classify the primary intent into one of these categories:
- **SALES_INQUIRY**: Product inquiries, pricing questions, demo requests, purchase interest
- **SUPPORT_REQUEST**: Technical issues, bug reports, help requests, troubleshooting
- **BILLING_QUESTION**: Invoice questions, payment issues, subscription changes, refunds
- **PARTNERSHIP**: Collaboration proposals, integration requests, reseller inquiries
- **GENERAL**: General inquiries that don't fit other categories
- **SPAM**: Unsolicited marketing, irrelevant content, automated spam

Also identify any secondary intent if applicable.

### 2. Urgency Assessment
Rate urgency on a 1-5 scale:
- **5 (Critical)**: System down, security issues, data loss, production emergencies
- **4 (High)**: Blocking issues, tight deadlines, significant business impact
- **3 (Medium)**: Standard requests with reasonable timelines
- **2 (Low)**: General inquiries, no time pressure
- **1 (Minimal)**: Informational only, no action required

Look for urgency indicators:
- Explicit keywords (urgent, ASAP, emergency, critical)
- Deadline mentions
- Business impact statements
- Repeat follow-ups

### 3. Keyword Extraction
Extract relevant keywords that:
- Indicate intent (pricing, bug, invoice, partner)
- Describe the issue or request
- Mention products, features, or services
- Indicate priority or timeline

### 4. Entity Recognition
Identify and extract:
- **Names**: Person names mentioned in the request
- **Companies**: Organization names, including sender's company
- **Products**: Product names, features, services mentioned
- **Dates**: Any dates or deadlines mentioned
- **Amounts**: Monetary values, quantities, metrics

### 5. Pipeline Matching
Based on the classification, suggest:
- Primary pipeline match with confidence score
- Alternative pipeline options (if ambiguous)
- Suggested stage within the pipeline
- Recommended assignee role

## Pipeline Matching Rules

For **SALES_INQUIRY**:
- Route to "Sales Inquiries" or "Lead Pipeline"
- Start at "New Leads" or "Qualification" stage
- Assign to SALES role
- Higher priority for enterprise mentions

For **SUPPORT_REQUEST**:
- Route to "Support Requests" or "Technical Support"
- Critical issues: "Critical" stage
- Standard issues: "New" or "Triage" stage
- Assign to SUPPORT or OPERATOR role

For **BILLING_QUESTION**:
- Route to "Billing" or "Finance" pipeline
- Assign to ADMIN or BILLING role
- Higher priority for payment failures

For **PARTNERSHIP**:
- Route to "Partnerships" or "Business Development"
- Assign to ADMIN or SALES role (leadership)
- Medium priority unless time-sensitive

For **GENERAL**:
- Route to "General Intake" pipeline
- Assign to ADMIN for triage
- Low-medium priority

For **SPAM**:
- Do NOT route to any pipeline
- Mark for archive/delete
- Confidence must be >0.9 to auto-classify as spam

## Response Format

Respond with valid JSON:

\`\`\`json
{
  "classification": {
    "primaryIntent": "SALES_INQUIRY|SUPPORT_REQUEST|BILLING_QUESTION|PARTNERSHIP|GENERAL|SPAM",
    "secondaryIntent": "string | null",
    "intentConfidence": 0.0-1.0,
    "reasoning": "Brief explanation"
  },
  "urgency": {
    "level": 1-5,
    "indicators": ["keyword or phrase that indicates urgency"],
    "suggestedResponseTime": "15 minutes|2 hours|24 hours|48-72 hours|N/A"
  },
  "extraction": {
    "keywords": ["relevant", "keywords"],
    "entities": {
      "names": [{"value": "John Smith", "type": "person", "context": "sender"}],
      "companies": [{"value": "TechCorp", "type": "company", "relationship": "prospect"}],
      "products": [{"value": "Enterprise Plan", "context": "interest"}],
      "dates": [{"value": "2024-01-15", "context": "deadline", "parsed": "2024-01-15T00:00:00Z"}],
      "amounts": [{"value": "$500", "context": "budget", "normalized": 500}]
    },
    "sentiment": "positive|neutral|negative|urgent"
  },
  "routing": {
    "suggestedPipeline": {
      "id": "pipeline-id",
      "name": "Pipeline Name",
      "confidence": 0.0-1.0
    },
    "alternativePipelines": [
      {"id": "string", "name": "string", "confidence": 0.0-1.0}
    ],
    "suggestedStage": {
      "id": "stage-id",
      "name": "Stage Name"
    },
    "suggestedAssigneeRole": "ADMIN|OPERATOR|PM|SALES|SUPPORT",
    "suggestedAssigneeId": "specific-user-id | null",
    "priority": 0-4,
    "tags": ["auto-generated", "tags"]
  },
  "flags": {
    "isSpam": false,
    "isDuplicate": false,
    "requiresImmediateAttention": false,
    "containsSensitiveInfo": false,
    "isAutoReply": false
  },
  "suggestedTitle": "Concise title for the intake item",
  "suggestedDescription": "Formatted description for the intake item"
}
\`\`\`

## Important Rules

1. **Be precise** - Only extract entities you are confident about
2. **Preserve context** - Include context for each extracted entity
3. **Handle ambiguity** - If unclear, provide alternatives with confidence scores
4. **Detect spam carefully** - Only classify as spam with >0.9 confidence
5. **Consider sender** - Known domains may have different routing rules
6. **Check for auto-replies** - "Out of office", "automatic reply" should be flagged
7. **Identify duplicates** - Note if content appears to be a duplicate or follow-up

## Examples

### Example 1: Clear Sales Inquiry

**Input:**
- Source: FORM
- Subject: Demo Request
- Body: "Hi, I'm the CTO at TechStartup Inc. We're evaluating project management tools and would like to see a demo of your enterprise features. Our team is about 50 people. Can we schedule something next week?"
- Sender: cto@techstartup.com

**Output:**
\`\`\`json
{
  "classification": {
    "primaryIntent": "SALES_INQUIRY",
    "secondaryIntent": null,
    "intentConfidence": 0.95,
    "reasoning": "Explicit demo request from executive at prospect company, evaluating product"
  },
  "urgency": {
    "level": 3,
    "indicators": ["next week"],
    "suggestedResponseTime": "24 hours"
  },
  "extraction": {
    "keywords": ["demo", "enterprise", "project management", "evaluating"],
    "entities": {
      "names": [{"value": "CTO", "type": "role", "context": "sender title"}],
      "companies": [{"value": "TechStartup Inc", "type": "company", "relationship": "prospect"}],
      "products": [{"value": "enterprise features", "context": "interest"}],
      "dates": [{"value": "next week", "context": "requested timeline", "parsed": null}],
      "amounts": [{"value": "50 people", "context": "team size", "normalized": 50}]
    },
    "sentiment": "positive"
  },
  "routing": {
    "suggestedPipeline": {"id": "sales-inquiries", "name": "Sales Inquiries", "confidence": 0.95},
    "alternativePipelines": [],
    "suggestedStage": {"id": "demo-scheduled", "name": "Demo Scheduled"},
    "suggestedAssigneeRole": "SALES",
    "suggestedAssigneeId": null,
    "priority": 3,
    "tags": ["demo-request", "enterprise", "50-users"]
  },
  "flags": {
    "isSpam": false,
    "isDuplicate": false,
    "requiresImmediateAttention": false,
    "containsSensitiveInfo": false,
    "isAutoReply": false
  },
  "suggestedTitle": "Demo Request - TechStartup Inc (50 users)",
  "suggestedDescription": "Enterprise demo request from CTO at TechStartup Inc. Team size: 50 people. Requested timeline: next week."
}
\`\`\`

### Example 2: Urgent Support Request

**Input:**
- Source: EMAIL
- Subject: URGENT: Login not working for all users
- Body: "Our entire company cannot log in since this morning. We have a critical client presentation in 2 hours. Please help immediately!"
- Sender: admin@bigclient.com

**Output:**
\`\`\`json
{
  "classification": {
    "primaryIntent": "SUPPORT_REQUEST",
    "secondaryIntent": null,
    "intentConfidence": 0.98,
    "reasoning": "Clear technical issue affecting multiple users with explicit urgency"
  },
  "urgency": {
    "level": 5,
    "indicators": ["URGENT", "entire company", "critical", "2 hours", "immediately"],
    "suggestedResponseTime": "15 minutes"
  },
  "extraction": {
    "keywords": ["login", "not working", "all users", "critical", "presentation"],
    "entities": {
      "names": [],
      "companies": [{"value": "bigclient.com", "type": "company", "relationship": "customer"}],
      "products": [{"value": "login system", "context": "issue area"}],
      "dates": [{"value": "this morning", "context": "issue start"}, {"value": "2 hours", "context": "deadline"}],
      "amounts": [{"value": "entire company", "context": "affected users"}]
    },
    "sentiment": "urgent"
  },
  "routing": {
    "suggestedPipeline": {"id": "support-requests", "name": "Support Requests", "confidence": 0.98},
    "alternativePipelines": [],
    "suggestedStage": {"id": "critical", "name": "Critical"},
    "suggestedAssigneeRole": "OPERATOR",
    "suggestedAssigneeId": "on-call-engineer",
    "priority": 4,
    "tags": ["critical", "login-issue", "company-wide", "blocking"]
  },
  "flags": {
    "isSpam": false,
    "isDuplicate": false,
    "requiresImmediateAttention": true,
    "containsSensitiveInfo": false,
    "isAutoReply": false
  },
  "suggestedTitle": "[CRITICAL] Company-wide login failure - bigclient.com",
  "suggestedDescription": "URGENT: Entire company unable to log in since this morning. Client presentation in 2 hours. Immediate response required."
}
\`\`\`
`.trim();

/**
 * Build the intake routing prompt with actual data
 */
export function buildIntakeRoutingPrompt(intake: {
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  subject: string;
  body: string;
  senderEmail: string;
  senderName?: string;
  additionalFields?: Record<string, unknown>;
  timestamp?: Date;
}): string {
  const {
    source,
    subject,
    body,
    senderEmail,
    senderName = 'Unknown',
    additionalFields = {},
    timestamp = new Date(),
  } = intake;

  return INTAKE_ROUTING_PROMPT.replace('{source}', source)
    .replace('{subject}', subject)
    .replace('{body}', body)
    .replace('{senderEmail}', senderEmail)
    .replace('{senderName}', senderName)
    .replace('{additionalFields}', JSON.stringify(additionalFields, null, 2))
    .replace('{timestamp}', timestamp.toISOString());
}

/**
 * Utility to detect urgency from text
 */
export function detectUrgencyLevel(text: string): {
  level: number;
  matchedKeywords: string[];
} {
  const normalizedText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  let maxLevel = 1;

  for (const [, config] of Object.entries(URGENCY_KEYWORDS)) {
    for (const keyword of config.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        if (config.level > maxLevel) {
          maxLevel = config.level;
        }
      }
    }
  }

  return {
    level: maxLevel,
    matchedKeywords: [...new Set(matchedKeywords)],
  };
}

/**
 * Utility to detect intent category from text
 */
export function detectIntentCategory(text: string): {
  category: keyof typeof INTENT_CATEGORIES;
  confidence: number;
  matchedKeywords: string[];
}[] {
  const normalizedText = text.toLowerCase();
  const results: {
    category: keyof typeof INTENT_CATEGORIES;
    confidence: number;
    matchedKeywords: string[];
  }[] = [];

  for (const [category, config] of Object.entries(INTENT_CATEGORIES)) {
    const matchedKeywords: string[] = [];
    for (const keyword of config.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      // Simple confidence based on keyword matches
      const confidence = Math.min(0.5 + matchedKeywords.length * 0.1, 0.95);
      results.push({
        category: category as keyof typeof INTENT_CATEGORIES,
        confidence,
        matchedKeywords,
      });
    }
  }

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence);
}

export default INTAKE_ROUTING_PROMPT;
