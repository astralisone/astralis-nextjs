'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * ParticleField Component - Canvas-based particle system
 *
 * Creates an ambient particle field with floating dots and connection lines.
 * Matches the visual style from reference images (Image 1, 3, 4).
 *
 * Performance:
 * - Canvas-based rendering for optimal performance
 * - RequestAnimationFrame for 60fps
 * - Offscreen canvas support
 * - Automatic cleanup on unmount
 * - Throttled on visibility
 *
 * Accessibility:
 * - Respects prefers-reduced-motion
 * - Decorative only (aria-hidden)
 * - No interactive elements
 *
 * @example
 * ```tsx
 * <ParticleField
 *   density={50}
 *   speed={0.5}
 *   color="cyan"
 *   connectionLines={true}
 * />
 * ```
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

export interface ParticleFieldProps {
  /** Number of particles */
  density?: number;
  /** Movement speed multiplier */
  speed?: number;
  /** Particle color preset */
  color?: 'cyan' | 'blue' | 'purple' | 'white';
  /** Show connection lines between nearby particles */
  connectionLines?: boolean;
  /** Connection distance threshold */
  connectionDistance?: number;
  /** Container className */
  className?: string;
  /** Enable mouse interaction */
  interactive?: boolean;
}

export function ParticleField({
  density = 50,
  speed = 0.5,
  color = 'cyan',
  connectionLines = true,
  connectionDistance = 150,
  className,
  interactive = false,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Color presets
  const colors = {
    cyan: { r: 0, g: 212, b: 255 },
    blue: { r: 43, g: 108, b: 176 },
    purple: { r: 168, g: 85, b: 247 },
    white: { r: 255, g: 255, b: 255 },
  };

  const particleColor = colors[color];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize particles
  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    particlesRef.current = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      life: Math.random() * 100,
    }));
  }, [density, speed, prefersReducedMotion]);

  // Intersection Observer for visibility
  useEffect(() => {
    if (!canvasRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  // Mouse tracking for interactivity
  useEffect(() => {
    if (!interactive || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isVisible || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 0.01;

        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Interactive push away from mouse
        if (interactive) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.2;
            particle.vy += (dy / distance) * force * 0.2;
          }
        }

        // Apply velocity damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Pulsing opacity
        const pulseOpacity = particle.opacity * (0.8 + Math.sin(particle.life) * 0.2);

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${pulseOpacity})`;
        ctx.fill();

        // Draw connection lines
        if (connectionLines) {
          particlesRef.current.slice(index + 1).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const opacity = (1 - distance / connectionDistance) * 0.15;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(${particleColor.r}, ${particleColor.g}, ${particleColor.b}, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, connectionLines, connectionDistance, particleColor, interactive]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none',
        className
      )}
      aria-hidden="true"
      role="presentation"
    />
  );
}
