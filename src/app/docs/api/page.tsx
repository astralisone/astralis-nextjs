import { Metadata } from 'next';
import Link from 'next/link';
import { Code, Server, Key, Database, Webhook, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'API Reference | Astralis',
  description: 'Complete API documentation for Astralis platform including endpoints, authentication, and examples.',
};

const apiEndpoints = [
  {
    category: 'Authentication',
    icon: Key,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/signin',
        description: 'Authenticate user with email/password',
        auth: 'None',
      },
      {
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Create new user account',
        auth: 'None',
      },
      {
        method: 'GET',
        path: '/api/auth/session',
        description: 'Get current session information',
        auth: 'Required',
      },
    ],
  },
  {
    category: 'Integrations',
    icon: Code,
    endpoints: [
      {
        method: 'GET',
        path: '/api/integrations',
        description: 'List user integrations',
        auth: 'Required',
      },
      {
        method: 'POST',
        path: '/api/integrations/{provider}/connect',
        description: 'Initiate OAuth flow',
        auth: 'Required',
      },
      {
        method: 'DELETE',
        path: '/api/integrations/{provider}/{id}',
        description: 'Disconnect integration',
        auth: 'Required',
      },
      {
        method: 'POST',
        path: '/api/integrations/{provider}/test',
        description: 'Test integration connectivity',
        auth: 'Required',
      },
    ],
  },
  {
    category: 'Documents',
    icon: Database,
    endpoints: [
      {
        method: 'POST',
        path: '/api/documents/upload',
        description: 'Upload document for processing',
        auth: 'Required',
      },
      {
        method: 'GET',
        path: '/api/documents',
        description: 'List user documents',
        auth: 'Required',
      },
      {
        method: 'GET',
        path: '/api/documents/{id}',
        description: 'Get document details',
        auth: 'Required',
      },
      {
        method: 'DELETE',
        path: '/api/documents/{id}',
        description: 'Delete document',
        auth: 'Required',
      },
    ],
  },
  {
    category: 'Tasks & Pipelines',
    icon: Server,
    endpoints: [
      {
        method: 'GET',
        path: '/api/pipelines',
        description: 'List organization pipelines',
        auth: 'Required',
      },
      {
        method: 'POST',
        path: '/api/tasks',
        description: 'Create new task',
        auth: 'Required',
      },
      {
        method: 'PUT',
        path: '/api/tasks/{id}',
        description: 'Update task details',
        auth: 'Required',
      },
      {
        method: 'POST',
        path: '/api/pipelines/{id}/items/{itemId}/move',
        description: 'Move task between pipeline stages',
        auth: 'Required',
      },
    ],
  },
  {
    category: 'Webhooks',
    icon: Webhook,
    endpoints: [
      {
        method: 'POST',
        path: '/api/webhooks/{type}',
        description: 'Receive webhook events',
        auth: 'Signature',
      },
      {
        method: 'GET',
        path: '/api/webhooks',
        description: 'List webhook configurations',
        auth: 'Required',
      },
      {
        method: 'POST',
        path: '/api/webhooks',
        description: 'Create webhook endpoint',
        auth: 'Required',
      },
    ],
  },
];

const authentication = [
  {
    type: 'Bearer Token',
    description: 'JWT token from authentication',
    header: 'Authorization: Bearer <token>',
    example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...',
  },
  {
    type: 'Session Cookie',
    description: 'Automatic session handling',
    header: 'Cookie: next-auth.session-token=...',
    example: 'Handled automatically by browser',
  },
  {
    type: 'API Key',
    description: 'For webhook signature verification',
    header: 'X-API-Key: <key>',
    example: 'X-API-Key: sk-abcd1234',
  },
];

