'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * FloatingIcons Component - Physics-based animation system
 *
 * Performance Notes:
 * - Uses CSS transforms for GPU acceleration
 * - requestAnimationFrame for 60fps animations
 * - Will-change hints for optimized rendering
 * - Intersection Observer for visibility-based animations
 *
 * Accessibility:
 * - prefers-reduced-motion support
 * - Decorative role (aria-hidden)
 * - No interactive elements (purely visual)
 */

interface IconConfig {
  id: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  velocity: { x: number; y: number; rotation: number };
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface FloatingIconsProps {
  /** Icons to animate (JSX elements or icon components) */
  icons?: React.ReactNode[];
  /** Number of icons to generate if none provided */
  count?: number;
  /** Enable parallax effect on scroll */
  enableParallax?: boolean;
  /** Animation speed multiplier */
  speed?: number;
  /** Container className */
  className?: string;
}

export function FloatingIcons({
  icons,
  count = 8,
  enableParallax = true,
  speed = 1,
  className,
}: FloatingIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [iconConfigs, setIconConfigs] = useState<IconConfig[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize icon configurations
  useEffect(() => {
    const defaultIcons = icons || Array(count).fill(null);
    const configs: IconConfig[] = defaultIcons.map((icon, i) => ({
      id: `icon-${i}`,
      icon,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.6 + Math.random() * 0.6,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 0.3 * speed,
        y: (Math.random() - 0.5) * 0.3 * speed,
        rotation: (Math.random() - 0.5) * 0.5 * speed,
      },
      amplitude: 10 + Math.random() * 20,
      frequency: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
    }));
    setIconConfigs(configs);
  }, [icons, count, speed]);

  // Intersection Observer for visibility-based animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isVisible || prefersReducedMotion || iconConfigs.length === 0) {
      return;
    }

    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - startTime;
      startTime = currentTime;

      setIconConfigs((prev) =>
        prev.map((config) => {
          const time = currentTime * 0.001;

          // Smooth floating motion using sine waves
          const floatX = Math.sin(time * config.frequency + config.phase) * config.amplitude;
          const floatY = Math.cos(time * config.frequency * 0.7 + config.phase) * config.amplitude;

          return {
            ...config,
            rotation: config.rotation + config.velocity.rotation * deltaTime * 0.06,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, iconConfigs.length]);

  // Parallax scroll effect
  useEffect(() => {
    if (!enableParallax || prefersReducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = 1 - (rect.top + rect.height / 2) / window.innerHeight;

      containerRef.current.style.setProperty(
        '--scroll-offset',
        `${scrollProgress * 50}px`
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableParallax, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null; // Don't render decorative animations for users who prefer reduced motion
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
      aria-hidden="true"
      role="presentation"
    >
      {iconConfigs.map((config, index) => {
        const time = performance.now() * 0.001;
        const floatX = Math.sin(time * config.frequency + config.phase) * config.amplitude;
        const floatY = Math.cos(time * config.frequency * 0.7 + config.phase) * config.amplitude;

        return (
          <div
            key={config.id}
            className="absolute transition-opacity duration-1000"
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              transform: `translate(${floatX}px, ${floatY}px) rotate(${config.rotation}deg) scale(${config.scale})`,
              opacity: isVisible ? 0.1 + config.scale * 0.2 : 0,
              willChange: 'transform, opacity',
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {config.icon || (
              <div className="w-12 h-12 rounded-lg bg-astralis-blue/10 border border-astralis-blue/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}
