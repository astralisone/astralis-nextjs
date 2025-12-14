import { Metadata } from 'next';
import Link from 'next/link';
import { Workflow, Play, Pause, Settings, Zap, GitBranch, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Workflow Builder | Astralis',
  description: 'Learn about visual workflow automation and custom business process creation in Astralis.',
};

const workflowFeatures = [
  {
    title: 'Visual Builder',
    description: 'Drag-and-drop interface for creating complex workflows',
    icon: GitBranch,
    features: [
      'Intuitive node-based editor',
      'Real-time workflow validation',
      'Template library',
      'Version control and history',
    ],
  },
  {
    title: 'Trigger System',
    description: 'Multiple ways to start automated workflows',
    icon: Zap,
    features: [
      'Event-based triggers',
      'Schedule-based triggers',
      'API webhook triggers',
      'Manual trigger buttons',
    ],
  },
  {
    title: 'Action Library',
    description: 'Comprehensive set of automation actions',
    icon: Play,
    features: [
      'Integration actions (Gmail, Slack, etc.)',
      'Data processing actions',
      'Conditional logic actions',
      'Notification actions',
    ],
  },
  {
    title: 'Workflow Management',
    description: 'Monitor and control running workflows',
    icon: Settings,
    features: [
      'Real-time execution monitoring',
      'Error handling and retries',
      'Performance analytics',
      'Workflow versioning',
    ],
  },
];

const workflowTypes = [
  {
    name: 'Document Processing',
    description: 'Automate document upload, OCR, and AI analysis workflows',
    triggers: ['Document uploaded', 'API webhook', 'Scheduled'],
    actions: ['OCR processing', 'AI classification', 'Email notifications', 'Database updates'],
    useCase: 'Legal document processing, invoice automation, contract analysis',
  },
  {
    name: 'Customer Onboarding',
    description: 'Streamline new customer setup and integration processes',
    triggers: ['New signup', 'Form submission', 'API call'],
    actions: ['Create accounts', 'Send welcome emails', 'Set up integrations', 'Assign tasks'],
    useCase: 'SaaS onboarding, client intake, account provisioning',
  },
  {
    name: 'Task Automation',
    description: 'Automate repetitive business tasks and approvals',
    triggers: ['Time-based', 'Event-based', 'Manual trigger'],
    actions: ['Create tasks', 'Send notifications', 'Update records', 'Generate reports'],
    useCase: 'Invoice processing, employee onboarding, compliance checks',
  },
  {
    name: 'Integration Sync',
    description: 'Keep data synchronized between multiple systems',
    triggers: ['Data changes', 'Scheduled sync', 'API events'],
    actions: ['Data transformation', 'Cross-system updates', 'Conflict resolution', 'Audit logging'],
    useCase: 'CRM sync, inventory management, multi-system data flows',
  },
];

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Workflow className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Workflow Builder
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Create powerful automated workflows with our visual drag-and-drop builder
          </p>
        </div>

        {/* Workflow Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">What Are Workflows?</CardTitle>
            <CardDescription className="text-lg">
              Automated sequences of actions triggered by events, schedules, or manual initiation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Key Components</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Triggers:</strong> What starts the workflow</li>
                  <li>• <strong>Actions:</strong> What the workflow does</li>
                  <li>• <strong>Conditions:</strong> Decision points in the flow</li>
                  <li>• <strong>Data Flow:</strong> How information moves between steps</li>
                  <li>• <strong>Error Handling:</strong> What happens when things go wrong</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Benefits</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Automation:</strong> Eliminate manual repetitive tasks</li>
                  <li>• <strong>Consistency:</strong> Ensure processes are followed every time</li>
                  <li>• <strong>Speed:</strong> Complete complex tasks in seconds</li>
                  <li>• <strong>Reliability:</strong> Reduce human error</li>
                  <li>• <strong>Scalability:</strong> Handle increased workload automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Workflow Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {workflowFeatures.map((feature) => (
              <Card key={feature.title} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Workflow Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Common Workflow Types</h2>

          <div className="space-y-6">
            {workflowTypes.map((workflow) => (
              <Card key={workflow.name} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium text-astralis-navy mb-2">Triggers</h5>
                      <ul className="space-y-1">
                        {workflow.triggers.map((trigger, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            {trigger}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-astralis-navy mb-2">Actions</h5>
                      <ul className="space-y-1">
                        {workflow.actions.map((action, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                            <Play className="w-3 h-3 text-green-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-astralis-navy mb-2">Use Case</h5>
                      <p className="text-sm text-slate-600">{workflow.useCase}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Creating Your First Workflow</CardTitle>
            <CardDescription>
              Step-by-step guide to building your first automated workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-astralis-navy mb-3">Step 1: Choose a Template</h4>
                  <p className="text-slate-600 mb-4">
                    Start with a pre-built template or create from scratch. Templates include common workflows like document processing and customer onboarding.
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Templates
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold text-astralis-navy mb-3">Step 2: Configure Trigger</h4>
                  <p className="text-slate-600 mb-4">
                    Set up what will start your workflow. Choose from events, schedules, webhooks, or manual triggers.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Triggers
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-astralis-navy mb-3">Step 3: Add Actions</h4>
                  <p className="text-slate-600 mb-4">
                    Drag and drop actions to build your workflow. Connect integrations, add conditions, and set up notifications.
                  </p>
                  <Button variant="outline" size="sm">
                    Add Actions
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold text-astralis-navy mb-3">Step 4: Test & Deploy</h4>
                  <p className="text-slate-600 mb-4">
                    Test your workflow with sample data, then deploy it to start automating your processes.
                  </p>
                  <Button variant="outline" size="sm">
                    Test Workflow
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Advanced Workflow Features</CardTitle>
            <CardDescription>
              Powerful capabilities for complex automation scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Conditional Logic</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• If/else branches based on data conditions</li>
                  <li>• Switch statements for multiple paths</li>
                  <li>• Data validation and filtering</li>
                  <li>• Error handling with fallback paths</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Data Processing</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Data transformation and mapping</li>
                  <li>• API calls and external integrations</li>
                  <li>• File processing and manipulation</li>
                  <li>• Database operations and queries</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Collaboration</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Team workflow sharing and permissions</li>
                  <li>• Version control and change history</li>
                  <li>• Workflow templates and reuse</li>
                  <li>• Performance monitoring and analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Integration</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Connect to 14+ third-party services</li>
                  <li>• Custom API integrations</li>
                  <li>• Webhook triggers and actions</li>
                  <li>• Real-time data synchronization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Ready to Automate?</CardTitle>
            <CardDescription className="text-center">
              Start building workflows to streamline your business processes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/automations">
                  Open Workflow Builder
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/n8n">
                  Advanced Automation with n8n
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/triggers">
                  Configure Triggers
                </Link>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Need help building workflows? Check our{' '}
              <Link href="/docs/automation-best-practices" className="text-astralis-blue hover:underline">
                automation best practices
              </Link>
              {' '}or contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}