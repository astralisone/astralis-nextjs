import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, Zap, Shield, BarChart3, Users, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Automation Best Practices | Astralis',
  description: 'Learn best practices for building reliable, maintainable, and efficient automated workflows.',
};

const bestPractices = [
  {
    category: 'Design Principles',
    icon: Target,
    practices: [
      {
        title: 'Start Small, Scale Gradually',
        description: 'Begin with simple workflows and gradually add complexity as you understand the system better.',
        tips: [
          'Test workflows with sample data first',
          'Start with one integration at a time',
          'Document each workflow step clearly',
          'Get user feedback before expanding',
        ],
      },
      {
        title: 'Single Responsibility Principle',
        description: 'Each workflow should have one clear, well-defined purpose.',
        tips: [
          'Avoid creating "kitchen sink" workflows',
          'Split complex processes into smaller workflows',
          'Use clear, descriptive workflow names',
          'Document the workflow\'s specific goal',
        ],
      },
      {
        title: 'Error Handling First',
        description: 'Design for failure scenarios before implementing success paths.',
        tips: [
          'Plan for API failures and rate limits',
          'Implement retry logic with exponential backoff',
          'Set up monitoring and alerting for failures',
          'Have manual fallback processes ready',
        ],
      },
    ],
  },
  {
    category: 'Performance & Reliability',
    icon: Zap,
    practices: [
      {
        title: 'Monitor Resource Usage',
        description: 'Track API calls, processing time, and resource consumption.',
        tips: [
          'Set up dashboards for workflow metrics',
          'Monitor for performance degradation',
          'Implement rate limiting where appropriate',
          'Optimize expensive operations',
        ],
      },
      {
        title: 'Implement Circuit Breakers',
        description: 'Prevent cascading failures by temporarily stopping problematic workflows.',
        tips: [
          'Monitor error rates and response times',
          'Automatically disable failing workflows',
          'Implement gradual recovery mechanisms',
          'Alert administrators of circuit breaker activation',
        ],
      },
      {
        title: 'Use Appropriate Trigger Frequencies',
        description: 'Balance real-time needs with system resource constraints.',
        tips: [
          'Use webhooks for instant updates when possible',
          'Batch operations for non-critical updates',
          'Respect API rate limits of integrated services',
          'Consider business hours for time-sensitive operations',
        ],
      },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    practices: [
      {
        title: 'Secure Credential Management',
        description: 'Never expose API keys or sensitive data in logs or error messages.',
        tips: [
          'Use encrypted storage for all credentials',
          'Rotate API keys regularly',
          'Limit credential access to necessary systems',
          'Audit credential usage and access patterns',
        ],
      },
      {
        title: 'Data Privacy Compliance',
        description: 'Ensure workflows comply with data protection regulations.',
        tips: [
          'Minimize data collection to essential fields',
          'Implement proper data retention policies',
          'Respect user data deletion requests',
          'Document data processing purposes clearly',
        ],
      },
      {
        title: 'Access Control',
        description: 'Implement proper authorization for workflow execution and management.',
        tips: [
          'Require authentication for workflow triggers',
          'Validate user permissions before execution',
          'Log all workflow access and modifications',
          'Regularly audit workflow permissions',
        ],
      },
    ],
  },
  {
    category: 'Maintenance & Monitoring',
    icon: BarChart3,
    practices: [
      {
        title: 'Comprehensive Logging',
        description: 'Log all workflow execution details for debugging and auditing.',
        tips: [
          'Include timestamps, user context, and parameters',
          'Log both successful and failed executions',
          'Use structured logging for easy querying',
          'Set up log retention and archiving policies',
        ],
      },
      {
        title: 'Regular Health Checks',
        description: 'Proactively monitor workflow health and performance.',
        tips: [
          'Implement automated health check workflows',
          'Monitor integration connectivity regularly',
          'Set up alerts for unusual patterns',
          'Conduct regular workflow audits',
        ],
      },
      {
        title: 'Version Control',
        description: 'Track changes to workflows and maintain version history.',
        tips: [
          'Use descriptive commit messages for changes',
          'Test workflow changes in staging environments',
          'Maintain rollback procedures for critical workflows',
          'Document breaking changes and migration paths',
        ],
      },
    ],
  },
];

const commonPitfalls = [
  {
    pitfall: 'Over-Automation',
    description: 'Trying to automate everything at once leads to complex, fragile systems.',
    solution: 'Focus on high-value, repetitive tasks. Manual oversight is still valuable for complex decisions.',
    severity: 'High',
  },
  {
    pitfall: 'Ignoring Error Cases',
    description: 'Building workflows that only handle the happy path leads to silent failures.',
    solution: 'Design for failure scenarios first. Implement comprehensive error handling and monitoring.',
    severity: 'Critical',
  },
  {
    pitfall: 'Tight Coupling',
    description: 'Workflows that are too dependent on specific integrations become brittle.',
    solution: 'Use abstraction layers and consider fallback options for critical integrations.',
    severity: 'Medium',
  },
  {
    pitfall: 'No Testing Strategy',
    description: 'Deploying untested workflows can cause data corruption or business disruptions.',
    solution: 'Implement comprehensive testing including unit tests, integration tests, and user acceptance testing.',
    severity: 'Critical',
  },
  {
    pitfall: 'Poor Documentation',
    description: 'Undocumented workflows become maintenance nightmares.',
    solution: 'Document workflow purpose, data flow, dependencies, and maintenance procedures.',
    severity: 'Medium',
  },
];

const successMetrics = [
  {
    metric: 'Reliability',
    indicators: [
      'Uptime > 99.5%',
      'Error rate < 1%',
      'Mean time to resolution < 1 hour',
      'Automated recovery rate > 95%',
    ],
  },
  {
    metric: 'Performance',
    indicators: [
      'Average execution time < 30 seconds',
      'Resource utilization < 70%',
      'API response time < 2 seconds',
      'Concurrent workflow capacity > 100',
    ],
  },
  {
    metric: 'Business Impact',
    indicators: [
      'Time savings > 50% for automated tasks',
      'Error reduction > 80%',
      'User satisfaction > 90%',
      'ROI > 300% within 12 months',
    ],
  },
];

export default function AutomationBestPracticesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Automation Best Practices
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Build reliable, maintainable, and efficient automated workflows with proven best practices
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Why Best Practices Matter</CardTitle>
            <CardDescription className="text-lg">
              Automation can transform your business, but poorly designed workflows can cause more problems than they solve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3 text-green-700">✅ Benefits of Good Practices</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Reliability:</strong> Workflows that work when you need them</li>
                  <li>• <strong>Maintainability:</strong> Easy to update and troubleshoot</li>
                  <li>• <strong>Scalability:</strong> Handle increased load gracefully</li>
                  <li>• <strong>Security:</strong> Protect sensitive data and systems</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3 text-red-700">❌ Risks of Poor Practices</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Downtime:</strong> Failed workflows disrupt business</li>
                  <li>• <strong>Data Loss:</strong> Incorrect automation corrupts data</li>
                  <li>• <strong>Security Issues:</strong> Exposed credentials or data breaches</li>
                  <li>• <strong>Maintenance Burden:</strong> Complex systems are hard to fix</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices Categories */}
        <div className="space-y-12 mb-12">
          {bestPractices.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <category.icon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-astralis-navy">{category.category}</h2>
              </div>

              <div className="space-y-6">
                {category.practices.map((practice) => (
                  <Card key={practice.title} className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{practice.title}</CardTitle>
                      <CardDescription>{practice.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-astralis-navy mb-2">Implementation Tips</h5>
                          <ul className="space-y-1">
                            {practice.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h5 className="font-medium text-astralis-navy mb-2">Key Benefits</h5>
                          <p className="text-sm text-slate-600">
                            Following these practices ensures your automation is reliable, maintainable, and provides real business value.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Common Pitfalls */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Common Pitfalls to Avoid</h2>

          <div className="space-y-4">
            {commonPitfalls.map((pitfall) => (
              <Alert key={pitfall.pitfall} className={
                pitfall.severity === 'Critical' ? 'border-red-200 bg-red-50' :
                pitfall.severity === 'High' ? 'border-orange-200 bg-orange-50' :
                'border-yellow-200 bg-yellow-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-lg">{pitfall.pitfall}</strong>
                      <Badge variant={
                        pitfall.severity === 'Critical' ? 'destructive' :
                        pitfall.severity === 'High' ? 'secondary' : 'outline'
                      }>
                        {pitfall.severity}
                      </Badge>
                    </div>
                    <p><strong>Problem:</strong> {pitfall.description}</p>
                    <p><strong>Solution:</strong> {pitfall.solution}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Measuring Success</CardTitle>
            <CardDescription>
              Key metrics to track for automation success and continuous improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              {successMetrics.map((metric) => (
                <div key={metric.metric} className="space-y-3">
                  <h4 className="font-semibold text-astralis-navy text-lg">{metric.metric}</h4>
                  <div className="space-y-2">
                    {metric.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-700">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Checklist */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Implementation Checklist</CardTitle>
            <CardDescription>
              Use this checklist to ensure your automation follows best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-astralis-navy">Planning Phase</h5>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Defined clear workflow objectives</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Identified all required integrations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Planned error handling scenarios</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Designed monitoring and alerting</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-astralis-navy">Implementation Phase</h5>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Implemented comprehensive logging</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Added proper error handling</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Tested with various scenarios</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span>Documented workflow thoroughly</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Help */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Need Help with Automation?</CardTitle>
            <CardDescription className="text-center">
              Our team can help you design and implement best-practice automation workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/automations">
                  Start Building
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/docs/workflows">
                  Workflow Guide
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:automation@astralisone.com">
                  Automation Consulting
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              For enterprise automation needs or complex workflow design, contact our{' '}
              <a href="mailto:enterprise@astralisone.com" className="text-astralis-blue hover:underline">
                enterprise solutions team
              </a>
              {' '}for personalized guidance and implementation support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}