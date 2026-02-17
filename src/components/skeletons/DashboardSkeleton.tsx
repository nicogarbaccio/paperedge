import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      {/* Stats grid - 6 Card components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface shadow-sm"
          >
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-36 mt-2" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bets Card */}
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="p-6 pt-0 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-20 mt-2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Notebooks Card */}
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="p-6 pt-0 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-28 mt-1" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-20 mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
