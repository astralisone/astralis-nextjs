import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Integration Setup Guide | Astralis',
  description: 'Step-by-step guides for setting up third-party integrations with Astralis',
};

const integrations = [
  {
    category: 'Accounting',
    providers: [
      {
        name: 'QuickBooks',
        provider: 'QUICKBOOKS',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Go to the Intuit Developer Portal',
          'Sign in with your Intuit account',
          'Create a new app or select an existing one',
          'Navigate to the "Keys" section',
          'Copy the Client ID and Client Secret',
          'Add your redirect URI: https://yourdomain.com/api/integrations/quickbooks/oauth/callback',
          'Save the configuration in Astralis',
        ],
        requirements: ['Intuit Developer Account', 'QuickBooks Company Account'],
        troubleshooting: [
          'Ensure your app is in "Development" mode for testing',
          'Verify the redirect URI matches exactly',
          'Check that your QuickBooks company is not in sandbox mode',
        ],
      },
      {
        name: 'Xero',
        provider: 'XERO',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Visit the Xero Developer Portal',
          'Sign in with your Xero account',
          'Click "New App" to create a new application',
          'Fill in app details (name, company URL, redirect URI)',
          'Set redirect URI: https://yourdomain.com/api/integrations/xero/oauth/callback',
          'Copy the Client ID and Client Secret from the app settings',
          'Configure the integration in Astralis',
        ],
        requirements: ['Xero Developer Account', 'Xero Organisation'],
        troubleshooting: [
          'Xero requires HTTPS for redirect URIs in production',
          'Ensure your Xero organisation is not in demo mode',
          'Check that the redirect URI is URL-encoded if needed',
        ],
      },
    ],
  },
  {
    category: 'CRM & Sales',
    providers: [
      {
        name: 'HubSpot',
        provider: 'HUBSPOT',
        difficulty: 'Easy',
        setupTime: '10-15 minutes',
        steps: [
          'Go to HubSpot Developer Account',
          'Navigate to "Apps" and click "Create App"',
          'Fill in basic app information',
          'Under the "Auth" tab, find Client ID and Client Secret',
          'Add redirect URL: https://yourdomain.com/api/integrations/hubspot/oauth/callback',
          'Configure required scopes (contacts, companies, deals)',
          'Save the integration settings in Astralis',
        ],
        requirements: ['HubSpot Account', 'HubSpot Developer Account'],
        troubleshooting: [
          'HubSpot requires specific scopes for different data access',
          'Ensure your HubSpot account has the necessary permissions',
          'Check that the app is published in HubSpot',
        ],
      },
      {
        name: 'Salesforce',
        provider: 'SALESFORCE',
        difficulty: 'Medium',
        setupTime: '20-25 minutes',
        steps: [
          'Log into Salesforce and go to Setup',
          'Navigate to "Apps > App Manager"',
          'Click "New Connected App"',
          'Fill in basic information (name, email, etc.)',
          'Enable OAuth Settings and set callback URL',
          'Set callback URL: https://yourdomain.com/api/integrations/salesforce/oauth/callback',
          'Add required scopes (api, refresh_token, offline_access)',
          'Copy Consumer Key (Client ID) and Consumer Secret',
          'Configure in Astralis',
        ],
        requirements: ['Salesforce Account', 'Admin Access to Setup'],
        troubleshooting: [
          'Salesforce has different URLs for sandbox vs production',
          'Ensure the connected app is active',
          'Check that the user has appropriate permissions',
        ],
      },
    ],
  },
  {
    category: 'Communication',
    providers: [
      {
        name: 'Slack',
        provider: 'SLACK',
        difficulty: 'Easy',
        setupTime: '10-15 minutes',
        steps: [
          'Go to Slack API Apps page',
          'Click "Create New App" and choose "From scratch"',
          'Enter app name and select workspace',
          'Navigate to "OAuth & Permissions"',
          'Add redirect URL: https://yourdomain.com/api/integrations/slack/oauth/callback',
          'Configure bot token scopes as needed',
          'Copy Client ID and Client Secret from Basic Information',
          'Install the app to your workspace',
        ],
        requirements: ['Slack Workspace', 'Admin permissions'],
        troubleshooting: [
          'Slack requires the app to be installed to the workspace',
          'Ensure bot token scopes match your needs',
          'Check that the redirect URI is correct',
        ],
      },
      {
        name: 'Gmail',
        provider: 'GMAIL',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Go to Google Cloud Console',
          'Create a new project or select existing',
          'Enable the Gmail API',
          'Go to "Credentials" and create OAuth 2.0 credentials',
          'Set application type to "Web application"',
          'Add authorized redirect URI: https://yourdomain.com/api/integrations/gmail/oauth/callback',
          'Copy Client ID and Client Secret',
          'Configure scopes for Gmail access',
        ],
        requirements: ['Google Cloud Project', 'Gmail Account'],
        troubleshooting: [
          'Google requires app verification for production use',
          'Ensure the OAuth consent screen is configured',
          'Check that the Gmail API is enabled',
        ],
      },
      {
        name: 'Microsoft Teams',
        provider: 'MICROSOFT_TEAMS',
        difficulty: 'Medium',
        setupTime: '20-25 minutes',
        steps: [
          'Go to Azure Portal and navigate to Azure Active Directory',
          'Go to "App registrations" and click "New registration"',
          'Enter app name and set redirect URI',
          'Set redirect URI: https://yourdomain.com/api/integrations/microsoft-teams/oauth/callback',
          'Copy Application (client) ID',
          'Go to "Certificates & secrets" and create a new client secret',
          'Copy the client secret value',
          'Configure API permissions for Microsoft Graph',
        ],
        requirements: ['Azure AD Account', 'Microsoft 365 Subscription'],
        troubleshooting: [
          'Microsoft Teams requires specific Graph API permissions',
          'Ensure the app is registered in the correct Azure AD tenant',
          'Check that admin consent is granted for organization-wide access',
        ],
      },
    ],
  },
  {
    category: 'Storage',
    providers: [
      {
        name: 'Google Drive',
        provider: 'GOOGLE_DRIVE',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Go to Google Cloud Console',
          'Create a new project or select existing',
          'Enable the Google Drive API',
          'Go to "Credentials" and create OAuth 2.0 credentials',
          'Set application type to "Web application"',
          'Add authorized redirect URI: https://yourdomain.com/api/integrations/google-drive/oauth/callback',
          'Copy Client ID and Client Secret',
          'Configure appropriate Drive scopes',
        ],
        requirements: ['Google Cloud Project', 'Google Account'],
        troubleshooting: [
          'Google Drive API has rate limits and quotas',
          'Ensure the OAuth consent screen includes Drive scopes',
          'Check that the project has billing enabled for higher quotas',
        ],
      },
      {
        name: 'Dropbox',
        provider: 'DROPBOX',
        difficulty: 'Easy',
        setupTime: '10-15 minutes',
        steps: [
          'Go to Dropbox App Console',
          'Click "Create app"',
          'Choose app type (Scoped access recommended)',
          'Enter app name and select access type',
          'Copy App key (Client ID) and App secret',
          'Add redirect URI: https://yourdomain.com/api/integrations/dropbox/oauth/callback',
          'Configure permission scopes as needed',
          'Submit for production access if required',
        ],
        requirements: ['Dropbox Account'],
        troubleshooting: [
          'Dropbox has different permission levels (app folder vs full access)',
          'Ensure the redirect URI is correctly configured',
          'Check that the app is approved for production use',
        ],
      },
    ],
  },
  {
    category: 'E-commerce',
    providers: [
      {
        name: 'Shopify',
        provider: 'SHOPIFY',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Go to Shopify Partners Dashboard',
          'Create a new app or select existing',
          'Go to "App setup" and configure admin API scopes',
          'Set up store credentials or use custom app',
          'For custom apps: Go to store admin > Apps > Develop apps',
          'Create a new custom app and configure scopes',
          'Copy API key and access token',
          'Set up webhooks for real-time sync if needed',
        ],
        requirements: ['Shopify Partner Account', 'Shopify Store'],
        troubleshooting: [
          'Shopify has rate limits based on API plan',
          'Ensure webhooks are properly configured for data sync',
          'Check that the app has necessary admin API scopes',
        ],
      },
    ],
  },
  {
    category: 'HR',
    providers: [
      {
        name: 'BambooHR',
        provider: 'BAMBOOHR',
        difficulty: 'Medium',
        setupTime: '15-20 minutes',
        steps: [
          'Go to BambooHR Developer Portal',
          'Sign in with your BambooHR account',
          'Navigate to API Keys section',
          'Generate a new API key',
          'Copy the API key and company subdomain',
          'Configure the integration in Astralis',
          'Set up webhook endpoints for employee data sync',
        ],
        requirements: ['BambooHR Account', 'Admin Access'],
        troubleshooting: [
          'BambooHR API keys have specific permission levels',
          'Ensure the company subdomain is correct',
          'Check that webhooks are configured for data changes',
        ],
      },
    ],
  },
  {
    category: 'Developer Tools',
    providers: [
      {
        name: 'GitHub',
        provider: 'GITHUB',
        difficulty: 'Easy',
        setupTime: '10-15 minutes',
        steps: [
          'Go to GitHub Settings > Developer settings > OAuth Apps',
          'Click "New OAuth App"',
          'Fill in application details',
          'Set Authorization callback URL: https://yourdomain.com/api/integrations/github/oauth/callback',
          'Copy Client ID and Client Secret',
          'Configure repository permissions and webhook settings',
        ],
        requirements: ['GitHub Account', 'Repository Access'],
        troubleshooting: [
          'GitHub OAuth apps require repository permissions',
          'Ensure webhooks are configured for push events',
          'Check that the callback URL is HTTPS in production',
        ],
      },
    ],
  },
  {
    category: 'Social Media',
    providers: [
      {
        name: 'Facebook',
        provider: 'FACEBOOK',
        difficulty: 'Medium',
        setupTime: '20-25 minutes',
        steps: [
          'Go to Facebook Developers Console',
          'Create a new app or select existing',
          'Add Facebook Login product to your app',
          'Configure OAuth redirect URIs',
          'Set redirect URI: https://yourdomain.com/api/integrations/facebook/oauth/callback',
          'Copy App ID and App Secret',
          'Configure app permissions and review process',
          'Submit for app review if needed for production',
        ],
        requirements: ['Facebook Developer Account', 'Business Verification'],
        troubleshooting: [
          'Facebook requires app review for many permissions',
          'Ensure the app is live and not in development mode',
          'Check that all required business information is provided',
        ],
      },
    ],
  },
];

