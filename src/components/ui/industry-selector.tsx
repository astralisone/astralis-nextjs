import React from 'react';
import { cn } from '@/lib/utils';
import {
  Rocket as RocketLaunchIcon,
  ShoppingBag as ShoppingBagIcon,
  Briefcase as BriefcaseIcon,
  Building2 as BuildingOffice2Icon
} from 'lucide-react';

export type Industry = 'saas' | 'ecommerce' | 'professional-services' | 'general';

interface IndustrySelectorProps {
  value: Industry;
  onChange: (industry: Industry) => void;
  className?: string;
}

const industries = [
  {
    id: 'saas' as Industry,
    name: 'SaaS',
    description: '$2M-$50M ARR',
    icon: RocketLaunchIcon,
    gradient: 'from-purple-500 to-blue-500',
    benefits: '2.5x efficiency gains'
  },
  {
    id: 'ecommerce' as Industry,
    name: 'E-commerce',
    description: '$10M-$500M GMV',
    icon: ShoppingBagIcon,
    gradient: 'from-green-500 to-blue-500',
    benefits: '34% revenue recovery'
  },
  {
    id: 'professional-services' as Industry,
    name: 'Professional Services',
    description: '$5M-$100M Revenue',
    icon: BriefcaseIcon,
    gradient: 'from-purple-500 to-pink-500',
    benefits: '3x automation potential'
  },
  {
    id: 'general' as Industry,
    name: 'Other Industries',
    description: 'All business types',
    icon: BuildingOffice2Icon,
    gradient: 'from-blue-500 to-purple-500',
    benefits: '2.2x efficiency gains'
  }
];

export function IndustrySelector({ value, onChange, className }: IndustrySelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {industries.map((industry) => {
        const Icon = industry.icon;
        const isSelected = value === industry.id;
        
        return (
          <button
            key={industry.id}
            onClick={() => onChange(industry.id)}
            className={cn(
              "group relative p-4 rounded-xl border transition-all duration-300",
              "hover:scale-[1.02] hover:shadow-lg",
              isSelected ? [
                "glass-elevated border-primary-500/50",
                "shadow-lg shadow-primary-500/20"
              ] : [
                "glass-card border-white/10",
                "hover:border-primary-500/30"
              ]
            )}
          >
            {/* Background gradient on selection */}
            {isSelected && (
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl opacity-10",
                  `bg-gradient-to-br ${industry.gradient}`
                )}
              />
            )}
            
            {/* Icon */}
            <div className={cn(
              "relative w-10 h-10 mx-auto mb-3 rounded-lg p-2",
              "transition-all duration-300",
              isSelected ? [
                `bg-gradient-to-br ${industry.gradient}`,
                "text-white"
              ] : [
                "glass-card text-gray-400",
                "group-hover:text-primary-400"
              ]
            )}>
              <Icon className="w-full h-full" />
            </div>
            
            {/* Text content */}
            <div className="relative space-y-1">
              <h4 className={cn(
                "font-semibold text-sm transition-colors",
                isSelected ? "text-white" : "text-gray-300"
              )}>
                {industry.name}
              </h4>
              <p className="text-xs text-gray-500">
                {industry.description}
              </p>
              {isSelected && (
                <p className="text-xs text-primary-400 font-medium animate-slide-in-right">
                  {industry.benefits}
                </p>
              )}
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}