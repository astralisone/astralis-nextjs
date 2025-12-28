"use client";

import React, { Suspense, useEffect } from 'react';
import { IntegrationsErrorBoundary } from '@/components/integrations/integrations-error-boundary';
import { IntegrationsHeader } from '@/components/integrations/integrations-header';
import { IntegrationsFilters } from '@/components/integrations/integrations-filters';
import { IntegrationsSuccessHandler } from '@/components/integrations/integrations-success-handler';
import { IntegrationSetup } from '@/components/automations/IntegrationSetup';
import { useIntegrationsData } from '@/hooks/use-integrations-data';
import { useIntegrationsFilter } from '@/hooks/use-integrations-filter';
import { useIntegrationsActions } from '@/hooks/use-integrations-actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { IntegrationProvider } from '@/types/automation';

function IntegrationsPageContent() {
  // Use custom hooks for data management
  const {
    integrations,
    loading,
    error,
    fetchIntegrations,
  } = useIntegrationsData();

  // Use filter hook
  const {
    filteredIntegrations,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    counts,
  } = useIntegrationsFilter(integrations);

  // Use actions hook
  const {
    handleConnect,
    handleTest,
    handleDisconnect,
  } = useIntegrationsActions(fetchIntegrations);

  // Initial data load
  React.useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <IntegrationsSuccessHandler onRefreshData={fetchIntegrations} />

      <IntegrationsHeader
        connectedCount={counts.connected}
        availableCount={counts.available}
        totalCount={counts.total}
        loading={loading}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-[24px] w-[24px]" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <IntegrationsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        connectedCount={counts.connected}
        availableCount={counts.available}
        totalCount={counts.total}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredIntegrations.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              Showing {filteredIntegrations.length} of {integrations.length} integration
              {integrations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationSetup
                key={integration.provider}
                provider={integration.provider}
                isConnected={integration.isConnected}
                status={integration.credential?.status}
                lastError={integration.credential?.lastError}
                lastUsedAt={integration.credential?.lastUsedAt}
                expiresAt={integration.credential?.expiresAt}
                available={integration.available}
                unavailableReason={integration.unavailableReason}
                credentialId={integration.credential?.id}
                onConnect={() => handleConnect(integration.provider)}
                onDisconnect={() => handleDisconnect(integration.provider, integration.credential?.id)}
                onTest={(credentialId) => handleTest(integration.provider, credentialId)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">No integrations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function IntegrationsPageLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <IntegrationsErrorBoundary>
      <Suspense fallback={<IntegrationsPageLoading />}>
        <IntegrationsPageContent />
      </Suspense>
    </IntegrationsErrorBoundary>
  );
}