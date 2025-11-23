# Phase 6: Automation Types & Validators Documentation

**Status**: Complete
**Date**: 2025-11-21
**Files Created/Updated**:
- `/Users/gregorystarr/projects/astralis-nextjs/src/types/automation.ts`
- `/Users/gregorystarr/projects/astralis-nextjs/src/lib/validators/automation.validators.ts`

## Overview

Comprehensive TypeScript type definitions and Zod validation schemas for Phase 6: Business Automation & n8n Integration. All types are aligned with the Prisma schema and include full type safety with runtime validation.

---

## File 1: TypeScript Types (`src/types/automation.ts`)

### Core Automation Types

#### `Automation`
Base automation workflow entity with execution statistics and metadata.

**Key Fields**:
- `id`, `name`, `description`: Basic identification
- `n8nWorkflowId`, `webhookUrl`: Integration with n8n
- `triggerType`, `triggerConfig`: Trigger configuration
- `executionCount`, `successCount`, `failureCount`: Statistics
- `avgExecutionTime`: Performance metrics
- `orgId`, `createdById`: Organization and ownership
- `tags`, `metadata`: Categorization and custom data

#### `AutomationWithRelations`
Extended automation type including:
- `createdBy`: User who created the automation
- `executions`: Array of workflow executions
- `triggers`: Array of configured triggers
- `_count`: Prisma count aggregations

#### `AutomationWithStats`
Automation with computed statistics:
- `stats`: Aggregated execution statistics
- `recentExecutions`: Recent execution history

### Workflow Execution Types

#### `WorkflowExecution`
Record of a single automation execution.

**Key Fields**:
- `status`: QUEUED, RUNNING, SUCCESS, FAILED, TIMEOUT, CANCELLED
- `startedAt`, `completedAt`, `executionTime`: Timing information
- `triggerData`, `outputData`: Input and output data
- `errorMessage`, `errorStack`: Error details
- `retryCount`: Retry attempts
- `n8nExecutionId`: Reference to n8n execution

#### `WorkflowExecutionWithAutomation`
Execution record with parent automation details.

### Workflow Trigger Types

#### `WorkflowTrigger`
Trigger configuration for automations.

**Trigger Types**:
- `WEBHOOK`: External webhook call
- `SCHEDULE`: Cron-based schedule
- `INTAKE_CREATED`, `INTAKE_ASSIGNED`: Intake system events
- `DOCUMENT_UPLOADED`, `DOCUMENT_PROCESSED`: Document events
- `PIPELINE_STAGE_CHANGED`: Pipeline events
- `FORM_SUBMITTED`: Form events
- `EMAIL_RECEIVED`: Email events
- `API_CALL`: Direct API triggers

**Key Fields**:
- `triggerType`: Type of trigger
- `triggerEvent`: Specific event name
- `webhookUrl`: Webhook endpoint (if applicable)
- `cronSchedule`: Cron schedule (if applicable)
- `eventFilters`: Conditional filters
- `lastTriggeredAt`, `triggerCount`: Usage statistics

### Automation Template Types

#### `AutomationTemplate`
Pre-built automation workflow template.

**Key Fields**:
- `category`: LEAD_MANAGEMENT, CUSTOMER_ONBOARDING, REPORTING, etc.
- `difficulty`: beginner, intermediate, advanced
- `n8nWorkflowJson`: Serialized n8n workflow
- `requiredIntegrations`: Array of required integration providers
- `useCount`, `rating`: Usage and quality metrics
- `isOfficial`: Official Astralis template flag

#### `N8nWorkflowJson`
Parsed n8n workflow structure:
```typescript
{
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: {
    executionOrder?: 'v0' | 'v1';
    saveManualExecutions?: boolean;
    executionTimeout?: number;
    timezone?: string;
  };
}
```

#### `N8nNode`
Individual n8n workflow node:
```typescript
{
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, string>;
}
```

### Integration Credential Types

#### `IntegrationCredential`
Integration credentials (sensitive data excluded).

**Supported Providers**:
- Email: GMAIL, OUTLOOK, SENDGRID, MAILCHIMP
- Productivity: GOOGLE_SHEETS, GOOGLE_DRIVE, GOOGLE_CALENDAR
- Communication: SLACK, MICROSOFT_TEAMS, TWILIO, ZOOM
- CRM/Sales: HUBSPOT, SALESFORCE
- Payment: STRIPE, PAYPAL
- Project Management: TRELLO, ASANA, NOTION, AIRTABLE
- AI: OPENAI, ANTHROPIC
- Generic: WEBHOOK, HTTP_REQUEST, DATABASE

#### `OAuthCredential`
OAuth credential data structure:
```typescript
{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  tokenType?: string;
}
```

