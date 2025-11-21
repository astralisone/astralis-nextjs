import React from 'react';
import { AlertCircle, Minus, ArrowUp } from 'lucide-react';

interface PriorityIndicatorProps {
  priority: number;
  showLabel?: boolean;
  className?: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high';

export function getPriorityLevel(priority: number): PriorityLevel {
  if (priority >= 7) return 'high';
  if (priority >= 4) return 'medium';
  return 'low';
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: Minus,
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: ArrowUp,
  },
} as const;

export function PriorityIndicator({
  priority,
  showLabel = false,
  className
}: PriorityIndicatorProps) {
  const level = getPriorityLevel(priority);
  const config = priorityConfig[level];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 ${className || ''}`}>
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${config.bgColor}`}>
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      </span>
      {showLabel && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
