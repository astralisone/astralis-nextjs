import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { IntakeRequest, IntakeRequestsResponse, IntakeStatus, IntakeSource } from '@/types/pipelines';

// Query keys for intake requests
export const intakeKeys = {
  all: ['intake'] as const,
  lists: () => [...intakeKeys.all, 'list'] as const,
  list: (orgId: string, filters?: Record<string, string>) =>
    [...intakeKeys.lists(), orgId, filters] as const,
  details: () => [...intakeKeys.all, 'detail'] as const,
  detail: (id: string) => [...intakeKeys.details(), id] as const,
  byPipeline: (pipelineId: string) =>
    [...intakeKeys.all, 'pipeline', pipelineId] as const,
  unclassified: (orgId: string) =>
    [...intakeKeys.all, 'unclassified', orgId] as const,
};

interface UseIntakeRequestsOptions {
  status?: IntakeStatus;
  source?: IntakeSource;
  search?: string;
  limit?: number;
  offset?: number;
  pipelineId?: string;
}

/**
 * Fetch intake requests with filtering options
 */
export function useIntakeRequests(options: UseIntakeRequestsOptions = {}) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const queryParams = new URLSearchParams();
  if (orgId) queryParams.set('orgId', orgId);
  if (options.status) queryParams.set('status', options.status);
  if (options.source) queryParams.set('source', options.source);
  if (options.search) queryParams.set('search', options.search);
  if (options.limit) queryParams.set('limit', options.limit.toString());
  if (options.offset) queryParams.set('offset', options.offset.toString());

  return useQuery({
    queryKey: intakeKeys.list(orgId || '', options as Record<string, string>),
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/intake?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch intake requests');

      const data = await response.json();
      return data as IntakeRequestsResponse;
    },
    enabled: !!orgId,
    staleTime: 15000, // 15 seconds
  });
}

/**
 * Fetch unclassified intake requests (NEW or ROUTING status, no pipeline assigned)
 */
export function useUnclassifiedIntake() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: intakeKeys.unclassified(orgId || ''),
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      // Fetch NEW status items
      const newResponse = await fetch(`/api/intake?orgId=${orgId}&status=NEW`);
      if (!newResponse.ok) throw new Error('Failed to fetch new intake requests');

      const newData = await newResponse.json();

      // Fetch ROUTING status items
      const routingResponse = await fetch(`/api/intake?orgId=${orgId}&status=ROUTING`);
      if (!routingResponse.ok) throw new Error('Failed to fetch routing intake requests');

      const routingData = await routingResponse.json();

      // Combine and sort by priority then created date
      const combined = [
        ...newData.intakeRequests,
        ...routingData.intakeRequests,
      ].sort((a: IntakeRequest, b: IntakeRequest) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        intakeRequests: combined,
        counts: {
          new: newData.intakeRequests.length,
          routing: routingData.intakeRequests.length,
          total: combined.length,
        },
      };
    },
    enabled: !!orgId,
    staleTime: 10000, // 10 seconds for unclassified items
    refetchInterval: 30000, // Refresh every 30s
  });
}

/**
 * Fetch a single intake request
 */
export function useIntakeRequest(id: string) {
  return useQuery({
    queryKey: intakeKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/intake/${id}`);
      if (!response.ok) throw new Error('Failed to fetch intake request');

      const data = await response.json();
      return data as IntakeRequest;
    },
    enabled: !!id,
  });
}

/**
 * Update intake request status
 */
export function useUpdateIntakeStatus() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async ({
      id,
      status,
      assignedPipeline,
    }: {
      id: string;
      status: IntakeStatus;
      assignedPipeline?: string;
    }) => {
      const response = await fetch(`/api/intake/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedPipeline }),
      });

      if (!response.ok) throw new Error('Failed to update intake request');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: intakeKeys.all });
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: intakeKeys.unclassified(orgId) });
      }
    },
  });
}

/**
 * Get intake request counts by status
 */
export function useIntakeStatusCounts() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: [...intakeKeys.all, 'counts', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const statuses: IntakeStatus[] = [
        IntakeStatus.NEW,
        IntakeStatus.ROUTING,
        IntakeStatus.ASSIGNED,
        IntakeStatus.PROCESSING,
      ];

      const counts: Record<IntakeStatus, number> = {} as Record<IntakeStatus, number>;

      await Promise.all(
        statuses.map(async (status) => {
          const response = await fetch(`/api/intake?orgId=${orgId}&status=${status}&limit=1`);
          if (response.ok) {
            const data = await response.json();
            counts[status] = data.pagination.total;
          }
        })
      );

      return counts;
    },
    enabled: !!orgId,
    staleTime: 30000,
  });
}

/**
 * Response type for assign intake mutation
 */
export interface AssignIntakeResponse {
  success: boolean;
  message: string;
  intakeRequest: IntakeRequest;
  pipelineItem: {
    id: string;
    title: string;
    stageId: string;
  };
  stage: {
    id: string;
    name: string;
  };
}

/**
 * Assign an intake request to a pipeline (manual assignment)
 * Creates a PipelineItem and updates the intake status to ASSIGNED
 */
export function useAssignIntake() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useMutation({
    mutationFn: async ({
      intakeId,
      pipelineId,
      stageId,
    }: {
      intakeId: string;
      pipelineId: string;
      stageId?: string;
    }): Promise<AssignIntakeResponse> => {
      const response = await fetch(`/api/intake/${intakeId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId, stageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign intake request');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate unclassified intake queries
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: intakeKeys.unclassified(orgId) });
      }
      // Invalidate all intake queries
      queryClient.invalidateQueries({ queryKey: intakeKeys.all });
      // Invalidate pipeline queries to refresh the kanban board
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipelineId] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}
