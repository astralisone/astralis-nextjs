/**
 * Astralis Section Components
 *
 * Reusable section templates following the Astralis brand specification.
 * All components adhere to:
 * - 12-column grid system (max-width: 1280px)
 * - Section spacing: 96-120px vertical padding
 * - Typography: Inter font family
 * - Animations: 150-250ms transitions
 */

// Existing sections
export { Hero } from './hero';
export type { HeroProps } from './hero';

export { FeatureGrid } from './feature-grid';
export type { FeatureGridProps, Feature } from './feature-grid';

export { CTASection } from './cta-section';
export type { CTASectionProps, CTAButton } from './cta-section';

export { StatsSection } from './stats-section';
export type { StatsSectionProps, Stat, TrendDirection } from './stats-section';

// New branded components from reference designs
export { HeroWithTechGraphic } from './hero-with-graphic';
export type { HeroWithTechGraphicProps, CTAButton as HeroCTAButton } from './hero-with-graphic';

export { ProcessFlow } from './process-flow';
export type { ProcessFlowProps, ProcessStep } from './process-flow';

export { StatsBar } from './stats-bar';
export type { StatsBarProps, Stat as StatBarItem } from './stats-bar';

export { CaseStudyCard } from './case-study-card';
export type { CaseStudyCardProps } from './case-study-card';

export { FeatureCardIcon } from './feature-card-icon';
export type { FeatureCardIconProps } from './feature-card-icon';

// Homepage-specific wrappers
export { HomepageStatsBar } from './HomepageStatsBar';
export { HomepageProcessFlow } from './HomepageProcessFlow';
export { HomepageCapabilities } from './HomepageCapabilities';

// Mockup-specific components
export { SolutionFinder } from './solution-finder';
export type { Solution } from './solution-finder';
export { ServicePricingCard } from './service-pricing-card';
export type { ServicePricingCardProps } from './service-pricing-card';
export { TrustBadges } from './trust-badges';
export type { TrustBadge } from './trust-badges';
export { Hero3DHexagon } from './hero-3d-hexagon';
