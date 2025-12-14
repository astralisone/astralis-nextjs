import { Metadata } from 'next';
import Link from 'next/link';
import { Key, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'OAuth Configuration | Astralis',
  description: 'Complete guide to OAuth 2.0 setup, troubleshooting, and best practices for integrations.',
};

const oauthFlow = [
  {
    step: 1,
    title: 'Authorization Request',
    description: 'User clicks "Connect" and is redirected to provider',
    code: `GET https://provider.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=read+write
  &response_type=code
  &state=csrf_token`,
  },
  {
    step: 2,
    title: 'User Authorization',
    description: 'User reviews permissions and grants access',
    details: 'Provider shows permission dialog and user approves',
  },
  {
    step: 3,
    title: 'Authorization Code',
    description: 'Provider redirects back with authorization code',
    code: `GET https://yourapp.com/callback?
  code=authorization_code
  &state=csrf_token`,
  },
  {
    step: 4,
    title: 'Token Exchange',
    description: 'Exchange code for access and refresh tokens',
    code: `POST https://provider.com/oauth/token
{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "redirect_uri": "https://yourapp.com/callback",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}`,
  },
  {
    step: 5,
    title: 'Token Storage',
    description: 'Securely store tokens with encryption',
    details: 'Access tokens expire, refresh tokens persist',
  },
];

const troubleshooting = [
  {
    issue: 'redirect_uri_mismatch',
    cause: 'Callback URL not registered in OAuth app',
    solution: 'Add exact redirect URI to OAuth app settings',
    severity: 'Critical',
  },
  {
    issue: 'invalid_client',
    cause: 'Client ID or secret is incorrect',
    solution: 'Verify credentials in OAuth app settings',
    severity: 'Critical',
  },
  {
    issue: 'access_denied',
    cause: 'User denied permissions or cancelled',
    solution: 'User needs to retry and approve permissions',
    severity: 'User Action',
  },
  {
    issue: 'invalid_scope',
    cause: 'Requested permissions not allowed',
    solution: 'Check scope configuration in OAuth app',
    severity: 'Configuration',
  },
  {
    issue: 'token_expired',
    cause: 'Access token has expired',
    solution: 'Use refresh token to get new access token',
    severity: 'Normal',
  },
];

const bestPractices = [
  {
    title: 'Secure Token Storage',
    description: 'Never store tokens in plain text or client-side storage',
    icon: Shield,
    practices: [
      'Encrypt tokens at rest using AES-256',
      'Use secure key management (KMS/Vault)',
      'Rotate encryption keys regularly',
      'Limit token access to necessary services',
    ],
  },
  {
    title: 'Token Lifecycle Management',
    description: 'Properly handle token expiration and refresh',
    icon: RefreshCw,
    practices: [
      'Monitor token expiration dates',
      'Implement automatic token refresh',
      'Handle refresh token expiration gracefully',
      'Notify users before token expiry',
    ],
  },
  {
    title: 'Security Best Practices',
    description: 'Follow OAuth 2.0 security guidelines',
    icon: Key,
    practices: [
      'Use PKCE (Proof Key for Code Exchange)',
      'Validate state parameter to prevent CSRF',
      'Use HTTPS for all OAuth flows',
      'Limit token scope to minimum required',
    ],
  },
];

export default function OAuthPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            OAuth 2.0 Configuration
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Complete guide to OAuth setup, security best practices, and troubleshooting common issues
          </p>
        </div>

        {/* OAuth Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">What is OAuth 2.0?</CardTitle>
            <CardDescription className="text-lg">
              OAuth 2.0 is the industry-standard protocol for secure API authorization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Key Benefits</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Secure delegated access without sharing passwords</li>
                  <li>• Granular permission control (scopes)</li>
                  <li>• Token-based authentication</li>
                  <li>• Industry standard with broad support</li>
                  <li>• Built-in security features (PKCE, state validation)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Core Components</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Client ID:</strong> Public identifier for your app</li>
                  <li>• <strong>Client Secret:</strong> Private key for secure communication</li>
                  <li>• <strong>Access Token:</strong> Short-lived credential for API access</li>
                  <li>• <strong>Refresh Token:</strong> Long-lived credential for token renewal</li>
                  <li>• <strong>Scopes:</strong> Specific permissions being requested</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OAuth Flow */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">OAuth 2.0 Authorization Flow</h2>

          <div className="space-y-6">
            {oauthFlow.map((step) => (
              <Card key={step.step} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {step.details && (
                    <p className="text-slate-600 mb-4">{step.details}</p>
                  )}
                  {step.code && (
                    <pre className="bg-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Common Issues & Solutions</h2>

          <div className="space-y-4">
            {troubleshooting.map((issue) => (
              <Card key={issue.issue} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">`{issue.issue}`</CardTitle>
                    <Badge
                      variant={
                        issue.severity === 'Critical' ? 'destructive' :
                        issue.severity === 'Configuration' ? 'secondary' : 'default'
                      }
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <CardDescription>
                    <strong>Cause:</strong> {issue.cause}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Solution:</strong> {issue.solution}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Security Best Practices</h2>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {bestPractices.map((practice) => (
              <Card key={practice.title} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <practice.icon className="w-6 h-6 text-astralis-blue" />
                    <CardTitle className="text-lg">{practice.title}</CardTitle>
                  </div>
                  <CardDescription>{practice.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {practice.practices.map((item, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-astralis-blue rounded-full mt-2 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Astralis OAuth Implementation */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Astralis OAuth Implementation</CardTitle>
            <CardDescription>
              How we implement OAuth securely in our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Security Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• PKCE (Proof Key for Code Exchange) support</li>
                  <li>• CSRF protection with state validation</li>
                  <li>• Automatic token refresh and rotation</li>
                  <li>• Encrypted token storage (AES-256)</li>
                  <li>• Secure key management and rotation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Integration Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Multi-tenant OAuth configuration</li>
                  <li>• Organization-specific credentials</li>
                  <li>• Granular scope management</li>
                  <li>• Real-time connection health monitoring</li>
                  <li>• Comprehensive error handling and recovery</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Enterprise Security:</strong> All OAuth tokens are encrypted at rest and in transit.
                We follow OAuth 2.0 security best practices and regularly audit our implementation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Getting Help */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Need OAuth Help?</CardTitle>
            <CardDescription className="text-center">
              Having trouble with OAuth configuration or integration setup?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/docs/integrations">
                  Integration Setup Guide
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://oauth.net/2/" target="_blank" rel="noopener noreferrer">
                  OAuth 2.0 Specification <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild>
                <a href="mailto:support@astralisone.com">
                  Contact Support
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              For integration-specific OAuth setup, check our{' '}
              <Link href="/docs/integrations" className="text-astralis-blue hover:underline">
                detailed integration guides
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}