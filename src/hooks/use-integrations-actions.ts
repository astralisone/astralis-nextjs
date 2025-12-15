import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import type { IntegrationProvider } from '@prisma/client';

interface TestResult {
  success: boolean;
  message?: string;
  needsReconnect?: boolean;
}

export function useIntegrationsActions(onDataChange: () => void) {
  const router = useRouter();

  const handleConnect = useCallback(async (provider: IntegrationProvider) => {
    try {
      // Navigate to OAuth connect endpoint
      const connectUrl = `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/connect`;
      router.push(connectUrl);
    } catch (error) {
      console.error('[handleConnect] Error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to initiate connection. Please try again.',
        variant: 'destructive',
      });
    }
  }, [router]);

  const handleTest = useCallback(async (provider: IntegrationProvider): Promise<TestResult> => {
    try {
      const res = await fetch(
        `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentialId: 'auto-detect' }), // Will be improved
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.details || 'Test failed',
          needsReconnect: false,
        };
      }

      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        needsReconnect: data.needsReconnect,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
        needsReconnect: false,
      };
    }
  }, []);

  const handleDisconnect = useCallback(async (provider: IntegrationProvider) => {
    try {
      // This would need to be implemented in the API
      // For now, just refresh the data
      await onDataChange();

      toast({
        title: 'Disconnected',
        description: `Successfully disconnected ${provider.replace(/_/g, ' ')}`,
      });
    } catch (error) {
      console.error('[handleDisconnect] Error:', error);
      toast({
        title: 'Disconnect Error',
        description: 'Failed to disconnect integration. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onDataChange]);

  return {
    handleConnect,
    handleTest,
    handleDisconnect,
  };
}