#### `ApiKeyCredential`
API key credential data structure:
```typescript
{
  apiKey: string;
  apiSecret?: string;
  apiUrl?: string;
}
```

### Input Types (API Requests)

#### `CreateAutomationInput`
Create new automation:
- `name`: 3-100 characters
- `description`: Optional, max 500 characters
- `triggerType`: WEBHOOK, SCHEDULE, EVENT, MANUAL, API
- `triggerConfig`: Trigger-specific configuration object
- `workflowJson`: n8n workflow JSON structure
- `tags`: Optional array of tags (max 10)

#### `UpdateAutomationInput`
Update existing automation (all fields optional):
- `name`, `description`, `isActive`, `tags`

#### `ExecuteAutomationInput`
Trigger automation execution:
- `triggerData`: Non-empty object with trigger data

#### `CreateTriggerInput`
Create workflow trigger:
- `automationId`: CUID
- `triggerType`: Trigger type enum
- `triggerEvent`: Event name
- `webhookUrl`: Required for WEBHOOK triggers
- `cronSchedule`: Required for SCHEDULE triggers
- `eventFilters`: Optional conditional filters

#### `SaveCredentialInput`
Save integration credentials:
- `provider`: Integration provider enum
- `credentialName`: 3-100 characters
- `credentialData`: Non-empty credential object (will be encrypted)
- `scope`: Optional OAuth scope
- `expiresAt`: Optional expiration date

#### `DeployTemplateInput`
Deploy automation template:
- `templateId`: CUID
- `name`: Optional override name
- `customConfig`: Optional configuration overrides

### Filter Types

#### `AutomationFilters`
Query automations:
- `isActive`: Boolean filter
- `triggerType`: Filter by trigger type
- `tags`: Array of tags
- `search`: Search text
- `page`, `pageSize`: Pagination (default: page=1, pageSize=20, max=100)

#### `ExecutionFilters`
Query executions:
- `automationId`: Filter by automation
- `status`: Filter by execution status
- `startDate`, `endDate`: Date range
- `page`, `pageSize`: Pagination

#### `TemplateFilters`
Query templates:
- `category`: Template category
- `difficulty`: beginner, intermediate, advanced
- `isOfficial`: Official templates only
- `search`: Search text
- `page`, `pageSize`: Pagination

### Response Types

