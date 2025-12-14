import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Database, Server, Shield, Zap, Users, Globe, Cpu, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Architecture Overview | Astralis',
  description: 'Learn about Astralis platform architecture, components, and technical design.',
};

const architectureComponents = [
  {
    category: 'Frontend',
    icon: Globe,
    components: [
      {
        name: 'Next.js 15',
        description: 'React framework with App Router, server components, and edge runtime',
        features: ['SSR/SSG', 'API Routes', 'Middleware', 'Edge Functions'],
      },
      {
        name: 'TypeScript',
        description: 'Type-safe development with strict mode and advanced type checking',
        features: ['Strict Types', 'IntelliSense', 'Runtime Safety'],
      },
      {
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework with custom Astralis design system',
        features: ['Responsive', 'Custom Theme', 'Dark Mode Ready'],
      },
    ],
  },
  {
    category: 'Backend & Database',
    icon: Server,
    components: [
      {
        name: 'Prisma ORM',
        description: 'Type-safe database access with PostgreSQL and automatic migrations',
        features: ['Type Safety', 'Migrations', 'Query Optimization'],
      },
      {
        name: 'PostgreSQL',
        description: 'Managed relational database with advanced features and scalability',
        features: ['ACID Compliant', 'JSON Support', 'Advanced Indexing'],
      },
      {
        name: 'Redis (Upstash)',
        description: 'Managed Redis for caching, sessions, and background job queues',
        features: ['BullMQ', 'Session Store', 'Rate Limiting'],
      },
    ],
  },
  {
    category: 'AI & Automation',
    icon: Cpu,
    components: [
      {
        name: 'OpenAI GPT-4',
        description: 'Advanced language models for intelligent task processing and routing',
        features: ['Task Classification', 'Content Generation', 'Decision Making'],
      },
      {
        name: 'Anthropic Claude',
        description: 'Alternative AI model for specialized processing tasks',
        features: ['Document Analysis', 'Complex Reasoning', 'Safety Features'],
      },
      {
        name: 'n8n',
        description: 'Visual workflow automation platform for complex business processes',
        features: ['Drag & Drop', '500+ Integrations', 'Custom Workflows'],
      },
    ],
  },
  {
    category: 'Integrations & APIs',
    icon: Layers,
    components: [
      {
        name: 'OAuth 2.0',
        description: 'Secure third-party service integration with proper token management',
        features: ['Auto Refresh', 'State Protection', 'Multi-Tenant'],
      },
      {
        name: 'REST APIs',
        description: 'Comprehensive API surface for programmatic access and integrations',
        features: ['OpenAPI Spec', 'Rate Limiting', 'Webhook Support'],
      },
      {
        name: 'Webhooks',
        description: 'Real-time event delivery for instant system synchronization',
        features: ['Signature Verification', 'Retry Logic', 'Event Filtering'],
      },
    ],
  },
];

const systemCapabilities = [
  {
    title: 'Multi-Tenant Architecture',
    description: 'Complete isolation between organizations with shared infrastructure efficiency',
    icon: Users,
    features: ['Organization Scoping', 'Resource Quotas', 'Custom Branding'],
  },
  {
    title: 'Real-Time Processing',
    description: 'Instant event processing and notifications across all connected services',
    icon: Zap,
    features: ['WebSocket Support', 'Push Notifications', 'Live Updates'],
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption, audit trails, and compliance features',
    icon: Shield,
    features: ['End-to-End Encryption', 'SOC 2 Ready', 'Audit Logs'],
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Cloud-native architecture designed for high availability and performance',
    icon: Database,
    features: ['Auto Scaling', 'Global CDN', '99.9% Uptime SLA'],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Architecture Overview
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Learn about Astralis platform architecture, technical design decisions, and system capabilities
          </p>
        </div>

        {/* System Overview */}
        <Card className="mb-12 bg-gradient-to-r from-astralis-blue/5 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">System Overview</CardTitle>
            <CardDescription className="text-lg">
              Astralis is a modern, cloud-native platform built for enterprise automation and AI-powered workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Core Principles</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Event-Driven:</strong> Real-time processing and instant notifications</li>
                  <li>• <strong>AI-First:</strong> Intelligent automation and decision making</li>
                  <li>• <strong>Developer-Friendly:</strong> Comprehensive APIs and extensive documentation</li>
                  <li>• <strong>Enterprise-Ready:</strong> Security, compliance, and scalability</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Key Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Multi-tenant organization management</li>
                  <li>• 14+ third-party service integrations</li>
                  <li>• Visual workflow builder with n8n</li>
                  <li>• AI-powered document processing and OCR</li>
                  <li>• Real-time collaboration and notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Components */}
        <div className="space-y-12 mb-12">
          {architectureComponents.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-astralis-blue/10 rounded-lg">
                  <category.icon className="w-6 h-6 text-astralis-blue" />
                </div>
                <h2 className="text-2xl font-bold text-astralis-navy">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                {category.components.map((component) => (
                  <Card key={component.name} className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <CardDescription>{component.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {component.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System Capabilities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">System Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {systemCapabilities.map((capability) => (
              <Card key={capability.title} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <capability.icon className="w-6 h-6 text-astralis-blue" />
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </div>
                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {capability.features.map((feature) => (
                      <li key={feature} className="text-sm text-slate-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-astralis-blue rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Flow */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Data Flow Architecture</CardTitle>
            <CardDescription>
              How data moves through the Astralis platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="font-semibold text-astralis-navy">User Interface</div>
                  <div className="text-sm text-slate-600">React + Next.js</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-astralis-navy">API Layer</div>
                  <div className="text-sm text-slate-600">REST + GraphQL</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-semibold text-astralis-navy">AI Processing</div>
                  <div className="text-sm text-slate-600">GPT-4 + Claude</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl mb-2">💾</div>
                  <div className="font-semibold text-astralis-navy">Data Storage</div>
                  <div className="text-sm text-slate-600">PostgreSQL + Redis</div>
                </div>
              </div>

              <div className="text-center text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <span>Real-time sync</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Event-driven processing</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Intelligent automation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Learn More</CardTitle>
            <CardDescription className="text-center">
              Dive deeper into specific aspects of the Astralis platform
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/docs/security">
                  Security & Privacy
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/api">
                  API Reference
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/integrations">
                  Integration Guides
                </Link>
              </Button>
              <Button asChild>
                <Link href="/docs">
                  View All Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}