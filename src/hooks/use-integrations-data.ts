import { useState, useCallback } from 'react';
import type { IntegrationProvider } from '@prisma/client';
import type { IntegrationStatus } from '@/types/integrations';

interface ProviderStatus {
  provider: IntegrationProvider;
  available: boolean;
  reason?: string;
}

interface CredentialData {
  id: string;
  provider: IntegrationProvider;
  status: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  lastError?: string;
}

export function useIntegrationsData() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [availableProviders, setAvailableProviders] = useState<IntegrationProvider[]>([]);
  const [allProviderStatuses, setAllProviderStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First get available providers (those with credentials configured)
      const availableRes = await fetch('/api/integrations/available');
      if (!availableRes.ok) throw new Error('Failed to fetch available integrations');
      const availableData = await availableRes.json();
      const allProviders = availableData.allProviders || [];
      const providers = availableData.providers || []; // Backward compatibility
      setAvailableProviders(providers);
      setAllProviderStatuses(allProviders);

      // Then get connected integrations
      const res = await fetch('/api/integrations');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      const data = await res.json();

      // Map credentials to providers
      const credentials: CredentialData[] = data.data || [];
      const statusMap = new Map<IntegrationProvider, IntegrationStatus>();

      // Initialize all providers (available and unavailable)
      allProviders.forEach((providerStatus) => {
        statusMap.set(providerStatus.provider, {
          provider: providerStatus.provider,
          isConnected: false,
          available: providerStatus.available,
          unavailableReason: providerStatus.reason,
        });
      });

      // Update with connected integrations
      credentials.forEach((credential) => {
        const existingStatus = statusMap.get(credential.provider);
        if (existingStatus) {
          statusMap.set(credential.provider, {
            ...existingStatus,
            isConnected: credential.status === 'CONNECTED_ACTIVE',
            credential,
          });
        }
      });

      setIntegrations(Array.from(statusMap.values()));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load integrations';
      setError(errorMessage);
      console.error('[useIntegrationsData] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    integrations,
    availableProviders,
    allProviderStatuses,
    loading,
    error,
    fetchIntegrations,
    setIntegrations,
  };
}