/**
 * Astralis Homepage - Full Specification Implementation
 *
 * Based on Astralis One Master Project Specification v1.0 - Section 4.1
 *
 * Structure:
 * 1. Hero Section - Left/right split with dashboard preview
 * 2. What We Do Overview - Text section
 * 3. Core Capabilities - 4-card feature grid
 * 4. Why Astralis (4 Pillars) - Feature grid
 * 5. Featured Platform: AstralisOps - Spotlight card
 * 6. Trust Indicators - Stats section
 * 7. CTA Footer Section - Call to action
 *
 * Design:
 * - Dark theme (Astralis Navy background)
 * - 12-column grid, max-width 1280px
 * - Section spacing: 96-120px
 * - Typography: Inter font family
 * - Animations: 150-250ms transitions
 */

import Image from 'next/image';
import Link from 'next/link';
import { homepageContent } from '@/data/homepage-content';
import {
  Bot,
  LayoutDashboard,
  GitMerge,
  Rocket,
  ShieldCheck,
  Sparkles,
  Gauge,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button Component - Inline version for marketing site
 */
interface ButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

function Button({ variant = 'primary', size = 'default', className, children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-lg';

  const variantStyles = {
    primary: 'bg-astralis-blue text-white hover:bg-blue-600',
    secondary: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-astralis-navy',
    outline: 'bg-transparent border-2 border-astralis-navy text-astralis-navy hover:bg-astralis-navy hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    lg: 'px-8 py-3 text-base md:text-lg',
  };

  return (
    <a
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Dashboard Preview Card Component
 * Right column content for Hero section with glassmorphism effects
 */
function DashboardPreview() {
  return (
    <div className="rounded-xl p-6 md:p-8 backdrop-blur-sm border border-slate-700/50 bg-slate-900/90 shadow-lg">
      {/* Dashboard Header */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">Operations Dashboard</span>
        <span className="text-slate-500">Real-time</span>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* New Leads Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400 mb-2">New leads</div>
          <div className="text-3xl font-bold text-white mb-1">18</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+32% vs last week</span>
          </div>
        </div>

        {/* Automation Runs Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400 mb-2">Automation runs</div>
          <div className="text-3xl font-bold text-white mb-1">142</div>
          <div className="text-xs text-slate-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>No incidents</span>
          </div>
        </div>
      </div>

      {/* Pipeline Progress Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>Active pipelines</span>
          <span className="text-slate-300">Sales · Onboarding · Support</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-astralis-blue to-purple-500 transition-all duration-500"
            style={{ width: '67%' }}
          />
        </div>
        <div className="mt-2 text-right text-xs text-slate-400">67% capacity</div>
      </div>

      {/* Mini Badge */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-astralis-blue/10 border border-astralis-blue/30 px-3 py-1 text-xs text-astralis-blue">
          <Sparkles className="w-3 h-3" />
          AI-Powered Operations
        </span>
      </div>
    </div>
  );
}

/**
 * Hero Section Component
 */
function Hero() {
  const { hero } = homepageContent;

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-28 lg:px-24 lg:py-30 bg-astralis-navy">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6 lg:col-span-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-100">
              {hero.headline}
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-slate-300 max-w-2xl">
              {hero.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                href={hero.primaryCtaHref}
                className="min-w-[160px]"
              >
                {hero.primaryCta}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                href={hero.secondaryCtaHref}
                className="min-w-[160px]"
              >
                {hero.secondaryCta}
              </Button>
            </div>
          </div>

          {/* Right Column: Dashboard Preview */}
          <div className="w-full lg:col-span-6">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Grid Component - Core Capabilities
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  const content = (
    <>
      <div className="mb-6 text-astralis-blue">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-astralis-navy mb-3">
        {title}
      </h3>
      <p className="text-base text-slate-700 leading-relaxed">
        {description}
      </p>
    </>
  );

  const cardClasses = cn(
    'relative p-8 bg-white border border-slate-300 rounded-lg shadow-sm',
    'transition-all duration-200 ease-out',
    href && 'hover:-translate-y-1 hover:shadow-lg cursor-pointer'
  );

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}

/**
 * Core Capabilities Section
 */
function CoreCapabilities() {
  const capabilityIcons = {
    'ai-automation': <Bot className="h-8 w-8" />,
    'saas-platform': <LayoutDashboard className="h-8 w-8" />,
    'integration-layer': <GitMerge className="h-8 w-8" />,
    'custom-deployment': <Rocket className="h-8 w-8" />,
  };

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="mb-16 space-y-4 text-center mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight">
            Core Capabilities
          </h2>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            End-to-end automation solutions that transform how your organization operates.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {homepageContent.capabilities.map((capability) => (
            <FeatureCard
              key={capability.id}
              icon={capabilityIcons[capability.id as keyof typeof capabilityIcons]}
              title={capability.title}
              description={capability.description}
              href={capability.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Why Astralis - 4 Pillars Section
 */
function WhyAstralis() {
  const pillarIcons = {
    'enterprise-ready': <ShieldCheck className="h-8 w-8" />,
    'ai-first': <Sparkles className="h-8 w-8" />,
    'rapid-deployment': <Gauge className="h-8 w-8" />,
    'measurable-impact': <TrendingUp className="h-8 w-8" />,
  };

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 bg-white">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="mb-16 space-y-4 text-center mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight">
            Why Astralis
          </h2>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            Built on enterprise principles with modern AI capabilities.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {homepageContent.pillars.map((pillar) => (
            <FeatureCard
              key={pillar.id}
              icon={pillarIcons[pillar.id as keyof typeof pillarIcons]}
              title={pillar.title}
              description={pillar.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * AstralisOps Platform Spotlight Section
 */
function PlatformSpotlight() {
  const { platformSpotlight } = homepageContent;

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 bg-gradient-to-b from-slate-100 to-white border-y border-slate-200">
      <div className="mx-auto max-w-[1280px]">
        <div className="rounded-2xl border border-slate-300 bg-white p-6 md:p-10 lg:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left Column: Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-base md:text-lg text-astralis-blue font-medium">
                  {platformSpotlight.subtitle}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight leading-tight">
                  {platformSpotlight.title}
                </h2>
              </div>

              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                {platformSpotlight.description}
              </p>

              {/* Feature List */}
              <ul className="space-y-4">
                {platformSpotlight.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <span className="text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="primary"
                  href={platformSpotlight.ctaHref}
                >
                  {platformSpotlight.cta}
                </Button>
                <Button
                  variant="outline"
                  href={platformSpotlight.secondaryCtaHref}
                >
                  {platformSpotlight.secondaryCta}
                </Button>
              </div>
            </div>

            {/* Right Column: Visual Element */}
            <div className="relative">
              {/* Dashboard/Analytics Image */}
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-lg mb-6 relative h-64">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=65"
                  alt="Data analytics dashboard"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-medium">Real-time Analytics & Automation</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-300 bg-slate-50 p-6 shadow-lg">
                <div className="space-y-4">
                  {/* Workflow Steps Visualization */}
                  {[
                    { label: 'Request Intake', status: 'complete', color: 'text-emerald-600' },
                    { label: 'AI Routing', status: 'complete', color: 'text-emerald-600' },
                    { label: 'Document Processing', status: 'active', color: 'text-astralis-blue' },
                    { label: 'Workflow Trigger', status: 'pending', color: 'text-slate-400' },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        step.status === 'complete' && "bg-emerald-500",
                        step.status === 'active' && "bg-astralis-blue animate-pulse",
                        step.status === 'pending' && "bg-slate-300"
                      )} />
                      <div className="flex-1">
                        <div className={cn("text-sm font-medium", step.color)}>
                          {step.label}
                        </div>
                      </div>
                      {step.status === 'complete' && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Pipeline Status</span>
                    <span className="text-emerald-600 font-medium">Running</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Stats Section - Trust Indicators
 */
function StatsSection() {
  const stats = [
    {
      value: '80%',
      label: 'Manual Work Reduced',
      secondaryText: 'avg reduction',
    },
    {
      value: '3 weeks',
      label: 'Average Deployment Time',
      secondaryText: 'from project start',
    },
    {
      value: '99.9%',
      label: 'Automation Reliability',
      secondaryText: 'uptime guaranteed',
    },
    {
      value: '24/7',
      label: 'Operations Support',
      secondaryText: 'always available',
    },
  ];

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="mb-16 space-y-4 text-center mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight">
            {homepageContent.trust.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            {homepageContent.trust.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-slate-300 rounded-lg shadow-sm text-center"
            >
              <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-astralis-navy">
                {stat.value}
              </div>
              <div className="text-base font-medium text-slate-700">
                {stat.label}
              </div>
              {stat.secondaryText && (
                <div className="text-sm mt-2 text-slate-500">
                  {stat.secondaryText}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Footer Section
 */
function CTAFooter() {
  const { ctaFooter } = homepageContent;

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 bg-astralis-navy">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            {ctaFooter.headline}
          </h2>

          <p className="text-lg md:text-xl leading-relaxed text-slate-200 max-w-2xl mx-auto">
            {ctaFooter.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="secondary"
              size="lg"
              href={ctaFooter.primaryCtaHref}
              className="min-w-[160px]"
            >
              {ctaFooter.primaryCta}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              href={ctaFooter.secondaryCtaHref}
              className="min-w-[160px] border-slate-300 text-slate-300 hover:bg-slate-300 hover:text-astralis-navy"
            >
              {ctaFooter.secondaryCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage Component
 * Implements full 7-section layout per Astralis spec
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-astralis-navy">
      {/* 1. Hero Section */}
      <Hero />

      {/* 3. Core Capabilities - 4 Feature Cards */}
      <CoreCapabilities />

      {/* 4. Why Astralis - 4 Pillars */}
      <WhyAstralis />

      {/* 5. Featured Platform: AstralisOps */}
      <PlatformSpotlight />

      {/* 6. Trust Indicators / Stats Section */}
      <StatsSection />

      {/* 7. CTA Footer Section */}
      <CTAFooter />
    </main>
  );
}
