import { Metadata } from 'next';
import Link from 'next/link';
import { Puzzle, Zap, Settings, BarChart3, Users, Globe, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'n8n Integration | Astralis',
  description: 'Learn about advanced workflow automation using n8n integration with Astralis.',
};

const n8nFeatures = [
  {
    title: 'Visual Workflow Builder',
    description: 'Drag-and-drop interface for creating complex automation workflows',
    icon: Puzzle,
    benefits: [
      'Intuitive node-based editor',
      '500+ pre-built integrations',
      'Custom workflow templates',
      'Real-time workflow execution',
    ],
  },
  {
    title: 'Advanced Logic',
    description: 'Powerful conditional logic, loops, and data transformation',
    icon: Code,
    benefits: [
      'If/else branching and switches',
      'Loop through data sets',
      'Data filtering and transformation',
      'Error handling and retries',
    ],
  },
  {
    title: 'Multi-Step Automation',
    description: 'Chain multiple actions and integrations together',
    icon: Zap,
    benefits: [
      'Sequential and parallel execution',
      'Webhook triggers and responses',
      'API calls and data processing',
      'Scheduled and event-based workflows',
    ],
  },
  {
    title: 'Monitoring & Analytics',
    description: 'Track workflow performance and execution metrics',
    icon: BarChart3,
    benefits: [
      'Execution logs and history',
      'Performance metrics and timing',
      'Error tracking and debugging',
      'Workflow success rates',
    ],
  },
];

const integrationScenarios = [
  {
    title: 'E-commerce Order Processing',
    description: 'Automate order fulfillment from Shopify to inventory systems',
    workflow: [
      'Shopify order webhook trigger',
      'Extract order details and customer info',
      'Check inventory levels via API',
      'Update order status in Shopify',
      'Send confirmation email to customer',
      'Create shipping label automatically',
    ],
    integrations: ['Shopify', 'Email Service', 'Shipping API', 'Inventory System'],
  },
  {
    title: 'Customer Support Ticketing',
    description: 'Route customer inquiries to appropriate support teams',
    workflow: [
      'Email or chat message received',
      'AI analyzes content and sentiment',
      'Categorize by topic and urgency',
      'Route to appropriate team member',
      'Create ticket in support system',
      'Send automated response to customer',
    ],
    integrations: ['Email/Chat', 'AI Service', 'CRM', 'Support Ticketing'],
  },
  {
    title: 'Financial Reporting Automation',
    description: 'Generate and distribute financial reports automatically',
    workflow: [
      'Scheduled trigger (end of month)',
      'Pull data from accounting systems',
      'Generate financial reports and charts',
      'Review and approve reports',
      'Distribute to stakeholders via email',
      'Archive reports for compliance',
    ],
    integrations: ['Accounting Software', 'Email', 'Cloud Storage', 'Approval System'],
  },
];

const setupSteps = [
  {
    step: 1,
    title: 'Deploy n8n Instance',
    description: 'Set up your n8n workflow automation server',
    details: [
      'Deploy n8n to your preferred hosting platform',
      'Configure environment variables and database',
      'Set up user authentication and access controls',
      'Configure webhook URLs and API endpoints',
    ],
  },
  {
    step: 2,
    title: 'Connect Astralis',
    description: 'Establish secure connection between Astralis and n8n',
    details: [
      'Generate API keys in Astralis',
      'Configure n8n credentials for Astralis API',
      'Set up webhook endpoints in Astralis',
      'Test the connection with sample data',
    ],
  },
  {
    step: 3,
    title: 'Build Workflows',
    description: 'Create automated workflows using n8n visual builder',
    details: [
      'Design workflow logic and data flow',
      'Add Astralis nodes for document processing',
      'Configure triggers and scheduled execution',
      'Test workflows with sample data',
    ],
  },
  {
    step: 4,
    title: 'Deploy & Monitor',
    description: 'Deploy workflows to production and monitor execution',
    details: [
      'Activate workflows in production environment',
      'Set up monitoring and alerting',
      'Configure error handling and retries',
      'Monitor performance and optimize as needed',
    ],
  },
];

