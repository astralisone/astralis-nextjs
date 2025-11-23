'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * PulsingRing Component - Animated ring/circle effect
 *
 * Creates concentric pulsing rings matching Image 1 (central AI ring).
 *
 * Features:
 * - Multiple concentric rings
 * - Ripple pulse animation
 * - Glow effects
 * - Customizable colors and sizes
 *
 * @example
 * ```tsx
 * <PulsingRing
 *   size={200}
 *   rings={3}
 *   color="cyan"
 *   glowIntensity="high"
 * />
 * ```
 */

export interface PulsingRingProps {
  /** Ring diameter in pixels */
  size?: number;
  /** Number of concentric rings */
  rings?: number;
  /** Color preset */
  color?: 'cyan' | 'blue' | 'purple';
  /** Glow intensity */
  glowIntensity?: 'low' | 'medium' | 'high';
  /** Container className */
  className?: string;
  /** Center content (e.g., logo, icon) */
  children?: React.ReactNode;
  /** Pulse speed multiplier */
  speed?: number;
}

export function PulsingRing({
  size = 200,
  rings = 3,
  color = 'cyan',
  glowIntensity = 'medium',
  className,
  children,
  speed = 1,
}: PulsingRingProps) {
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
    cyan: {
      ring: 'border-astralis-cyan',
      glow: 'shadow-glow-cyan',
      glowXl: 'shadow-glow-cyan-xl',
      neon: 'shadow-neon-cyan',
    },
    blue: {
      ring: 'border-astralis-blue',
      glow: 'shadow-glow-blue',
      glowXl: 'shadow-glow-blue-lg',
      neon: 'shadow-neon-blue',
    },
    purple: {
      ring: 'border-electric-purple',
      glow: 'shadow-glow-purple',
      glowXl: 'shadow-glow-purple',
      neon: 'shadow-glow-purple',
    },
  };

  const glowClasses = {
    low: colors[color].glow,
    medium: colors[color].glowXl,
    high: colors[color].neon,
  };

  const ringColor = colors[color];
  const glowClass = glowClasses[glowIntensity];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Concentric rings */}
      {Array.from({ length: rings }).map((_, index) => {
        const ringSize = size - (index * size / (rings + 1));
        const borderWidth = 2 + (rings - index);
        const animationDelay = prefersReducedMotion ? 0 : (index * 0.3) / speed;

        return (
          <div
            key={index}
            className={cn(
              'absolute rounded-full border',
              ringColor.ring,
              !prefersReducedMotion && 'animate-ring-pulse',
              glowClass
            )}
            style={{
              width: ringSize,
              height: ringSize,
              borderWidth,
              animationDelay: `${animationDelay}s`,
              animationDuration: `${2 / speed}s`,
            }}
            aria-hidden="true"
          />
        );
      })}

      {/* Static outer ring (no animation) */}
      <div
        className={cn(
          'absolute rounded-full border-2',
          ringColor.ring,
          'opacity-50'
        )}
        style={{
          width: size,
          height: size,
        }}
        aria-hidden="true"
      />

      {/* Center content */}
      {children && (
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>
      )}

      {/* Center glow dot */}
      {!children && (
        <div
          className={cn(
            'absolute w-4 h-4 rounded-full',
            ringColor.ring.replace('border-', 'bg-'),
            glowClass,
            !prefersReducedMotion && 'animate-pulse-glow'
          )}
        />
      )}
    </div>
  );
}
