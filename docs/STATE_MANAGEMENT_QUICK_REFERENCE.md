# State Management Quick Reference

Quick reference for common state management patterns in Astralis One.

## Import Statements

```typescript
// Query hooks
import { usePipelines, usePipeline, useIntake, useOrganization } from '@/hooks';

// Mutation hooks
import {
  useCreatePipeline,
  useUpdatePipeline,
  useCreateIntake,
  useAssignToPipeline,
} from '@/hooks';

// Zustand stores
import { useUIStore, useFilterStore, useNotificationStore } from '@/stores';

// Toast notifications
import { useToast } from '@/hooks';

// Query keys
import { pipelineKeys, intakeKeys } from '@/lib/query-keys';

// Utilities
import { parseApiError, getUserFriendlyMessage } from '@/lib/queries';
```

## Common Patterns

### 1. Fetch and Display Data

```typescript
function MyComponent() {
  const { data, isLoading, error } = usePipelines();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data?.map(item => ...)}</div>;
}
```

### 2. Create New Item

```typescript
function CreateForm() {
  const toast = useToast();
  const { mutate, isPending } = useCreatePipeline();

  const handleSubmit = (formData) => {
    mutate(formData, {
      onSuccess: () => toast.success('Created successfully'),
      onError: (error) => toast.error('Creation failed'),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Update Existing Item

```typescript
function EditForm({ itemId }) {
  const toast = useToast();
  const { mutate: updateItem } = useUpdatePipeline();

  const handleUpdate = (updates) => {
    updateItem(
      { pipelineId: itemId, ...updates },
      {
        onSuccess: () => toast.success('Updated'),
        onError: () => toast.error('Update failed'),
      }
    );
  };

  return <form onSubmit={handleUpdate}>...</form>;
}
```

### 4. Delete Item with Confirmation

```typescript
function DeleteButton({ itemId, orgId }) {
  const toast = useToast();
  const { mutate: deleteItem } = useDeletePipeline();
  const { openModal, closeModal } = useUIStore();

  const handleDelete = () => {
    openModal('confirm-delete', {
      title: 'Delete Pipeline?',
      onConfirm: () => {
        deleteItem(
          { pipelineId: itemId, orgId },
          {
            onSuccess: () => {
              toast.success('Deleted');
              closeModal('confirm-delete');
            },
            onError: () => toast.error('Delete failed'),
          }
        );
      },
    });
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### 5. Filtered List with Pagination

```typescript
function FilteredList() {
  const { intakeFilters, setIntakeFilters, pagination } = useFilterStore();

  const { data, isLoading } = useIntake({
    status: intakeFilters.status,
    source: intakeFilters.source,
    limit: pagination.intake.limit,
    offset: (pagination.intake.page - 1) * pagination.intake.limit,
  });

  return (
    <>
      <FilterBar
        filters={intakeFilters}
        onChange={setIntakeFilters}
      />
      <List items={data?.requests} />
      <Pagination total={data?.total} />
    </>
  );
}
```

### 6. Open/Close Modal

```typescript
function ModalExample() {
  const { openModal, closeModal, isModalOpen, getModalData } = useUIStore();

  const handleOpen = (data) => {
    openModal('my-modal', { ...data });
  };

  return (
    <>
      <button onClick={() => handleOpen({ foo: 'bar' })}>
        Open Modal
      </button>

      {isModalOpen('my-modal') && (
        <Modal
          data={getModalData('my-modal')}
          onClose={() => closeModal('my-modal')}
        />
      )}
    </>
  );
}
```

### 7. Toast Notifications

```typescript
function NotificationExamples() {
  const toast = useToast();

  return (
    <div>
      {/* Simple success */}
      <button onClick={() => toast.success('Success!')}>
        Success
      </button>

      {/* Error with title */}
      <button onClick={() => toast.error('Failed', 'Error')}>
        Error
      </button>

      {/* With action button */}
      <button onClick={() => toast({
        type: 'warning',
        message: 'Unsaved changes',
        action: {
          label: 'Save',
          onClick: handleSave,
        },
      })}>
        Warning
      </button>

      {/* Custom duration */}
      <button onClick={() => toast.info('Processing...', '', 10000)}>
        Long Info
      </button>
    </div>
  );
}
```

### 8. Sidebar State

```typescript
function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();

  return (
    <aside className={cn(sidebarCollapsed && 'w-16')}>
      <button onClick={toggleSidebar}>Toggle</button>
      {!sidebarCollapsed && <Navigation />}
    </aside>
  );
}
```

### 9. Manual Cache Invalidation

```typescript
function RefreshButton() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const handleRefresh = () => {
    // Invalidate all pipelines
    queryClient.invalidateQueries({
      queryKey: pipelineKeys.list(session.user.orgId),
    });

    // Or invalidate everything
    queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### 10. Optimistic Update (Built-in)

```typescript
function MoveItem({ itemId, pipelineId }) {
  // This hook already includes optimistic updates!
  const { mutate: moveItem } = useMovePipelineItem();

  const handleMove = (targetStageId) => {
    moveItem({
      itemId,
      pipelineId,
      targetStageId,
    });
    // UI updates immediately, rolls back on error
  };

  return <button onClick={() => handleMove('stage_123')}>Move</button>;
}
```

## Query Keys Reference

```typescript
// Pipelines
pipelineKeys.all                          // ['pipelines']
pipelineKeys.list(orgId)                 // ['pipelines', 'list', orgId, {...}]
pipelineKeys.detail(pipelineId)          // ['pipelines', 'detail', pipelineId]
pipelineKeys.items(pipelineId)           // ['pipelines', 'detail', pipelineId, 'items']

// Intake
intakeKeys.all                            // ['intake']
intakeKeys.list(orgId, filters)          // ['intake', 'list', orgId, {...}]
intakeKeys.detail(requestId)             // ['intake', 'detail', requestId]
intakeKeys.stats(orgId)                  // ['intake', orgId, 'stats']

// Organizations
organizationKeys.all                      // ['organizations']
organizationKeys.detail(orgId)           // ['organizations', 'detail', orgId]
organizationKeys.stats(orgId)            // ['organizations', 'detail', orgId, 'stats']
```

## Store Selectors

```typescript
// Select only what you need to prevent re-renders

// UI Store
const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);
const viewMode = useUIStore(state => state.viewMode);

// Filter Store
const pipelineFilters = useFilterStore(state => state.pipelineFilters);
const intakeStatus = useFilterStore(state => state.intakeFilters.status);

// Notification Store
const notifications = useNotificationStore(state => state.notifications);
```

## Error Handling

```typescript
// In mutation onError
onError: (error) => {
  const apiError = parseApiError(error);
  const message = getUserFriendlyMessage(apiError);
  toast.error(message);
  logError(apiError, 'myMutation');
}

// In try/catch
try {
  await doSomething();
} catch (error) {
  const apiError = parseApiError(error);
  toast.error(getUserFriendlyMessage(apiError));
}
```

## Common Hooks API

### Query Hooks

```typescript
// Returns: { data, isLoading, error, refetch, ... }
usePipelines()
usePipeline(pipelineId)
useIntake(filters?)
useOrganization()
```

### Mutation Hooks

```typescript
// Returns: { mutate, isPending, isError, isSuccess, reset, ... }
useCreatePipeline()
useUpdatePipeline()
useDeletePipeline()
useCreateIntake()
useUpdateIntake()
useAssignToPipeline()
```

### Store Hooks

```typescript
// UI Store
useUIStore() // Returns entire state + actions
useUIStore(selector) // Returns selected slice

// Filter Store
useFilterStore() // Returns entire state + actions
useFilterStore(selector) // Returns selected slice

// Notification Store
useNotificationStore() // Returns entire state + actions
```

### Toast Hook

```typescript
const toast = useToast();
toast(options) // Main function
toast.success(message, title?, duration?)
toast.error(message, title?, duration?)
toast.warning(message, title?, duration?)
toast.info(message, title?, duration?)
toast.dismiss(id)
toast.dismissAll()
```

## Performance Tips

1. **Use selectors:** `useUIStore(state => state.sidebarCollapsed)`
2. **Enable queries conditionally:** `enabled: !!userId`
3. **Set appropriate staleTime:** Already configured to 30s
4. **Prefetch on hover:** `queryClient.prefetchQuery()`
5. **Use optimistic updates:** Already built into move/update hooks

## Debugging

```typescript
// React Query DevTools
// Automatically enabled in development at bottom-right

// Zustand DevTools
// Enable Redux DevTools extension in browser

// Log query cache
queryClient.getQueryCache().getAll()

// Log specific query
queryClient.getQueryData(pipelineKeys.detail('pipe_123'))
```

## Common Mistakes to Avoid

1. **Don't store derived state:**
   ```typescript
   // ❌ Bad
   const [filteredItems, setFilteredItems] = useState([]);

   // ✅ Good
   const filteredItems = items.filter(predicate);
   ```

2. **Don't fetch in effects:**
   ```typescript
   // ❌ Bad
   useEffect(() => {
     fetch('/api/data').then(setData);
   }, []);

   // ✅ Good
   const { data } = useQuery(...)
   ```

3. **Don't forget to invalidate:**
   ```typescript
   // ❌ Bad
   mutate(data); // Cache won't update

   // ✅ Good (automatic in our mutation hooks)
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey });
   }
   ```

4. **Don't use whole store when not needed:**
   ```typescript
   // ❌ Bad (re-renders on any state change)
   const store = useUIStore();

   // ✅ Good (re-renders only when selector changes)
   const collapsed = useUIStore(state => state.sidebarCollapsed);
   ```

## TypeScript Tips

All hooks and stores are fully typed. Use TypeScript autocomplete:

```typescript
// Autocomplete available for:
const { /* ctrl+space here */ } = usePipelines();
const { /* ctrl+space here */ } = useUIStore();
toast./* ctrl+space for methods */
```

## Documentation Links

- Full docs: `/docs/STATE_MANAGEMENT.md`
- Summary: `/docs/STATE_MANAGEMENT_SUMMARY.md`
- This reference: `/docs/STATE_MANAGEMENT_QUICK_REFERENCE.md`
