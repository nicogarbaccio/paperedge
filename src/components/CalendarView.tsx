import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Bet } from "@/hooks/useNotebook";

interface CalendarViewProps {
  bets: Bet[];
}

export function CalendarView({ bets }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
        dailyData[dateKey].profit += bet.return_amount;
      } else if (bet.status === "lost") {
        dailyData[dateKey].profit -= bet.wager_amount;
      }
      // Push and pending bets don't affect P&L
    });

    return dailyData;
  }, [bets]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const wonBets = bets.filter((bet) => bet.status === "won");
    const lostBets = bets.filter((bet) => bet.status === "lost");
    const pushBets = bets.filter((bet) => bet.status === "push");

    const totalProfit = bets.reduce((total, bet) => {
      if (bet.status === "won" && bet.return_amount) {
        return total + bet.return_amount;
      } else if (bet.status === "lost") {
        return total - bet.wager_amount;
      }
      return total;
    }, 0);

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
        profit: dayData?.profit || 0,
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

  const dayNames = ["S", "M", "T", "W", "TH", "F", "S"];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-text-primary">
            {monthNames[currentDate.getMonth()].toUpperCase()}
          </h2>
          <span className="text-2xl font-light text-text-secondary">
            {currentDate.getFullYear()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-surface rounded-lg overflow-hidden border border-border">
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
                className={`
                  h-24 w-full p-2 flex flex-col border-border relative
                  ${!isRightmost ? "border-r" : ""}
                  ${!isBottomRow ? "border-b" : ""}
                  ${
                    day.isCurrentMonth
                      ? day.hasBets
                        ? day.profit > 0
                          ? "bg-profit/10 hover:bg-profit/20"
                          : day.profit < 0
                          ? "bg-loss/10 hover:bg-loss/20"
                          : "bg-surface hover:bg-surface-secondary"
                        : "bg-surface hover:bg-surface-secondary"
                      : "bg-background"
                  }
                  transition-colors cursor-pointer
                `}
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

                {day.hasBets && day.isCurrentMonth && (
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

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <div className="text-sm text-text-secondary mb-1">Record</div>
          <div className="text-2xl font-bold text-text-primary">
            {stats.record}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary mb-1">Profit</div>
          <div
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
