import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatsSection Component - Astralis Specification
 *
 * Layout:
 * - Horizontal row of 3-4 stat cards
 * - Responsive: Stacks vertically on mobile, 2 columns on tablet, row on desktop
 * - Equal-width cards with consistent spacing
 * - Section padding: 96-120px vertical
 * - Container max-width: 1280px
 *
 * Stat Card Design:
 * - Large number display (primary metric)
 * - Label/description below number
 * - Optional trend indicator (up/down/neutral)
 * - Optional secondary metric or context
 *
 * Typography:
 * - Stat number: 48px (text-5xl) bold
 * - Label: 16px (text-base) regular
 * - Font: Inter
 *
 * Dark Theme:
 * - Card backgrounds with subtle borders
 * - Astralis Blue accent for positive trends
 * - Error color for negative trends
 */

export type TrendDirection = 'up' | 'down' | 'neutral' | 'none';

export interface Stat {
  /**
   * Primary statistic value (can be number or string)
   * Examples: "10,000", "$1.2M", "99%"
   */
  value: string | number;

  /**
   * Stat label/description
   */
  label: string;

  /**
   * Optional trend direction indicator
   * @default 'none'
   */
  trend?: TrendDirection;

  /**
   * Optional trend value/percentage
   * Example: "+12%", "-5%", "↑ 150"
   */
  trendValue?: string;

  /**
   * Optional secondary metric or context
   * Example: "vs last month", "total active"
   */
  secondaryText?: string;

  /**
   * Custom icon to display above number (instead of trend)
   */
  icon?: React.ReactNode;
}

export interface StatsSectionProps {
  /**
   * Array of statistics to display
   */
  stats: Stat[];

  /**
   * Optional section headline
   */
  headline?: string;

  /**
   * Optional section description
   */
  description?: string;

  /**
   * Enable card borders and backgrounds
   * @default true
   */
  enableCards?: boolean;

  /**
   * Additional CSS classes for section container
   */
  className?: string;

  /**
   * Center align header text
   * @default false
   */
  centerHeader?: boolean;

  /**
   * Background variant
   * @default 'default'
   */
  backgroundVariant?: 'default' | 'light' | 'navy';
}

const StatsSection = React.forwardRef<HTMLElement, StatsSectionProps>(
  (
    {
      stats,
      headline,
      description,
      enableCards = true,
      className,
      centerHeader = false,
      backgroundVariant = 'default',
      ...props
    },
    ref
  ) => {
    // Background variant styles
    // Converted from React.useMemo to direct computation (server component)
    const backgroundStyles = backgroundVariant === 'default'
      ? 'bg-white dark:bg-slate-900'
      : backgroundVariant === 'light'
      ? 'bg-slate-50 dark:bg-slate-800'
      : 'bg-astralis-navy text-white';

    const isDarkBackground = backgroundVariant === 'navy';

    // Trend icon component
    const getTrendIcon = (trend: TrendDirection) => {
      const iconProps = { className: 'w-6 h-6', strokeWidth: 2 };

      switch (trend) {
        case 'up':
          return <TrendingUp {...iconProps} className="w-6 h-6 text-success" />;
        case 'down':
          return <TrendingDown {...iconProps} className="w-6 h-6 text-error" />;
        case 'neutral':
          return <Minus {...iconProps} className="w-6 h-6 text-slate-500" />;
        default:
          return null;
      }
    };

    // Trend color class
    const getTrendColor = (trend: TrendDirection) => {
      switch (trend) {
        case 'up':
          return 'text-success';
        case 'down':
          return 'text-error';
        case 'neutral':
          return 'text-slate-500 dark:text-slate-400';
        default:
          return '';
      }
    };

    return (
      <section
        ref={ref}
        className={cn(
          // Section spacing (96-120px per spec)
          'w-full px-8 py-24 md:px-20 md:py-32 lg:py-24',
          // Background variant
          backgroundStyles,
          className
        )}
        {...props}
      >
        {/* Max-width container (1280px) */}
        <div className="mx-auto max-w-[1280px]">
          {/* Section Header */}
          {(headline || description) && (
            <div
              className={cn(
                'mb-16 space-y-4',
                centerHeader && 'text-center mx-auto max-w-3xl'
              )}
            >
              {headline && (
                <h2
                  className={cn(
                    'text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight',
                    isDarkBackground ? 'text-white' : 'text-astralis-navy dark:text-white'
                  )}
                >
                  {headline}
                </h2>
              )}
              {description && (
                <p
                  className={cn(
                    'text-lg md:text-xl leading-relaxed',
                    isDarkBackground ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div
            className={cn(
              'grid grid-cols-1 gap-8',
              // Responsive columns based on stat count
              stats.length === 2 && 'md:grid-cols-2',
              stats.length === 3 && 'md:grid-cols-3',
              stats.length === 4 && 'md:grid-cols-2 lg:grid-cols-4',
              stats.length > 4 && 'md:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  // Card styling
                  enableCards &&
                    'p-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-card',
                  // Animation
                  'animate-fade-in',
                  // Center align content
                  'text-center'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Custom Icon */}
                {stat.icon && (
                  <div className="mb-4 flex justify-center">
                    {stat.icon}
                  </div>
                )}

                {/* Trend Indicator */}
                {!stat.icon && stat.trend && stat.trend !== 'none' && (
                  <div className="mb-3 flex items-center justify-center gap-1">
                    {getTrendIcon(stat.trend)}
                    {stat.trendValue && (
                      <span className={cn('text-sm font-medium', getTrendColor(stat.trend))}>
                        {stat.trendValue}
                      </span>
                    )}
                  </div>
                )}

                {/* Stat Value - 48px bold */}
                <div
                  className={cn(
                    'text-4xl md:text-5xl font-bold tracking-tight mb-2',
                    isDarkBackground ? 'text-white' : 'text-astralis-navy dark:text-white'
                  )}
                >
                  {stat.value}
                </div>

                {/* Stat Label - 16px */}
                <div
                  className={cn(
                    'text-base font-medium',
                    isDarkBackground ? 'text-slate-300' : 'text-slate-700 dark:text-slate-400'
                  )}
                >
                  {stat.label}
                </div>

                {/* Secondary Text */}
                {stat.secondaryText && (
                  <div
                    className={cn(
                      'text-sm mt-2',
                      isDarkBackground ? 'text-slate-400' : 'text-slate-500 dark:text-slate-500'
                    )}
                  >
                    {stat.secondaryText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

StatsSection.displayName = 'StatsSection';

export { StatsSection };
