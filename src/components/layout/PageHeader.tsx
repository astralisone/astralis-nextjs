import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageHeader Component
 *
 * Reusable header for dashboard pages following Astralis design system.
 *
 * Features:
 * - Title and optional description
 * - Action buttons area (aligned right)
 * - Responsive layout
 * - Consistent spacing
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Pipelines"
 *   description="Manage your workflow pipelines and stages"
 *   actions={
 *     <Button variant="primary">
 *       <Plus className=" ui-icon w-5 h-5" />
 *       New Pipeline
 *     </Button>
 *   }
 * />
 * ```
 */

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action buttons or controls */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-astralis-navy sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
