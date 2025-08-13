import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-input pl-3 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            // Hide default calendar icon
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            // Date text styling
            "text-text-primary font-medium cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        />
        {/* Custom calendar icon */}
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none transition-colors" />
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
