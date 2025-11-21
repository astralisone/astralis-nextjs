# Intake Queue Implementation

## Overview

The Intake Queue is a comprehensive table-based interface for managing incoming requests with advanced sorting, filtering, and bulk operations. Built with TanStack Table v8 and following the Astralis brand design system.

## Architecture

### Components

#### 1. **IntakeTable** (`src/components/intake/IntakeTable.tsx`)
The main table component powered by TanStack Table v8.

**Features:**
- Row selection with checkboxes
- Sortable columns (Priority, Created date)
- Pagination (20 items per page)
- Click rows to open detail drawer
- Keyboard navigation support

**Columns:**
- Select (checkbox)
- Request ID (short hash)
- Source (FORM, EMAIL, CHAT, API)
- Status (color-coded badge)
- Priority (visual indicator)
- Subject (title + description)
- Created (formatted date)
- Assigned To (user or pipeline)

**Props:**
```typescript
interface IntakeTableProps {
  data: IntakeRequest[];
  onRowClick?: (request: IntakeRequest) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}
```

#### 2. **IntakeStatusBadge** (`src/components/intake/IntakeStatusBadge.tsx`)
Color-coded status badges with icons.

**Status Colors:**
- NEW: Gray (slate)
- ROUTING: Blue
- ASSIGNED: Cyan
- PROCESSING: Yellow
- COMPLETED: Green
- REJECTED: Red

**Props:**
```typescript
interface IntakeStatusBadgeProps {
  status: IntakeStatus;
  showIcon?: boolean;
  className?: string;
}
```

#### 3. **PriorityIndicator** (`src/components/intake/PriorityIndicator.tsx`)
Visual priority indicators based on numeric priority (0-10).

**Priority Levels:**
- Low (0-3): Gray with minus icon
- Medium (4-6): Yellow with alert icon
- High (7-10): Red with arrow-up icon

**Props:**
```typescript
interface PriorityIndicatorProps {
  priority: number;
  showLabel?: boolean;
  className?: string;
}
```

#### 4. **BulkActionsToolbar** (`src/components/intake/BulkActionsToolbar.tsx`)
Fixed bottom toolbar that appears when rows are selected.

**Bulk Actions:**
- Update Status: Change status for multiple requests
- Assign to Pipeline: Route multiple requests to a pipeline
- Update Priority: Set priority level (Low/Medium/High)
- Delete: Remove multiple requests (with confirmation)

**Features:**
- Confirmation dialogs for all actions
- Optimistic UI updates
- Toast notifications
- Keyboard shortcuts support

**Props:**
```typescript
interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  availablePipelines?: Array<{ id: string; name: string }>;
}
```

#### 5. **IntakeDetailDrawer** (`src/components/intake/IntakeDetailDrawer.tsx`)
Slide-out panel from the right showing full request details.

**Sections:**
- Status & Priority badges
- Subject and Description
- Metadata (Created date, Source)
- Action controls (Change status, Assign pipeline)
- Quick actions (Mark Complete, Reject)
- Raw request data (JSON)
- Activity timeline placeholder

**Props:**
```typescript
interface IntakeDetailDrawerProps {
  request: IntakeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  availablePipelines?: Array<{ id: string; name: string }>;
}
```

#### 6. **Intake Page** (`src/app/astralisops/intake/page.tsx`)
Main page component that orchestrates all intake queue features.

**Features:**
- Search by title, description, or ID
- Filter by status, source, priority
- Real-time filtering (client-side)
- Refresh data
- Create new request button
- Results count
- Loading states

### API Endpoints

#### GET `/api/intake`
List intake requests with optional filtering and pagination.

**Query Parameters:**
- `orgId`: Filter by organization
- `status`: Filter by status (NEW, ROUTING, ASSIGNED, etc.)
- `source`: Filter by source (FORM, EMAIL, CHAT, API)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "intakeRequests": [/* array of requests */],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST `/api/intake`
Create a new intake request with AI routing.

**Request Body:**
```json
{
  "source": "FORM",
  "title": "Request title",
  "description": "Optional description",
  "requestData": {/* any data */},
  "orgId": "org_id",
  "priority": 5
}
```

**Response:**
```json
{
  "intakeRequest": {/* created request */},
  "routing": {
    "assigned": true,
    "confidence": 0.85,
    "reasoning": "AI routing explanation"
  }
}
```

#### PUT `/api/intake/[id]`
Update a single intake request.

**Request Body:**
```json
{
  "status": "ASSIGNED",
  "title": "Updated title",
  "description": "Updated description",
  "priority": 8,
  "assignedPipeline": "pipeline_id"
}
```

**Response:**
```json
{
  "intakeRequest": {/* updated request */}
}
```

#### DELETE `/api/intake/[id]`
Delete a single intake request.

**Response:**
```json
{
  "message": "Intake request deleted successfully"
}
```

#### POST `/api/intake/bulk`
Perform bulk operations on multiple requests.

