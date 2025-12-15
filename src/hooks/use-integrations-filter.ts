import { useState, useMemo } from 'react';
import type { IntegrationStatus } from '@/types/integrations';

type FilterType = 'all' | 'connected' | 'available';

export function useIntegrationsFilter(integrations: IntegrationStatus[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const providerName = integration.provider.toLowerCase().replace(/_/g, ' ');
      const matchesSearch =
        searchQuery === '' || providerName.includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === 'all' ||
        (filter === 'connected' && integration.isConnected) ||
        (filter === 'available' && !integration.isConnected && integration.available);

      return matchesSearch && matchesFilter;
    });
  }, [integrations, searchQuery, filter]);

  const counts = useMemo(() => {
    const connected = integrations.filter(i => i.isConnected).length;
    const available = integrations.filter(i => !i.isConnected && i.available).length;
    const total = integrations.length;

    return { connected, available, total };
  }, [integrations]);

  return {
    filteredIntegrations,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    counts,
  };
}