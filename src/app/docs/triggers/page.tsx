import { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Clock, Webhook, MousePointer, Database, Mail, FileText, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Triggers & Actions | Astralis',
  description: 'Complete guide to workflow triggers and automation actions available in Astralis.',
};

const triggerTypes = [
  {
    category: 'Event-Based Triggers',
    icon: Zap,
    description: 'React to events happening in real-time',
    triggers: [
      {
        name: 'Document Uploaded',
        description: 'Triggered when a new document is uploaded to the system',
        icon: FileText,
        example: 'Automatically process invoices when uploaded',
      },
      {
        name: 'Integration Connected',
        description: 'Fired when a new third-party integration is successfully connected',
        icon: Database,
        example: 'Send welcome email and set up initial sync',
      },
      {
        name: 'Task Created',
        description: 'Activated when a new task is created in any pipeline',
        icon: User,
        example: 'Assign task to appropriate team member based on type',
      },
      {
        name: 'Email Received',
        description: 'Triggered by incoming emails to connected accounts',
        icon: Mail,
        example: 'Automatically categorize and route customer inquiries',
      },
    ],
  },
  {
    category: 'Time-Based Triggers',
    icon: Clock,
    description: 'Execute workflows on schedules or time intervals',
    triggers: [
      {
        name: 'Daily Schedule',
        description: 'Run workflow once per day at specified time',
        icon: Clock,
        example: 'Generate daily sales reports every morning at 9 AM',
      },
      {
        name: 'Weekly Schedule',
        description: 'Execute workflow weekly on specific days',
        icon: Clock,
        example: 'Send weekly team progress updates every Monday',
      },
      {
        name: 'Interval Schedule',
        description: 'Run workflow every X minutes/hours',
        icon: Clock,
        example: 'Check for new data every 15 minutes',
      },
      {
        name: 'Business Hours',
        description: 'Only execute during specified business hours',
        icon: Clock,
        example: 'Send customer notifications only during business hours',
      },
    ],
  },
  {
    category: 'Webhook Triggers',
    icon: Webhook,
    description: 'Respond to external API calls and webhooks',
    triggers: [
      {
        name: 'HTTP Webhook',
        description: 'Triggered by incoming HTTP requests to custom endpoints',
        icon: Webhook,
        example: 'Process payment webhooks from Stripe',
      },
      {
        name: 'API Call',
        description: 'Activated by direct API calls to workflow endpoints',
        icon: Webhook,
        example: 'Trigger workflow from external systems',
      },
      {
        name: 'Integration Webhook',
        description: 'Receive webhooks from connected third-party services',
        icon: Webhook,
        example: 'Respond to GitHub repository events',
      },
    ],
  },
  {
    category: 'Manual Triggers',
    icon: MousePointer,
    description: 'User-initiated workflow execution',
    triggers: [
      {
        name: 'Button Click',
        description: 'Workflow started by clicking a custom button in the UI',
        icon: MousePointer,
        example: 'One-click invoice generation from customer data',
      },
      {
        name: 'Form Submission',
        description: 'Triggered when users submit specific forms',
        icon: MousePointer,
        example: 'Process new client onboarding forms automatically',
      },
      {
        name: 'Bulk Action',
        description: 'Execute workflow on multiple selected items',
        icon: MousePointer,
        example: 'Bulk update multiple tasks or documents',
      },
    ],
  },
];

const actionCategories = [
  {
    name: 'Integration Actions',
    description: 'Interact with connected third-party services',
    actions: [
      'Send Gmail email',
      'Create Slack message',
      'Update Google Sheet',
      'Create Salesforce lead',
      'Upload to Dropbox',
      'Post to Microsoft Teams',
    ],
  },
  {
    name: 'Data Processing',
    description: 'Manipulate and transform data',
    actions: [
      'Extract text from documents',
      'Transform data formats',
      'Validate data against rules',
      'Merge multiple data sources',
      'Generate reports',
      'Store in database',
    ],
  },
  {
    name: 'Communication',
    description: 'Send notifications and messages',
    actions: [
      'Send email notifications',
      'Create in-app notifications',
      'Send SMS messages',
      'Post to communication channels',
      'Generate PDF reports',
      'Create calendar events',
    ],
  },
  {
    name: 'Workflow Control',
    description: 'Control workflow execution flow',
    actions: [
      'Conditional branching',
      'Loop through data',
      'Wait for user input',
      'Call sub-workflows',
      'Handle errors gracefully',
      'Set workflow variables',
    ],
  },
];

