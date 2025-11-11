import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./Calendar";

export interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  "data-testid"?: string;
}

const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(
  (
    { className, value, onChange, id, disabled, placeholder, ...props },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      value ? new Date(value + 'T00:00:00') : undefined
    );

    useEffect(() => {
      if (value) {
        // Parse date with explicit time to avoid timezone issues
        const newDate = new Date(value + 'T00:00:00');
        setSelectedDate(newDate);
      } else {
        setSelectedDate(undefined);
      }
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
      if (date) {
        setSelectedDate(date);
        // Format as YYYY-MM-DD for input value
        const formatted = format(date, "yyyy-MM-dd");
        onChange?.(formatted);
        setIsOpen(false);
      }
    };

    const displayValue = selectedDate
      ? format(selectedDate, "MM/dd/yyyy")
      : placeholder || "Select date";

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          id={id}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            "text-text-primary font-medium cursor-pointer hover:bg-surface-secondary/50 transition-colors",
            className
          )}
        >
          <span>{displayValue}</span>
          <CalendarIcon className="h-4 w-4 text-text-secondary" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            {/* Calendar Popover */}
            <div className="absolute z-50 mt-2 rounded-lg border border-border bg-surface shadow-xl animate-in fade-in-0 zoom-in-95 min-w-[320px]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                initialFocus
              />
              <div className="border-t border-border p-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(undefined);
                    onChange?.("");
                    setIsOpen(false);
                  }}
                  className="flex-1 text-sm px-4 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    onChange?.(format(today, "yyyy-MM-dd"));
                    setIsOpen(false);
                  }}
                  className="flex-1 text-sm px-4 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
                >
                  Today
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
