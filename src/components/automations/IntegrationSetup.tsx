'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Unlink,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { IntegrationProvider } from '@/types/automation';

interface IntegrationSetupProps {
  provider: IntegrationProvider;
  isConnected: boolean;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onTest?: () => Promise<boolean>;
}

const providerInfo: Record<
  IntegrationProvider,
  { name: string; description: string; icon?: string }
> = {
  GMAIL: {
    name: 'Gmail',
    description: 'Send and receive emails, manage labels and filters',
    icon: '📧',
  },
  GOOGLE_SHEETS: {
    name: 'Google Sheets',
    description: 'Read and write spreadsheet data',
    icon: '📊',
  },
  GOOGLE_DRIVE: {
    name: 'Google Drive',
    description: 'Access and manage files in Google Drive',
    icon: '📁',
  },
  GOOGLE_CALENDAR: {
    name: 'Google Calendar',
    description: 'Create and manage calendar events',
    icon: '📅',
  },
  SLACK: {
    name: 'Slack',
    description: 'Send messages, manage channels, and notifications',
    icon: '💬',
  },
  MICROSOFT_TEAMS: {
    name: 'Microsoft Teams',
    description: 'Send messages and manage team collaboration',
    icon: '👥',
  },
  OUTLOOK: {
    name: 'Outlook',
    description: 'Manage emails and calendar in Outlook',
    icon: '📧',
  },
  HUBSPOT: {
    name: 'HubSpot',
    description: 'Manage CRM, contacts, and marketing campaigns',
    icon: '🎯',
  },
  SALESFORCE: {
    name: 'Salesforce',
    description: 'Access CRM data and manage sales processes',
    icon: '☁️',
  },
  STRIPE: {
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: '💳',
  },
  PAYPAL: {
    name: 'PayPal',
    description: 'Process payments via PayPal',
    icon: '💰',
  },
  MAILCHIMP: {
    name: 'Mailchimp',
    description: 'Manage email marketing campaigns and audiences',
    icon: '📬',
  },
  SENDGRID: {
    name: 'SendGrid',
    description: 'Send transactional and marketing emails',
    icon: '✉️',
  },
  TWILIO: {
    name: 'Twilio',
    description: 'Send SMS and make voice calls',
    icon: '📱',
  },
  ZOOM: {
    name: 'Zoom',
    description: 'Create and manage Zoom meetings',
    icon: '🎥',
  },
  DROPBOX: {
    name: 'Dropbox',
    description: 'Access and manage files in Dropbox',
    icon: '📦',
  },
  TRELLO: {
    name: 'Trello',
    description: 'Manage boards, cards, and lists',
    icon: '📋',
  },
  ASANA: {
    name: 'Asana',
    description: 'Manage projects and tasks',
    icon: '✅',
  },
  NOTION: {
    name: 'Notion',
    description: 'Access and manage Notion pages and databases',
    icon: '📝',
  },
  AIRTABLE: {
    name: 'Airtable',
    description: 'Read and write data in Airtable bases',
    icon: '🗂️',
  },
  WEBHOOK: {
    name: 'Webhook',
    description: 'Send HTTP requests to external services',
    icon: '🔗',
  },
  HTTP_REQUEST: {
    name: 'HTTP Request',
    description: 'Make custom HTTP API calls',
    icon: '🌐',
  },
  DATABASE: {
    name: 'Database',
    description: 'Connect to SQL and NoSQL databases',
    icon: '🗄️',
  },
  OPENAI: {
    name: 'OpenAI',
    description: 'Access GPT models and AI capabilities',
    icon: '🤖',
  },
  ANTHROPIC: {
    name: 'Anthropic',
    description: 'Access AI models',
    icon: '🧠',
  },
  QUICKBOOKS: {
    name: 'QuickBooks',
    description: 'Manage accounting, invoices, and financial data',
    icon: '💼',
  },
  XERO: {
    name: 'Xero',
    description: 'Cloud accounting and bookkeeping platform',
    icon: '📊',
  },
  SHOPIFY: {
    name: 'Shopify',
    description: 'E-commerce platform for online stores',
    icon: '🛒',
  },
  FACEBOOK: {
    name: 'Facebook',
    description: 'Social media marketing and advertising',
    icon: '📘',
  },
  BAMBOOHR: {
    name: 'BambooHR',
    description: 'HR management and employee data',
    icon: '👥',
  },
  GITHUB: {
    name: 'GitHub',
    description: 'Code repository and development workflow',
    icon: '💻',
  },
  GOOGLE_DOCS: {
    name: 'Google Docs',
    description: 'Create and edit documents collaboratively',
    icon: '📄',
  },
  OTHER: {
    name: 'Other',
    description: 'Custom integration',
    icon: '🔌',
  },
};

