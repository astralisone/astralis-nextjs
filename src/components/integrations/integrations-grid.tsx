'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IntegrationCard } from './integration-card';
import { IntegrationConfigDialog } from './integration-config-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  INTEGRATION_CATALOG,
  type IntegrationCategory,
  type ConnectedIntegration,
  type IntegrationMetadata,
} from '@/types/integrations';
import { Search, RefreshCw, Settings2 } from 'lucide-react';

interface IntegrationConfig {
  id: string;
  provider: string;
  clientId: string;
  hasClientSecret: boolean;
  customScopes?: string;
  redirectUri?: string;
  isEnabled: boolean;
  isVerified: boolean;
  verifiedAt?: string;
}

interface IntegrationsGridProps {
  initialConnections?: ConnectedIntegration[];
  isAdmin?: boolean;
}

const CATEGORIES: { id: IntegrationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'crm', label: 'CRM' },
  { id: 'communication', label: 'Communication' },
  { id: 'storage', label: 'Storage' },
];

export function IntegrationsGrid({ initialConnections = [], isAdmin = false }: IntegrationsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [connections, setConnections] = useState<ConnectedIntegration[]>(initialConnections);
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [testingCredential, setTestingCredential] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Config dialog state
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationMetadata | null>(null);

  // Handle success/error from OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');

    if (success === 'true' && provider) {
      toast({
        title: 'Connected!',
        description: `Successfully connected to ${provider.replace(/-/g, ' ')}`,
      });
      // Refresh connections
      fetchConnections();
      // Clear URL params
      router.replace('/integrations');
    }

    if (error) {
      toast({
        title: 'Connection failed',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
      router.replace('/integrations');
    }
  }, [searchParams, router, toast]);

  // Fetch connections and configs on mount
  useEffect(() => {
    fetchConnections();
    if (isAdmin) {
      fetchConfigs();
    }
  }, [isAdmin]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setConnections(
          data.data.map((c: any) => ({
            ...c,
            status: c.expiresAt && new Date(c.expiresAt) < new Date() ? 'expired' : 'connected',
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/settings/integrations/config');
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Failed to fetch integration configs:', error);
    }
  };

  const handleConnect = (integration: IntegrationMetadata) => {
    setConnectingProvider(integration.provider);
    // Redirect to OAuth connect route
    window.location.href = `/api/integrations/${integration.id}/connect`;
  };

  const handleDisconnect = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/integrations/${credentialId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== credentialId));
        toast({
          title: 'Disconnected',
          description: 'Integration has been disconnected.',
        });
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration.',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (credentialId: string) => {
    setTestingCredential(credentialId);
    const connection = connections.find((c) => c.id === credentialId);
    if (!connection) return;

    try {
      const response = await fetch(`/api/integrations/${connection.provider.toLowerCase()}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Connection verified',
          description: 'Integration is working correctly.',
        });
      } else {
        toast({
          title: 'Connection issue',
          description: data.error || 'Unable to verify connection.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Test failed',
        description: 'Failed to test connection.',
        variant: 'destructive',
      });
    } finally {
      setTestingCredential(null);
    }
  };

  // Filter integrations
  const filteredIntegrations = INTEGRATION_CATALOG.filter((integration) => {
    const matchesCategory = category === 'all' || integration.category === category;
    const matchesSearch =
      searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get connection for an integration
  const getConnection = (provider: string): ConnectedIntegration | undefined => {
    return connections.find((c) => c.provider === provider);
  };

  // Get config for an integration
  const getConfig = (provider: string): IntegrationConfig | undefined => {
    return configs.find((c) => c.provider === provider);
  };

  // Check if integration is configured (has org-level credentials)
  const isConfigured = (provider: string): boolean => {
    const config = getConfig(provider);
    return config?.isEnabled ?? false;
  };

  // Handle opening config dialog
  const handleConfigure = (integration: IntegrationMetadata) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  // Handle config save
  const handleConfigSave = () => {
    fetchConfigs();
    toast({
      title: 'Configuration saved',
      description: 'Integration credentials have been updated.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as IntegrationCategory | 'all')}
        >
          <TabsList>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Integrations Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => {
            const config = getConfig(integration.provider);
            const configured = config?.isEnabled ?? false;

            return (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                connection={getConnection(integration.provider)}
                onConnect={() => handleConnect(integration)}
                onDisconnect={handleDisconnect}
                onTest={handleTest}
                onConfigure={isAdmin ? () => handleConfigure(integration) : undefined}
                isConnecting={connectingProvider === integration.provider}
                isTesting={testingCredential === getConnection(integration.provider)?.id}
                isConfigured={configured}
                isVerified={config?.isVerified}
              />
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No integrations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Integration Config Dialog */}
      {selectedIntegration && (
        <IntegrationConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          integration={{
            provider: selectedIntegration.provider,
            name: selectedIntegration.name,
            description: selectedIntegration.description,
            category: selectedIntegration.category,
            documentationUrl: selectedIntegration.documentationUrl,
            setupUrl: selectedIntegration.documentationUrl,
          }}
          existingConfig={getConfig(selectedIntegration.provider) as any}
          onSave={handleConfigSave}
        />
      )}
    </div>
  );
}