export default function IntegrationsDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/integrations" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Integrations
          </Link>
          <h1 className="text-3xl font-bold text-astralis-navy mb-2">
            Integration Setup Guide
          </h1>
          <p className="text-lg text-slate-600">
            Step-by-step instructions for connecting third-party services to Astralis
          </p>
        </div>

        {/* Prerequisites */}
        <Alert className="mb-8">
          <AlertCircle className="h-[24px] w-[24px]" />
          <AlertDescription>
            <strong>Prerequisites:</strong> Before setting up integrations, ensure you have:
            <ul className="mt-2 ml-4 list-disc">
              <li>Admin access to your Astralis organization</li>
              <li>Developer accounts for the services you want to connect</li>
              <li>HTTPS configured for your Astralis instance (required for OAuth)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Integration Categories */}
        {integrations.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-bold text-astralis-navy mb-6">
              {category.category}
            </h2>

            <div className="grid gap-6">
              {category.providers.map((provider) => (
                <Card key={provider.provider} className="border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{provider.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={
                          provider.difficulty === 'Easy' ? 'default' :
                            provider.difficulty === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {provider.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {provider.setupTime}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Connect your {provider.name} account to sync data with Astralis
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold text-astralis-navy mb-2">Requirements</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {provider.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Setup Steps */}
                    <div>
                      <h4 className="font-semibold text-astralis-navy mb-2">Setup Steps</h4>
                      <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                        {provider.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Troubleshooting */}
                    <div>
                      <h4 className="font-semibold text-astralis-navy mb-2">Troubleshooting</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {provider.troubleshooting.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-200">
                      <Button asChild>
                        <Link href="/integrations">
                          Configure {provider.name} Integration
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Resources */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Need More Help?
            </CardTitle>
            <CardDescription>
              Additional resources and support options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-2">Documentation</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <Link href="/docs" className="text-astralis-blue hover:underline">API Documentation</Link></li>
                  <li>• <Link href="/docs/webhooks" className="text-astralis-blue hover:underline">Webhook Configuration</Link></li>
                  <li>• <Link href="/docs/oauth" className="text-astralis-blue hover:underline">OAuth Setup Guide</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-2">Support</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <a href="mailto:support@astralisone.com" className="text-astralis-blue hover:underline">Email Support</a></li>
                  <li>• <a href="https://discord.gg/astralis" className="text-astralis-blue hover:underline">Community Discord</a></li>
                  <li>• <a href="https://github.com/astralisone/astralis-nextjs/issues" className="text-astralis-blue hover:underline">GitHub Issues</a></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}