import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * FeatureGrid Section Component - Astralis Specification
 *
 * Layout:
 * - Responsive grid: 1 column (mobile) → 2 columns (tablet) → 3-4 columns (desktop)
 * - Card-based items with consistent spacing (24px gap)
 * - Section padding: 96-120px vertical
 * - Container max-width: 1280px
 *
 * Dark Theme Optimized:
 * - Card backgrounds with subtle borders
 * - Hover effects with shadow transitions
 * - Astralis Blue accent colors
 *
 * Typography:
 * - Feature title: 20px (text-xl) semibold
 * - Description: 16px (text-base) regular
 * - Font: Inter
 */

export interface Feature {
  /**
   * Feature title displayed prominently
   */
  title: string;

  /**
   * Descriptive text explaining the feature
   */
  description: string;

  /**
   * Optional icon component from lucide-react
   * Rendered at 24px size with Astralis Blue color
   */
  icon?: LucideIcon;

  /**
   * Optional custom icon element (alternative to icon prop)
   */
  iconElement?: React.ReactNode;

  /**
   * Optional link destination for clickable cards
   */
  href?: string;
}

export interface FeatureGridProps {
  /**
   * Array of features to display in grid
   */
  features: Feature[];

  /**
   * Optional section headline displayed above grid
   */
  headline?: string;

  /**
   * Optional section subheadline/description
   */
  subheadline?: string;

  /**
   * Grid column configuration
   * @default 3 - Three columns on desktop
   */
  columns?: 2 | 3 | 4;

  /**
   * Enable card hover effects
   * @default true
   */
  enableHover?: boolean;

  /**
   * Additional CSS classes for section container
   */
  className?: string;

  /**
   * Center align header text
   * @default false
   */
  centerHeader?: boolean;
}

const FeatureGrid = React.forwardRef<HTMLElement, FeatureGridProps>(
  (
    {
      features,
      headline,
      subheadline,
      columns = 3,
      enableHover = true,
      className,
      centerHeader = false,
      ...props
    },
    ref
  ) => {
    // Determine grid columns based on configuration
    // Converted from React.useMemo to direct computation (server component)
    const gridColsClass = columns === 2
      ? 'md:grid-cols-2'
      : columns === 3
      ? 'md:grid-cols-2 lg:grid-cols-3'
      : 'md:grid-cols-2 lg:grid-cols-4';

    return (
      <section
        ref={ref}
        className={cn(
          // Section spacing (96-120px per spec)
          'w-full px-8 py-24 md:px-20 md:py-32 lg:py-24',
          className
        )}
        {...props}
      >
        {/* Max-width container (1280px) */}
        <div className="mx-auto max-w-[1280px]">
          {/* Section Header */}
          {(headline || subheadline) && (
            <div
              className={cn(
                'mb-16 space-y-4',
                centerHeader && 'text-center mx-auto max-w-3xl'
              )}
            >
              {headline && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-astralis-navy dark:text-white tracking-tight">
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                  {subheadline}
                </p>
              )}
            </div>
          )}

          {/* Feature Grid - 24px gap per spec */}
          <div
            className={cn(
              'grid grid-cols-1 gap-6 md:gap-8',
              gridColsClass
            )}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const cardContent = (
                <>
                  {/* Icon */}
                  {(IconComponent || feature.iconElement) && (
                    <div className="mb-6">
                      {IconComponent ? (
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-astralis-blue/10 to-astralis-blue/5 dark:from-astralis-blue/20 dark:to-astralis-blue/10 ring-1 ring-astralis-blue/20">
                          <IconComponent
                            className="w-7 h-7 text-astralis-blue"
                            strokeWidth={2}
                          />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-astralis-blue/10 to-astralis-blue/5 dark:from-astralis-blue/20 dark:to-astralis-blue/10 ring-1 ring-astralis-blue/20">
                          {feature.iconElement}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title - 20px per typography spec */}
                  <h3 className="text-xl font-semibold text-astralis-navy dark:text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>

                  {/* Description - 16px base size */}
                  <p className="text-base text-slate-700 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </>
              );

              // Render as link if href provided
              if (feature.href) {
                return (
                  <a
                    key={index}
                    href={feature.href}
                    className={cn(
                      // Card base styles with enhanced styling
                      'block p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm',
                      // Hover effects (150-250ms per spec)
                      enableHover &&
                        'transition-all duration-200 ease-out hover:shadow-lg hover:border-astralis-blue dark:hover:border-astralis-blue hover:-translate-y-1 cursor-pointer',
                      // Animation
                      'animate-fade-in'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {cardContent}
                  </a>
                );
              }

              // Render as static card
              return (
                <div
                  key={index}
                  className={cn(
                    // Card base styles with enhanced styling
                    'p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm',
                    // Hover effects
                    enableHover &&
                      'transition-all duration-200 ease-out hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1',
                    // Animation
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);

FeatureGrid.displayName = 'FeatureGrid';

export { FeatureGrid };