**Actions:**
- `update_status`: Update status for multiple requests
- `assign_pipeline`: Assign pipeline to multiple requests
- `update_priority`: Update priority for multiple requests
- `delete`: Delete multiple requests

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "action": "update_status",
  "data": {
    "status": "ASSIGNED"
  }
}
```

**Response:**
```json
{
  "success": true,
  "action": "update_status",
  "affectedCount": 3,
  "ids": ["id1", "id2", "id3"]
}
```

### Database Schema

#### IntakeRequest Model
```prisma
model intakeRequest {
  id                String         @id @default(cuid())
  source            IntakeSource
  status            IntakeStatus   @default(NEW)
  title             String
  description       String?
  requestData       Json
  priority          Int            @default(0)
  orgId             String
  organization      organization?  @relation(fields: [orgId], references: [id])
  assignedPipeline  String?
  pipeline          pipeline?      @relation(fields: [assignedPipeline], references: [id])
  aiRoutingMeta     Json?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @default(now()) @updatedAt

  @@index([orgId])
  @@index([status])
  @@index([source])
  @@index([createdAt])
}

enum IntakeStatus {
  NEW
  ROUTING
  ASSIGNED
  PROCESSING
  COMPLETED
  REJECTED
}

enum IntakeSource {
  FORM
  EMAIL
  CHAT
  API
}
```

## User Flows

### 1. View and Filter Requests
1. Navigate to `/astralisops/intake`
2. Table loads with all requests for the organization
3. Use search box to filter by title/description/ID
4. Use dropdown filters for status, source, priority
5. Results update in real-time

### 2. Single Request Actions
1. Click on a table row
2. Detail drawer slides in from the right
3. View full request details
4. Change status via dropdown
5. Assign to pipeline via dropdown
6. Use quick actions (Complete, Reject)
7. Close drawer to return to table

### 3. Bulk Operations
1. Select multiple rows using checkboxes
2. Bulk actions toolbar appears at bottom
3. Choose action from toolbar:
   - Change Status
   - Route to Pipeline
   - Set Priority
   - Delete
4. Confirm action in dialog
5. Toast notification shows result
6. Table refreshes with updated data

### 4. Sorting and Pagination
1. Click column headers to sort (Priority, Created)
2. Use pagination controls at bottom
3. Navigate between pages
4. Selection persists across pages

## Styling

All components follow the Astralis brand design system:

**Colors:**
- Primary: Astralis Navy (#0A1B2B)
- Accent: Astralis Blue (#2B6CB0)
- Success: Green (#38A169)
- Warning: Yellow (#DD6B20)
- Error: Red (#E53E3E)
- Info: Blue (#3182CE)

**Typography:**
- Font: Inter
- Headings: Bold, Navy
- Body: Regular, Slate

**Spacing:**
- Border radius: 6px (md), 8px (lg), 4px (sm)
- Transitions: 150-250ms
- Padding: 4px increments

## Accessibility

- All interactive elements are keyboard accessible
- ARIA labels on checkboxes and buttons
- Focus management in drawer
- Semantic HTML structure
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Performance Optimizations

- Client-side filtering for instant results
- Memoized filter logic
- Optimized re-renders with React.memo
- Virtual scrolling ready (can be added for large datasets)
- Pagination limits data fetching
- Debounced search input (can be added)

## Testing Recommendations

### Unit Tests
- Component rendering
- Filter logic
- Bulk action handlers
- Status badge colors
- Priority calculations

### Integration Tests
- API endpoint responses
- Table sorting and pagination
- Filter combinations
- Bulk operations
- Drawer interactions

### E2E Tests
- Complete user flows
- Multi-step bulk operations
- Error handling
- Loading states

## Future Enhancements

1. **Advanced Filtering**
   - Date range picker
   - Custom filter combinations
   - Saved filter presets

2. **Keyboard Shortcuts**
   - `j/k` for navigation
   - `x` for selection
   - `a` for select all
   - `esc` to clear selection

3. **Export Options**
   - CSV export
   - PDF reports
   - Email summaries

4. **Real-time Updates**
   - WebSocket integration
   - Live status changes
   - Notifications for new requests

5. **Activity Timeline**
   - Full audit log
   - User actions
   - Status changes
   - Comments and notes

6. **AI Routing Visualization**
   - Confidence scores
   - Suggested pipelines
   - Routing history

## Dependencies

```json
{
  "@tanstack/react-table": "^8.x",
  "@radix-ui/react-checkbox": "^1.1.3",
  "@radix-ui/react-select": "^2.1.4",
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-alert-dialog": "^1.1.4",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.462.0"
}
```

## File Structure

```
src/
├── app/
│   ├── astralisops/
│   │   └── intake/
│   │       └── page.tsx                 # Main intake page
│   └── api/
│       └── intake/
│           ├── route.ts                 # GET /POST endpoints
│           ├── [id]/
│           │   └── route.ts             # PUT /DELETE single request
│           └── bulk/
│               └── route.ts             # POST bulk operations
├── components/
│   ├── intake/
│   │   ├── IntakeTable.tsx              # Main table component
│   │   ├── IntakeStatusBadge.tsx        # Status badges
│   │   ├── PriorityIndicator.tsx        # Priority indicators
│   │   ├── BulkActionsToolbar.tsx       # Bulk actions toolbar
│   │   ├── IntakeDetailDrawer.tsx       # Detail drawer
│   │   └── index.ts                     # Exports
│   └── ui/
│       └── use-toast.ts                 # Toast notifications
└── prisma/
    └── schema.prisma                    # Database schema
```

## Summary

The Intake Queue provides a production-ready, enterprise-grade interface for managing incoming requests with:

- Advanced table features (sorting, filtering, pagination)
- Bulk operations with confirmation dialogs
- Detailed request view with quick actions
- Real-time search and filtering
- Accessible, keyboard-friendly interface
- Astralis brand-consistent design
- Comprehensive API endpoints
- Type-safe TypeScript implementation
