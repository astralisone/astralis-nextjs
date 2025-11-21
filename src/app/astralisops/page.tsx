import * as React from 'react';
import {
  Workflow,
  CalendarCheck,
  FileScan,
  GitMerge,
  LayoutDashboard,
  Kanban,
  ArrowRight,
  Check,
  LucideIcon,
} from 'lucide-react';
import { Hero } from '@/components/sections/hero';
import { FeatureGrid, Feature } from '@/components/sections/feature-grid';
import { StatsSection } from '@/components/sections/stats-section';
import { CTASection } from '@/components/sections/cta-section';
import { astralisOpsContent } from '@/data/astralisops-content';
import { cn } from '@/lib/utils';

/**
 * AstralisOps Product Page
 * Following Astralis One Master Project Specification v1.0 - Section 4.3
 *
 * Structure:
 * 1. Hero Section - Product positioning
 * 2. Feature List (2x3 grid with 6 features)
 * 3. Workflow Diagram section (placeholder card)
 * 4. Outcomes section (stats/results)
 * 5. Pricing Teaser (3 tiers)
 * 6. Demo CTA
 */

// Icon mapping for features
const featureIconMap: Record<string, LucideIcon> = {
  workflow: Workflow,
  'calendar-check': CalendarCheck,
  'file-scan': FileScan,
  'git-merge': GitMerge,
  'layout-dashboard': LayoutDashboard,
  kanban: Kanban,
};

export default function AstralisOpsPage() {
  // Map content features to FeatureGrid format with icon elements
  const features: Feature[] = astralisOpsContent.features.map((feature) => {
    const IconComponent = featureIconMap[feature.icon];
    return {
      title: feature.title,
      description: feature.description,
      iconElement: IconComponent ? (
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-astralis-blue/10 dark:bg-astralis-blue/20">
          <IconComponent className="w-6 h-6 text-astralis-blue" strokeWidth={2} />
        </div>
      ) : undefined,
    };
  });

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      {/* 1. Hero Section */}
      <Hero
        headline={astralisOpsContent.hero.headline}
        subheadline={astralisOpsContent.hero.subheadline}
        description={astralisOpsContent.hero.description}
        primaryButton={astralisOpsContent.hero.primaryButton}
        secondaryButton={astralisOpsContent.hero.secondaryButton}
        variant="dark"
        rightContent={
          <PipelineOverviewCard />
        }
      />

      {/* 2. Feature List - 2x3 Grid */}
      <FeatureGrid
        features={features}
        headline="Core Capabilities"
        subheadline="Start with the essentials and grow into advanced workflows as your team becomes comfortable."
        columns={3}
        centerHeader={true}
        className="bg-slate-50 dark:bg-slate-800"
      />

      {/* 3. Workflow Diagram Section */}
      <WorkflowDiagramSection />

      {/* 4. Outcomes Section - Stats */}
      <StatsSection
        headline={astralisOpsContent.outcomes.headline}
        description={astralisOpsContent.outcomes.description}
        stats={[...astralisOpsContent.outcomes.stats]}
        centerHeader={true}
        backgroundVariant="light"
      />

      {/* 5. Pricing Teaser - 3 Tiers */}
      <PricingSection />

      {/* 6. Demo CTA */}
      <CTASection
        headline={astralisOpsContent.demoCta.headline}
        description={astralisOpsContent.demoCta.description}
        primaryButton={astralisOpsContent.demoCta.primaryButton}
        secondaryButton={astralisOpsContent.demoCta.secondaryButton}
        backgroundVariant="navy"
      />
    </main>
  );
}

/**
 * Pipeline Overview Card - Hero Right Content
 * Displays sample pipeline stats in a card format
 */
function PipelineOverviewCard() {
  const stages = [
    { name: 'Intake', count: 8 },
    { name: 'In Progress', count: 12 },
    { name: 'Done', count: 23 },
  ];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur-sm p-6 shadow-xl">
      <div className="mb-4 text-sm font-medium text-slate-400">Pipeline Overview</div>
      <div className="grid gap-4 md:grid-cols-3">
        {stages.map((stage, idx) => (
          <div
            key={stage.name}
            className="rounded-lg border border-slate-700 bg-slate-950/60 p-4 transition-all duration-200 hover:border-astralis-blue"
          >
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stage.name}</div>
            <div className="mt-2 text-3xl font-bold text-white">{stage.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Workflow Diagram Section
 * Visual representation of the AstralisOps workflow stages
 */
function WorkflowDiagramSection() {
  const { title, description, stages } = astralisOpsContent.workflowDiagram;

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 lg:px-24 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="relative">
          {/* Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.label}>
                {/* Stage Card */}
                <div className="relative">
                  <div className="p-6 bg-white dark:bg-slate-800 border-2 border-astralis-blue rounded-lg shadow-lg text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-astralis-blue text-white font-bold text-lg mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-astralis-navy dark:text-white mb-2">
                      {stage.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stage.sublabel}
                    </p>
                  </div>

                  {/* Arrow Connector (hidden on mobile, shown on md+) */}
                  {index < stages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-astralis-blue" />
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-astralis-blue/30 -z-0" style={{ marginTop: '-1px' }} />
        </div>
      </div>
    </section>
  );
}

/**
 * Pricing Section Component
 * Displays 3 pricing tiers (Starter, Professional, Enterprise)
 */
function PricingSection() {
  const { headline, description, tiers } = astralisOpsContent.pricing;

  return (
    <section className="w-full px-8 py-24 md:px-20 md:py-32 lg:px-24 bg-slate-50 dark:bg-slate-800">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy dark:text-white tracking-tight">
            {headline}
          </h2>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative p-8 bg-white dark:bg-slate-900 border rounded-xl shadow-lg transition-all duration-200",
                tier.recommended
                  ? "border-astralis-blue shadow-xl scale-105 md:scale-110"
                  : "border-slate-300 dark:border-slate-700 hover:border-astralis-blue"
              )}
            >
              {/* Recommended Badge */}
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-astralis-blue text-white text-sm font-semibold rounded-full shadow-md">
                    Recommended
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-semibold text-astralis-navy dark:text-white mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-astralis-navy dark:text-white">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-lg text-slate-600 dark:text-slate-400 ml-2">
                    {tier.period}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem]">
                {tier.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-astralis-blue flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href={tier.ctaHref}
                className={cn(
                  "block w-full py-3 px-6 text-center font-semibold rounded-lg transition-all duration-200",
                  tier.recommended
                    ? "bg-astralis-blue text-white hover:bg-[#245a92] shadow-md hover:shadow-lg"
                    : "border-2 border-astralis-blue text-astralis-blue hover:bg-astralis-blue hover:text-white"
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            All plans include secure data encryption, regular backups, and 99.9% uptime SLA.
          </p>
        </div>
      </div>
    </section>
  );
}
