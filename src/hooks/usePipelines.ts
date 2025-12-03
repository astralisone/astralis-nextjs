import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Pipeline, PipelineStage, PipelineItem } from '@/types/pipelines';
import { pipelineKeys } from '@/lib/query-keys';

/**
 * Fetch all pipelines for the current organization
 */
export function usePipelines() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: orgId ? pipelineKeys.list(orgId) : ['pipelines'],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/pipelines?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch pipelines');

      const data = await response.json();
      return data.pipelines as Pipeline[];
    },
    enabled: !!orgId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch a single pipeline with all stages and items
 */
export function usePipeline(pipelineId: string) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: pipelineKeys.detail(pipelineId),
    queryFn: async () => {
      const response = await fetch(`/api/pipelines/${pipelineId}?orgId=${orgId}`);
      if (!response.ok) throw new Error('Failed to fetch pipeline');

      const data = await response.json();
      return data as Pipeline;
    },
    enabled: !!pipelineId && !!orgId,
    refetchInterval: 30000, // Refresh every 30s for real-time feel
  });
}

/**
 * Move a pipeline item from one stage to another with optimistic updates
 */
export function useMovePipelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      pipelineId,
      targetStageId,
    }: {
      itemId: string;
      pipelineId: string;
      targetStageId: string;
    }) => {
      const response = await fetch(`/api/pipelines/${pipelineId}/items/${itemId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStageId }),
      });

      if (!response.ok) throw new Error('Failed to move item');

      return response.json();
    },
    onMutate: async ({ itemId, pipelineId, targetStageId }) => {
      // Cancel outgoing refetches
      const queryKey = pipelineKeys.detail(pipelineId);
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousPipeline = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const newStages = old.stages.map((stage: PipelineStage) => {
          // Remove item from old stage
          const filteredItems = stage.items.filter((item: PipelineItem) => item.id !== itemId);

          // Add item to new stage
          if (stage.id === targetStageId) {
            const movedItem = old.stages
              .flatMap((s: PipelineStage) => s.items)
              .find((item: PipelineItem) => item.id === itemId);

            if (movedItem) {
              return {
                ...stage,
                items: [...filteredItems, { ...movedItem, stageId: targetStageId }],
              };
            }
          }

          return { ...stage, items: filteredItems };
        });

        return { ...old, stages: newStages };
      });

      return { previousPipeline };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPipeline) {
        queryClient.setQueryData(pipelineKeys.detail(variables.pipelineId), context.previousPipeline);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
    },
  });
}

/**
 * Create a new pipeline
 *
 * @deprecated Use useCreatePipeline from @/hooks/usePipelineMutations instead
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          orgId: session?.user?.orgId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create pipeline');

      return response.json();
    },
    onSuccess: () => {
      // Invalidate using the correct query key structure
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: pipelineKeys.list(orgId) });
      }
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
    },
  });
}

/**
 * Update a pipeline
 *
 * @deprecated Use useUpdatePipeline from @/hooks/usePipelineMutations instead
 */
export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pipelineId,
      data,
    }: {
      pipelineId: string;
      data: { name?: string; description?: string; isActive?: boolean };
    }) => {
      const response = await fetch(`/api/pipelines/${pipelineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update pipeline');

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
    },
  });
}

/**
 * Update the assignee of a pipeline item
 */
export function useUpdateItemAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pipelineId,
      itemId,
      assigneeId,
    }: {
      pipelineId: string;
      itemId: string;
      assigneeId: string | null;
    }) => {
      const response = await fetch(`/api/pipelines/${pipelineId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: assigneeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update assignee');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate pipeline queries to refresh the data
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
    },
  });
}
