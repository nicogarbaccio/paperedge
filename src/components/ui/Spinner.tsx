import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "accent" | "subtle";
}

export function Spinner({ className, size = "md", variant = "default" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const variantClasses = {
    default: "text-text-primary",
    accent: "text-accent",
    subtle: "text-text-secondary",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Loading"
    />
  );
}

interface LoadingOverlayProps {
  className?: string;
  message?: string;
}

export function LoadingOverlay({ className, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Spinner size="lg" variant="accent" />
      {message && (
        <p className="text-text-secondary text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
      <LoadingOverlay message={message} />
    </div>
  );
}
