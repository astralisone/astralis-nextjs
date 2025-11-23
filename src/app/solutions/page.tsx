import type { Metadata } from 'next';
import { Hero, FeatureGrid, CTASection } from '@/components/sections';
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
      {/* 1. Hero Section - Dark Navy Background */}
      <Hero
        headline={heroContent.headline}
        subheadline={heroContent.subheadline}
        description={heroContent.description}
        primaryButton={heroContent.primaryButton}
        secondaryButton={heroContent.secondaryButton}
        variant="dark"
        className="bg-astralis-navy"
      />

      {/* 2. AI Automation Systems - Light Background */}
      <FeatureGrid
        headline={aiAutomationSystems.headline}
        subheadline={aiAutomationSystems.description}
        features={aiFeatures}
        columns={3}
        centerHeader
        className="bg-white border-b border-slate-200"
      />

      {/* 3. Document Intelligence - Dark Background with Navy Tones */}
      <FeatureGrid
        headline={documentIntelligence.headline}
        subheadline={documentIntelligence.description}
        features={docFeatures}
        columns={3}
        centerHeader
        className="bg-gradient-to-b from-slate-900 to-slate-800 [&_h2]:text-white [&_p]:text-slate-300 [&_.text-astralis-navy]:!text-white [&_.text-slate-700]:!text-slate-300"
      />

      {/* 4. Platform Engineering - Light Background */}
      <FeatureGrid
        headline={platformEngineering.headline}
        subheadline={platformEngineering.description}
        features={platformFeatures}
        columns={3}
        centerHeader
        className="bg-slate-50 border-y border-slate-200"
      />

      {/* 5. SaaS Development - Dark Background with Navy Tones */}
      <FeatureGrid
        headline={saasDevelopment.headline}
        subheadline={saasDevelopment.description}
        features={saasFeatures}
        columns={3}
        centerHeader
        className="bg-gradient-to-b from-slate-800 to-astralis-navy [&_h2]:text-white [&_p]:text-slate-300 [&_.text-astralis-navy]:!text-white [&_.text-slate-700]:!text-slate-300 [&_.border-slate-200]:!border-slate-700 [&_.bg-white]:!bg-slate-800/50"
      />

      {/* 6. CTA Section - Navy Background */}
      <CTASection
        headline={ctaContent.headline}
        description={ctaContent.description}
        primaryButton={ctaContent.primaryButton}
        secondaryButton={ctaContent.secondaryButton}
        backgroundVariant="navy"
        className="bg-astralis-navy"
      />
    </main>
  );
}
