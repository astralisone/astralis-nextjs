# Pipeline API Routes

Kanban-style pipeline management system for workflow orchestration and project tracking.

## Table of Contents
- [Pipeline Management](#pipeline-management)
- [Pipeline Stages](#pipeline-stages)
- [Pipeline Items](#pipeline-items)
- [Item Operations](#item-operations)

---

## Pipeline Management

### List Pipelines

Get all pipelines for the organization.

**Endpoint**: `GET /api/pipelines`
**Auth**: Required
**Query Parameters**:
- `isActive` (optional): Filter by active status (true/false)

### Response
```json
{
  "pipelines": [
    {
      "id": "pipeline_123",
      "name": "Sales Pipeline",
      "description": "Track sales opportunities from lead to close",
      "isActive": true,
      "orgId": "org_789",
      "stageCount": 5,
      "itemCount": 23,
      "createdAt": "2024-10-01T00:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ]
}
```

### Create Pipeline

**Endpoint**: `POST /api/pipelines`
**Auth**: Required

### Request Body
```json
{
  "name": "Sales Pipeline",
  "description": "Track sales opportunities",
  "isActive": true
}
```

### Get Single Pipeline

**Endpoint**: `GET /api/pipelines/[id]`

### Update Pipeline

**Endpoint**: `PATCH /api/pipelines/[id]`

### Delete Pipeline

**Endpoint**: `DELETE /api/pipelines/[id]`

---

## Pipeline Stages

### List Stages

**Endpoint**: `GET /api/pipelines/[id]/stages`

### Create Stage

**Endpoint**: `POST /api/pipelines/[id]/stages`

### Request Body
```json
{
  "name": "Qualification",
  "description": "Qualify the lead",
  "order": 1,
  "color": "#4CAF50"
}
```

### Update Stage

**Endpoint**: `PATCH /api/pipelines/[id]/stages/[stageId]`

### Delete Stage

**Endpoint**: `DELETE /api/pipelines/[id]/stages/[stageId]`

---

## Pipeline Items

### List Items

**Endpoint**: `GET /api/pipelines/[id]/items`

### Create Item

**Endpoint**: `POST /api/pipelines/[id]/items`

### Request Body
```json
{
  "title": "Acme Corp Deal",
  "description": "Enterprise deal worth $50K",
  "stageId": "stage_456",
  "priority": 5,
  "dueDate": "2024-12-31",
  "assignedToId": "user_123",
  "tags": ["enterprise", "high-value"],
  "data": {
    "dealValue": 50000,
    "contactEmail": "sales@acme.com"
  }
}
```

### Get Item

**Endpoint**: `GET /api/pipelines/[id]/items/[itemId]`

### Update Item

**Endpoint**: `PATCH /api/pipelines/[id]/items/[itemId]`

### Delete Item

**Endpoint**: `DELETE /api/pipelines/[id]/items/[itemId]`

### Move Item

**Endpoint**: `POST /api/pipelines/[id]/items/[itemId]/move`

### Request Body
```json
{
  "targetStageId": "stage_789",
  "position": 0
}
```

---

## Related Documentation

- [Phase 2 Dashboard & Pipelines](./phases/phase-2-dashboard-ui-pipelines.md)
- [API Routes Index](./API_ROUTES_INDEX.md)
