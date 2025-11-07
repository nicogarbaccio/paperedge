import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        month_caption: "flex justify-center items-center pt-1 pb-4 px-2 relative",
        caption_label: "text-base font-semibold text-text-primary",
        nav: "flex items-center gap-1 absolute right-2",
        button_previous: cn(
          "h-8 w-8 bg-transparent p-0 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary transition-colors hover:text-text-primary"
        ),
        button_next: cn(
          "h-8 w-8 bg-transparent p-0 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary transition-colors hover:text-text-primary"
        ),
        month_grid: "w-full border-collapse table-fixed",
        weekdays: "",
        weekday:
          "text-text-secondary font-medium text-xs uppercase text-center pb-2",
        week: "",
        day: "text-center p-0 relative",
        day_button: cn(
          "h-10 w-10 mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-surface-secondary hover:text-text-primary rounded-md transition-all inline-flex items-center justify-center cursor-pointer"
        ),
        range_end: "day-range-end",
        selected:
          "bg-accent text-white hover:bg-accent/90 hover:text-white focus:bg-accent focus:text-white font-semibold",
        today:
          "bg-surface-secondary text-text-primary font-semibold ring-1 ring-accent/50",
        outside: "text-text-secondary/40 hover:bg-surface-secondary/50",
        disabled:
          "text-text-secondary/30 hover:bg-transparent cursor-not-allowed",
        range_middle:
          "aria-selected:bg-surface-secondary aria-selected:text-text-primary",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
