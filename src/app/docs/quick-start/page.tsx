import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, Settings, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Quick Start Guide | Astralis',
  description: 'Get started with Astralis in 5 minutes. Complete setup guide for new users.',
};

const steps = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Sign up for Astralis and verify your email',
    details: [
      'Visit astralisone.com and click "Sign Up"',
      'Enter your email and create a secure password',
      'Check your email for verification link',
      'Complete your profile setup',
    ],
    icon: Users,
  },
  {
    step: 2,
    title: 'Set Up Your Organization',
    description: 'Create or join an organization to start collaborating',
    details: [
      'Create a new organization or join existing one',
      'Invite team members to collaborate',
      'Configure organization settings and preferences',
      'Set up user roles and permissions',
    ],
    icon: Settings,
  },
  {
    step: 3,
    title: 'Connect Your First Integration',
    description: 'Link external services to start automating workflows',
    details: [
      'Go to Integrations page',
      'Choose a service (Gmail, Slack, etc.)',
      'Follow OAuth setup guide',
      'Test the connection',
    ],
    icon: Zap,
  },
  {
    step: 4,
    title: 'Create Your First Pipeline',
    description: 'Set up automated workflows for your business processes',
    details: [
      'Navigate to Pipelines section',
      'Choose a template or create custom pipeline',
      'Configure stages and automation rules',
      'Add team members and assign tasks',
    ],
    icon: CheckCircle,
  },
  {
    step: 5,
    title: 'Explore Advanced Features',
    description: 'Discover AI-powered automation and analytics',
    details: [
      'Try AI intake routing for intelligent task assignment',
      'Set up automated reminders and notifications',
      'Explore document processing with OCR',
      'Configure calendar integrations',
    ],
    icon: Shield,
  },
];

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Quick Start Guide
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Get up and running with Astralis in just 5 minutes
          </p>

          <Alert className="max-w-2xl mx-auto">
            <CheckCircle className="h-[24px] w-[24px]" />
            <AlertDescription>
              <strong>Prerequisites:</strong> Modern web browser, valid email address
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Setup Steps */}
        <div className="space-y-8 mb-12">
          {steps.map((step, index) => (
            <Card key={step.step} className="border-l-4 border-l-astralis-blue">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-astralis-blue text-white rounded-full font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="flex items-center gap-2">
                    <step.icon className="w-6 h-6 text-astralis-blue" />
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-lg ml-16">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="ml-16">
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What's Next */}
        <Card className="bg-gradient-to-r from-astralis-blue/5 to-purple-50 border-astralis-blue/20">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">🎉 You're All Set!</CardTitle>
            <CardDescription className="text-lg">
              Here's what you can do next to get the most out of Astralis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Explore Core Features</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• <Link href="/docs/integrations" className="text-astralis-blue hover:underline">Connect more integrations</Link></li>
                  <li>• <Link href="/docs/workflows" className="text-astralis-blue hover:underline">Build custom workflows</Link></li>
                  <li>• <Link href="/docs/api" className="text-astralis-blue hover:underline">Use our API for custom integrations</Link></li>
                  <li>• Set up automated notifications and reminders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Advanced Capabilities</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• <Link href="/docs/n8n" className="text-astralis-blue hover:underline">Advanced workflow automation with n8n</Link></li>
                  <li>• AI-powered document processing and OCR</li>
                  <li>• Intelligent task routing and assignment</li>
                  <li>• Real-time collaboration features</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/docs">
                    Explore Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              If you run into any issues during setup, we're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <a href="mailto:support@astralisone.com">
                  <span className="font-semibold">Email Support</span>
                  <span className="text-sm text-slate-600">Get help from our team</span>
                </a>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <a href="https://github.com/astralisone/astralis-nextjs/discussions" target="_blank" rel="noopener noreferrer">
                  <span className="font-semibold">Community</span>
                  <span className="text-sm text-slate-600">Ask the community</span>
                </a>
              </Button>
              <Button variant="outline" asChild className="h-auto p-4 flex-col">
                <a href="https://github.com/astralisone/astralis-nextjs/issues" target="_blank" rel="noopener noreferrer">
                  <span className="font-semibold">Report Issues</span>
                  <span className="text-sm text-slate-600">Found a bug?</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}