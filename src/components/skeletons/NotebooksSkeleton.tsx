import { Skeleton } from "@/components/ui/Skeleton";

export function NotebooksSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      {/* Header - matches sm:items-end layout */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-80 mt-1" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort dropdown */}
          <Skeleton className="h-10 w-[140px]" />
          {/* New Notebook button */}
          <Skeleton className="h-10 w-36 flex-1 sm:flex-none" />
        </div>
      </div>

      {/* Notebook cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface shadow-sm border-l-4 relative"
            style={{
              boxShadow:
                "2px 2px 8px rgba(0, 0, 0, 0.1), 4px 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* CardHeader with pl-8 */}
            <div className="flex flex-col space-y-1.5 p-6 pb-3 pl-8">
              {/* Title row: color dot + name + P&L */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-16 ml-2 flex-shrink-0" />
              </div>
              {/* Description */}
              <Skeleton className="h-4 w-48" />
            </div>

            {/* CardContent with pl-8 */}
            <div className="p-6 pt-0 pl-8">
              <div className="space-y-3">
                {/* Bankroll row */}
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Performance Metrics - 4 columns */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-10 mx-auto" />
                      <Skeleton className="h-3 w-12 mx-auto mt-1" />
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
