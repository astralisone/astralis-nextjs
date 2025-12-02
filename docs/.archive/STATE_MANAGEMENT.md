# State Management Infrastructure

## Overview

Astralis One uses a hybrid state management approach combining TanStack Query (React Query v5) for server state and Zustand for client UI state. This architecture provides optimal performance, developer experience, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Components                             │   │
│  └──────────────┬──────────────────────┬───────────────────┘   │
│                 │                       │                        │
│                 ▼                       ▼                        │
│  ┌──────────────────────┐   ┌──────────────────────┐           │
│  │   Custom Hooks       │   │   Zustand Stores     │           │
│  │  - usePipelines()    │   │  - useUIStore        │           │
│  │  - useIntake()       │   │  - useFilterStore    │           │
│  │  - useToast()        │   │  - useNotificationStore           │
│  └──────────────┬────────┘   └──────────────────────┘           │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            TanStack Query Client                          │   │
│  │  - Query cache with 30s staleTime                        │   │
│  │  - Optimistic updates                                    │   │
│  │  - Smart retry logic                                     │   │
│  │  - Devtools integration                                  │   │
│  └──────────────┬────────────────────────────────────────────┘   │
│                 │                                                │
└─────────────────┼────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                           │   │
│  │  - /api/pipelines                                        │   │
│  │  - /api/intake                                           │   │
│  │  - /api/users                                            │   │
│  └──────────────┬────────────────────────────────────────────┘   │
│                 │                                                │
└─────────────────┼────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
│                  PostgreSQL + Prisma                             │
└─────────────────────────────────────────────────────────────────┘
```

## State Colocation Strategy

### Server State (TanStack Query)

**What lives here:**
- Pipeline data
- Intake requests
- User data
- Organization data
- Activity logs

**Why:**
- Data comes from the server
- Needs to be synchronized across clients
- Benefits from caching
- Requires refetching on mutations

**Configuration:**
```typescript
staleTime: 30 * 1000      // Data fresh for 30 seconds
gcTime: 5 * 60 * 1000     // Garbage collection after 5 minutes
refetchOnWindowFocus: false
refetchOnReconnect: true
```

### Client State (Zustand)

**What lives here:**
- UI state (sidebar, modals, drawers)
- Filter preferences
- Toast notifications
- View preferences (grid/list/kanban)

**Why:**
- Ephemeral UI state
- No server synchronization needed
- Fast local updates
- Persisted to localStorage where appropriate

## Query Keys Architecture

Query keys follow a hierarchical structure for efficient cache invalidation:

```typescript
// Hierarchy: all -> lists -> list (with filters) -> details -> detail (with id)

// Example: Pipelines
['pipelines']                                  // All pipelines
['pipelines', 'list']                         // All pipeline lists
['pipelines', 'list', orgId, { filters }]    // Specific filtered list
['pipelines', 'detail']                       // All pipeline details
['pipelines', 'detail', pipelineId]          // Specific pipeline
['pipelines', 'detail', pipelineId, 'items'] // Pipeline items
```

**Benefits:**
- Invalidate all pipelines: `queryClient.invalidateQueries({ queryKey: ['pipelines'] })`
- Invalidate one pipeline: `queryClient.invalidateQueries({ queryKey: ['pipelines', 'detail', id] })`
- Type-safe with autocomplete

## Usage Examples

### 1. Fetching Data with Queries

```typescript
import { usePipelines, usePipeline } from '@/hooks';

function PipelinesList() {
  // Fetch all pipelines for current org
  const { data: pipelines, isLoading, error } = usePipelines();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {pipelines?.map(pipeline => (
        <PipelineCard key={pipeline.id} pipeline={pipeline} />
      ))}
    </div>
  );
}

function PipelineDetail({ pipelineId }: { pipelineId: string }) {
  // Fetch specific pipeline with stages and items
  const { data: pipeline, isLoading } = usePipeline(pipelineId);

  if (isLoading) return <Spinner />;

  return (
    <KanbanBoard
      stages={pipeline.stages}
      pipelineName={pipeline.name}
    />
  );
}
```

### 2. Mutations with Optimistic Updates

```typescript
import { useCreatePipeline, useUpdatePipeline, useToast } from '@/hooks';

