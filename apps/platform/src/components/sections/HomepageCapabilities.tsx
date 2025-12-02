"use client";

import { FeatureCardIcon } from './feature-card-icon';
import { Bot, LayoutDashboard, GitMerge, Rocket } from 'lucide-react';

interface Capability {
  id: string;
  title: string;
  description: string;
}

interface HomepageCapabilitiesProps {
  capabilities: Capability[];
}

/**
 * Homepage-specific Capabilities section
 * Maps icons to capability data from homepage-content
 */
export function HomepageCapabilities({ capabilities }: HomepageCapabilitiesProps) {
  const iconMap = {
    'ai-automation': Bot,
    'saas-platform': LayoutDashboard,
    'integration-layer': GitMerge,
    'custom-deployment': Rocket,
  };

  return (
    <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy tracking-tight mb-4">
            Core Capabilities
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            End-to-end automation solutions that transform how your organization operates.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability) => {
            const IconComponent = iconMap[capability.id as keyof typeof iconMap];
            return (
              <FeatureCardIcon
                key={capability.id}
                icon={IconComponent}
                title={capability.title}
                description={capability.description}
                variant="light"
                enableHover
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
