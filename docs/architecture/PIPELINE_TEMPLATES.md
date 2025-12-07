# Pipeline Templates Architecture

**Owner**: Systems Architect Agent
**Last Updated**: 2025-12-07
**Status**: Implemented (Phase 2)

## Overview

The Pipeline Templates system provides pre-configured pipeline definitions that users can instantiate to quickly create new pipelines with standardized stages and workflows. This reduces setup time and ensures consistency across organizations.

---

## System Design

### Architecture Principles

1. **Template-Driven**: Pipelines are created from immutable template definitions
2. **Metadata-Rich**: Templates include UI metadata (icons, categories, use cases)
3. **Customizable**: Users can override names, descriptions, colors, and stages
4. **Type-Safe**: Full TypeScript typing throughout the stack
5. **Database-Independent**: Templates are code-based, not stored in DB

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     TEMPLATE SELECTION                      │
│                                                             │
│  User clicks "New Pipeline" → GET /api/pipelines/templates │
│                            ↓                                │
│              Frontend displays template gallery            │
│              (cards grouped by category)                   │
│                            ↓                                │
│         User selects template + customizations             │
│                            ↓                                │
│        POST /api/pipelines/templates (create pipeline)     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TEMPLATE INSTANTIATION                    │
│                                                             │
│  1. Validate templateKey exists                            │
│  2. Validate orgId exists                                  │
│  3. Apply customizations (name, description, colors)       │
│  4. Filter stages (if includeStages specified)             │
│  5. Generate pipeline key (kebab-case from name)           │
│  6. Create pipeline + stages in single transaction         │
│  7. Return created pipeline with all stages                │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Models

### PipelineTemplate (Frontend Type)

**File**: `/src/types/pipeline-templates.ts`

```typescript
interface PipelineTemplate {
  key: string;                    // Unique identifier (e.g., 'sales', 'support')
  name: string;                   // Display name
  type: PipelineType;             // SALES | SUPPORT | BILLING | INTERNAL | GENERIC | CUSTOM
  description: string;            // Template description
  isDefault: boolean;             // Whether this is the default template
  stages: PipelineTemplateStage[]; // Array of stage definitions
  metadata: {
    icon?: string;                // Icon name (e.g., 'chart-line')
    category?: string;            // Category for grouping
    tags?: string[];              // Search/filter tags
    useCases?: string[];          // Recommended use cases
    estimatedVolume?: 'low' | 'medium' | 'high';
    supportsAutomation?: boolean; // Whether automation is supported
  };
}
```

### PipelineTemplateStage

```typescript
interface PipelineTemplateStage {
  key: string;          // Unique key within template (e.g., 'new_lead')
  name: string;         // Display name
  description: string;  // Stage description
  order: number;        // Display order (0-indexed)
  color: string;        // Hex color code (e.g., '#3B82F6')
  isTerminal: boolean;  // Whether this is a final/terminal stage
}
```

### Database Schema (Existing)

Templates are **not stored in the database**. They exist as code in:
- `/src/lib/services/defaultPipelines.service.ts` (source of truth)
- `/src/app/api/pipelines/templates/route.ts` (metadata enrichment)

When instantiated, templates create standard `pipeline` and `pipelineStage` records:

```prisma
model pipeline {
  id          String         @id @default(cuid())
  orgId       String
  key         String         @unique  // Generated from template
  name        String
  description String?
  type        PipelineType   @default(GENERIC)
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  stages      pipelineStage[]
}

model pipelineStage {
  id          String   @id @default(cuid())
  pipelineId  String
  key         String   // From template
  name        String
  description String?
  order       Int
  isTerminal  Boolean  @default(false)
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pipeline    pipeline @relation(fields: [pipelineId], references: [id])

  @@unique([pipelineId, key])
}
```

---

## API Endpoints

### GET /api/pipelines/templates

**Purpose**: Retrieve all available pipeline templates with metadata

**Query Parameters**:
- `key` (optional): Get a specific template by key
- `type` (optional): Filter by PipelineType
- `category` (optional): Filter by category
- `search` (optional): Search in name/description/tags
- `automationOnly` (optional): Only show templates with automation support

**Response** (without key parameter):

