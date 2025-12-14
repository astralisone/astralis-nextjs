import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Server, Key, AlertTriangle, CheckCircle, Users, Database, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Security & Privacy | Astralis',
  description: 'Learn about Astralis security measures, data protection, and privacy compliance.',
};

const securityFeatures = [
  {
    category: 'Data Protection',
    icon: Database,
    features: [
      {
        title: 'End-to-End Encryption',
        description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption',
        status: 'Implemented',
      },
      {
        title: 'Secure Data Storage',
        description: 'Managed PostgreSQL with automated backups and point-in-time recovery',
        status: 'Implemented',
      },
      {
        title: 'Data Residency',
        description: 'Data stored in secure, SOC 2 compliant cloud infrastructure',
        status: 'Implemented',
      },
    ],
  },
  {
    category: 'Authentication & Access',
    icon: Key,
    features: [
      {
        title: 'Multi-Factor Authentication',
        description: 'Optional 2FA support for enhanced account security',
        status: 'Planned',
      },
      {
        title: 'Role-Based Access Control',
        description: 'Granular permissions system with organization and user-level controls',
        status: 'Implemented',
      },
      {
        title: 'Session Management',
        description: 'Secure session handling with automatic expiration and renewal',
        status: 'Implemented',
      },
    ],
  },
  {
    category: 'API Security',
    icon: Server,
    features: [
      {
        title: 'OAuth 2.0 Integration',
        description: 'Secure third-party service integration with proper token management',
        status: 'Implemented',
      },
      {
        title: 'Rate Limiting',
        description: 'API rate limiting to prevent abuse and ensure fair usage',
        status: 'Implemented',
      },
      {
        title: 'Request Validation',
        description: 'Comprehensive input validation and sanitization',
        status: 'Implemented',
      },
    ],
  },
  {
    category: 'Compliance & Auditing',
    icon: Eye,
    features: [
      {
        title: 'Audit Logging',
        description: 'Comprehensive activity logging for security monitoring and compliance',
        status: 'Implemented',
      },
      {
        title: 'GDPR Compliance',
        description: 'Data protection and privacy rights in accordance with GDPR',
        status: 'Implemented',
      },
      {
        title: 'Data Portability',
        description: 'Users can export their data in standard formats',
        status: 'Implemented',
      },
    ],
  },
];

const privacyPrinciples = [
  {
    principle: 'Data Minimization',
    description: 'We only collect and process the minimum data necessary for our services',
    icon: Database,
  },
  {
    principle: 'Purpose Limitation',
    description: 'Data is collected for specific, legitimate purposes and not used beyond those purposes',
    icon: Target,
  },
  {
    principle: 'Consent & Control',
    description: 'Users have full control over their data with clear consent mechanisms',
    icon: Users,
  },
  {
    principle: 'Security by Design',
    description: 'Security measures are built into our systems from the ground up',
    icon: Shield,
  },
  {
    principle: 'Transparency',
    description: 'Clear communication about data practices and user rights',
    icon: Eye,
  },
  {
    principle: 'Accountability',
    description: 'We take responsibility for data protection and maintain comprehensive records',
    icon: CheckCircle,
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/docs" className="inline-flex items-center text-astralis-blue hover:underline mb-4">
            ← Back to Documentation
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-astralis-navy mb-4">
            Security & Privacy
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Learn about our comprehensive security measures, data protection practices, and privacy commitments
          </p>
        </div>

        {/* Security Overview */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            <strong>Security First:</strong> Astralis is built with enterprise-grade security from the ground up.
            Your data is protected by multiple layers of security controls and encryption.
          </AlertDescription>
        </Alert>

        {/* Security Features */}
        <div className="space-y-12 mb-12">
          {securityFeatures.map((category) => (
            <div key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <category.icon className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-astralis-navy">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <Card key={feature.title} className="border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge
                          variant={feature.status === 'Implemented' ? 'default' : 'secondary'}
                          className={feature.status === 'Implemented' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Principles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-astralis-navy mb-6">Privacy by Design</h2>
          <p className="text-slate-600 mb-8">
            Our privacy practices are guided by core principles that ensure user trust and regulatory compliance.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privacyPrinciples.map((principle) => (
              <Card key={principle.principle} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <principle.icon className="w-6 h-6 text-astralis-blue" />
                    <CardTitle className="text-lg">{principle.principle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Handling */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">How We Handle Your Data</CardTitle>
            <CardDescription>
              Transparent information about data collection, processing, and user rights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Data We Collect</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Account information (email, name, organization)</li>
                  <li>• Usage data and analytics (anonymized)</li>
                  <li>• Integration credentials (encrypted)</li>
                  <li>• Document content for processing (temporary)</li>
                  <li>• Communication preferences and settings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Your Rights</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Access your personal data anytime</li>
                  <li>• Request data deletion or portability</li>
                  <li>• Opt-out of non-essential communications</li>
                  <li>• Control integration permissions</li>
                  <li>• View and manage organization data</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Data Encryption:</strong> All sensitive data is encrypted using AES-256 encryption.
                API keys, OAuth tokens, and personal information are never stored in plain text.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Security Best Practices */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Security Best Practices</CardTitle>
            <CardDescription>
              Recommendations for keeping your Astralis account and data secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Account Security</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication when available</li>
                  <li>• Regularly review account access and permissions</li>
                  <li>• Log out of shared devices</li>
                  <li>• Monitor account activity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-astralis-navy mb-3">Integration Security</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>• Only connect trusted third-party services</li>
                  <li>• Review integration permissions carefully</li>
                  <li>• Regularly audit connected applications</li>
                  <li>• Revoke access for unused integrations</li>
                  <li>• Monitor integration activity and errors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Certifications */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-slate-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-astralis-navy">Compliance & Certifications</CardTitle>
            <CardDescription>
              Our commitment to meeting industry standards and regulatory requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-astralis-navy mb-2">SOC 2 Ready</h4>
                <p className="text-sm text-slate-600">
                  Infrastructure and processes designed to meet SOC 2 compliance standards
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-astralis-navy mb-2">GDPR Compliant</h4>
                <p className="text-sm text-slate-600">
                  Full compliance with EU General Data Protection Regulation
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-astralis-navy mb-2">ISO 27001</h4>
                <p className="text-sm text-slate-600">
                  Information security management system standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Security Questions?</CardTitle>
            <CardDescription className="text-center">
              Have concerns about security or privacy? We're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <a href="mailto:security@astralisone.com">
                  Security Team
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:privacy@astralisone.com">
                  Privacy Officer
                </a>
              </Button>
              <Button asChild>
                <a href="https://github.com/astralisone/astralis-nextjs/security/advisories" target="_blank" rel="noopener noreferrer">
                  Security Advisories
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              For security incidents or vulnerabilities, please contact us immediately at{' '}
              <a href="mailto:security@astralisone.com" className="text-astralis-blue hover:underline">
                security@astralisone.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}