import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { intakeKeys } from '@/lib/query-keys';

interface IntakeRequest {
  id: string;
  title: string;
  description?: string | null;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  requestData: any;
  assignedPipeline?: string | null;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  pipeline?: {
    id: string;
    name: string;
  } | null;
}

interface IntakeResponse {
  intakeRequests: IntakeRequest[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Fetch intake requests with optional filtering
 */
export function useIntake(filters?: {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}) {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  const queryParams = new URLSearchParams({
    orgId: orgId || '',
    ...(filters?.status && { status: filters.status }),
    ...(filters?.source && { source: filters.source }),
    ...(filters?.limit && { limit: filters.limit.toString() }),
    ...(filters?.offset && { offset: filters.offset.toString() }),
  });

  return useQuery({
    queryKey: orgId ? intakeKeys.list(orgId, filters) : ['intake'],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/intake?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch intake requests');

      const data = await response.json() as IntakeResponse;

      return {
        requests: data.intakeRequests,
        total: data.pagination.total,
      };
    },
    enabled: !!orgId,
    staleTime: 10000, // 10 seconds
  });
}