```json
{
  "templates": [
    {
      "key": "sales",
      "name": "Sales Pipeline",
      "type": "SALES",
      "description": "Lead acquisition through deal closure",
      "isDefault": false,
      "stages": [
        {
          "key": "new_lead",
          "name": "New Lead",
          "description": "New sales leads",
          "order": 0,
          "color": "#3B82F6",
          "isTerminal": false
        }
        // ... more stages
      ],
      "metadata": {
        "icon": "chart-line",
        "category": "revenue",
        "tags": ["crm", "deals", "revenue", "b2b"],
        "useCases": [
          "Track leads from initial contact to closed deal",
          "Manage sales funnel metrics and conversion rates",
          "Coordinate sales team activities and handoffs"
        ],
        "estimatedVolume": "high",
        "supportsAutomation": true
      }
    }
    // ... more templates
  ],
  "total": 6,
  "defaultTemplateKey": "generic",
  "categories": {
    "revenue": [/* sales template */],
    "customer_service": [/* support template */],
    "finance": [/* billing template */],
    "operations": [/* internal template */],
    "general": [/* generic template */],
    "custom": [/* custom template */]
  }
}
```

**Response** (with key parameter):

```json
{
  "key": "sales",
  "name": "Sales Pipeline",
  "type": "SALES",
  // ... single template object
}
```

### POST /api/pipelines/templates

**Purpose**: Create a new pipeline from a template

**Request Body**:

```json
{
  "templateKey": "sales",           // Required
  "name": "Q4 Sales Pipeline",      // Optional (defaults to template name)
  "description": "Custom desc",     // Optional (defaults to template description)
  "orgId": "org_123",               // Required
  "stageColorOverrides": {          // Optional
    "new_lead": "#FF0000",
    "qualified": "#00FF00"
  },
  "includeStages": [                // Optional (defaults to all stages)
    "new_lead",
    "qualified",
    "closed_won"
  ]
}
```

**Response** (201 Created):

```json
{
  "id": "clx123abc",
  "name": "Q4 Sales Pipeline",
  "key": "q4-sales-pipeline",
  "type": "SALES",
  "templateKey": "sales",
  "stages": [
    {
      "id": "clx456def",
      "key": "new_lead",
      "name": "New Lead",
      "order": 0,
      "color": "#FF0000",
      "isTerminal": false
    }
    // ... created stages
  ],
  "createdAt": "2025-12-07T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request payload
- `404 Not Found`: Template or organization not found
- `409 Conflict`: Pipeline with same name/key already exists
- `500 Internal Server Error`: Database or unexpected error

---

## Template Definitions

### Available Templates

1. **Sales Pipeline** (`sales`)
   - **Type**: SALES
   - **Category**: revenue
   - **Stages**: 6 (New Lead → Closed Won/Lost)
   - **Use Case**: B2B sales funnel management
   - **Automation**: Supported

2. **Support Pipeline** (`support`)
   - **Type**: SUPPORT
   - **Category**: customer_service
   - **Stages**: 6 (New Ticket → Closed)
   - **Use Case**: Customer support ticket management
   - **Automation**: Supported

3. **Billing Pipeline** (`billing`)
   - **Type**: BILLING
   - **Category**: finance
   - **Stages**: 7 (Pending Invoice → Paid/Written Off)
   - **Use Case**: Invoice and payment tracking
   - **Automation**: Supported

4. **Internal Operations Pipeline** (`internal`)
   - **Type**: INTERNAL
   - **Category**: operations
   - **Stages**: 7 (Backlog → Done/Cancelled)
   - **Use Case**: Internal team task management
   - **Automation**: Not supported (yet)

5. **General Tasks Pipeline** (`generic`)
   - **Type**: GENERIC
   - **Category**: general
   - **Stages**: 4 (Inbox → Done)
   - **Use Case**: Simple, flexible task workflow
   - **Automation**: Not supported
   - **Default**: TRUE

6. **Custom Pipeline** (`custom`)
   - **Type**: CUSTOM
   - **Category**: custom
   - **Stages**: 4 (Stage 1 → Completed)
   - **Use Case**: Build from scratch
   - **Automation**: Not supported

### Template Metadata Mapping

**File**: `/src/app/api/pipelines/templates/route.ts`

```typescript
const TEMPLATE_METADATA = {
  sales: {
    icon: "chart-line",
    category: "revenue",
    tags: ["crm", "deals", "revenue", "b2b"],
    useCases: [...],
    estimatedVolume: "high",
    supportsAutomation: true
  },
  // ... more templates
};
```

---

## Service Layer

### defaultPipelines.service.ts

**Location**: `/src/lib/services/defaultPipelines.service.ts`

**Key Functions**:

```typescript
// Get all template definitions (no DB interaction)
function getPipelineTemplates(): DefaultPipelineDefinition[]