export default function TriggersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Triggers & Actions
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Complete guide to workflow triggers and automation actions in Astralis
          </p>
        </div>

        {/* Triggers Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Understanding Triggers</CardTitle>
            <CardDescription className="text-lg">
              Triggers are the starting points for automated workflows. They define when and how workflows begin execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Trigger Types</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Event-Based:</strong> React to system events</li>
                  <li>• <strong>Time-Based:</strong> Execute on schedules</li>
                  <li>• <strong>Webhook-Based:</strong> Respond to external calls</li>
                  <li>• <strong>Manual:</strong> User-initiated execution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Best Practices</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Choose triggers that match your use case</li>
                  <li>• Consider frequency and resource usage</li>
                  <li>• Test triggers with sample data</li>
                  <li>• Monitor trigger performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Types */}
        <div className="space-y-12 mb-12">
          {triggerTypes.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <category.icon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-astralis-navy">{category.category}</h2>
                  <p className="text-slate-600">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {category.triggers.map((trigger) => (
                  <Card key={trigger.name} className="border-slate-200">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <trigger.icon className="w-5 h-5 text-astralis-blue" />
                        <CardTitle className="text-lg">{trigger.name}</CardTitle>
                      </div>
                      <CardDescription>{trigger.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Example:</strong> {trigger.example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Workflow Actions</CardTitle>
            <CardDescription className="text-lg">
              Actions define what your workflows actually do. From sending emails to processing data, actions make automation possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Action Categories</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Integration Actions:</strong> Connect with external services</li>
                  <li>• <strong>Data Actions:</strong> Process and transform information</li>
                  <li>• <strong>Communication:</strong> Send notifications and messages</li>
                  <li>• <strong>Control Flow:</strong> Manage workflow execution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Action Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Configurable parameters and settings</li>
                  <li>• Error handling and retry logic</li>
                  <li>• Conditional execution based on data</li>
                  <li>• Integration with workflow variables</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Available Actions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {actionCategories.map((category) => (
              <Card key={category.name} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {category.actions.map((action, index) => (
                      <Badge key={index} variant="secondary" className="justify-start text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Configuration Examples */}
        <Card className="mb-12 bg-gradient-to-r from-yellow-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Configuration Examples</CardTitle>
            <CardDescription>
              Real-world examples of trigger and action combinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-lg p-6">
                <h4 className="font-semibold text-astralis-navy mb-3">Document Processing Workflow</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Trigger</Badge>
                    <span className="text-slate-700">Document Uploaded</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 1</Badge>
                      <span className="text-slate-700">Extract text with OCR</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 2</Badge>
                      <span className="text-slate-700">Classify document type with AI</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 3</Badge>
                      <span className="text-slate-700">Route to appropriate team</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-6">
                <h4 className="font-semibold text-astralis-navy mb-3">Customer Onboarding Automation</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Trigger</Badge>
                    <span className="text-slate-700">New Customer Form Submitted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 1</Badge>
                      <span className="text-slate-700">Create customer account</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 2</Badge>
                      <span className="text-slate-700">Send welcome email</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Action 3</Badge>
                      <span className="text-slate-700">Set up initial project</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Ready to Build Workflows?</CardTitle>
            <CardDescription className="text-center">
              Start creating automated workflows with triggers and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/automations">
                  Create Workflow
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/workflows">
                  Workflow Builder Guide
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/automation-best-practices">
                  Best Practices
                </Link>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Need help choosing the right triggers and actions? Check our{' '}
              <Link href="/docs/n8n" className="text-astralis-blue hover:underline">
                advanced automation guide
              </Link>
              {' '}or contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}