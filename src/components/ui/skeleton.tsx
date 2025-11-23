/**
 * Skeleton Loader Component
 *
 * Provides visual feedback during content loading to improve perceived performance.
 * Reduces Cumulative Layout Shift (CLS) by reserving space for loading content.
 *
 * Usage:
 * - Use for lazy-loaded images
 * - Use for dynamically imported components
 * - Use for async content sections
 *
 * Performance Impact:
 * - Improves CLS score by preventing layout shifts
 * - Enhances perceived performance
 * - Better user experience during loading states
 */

import { cn } from '@/lib/utils';

/**
 * Skeleton Props
 *
 * @param className - Additional CSS classes for custom styling
 * @param variant - Visual style of the skeleton (text, circular, rectangular)
 * @param width - Width of the skeleton (number for px, string for other units)
 * @param height - Height of the skeleton (number for px, string for other units)
 * @param animation - Animation type (pulse, wave, none)
 */
interface SkeletonProps {
  className?: string;
  /** Visual style of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width in pixels or CSS units */
  width?: string | number;
  /** Height in pixels or CSS units */
  height?: string | number;
  /** Animation type for the skeleton */
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-slate-200';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
    none: '',
  };

  const inlineStyles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={inlineStyles}
    />
  );
}

/**
 * Pre-built Skeleton Patterns
 */

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('border border-slate-200 rounded-lg p-6 space-y-4', className)}>
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
    </div>
  );
}

export function SkeletonImage({
  aspectRatio = '16/9',
  className
}: {
  aspectRatio?: string;
  className?: string;
}) {
  // Calculate height based on aspect ratio (default 16:9)
  const paddingBottom = aspectRatio === '16/9' ? '56.25%' : aspectRatio === '4/3' ? '75%' : '56.25%';

  return (
    <div className={cn('w-full relative', className)} style={{ paddingBottom }}>
      <Skeleton
        variant="rectangular"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      variant="rectangular"
      className={cn('h-10 w-24', className)}
    />
  );
}

export function SkeletonModal({ className }: { className?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn('relative w-full max-w-2xl bg-white rounded-lg shadow-2xl p-8', className)}>
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="flex gap-3">
            <SkeletonButton className="flex-1" />
            <SkeletonButton className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