// Get a specific template by key
function getTemplateByKey(templateKey: string): DefaultPipelineDefinition | null

// Create pipeline from template (DB write)
async function getPipelineByType(orgId: string, type: PipelineType): Promise<PipelineWithStages>
```

**Service Class**:

```typescript
class DefaultPipelinesService {
  getDefinitions(): DefaultPipelineDefinition[]
  getTemplateByKey(key: string): DefaultPipelineDefinition | null
  async getByType(orgId: string, type: PipelineType): Promise<PipelineWithStages>
  async ensureDefaults(orgId: string): Promise<PipelineWithStages[]>
  // ... more methods
}

export const defaultPipelinesService = new DefaultPipelinesService();
```

---

## Frontend Integration

### Using the Templates API

```typescript
import type { PipelineTemplate, PipelineTemplatesResponse } from '@/types/pipeline-templates';

// Fetch all templates
const response = await fetch('/api/pipelines/templates');
const data: PipelineTemplatesResponse = await response.json();

// Filter by category
const revenueTemplates = data.categories.revenue; // Sales templates

// Filter by automation support
const automationTemplates = data.templates.filter(t => t.metadata.supportsAutomation);

// Get specific template
const salesTemplate = await fetch('/api/pipelines/templates?key=sales');

// Create pipeline from template
const createResponse = await fetch('/api/pipelines/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateKey: 'sales',
    name: 'Q4 Sales Pipeline',
    orgId: currentOrgId
  })
});
```

### React Hook Example

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function usePipelineTemplates(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['pipeline-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);

      const response = await fetch(`/api/pipelines/templates?${params}`);
      return response.json() as Promise<PipelineTemplatesResponse>;
    }
  });
}

function useCreatePipelineFromTemplate() {
  return useMutation({
    mutationFn: async (data: CreatePipelineFromTemplateRequest) => {
      const response = await fetch('/api/pipelines/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    }
  });
}
```

---

## Customization Options

### 1. Custom Pipeline Name

```json
{
  "templateKey": "sales",
  "name": "Enterprise Sales Pipeline",
  "orgId": "org_123"
}
```

### 2. Custom Description

```json
{
  "templateKey": "sales",
  "description": "Customized sales process for enterprise accounts",
  "orgId": "org_123"
}
```

### 3. Stage Color Overrides

```json
{
  "templateKey": "sales",
  "stageColorOverrides": {
    "new_lead": "#1E40AF",      // Override 'New Lead' color
    "closed_won": "#065F46"     // Override 'Closed Won' color
  },
  "orgId": "org_123"
}
```

### 4. Partial Stage Selection

```json
{
  "templateKey": "sales",
  "includeStages": [
    "new_lead",
    "qualified",
    "closed_won"
  ],
  "orgId": "org_123"
}
```

This creates a simplified 3-stage sales pipeline with automatic re-ordering.

---

## Implementation Details

### Template to Pipeline Conversion

**Step-by-Step Process**:

1. **Validation**
   - Verify template exists: `getTemplateByKey(templateKey)`
   - Verify organization exists: `prisma.organization.findUnique()`
   - Validate request schema with Zod

2. **Stage Preparation**
   - Start with template stages: `template.stages`
   - Filter if `includeStages` specified
   - Apply color overrides if provided
   - Re-calculate order indices if stages were filtered

3. **Key Generation**
   ```typescript
   const pipelineKey = pipelineName
     .toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/(^-|-$)/g, '');
   ```

4. **Database Transaction**
   ```typescript
   const pipeline = await prisma.pipeline.create({
     data: {
       name, key, type, description, orgId,
       stages: {
         create: stagesToCreate.map(stage => ({
           name: stage.name,
           key: stage.key,
           description: stage.description,
           order: stage.order,
           color: stage.color,
           isTerminal: stage.isTerminal
         }))
       }
     },
     include: { stages: { orderBy: { order: 'asc' } } }
   });
   ```

5. **Response Formatting**
   - Map Prisma result to API response type
   - Include `templateKey` for audit trail
   - Return created pipeline with all stages

### Error Handling

**Prisma P2002 (Unique Constraint Violation)**:
```typescript
if (error.code === 'P2002') {
  return NextResponse.json(
    {
      error: 'Pipeline already exists',
      details: 'A pipeline with this name or key already exists'
    },
    { status: 409 }
  );
}
```

