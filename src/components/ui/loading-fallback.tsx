import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

interface LoadingFallbackProps {
  className?: string
  variant?: 'default' | 'card' | 'form' | 'dashboard' | 'minimal'
}

export function LoadingFallback({ className, variant = 'default' }: LoadingFallbackProps) {
  const variants = {
    default: (
      <div className={cn("animate-pulse space-y-4 p-6", className)}>
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    ),
    card: (
      <div className={cn("rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4", className)}>
        <div className="animate-pulse">
          <Skeleton className="h-48 w-full rounded-md mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    ),
    form: (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="animate-pulse">
          <Skeleton className="h-8 w-1/3 mb-6" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 mb-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    ),
    dashboard: (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="p-4 border-b border-white/10">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="divide-y divide-white/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    minimal: (
      <div className={cn("flex items-center justify-center p-12", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return variants[variant]
}

// Specialized loading components for specific use cases
export function TableLoadingSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="animate-pulse">
        <div className="p-4 border-b border-white/10">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="divide-y divide-white/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartLoadingSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full rounded" />
        <div className="flex justify-center gap-6 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProductGridLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="animate-pulse">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}