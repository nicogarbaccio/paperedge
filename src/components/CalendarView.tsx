import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { calculateTotalPL } from "@/lib/betting";
import type { Bet } from "@/hooks/useNotebook";

interface CalendarViewProps {
  bets: Bet[];
  onDayClick?: (dateKey: string, bets: Bet[], profit: number) => void;
}

export function CalendarView({ bets, onDayClick }: CalendarViewProps) {
  // Initialize calendar to show the month of the most recent bet, or current month if no bets
  const [currentDate, setCurrentDate] = useState(() => {
    if (bets.length === 0) {
      return new Date(); // Fall back to current month if no bets
    }

    // Find the most recent bet by date
    const mostRecentBet = bets.reduce((latest, bet) => {
      return bet.date > latest.date ? bet : latest;
    });

    // Parse the bet date and set calendar to that month
    const dateParts = mostRecentBet.date.split("-");
    if (dateParts.length < 2) {
      return new Date(); // Invalid date format, fall back to current month
    }
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return new Date(); // Invalid date values, fall back to current month
    }
    return new Date(year, month - 1); // month is 0-indexed in JavaScript
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Update calendar month when bets change (e.g., switching notebooks)
  useEffect(() => {
    if (bets.length === 0) {
      setCurrentDate(new Date()); // Reset to current month if no bets
      return;
    }

    // Find the most recent bet by date
    const mostRecentBet = bets.reduce((latest, bet) => {
      return bet.date > latest.date ? bet : latest;
    });

    // Parse the bet date and set calendar to that month
    const dateParts = mostRecentBet.date.split("-");
    if (dateParts.length < 2) {
      return; // Invalid date format, don't update
    }
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return; // Invalid date values, don't update
    }
    const newDate = new Date(year, month - 1); // month is 0-indexed in JavaScript

    // Always update to the most recent bet's month when bets change
    setCurrentDate(newDate);
  }, [bets]);

  // Calculate daily P&L from bets
  const dailyPL = useMemo(() => {
    const dailyData: Record<string, { profit: number; bets: Bet[] }> = {};

    bets.forEach((bet) => {
      const dateKey = bet.date; // Assuming bet.date is in YYYY-MM-DD format

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { profit: 0, bets: [] };
      }

      dailyData[dateKey].bets.push(bet);

      if (bet.status === "won" && bet.return_amount) {
        dailyData[dateKey].profit += bet.return_amount; // return_amount now stores profit only
      } else if (bet.status === "lost") {
        dailyData[dateKey].profit -= bet.wager_amount;
      }
      // Push and pending bets don't affect P&L
    });

    // Round all profits to 2 decimal places to avoid floating point precision issues
    Object.keys(dailyData).forEach(dateKey => {
      dailyData[dateKey].profit = Math.round(dailyData[dateKey].profit * 100) / 100;
    });

    return dailyData;
  }, [bets]);

  // Calculate monthly profit for current month
  const monthlyProfit = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Filter bets for the current month
    const monthBets = bets.filter((bet) => {
      // Parse date without timezone conversion by splitting the date string
      const dateParts = bet.date.split("-");
      if (dateParts.length < 2) {
        return false; // Invalid date format, exclude from filter
      }
      const betYear = parseInt(dateParts[0], 10);
      const betMonth = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JavaScript

      if (isNaN(betYear) || isNaN(betMonth)) {
        return false; // Invalid date values, exclude from filter
      }

      return betYear === year && betMonth === month;
    });

    return calculateTotalPL(monthBets);
  }, [bets, currentDate]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const wonBets = bets.filter((bet) => bet.status === "won");
    const lostBets = bets.filter((bet) => bet.status === "lost");
    const pushBets = bets.filter((bet) => bet.status === "push");

    const totalProfit = calculateTotalPL(bets);

    return {
      record: `${wonBets.length}-${lostBets.length}-${pushBets.length}`,
      profit: totalProfit,
    };
  }, [bets]);

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentCalendarDay = new Date(startDate);

    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const dateKey = currentCalendarDay.toISOString().split("T")[0];
      const dayData = dailyPL[dateKey];
      const isCurrentMonth = currentCalendarDay.getMonth() === month;

      days.push({
        date: new Date(currentCalendarDay),
        dateKey,
        day: currentCalendarDay.getDate(),
        profit: dayData?.profit ?? null,
        hasBets: !!dayData,
        isCurrentMonth,
      });

      currentCalendarDay.setDate(currentCalendarDay.getDate() + 1);
    }

    return days;
  }, [currentDate, dailyPL]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const dayNames = ["SU", "M", "T", "W", "TH", "F", "SA"];

  return (
    <div className="space-y-6" data-testid="calendar-view">
      {/* Month Navigation */}
      <div className="flex items-center justify-between" data-testid="calendar-month-navigation">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-text-primary" data-testid="calendar-current-month">
              {monthNames[currentDate.getMonth()].toUpperCase()}
            </h2>
            <span className="text-2xl font-light text-text-secondary" data-testid="calendar-current-year">
              {currentDate.getFullYear()}
            </span>
            {/* Monthly Profit Display */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">•</span>
              <span
                data-testid="calendar-monthly-profit"
                className={`text-lg font-semibold whitespace-nowrap ${
                  monthlyProfit > 0
                    ? "text-profit"
                    : monthlyProfit < 0
                    ? "text-loss"
                    : "text-text-secondary"
                }`}
              >
                {monthlyProfit > 0 ? "+" : ""}
                {formatCurrency(monthlyProfit)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 p-0"
            data-testid="calendar-prev-month-button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 p-0"
            data-testid="calendar-next-month-button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Show "Go to current month" button when viewing a different month */}
          {(() => {
            const now = new Date();
            const isCurrentMonth =
              currentDate.getMonth() === now.getMonth() &&
              currentDate.getFullYear() === now.getFullYear();

            if (!isCurrentMonth) {
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="h-8 px-3 text-xs"
                  data-testid="calendar-today-button"
                >
                  Today
                </Button>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-surface rounded-lg overflow-hidden border border-border">
        {/* Mobile/Tablet Layout - Pikkit-style Grid Calendar */}
        <div className="lg:hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-secondary">
            {dayNames.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarData.map((day, index) => {
              const isRightmost = (index + 1) % 7 === 0;
              const isBottomRow = index >= 35;

              const hasPL = day.hasBets && day.isCurrentMonth && day.profit !== null;
              const bgColor = hasPL
                ? day.profit > 0
                  ? "bg-profit/15"
                  : day.profit < 0
                  ? "bg-loss/15"
                  : "bg-surface"
                : day.isCurrentMonth
                ? "bg-surface"
                : "bg-background";

              const valueColor = hasPL
                ? day.profit > 0
                  ? "text-profit"
                  : day.profit < 0
                  ? "text-loss"
                  : "text-text-secondary"
                : "";

              return (
                <div
                  key={index}
                  data-testid="calendar-day-cell"
                  data-date={day.dateKey}
                  data-has-bets={day.hasBets}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-0.5 relative
                    ${!isRightmost ? "border-r border-border" : ""}
                    ${!isBottomRow ? "border-b border-border" : ""}
                    ${bgColor}
                    transition-colors
                    ${day.isCurrentMonth ? "cursor-pointer active:opacity-70" : ""}
                  `}
                  onClick={() => {
                    if (day.isCurrentMonth && onDayClick) {
                      const dayBets = dailyPL[day.dateKey]?.bets || [];
                      const dayProfit = day.profit ?? 0;
                      onDayClick(day.dateKey, dayBets, dayProfit);
                    }
                  }}
                >
                  <span
                    className={`text-xs font-semibold leading-none ${
                      day.isCurrentMonth
                        ? "text-text-primary"
                        : "text-text-secondary/30"
                    }`}
                  >
                    {day.day}
                  </span>
                  {hasPL && day.profit !== null && (
                    <span
                      className={`text-[10px] sm:text-xs font-bold leading-tight mt-0.5 whitespace-nowrap ${valueColor}`}
                    >
                      {day.profit > 0 ? "+" : ""}
                      {formatCurrencyCompact(day.profit)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Layout - Calendar Grid */}
        <div className="hidden lg:block">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-surface-secondary">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-text-secondary border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarData.map((day, index) => {
              const isRightmost = (index + 1) % 7 === 0;
              const isBottomRow = index >= 35; // Last row

              return (
                <div
                  key={index}
                  data-testid="calendar-day-cell"
                  data-date={day.dateKey}
                  data-has-bets={day.hasBets}
                  className={`
                    h-24 w-full p-2 flex flex-col border-border relative
                    ${!isRightmost ? "border-r" : ""}
                    ${!isBottomRow ? "border-b" : ""}
                    ${
                      day.isCurrentMonth
                        ? day.hasBets && day.profit !== null
                          ? day.profit > 0
                            ? "bg-profit/10 hover:bg-profit/20"
                            : day.profit < 0
                            ? "bg-loss/10 hover:bg-loss/20"
                            : "bg-surface hover:bg-surface-secondary"
                          : "bg-surface hover:bg-surface-secondary"
                        : "bg-background"
                    }
                    transition-colors ${day.isCurrentMonth ? "cursor-pointer" : ""}
                  `}
                  onClick={() => {
                    if (day.isCurrentMonth && onDayClick) {
                      const dayBets = dailyPL[day.dateKey]?.bets || [];
                      const dayProfit = day.profit ?? 0;
                      onDayClick(day.dateKey, dayBets, dayProfit);
                    }
                  }}
                >
                  <div
                    className={`
                    text-sm font-medium
                    ${
                      day.isCurrentMonth
                        ? "text-text-primary"
                        : "text-text-secondary opacity-50"
                    }
                  `}
                  >
                    {day.day}
                  </div>

                  {day.hasBets && day.isCurrentMonth && day.profit !== null && (
                    <div className="flex-1 flex items-center justify-center">
                      <div
                        className={`
                        text-sm font-bold text-center
                        ${
                          day.profit > 0
                            ? "text-profit"
                            : day.profit < 0
                            ? "text-loss"
                            : "text-text-secondary"
                        }
                      `}
                      >
                        {day.profit > 0 ? "+" : ""}
                        {formatCurrency(day.profit)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-border" data-testid="calendar-summary-stats">
        <div>
          <div className="text-sm text-text-secondary mb-1">Record</div>
          <div className="text-2xl font-bold text-text-primary" data-testid="calendar-record">
            {stats.record}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary mb-1">Profit</div>
          <div
            data-testid="calendar-total-profit"
            className={`
            text-2xl font-bold
            ${
              stats.profit > 0
                ? "text-profit"
                : stats.profit < 0
                ? "text-loss"
                : "text-text-secondary"
            }
          `}
          >
            {stats.profit > 0 ? "+" : ""}
            {formatCurrency(stats.profit)}
          </div>
        </div>
      </div>
    </div>
  );
}
