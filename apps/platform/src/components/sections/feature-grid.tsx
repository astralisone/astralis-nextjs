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
   * Additional classes applied to each card
   */
  cardClassName?: string;

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
      cardClassName,
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
                  {(IconComponent || feature.iconElement) && (
                    <div className="feature-card__icon mb-6">
                      {IconComponent ? (
                        <IconComponent className="h-8 w-8" strokeWidth={2} />
                      ) : (
                        feature.iconElement
                      )}
                    </div>
                  )}

                  <h3 className="feature-card__title mb-3">
                    {feature.title}
                  </h3>

                  <p className="feature-card__description">
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
                      'feature-card group block p-8',
                      'before:pointer-events-none before:absolute before:-inset-x-12 before:-inset-y-14 before:bg-[radial-gradient(circle_at_top,_rgba(43,108,176,0.18),_transparent_65%)] before:opacity-0 before:transition-opacity before:duration-300',
                      'group-hover:before:opacity-100',
                      enableHover &&
                        'cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl',
                      'animate-fade-in',
                      'card-theme-light',
                      cardClassName
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
                    'feature-card relative p-8',
                    'before:pointer-events-none before:absolute before:-inset-x-12 before:-inset-y-14 before:bg-[radial-gradient(circle_at_top,_rgba(43,108,176,0.16),_transparent_65%)] before:opacity-0 before:transition-opacity before:duration-300',
                    enableHover && 'hover:before:opacity-100',
                    enableHover && 'transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-2xl',
                    'animate-fade-in',
                    'card-theme-light',
                    cardClassName
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
