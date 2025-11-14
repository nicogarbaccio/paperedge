import { Skeleton } from "@/components/ui/Skeleton";

export function NotebookDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-10" />
          </div>
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-surface rounded-lg w-fit">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Body section placeholder */}
      <div className="p-4 border border-border rounded-lg">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
