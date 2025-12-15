'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  AreaChart as RechartsAreaChart,
  Area,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Astralis Chart Theme - Enhanced Professional Styling
export const CHART_THEME = {
  colors: {
    primary: '#2B6CB0',    // Astralis Blue
    secondary: '#0A1B2B',  // Astralis Navy
    success: '#38A169',    // Green
    warning: '#DD6B20',    // Orange
    error: '#E53E3E',      // Red
    neutral: '#64748B',    // Slate
    accent: '#00D4FF',     // Astralis Cyan
    muted: '#94A3B8',      // Muted slate
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    size: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
  },
  grid: {
    stroke: '#E2E8F0',
    strokeDasharray: '2 2',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #2B6CB0 0%, #4299E1 100%)',
    success: 'linear-gradient(135deg, #38A169 0%, #68D391 100%)',
    accent: 'linear-gradient(135deg, #00D4FF 0%, #2B6CB0 100%)',
  },
};

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  [key: string]: any;
}

export interface MultiSeriesDataPoint {
  date: string;
  [key: string]: number | string;
}

// Base Chart Props
interface BaseChartProps {
  data: ChartDataPoint[] | MultiSeriesDataPoint[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  dataKey?: string;
  strokeColor?: string;
  strokeWidth?: number;
  dot?: boolean;
}

export function LineChart({
  data,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  animate = true,
  dataKey = 'value',
  strokeColor = CHART_THEME.colors.primary,
  strokeWidth = 2,
  dot = false,
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid
              stroke={CHART_THEME.grid.stroke}
              strokeDasharray={CHART_THEME.grid.strokeDasharray}
            />
          )}
          <defs>
            <linearGradient id={`lineGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.1}/>
            </linearGradient>
            <filter id={`glow-${dataKey}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <XAxis
            dataKey="date"
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.muted, fontWeight: 500 }}
            axisLine={{ stroke: CHART_THEME.grid.stroke, strokeWidth: 1 }}
            tickLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          <YAxis
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.muted, fontWeight: 500 }}
            axisLine={{ stroke: CHART_THEME.grid.stroke, strokeWidth: 1 }}
            tickLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${CHART_THEME.colors.primary}20`,
                borderRadius: '8px',
                fontSize: CHART_THEME.fonts.size.small,
                fontFamily: CHART_THEME.fonts.family,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: CHART_THEME.colors.secondary,
              }}
              labelStyle={{
                color: CHART_THEME.colors.secondary,
                fontWeight: 600,
                marginBottom: '4px'
              }}
              itemStyle={{
                color: CHART_THEME.colors.primary,
                fontWeight: 500
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            filter={`url(#glow-${dataKey})`}
            dot={dot ? {
              fill: strokeColor,
              strokeWidth: 2,
              r: 4,
              filter: `url(#glow-${dataKey})`
            } : false}
            activeDot={{
              r: 6,
              fill: strokeColor,
              stroke: 'white',
              strokeWidth: 2,
              filter: `url(#glow-${dataKey})`
            }}
            animationDuration={animate ? 1500 : 0}
            animationEasing="ease-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  dataKey?: string;
  fillColor?: string;
  barSize?: number;
}

