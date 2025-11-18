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
import { Hero, FeatureGrid, CTASection, StatsSection } from '@/components/sections';
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
 * Dashboard Preview Card Component
 * Right column content for Hero section with glassmorphism effects
 */
function DashboardPreview() {
  return (
    <div className="glass-card rounded-xl p-6 md:p-8 backdrop-blur-sm border border-slate-700/50 bg-slate-900/90 shadow-lg">
      {/* Dashboard Header */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">Operations Dashboard</span>
        <span className="text-slate-500">Real-time</span>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* New Leads Card */}
        <div className="glass-card rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400 mb-2">New leads</div>
          <div className="text-3xl font-bold text-white mb-1">18</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+32% vs last week</span>
          </div>
        </div>

        {/* Automation Runs Card */}
        <div className="glass-card rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400 mb-2">Automation runs</div>
          <div className="text-3xl font-bold text-white mb-1">142</div>
          <div className="text-xs text-slate-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>No incidents</span>
          </div>
        </div>
      </div>

      {/* Pipeline Progress Card */}
      <div className="glass-card rounded-lg border border-slate-800 bg-slate-900/60 p-4">
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
 * What We Do Overview Section
 * Section 2 of homepage spec
 */
function WhatWeDoSection() {
  return (
    <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-white border-b border-slate-200 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Modern office workspace"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
            {homepageContent.overview.title}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed">
            {homepageContent.overview.description}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * AstralisOps Platform Spotlight Section
 * Section 5 of homepage spec - featured product with glassmorphism card
 */
function PlatformSpotlight() {
  const { platformSpotlight } = homepageContent;

  return (
    <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-slate-100 to-white border-y border-slate-200">
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
                <a
                  href={platformSpotlight.ctaHref}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-astralis-blue text-white font-medium hover:bg-blue-600 transition-colors duration-200"
                >
                  {platformSpotlight.cta}
                </a>
                <a
                  href={platformSpotlight.secondaryCtaHref}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-astralis-navy bg-transparent text-astralis-navy font-medium hover:bg-astralis-navy hover:text-white transition-colors duration-200"
                >
                  {platformSpotlight.secondaryCta}
                </a>
              </div>
            </div>

            {/* Right Column: Visual Element with Background Image */}
            <div className="relative">
              {/* Dashboard/Analytics Image */}
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-lg mb-6 relative h-64">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Data analytics dashboard"
                  fill
                  className="object-cover"
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
 * Homepage Component
 * Implements full 7-section layout per Astralis spec
 */
export default function HomePage() {
  // Icon mapping for capabilities and pillars
  const capabilityIcons = {
    'ai-automation': Bot,
    'saas-platform': LayoutDashboard,
    'integration-layer': GitMerge,
    'custom-deployment': Rocket,
  };

  const pillarIcons = {
    'enterprise-ready': ShieldCheck,
    'ai-first': Sparkles,
    'rapid-deployment': Gauge,
    'measurable-impact': TrendingUp,
  };

  // Map icons to capabilities (render as elements, not components)
  const capabilitiesWithIcons = homepageContent.capabilities.map((capability) => {
    const IconComponent = capabilityIcons[capability.id as keyof typeof capabilityIcons];
    return {
      title: capability.title,
      description: capability.description,
      iconElement: <IconComponent className="h-6 w-6" />,
      href: capability.href,
    };
  });

  // Map icons to pillars (render as elements, not components)
  const pillarsWithIcons = homepageContent.pillars.map((pillar) => {
    const IconComponent = pillarIcons[pillar.id as keyof typeof pillarIcons];
    return {
      title: pillar.title,
      description: pillar.description,
      iconElement: <IconComponent className="h-6 w-6" />,
    };
  });

  return (
    <main className="min-h-screen bg-astralis-navy">
      {/* 1. Hero Section */}
      <Hero
        headline={homepageContent.hero.headline}
        description={homepageContent.hero.subheadline}
        primaryButton={{
          text: homepageContent.hero.primaryCta,
          href: homepageContent.hero.primaryCtaHref,
        }}
        secondaryButton={{
          text: homepageContent.hero.secondaryCta,
          href: homepageContent.hero.secondaryCtaHref,
        }}
        rightContent={<DashboardPreview />}
        variant="dark"
        className="bg-astralis-navy"
      />

      {/* 2. What We Do Overview */}
      <WhatWeDoSection />

      {/* 3. Core Capabilities - 4 Feature Cards */}
      <FeatureGrid
        features={capabilitiesWithIcons}
        headline="Core Capabilities"
        subheadline="End-to-end automation solutions that transform how your organization operates."
        columns={4}
        centerHeader
        className="bg-slate-50 border-y border-slate-200"
      />

      {/* 4. Why Astralis - 4 Pillars */}
      <FeatureGrid
        features={pillarsWithIcons}
        headline="Why Astralis"
        subheadline="Built on enterprise principles with modern AI capabilities."
        columns={4}
        centerHeader
        className="bg-white"
      />

      {/* 5. Featured Platform: AstralisOps */}
      <PlatformSpotlight />

      {/* 6. Trust Indicators / Stats Section */}
      <StatsSection
        headline={homepageContent.trust.title}
        description={homepageContent.trust.subtitle}
        stats={[
          {
            value: '80%',
            label: 'Manual Work Reduced',
            trend: 'up',
            trendValue: 'avg reduction',
          },
          {
            value: '3 weeks',
            label: 'Average Deployment Time',
            trend: 'neutral',
            secondaryText: 'from project start',
          },
          {
            value: '99.9%',
            label: 'Automation Reliability',
            trend: 'up',
            secondaryText: 'uptime guaranteed',
          },
          {
            value: '24/7',
            label: 'Operations Support',
            trend: 'none',
            secondaryText: 'always available',
          },
        ]}
        centerHeader
        backgroundVariant="light"
        className="bg-slate-50 border-y border-slate-200"
      />

      {/* 7. CTA Footer Section */}
      <CTASection
        headline={homepageContent.ctaFooter.headline}
        description={homepageContent.ctaFooter.description}
        primaryButton={{
          text: homepageContent.ctaFooter.primaryCta,
          href: homepageContent.ctaFooter.primaryCtaHref,
        }}
        secondaryButton={{
          text: homepageContent.ctaFooter.secondaryCta,
          href: homepageContent.ctaFooter.secondaryCtaHref,
        }}
        backgroundVariant="navy"
        className="bg-astralis-navy"
      />
    </main>
  );
}
