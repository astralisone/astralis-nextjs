/**
 * Optimistic Update Helpers
 *
 * Utilities for implementing optimistic updates with TanStack Query.
 * Provides type-safe helpers for common update patterns.
 *
 * Patterns:
 * - Snapshot previous state
 * - Apply optimistic update
 * - Rollback on error
 * - Settle with server state
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Generic optimistic update context for rollback
 */
export interface OptimisticContext<T = any> {
  previous: T | undefined;
}

/**
 * Create optimistic update for adding an item to a list
 */
export function createOptimisticAdd<TItem, TList extends { items?: TItem[] }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  newItem: TItem
): OptimisticContext<TList> {
  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previous = queryClient.getQueryData<TList>(queryKey);

  // Optimistically update
  queryClient.setQueryData<TList>(queryKey, (old) => {
    if (!old) return old;

    return {
      ...old,
      items: [...(old.items || []), newItem],
    } as TList;
  });

  return { previous };
}

/**
 * Create optimistic update for updating an item in a list
 */
export function createOptimisticUpdate<TItem extends { id: string }, TList extends { items?: TItem[] }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  itemId: string,
  updates: Partial<TItem>
): OptimisticContext<TList> {
  queryClient.cancelQueries({ queryKey });

  const previous = queryClient.getQueryData<TList>(queryKey);

  queryClient.setQueryData<TList>(queryKey, (old) => {
    if (!old || !old.items) return old;

    return {
      ...old,
      items: old.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    } as TList;
  });

  return { previous };
}

/**
 * Create optimistic update for removing an item from a list
 */
export function createOptimisticRemove<TItem extends { id: string }, TList extends { items?: TItem[] }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  itemId: string
): OptimisticContext<TList> {
  queryClient.cancelQueries({ queryKey });

  const previous = queryClient.getQueryData<TList>(queryKey);

  queryClient.setQueryData<TList>(queryKey, (old) => {
    if (!old || !old.items) return old;

    return {
      ...old,
      items: old.items.filter((item) => item.id !== itemId),
    } as TList;
  });

  return { previous };
}

/**
 * Create optimistic update for moving an item between lists
 */
export function createOptimisticMove<
  TItem extends { id: string },
  TStage extends { id: string; items: TItem[] }
>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  itemId: string,
  sourceStageId: string,
  targetStageId: string
): OptimisticContext<{ stages: TStage[] }> {
  queryClient.cancelQueries({ queryKey });

  const previous = queryClient.getQueryData<{ stages: TStage[] }>(queryKey);

  queryClient.setQueryData<{ stages: TStage[] }>(queryKey, (old) => {
    if (!old) return old;

    // Find the item to move
    const sourceStage = old.stages.find((s) => s.id === sourceStageId);
    const item = sourceStage?.items.find((i) => i.id === itemId);

    if (!item) return old;

    // Create new stages with moved item
    const newStages = old.stages.map((stage) => {
      // Remove from source stage
      if (stage.id === sourceStageId) {
        return {
          ...stage,
          items: stage.items.filter((i) => i.id !== itemId),
        };
      }

      // Add to target stage
      if (stage.id === targetStageId) {
        return {
          ...stage,
          items: [...stage.items, item],
        };
      }

      return stage;
    });

    return { ...old, stages: newStages };
  });

  return { previous };
}

/**
 * Rollback to previous state on error
 */
export function rollbackOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  context: OptimisticContext<T> | undefined
): void {
  if (context?.previous !== undefined) {
    queryClient.setQueryData(queryKey, context.previous);
  }
}

/**
 * Settle query after mutation (success or error)
 */
export function settleQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
): void {
  queryClient.invalidateQueries({ queryKey });
}

/**
 * Helper to create complete optimistic mutation handlers
 */
export function createOptimisticMutationHandlers<
  TData,
  TVariables,
  TContext = OptimisticContext
>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  optimisticUpdateFn: (variables: TVariables) => TContext
) {
  return {
    onMutate: async (variables: TVariables) => {
      return optimisticUpdateFn(variables);
    },
    onError: (_error: unknown, _variables: TVariables, context: TContext | undefined) => {
      if (context && typeof context === 'object' && 'previous' in context) {
        rollbackOptimisticUpdate(queryClient, queryKey, context as OptimisticContext);
      }
    },
    onSettled: () => {
      settleQuery(queryClient, queryKey);
    },
  };
}
