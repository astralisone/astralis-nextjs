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

export { Hero } from './hero';
export type { HeroProps } from './hero';

export { FeatureGrid } from './feature-grid';
export type { FeatureGridProps, Feature } from './feature-grid';

export { CTASection } from './cta-section';
export type { CTASectionProps, CTAButton } from './cta-section';

export { StatsSection } from './stats-section';
export type { StatsSectionProps, Stat, TrendDirection } from './stats-section';
