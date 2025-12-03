'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { IntegrationSetup } from '@/components/automations/IntegrationSetup';
import { Search, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import type { IntegrationCredential, IntegrationProvider } from '@/types/automation';

// Available integrations
const AVAILABLE_INTEGRATIONS: IntegrationProvider[] = [
  'GMAIL',
  'GOOGLE_SHEETS',
  'GOOGLE_DRIVE',
  'GOOGLE_CALENDAR',
  'SLACK',
  'MICROSOFT_TEAMS',
  'OUTLOOK',
  'HUBSPOT',
  'SALESFORCE',
  'STRIPE',
  'PAYPAL',
  'MAILCHIMP',
  'SENDGRID',
  'TWILIO',
  'ZOOM',
  'DROPBOX',
  'TRELLO',
  'ASANA',
  'NOTION',
  'AIRTABLE',
  'OPENAI',
  'ANTHROPIC',
];

interface IntegrationStatus {
  provider: IntegrationProvider;
  isConnected: boolean;
  credential?: IntegrationCredential;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations/credentials');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      const data = await res.json();

      // Map credentials to providers
      const credentials: IntegrationCredential[] = data.credentials || [];
      const statusMap = new Map<IntegrationProvider, IntegrationStatus>();

      // Initialize all available integrations
      AVAILABLE_INTEGRATIONS.forEach((provider) => {
        statusMap.set(provider, {
          provider,
          isConnected: false,
        });
      });

      // Update with connected integrations
      credentials.forEach((credential) => {
        statusMap.set(credential.provider, {
          provider: credential.provider,
          isConnected: credential.isActive,
          credential,
        });
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
      // Initiate OAuth flow or credential setup
      const res = await fetch('/api/integrations/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) throw new Error('Failed to connect integration');

      const data = await res.json();

      // If OAuth URL is returned, redirect to it
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert('Integration connected successfully!');
        fetchIntegrations();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to connect integration');
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    const integration = integrations.find((i) => i.provider === provider);
    if (!integration?.credential) return;

    try {
      const res = await fetch(`/api/integrations/credentials/${integration.credential.id}`, {
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
        `/api/integrations/credentials/${integration.credential.id}/test`,
        {
          method: 'POST',
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
                Connect your favorite tools and services
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2  ui-icon w-5 h-5 text-slate-400" />
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
                No integrations found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search or filters to see more results.
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