export function IntegrationSetup({
  provider,
  isConnected,
  lastUsedAt,
  expiresAt,
  onConnect,
  onDisconnect,
  onTest,
}: IntegrationSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [setupGuide, setSetupGuide] = useState<any>(null);

  const info = providerInfo[provider];

  const isExpiringSoon =
    expiresAt && new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error: any) {
      // Check if OAuth credentials are required
      if (error?.code === 'OAUTH_CREDENTIALS_REQUIRED' && error?.setupGuide) {
        setSetupGuide(error.setupGuide);
        setShowSetupGuide(true);
      } else {
        // Re-throw other errors
        throw error;
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect from ${info.name}?`)) return;
    setIsDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleTest = async () => {
    if (!onTest) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await onTest();
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card variant="default" className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{info.icon || '🔌'}</div>
            <div>
              <CardTitle className="text-lg">{info.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{info.description}</CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? 'success' : 'default'}>
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Not Connected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Alerts */}
        {isExpired && (
          <Alert variant="error" showIcon>
            <AlertDescription>
              <strong>Expired:</strong> This connection has expired. Please reconnect to continue
              using it.
            </AlertDescription>
          </Alert>
        )}

        {isExpiringSoon && !isExpired && (
          <Alert variant="warning" showIcon>
            <AlertDescription>
              <strong>Expiring Soon:</strong> This connection will expire on{' '}
              {expiresAt && new Date(expiresAt).toLocaleDateString()}.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Result */}
        {testResult !== null && (
          <Alert variant={testResult ? 'success' : 'error'} showIcon>
            <AlertDescription>
              {testResult
                ? 'Connection test successful!'
                : 'Connection test failed. Please check your credentials.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Last Used */}
        {isConnected && lastUsedAt && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className=" w-5 h-5" />
            <span>
              Last used:{' '}
              {new Date(lastUsedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {/* Connection Info */}
        {isConnected && expiresAt && !isExpired && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <AlertCircle className=" w-5 h-5" />
            <span>
              Expires on:{' '}
              {new Date(expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {isConnected ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex-1"
              >
                <Unlink className=" w-5 h-5 mr-2" />
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={isTesting}
                  className="flex-1"
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              <LinkIcon className=" w-5 h-5 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Setup Guide Dialog */}
    {showSetupGuide && setupGuide && (
      <Dialog open={showSetupGuide} onOpenChange={setShowSetupGuide}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Setup {setupGuide.name} Integration</DialogTitle>
            <DialogDescription>
              {setupGuide.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>OAuth Setup Required:</strong> This integration requires OAuth credentials to be configured for your organization.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold text-astralis-navy mb-2">Setup Steps:</h4>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                <li>Go to the {setupGuide.name} developer portal</li>
                <li>Create a new OAuth application</li>
                <li>Configure the redirect URI: <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">https://astralisone.com/api/integrations/{provider.toLowerCase().replace(/_/g, '-')}/oauth/callback</code></li>
                <li>Copy the Client ID and Client Secret</li>
                <li>Enter the credentials in your organization settings</li>
              </ol>
            </div>

            {setupGuide.setupUrl && setupGuide.setupUrl !== '#' && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <a href={setupGuide.setupUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open {setupGuide.name} Developer Portal
                  </a>
                </Button>
                <Button asChild>
                  <Link href="/settings">
                    Go to Settings
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupGuide(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  );
}
