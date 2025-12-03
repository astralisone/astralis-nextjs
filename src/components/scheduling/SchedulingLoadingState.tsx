import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * SchedulingLoadingState Component
 *
 * Loading skeleton for the scheduling page that displays a placeholder
 * for the calendar view and upcoming events sidebar.
 *
 * Design:
 * - Left column (2/3 width): Large calendar skeleton
 * - Right column (1/3 width): List of event card skeletons
 * - Matches the layout structure of the main scheduling page
 *
 * Usage:
 * ```tsx
 * {loading && <SchedulingLoadingState />}
 * ```
 */
export function SchedulingLoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full mb-3" />
          ))}
        </Card>
      </div>
    </div>
  );
}