export default function N8nPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <Settings className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            n8n Integration
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Advanced workflow automation with n8n's powerful visual builder and 500+ integrations
          </p>
        </div>

        {/* n8n Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">What is n8n?</CardTitle>
            <CardDescription className="text-lg">
              n8n is a powerful open-source workflow automation tool that extends Astralis capabilities with advanced automation features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">n8n Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Visual Builder:</strong> Drag-and-drop workflow creation</li>
                  <li>• <strong>500+ Integrations:</strong> Connect to any API or service</li>
                  <li>• <strong>Self-Hosted:</strong> Full control over your data and workflows</li>
                  <li>• <strong>Open Source:</strong> Free, extensible, and community-driven</li>
                  <li>• <strong>Advanced Logic:</strong> Complex conditional workflows</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Astralis + n8n</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Document Processing:</strong> AI-powered document analysis</li>
                  <li>• <strong>Intelligent Routing:</strong> Smart task assignment</li>
                  <li>• <strong>Multi-Step Automation:</strong> Complex business processes</li>
                  <li>• <strong>Real-Time Sync:</strong> Instant data synchronization</li>
                  <li>• <strong>Enterprise Scale:</strong> Handle high-volume workflows</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* n8n Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">n8n + Astralis Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {n8nFeatures.map((feature) => (
              <Card key={feature.title} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Scenarios */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Common Integration Scenarios</h2>

          <div className="space-y-6">
            {integrationScenarios.map((scenario) => (
              <Card key={scenario.title} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-astralis-navy mb-3">Workflow Steps</h5>
                      <ol className="space-y-2">
                        {scenario.workflow.map((step, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                            <Badge variant="outline" className="text-xs mr-2 flex-shrink-0">
                              {index + 1}
                            </Badge>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium text-astralis-navy mb-3">Integrations Used</h5>
                      <div className="flex flex-wrap gap-2">
                        {scenario.integrations.map((integration, index) => (
                          <Badge key={index} variant="secondary">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Setup Guide */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Setup Guide</h2>

          <div className="space-y-6">
            {setupSteps.map((step) => (
              <Card key={step.step} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prerequisites */}
        <Alert className="mb-12">
          <Settings className="h-[24px] w-[24px]" />
          <AlertDescription>
            <strong>Prerequisites:</strong> Before setting up n8n integration, ensure you have:
            <ul className="mt-2 ml-4 list-disc">
              <li>Astralis account with admin access</li>
              <li>n8n instance (self-hosted or cloud)</li>
              <li>Basic understanding of API concepts</li>
              <li>Familiarity with workflow automation concepts</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Architecture */}
        <Card className="mb-12 bg-gradient-to-r from-orange-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Integration Architecture</CardTitle>
            <CardDescription>
              How Astralis and n8n work together for advanced automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-semibold text-astralis-navy">Astralis</div>
                  <div className="text-sm text-slate-600">Document processing, AI routing, integrations</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-semibold text-astralis-navy">API Bridge</div>
                  <div className="text-sm text-slate-600">RESTful communication between systems</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-semibold text-astralis-navy">n8n</div>
                  <div className="text-sm text-slate-600">Visual workflow builder, 500+ integrations</div>
                </div>
              </div>

              <div className="text-center text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <span>Data flows seamlessly between systems</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Complex automation becomes simple</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Ready for Advanced Automation?</CardTitle>
            <CardDescription className="text-center">
              Unlock the full potential of Astralis with n8n workflow automation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <a href="https://docs.n8n.io/" target="_blank" rel="noopener noreferrer">
                  n8n Documentation
                  <Globe className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/workflows">
                  Basic Workflows
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/automation-best-practices">
                  Best Practices
                </Link>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Need help setting up n8n integration? Check our{' '}
              <Link href="/docs/api" className="text-astralis-blue hover:underline">
                API documentation
              </Link>
              {' '}or contact our enterprise support team for personalized setup assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}