'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
    period: string;
  };
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
};

export function StatsWidget({
  title,
  value,
  change,
  icon,
  variant = 'default',
}: StatsWidgetProps) {
  return (
    <Card variant="default" hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {icon && (
            <div className={cn('p-3 rounded-lg', variantStyles[variant])}>
              {icon}
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold text-astralis-navy">{value}</p>

          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.value}
              </span>
              <span className="text-sm text-slate-500">{change.period}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
