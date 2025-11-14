import { Skeleton } from "@/components/ui/Skeleton";

export function TrackerSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Card wrapper matching TrackerPage */}
      <div className="border border-border rounded-lg p-4 sm:p-6 bg-surface">
        {/* Month header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Accounts section */}
        <div className="mb-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-32" />
            ))}
          </div>
        </div>

        {/* Mobile Layout - Timeline skeleton */}
        <div className="md:hidden bg-surface rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout - Calendar grid skeleton */}
        <div className="hidden md:block">
          {/* Calendar header row */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>

          {/* Calendar grid (6 weeks) */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>

        {/* Footer text */}
        <Skeleton className="h-3 w-64 mt-3" />
      </div>
    </div>
  );
}
