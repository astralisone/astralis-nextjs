'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * OrbitalIcons Component - Icons orbiting around a center point
 *
 * Creates orbital animation matching Image 1 (central AI ring with orbiting tech icons).
 *
 * Features:
 * - Circular orbital paths
 * - Staggered start positions
 * - Configurable speed and radius
 * - Glow effects on hover
 * - Center content support
 *
 * Performance:
 * - CSS transforms for GPU acceleration
 * - Intersection Observer for visibility
 * - Reduced motion support
 *
 * @example
 * ```tsx
 * <OrbitalIcons
 *   icons={[Search, Settings, Zap, Shield, Database, Cloud, Lock, Globe]}
 *   radius={200}
 *   speed="slow"
 *   glowOnHover={true}
 * >
 *   <div className="text-2xl font-bold">AI</div>
 * </OrbitalIcons>
 * ```
 */

export interface OrbitalIcon {
  /** Icon component */
  Icon: LucideIcon;
  /** Icon label (for accessibility) */
  label: string;
  /** Custom color class */
  className?: string;
}

export interface OrbitalIconsProps {
  /** Icons to orbit (can be LucideIcon components or OrbitalIcon objects) */
  icons: (LucideIcon | OrbitalIcon)[];
  /** Orbit radius in pixels */
  radius?: number;
  /** Animation speed */
  speed?: 'slow' | 'medium' | 'fast' | number;
  /** Glow effect on hover */
  glowOnHover?: boolean;
  /** Center content */
  children?: React.ReactNode;
  /** Container className */
  className?: string;
  /** Icon size */
  iconSize?: number;
  /** Reverse orbit direction */
  reverse?: boolean;
}

export function OrbitalIcons({
  icons,
  radius = 200,
  speed = 'slow',
  glowOnHover = true,
  children,
  className,
  iconSize = 24,
  reverse = false,
}: OrbitalIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Speed to duration mapping (in seconds)
  const speedToDuration = {
    slow: 30,
    medium: 20,
    fast: 10,
  };

  const duration =
    typeof speed === 'number' ? speed : speedToDuration[speed];

  // Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Normalize icons to OrbitalIcon objects
  const normalizedIcons: OrbitalIcon[] = icons.map((icon, index) => {
    if (typeof icon === 'function') {
      return {
        Icon: icon,
        label: `Icon ${index + 1}`,
        className: undefined,
      };
    }
    return icon;
  });

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center',
        className
      )}
      style={{
        width: (radius * 2) + 100,
        height: (radius * 2) + 100,
      }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Orbiting icons */}
      {normalizedIcons.map((iconData, index) => {
        const Icon = iconData.Icon;
        const angleOffset = (360 / normalizedIcons.length) * index;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            className={cn(
              'absolute inset-0 flex items-center justify-center pointer-events-none',
              isVisible && 'animate-orbit'
            )}
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${-(duration / normalizedIcons.length) * index}s`,
              animationDirection: reverse ? 'reverse' : 'normal',
              transformOrigin: 'center center',
              // Initial rotation to position icons evenly
              transform: `rotate(${angleOffset}deg)`,
            }}
          >
            <div
              className={cn(
                'absolute flex items-center justify-center rounded-full p-3 transition-all duration-300 pointer-events-auto cursor-pointer',
                'bg-astralis-navy/80 backdrop-blur-sm border-2 border-astralis-cyan/30',
                isHovered && glowOnHover && 'shadow-glow-cyan-lg scale-125',
                iconData.className
              )}
              style={{
                transform: `translateX(${radius}px) rotate(-${angleOffset}deg)`,
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${index * 100}ms`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={iconData.label}
            >
              <Icon
                size={iconSize}
                className={cn(
                  'text-astralis-cyan transition-all duration-300',
                  isHovered && 'animate-pulse-glow'
                )}
              />
            </div>
          </div>
        );
      })}

      {/* Center content */}
      {children && (
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
