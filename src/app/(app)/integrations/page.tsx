'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { IntegrationSetup } from '@/components/automations/IntegrationSetup';
import { useToast } from '@/hooks/useToast';
import { Search, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import type { IntegrationProvider } from '@/types/automation';
import type { CredentialData } from '@/lib/services/integration.service';

// Get available integrations (only those with OAuth credentials configured)
async function getAvailableIntegrations(orgId: string): Promise<IntegrationProvider[]> {
  const allIntegrations: IntegrationProvider[] = [
    'GMAIL',
    'GOOGLE_DRIVE',
    'GOOGLE_DOCS',
    'SLACK',
    'MICROSOFT_TEAMS',
    'HUBSPOT',
    'SALESFORCE',
    'DROPBOX',
    'QUICKBOOKS',
    'XERO',
    'SHOPIFY',
    'FACEBOOK',
    'BAMBOOHR',
    'GITHUB',
  ];

  // Filter to only integrations that have credentials configured
  const availableIntegrations: IntegrationProvider[] = [];

  for (const provider of allIntegrations) {
    try {
      const hasCredentials = await checkIntegrationCredentials(provider, orgId);
      if (hasCredentials) {
        availableIntegrations.push(provider);
      }
    } catch (error) {
      // Skip integrations with credential check errors
      console.warn(`Failed to check credentials for ${provider}:`, error);
    }
  }

  return availableIntegrations;
}

// Check if an integration has OAuth credentials configured
async function checkIntegrationCredentials(
  provider: IntegrationProvider,
  orgId: string
): Promise<boolean> {
  try {
    // Try to get OAuth credentials for this provider and org
    const { getOrgOAuthCredentials } = await import('@/lib/integrations/oauth-config');
    const credentials = await getOrgOAuthCredentials(provider, orgId);
    return credentials !== null;
  } catch (error) {
    console.error(`Error checking credentials for ${provider}:`, error);
    return false;
  }
}

interface IntegrationStatus {
  provider: IntegrationProvider;
  isConnected: boolean;
  credential?: CredentialData;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [availableProviders, setAvailableProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');

  // Handle success/error from OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');

    if (success === 'true' && provider) {
      toast({
        title: 'Connected!',
        description: `Successfully connected to ${provider.replace(/-/g, ' ').replace(/_/g, ' ')}`,
      });
      // Refresh integrations
      fetchIntegrations();
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

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      // First get available providers (those with credentials configured)
      const availableRes = await fetch('/api/integrations/available');
      if (!availableRes.ok) throw new Error('Failed to fetch available integrations');
      const availableData = await availableRes.json();
      const providers = availableData.providers || [];
      setAvailableProviders(providers);

      // Then get connected integrations
      const res = await fetch('/api/integrations');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      const data = await res.json();

      // Map credentials to providers
      const credentials: CredentialData[] = data.data || [];
      const statusMap = new Map<IntegrationProvider, IntegrationStatus>();

      // Initialize only available integrations (those with credentials)
      providers.forEach((provider) => {
        statusMap.set(provider, {
          provider,
          isConnected: false,
        });
      });

      // Update with connected integrations
      credentials.forEach((credential) => {
        if (providers.includes(credential.provider)) {
          statusMap.set(credential.provider, {
            provider: credential.provider,
            isConnected: credential.isActive,
            credential,
          });
        }
      });

      setIntegrations(Array.from(statusMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      // First check if OAuth credentials are available
      const res = await fetch(`/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/connect`);

      if (res.ok) {
        // Credentials exist, proceed with OAuth
        const data = await res.json();
        if (data.authUrl) {
          // Navigate to OAuth flow (popup windows are often blocked by OAuth providers)
          // The OAuth callback will redirect back to /integrations with success/error params
          window.location.href = data.authUrl;
        } else {
          alert('Integration connected successfully!');
          fetchIntegrations();
        }
      } else {
        // Credentials missing, throw error to show setup guide
        const errorData = await res.json();
        const error = new Error(errorData.details || errorData.error || 'Failed to connect integration');
        (error as any).code = errorData.code;
        (error as any).setupGuide = errorData.setupGuide;
        throw error;
      }
    } catch (err) {
      throw err; // Re-throw to be caught by IntegrationSetup
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    const integration = integrations.find((i) => i.provider === provider);
    if (!integration?.credential) return;

    try {
      const res = await fetch(`/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/${integration.credential.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to disconnect integration');

      alert('Integration disconnected successfully!');
      fetchIntegrations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to disconnect integration');
    }
  };

  const handleTest = async (provider: IntegrationProvider): Promise<boolean> => {
    const integration = integrations.find((i) => i.provider === provider);
    if (!integration?.credential) return false;

    try {
      const res = await fetch(
        `/api/integrations/${provider.toLowerCase().replace(/_/g, '-')}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credentialId: integration.credential.id }),
        }
      );

      if (!res.ok) throw new Error('Test failed');

      const data = await res.json();
      return data.success;
    } catch (err) {
      return false;
    }
  };

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const providerName = integration.provider.toLowerCase().replace(/_/g, ' ');
    const matchesSearch =
      searchQuery === '' || providerName.includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'connected' && integration.isConnected) ||
      (filter === 'available' && !integration.isConnected);

    return matchesSearch && matchesFilter;
  });

  const connectedCount = integrations.filter((i) => i.isConnected).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/automations">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-astralis-navy">Integrations</h1>
              <p className="text-slate-600 mt-1">
                Connect your configured tools and services
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">
                {connectedCount} Connected
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">
                {integrations.length - connectedCount} Available
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({integrations.length})
              </Button>
              <Button
                variant={filter === 'connected' ? 'primary' : 'outline'}
                onClick={() => setFilter('connected')}
              >
                Connected ({connectedCount})
              </Button>
              <Button
                variant={filter === 'available' ? 'primary' : 'outline'}
                onClick={() => setFilter('available')}
              >
                Available ({integrations.length - connectedCount})
              </Button>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredIntegrations.length === 0 && !error && (
          <Card className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl">🔌</div>
              <h3 className="text-xl font-bold text-astralis-navy">
                {searchQuery || filter !== 'all' ? 'No integrations found' : 'No integrations available'}
              </h3>
              <p className="text-slate-600">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Integrations must be configured with OAuth credentials before they can be used. Contact your administrator to set up integrations.'
                }
              </p>
            </div>
          </Card>
        )}

        {/* Integrations Grid */}
        {!loading && filteredIntegrations.length > 0 && (
          <>
            <div className="flex items-center justify-between">
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
                  onConnect={() => handleConnect(integration.provider)}
                  onDisconnect={() => handleDisconnect(integration.provider)}
                  onTest={() => handleTest(integration.provider)}
                />
              ))}
            </div>
          </>
        )}

        {/* Info Card */}
        <Card className="bg-astralis-blue/5 border-astralis-blue/20">
          <div className="p-6">
            <h3 className="font-semibold text-astralis-navy mb-2">
              Need help setting up integrations?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Check our documentation for step-by-step guides on connecting each integration.
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/docs/integrations" target="_blank">
                View Documentation
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
