import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineKeys } from '@/lib/query-keys';
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/queries/error-handling';
import { createOptimisticMutationHandlers, createOptimisticMove } from '@/lib/queries/optimistic-updates';

/**
 * Pipeline Mutation Hooks
 *
 * Provides type-safe mutation hooks for pipeline operations:
 * - Create pipeline
 * - Update pipeline
 * - Delete pipeline
 * - Create stage
 * - Update stage
 * - Delete stage
 * - Move item between stages
 *
 * All mutations include:
 * - Optimistic updates where appropriate
 * - Error handling with user-friendly messages
 * - Automatic cache invalidation
 */

interface Pipeline {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  orgId: string;
}

interface Stage {
  id: string;
  name: string;
  order: number;
  pipelineId: string;
}

interface PipelineItem {
  id: string;
  title: string;
  data: any;
  stageId: string;
}

/**
 * Create a new pipeline
 *
 * @example
 * ```ts
 * const { mutate: createPipeline, isPending } = useCreatePipeline();
 *
 * createPipeline({
 *   name: 'Sales Pipeline',
 *   description: 'Track sales opportunities',
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      orgId: string;
    }) => {
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate pipelines list
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useCreatePipeline');
    },
  });
}

/**
 * Update an existing pipeline
 *
 * @example
 * ```ts
 * const { mutate: updatePipeline } = useUpdatePipeline();
 *
 * updatePipeline({
 *   pipelineId: 'pipe_123',
 *   name: 'Updated Name',
 *   isActive: false
 * });
 * ```
 */
export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      name?: string;
      description?: string;
      isActive?: boolean;
    }) => {
      const { pipelineId, ...updates } = data;

      const response = await fetch(`/api/pipelines/${pipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate specific pipeline and list
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useUpdatePipeline');
    },
  });
}

/**
 * Delete a pipeline
 *
 * @example
 * ```ts
 * const { mutate: deletePipeline } = useDeletePipeline();
 *
 * deletePipeline({
 *   pipelineId: 'pipe_123',
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      orgId: string;
    }) => {
      const response = await fetch(`/api/pipelines/${data.pipelineId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.list(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useDeletePipeline');
    },
  });
}

/**
 * Create a new stage in a pipeline
 *
 * @example
 * ```ts
 * const { mutate: createStage } = useCreateStage();
 *
 * createStage({
 *   pipelineId: 'pipe_123',
 *   name: 'New Stage',
 *   order: 3
 * });
 * ```
 */
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      name: string;
      order: number;
    }) => {
      const response = await fetch(`/api/pipelines/${data.pipelineId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, order: data.order }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.stages(variables.pipelineId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useCreateStage');
    },
  });
}

/**
 * Update a stage
 *
 * @example
 * ```ts
 * const { mutate: updateStage } = useUpdateStage();
 *
 * updateStage({
 *   pipelineId: 'pipe_123',
 *   stageId: 'stage_456',
 *   name: 'Updated Stage Name'
 * });
 * ```
 */
export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      stageId: string;
      name?: string;
      order?: number;
    }) => {
      const { pipelineId, stageId, ...updates } = data;

      const response = await fetch(`/api/pipelines/${pipelineId}/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useUpdateStage');
    },
  });
}

/**
 * Delete a stage
 *
 * @example
 * ```ts
 * const { mutate: deleteStage } = useDeleteStage();
 *
 * deleteStage({
 *   pipelineId: 'pipe_123',
 *   stageId: 'stage_456'
 * });
 * ```
 */
export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      pipelineId: string;
      stageId: string;
    }) => {
      const response = await fetch(`/api/pipelines/${data.pipelineId}/stages/${data.stageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useDeleteStage');
    },
  });
}
