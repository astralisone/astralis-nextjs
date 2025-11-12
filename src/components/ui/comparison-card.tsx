import React from 'react';
import { cn } from '@/lib/utils';
import { Check as CheckIcon, X as XMarkIcon } from 'lucide-react';

interface ComparisonItem {
  label: string;
  value: string | number;
  isPositive?: boolean;
}

interface ComparisonCardProps {
  title: string;
  subtitle: string;
  items: ComparisonItem[];
  type: 'before' | 'after';
  className?: string;
}

export function ComparisonCard({
  title,
  subtitle,
  items,
  type,
  className
}: ComparisonCardProps) {
  const isAfter = type === 'after';
  const borderColor = isAfter ? 'border-green-500/20' : 'border-red-500/20';
  const headerColor = isAfter ? 'text-green-400' : 'text-red-400';
  const bgGradient = isAfter ? 'from-green-500/5' : 'from-red-500/5';
  const Icon = isAfter ? CheckIcon : XMarkIcon;

  return (
    <div className={cn(
      "glass-card p-6 rounded-xl border relative overflow-hidden group",
      "hover:scale-[1.02] transition-all duration-300",
      borderColor,
      className
    )}>
      {/* Background gradient on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br to-transparent opacity-0",
        "group-hover:opacity-100 transition-opacity duration-300",
        bgGradient
      )} />
      
      {/* Header */}
      <div className="relative flex items-center gap-3 mb-4">
        <div className={cn(
          "w-8 h-8 rounded-lg p-1.5 border",
          isAfter ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"
        )}>
          <Icon className={cn("w-full h-full", headerColor)} />
        </div>
        <div>
          <h4 className={cn("font-bold text-base", headerColor)}>
            {title}
          </h4>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="relative space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{item.label}</span>
            <span className={cn(
              "text-sm font-medium tabular-nums",
              item.isPositive !== undefined
                ? item.isPositive 
                  ? "text-green-400" 
                  : "text-red-400"
                : "text-gray-200"
            )}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      
      {/* Bottom indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 rounded-b-xl",
        isAfter ? "bg-green-500/30" : "bg-red-500/30"
      )} />
    </div>
  );
}