function CreatePipelineForm() {
  const toast = useToast();
  const { mutate: createPipeline, isPending } = useCreatePipeline();

  const handleSubmit = (data: FormData) => {
    createPipeline(
      {
        name: data.name,
        description: data.description,
        orgId: session.user.orgId,
      },
      {
        onSuccess: () => {
          toast.success('Pipeline created successfully');
        },
        onError: (error) => {
          toast.error('Failed to create pipeline');
        },
      }
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Using Zustand Stores

```typescript
import { useUIStore, useFilterStore } from '@/stores';

function DashboardSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside className={cn(sidebarCollapsed && 'collapsed')}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}

function IntakeFilters() {
  const { intakeFilters, setIntakeFilters, clearIntakeFilters } = useFilterStore();

  return (
    <div>
      <select
        value={intakeFilters.status}
        onChange={(e) => setIntakeFilters({ status: e.target.value })}
      >
        <option value="NEW">New</option>
        <option value="ASSIGNED">Assigned</option>
      </select>
      <button onClick={clearIntakeFilters}>Clear</button>
    </div>
  );
}
```

### 4. Toast Notifications

```typescript
import { useToast } from '@/hooks';

function MyComponent() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await doSomething();
      toast.success('Action completed successfully');
    } catch (error) {
      toast.error('Action failed', 'Error');
    }
  };

  // With custom action button
  const showWarning = () => {
    toast({
      type: 'warning',
      message: 'You have unsaved changes',
      action: {
        label: 'Save',
        onClick: handleSave,
      },
    });
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### 5. Managing Modals and Drawers

```typescript
import { useUIStore } from '@/stores';

function MyComponent() {
  const { openModal, closeModal, isModalOpen, getModalData } = useUIStore();

  const handleOpenPipelineModal = (pipeline: Pipeline) => {
    openModal('pipeline-edit', { pipeline });
  };

  return (
    <>
      <button onClick={() => handleOpenPipelineModal(pipeline)}>
        Edit Pipeline
      </button>

      {isModalOpen('pipeline-edit') && (
        <PipelineEditModal
          pipeline={getModalData('pipeline-edit').pipeline}
          onClose={() => closeModal('pipeline-edit')}
        />
      )}
    </>
  );
}
```

### 6. Filtered Queries with Pagination

```typescript
import { useIntake } from '@/hooks';
import { useFilterStore } from '@/stores';

function IntakeList() {
  const { intakeFilters, pagination } = useFilterStore();

  const { data, isLoading } = useIntake({
    status: intakeFilters.status,
    source: intakeFilters.source,
    limit: pagination.intake.limit,
    offset: (pagination.intake.page - 1) * pagination.intake.limit,
  });

  return (
    <div>
      {data?.requests.map(request => (
        <IntakeCard key={request.id} request={request} />
      ))}
      <Pagination total={data?.total} />
    </div>
  );
}
```

## Cache Invalidation Strategy

### When to Invalidate

1. **After Mutations:**
   - Invalidate affected queries automatically in mutation `onSuccess`
   - Example: Creating a pipeline invalidates `pipelineKeys.list(orgId)`

2. **Organization Switch:**
   - Invalidate all org-dependent queries
   - Use `getOrgDependentKeys(orgId)` helper

3. **Manual Refresh:**
   - Provide refresh buttons that call `queryClient.invalidateQueries()`

4. **Real-time Updates:**
   - Use `refetchInterval` for critical data
   - Example: Pipeline items refresh every 30 seconds

### Invalidation Patterns

```typescript
// Invalidate all pipelines
queryClient.invalidateQueries({ queryKey: pipelineKeys.all });

// Invalidate specific pipeline
queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(id) });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: ['pipelines'] });
queryClient.invalidateQueries({ queryKey: ['intake'] });

// Remove query from cache
queryClient.removeQueries({ queryKey: pipelineKeys.detail(id) });
```

## Optimistic Updates

Optimistic updates provide instant UI feedback while the server processes the mutation:

```typescript
import { useMovePipelineItem } from '@/hooks';

const { mutate: moveItem } = useMovePipelineItem();