const responseCodes = [
  { code: '200', status: 'OK', description: 'Request successful' },
  { code: '201', status: 'Created', description: 'Resource created successfully' },
  { code: '400', status: 'Bad Request', description: 'Invalid request parameters' },
  { code: '401', status: 'Unauthorized', description: 'Authentication required' },
  { code: '403', status: 'Forbidden', description: 'Insufficient permissions' },
  { code: '404', status: 'Not Found', description: 'Resource not found' },
  { code: '429', status: 'Too Many Requests', description: 'Rate limit exceeded' },
  { code: '500', status: 'Internal Server Error', description: 'Server error' },
];

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Code className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            API Reference
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Complete API documentation for integrating with Astralis platform
          </p>
        </div>

        {/* API Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">API Overview</CardTitle>
            <CardDescription className="text-lg">
              RESTful API with comprehensive endpoints for all platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <Server className="w-8 h-8 text-astralis-blue mx-auto mb-2" />
                <h4 className="font-semibold text-astralis-navy">RESTful Design</h4>
                <p className="text-sm text-slate-600">Standard HTTP methods and JSON responses</p>
              </div>
              <div className="text-center p-4">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-astralis-navy">Secure</h4>
                <p className="text-sm text-slate-600">JWT authentication and encrypted communications</p>
              </div>
              <div className="text-center p-4">
                <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-astralis-navy">Comprehensive</h4>
                <p className="text-sm text-slate-600">Full CRUD operations for all resources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Authentication</h2>

          <div className="space-y-4">
            {authentication.map((auth) => (
              <Card key={auth.type} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{auth.type}</CardTitle>
                  <CardDescription>{auth.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-slate-700">Header:</span>
                      <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded">
                        {auth.header}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Example:</span>
                      <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded block mt-1">
                        {auth.example}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">API Endpoints</h2>

          <Tabs defaultValue="authentication" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            {apiEndpoints.map((category) => (
              <TabsContent key={category.category.toLowerCase()} value={category.category.toLowerCase()}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <category.icon className="w-6 h-6 text-astralis-blue" />
                      <CardTitle>{category.category} Endpoints</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.endpoints.map((endpoint, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  endpoint.method === 'GET' ? 'default' :
                                  endpoint.method === 'POST' ? 'secondary' :
                                  endpoint.method === 'PUT' ? 'outline' : 'destructive'
                                }
                              >
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono">{endpoint.path}</code>
                            </div>
                            <Badge variant={endpoint.auth === 'Required' ? 'default' : 'secondary'}>
                              {endpoint.auth}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Response Codes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Response Codes</h2>

          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {responseCodes.map((response) => (
                  <div key={response.code} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        response.code.startsWith('2') ? 'default' :
                        response.code.startsWith('4') ? 'destructive' : 'secondary'
                      }>
                        {response.code}
                      </Badge>
                      <span className="text-sm font-medium">{response.status}</span>
                    </div>
                    <p className="text-xs text-slate-600">{response.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limiting */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Rate Limiting</CardTitle>
            <CardDescription>
              API rate limits to ensure fair usage and system stability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Limits</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Authenticated requests:</strong> 1000/hour per user</li>
                  <li>• <strong>Unauthenticated requests:</strong> 100/hour per IP</li>
                  <li>• <strong>File uploads:</strong> 50MB per file, 10 files/hour</li>
                  <li>• <strong>Webhook deliveries:</strong> Unlimited (with retry logic)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Headers</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">X-RateLimit-Limit</code>: Total requests allowed</li>
                  <li>• <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">X-RateLimit-Remaining</code>: Requests remaining</li>
                  <li>• <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">X-RateLimit-Reset</code>: Time until reset</li>
                  <li>• <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Retry-After</code>: Seconds to wait when limited</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDKs & Libraries */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">SDKs & Libraries</CardTitle>
            <CardDescription>
              Official and community-maintained libraries for popular languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">📘</div>
                <h4 className="font-semibold text-astralis-navy">JavaScript</h4>
                <p className="text-sm text-slate-600">Official SDK</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  npm install
                </Button>
              </div>
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">🐍</div>
                <h4 className="font-semibold text-astralis-navy">Python</h4>
                <p className="text-sm text-slate-600">Community SDK</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  pip install
                </Button>
              </div>
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">💎</div>
                <h4 className="font-semibold text-astralis-navy">Ruby</h4>
                <p className="text-sm text-slate-600">Community SDK</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  gem install
                </Button>
              </div>
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-astralis-navy">Go</h4>
                <p className="text-sm text-slate-600">Community SDK</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  go get
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Ready to Integrate?</CardTitle>
            <CardDescription className="text-center">
              Start building with the Astralis API
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/docs/quick-start">
                  Quick Start Guide
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com/astralisone/astralis-nextjs" target="_blank" rel="noopener noreferrer">
                  View on GitHub <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:api@astralisone.com">
                  API Support
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Need help with API integration? Check our{' '}
              <Link href="/docs/integrations" className="text-astralis-blue hover:underline">
                integration guides
              </Link>
              {' '}or contact our developer support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}