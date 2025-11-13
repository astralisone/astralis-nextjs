import { Card, CardContent } from "@/components/ui/card"

interface RelatedProductsSkeletonProps {
  count?: number
}

export function RelatedProductsSkeleton({ count = 4 }: RelatedProductsSkeletonProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-64 animate-pulse" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-10 w-10 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 w-10 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <Card
              key={index}
              className="glass-card border-white/10 h-full flex flex-col overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="aspect-[16/10] sm:aspect-[4/3] bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative">
                <div className="w-full h-full bg-white/5 animate-pulse" />
                {/* Badge skeletons */}
                <div className="absolute top-3 left-3">
                  <div className="h-6 w-16 bg-purple-600/30 rounded-full animate-pulse" />
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                {/* Category skeleton */}
                <div className="mb-3">
                  <div className="h-5 w-20 bg-white/10 rounded-full animate-pulse" />
                </div>

                {/* Title skeleton */}
                <div className="mb-2 space-y-2">
                  <div className="h-5 bg-white/10 rounded w-full animate-pulse" />
                  <div className="h-5 bg-white/10 rounded w-3/4 animate-pulse" />
                </div>

                {/* Description skeleton */}
                <div className="mb-3 flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                </div>

                {/* Price skeleton */}
                <div className="mb-4">
                  <div className="h-6 bg-white/10 rounded w-16 animate-pulse" />
                </div>

                {/* Action buttons skeleton */}
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-purple-500/20 rounded-lg animate-pulse" />
                  <div className="flex-1 h-8 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-lg animate-pulse" />
                </div>

                {/* View details skeleton */}
                <div className="w-full h-6 bg-white/5 rounded mt-2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
