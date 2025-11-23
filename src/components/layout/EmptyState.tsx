import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * EmptyState Component
 *
 * Displays a friendly message when there's no data to show.
 *
 * Features:
 * - Icon, title, and description
 * - Optional primary and secondary actions
 * - Centered layout
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No pipelines yet"
 *   description="Get started by creating your first pipeline"
 *   primaryAction={{
 *     label: "Create Pipeline",
 *     onClick: () => console.log("Create")
 *   }}
 *   secondaryAction={{
 *     label: "Learn More",
 *     href: "/docs"
 *   }}
 * />
 * ```
 */

export interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
          <Icon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-astralis-navy mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {primaryAction && (
            <Button
              variant="primary"
              size="default"
              onClick={primaryAction.onClick}
              asChild={!!primaryAction.href}
            >
              {primaryAction.href ? (
                <a href={primaryAction.href}>{primaryAction.label}</a>
              ) : (
                primaryAction.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="default"
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
