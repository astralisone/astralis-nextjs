'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * LensFlare Component - SVG-based lens flare effect
 *
 * Creates a pulsing lens flare effect matching Image 4 visual style.
 *
 * Features:
 * - Radial gradient-based flare
 * - Pulsing animation
 * - Customizable position and intensity
 * - Multiple color presets
 *
 * @example
 * ```tsx
 * <LensFlare
 *   position={{ x: '50%', y: '50%' }}
 *   intensity={0.6}
 *   color="cyan"
 * />
 * ```
 */

export interface LensFlareProps {
  /** Position of the flare */
  position?: {
    x: string | number;
    y: string | number;
  };
  /** Intensity (0-1) */
  intensity?: number;
  /** Color preset */
  color?: 'cyan' | 'blue' | 'white' | 'purple';
  /** Container className */
  className?: string;
  /** Size multiplier */
  size?: number;
}

export function LensFlare({
  position = { x: '50%', y: '50%' },
  intensity = 0.6,
  color = 'cyan',
  className,
  size = 1,
}: LensFlareProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Color presets
  const colors = {
    cyan: { primary: '#00D4FF', secondary: '#66DBFF' },
    blue: { primary: '#2B6CB0', secondary: '#3182CE' },
    white: { primary: '#FFFFFF', secondary: '#E5E7EB' },
    purple: { primary: '#A855F7', secondary: '#C084FC' },
  };

  const flareColor = colors[color];

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      aria-hidden="true"
      role="presentation"
    >
      <svg
        width={400 * size}
        height={400 * size}
        viewBox="0 0 400 400"
        className="animate-lens-flare"
        style={{ opacity: intensity }}
      >
        <defs>
          {/* Primary radial gradient */}
          <radialGradient id={`flare-gradient-primary-${color}`}>
            <stop offset="0%" stopColor={flareColor.primary} stopOpacity="0.8" />
            <stop offset="30%" stopColor={flareColor.primary} stopOpacity="0.4" />
            <stop offset="60%" stopColor={flareColor.secondary} stopOpacity="0.2" />
            <stop offset="100%" stopColor={flareColor.secondary} stopOpacity="0" />
          </radialGradient>

          {/* Secondary gradient for outer glow */}
          <radialGradient id={`flare-gradient-secondary-${color}`}>
            <stop offset="0%" stopColor={flareColor.secondary} stopOpacity="0.3" />
            <stop offset="50%" stopColor={flareColor.primary} stopOpacity="0.1" />
            <stop offset="100%" stopColor={flareColor.primary} stopOpacity="0" />
          </radialGradient>

          {/* Gaussian blur for soft glow */}
          <filter id={`flare-blur-${color}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        {/* Outer glow layer */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill={`url(#flare-gradient-secondary-${color})`}
          filter={`url(#flare-blur-${color})`}
          className="animate-scale-pulse"
        />

        {/* Middle layer */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill={`url(#flare-gradient-primary-${color})`}
          filter={`url(#flare-blur-${color})`}
          className="animate-pulse-glow"
        />

        {/* Inner bright core */}
        <circle
          cx="200"
          cy="200"
          r="60"
          fill={flareColor.primary}
          opacity="0.9"
          filter={`url(#flare-blur-${color})`}
          className="animate-scale-pulse"
        />

        {/* Center point */}
        <circle
          cx="200"
          cy="200"
          r="20"
          fill="white"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
