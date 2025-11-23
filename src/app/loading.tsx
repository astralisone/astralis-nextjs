/**
 * Root Loading UI - Displayed during page transitions and suspense boundaries
 *
 * This loading state follows Astralis brand guidelines:
 * - Astralis Blue spinner (#2B6CB0)
 * - Minimal, centered layout
 * - Smooth animations (200ms)
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-astralis-blue"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
