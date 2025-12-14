import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Webhook, Key, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Documentation | Astralis',
  description: 'Complete documentation for Astralis platform including API reference, integrations, and guides',
};

const docsSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of Astralis and get up and running quickly',
    icon: Settings,
    items: [
      { title: 'Quick Start Guide', href: '/docs/quick-start', description: '5-minute setup guide' },
      { title: 'Architecture Overview', href: '/docs/architecture', description: 'Platform architecture and components' },
      { title: 'Security & Privacy', href: '/docs/security', description: 'Security features and compliance' },
    ],
  },
  {
    title: 'Integrations',
    description: 'Connect third-party services and automate workflows',
    icon: Key,
    items: [
      { title: 'Integration Setup', href: '/docs/integrations', description: 'Step-by-step integration guides' },
      { title: 'OAuth Configuration', href: '/docs/oauth', description: 'OAuth 2.0 setup and troubleshooting' },
      { title: 'Webhooks', href: '/docs/webhooks', description: 'Real-time data synchronization' },
      { title: 'API Reference', href: '/docs/api', description: 'Complete API documentation' },
    ],
  },
  {
    title: 'Automation',
    description: 'Build powerful workflows and automate business processes',
    icon: Webhook,
    items: [
      { title: 'Workflow Builder', href: '/docs/workflows', description: 'Create custom automation workflows' },
      { title: 'Triggers & Actions', href: '/docs/triggers', description: 'Available triggers and actions' },
      { title: 'n8n Integration', href: '/docs/n8n', description: 'Advanced workflow automation' },
      { title: 'Best Practices', href: '/docs/automation-best-practices', description: 'Optimization and troubleshooting' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-astralis-blue/10 rounded-full mb-6">
            <BookOpen className="w-8 h-8 text-astralis-blue" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Astralis Documentation
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about building, integrating, and automating with Astralis
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-astralis-blue/20 bg-gradient-to-br from-astralis-blue/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-astralis-blue">New to Astralis?</CardTitle>
              <CardDescription>Start with our comprehensive getting started guide</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/docs/quick-start">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-transparent">
            <CardHeader>
              <CardTitle className="text-green-700">Need Integration Help?</CardTitle>
              <CardDescription>Step-by-step guides for connecting your favorite tools</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Link href="/docs/integrations">
                  Setup Integrations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
            <CardHeader>
              <CardTitle className="text-purple-700">API Reference</CardTitle>
              <CardDescription>Complete API documentation for developers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                <Link href="/docs/api">
                  View API Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {docsSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-astralis-blue/10 rounded-lg">
                  <section.icon className="w-6 h-6 text-astralis-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-astralis-navy">{section.title}</h2>
                  <p className="text-slate-600">{section.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item) => (
                  <Card key={item.title} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="ghost" size="sm" asChild className="p-0 h-auto font-normal text-astralis-blue hover:text-astralis-blue/80">
                        <Link href={item.href}>
                          Read more
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <Card className="mt-12 bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Need Help?</CardTitle>
            <CardDescription className="text-center">
              Can't find what you're looking for? Our community and support team are here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="https://github.com/astralisone/astralis-nextjs/discussions" target="_blank" rel="noopener noreferrer">
                  Community Discussions
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/astralisone/astralis-nextjs/issues" target="_blank" rel="noopener noreferrer">
                  Report Issues
                </a>
              </Button>
              <Button asChild>
                <a href="mailto:support@astralisone.com">
                  Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}