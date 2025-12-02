/**
 * Automation Services Page - Astralis Specification Section 4.4
 *
 * Structure:
 * 1. Hero Section - Services headline with dark navy background
 * 2. Package Overview - Service offerings with pricing cards
 * 3. Examples Section - Automation use cases
 * 4. Value Statements - ROI, time saved, efficiency gains
 * 5. Contact CTA - Bottom call-to-action
 *
 * Design:
 * - Light theme with white backgrounds for content sections
 * - Dark navy hero section
 * - Text colors: text-astralis-navy, text-slate-700 on white backgrounds
 * - Astralis Blue accents
 */

'use client';

import Link from 'next/link';
import { Button, cn } from '@astralis/ui';
import {
  FileText,
  Database,
  Workflow,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  Users,
  Settings,
  BarChart,
  ArrowRight
} from 'lucide-react';

// Service package type definition
interface ServicePackage {
  name: string;
  description: string;
  setupFee: string;
  monthlyFee?: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

// Service packages data (per spec Section 7 SMB Pricing)
const servicePackages: ServicePackage[] = [
  {
    name: 'New Client Onboarding Setup',
    description: 'Set up online forms so new clients can submit their information automatically. No more manual data entry from paper forms or emails.',
    setupFee: '$750',
    monthlyFee: '$99/mo',
    icon: <FileText className="w-6 h-6" />,
    features: [
      'Custom online forms for your business',
      'Automatic error checking on submissions',
      'Email notifications when forms are submitted',
      'Connects to your client database',
      'Collect and organize client documents',
      'Client portal to check their status'
    ]
  },
  {
    name: 'Document Storage & Search',
    description: 'Organize all your business documents in one searchable system. Find any file in seconds instead of digging through folders.',
    setupFee: '$1,200',
    monthlyFee: '$149/mo',
    icon: <Database className="w-6 h-6" />,
    features: [
      'Upload and store all your documents',
      'Automatic filing and tagging',
      'Find documents by searching text inside them',
      'Track different versions of files',
      'Control who can see which documents',
      'Automatic daily backups for safety'
    ],
    recommended: true
  },
  {
    name: 'Full Business Automation',
    description: 'Automate your entire operation - from booking appointments to sending invoices. Everything works together automatically.',
    setupFee: '$3,500',
    icon: <Workflow className="w-6 h-6" />,
    features: [
      'Online appointment booking for clients',
      'Automatic invoice creation and sending',
      'Generate invoices from your appointments',
      'Process credit card and ACH payments',
      'Custom business reports and analytics',
      'Team messaging and task management'
    ]
  },
  {
    name: 'Built Just for Your Business',
    description: 'Custom automation designed specifically for your unique business needs. We build exactly what you need, nothing more, nothing less.',
    setupFee: '$7,500–$25,000',
    icon: <Settings className="w-6 h-6" />,
    features: [
      'Custom workflows designed for how you work',
      'Connect to any software or system you use',
      'Integrate with older/legacy business systems',
      'Advanced reporting and business analytics',
      'Dedicated support team for your account',
      'Training for your staff + user guides'
    ]
  },
  {
    name: 'Monthly Support & Improvements',
    description: 'Keep your automation running smoothly with ongoing maintenance, updates, and improvements every month.',
    setupFee: 'N/A',
    monthlyFee: '$450/mo',
    icon: <TrendingUp className="w-6 h-6" />,
    features: [
      'Monthly review of your automation performance',
      'Speed improvements and optimizations',
      'Fix any issues that come up',
      'Priority email and phone support',
      'Add new features as your business grows',
      'Monthly usage reports and recommendations'
    ]
  }
];

// Automation use case examples
const automationExamples = [
  {
    title: 'Legal Firm Client Intake',
    description: 'Automated intake forms reduce manual data entry by 80%, allowing attorneys to focus on billable work instead of administrative tasks.',
    icon: <Users className="w-8 h-8 text-astralis-blue" />,
    metrics: '80% reduction in data entry time'
  },
  {
    title: 'Financial Services Document Processing',
    description: 'Intelligent document categorization and extraction processes 500+ documents per day, improving compliance and reducing processing costs.',
    icon: <FileText className="w-8 h-8 text-astralis-blue" />,
    metrics: '500+ documents processed daily'
  },
  {
    title: 'Healthcare Appointment Scheduling',
    description: 'Automated scheduling system reduces no-shows by 35% and eliminates double-bookings, improving patient satisfaction and revenue.',
    icon: <Clock className="w-8 h-8 text-astralis-blue" />,
    metrics: '35% reduction in no-shows'
  },
  {
    title: 'E-commerce Order Fulfillment',
    description: 'End-to-end automation from order receipt to shipping notification reduces fulfillment time by 60% and eliminates manual errors.',
    icon: <Zap className="w-8 h-8 text-astralis-blue" />,
    metrics: '60% faster fulfillment'
  }
];

// Value propositions
const valueStatements = [
  {
    icon: <DollarSign className="w-10 h-10 text-astralis-blue" />,
    title: 'Significant ROI',
    description: 'Average ROI of 300% within 12 months through reduced labor costs and increased operational efficiency.'
  },
  {
    icon: <Clock className="w-10 h-10 text-astralis-blue" />,
    title: 'Time Savings',
    description: 'Save 15-25 hours per week on repetitive tasks, allowing your team to focus on high-value strategic work.'
  },
  {
    icon: <BarChart className="w-10 h-10 text-astralis-blue" />,
    title: 'Efficiency Gains',
    description: 'Increase processing speed by 70% while reducing errors by 95% through intelligent automation workflows.'
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-astralis-navy">
            Astralis One
          </Link>
          <div className="flex gap-6">
            <Link href="/services" className="text-astralis-blue hover:text-astralis-navy font-semibold transition-colors">
              Services
            </Link>
            <Link href="/solutions" className="text-slate-600 hover:text-astralis-blue transition-colors">
              Solutions
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-astralis-blue transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-astralis-blue transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-astralis-blue transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark Navy Background */}
      <section className="bg-gradient-to-br from-astralis-navy via-slate-900 to-astralis-navy text-white py-20 px-6 md:py-32 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:32px_32px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-astralis-blue/20 border border-astralis-blue/30 rounded-full text-sm font-medium text-white">
                  <Zap className="w-4 h-4" />
                  278% Average ROI
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Automation Services Built for Your Business
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                Transform your operations with intelligent automation solutions. From intake to fulfillment, we streamline your workflows and eliminate manual bottlenecks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/contact">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Schedule Consultation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#packages">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                    View Pricing
                  </Button>
                </a>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-astralis-blue/30 to-purple-500/30 rounded-2xl blur-3xl"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[Workflow, Database, FileText, BarChart].map((Icon, i) => (
                      <div key={i} className="bg-astralis-blue/10 border border-astralis-blue/20 rounded-lg p-6 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-astralis-blue" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Packages Section - Dark Navy Background */}
      <section id="packages" className="relative isolate overflow-hidden w-full px-6 py-20 md:py-32 bg-gradient-to-b from-astralis-navy to-slate-900">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
              Service Packages
            </h2>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              Choose the automation solution that fits your business needs. All packages include setup, training, and ongoing support.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicePackages.map((pkg, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex flex-col bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl',
                  pkg.recommended
                    ? 'border-astralis-blue/60 ring-2 ring-astralis-blue/40'
                    : 'border-slate-200 hover:border-astralis-blue/40'
                )}
              >
                {pkg.recommended && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-astralis-blue to-blue-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <div className="w-12 h-12 mb-6 rounded-lg border border-astralis-blue/20 bg-astralis-blue/10 text-astralis-blue flex items-center justify-center shadow-sm">
                    {pkg.icon}
                  </div>

                  <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-4">
                    {pkg.name}
                  </h3>

                  <p className="text-slate-600 mb-6 min-h-[80px] leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="mb-6 border-b border-slate-200 pb-6">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-astralis-navy">
                        {pkg.setupFee}
                      </span>
                      <span className="text-slate-500 text-sm">setup</span>
                    </div>
                    {pkg.monthlyFee && (
                      <div className="font-medium text-slate-600">
                        + {pkg.monthlyFee}
                      </div>
                    )}
                  </div>

                  <ul className="mb-8 space-y-4">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-astralis-blue" />
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact" className="mt-auto">
                    <Button
                      variant={pkg.recommended ? 'primary' : 'outline'}
                      className={cn(
                        'w-full',
                        !pkg.recommended && 'border-slate-200 bg-slate-100 text-astralis-navy hover:bg-slate-200'
                      )}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              All packages include initial consultation, custom configuration, training, and 30 days of post-launch support.
            </p>
          </div>
        </div>
      </section>

      {/* Automation Examples Section - White Background */}
      <section className="w-full px-6 py-20 md:py-32 bg-white relative overflow-hidden border-y border-slate-200">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(43,108,176)_1px,_transparent_0)] bg-[size:32px_32px]" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Automation in Action
            </h2>
            <p className="text-base md:text-lg text-slate-700 leading-relaxed">
              See how businesses like yours are transforming operations with intelligent automation.
            </p>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {automationExamples.map((example, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="w-16 h-16 mb-6 rounded-lg border border-astralis-blue/20 bg-astralis-blue/10 flex items-center justify-center shadow-sm">
                  {example.icon}
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-4">
                  {example.title}
                </h3>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  {example.description}
                </p>

                <div className="inline-block rounded-md border border-astralis-blue/20 bg-gradient-to-r from-astralis-blue/10 to-blue-50 px-4 py-2 text-sm font-semibold text-astralis-blue">
                  {example.metrics}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Statements Section - Dark Background */}
      <section className="w-full px-6 py-20 md:py-32 bg-gradient-to-b from-slate-900 to-astralis-navy">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
              The Astralis Advantage
            </h2>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed">
              Our automation solutions deliver measurable results that transform your bottom line.
            </p>
          </div>

          {/* Value Cards Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 mb-16">
            {valueStatements.map((value, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl p-6 md:p-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-astralis-blue/20 bg-astralis-blue/10 flex items-center justify-center shadow-sm">
                  {value.icon}
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-4">
                  {value.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          {/* Supporting Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 md:p-12 shadow-xl">
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-astralis-blue mb-3">300%</div>
              <div className="text-base md:text-lg text-white font-medium">Average ROI</div>
              <div className="text-sm text-slate-400">within 12 months</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-astralis-blue mb-3">20+</div>
              <div className="text-base md:text-lg text-white font-medium">Hours Saved</div>
              <div className="text-sm text-slate-400">per week per team</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-5xl md:text-6xl font-bold text-astralis-blue mb-3">95%</div>
              <div className="text-base md:text-lg text-white font-medium">Error Reduction</div>
              <div className="text-sm text-slate-400">in automated processes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="w-full px-6 py-20 md:py-32 bg-gradient-to-br from-astralis-navy via-slate-900 to-astralis-navy text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:32px_32px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Ready to Automate Your Operations?
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Schedule a free consultation to discuss your automation needs and discover how we can help you save time, reduce costs, and scale efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/contact">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Schedule Consultation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                View Case Studies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-astralis-navy text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Astralis One</h3>
              <p className="text-slate-400 text-sm">
                Enterprise AI operations platform for intelligent automation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/services" className="hover:text-astralis-blue transition-colors">Services</Link></li>
                <li><Link href="/solutions" className="hover:text-astralis-blue transition-colors">Solutions</Link></li>
                <li><Link href="/pricing" className="hover:text-astralis-blue transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/about" className="hover:text-astralis-blue transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-astralis-blue transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="https://app.astralisone.com/auth/signin" className="hover:text-astralis-blue transition-colors">Sign In</a></li>
                <li><a href="https://app.astralisone.com/auth/signup" className="hover:text-astralis-blue transition-colors">Sign Up</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            &copy; 2024 Astralis One. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
