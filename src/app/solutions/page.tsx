import Image from 'next/image';
import type { Metadata } from 'next';
import { Hero, FeatureGrid, CTASection } from '@/components/sections';
import { cn } from '@/lib/utils';
import {
  heroContent,
  aiAutomationSystems,
  documentIntelligence,
  platformEngineering,
  saasDevelopment,
  ctaContent,
} from '@/data/solutions-content';

/**
 * Solutions Page - Astralis One Master Specification v1.0
 * Section 4.2: Solutions Page
 *
 * Structure:
 * 1. Hero Section - "Solutions that Scale"
 * 2. AI Automation Systems
 * 3. Document Intelligence
 * 4. Platform Engineering
 * 5. SaaS Development
 * 6. CTA Section
 *
 * Brand Voice: Corporate, clear, confident
 * Focus: Measurable outcomes, scalability, optimization
 */

export const metadata: Metadata = {
  title: 'Solutions | Astralis',
  description:
    'Enterprise AI automation, document intelligence, platform engineering, and SaaS development solutions. Streamline operations and scale with Astralis.',
  keywords: [
    'AI automation',
    'document intelligence',
    'platform engineering',
    'SaaS development',
    'workflow automation',
    'enterprise solutions',
  ],
};

function DecorativeLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-0 hidden select-none md:block',
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/images/user-logo.jpeg"
        alt=""
        width={180}
        height={180}
        className="h-auto w-auto max-w-none filter grayscale saturate-50 opacity-15 drop-shadow-[0_18px_42px_rgba(10,27,43,0.45)]"
      />
    </div>
  );
}

export default function SolutionsPage() {
  // Convert icon components to elements for client component compatibility
  const aiFeatures = aiAutomationSystems.features.map((f) => ({
    ...f,
    iconElement: f.icon ? <f.icon className="h-6 w-6" /> : undefined,
    icon: undefined,
  }));

  const docFeatures = documentIntelligence.features.map((f) => ({
    ...f,
    iconElement: f.icon ? <f.icon className="h-6 w-6" /> : undefined,
    icon: undefined,
  }));

  const platformFeatures = platformEngineering.features.map((f) => ({
    ...f,
    iconElement: f.icon ? <f.icon className="h-6 w-6" /> : undefined,
    icon: undefined,
  }));

  const saasFeatures = saasDevelopment.features.map((f) => ({
    ...f,
    iconElement: f.icon ? <f.icon className="h-6 w-6" /> : undefined,
    icon: undefined,
  }));

  return (
    <main className="min-h-screen bg-astralis-navy">
      <div className="relative isolate">
        {/* 1. Hero Section - Dark Navy Background */}
        <DecorativeLogo className="right-6 top-4 w-44 rotate-6 opacity-20" />
        <Hero
          headline={heroContent.headline}
          subheadline={heroContent.subheadline}
          description={heroContent.description}
          primaryButton={heroContent.primaryButton}
          secondaryButton={heroContent.secondaryButton}
          variant="dark"
          className="relative z-10 bg-astralis-navy"
        />
      </div>

      <div className="relative isolate">
        {/* 2. AI Automation Systems - Light Background */}
        <DecorativeLogo className="-left-6 top-24 w-36 -rotate-6 opacity-15" />
        <FeatureGrid
          headline={aiAutomationSystems.headline}
          subheadline={aiAutomationSystems.description}
          features={aiFeatures}
          columns={3}
          centerHeader
          className="card-surface-light relative z-10 bg-white border-b border-slate-200"
        />
      </div>

      <div className="relative isolate">
        {/* 3. Document Intelligence - Dark Background with Navy Tones */}
        <FeatureGrid
          headline={documentIntelligence.headline}
          subheadline={documentIntelligence.description}
          features={docFeatures}
          columns={3}
          centerHeader
          className="card-surface-dark relative z-10 bg-gradient-to-b from-slate-900 to-slate-800 [&_h2]:text-white [&_p]:text-slate-300"
          cardClassName="card-theme-dark"
        />
        <DecorativeLogo className="right-20 bottom-10 w-32 rotate-12 opacity-10" />
      </div>

      <div className="relative isolate">
        {/* 4. Platform Engineering - Light Background */}
        <DecorativeLogo className="left-16 -top-10 w-32 rotate-3 opacity-15" />
        <FeatureGrid
          headline={platformEngineering.headline}
          subheadline={platformEngineering.description}
          features={platformFeatures}
          columns={3}
          centerHeader
          className="card-surface-light relative z-10 bg-slate-50 border-y border-slate-200"
        />
      </div>

      <div className="relative isolate">
        {/* 5. SaaS Development - Dark Background with Navy Tones */}
        <FeatureGrid
          headline={saasDevelopment.headline}
          subheadline={saasDevelopment.description}
          features={saasFeatures}
          columns={3}
          centerHeader
          className="card-surface-dark relative z-10 bg-gradient-to-b from-slate-800 to-astralis-navy [&_h2]:text-white [&_p]:text-slate-300"
          cardClassName="card-theme-dark"
        />
      </div>

      <div className="relative isolate">
        {/* 6. CTA Section - Navy Background */}
        <DecorativeLogo className="right-10 -top-6 w-28 -rotate-6 opacity-10" />
        <CTASection
          headline={ctaContent.headline}
          description={ctaContent.description}
          primaryButton={ctaContent.primaryButton}
          secondaryButton={ctaContent.secondaryButton}
          backgroundVariant="navy"
          className="relative z-10 bg-astralis-navy"
        />
      </div>
    </main>
  );
}