export function BarChart({
  data,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  animate = true,
  dataKey = 'value',
  fillColor = CHART_THEME.colors.primary,
  barSize,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid
              stroke={CHART_THEME.grid.stroke}
              strokeDasharray={CHART_THEME.grid.strokeDasharray}
            />
          )}
          <XAxis
            dataKey="date"
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.neutral }}
            axisLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          <YAxis
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.neutral }}
            axisLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${CHART_THEME.grid.stroke}`,
                borderRadius: '6px',
                fontSize: CHART_THEME.fonts.size.small,
                fontFamily: CHART_THEME.fonts.family,
              }}
              labelStyle={{ color: CHART_THEME.colors.secondary }}
            />
          )}
          <Bar
            dataKey={dataKey}
            fill={fillColor}
            barSize={barSize}
            animationDuration={animate ? 1000 : 0}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Area Chart Component
interface AreaChartProps extends BaseChartProps {
  dataKey?: string;
  fillColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
}

export function AreaChart({
  data,
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  animate = true,
  dataKey = 'value',
  fillColor = CHART_THEME.colors.primary,
  strokeColor = CHART_THEME.colors.primary,
  fillOpacity = 0.3,
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid
              stroke={CHART_THEME.grid.stroke}
              strokeDasharray={CHART_THEME.grid.strokeDasharray}
            />
          )}
          <defs>
            <linearGradient id={`areaGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={fillOpacity * 0.8}/>
              <stop offset="50%" stopColor={fillColor} stopOpacity={fillOpacity * 0.4}/>
              <stop offset="95%" stopColor={fillColor} stopOpacity={fillOpacity * 0.1}/>
            </linearGradient>
            <filter id={`areaGlow-${dataKey}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <XAxis
            dataKey="date"
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.muted, fontWeight: 500 }}
            axisLine={{ stroke: CHART_THEME.grid.stroke, strokeWidth: 1 }}
            tickLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          <YAxis
            fontSize={parseInt(CHART_THEME.fonts.size.small)}
            tick={{ fill: CHART_THEME.colors.muted, fontWeight: 500 }}
            axisLine={{ stroke: CHART_THEME.grid.stroke, strokeWidth: 1 }}
            tickLine={{ stroke: CHART_THEME.grid.stroke }}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${fillColor}30`,
                borderRadius: '8px',
                fontSize: CHART_THEME.fonts.size.small,
                fontFamily: CHART_THEME.fonts.family,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: CHART_THEME.colors.secondary,
              }}
              labelStyle={{
                color: CHART_THEME.colors.secondary,
                fontWeight: 600,
                marginBottom: '4px'
              }}
              itemStyle={{
                color: fillColor,
                fontWeight: 500
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            fill={`url(#areaGradient-${dataKey})`}
            strokeWidth={2}
            filter={`url(#areaGlow-${dataKey})`}
            animationDuration={animate ? 1500 : 0}
            animationEasing="ease-out"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Metric Card with Sparkline
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
  sparklineData?: ChartDataPoint[];
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  variant = 'default',
  sparklineData,
  className,
  onClick,
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-600 border-slate-200/60',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50/50 text-green-600 border-green-200/60',
    warning: 'bg-gradient-to-br from-orange-50 to-amber-50/50 text-orange-600 border-orange-200/60',
    error: 'bg-gradient-to-br from-red-50 to-rose-50/50 text-red-600 border-red-200/60',
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50 border-green-200/30',
    down: 'text-red-600 bg-red-50 border-red-200/30',
    neutral: 'text-slate-500 bg-slate-50 border-slate-200/30',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  return (
    <Card
      variant="default"
      hover
      className={cn(
        'cursor-pointer shadow-card-glass backdrop-blur-sm border transition-all duration-300 hover:shadow-card-glass-light hover:scale-[1.02] group',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600 group-hover:text-astralis-navy transition-colors duration-200">
            {title}
          </p>
          {icon && (
            <div className={cn(
              'p-3 rounded-xl shadow-sm border transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
              variantStyles[variant]
            )}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-3xl font-bold text-astralis-navy mb-3 group-hover:text-astralis-blue transition-colors duration-200">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>

            {change && (
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all duration-200',
                trendColors[change.trend]
              )}>
                <span className="text-lg">{trendIcons[change.trend]}</span>
                <span>
                  {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}
                  {Math.abs(change.value)}%
                </span>
                <span className="text-xs opacity-75 ml-1">{change.period}</span>
              </div>
            )}
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="w-24 h-14 ml-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`gradient-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_THEME.colors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_THEME.colors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_THEME.colors.primary}
                    fill={`url(#gradient-${title.replace(/\s+/g, '-').toLowerCase()})`}
                    strokeWidth={2}
                    animationDuration={800}
                  />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Chart Container Component
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: number;
  loading?: boolean;
  onExport?: () => void;
}

export function ChartContainer({
  title,
  children,
  className,
  height,
  loading = false,
  onExport,
}: ChartContainerProps) {
  return (
    <Card className={cn('shadow-card-glass backdrop-blur-sm border-slate-200/60 transition-all duration-300 hover:shadow-card-glass-light group', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-astralis-navy flex items-center gap-3 group-hover:text-astralis-blue transition-colors duration-200">
            <div className="p-2 bg-gradient-to-br from-astralis-blue/10 to-blue-50 rounded-lg border border-astralis-blue/20 group-hover:shadow-glow-blue transition-all duration-300">
              <TrendingUp className="w-4 h-4 text-astralis-blue" />
            </div>
            {title}
          </CardTitle>
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(height ? '' : 'p-6 pt-0')}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-astralis-blue"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-astralis-cyan animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Loading analytics...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

