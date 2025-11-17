import { cn } from "@/lib/utils";
import { ReactNode, HTMLAttributes } from "react";

interface StaggeredListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 50,
  ...props
}: StaggeredListProps) {
  return (
    <div className={className} {...props}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * staggerDelay}ms`,
                animationFillMode: "both",
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

interface StaggeredGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  columns?: number;
}

export function StaggeredGrid({
  children,
  className,
  staggerDelay = 40,
  columns = 3,
  ...props
}: StaggeredGridProps) {
  return (
    <div className={className} {...props}>
      {Array.isArray(children)
        ? children.map((child, index) => {
            // Calculate row and column for more natural stagger
            const row = Math.floor(index / columns);
            const col = index % columns;
            const delay = (row * columns + col) * staggerDelay;

            return (
              <div
                key={index}
                className="animate-scale-in"
                style={{
                  animationDelay: `${delay}ms`,
                  animationFillMode: "both",
                }}
              >
                {child}
              </div>
            );
          })
        : children}
    </div>
  );
}
