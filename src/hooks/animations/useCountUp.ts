'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * useCountUp Hook - Animated number counting
 *
 * Smoothly animates a number from 0 (or a start value) to a target value.
 * Matches the ROI calculator and stat animations from reference images.
 *
 * Features:
 * - Configurable duration and easing
 * - Format options (currency, percentage, etc.)
 * - Decimal precision control
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * const value = useCountUp(3726, {
 *   duration: 1000,
 *   format: 'currency',
 *   decimals: 0
 * });
 * ```
 */

export interface UseCountUpOptions {
  /** Animation duration in milliseconds */
  duration?: number;
  /** Starting value */
  start?: number;
  /** Number format */
  format?: 'number' | 'currency' | 'percentage' | 'compact';
  /** Decimal places */
  decimals?: number;
  /** Currency symbol (for currency format) */
  currencySymbol?: string;
  /** Easing function */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  /** Delay before animation starts */
  delay?: number;
  /** Trigger animation on mount */
  autoStart?: boolean;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

export function useCountUp(
  targetValue: number,
  options: UseCountUpOptions = {}
): string {
  const {
    duration = 1000,
    start = 0,
    format = 'number',
    decimals = 0,
    currencySymbol = '$',
    easing = 'easeOut',
    delay = 0,
    autoStart = true,
  } = options;

  const [currentValue, setCurrentValue] = useState(start);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Animation effect
  useEffect(() => {
    if (!autoStart) return;

    // If reduced motion, jump to target immediately
    if (prefersReducedMotion) {
      setCurrentValue(targetValue);
      return;
    }

    const startAnimation = () => {
      startTimeRef.current = undefined;

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions[easing](progress);

        const value = start + (targetValue - start) * easedProgress;
        setCurrentValue(value);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentValue(targetValue);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Apply delay if specified
    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, duration, start, easing, delay, autoStart, prefersReducedMotion]);

  // Format the current value
  const formatValue = (value: number): string => {
    const roundedValue = Number(value.toFixed(decimals));

    switch (format) {
      case 'currency':
        return `${currencySymbol}${roundedValue.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`;

      case 'percentage':
        return `${roundedValue.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}%`;

      case 'compact':
        if (roundedValue >= 1000000) {
          return `${(roundedValue / 1000000).toFixed(1)}M`;
        }
        if (roundedValue >= 1000) {
          return `${(roundedValue / 1000).toFixed(1)}K`;
        }
        return roundedValue.toLocaleString();

      case 'number':
      default:
        return roundedValue.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  };

  return formatValue(currentValue);
}
