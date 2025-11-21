import { useMutation, useQueryClient } from '@tanstack/react-query';
import { intakeKeys, pipelineKeys } from '@/lib/query-keys';
import { parseApiError, logError } from '@/lib/queries/error-handling';

/**
 * Intake Request Mutation Hooks
 *
 * Provides type-safe mutation hooks for intake request operations:
 * - Create intake request
 * - Update intake request
 * - Assign to pipeline
 * - Update status
 * - Delete intake request
 *
 * All mutations include:
 * - Error handling with user-friendly messages
 * - Automatic cache invalidation
 * - Type safety
 */

interface IntakeRequest {
  id: string;
  title: string;
  description?: string | null;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: number;
  requestData: any;
  assignedPipeline?: string | null;
  orgId: string;
}

/**
 * Create a new intake request
 *
 * @example
 * ```ts
 * const { mutate: createIntake, isPending } = useCreateIntake();
 *
 * createIntake({
 *   title: 'New Support Request',
 *   description: 'Customer needs help with...',
 *   source: 'FORM',
 *   requestData: { email: 'customer@example.com' },
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useCreateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      source: IntakeRequest['source'];
      requestData: any;
      priority?: number;
      orgId: string;
    }) => {
      const response = await fetch('/api/intake', {
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
      // Invalidate intake lists
      queryClient.invalidateQueries({ queryKey: intakeKeys.list(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.stats(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useCreateIntake');
    },
  });
}

/**
 * Update an intake request
 *
 * @example
 * ```ts
 * const { mutate: updateIntake } = useUpdateIntake();
 *
 * updateIntake({
 *   requestId: 'intake_123',
 *   title: 'Updated Title',
 *   priority: 5
 * });
 * ```
 */
export function useUpdateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requestId: string;
      orgId: string;
      title?: string;
      description?: string;
      priority?: number;
      requestData?: any;
    }) => {
      const { requestId, orgId, ...updates } = data;

      const response = await fetch(`/api/intake/${requestId}`, {
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
      // Invalidate specific request and lists
      queryClient.invalidateQueries({ queryKey: intakeKeys.detail(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.list(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useUpdateIntake');
    },
  });
}

/**
 * Assign intake request to a pipeline
 *
 * @example
 * ```ts
 * const { mutate: assignToPipeline } = useAssignToPipeline();
 *
 * assignToPipeline({
 *   requestId: 'intake_123',
 *   pipelineId: 'pipe_456',
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useAssignToPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requestId: string;
      pipelineId: string;
      orgId: string;
    }) => {
      const response = await fetch(`/api/intake/${data.requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId: data.pipelineId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate intake request and both pipeline views
      queryClient.invalidateQueries({ queryKey: intakeKeys.detail(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.list(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipelineId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useAssignToPipeline');
    },
  });
}

/**
 * Update intake request status
 *
 * @example
 * ```ts
 * const { mutate: updateStatus } = useUpdateIntakeStatus();
 *
 * updateStatus({
 *   requestId: 'intake_123',
 *   status: 'COMPLETED',
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useUpdateIntakeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requestId: string;
      status: IntakeRequest['status'];
      orgId: string;
    }) => {
      const { requestId, status } = data;

      const response = await fetch(`/api/intake/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { ...error, status: response.status };
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: intakeKeys.detail(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.list(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.stats(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useUpdateIntakeStatus');
    },
  });
}

/**
 * Delete an intake request
 *
 * @example
 * ```ts
 * const { mutate: deleteIntake } = useDeleteIntake();
 *
 * deleteIntake({
 *   requestId: 'intake_123',
 *   orgId: 'org_123'
 * });
 * ```
 */
export function useDeleteIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requestId: string;
      orgId: string;
    }) => {
      const response = await fetch(`/api/intake/${data.requestId}`, {
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
      queryClient.removeQueries({ queryKey: intakeKeys.detail(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.list(variables.orgId) });
      queryClient.invalidateQueries({ queryKey: intakeKeys.stats(variables.orgId) });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      logError(apiError, 'useDeleteIntake');
    },
  });
}
