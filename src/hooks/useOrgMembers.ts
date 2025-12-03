import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface OrgMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
}

/**
 * Hook to fetch all organization members
 * Used for team member selection in assignee dropdowns
 */
export function useOrgMembers() {
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('No organization ID');

      const response = await fetch(`/api/orgs/${orgId}/members`);
      if (!response.ok) throw new Error('Failed to fetch team members');

      const data = await response.json();
      return data.members as OrgMember[];
    },
    enabled: !!orgId,
    staleTime: 60000, // 1 minute
  });
}
