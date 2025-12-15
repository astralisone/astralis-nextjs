'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  sparklineData?: Array<{
    value: number;
    [key: string]: any;
  }>;
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
};

export function MetricCard({
  title,
  value,
  change,
  icon,
  variant = 'default',
  sparklineData,
  className,
}: MetricCardProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {icon && (
            <div className={cn('p-2 rounded-lg', variantStyles[variant])}>
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-astralis-navy">{value}</p>

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2B6CB0"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {change && (
            <div className="flex items-center gap-1">
              {getTrendIcon(change.trend)}
              <span
                className={cn(
                  'text-sm font-medium',
                  getTrendColor(change.trend)
                )}
              >
                {change.trend === 'up' && '+'}
                {change.value}
                {change.trend === 'neutral' ? '' : '%'}
              </span>
              <span className="text-sm text-slate-500">{change.period}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}