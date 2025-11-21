import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageContainer Component
 *
 * Main content container for dashboard pages with consistent padding and spacing.
 *
 * Features:
 * - Responsive padding (mobile, tablet, desktop)
 * - Max-width constraint for readability
 * - Consistent spacing between sections
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <div className="grid gap-6">
 *     <Card>Content</Card>
 *   </div>
 * </PageContainer>
 * ```
 */

export interface PageContainerProps {
  /** Content to render inside the container */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Maximum width variant */
  maxWidth?: 'default' | 'full' | 'narrow';
}

const maxWidthVariants = {
  default: 'max-w-7xl',
  full: 'max-w-full',
  narrow: 'max-w-5xl',
};

export function PageContainer({
  children,
  className,
  maxWidth = 'default',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8',
        maxWidthVariants[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
