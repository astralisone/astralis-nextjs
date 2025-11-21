import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Organization {
  id: string;
  name: string;
}

/**
 * Hook for accessing current organization and switching organizations
 */
export function useOrganization() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const currentOrgId = session?.user?.orgId;

  /**
   * Switch to a different organization
   * In Phase 1, users only have one org, but this prepares for multi-org support
   */
  const switchOrganization = async (orgId: string) => {
    if (orgId === currentOrgId) return;

    try {
      setIsSwitching(true);

      const response = await fetch('/api/auth/org/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) throw new Error('Failed to switch organization');

      // Update session
      await update();

      // Refresh the page to reload with new org context
      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error switching organization:', error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    currentOrgId,
    isSwitching,
    switchOrganization,
  };
}
