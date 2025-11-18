'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Hero Section Component - Astralis Specification (Section 3.3)
 *
 * Layout Strategy:
 * - 12-column grid system (max-width: 1280px)
 * - Left column: Text content (headline, subheadline, description, buttons)
 * - Right column: Image, card stack, or custom component
 * - Section spacing: 96-120px vertical padding (py-24 md:py-28 lg:py-30)
 * - Responsive: Stacks vertically on mobile (<768px)
 *
 * Typography (per spec Section 2.4 & 3.3):
 * - Headline: 48px (text-4xl md:text-5xl) - font-semibold, tracking-tight
 * - Subheadline: 20px (text-lg md:text-xl)
 * - Font: Inter (primary)
 *
 * Dark Theme Optimized:
 * - Text color: slate-100 for dark backgrounds
 * - Headline: slate-100 (instead of navy for dark bg)
 * - Subheadline: slate-300
 * - Background: Astralis Navy (#0A1B2B)
 *
 * Buttons (per spec Section 3.3):
 * - Primary: Astralis Blue background, white text
 * - Secondary: Astralis Blue border, blue text
 *
 * Animations:
 * - Fade-in on load (200ms ease-out)
 * - Follows 150-250ms animation constraints
 */

export interface HeroProps {
  /**
   * Main headline text
   * Rendered at 48px (text-5xl) with font-semibold
   */
  headline: string;

  /**
   * Optional subheadline displayed above headline
   * Rendered at 20px (text-xl) with Astralis Blue color
   */
  subheadline?: string;

  /**
   * Optional description text below headline
   * Rendered at base size with slate-700 color
   */
  description?: string;

  /**
   * Primary call-to-action button configuration
   * Uses Astralis Blue background (primary variant)
   */
  primaryButton?: {
    text: string;
    href: string;
  };

  /**
   * Secondary call-to-action button configuration
   * Uses Astralis Blue border (secondary variant)
   */
  secondaryButton?: {
    text: string;
    href: string;
  };

  /**
   * Custom content for right column
   * Can be an image, card stack, form, or any React component
   */
  rightContent?: React.ReactNode;

  /**
   * Additional CSS classes for section container
   */
  className?: string;

  /**
   * Control text column width on larger screens
   * @default 'half' - 6/12 columns
   */
  textColumnWidth?: 'half' | 'full' | 'two-thirds';

  /**
   * Alignment of text content
   * @default 'left'
   */
  textAlign?: 'left' | 'center';

  /**
   * Theme variant for the hero section
   * @default 'dark' - Dark theme optimized with Astralis Navy background
   */
  variant?: 'light' | 'dark';
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      headline,
      subheadline,
      description,
      primaryButton,
      secondaryButton,
      rightContent,
      className,
      textColumnWidth = 'half',
      textAlign = 'left',
      variant = 'dark',
      ...props
    },
    ref
  ) => {
    // Determine grid column classes based on configuration
    const textColClass = React.useMemo(() => {
      if (!rightContent) return 'lg:col-span-12';

      switch (textColumnWidth) {
        case 'full':
          return 'lg:col-span-12';
        case 'two-thirds':
          return 'lg:col-span-8';
        case 'half':
        default:
          return 'lg:col-span-6';
      }
    }, [rightContent, textColumnWidth]);

    const rightColClass = React.useMemo(() => {
      switch (textColumnWidth) {
        case 'two-thirds':
          return 'lg:col-span-4';
        case 'half':
        default:
          return 'lg:col-span-6';
      }
    }, [textColumnWidth]);

    const textAlignClass = textAlign === 'center' ? 'text-center' : 'text-left';
    const buttonJustifyClass = textAlign === 'center' ? 'justify-center' : 'justify-start';

    // Theme-specific text colors
    const headlineColor = variant === 'dark' ? 'text-slate-100' : 'text-astralis-navy';
    const subheadlineColor = variant === 'dark' ? 'text-slate-300' : 'text-astralis-blue';
    const descriptionColor = variant === 'dark' ? 'text-slate-300' : 'text-slate-700';
    const sectionBg = variant === 'dark' ? 'bg-astralis-navy' : 'bg-white';

    return (
      <section
        ref={ref}
        className={cn(
          // Container & spacing (spec Section 3.1, 3.3: 96-120px padding)
          'w-full px-8 py-24 md:px-20 md:py-28 lg:px-24 lg:py-30',
          // Background theme
          sectionBg,
          // Animation (200ms fade-in per spec)
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {/* Max-width container (1280px per spec Section 3.1) */}
        <div className="mx-auto max-w-[1280px]">
          {/* 12-column grid system */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className={cn('space-y-6', textColClass, textAlignClass)}>
              {/* Subheadline (optional) - 20px per spec (text-lg md:text-xl) */}
              {subheadline && (
                <p className={cn('text-lg md:text-xl font-medium', subheadlineColor)}>
                  {subheadline}
                </p>
              )}

              {/* Headline - Enhanced sizing for better impact */}
              <h1 className={cn('text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight', headlineColor)}>
                {headline}
              </h1>

              {/* Description (optional) */}
              {description && (
                <p className={cn('text-lg md:text-xl leading-relaxed max-w-2xl', descriptionColor)}>
                  {description}
                </p>
              )}

              {/* CTA Buttons */}
              {(primaryButton || secondaryButton) && (
                <div className={cn('flex flex-col sm:flex-row gap-4 pt-4', buttonJustifyClass)}>
                  {/* Primary Button - Astralis Blue background */}
                  {primaryButton && (
                    <Button
                      asChild
                      variant="primary"
                      size="lg"
                      className="min-w-[160px]"
                    >
                      <Link href={primaryButton.href}>
                        {primaryButton.text}
                      </Link>
                    </Button>
                  )}

                  {/* Secondary Button - Blue border (outline) */}
                  {secondaryButton && (
                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="min-w-[160px]"
                    >
                      <Link href={secondaryButton.href}>
                        {secondaryButton.text}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Custom Content (optional) */}
            {rightContent && (
              <div className={cn('w-full', rightColClass)}>
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

Hero.displayName = 'Hero';

export { Hero };