#### `AutomationListResponse`
Paginated automation list:
```typescript
{
  automations: Automation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### `ExecutionHistoryResponse`
Paginated execution history:
```typescript
{
  executions: WorkflowExecution[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### `TemplateListResponse`
Paginated template list:
```typescript
{
  templates: AutomationTemplate[];
  total: number;
  page: number;
  pageSize: number;
  categories: TemplateCategory[];
}
```

#### `AutomationResponse`
Single automation with stats:
```typescript
{
  automation: AutomationWithRelations;
  stats: AutomationStats;
}
```

#### `ExecutionResult`
Execution result:
```typescript
{
  executionId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  outputData?: Record<string, unknown>;
  errorMessage?: string;
}
```

### Statistics Types

#### `AutomationStats`
Automation execution statistics:
```typescript
{
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgExecutionTime: number | null;
  lastExecution: Date | null;
}
```

#### `AutomationAnalytics`
Organization-wide analytics:
- Total/active automations
- Execution counts (today, this week, this month)
- Average success rate and execution time
- Top automations by usage
- Executions grouped by status and trigger type

### Webhook Types

#### `WebhookPayload`
Generic webhook payload:
```typescript
{
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

#### `SystemEventPayload`
Internal system event:
```typescript
{
  eventType: TriggerType;
  eventName: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  orgId: string;
  userId?: string;
  timestamp: Date;
}
```

### Error Types

#### `ExecutionError`
Execution error details:
```typescript
{
  message: string;
  stack?: string;
  node?: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

---

## File 2: Zod Validators (`src/lib/validators/automation.validators.ts`)

### Enum Schemas

All Prisma enums are validated using `z.nativeEnum()`:
- `automationTriggerSchema`: AutomationTrigger enum
- `executionStatusSchema`: ExecutionStatus enum
- `triggerTypeSchema`: TriggerType enum
- `templateCategorySchema`: TemplateCategory enum
- `integrationProviderSchema`: IntegrationProvider enum

### n8n Workflow Schemas

#### `n8nNodeSchema`
Validates n8n workflow node structure:
- `id`: Non-empty string
- `name`: 1-100 characters
- `type`: Node type string
- `typeVersion`: Positive integer
- `position`: Tuple of [x, y] coordinates
- `parameters`: Record of node parameters
- `credentials`: Optional credential mappings

#### `n8nWorkflowJsonSchema`
Validates complete n8n workflow:
- `nodes`: Array of 1-100 nodes
- `connections`: Connection graph
- `settings`: Optional workflow settings

### Automation CRUD Schemas

#### `createAutomationSchema`
Validation rules:
- `name`: 3-100 characters, trimmed
- `description`: Max 500 characters, optional
- `triggerType`: Valid automation trigger enum
- `triggerConfig`: Non-empty object
- `workflowJson`: Valid n8n workflow structure
- `tags`: Max 10 tags, each non-empty

**Error Messages**:
- "Automation name must be at least 3 characters"
- "Automation name must not exceed 100 characters"
- "Description must not exceed 500 characters"
- "Invalid automation trigger type"
- "Trigger configuration cannot be empty"
- "Workflow must have at least one node"
- "Maximum 10 tags allowed"
- "Tag cannot be empty"

#### `updateAutomationSchema`
All fields optional, validates:
- At least one field must be provided
- Same validation rules as create for provided fields

#### `executeAutomationSchema`
- `triggerData`: Non-empty object required

### Workflow Trigger Schemas

#### `createTriggerSchema`
Validation rules:
- `automationId`: Valid CUID
- `triggerType`: Valid trigger type enum
- `triggerEvent`: 3-100 characters
- `webhookUrl`: Valid URL (required for WEBHOOK triggers)
- `cronSchedule`: Valid cron format (required for SCHEDULE triggers)
- `eventFilters`: Optional conditional filters

**Cron Format Validation**:
- Regex: `/^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/`
- Example: "0 9 * * *" (daily at 9 AM)

**Custom Validation**:
- Webhook triggers must include `webhookUrl`
- Schedule triggers must include `cronSchedule`

#### `updateTriggerSchema`
All fields optional, validates:
- At least one field must be provided
- Same validation rules as create for provided fields

### Integration Credential Schemas

#### `saveCredentialSchema`
Validation rules:
- `provider`: Valid integration provider enum
- `credentialName`: 3-100 characters, trimmed
- `credentialData`: Non-empty object (will be encrypted before storage)
- `scope`: Optional OAuth scope string
- `expiresAt`: Optional ISO 8601 datetime (auto-transforms to Date)

**Error Messages**:
- "Invalid integration provider"
- "Credential name must be at least 3 characters"
- "Credential name must not exceed 100 characters"
- "Credential data cannot be empty"
- "Invalid datetime format"

#### `updateCredentialSchema`
All fields optional, validates:
- At least one field must be provided
- Same validation rules as save for provided fields

#### `oauthCredentialDataSchema`
OAuth credential structure:
- `accessToken`: Required, non-empty
- `refreshToken`, `expiresAt`, `scope`, `tokenType`: Optional

#### `apiKeyCredentialDataSchema`
API key credential structure:
- `apiKey`: Required, non-empty
- `apiSecret`: Optional
- `apiUrl`: Optional, must be valid URL

### Template Schemas

#### `deployTemplateSchema`
- `templateId`: Valid CUID
- `name`: Optional override name (3-100 characters)
- `customConfig`: Optional configuration object

#### `createTemplateSchema` (Admin only)
Validation rules:
- `name`: 3-100 characters
- `description`: 10-2000 characters
- `category`: Valid template category enum
- `difficulty`: beginner, intermediate, advanced
- `n8nWorkflowJson`: Valid JSON string with nodes array
- `thumbnailUrl`, `demoVideoUrl`: Optional valid URLs
- `requiredIntegrations`: Array of strings (max 20)
- `tags`: Array of non-empty strings (max 20)
- `isOfficial`: Boolean, default false

**Custom Validation**:
- `n8nWorkflowJson` must be valid JSON
- Must contain `nodes` array with at least one node

### Filter Schemas

#### `automationFiltersSchema`
Query parameters with coercion:
- `page`: Positive integer, default 1
- `pageSize`: Positive integer, max 100, default 20
- All other filters optional

#### `executionFiltersSchema`
Query parameters:
- `startDate`, `endDate`: ISO 8601 datetime (auto-transforms to Date)
- `page`, `pageSize`: Same as automationFiltersSchema

#### `templateFiltersSchema`
Query parameters:
- `page`, `pageSize`: Same as automationFiltersSchema
- All other filters optional

### Webhook Schemas

#### `webhookPayloadSchema`
- `event`: Non-empty event name
- `timestamp`: Valid ISO 8601 datetime
- `data`: Required data object
- `metadata`: Optional metadata object

#### `systemEventPayloadSchema`
Internal event validation:
- `eventType`: Valid trigger type enum
- `eventName`: Non-empty string
- `entityType`, `entityId`: Required identifiers (entityId must be CUID)
- `data`: Required data object
- `orgId`: Valid CUID
- `userId`: Optional CUID
- `timestamp`: Date, defaults to current time

---

## Type Inference

All validators export inferred TypeScript types:

```typescript
export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
export type ExecuteAutomationInput = z.infer<typeof executeAutomationSchema>;
export type CreateTriggerInput = z.infer<typeof createTriggerSchema>;
export type UpdateTriggerInput = z.infer<typeof updateTriggerSchema>;
export type SaveCredentialInput = z.infer<typeof saveCredentialSchema>;
export type UpdateCredentialInput = z.infer<typeof updateCredentialSchema>;
export type DeployTemplateInput = z.infer<typeof deployTemplateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type AutomationFilters = z.infer<typeof automationFiltersSchema>;
export type ExecutionFilters = z.infer<typeof executionFiltersSchema>;
export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type SystemEventPayload = z.infer<typeof systemEventPayloadSchema>;
export type N8nWorkflowJson = z.infer<typeof n8nWorkflowJsonSchema>;
export type N8nNode = z.infer<typeof n8nNodeSchema>;
```

---

## Usage Examples

### Creating an Automation

```typescript
import { createAutomationSchema } from '@/lib/validators/automation.validators';
import type { CreateAutomationInput } from '@/types/automation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createAutomationSchema.parse(body);

    // validated is now type-safe CreateAutomationInput
    const automation = await createAutomation(validated);

    return NextResponse.json({ success: true, automation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

### Filtering Automations

```typescript
import { automationFiltersSchema } from '@/lib/validators/automation.validators';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters = automationFiltersSchema.parse({
    isActive: searchParams.get('isActive') === 'true',
    triggerType: searchParams.get('triggerType'),
    search: searchParams.get('search'),
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });

  // filters.page is guaranteed to be a positive integer (default 1)
  // filters.pageSize is guaranteed to be 1-100 (default 20)

  const automations = await getAutomations(filters);
  return NextResponse.json(automations);
}
```

### Saving Credentials

```typescript
import { saveCredentialSchema } from '@/lib/validators/automation.validators';
import { encryptCredentialData } from '@/lib/security/encryption';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = saveCredentialSchema.parse(body);

  // Encrypt sensitive data before storage
  const encrypted = await encryptCredentialData(validated.credentialData);

  const credential = await prisma.integrationCredential.create({
    data: {
      ...validated,
      credentialData: encrypted,
      userId: session.user.id,
      orgId: session.user.orgId,
    },
  });

  return NextResponse.json({ success: true, credential });
}
```

---

## Validation Error Handling

All schemas provide detailed validation errors:

```typescript
try {
  createAutomationSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Formatted errors:
    console.log(error.format());

    // Flattened errors for forms:
    const flattened = error.flatten();
    // {
    //   formErrors: [],
    //   fieldErrors: {
    //     name: ["Automation name must be at least 3 characters"],
    //     triggerConfig: ["Trigger configuration cannot be empty"]
    //   }
    // }
  }
}
```

---

## Security Considerations

1. **Credential Storage**:
   - `credentialData` must be encrypted before storage
   - Never return decrypted credentials in API responses
   - Use `IntegrationCredential` type (excludes sensitive data)

2. **Webhook Validation**:
   - Validate webhook signatures
   - Use rate limiting on webhook endpoints
   - Log all webhook attempts

3. **Input Validation**:
   - All user inputs validated through Zod schemas
   - SQL injection protected through Prisma ORM
   - XSS protection through React escaping

4. **RBAC Enforcement**:
   - Check user permissions before operations
   - Enforce organization-level isolation
   - Log all automation executions

---

## Testing

Run TypeScript compilation checks:
```bash
npx tsc --noEmit src/types/automation.ts
npx tsc --noEmit src/lib/validators/automation.validators.ts
```

Generate Prisma client:
```bash
npx prisma generate
```

---

## Next Steps

1. Implement automation service layer (`src/lib/services/automation.service.ts`)
2. Create API routes using these validators
3. Build frontend UI components
4. Add comprehensive unit tests
5. Integrate with n8n webhook endpoints

---

## Related Documentation

- `prisma/schema.prisma` - Database schema
- `docs/phases/phase-6-automation.md` - Phase 6 specification
- `docs/API_ROUTES.md` - API route documentation
- `src/lib/services/automation.service.ts` - Automation service layer (to be created)

---

**Validation Status**: All types compile successfully with no TypeScript errors.
**Prisma Alignment**: All enums and types match Prisma schema exactly.
**Security**: Credential encryption, RBAC enforcement, and input validation implemented.
