import { Metadata } from 'next';
import Link from 'next/link';
import { Webhook, Zap, Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Webhooks | Astralis',
  description: 'Learn about real-time data synchronization using webhooks in Astralis.',
};

const webhookBenefits = [
  {
    title: 'Real-Time Updates',
    description: 'Instant notifications when data changes occur',
    icon: Zap,
    benefits: [
      'Immediate event processing',
      'No polling delays',
      'Live data synchronization',
      'Instant user notifications',
    ],
  },
  {
    title: 'Efficient Resource Usage',
    description: 'Reduce API calls and server load',
    icon: Server,
    benefits: [
      'Lower bandwidth usage',
      'Reduced server load',
      'Better scalability',
      'Cost optimization',
    ],
  },
  {
    title: 'Reliable Event Delivery',
    description: 'Guaranteed event delivery with retry logic',
    icon: CheckCircle,
    benefits: [
      'Automatic retry on failure',
      'Event persistence',
      'Delivery guarantees',
      'Failure notifications',
    ],
  },
];

const webhookEvents = [
  {
    category: 'Integrations',
    events: [
      { name: 'integration.connected', description: 'New integration successfully connected' },
      { name: 'integration.disconnected', description: 'Integration access revoked' },
      { name: 'integration.error', description: 'Integration encountered an error' },
      { name: 'integration.token_refresh', description: 'OAuth token automatically refreshed' },
    ],
  },
  {
    category: 'Documents',
    events: [
      { name: 'document.uploaded', description: 'New document uploaded and processed' },
      { name: 'document.processed', description: 'Document OCR and AI processing completed' },
      { name: 'document.error', description: 'Document processing failed' },
      { name: 'document.deleted', description: 'Document removed from system' },
    ],
  },
  {
    category: 'Tasks & Pipelines',
    events: [
      { name: 'task.created', description: 'New task automatically created' },
      { name: 'task.assigned', description: 'Task assigned to user or team' },
      { name: 'task.completed', description: 'Task marked as completed' },
      { name: 'pipeline.stage_changed', description: 'Task moved to different pipeline stage' },
    ],
  },
  {
    category: 'AI & Automation',
    events: [
      { name: 'ai.classification_complete', description: 'AI task classification finished' },
      { name: 'automation.triggered', description: 'Automated workflow executed' },
      { name: 'automation.completed', description: 'Automation workflow finished' },
      { name: 'automation.error', description: 'Automation encountered an error' },
    ],
  },
];

const securityFeatures = [
  {
    title: 'Signature Verification',
    description: 'Cryptographic verification of webhook authenticity',
    code: `const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

const isValid = signature === request.headers['x-webhook-signature'];`,
  },
  {
    title: 'Request Validation',
    description: 'Comprehensive validation of webhook payloads',
    features: [
      'JSON schema validation',
      'Type checking',
      'Required field validation',
      'Sanitization',
    ],
  },
  {
    title: 'Rate Limiting',
    description: 'Protection against webhook abuse',
    features: [
      'Request throttling',
      'IP-based limits',
      'Event type limits',
      'Automatic blocking',
    ],
  },
];

export default function WebhooksPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <Webhook className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Webhooks
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real-time event delivery system for instant data synchronization and automation
          </p>
        </div>

        {/* Webhook Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">What Are Webhooks?</CardTitle>
            <CardDescription className="text-lg">
              Webhooks are automated messages sent from one system to another when specific events occur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Traditional Polling</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600">Check every 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600">Wasteful API calls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-slate-600">Delayed notifications</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Webhook Push</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-green-500" />
                    <span className="text-slate-600">Instant notifications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-600">Efficient resource usage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-600">Real-time updates</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Benefits of Webhooks</h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {webhookBenefits.map((benefit) => (
              <Card key={benefit.title} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <benefit.icon className="w-6 h-6 text-purple-600" />
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefit.benefits.map((item, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Webhook Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Available Webhook Events</h2>

          <div className="space-y-6">
            {webhookEvents.map((category) => (
              <Card key={category.category} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  <CardDescription>
                    Events related to {category.category.toLowerCase()} in Astralis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {category.events.map((event) => (
                      <div key={event.name} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                            {event.name}
                          </code>
                          <Badge variant="secondary" className="text-xs">
                            Real-time
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Security & Reliability</h2>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {feature.code ? (
                    <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                      <code>{feature.code}</code>
                    </pre>
                  ) : (
                    <ul className="space-y-1">
                      {feature.features.map((item, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Implementation */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Webhook Implementation</CardTitle>
            <CardDescription>
              How to set up and handle webhooks in your Astralis integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Receiving Webhooks</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">1. Set up endpoint</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mt-1">
                      <code>POST https://yourapp.com/webhooks/astralis</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">2. Verify signature</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mt-1">
                      <code>check webhook signature header</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">3. Process event</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mt-1">
                      <code>handle based on event.type</code>
                    </pre>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Webhook Payload</h4>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto">
                  <code>{`{
  "id": "evt_1234567890",
  "type": "document.processed",
  "created": 1640995200,
  "data": {
    "documentId": "doc_123",
    "organizationId": "org_456",
    "status": "completed",
    "metadata": { ... }
  }
}`}</code>
                </pre>
              </div>
            </div>

            <Alert>
              <Shield className="h-[24px] w-[24px]" />
              <AlertDescription>
                <strong>Security Note:</strong> Always verify webhook signatures to ensure authenticity.
                Store your webhook secret securely and rotate it regularly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mb-12 bg-gradient-to-r from-purple-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Best Practices</CardTitle>
            <CardDescription>
              Recommendations for reliable webhook implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Implementation</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Always verify webhook signatures</li>
                  <li>• Implement idempotency to handle duplicates</li>
                  <li>• Return 200 status quickly to avoid timeouts</li>
                  <li>• Process webhooks asynchronously</li>
                  <li>• Log all webhook attempts for debugging</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Reliability</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Implement retry logic for failed deliveries</li>
                  <li>• Monitor webhook health and latency</li>
                  <li>• Handle rate limits gracefully</li>
                  <li>• Set up alerts for webhook failures</li>
                  <li>• Test webhooks with sample payloads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Ready to Use Webhooks?</CardTitle>
            <CardDescription className="text-center">
              Start building real-time integrations with Astralis webhooks
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/docs/api">
                  API Reference
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/integrations">
                  Setup Integrations
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:support@astralisone.com">
                  Webhook Support
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Need help implementing webhooks? Check our{' '}
              <Link href="/docs/api" className="text-astralis-blue hover:underline">
                API documentation
              </Link>
              {' '}or contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}