// This hook already implements optimistic updates:
// 1. Cancels in-flight queries
// 2. Snapshots current state
// 3. Updates cache optimistically
// 4. Rolls back on error
// 5. Settles with server state

moveItem({
  itemId: 'item_123',
  pipelineId: 'pipe_456',
  targetStageId: 'stage_789',
});
```

## Error Handling

All mutations include standardized error handling:

```typescript
// Error utilities automatically:
// - Parse errors into consistent format
// - Provide user-friendly messages
// - Log errors for debugging
// - Handle retry logic

import { parseApiError, getUserFriendlyMessage } from '@/lib/queries';

const { mutate } = useSomeMutation();

mutate(data, {
  onError: (error) => {
    const apiError = parseApiError(error);
    const message = getUserFriendlyMessage(apiError);
    toast.error(message);
  },
});
```

## Performance Considerations

### Query Configuration

- **staleTime:** 30s default - Balance freshness vs network requests
- **gcTime:** 5min - Keep inactive queries cached
- **refetchOnWindowFocus:** false - Reduce unnecessary refetches
- **retry:** Smart retry on network/server errors only

### Zustand Optimization

- **Selectors:** Use selectors to prevent unnecessary re-renders
  ```typescript
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);
  ```

- **Persist:** Only persist necessary state (not modals/drawers)
- **Devtools:** Enabled in development for debugging

### Best Practices

1. **Colocate state:** Keep state as close to where it's used as possible
2. **Derive state:** Compute derived values in components, don't store them
3. **Normalize data:** Use normalized structures for complex relational data
4. **Lazy load:** Only fetch data when needed (enabled queries)
5. **Prefetch:** Use `queryClient.prefetchQuery()` for anticipated navigation

## Migration Guide

### From existing hooks to new infrastructure

```typescript
// Before
const { data, isLoading } = usePipelines();

// After (same API, enhanced with query keys and better config)
const { data, isLoading } = usePipelines();

// New mutation hooks
const { mutate: createPipeline } = useCreatePipeline();
const { mutate: updatePipeline } = useUpdatePipeline();

// New toast notifications
const toast = useToast();
toast.success('Pipeline created');

// New UI state management
const { openModal, closeModal } = useUIStore();
openModal('pipeline-edit', { pipelineId: 'pipe_123' });
```

## Files Created

### Query Infrastructure
- `/src/lib/query-keys.ts` - Type-safe query key factories
- `/src/lib/queries/error-handling.ts` - Error parsing and messaging
- `/src/lib/queries/optimistic-updates.ts` - Optimistic update helpers
- `/src/lib/queries/index.ts` - Query utilities export

### Zustand Stores
- `/src/stores/useUIStore.ts` - UI state (sidebar, modals, drawers)
- `/src/stores/useFilterStore.ts` - Filter state for all views
- `/src/stores/useNotificationStore.ts` - Toast notification queue
- `/src/stores/index.ts` - Stores export

### Custom Hooks
- `/src/hooks/usePipelineMutations.ts` - Pipeline CRUD mutations
- `/src/hooks/useIntakeMutations.ts` - Intake request mutations
- `/src/hooks/useToast.ts` - Toast notification hook
- `/src/hooks/index.ts` - Updated hooks export

### Configuration
- `/src/app/providers.tsx` - Enhanced QueryClient configuration
- `/docs/STATE_MANAGEMENT.md` - This documentation

## Dependencies

All required dependencies are already installed:

```json
{
  "@tanstack/react-query": "^5.90.10",
  "@tanstack/react-query-devtools": "^5.90.2",
  "zustand": "^5.0.8"
}
```

## Next Steps

1. **Build UI Components:**
   - Toast notification renderer using Radix Toast
   - Modal components using Zustand state
   - Filter components using FilterStore

2. **Implement Dashboard:**
   - Pipeline kanban board with drag-and-drop
   - Intake request list with filters
   - Real-time updates

3. **Add Monitoring:**
   - Integrate error tracking (Sentry)
   - Add performance monitoring
   - Track query performance metrics

4. **Optimize:**
   - Add prefetching for navigation
   - Implement infinite scroll for large lists
   - Add request deduplication
