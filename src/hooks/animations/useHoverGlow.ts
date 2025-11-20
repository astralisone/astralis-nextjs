'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * useHoverGlow Hook - Manage glow effects on hover
 *
 * Provides state and handlers for glow effects on interactive elements.
 * Matches the card hover states from reference images.
 *
 * Features:
 * - Hover state management
 * - Mouse position tracking (for advanced effects)
 * - Glow intensity control
 * - Keyboard focus support
 *
 * @example
 * ```tsx
 * const { isHovered, handlers, glowStyle } = useHoverGlow({
 *   intensity: 'high',
 *   trackMouse: true
 * });
 *
 * <div {...handlers} className={isHovered ? 'shadow-glow-cyan' : ''}>
 *   Content
 * </div>
 * ```
 */

export interface UseHoverGlowOptions {
  /** Glow intensity preset */
  intensity?: 'low' | 'medium' | 'high';
  /** Track mouse position for gradient effects */
  trackMouse?: boolean;
  /** Color preset */
  color?: 'cyan' | 'blue' | 'purple';
  /** Also activate on focus (accessibility) */
  activateOnFocus?: boolean;
  /** Callback when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
}

export interface UseHoverGlowReturn {
  /** Is currently hovered or focused */
  isHovered: boolean;
  /** Event handlers to spread on element */
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onFocus?: () => void;
    onBlur?: () => void;
  };
  /** Mouse position relative to element (if trackMouse enabled) */
  mousePosition: { x: number; y: number } | null;
  /** Glow CSS class */
  glowClass: string;
  /** Inline style for advanced effects */
  glowStyle: React.CSSProperties;
}

export function useHoverGlow(
  options: UseHoverGlowOptions = {}
): UseHoverGlowReturn {
  const {
    intensity = 'medium',
    trackMouse = false,
    color = 'cyan',
    activateOnFocus = true,
    onHoverChange,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Glow class mapping
  const glowClasses = {
    cyan: {
      low: 'shadow-glow-cyan',
      medium: 'shadow-glow-cyan-lg',
      high: 'shadow-glow-cyan-xl',
    },
    blue: {
      low: 'shadow-glow-blue',
      medium: 'shadow-glow-blue-lg',
      high: 'shadow-glow-blue-lg',
    },
    purple: {
      low: 'shadow-glow-purple',
      medium: 'shadow-glow-purple',
      high: 'shadow-glow-purple',
    },
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePosition(null);
    onHoverChange?.(false);
  }, [onHoverChange]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!trackMouse) return;

      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [trackMouse]
  );

  const handleFocus = useCallback(() => {
    if (!activateOnFocus) return;
    setIsHovered(true);
    onHoverChange?.(true);
  }, [activateOnFocus, onHoverChange]);

  const handleBlur = useCallback(() => {
    if (!activateOnFocus) return;
    setIsHovered(false);
    onHoverChange?.(false);
  }, [activateOnFocus, onHoverChange]);

  // Compute glow style for advanced effects
  const glowStyle: React.CSSProperties = {};

  if (trackMouse && mousePosition && isHovered && !prefersReducedMotion) {
    // Radial gradient following mouse
    glowStyle.background = `radial-gradient(
      600px circle at ${mousePosition.x}px ${mousePosition.y}px,
      rgba(${color === 'cyan' ? '0, 212, 255' : color === 'blue' ? '43, 108, 176' : '168, 85, 247'}, 0.1),
      transparent 40%
    )`;
  }

  const handlers: UseHoverGlowReturn['handlers'] = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...(trackMouse && { onMouseMove: handleMouseMove }),
    ...(activateOnFocus && {
      onFocus: handleFocus,
      onBlur: handleBlur,
    }),
  };

  return {
    isHovered,
    handlers,
    mousePosition,
    glowClass: glowClasses[color][intensity],
    glowStyle,
  };
}
