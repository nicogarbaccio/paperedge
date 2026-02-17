import { Skeleton } from "@/components/ui/Skeleton";

export function NotebookDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      {/* Header - responsive layout with back link and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Back to Notebooks link */}
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center space-x-2">
          {/* Edit Notebook button */}
          <Skeleton className="h-9 w-32" />
          {/* Duplicate button */}
          <Skeleton className="h-9 w-28" />
          {/* Delete button */}
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Notebook Info Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        {/* CardHeader */}
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div>
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-72 mt-1" />
            </div>
          </div>
        </div>
        {/* CardContent - 5 stats in grid-cols-2 sm:grid-cols-5 */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle + Add Bet button row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Betting History Card */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        {/* CardHeader */}
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        {/* CardContent - bet rows */}
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col space-y-3 p-4 border border-border rounded-lg"
              >
                {/* Description + status */}
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
                {/* Stats grid - 4 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-10 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
