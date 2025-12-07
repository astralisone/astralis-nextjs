'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IntegrationCard } from './integration-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  INTEGRATION_CATALOG,
  type IntegrationCategory,
  type ConnectedIntegration,
  type IntegrationMetadata,
} from '@/types/integrations';
import { Search, RefreshCw } from 'lucide-react';

interface IntegrationsGridProps {
  initialConnections?: ConnectedIntegration[];
}

const CATEGORIES: { id: IntegrationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'crm', label: 'CRM' },
  { id: 'communication', label: 'Communication' },
  { id: 'storage', label: 'Storage' },
];

export function IntegrationsGrid({ initialConnections = [] }: IntegrationsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [connections, setConnections] = useState<ConnectedIntegration[]>(initialConnections);
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [testingCredential, setTestingCredential] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      router.replace('/app/integrations');
    }

    if (error) {
      toast({
        title: 'Connection failed',
        description: decodeURIComponent(error),
        variant: 'destructive',
      });
      router.replace('/app/integrations');
    }
  }, [searchParams, router, toast]);

  // Fetch connections on mount
  useEffect(() => {
    fetchConnections();
  }, []);

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
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              connection={getConnection(integration.provider)}
              onConnect={() => handleConnect(integration)}
              onDisconnect={handleDisconnect}
              onTest={handleTest}
              isConnecting={connectingProvider === integration.provider}
              isTesting={testingCredential === getConnection(integration.provider)?.id}
            />
          ))}
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
    </div>
  );
}
