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
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* 1. Hero Section */}
      <Hero
        headline={heroContent.headline}
        subheadline={heroContent.subheadline}
        description={heroContent.description}
        primaryButton={heroContent.primaryButton}
        secondaryButton={heroContent.secondaryButton}
        variant="dark"
      />

      {/* 2. AI Automation Systems */}
      <FeatureGrid
        headline={aiAutomationSystems.headline}
        subheadline={aiAutomationSystems.description}
        features={aiFeatures}
        columns={3}
        centerHeader
        className="bg-slate-50 dark:bg-slate-900"
      />

      {/* 3. Document Intelligence */}
      <FeatureGrid
        headline={documentIntelligence.headline}
        subheadline={documentIntelligence.description}
        features={docFeatures}
        columns={3}
        centerHeader
        className="bg-white dark:bg-slate-950"
      />

      {/* 4. Platform Engineering */}
      <FeatureGrid
        headline={platformEngineering.headline}
        subheadline={platformEngineering.description}
        features={platformFeatures}
        columns={3}
        centerHeader
        className="bg-slate-50 dark:bg-slate-900"
      />

      {/* 5. SaaS Development */}
      <FeatureGrid
        headline={saasDevelopment.headline}
        subheadline={saasDevelopment.description}
        features={saasFeatures}
        columns={3}
        centerHeader
        className="bg-white dark:bg-slate-950"
      />

      {/* 6. CTA Section */}
      <CTASection
        headline={ctaContent.headline}
        description={ctaContent.description}
        primaryButton={ctaContent.primaryButton}
        secondaryButton={ctaContent.secondaryButton}
        backgroundVariant="navy"
      />
    </main>
  );
}
