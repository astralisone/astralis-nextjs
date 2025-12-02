"use client";

import { Shield, CheckCircle, Globe } from 'lucide-react';

interface TrustBadge {
  icon: 'shield' | 'check' | 'globe';
  label: string;
}

const badges: TrustBadge[] = [
  { icon: 'shield', label: 'ISO 27001' },
  { icon: 'check', label: 'SOC 2 Type II' },
  { icon: 'globe', label: 'GDPR Compliant' }
];

const iconMap = {
  shield: Shield,
  check: CheckCircle,
  globe: Globe
};

/**
 * Trust Badges Component
 * Displays security and compliance certifications
 */
export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 py-4">
      {badges.map((badge, index) => {
        const Icon = iconMap[badge.icon];
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Icon className="w-6 h-6 text-astralis-blue" />
            <span className="text-sm font-semibold text-slate-700">
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export type { TrustBadge };