**Template Not Found**:
```typescript
if (!template) {
  return NextResponse.json(
    { error: 'Template not found', details: `No template: ${templateKey}` },
    { status: 404 }
  );
}
```

**Empty Stage Selection**:
```typescript
if (includeStages && stagesToCreate.length === 0) {
  return NextResponse.json(
    { error: 'No valid stages selected' },
    { status: 400 }
  );
}
```

---

## Testing Strategy

### Unit Tests

**Template Service** (`defaultPipelines.service.test.ts`):
- Test `getPipelineTemplates()` returns all 6 templates
- Test `getTemplateByKey()` returns correct template
- Test `getTemplateByKey()` returns null for invalid key
- Verify all templates have required fields
- Verify stage ordering is correct

**API Endpoints** (`route.test.ts`):
- Test GET /api/pipelines/templates returns all templates
- Test GET /api/pipelines/templates?key=sales returns single template
- Test GET /api/pipelines/templates?category=revenue filters correctly
- Test POST /api/pipelines/templates creates pipeline
- Test POST validation errors

### Integration Tests

**End-to-End** (Playwright):
```typescript
test('Create pipeline from template', async ({ page }) => {
  // 1. Navigate to pipelines page
  await page.goto('/astralisops/pipelines');

  // 2. Click "New Pipeline" button
  await page.click('button:has-text("New Pipeline")');

  // 3. Template selection modal appears
  await expect(page.locator('[data-testid="template-modal"]')).toBeVisible();

  // 4. Select "Sales Pipeline" template
  await page.click('[data-template-key="sales"]');

  // 5. Customize name (optional)
  await page.fill('[name="pipelineName"]', 'Q4 Sales Pipeline');

  // 6. Click "Create Pipeline"
  await page.click('button:has-text("Create Pipeline")');

  // 7. Verify navigation to new pipeline
  await expect(page).toHaveURL(/\/pipelines\/clx[a-z0-9]+/);

  // 8. Verify stages were created
  await expect(page.locator('[data-stage-key="new_lead"]')).toBeVisible();
  await expect(page.locator('[data-stage-key="qualified"]')).toBeVisible();
});
```

---

## Performance Considerations

### Template Retrieval
- **No Database Queries**: Templates are in-memory constants
- **Response Time**: <10ms typical
- **Caching**: Not required (static data)

### Pipeline Creation
- **Database Writes**: 1 pipeline + N stages (single transaction)
- **Response Time**: 100-300ms typical
- **Index Impact**: Minimal (key and pipelineId+key indexes)

### Scalability
- **Templates**: Code-based, no DB storage = infinite scale
- **Instantiation**: Limited by Prisma connection pool
- **Recommendation**: Rate limit to 10 creates/minute per org

---

## Future Enhancements

### Phase 3: Custom Templates
- **Feature**: Allow organizations to save custom templates
- **Storage**: New `pipelineTemplate` table in database
- **API**: POST /api/pipelines/templates/custom
- **UI**: "Save as Template" button on existing pipelines

### Phase 4: Template Marketplace
- **Feature**: Public template sharing between organizations
- **Storage**: `isPublic` flag on custom templates
- **API**: GET /api/pipelines/templates/marketplace
- **UI**: Community templates section

### Phase 5: Template Versioning
- **Feature**: Track template changes over time
- **Storage**: `templateVersion` field + migration logic
- **API**: GET /api/pipelines/templates/:key/versions
- **UI**: Version history and upgrade prompts

### Phase 6: Automation Presets
- **Feature**: Bundle n8n workflows with templates
- **Storage**: `automationPresets` in template metadata
- **API**: POST /api/pipelines/templates with `includeAutomation`
- **UI**: "Enable Automation" checkbox during creation

---

## Related Documentation

- **API Routes**: `/docs/API_ROUTES_PIPELINES.md`
- **Database Schema**: `/prisma/schema.prisma`
- **Type Definitions**: `/src/types/pipeline-templates.ts`
- **Service Layer**: `/src/lib/services/defaultPipelines.service.ts`
- **Frontend Hooks**: `/src/hooks/usePipelines.ts`

---

## Change Log

| Date       | Author             | Changes                                      |
|------------|--------------------|----------------------------------------------|
| 2025-12-07 | Systems Architect  | Initial architecture design and implementation |
