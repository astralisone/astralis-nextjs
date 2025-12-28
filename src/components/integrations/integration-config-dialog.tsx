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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { IntegrationIcon } from './integration-icon';
import type { IntegrationProvider } from '@prisma/client';

const configSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  customScopes: z.string().optional(),
  redirectUri: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isEnabled: z.boolean().default(true),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface IntegrationConfig {
  id?: string;
  provider: IntegrationProvider;
  clientId: string;
  hasClientSecret: boolean;
  customScopes?: string;
  redirectUri?: string;
  isEnabled: boolean;
  isVerified: boolean;
  verifiedAt?: string;
}

interface IntegrationMetadata {
  provider: IntegrationProvider;
  name: string;
  description: string;
  category: string;
  documentationUrl: string;
  setupUrl: string;
}

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationMetadata;
  existingConfig?: IntegrationConfig | null;
  onSave: () => void;
}

const PROVIDER_SETUP_INFO: Record<string, { setupUrl: string; instructions: string[] }> = {
  QUICKBOOKS: {
    setupUrl: 'https://developer.intuit.com/app/developer/dashboard',
    instructions: [
      'Sign in to Intuit Developer Portal',
      'Create a new app or select existing',
      'Copy the Client ID and Client Secret',
      'Add your redirect URI in OAuth settings',
    ],
  },
  XERO: {
    setupUrl: 'https://developer.xero.com/app/manage',
    instructions: [
      'Sign in to Xero Developer Portal',
      'Create a new app',
      'Copy the Client ID and Client Secret',
      'Add redirect URI under OAuth 2.0 settings',
    ],
  },
  HUBSPOT: {
    setupUrl: 'https://app.hubspot.com/developer',
    instructions: [
      'Go to HubSpot Developer Account',
      'Create a new app',
      'Under Auth tab, find Client ID and Secret',
      'Configure redirect URLs',
    ],
  },
  SALESFORCE: {
    setupUrl: 'https://login.salesforce.com',
    instructions: [
      'Go to Setup > Apps > App Manager',
      'Create a New Connected App',
      'Enable OAuth Settings',
      'Copy Consumer Key (Client ID) and Consumer Secret',
    ],
  },
  SLACK: {
    setupUrl: 'https://api.slack.com/apps',
    instructions: [
      'Create a new Slack App',
      'Go to OAuth & Permissions',
      'Copy Client ID and Client Secret from Basic Information',
      'Add redirect URL and required scopes',
    ],
  },
  GMAIL: {
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    instructions: [
      'Create a new project or select existing',
      'Enable Gmail API',
      'Create OAuth 2.0 credentials',
      'Copy Client ID and Client Secret',
    ],
  },
  GOOGLE_DRIVE: {
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    instructions: [
      'Create a new project or select existing',
      'Enable Google Drive API',
      'Create OAuth 2.0 credentials',
      'Copy Client ID and Client Secret',
    ],
  },
  MICROSOFT_TEAMS: {
    setupUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    instructions: [
      'Register a new application in Azure AD',
      'Copy Application (client) ID',
      'Create a client secret under Certificates & Secrets',
      'Add redirect URI and API permissions',
    ],
  },
  DROPBOX: {
    setupUrl: 'https://www.dropbox.com/developers/apps',
    instructions: [
      'Create a new Dropbox App',
      'Choose access type and permissions',
      'Copy App key (Client ID) and App secret',
      'Add redirect URI in OAuth 2 settings',
    ],
  },
};

export function IntegrationConfigDialog({
  open,
  onOpenChange,
  integration,
  existingConfig,
  onSave,
}: IntegrationConfigDialogProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const setupInfo = PROVIDER_SETUP_INFO[integration.provider];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      clientId: '',
      clientSecret: '',
      customScopes: existingConfig?.customScopes || '',
      redirectUri: existingConfig?.redirectUri || '',
      isEnabled: existingConfig?.isEnabled ?? true,
    },
  });

  const isEnabled = watch('isEnabled');

  const onSubmit = async (data: ConfigFormData) => {
    setIsSaving(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/settings/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: integration.provider,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      setTestResult({ success: true, message: 'Configuration saved successfully!' });
      onSave();

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConfig = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `/api/settings/integrations/config/${integration.provider.toLowerCase()}/test`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (data.success) {
        setTestResult({ success: true, message: data.message || 'Configuration verified!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Verification failed' });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test configuration',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <IntegrationIcon provider={integration.provider} size={32} />
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription>
            Enter your OAuth app credentials to enable this integration for your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Setup Instructions */}
          {setupInfo && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Setup Instructions</h4>
                <a
                  href={setupInfo.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Open Developer Portal
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                {setupInfo.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              {...register('clientId')}
              placeholder={`Enter your ${integration.name} Client ID`}
            />
            {errors.clientId && (
              <p className="text-sm text-red-600">{errors.clientId.message}</p>
            )}
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret *</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showSecret ? 'text' : 'password'}
                {...register('clientSecret')}
                placeholder={
                  existingConfig?.hasClientSecret
                    ? 'Enter new secret to update (leave blank to keep existing)'
                    : `Enter your ${integration.name} Client Secret`
                }
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showSecret ? <EyeOff className="h-[24px] w-[24px]" /> : <Eye className="h-[24px] w-[24px]" />}
              </button>
            </div>
            {errors.clientSecret && (
              <p className="text-sm text-red-600">{errors.clientSecret.message}</p>
            )}
            {existingConfig?.hasClientSecret && (
              <p className="text-xs text-slate-500">
                A client secret is already configured. Enter a new one to update it.
              </p>
            )}
          </div>

          {/* Custom Scopes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="customScopes">Custom Scopes (optional)</Label>
            <Textarea
              id="customScopes"
              {...register('customScopes')}
              placeholder="Comma-separated list of OAuth scopes (leave blank for defaults)"
              rows={2}
            />
            <p className="text-xs text-slate-500">
              Override the default OAuth scopes if needed. Leave blank to use recommended scopes.
            </p>
          </div>

          {/* Custom Redirect URI (optional) */}
          <div className="space-y-2">
            <Label htmlFor="redirectUri">Custom Redirect URI (optional)</Label>
            <Input
              id="redirectUri"
              {...register('redirectUri')}
              placeholder="https://your-domain.com/api/integrations/..."
            />
            <p className="text-xs text-slate-500">
              Only needed if you&apos;re using a custom domain for callbacks.
            </p>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Integration</Label>
              <p className="text-xs text-slate-500">
                Users can connect when enabled
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => setValue('isEnabled', checked)}
            />
          </div>

          {/* Verification Status */}
          {existingConfig && (
            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex items-center gap-2">
                {existingConfig.isVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Verified</span>
                    {existingConfig.verifiedAt && (
                      <span className="text-xs text-slate-500">
                        on {new Date(existingConfig.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-amber-600">Not verified</span>
                  </>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConfig}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-[24px] w-[24px] mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${testResult.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-[24px] w-[24px] mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
