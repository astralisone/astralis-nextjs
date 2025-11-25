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

import Image from 'next/image';
import { Hero, CTASection } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  BarChart
} from 'lucide-react';

// Service package type definition
interface ServicePackage {
  name: string;
  description: string;
  setupFee: string;
  monthlyFee?: string;
  icon: React.ReactNode;
  features: string[];
  imageUrl: string;
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
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1280&q=80'
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
    imageUrl: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1280&q=80',
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
    ],
    imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1280&q=80'
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
    ],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1280&q=80'
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
    ],
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=80'
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
      {/* Hero Section - Dark Navy Background */}
      <Hero
        headline="Automation Services Built for Your Business"
        description="Transform your operations with intelligent automation solutions. From intake to fulfillment, we streamline your workflows and eliminate manual bottlenecks."
        variant="dark"
        className="bg-astralis-navy"
        textAlign="center"
        textColumnWidth="two-thirds"
        primaryButton={{
          text: 'Schedule Consultation',
          href: '/contact'
        }}
        secondaryButton={{
          text: 'View Pricing',
          href: '#packages'
        }}
      />

      {/* Service Packages Section - Dark Navy Background */}
      <section id="packages" className="card-surface-light relative isolate overflow-hidden w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-astralis-navy to-slate-900">
        <div className="mx-auto max-w-[1280px]">
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
                  'feature-card card-theme-light relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl',
                  pkg.recommended
                    ? 'border-astralis-blue/60 ring-2 ring-astralis-blue/40'
                    : 'border-slate-200 hover:border-astralis-blue/40'
                )}
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={pkg.imageUrl}
                    alt={`${pkg.name} background visual`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 380px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    priority={index < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-900/10 to-transparent" />
                  {pkg.recommended && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-astralis-blue to-blue-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6 pt-12 md:p-8 md:pt-14">
                  <div className="feature-card__icon -mt-16 mx-auto mb-6 border border-astralis-blue/20 bg-astralis-blue/10 text-astralis-blue shadow-sm">
                    {pkg.icon}
                  </div>

                  <h3 className="feature-card__title text-center text-xl md:text-2xl">
                    {pkg.name}
                  </h3>

                  <p className="feature-card__description mb-6 min-h-[80px] text-center">
                    {pkg.description}
                  </p>

                  <div className="mb-6 border-b border-slate-200 pb-6 text-center">
                    <div className="mb-1 flex items-baseline justify-center gap-2">
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

                  <ul className="mb-8 space-y-4 text-left">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-base">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-astralis-blue" />
                        <span className="feature-card__description leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={pkg.recommended ? 'primary' : 'secondary'}
                    className={cn(
                      'mt-auto w-full',
                      !pkg.recommended && 'border border-slate-200 bg-slate-100 text-astralis-navy hover:bg-slate-200'
                    )}
                    asChild
                  >
                    <a href="/contact">Get Started</a>
                  </Button>
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
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-white relative overflow-hidden border-y border-slate-200">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-3">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80"
            alt="Automation and analytics"
            fill
            className="object-cover"
          />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
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
          <div className="card-surface-light grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {automationExamples.map((example, index) => (
              <div
                key={index}
                className="feature-card card-theme-light p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl md:p-8"
              >
                <div className="feature-card__icon mb-6 border border-astralis-blue/20 bg-astralis-blue/10 text-astralis-blue shadow-sm">
                  {example.icon}
                </div>

                <h3 className="feature-card__title mb-4 text-xl md:text-2xl">
                  {example.title}
                </h3>

                <p className="feature-card__description mb-6">
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
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-slate-900 to-astralis-navy">
        <div className="mx-auto max-w-[1280px]">
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
          <div className="card-surface-light grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 mb-16">
            {valueStatements.map((value, index) => (
              <div
                key={index}
                className="feature-card card-theme-light text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl p-6 md:p-8"
              >
                <div className="feature-card__icon mx-auto mb-6 border border-astralis-blue/20 bg-astralis-blue/10 text-astralis-blue shadow-sm">
                  {value.icon}
                </div>

                <h3 className="feature-card__title mb-4 text-center text-xl md:text-2xl">
                  {value.title}
                </h3>

                <p className="feature-card__description text-center">
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
      <CTASection
        headline="Ready to Automate Your Operations?"
        description="Schedule a free consultation to discuss your automation needs and discover how we can help you save time, reduce costs, and scale efficiently."
        backgroundVariant="navy"
        primaryButton={{
          text: 'Schedule Consultation',
          href: '/contact'
        }}
        secondaryButton={{
          text: 'View Case Studies',
          href: '/about'
        }}
      />
    </main>
  );
}
