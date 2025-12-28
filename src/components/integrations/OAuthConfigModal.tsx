'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { IntegrationProvider } from '@/types/automation';

const oauthConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  customScopes: z.string().optional(),
  redirectUri: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type OAuthConfigForm = z.infer<typeof oauthConfigSchema>;

interface OAuthConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: IntegrationProvider;
  onConfigured: () => void;
}

const providerInfo: Record<string, { name: string; docsUrl: string; description: string }> = {
  DROPBOX: {
    name: 'Dropbox',
    docsUrl: 'https://www.dropbox.com/developers/apps',
    description: 'Create a Dropbox app and copy the App key and App secret',
  },
  GITHUB: {
    name: 'GitHub',
    docsUrl: 'https://github.com/settings/developers',
    description: 'Create a GitHub OAuth App and copy the Client ID and Client Secret',
  },
  FACEBOOK: {
    name: 'Facebook',
    docsUrl: 'https://developers.facebook.com/apps/',
    description: 'Create a Facebook App and copy the App ID and App Secret',
  },
  SHOPIFY: {
    name: 'Shopify',
    docsUrl: 'https://shopify.dev/apps/auth/oauth',
    description: 'Create a Shopify app and copy the API key and API secret key',
  },
  QUICKBOOKS: {
    name: 'QuickBooks',
    docsUrl: 'https://developer.intuit.com/app/developer/dashboard',
    description: 'Create a QuickBooks app and copy the Client ID and Client Secret',
  },
  XERO: {
    name: 'Xero',
    docsUrl: 'https://developer.xero.com/app/manage',
    description: 'Create a Xero app and copy the Client ID and Client Secret',
  },
  HUBSPOT: {
    name: 'HubSpot',
    docsUrl: 'https://app.hubspot.com/developer',
    description: 'Create a HubSpot app and copy the Client ID and Client Secret',
  },
  SALESFORCE: {
    name: 'Salesforce',
    docsUrl: 'https://login.salesforce.com/',
    description: 'Create a Salesforce Connected App and copy the Consumer Key and Consumer Secret',
  },
  SLACK: {
    name: 'Slack',
    docsUrl: 'https://api.slack.com/apps',
    description: 'Create a Slack app and copy the Client ID and Client Secret',
  },
  GMAIL: {
    name: 'Google',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    description: 'Create OAuth 2.0 credentials in Google Cloud Console',
  },
  GOOGLE_DRIVE: {
    name: 'Google Drive',
    docsUrl: 'https://console.cloud.google.com/apis/credentials',
    description: 'Enable Google Drive API and create OAuth 2.0 credentials',
  },
  MICROSOFT_TEAMS: {
    name: 'Microsoft',
    docsUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    description: 'Register an application in Azure AD and copy the Client ID and Client Secret',
  },
};

export function OAuthConfigModal({ open, onOpenChange, provider, onConfigured }: OAuthConfigModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = providerInfo[provider] || {
    name: provider.replace(/_/g, ' '),
    docsUrl: '#',
    description: 'Configure OAuth credentials for this integration',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OAuthConfigForm>({
    resolver: zodResolver(oauthConfigSchema),
    defaultValues: {
      clientId: '',
      clientSecret: '',
      customScopes: '',
      redirectUri: '',
    },
  });

  const onSubmit = async (data: OAuthConfigForm) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          clientId: data.clientId,
          clientSecret: data.clientSecret,
          customScopes: data.customScopes || undefined,
          redirectUri: data.redirectUri || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to save OAuth credentials');
      }

      reset();
      onOpenChange(false);
      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save OAuth credentials');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure {info.name} Integration</DialogTitle>
          <DialogDescription>
            Set up OAuth credentials to connect {info.name} to your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <AlertCircle className="h-[24px] w-[24px]" />
            <AlertDescription>
              <strong>Setup Required:</strong> {info.description}
              {info.docsUrl !== '#' && (
                <a
                  href={info.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-1 text-blue-600 hover:underline"
                >
                  View Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                {...register('clientId')}
                placeholder="Enter your Client ID"
              />
              {errors.clientId && (
                <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                {...register('clientSecret')}
                placeholder="Enter your Client Secret"
              />
              {errors.clientSecret && (
                <p className="text-sm text-red-600 mt-1">{errors.clientSecret.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customScopes">Custom Scopes (Optional)</Label>
              <Input
                id="customScopes"
                {...register('customScopes')}
                placeholder="e.g., files.content.read,files.content.write"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default scopes
              </p>
            </div>

            <div>
              <Label htmlFor="redirectUri">Redirect URI (Optional)</Label>
              <Input
                id="redirectUri"
                {...register('redirectUri')}
                placeholder="https://yourdomain.com/api/integrations/provider/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Custom redirect URI if different from default
              </p>
              {errors.redirectUri && (
                <p className="text-sm text-red-600 mt-1">{errors.redirectUri.message}</p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-[24px] w-[24px]" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}