"use client";

import { StatsBar } from './stats-bar';

interface Stat {
  value: string;
  label: string;
}

interface HomepageStatsBarProps {
  stats: Stat[];
}

/**
 * Homepage-specific StatsBar wrapper
 * Handles the readonly const array from homepage-content
 */
export function HomepageStatsBar({ stats }: HomepageStatsBarProps) {
  return (
    <StatsBar
      stats={stats.map(stat => ({ ...stat }))}
      variant="dark"
      showSeparators
    />
  );
}
