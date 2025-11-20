'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionAnimation, useCountUp } from '@/hooks/animations';

/**
 * AnimatedBarChart Component
 *
 * Animated bar chart with enter animations and hover states.
 * Matches the ROI calculator comparison chart from reference images.
 *
 * Features:
 * - Bars animate from 0 to value on scroll into view
 * - Smooth easing with spring physics
 * - Hover shows exact values
 * - Count-up animation for labels
 * - Responsive design
 *
 * @example
 * ```tsx
 * <AnimatedBarChart
 *   data={[
 *     { label: 'Before', value: 1200, color: 'slate' },
 *     { label: 'After', value: 3726, color: 'cyan' }
 *   ]}
 *   showValues={true}
 *   animateOnScroll={true}
 * />
 * ```
 */

export interface BarChartData {
  /** Bar label */
  label: string;
  /** Bar value (will be normalized to percentage of max) */
  value: number;
  /** Color preset */
  color?: 'cyan' | 'blue' | 'purple' | 'slate' | 'gradient';
  /** Custom description (shown on hover) */
  description?: string;
}

export interface AnimatedBarChartProps {
  /** Chart data */
  data: BarChartData[];
  /** Chart height */
  height?: number;
  /** Show value labels */
  showValues?: boolean;
  /** Value format */
  valueFormat?: 'number' | 'currency' | 'percentage';
  /** Animate on scroll into view */
  animateOnScroll?: boolean;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Show hover tooltips */
  showTooltips?: boolean;
  /** Container className */
  className?: string;
  /** Bar spacing */
  spacing?: 'compact' | 'normal' | 'relaxed';
}

export const AnimatedBarChart = React.forwardRef<HTMLDivElement, AnimatedBarChartProps>(
  (
    {
      data,
      height = 192,
      showValues = true,
      valueFormat = 'number',
      animateOnScroll = true,
      animationDuration = 1000,
      showTooltips = true,
      className,
      spacing = 'normal',
      ...props
    },
    ref
  ) => {
    const { ref: containerRef, isVisible } = useIntersectionAnimation({
      threshold: 0.2,
      triggerOnce: true,
    });

    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    // Check for reduced motion
    React.useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Find max value for normalization
    const maxValue = Math.max(...data.map((d) => d.value));

    // Color class mapping
    const colorClasses = {
      cyan: {
        bar: 'bg-gradient-to-t from-astralis-cyan to-astralis-cyan-400',
        shadow: 'shadow-glow-cyan',
        text: 'text-astralis-cyan',
      },
      blue: {
        bar: 'bg-gradient-to-t from-astralis-blue to-blue-400',
        shadow: 'shadow-glow-blue',
        text: 'text-astralis-blue',
      },
      purple: {
        bar: 'bg-gradient-to-t from-electric-purple to-purple-400',
        shadow: 'shadow-glow-purple',
        text: 'text-electric-purple',
      },
      slate: {
        bar: 'bg-slate-400',
        shadow: '',
        text: 'text-slate-600',
      },
      gradient: {
        bar: 'bg-gradient-to-t from-astralis-cyan via-astralis-blue to-electric-purple',
        shadow: 'shadow-glow-cyan',
        text: 'text-astralis-cyan',
      },
    };

    // Spacing classes
    const spacingClasses = {
      compact: 'gap-2',
      normal: 'gap-4',
      relaxed: 'gap-6',
    };

    // Should animate
    const shouldAnimate = animateOnScroll ? isVisible : true;

    // Format value
    const formatValue = (value: number): string => {
      switch (valueFormat) {
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'percentage':
          return `${value}%`;
        default:
          return value.toLocaleString();
      }
    };

    return (
      <div
        ref={(node) => {
          // Merge refs
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn('w-full', className)}
        {...props}
      >
        {/* Chart */}
        <div
          className={cn('flex items-end', spacingClasses[spacing])}
          style={{ height }}
        >
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const color = item.color || 'cyan';
            const colors = colorClasses[color];
            const isHovered = hoveredIndex === index;

            // Use count-up for value display
            const animatedValue = useCountUp(item.value, {
              duration: animationDuration,
              format: valueFormat === 'number' ? 'number' : undefined,
              decimals: 0,
              autoStart: shouldAnimate,
            });

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-3 relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Value label (on hover or always if showValues) */}
                {(showValues || isHovered) && (
                  <div
                    className={cn(
                      'text-sm font-bold transition-all duration-200',
                      colors.text,
                      isHovered && 'scale-110'
                    )}
                  >
                    {valueFormat === 'currency' && '$'}
                    {animatedValue}
                    {valueFormat === 'percentage' && '%'}
                  </div>
                )}

                {/* Tooltip (on hover) */}
                {showTooltips && isHovered && item.description && (
                  <div className="absolute bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                    {item.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}

                {/* Bar container */}
                <div className="w-full bg-slate-200 rounded-t-lg relative flex-1 flex items-end overflow-hidden">
                  {/* Animated bar */}
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all duration-300',
                      colors.bar,
                      isHovered && colors.shadow,
                      isHovered && 'scale-105'
                    )}
                    style={{
                      height: shouldAnimate
                        ? `${percentage}%`
                        : prefersReducedMotion
                        ? `${percentage}%`
                        : '0%',
                      transitionDuration: prefersReducedMotion
                        ? '0ms'
                        : `${animationDuration}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring easing
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isHovered ? colors.text : 'text-slate-600'
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend (optional, if descriptions exist) */}
        {data.some((item) => item.description) && (
          <div className="mt-6 space-y-2">
            {data.map((item, index) => {
              if (!item.description) return null;

              const colors = colorClasses[item.color || 'cyan'];

              return (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-sm mt-0.5 flex-shrink-0',
                      colors.bar
                    )}
                  />
                  <div>
                    <span className="font-medium text-slate-900">{item.label}:</span>{' '}
                    <span className="text-slate-600">{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

AnimatedBarChart.displayName = 'AnimatedBarChart';
