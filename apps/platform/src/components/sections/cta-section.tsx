import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * CTASection (Call-to-Action) Component - Astralis Specification
 *
 * Layout:
 * - Full-width section with centered content
 * - Max-width container: 1280px
 * - Content max-width: 768px (for readability)
 * - Section padding: 96-120px vertical
 *
 * Background Variants:
 * - default: White/transparent background
 * - navy: Astralis Navy (#0A1B2B) background with white text
 * - gradient: Blue gradient background
 * - light: Light gray background
 *
 * Typography:
 * - Headline: 36-48px (text-4xl to text-5xl)
 * - Description: 18-20px (text-lg to text-xl)
 * - Font: Inter
 *
 * Buttons:
 * - 1-2 buttons in horizontal layout
 * - Primary and/or secondary variants
 */

export interface CTAButton {
  /**
   * Button text label
   */
  text: string;

  /**
   * Link destination
   */
  href: string;

  /**
   * Button style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Open link in new tab
   * @default false
   */
  openInNewTab?: boolean;
}

export interface CTASectionProps {
  /**
   * Main headline text
   */
  headline: string;

  /**
   * Optional description/subheadline text
   */
  description?: string;

  /**
   * Primary CTA button configuration
   */
  primaryButton?: CTAButton;

  /**
   * Secondary CTA button configuration
   */
  secondaryButton?: CTAButton;

  /**
   * Background style variant
   * @default 'default'
   */
  backgroundVariant?: 'default' | 'navy' | 'gradient' | 'light';

  /**
   * Additional CSS classes for section container
   */
  className?: string;

  /**
   * Optional custom content below buttons
   */
  children?: React.ReactNode;
}

const CTASection = React.forwardRef<HTMLElement, CTASectionProps>(
  (
    {
      headline,
      description,
      primaryButton,
      secondaryButton,
      backgroundVariant = 'default',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Background variant styles
    // Converted from React.useMemo to direct computation (server component)
    const backgroundStyles = backgroundVariant === 'default'
      ? 'bg-white dark:bg-slate-900'
      : backgroundVariant === 'navy'
      ? 'bg-astralis-navy text-white'
      : backgroundVariant === 'gradient'
      ? 'bg-gradient-to-br from-astralis-blue via-astralis-navy to-astralis-navy text-white'
      : 'bg-slate-50 dark:bg-slate-800';

    // Text color adjustments for dark backgrounds
    const isDarkBackground = backgroundVariant === 'navy' || backgroundVariant === 'gradient';
    const headlineColor = isDarkBackground
      ? 'text-white'
      : 'text-astralis-navy dark:text-white';
    const descriptionColor = isDarkBackground
      ? 'text-slate-200'
      : 'text-slate-700 dark:text-slate-300';

    // Adjust button variants for dark backgrounds
    const getButtonVariant = (button: CTAButton | undefined, isPrimary: boolean) => {
      if (!button) return undefined;

      // Override variant for dark backgrounds
      if (isDarkBackground) {
        return isPrimary ? 'outline' : 'secondary';
      }

      return button.variant || (isPrimary ? 'primary' : 'secondary');
    };

    return (
      <section
        ref={ref}
        className={cn(
          // Section spacing (96-120px per spec)
          'w-full px-8 py-24 md:px-20 md:py-32 lg:px-24',
          // Background variant
          backgroundStyles,
          // Animation
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {/* Max-width container (1280px) */}
        <div className="mx-auto max-w-[1280px]">
          {/* Centered content container (max 768px for readability) */}
          <div className="mx-auto max-w-3xl text-center space-y-8">
            {/* Headline - 36-48px */}
            <h2 className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight',
              headlineColor
            )}>
              {headline}
            </h2>

            {/* Description - 18-20px */}
            {description && (
              <p className={cn(
                'text-lg md:text-xl leading-relaxed max-w-2xl mx-auto',
                descriptionColor
              )}>
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            {(primaryButton || secondaryButton) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {/* Primary Button */}
                {primaryButton && (
                  <Button
                    asChild
                    variant={getButtonVariant(primaryButton, true) as any}
                    size="lg"
                    className={cn(
                      'min-w-[160px]',
                      isDarkBackground && 'border-white text-white hover:bg-white hover:text-astralis-navy'
                    )}
                  >
                    <Link
                      href={primaryButton.href}
                      target={primaryButton.openInNewTab ? '_blank' : undefined}
                      rel={primaryButton.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      {primaryButton.text}
                    </Link>
                  </Button>
                )}

                {/* Secondary Button */}
                {secondaryButton && (
                  <Button
                    asChild
                    variant={getButtonVariant(secondaryButton, false) as any}
                    size="lg"
                    className={cn(
                      'min-w-[160px]',
                      isDarkBackground && 'border-slate-300 text-slate-300 hover:bg-slate-300 hover:text-astralis-navy'
                    )}
                  >
                    <Link
                      href={secondaryButton.href}
                      target={secondaryButton.openInNewTab ? '_blank' : undefined}
                      rel={secondaryButton.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      {secondaryButton.text}
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Custom children content */}
            {children && (
              <div className="pt-6">
                {children}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

CTASection.displayName = 'CTASection';

export { CTASection };
