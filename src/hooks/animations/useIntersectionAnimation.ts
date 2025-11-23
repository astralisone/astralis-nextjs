'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * useIntersectionAnimation Hook - Trigger animations on scroll into view
 *
 * Detects when an element enters the viewport and triggers animations.
 * Supports stagger animations for children and play-once or repeat modes.
 *
 * Features:
 * - Intersection Observer API
 * - Configurable thresholds
 * - Stagger delay support
 * - Play-once or repeat options
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * const { ref, isVisible, hasAnimated } = useIntersectionAnimation({
 *   threshold: 0.1,
 *   triggerOnce: true
 * });
 *
 * <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
 *   Content
 * </div>
 * ```
 */

export interface UseIntersectionAnimationOptions {
  /** Threshold for triggering (0-1) */
  threshold?: number | number[];
  /** Root margin (e.g., '0px 0px -100px 0px') */
  rootMargin?: string;
  /** Only trigger animation once */
  triggerOnce?: boolean;
  /** Delay before triggering animation (ms) */
  delay?: number;
  /** Enable stagger animation for children */
  enableStagger?: boolean;
  /** Stagger delay between children (ms) */
  staggerDelay?: number;
}

export interface UseIntersectionAnimationReturn {
  /** Ref to attach to the element */
  ref: React.RefObject<HTMLElement>;
  /** Is the element currently visible */
  isVisible: boolean;
  /** Has the animation been triggered at least once */
  hasAnimated: boolean;
  /** Entry object from Intersection Observer */
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionAnimation(
  options: UseIntersectionAnimationOptions = {}
): UseIntersectionAnimationReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = false,
    delay = 0,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If reduced motion, show immediately
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else {
            setIsVisible(true);
            setHasAnimated(true);
          }

          // Disconnect if triggerOnce
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, prefersReducedMotion]);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    isVisible,
    hasAnimated,
    entry,
  };
}

/**
 * useStaggerAnimation Hook - Create staggered child animations
 *
 * Returns an array of delays for staggered animations.
 *
 * @example
 * ```tsx
 * const delays = useStaggerAnimation(items.length, 100);
 *
 * {items.map((item, i) => (
 *   <div
 *     key={i}
 *     className="animate-fade-in"
 *     style={{ animationDelay: `${delays[i]}ms` }}
 *   >
 *     {item}
 *   </div>
 * ))}
 * ```
 */
export function useStaggerAnimation(
  count: number,
  baseDelay: number = 100,
  initialDelay: number = 0
): number[] {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return Array(count).fill(0);
  }

  return Array.from({ length: count }, (_, i) => initialDelay + i * baseDelay);
}
