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
      // Fetch OAuth URL from connect endpoint
      const connectUrl = `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/connect`;
      const response = await fetch(connectUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to initiate OAuth');
      }

      const data = await response.json();

      if (data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
      } else if (data.error) {
        throw new Error(data.details || data.error);
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('[handleConnect] Error:', error);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to initiate connection. Please try again.',
        variant: 'destructive',
      });
    }
  }, []);

  const handleTest = useCallback(async (provider: IntegrationProvider, credentialId?: string): Promise<TestResult> => {
    try {
      if (!credentialId) {
        return {
          success: false,
          message: 'No credential ID provided for testing',
          needsReconnect: false,
        };
      }

      const res = await fetch(
        `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentialId }),
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

  const handleDisconnect = useCallback(async (provider: IntegrationProvider, credentialId?: string) => {
    try {
      if (!credentialId) {
        throw new Error('No credential ID provided for disconnection');
      }

      const response = await fetch(
        `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/${credentialId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to disconnect');
      }

      // Success - refresh the data
      await onDataChange();

      toast({
        title: 'Disconnected',
        description: `Successfully disconnected ${provider.replace(/_/g, ' ')}`,
      });
    } catch (error) {
      console.error('[handleDisconnect] Error:', error);
      toast({
        title: 'Disconnect Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect integration. Please try again.',
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