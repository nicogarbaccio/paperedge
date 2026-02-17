import { Skeleton } from "@/components/ui/Skeleton";

export function TrackerSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-5 w-56 mt-1" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Card wrapper */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        {/* CardHeader - month nav + totals */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-end sm:items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-row items-center gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* CardContent */}
        <div className="p-6 pt-0">
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
                <div
                  key={i}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Layout - Calendar grid with borders (no gaps) */}
          <div className="hidden md:block bg-surface rounded-lg overflow-hidden border border-border">
            {/* Calendar header row */}
            <div className="grid grid-cols-7 border-b border-border bg-surface-secondary">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2 sm:p-3 text-center border-r border-border last:border-r-0"
                >
                  <Skeleton className="h-4 w-6 mx-auto" />
                </div>
              ))}
            </div>

            {/* Calendar grid (6 weeks x 7 days) */}
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }).map((_, i) => {
                const isRightmost = (i + 1) % 7 === 0;
                const isBottomRow = i >= 35;
                return (
                  <div
                    key={i}
                    className={`h-16 sm:h-24 p-1 sm:p-2 flex flex-col border-border ${
                      !isRightmost ? "border-r" : ""
                    } ${!isBottomRow ? "border-b" : ""}`}
                  >
                    <Skeleton className="h-3 w-5 mb-1" />
                    <div className="flex-1 flex items-center justify-center">
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer text */}
          <Skeleton className="h-3 w-64 mt-3" />
        </div>
      </div>
    </div>
  );
}
