import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "shimmer" | "wave";
}

export function Skeleton({ className, variant = "shimmer" }: SkeletonProps) {
  const variantClasses = {
    default: "animate-pulse bg-surface-secondary/60",
    shimmer: "animate-shimmer bg-gradient-to-r from-surface-secondary/40 via-surface-secondary/60 to-surface-secondary/40 bg-[length:200%_100%]",
    wave: "animate-wave bg-surface-secondary/60",
  };

  return (
    <div
      className={cn(
        "rounded-md",
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
