import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";
import { formatCurrency, formatCurrencyNoCents } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useDailyPL } from "@/hooks/useDailyPL";
import { CreateAccountDialog } from "@/components/tracker/CreateAccountDialog";
import { EditDailyPLDialog } from "@/components/tracker/EditDailyPLDialog";
import { Link } from "react-router-dom";
import EditAccountDialog from "@/components/tracker/EditAccountDialog";
import type { Account } from "@/hooks/useAccounts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrackerSkeleton } from "@/components/skeletons/TrackerSkeleton";

export function TrackerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editDate, setEditDate] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { accounts, createAccount, updateAccount } = useAccounts();
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const monthStart = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );
  const firstDayOffset = monthStart.getDay();
  const gridStart = useMemo(() => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - firstDayOffset);
    return d;
  }, [monthStart, firstDayOffset]);
  const gridEnd = useMemo(() => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + 41);
    return d;
  }, [gridStart]);

  const { byDate, loading, upsertValue, fetchAllTimeTotal, fetchYearTotal } =
    useDailyPL(gridStart, gridEnd);
  const [allTimeTotal, setAllTimeTotal] = useState<number>(0);
  const [yearTotal, setYearTotal] = useState<number>(0);

  useEffect(() => {
    fetchAllTimeTotal()
      .then(setAllTimeTotal)
      .catch(() => setAllTimeTotal(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    fetchYearTotal(year)
      .then(setYearTotal)
      .catch(() => setYearTotal(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear()]);

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

  const monthlyTotal = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const sameMonth = d.getMonth() === currentDate.getMonth();
      if (sameMonth) total += byDate[key]?.total ?? 0;
    }
    return total;
  }, [byDate, gridStart, currentDate]);

  function navigateMonth(dir: "prev" | "next") {
    setCurrentDate((prev) => {
      const n = new Date(prev);
      n.setMonth(n.getMonth() + (dir === "prev" ? -1 : 1));
      return n;
    });
  }

  const days = useMemo(() => {
    const list: Array<{
      date: Date;
      key: string;
      isCurrentMonth: boolean;
      total: number;
    }> = [];
    const start = new Date(gridStart);
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().split("T")[0];
      list.push({
        date: d,
        key,
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        total: byDate[key]?.total ?? 0,
      });
    }
    return list;
  }, [gridStart, currentDate, byDate]);

  async function handleSaveDaily(
    updates: Array<{ accountId: string; amount: number }>
  ) {
    if (!editDate) return;
    await Promise.all(
      updates.map((u) => upsertValue(u.accountId, editDate, u.amount))
    );
    try {
      const [all, ytd] = await Promise.all([
        fetchAllTimeTotal(),
        fetchYearTotal(currentDate.getFullYear()),
      ]);
      setAllTimeTotal(all);
      setYearTotal(ytd);
    } catch {
      // ignore transient errors when refreshing totals
    }
  }

  if (loading) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Bet Tracker
            </h1>
            <TooltipProvider>
              <Tooltip open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="How to use tracker"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full border-2 hover:bg-surface-secondary transition-colors"
                    onClick={() => setIsHelpOpen((v) => !v)}
                  >
                    <HelpCircle className="h-4 w-4 text-text-secondary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-surface border-2 border-border shadow-lg px-4 py-3 max-w-sm">
                  <div className="text-sm leading-relaxed space-y-2">
                    <div className="font-medium text-text-primary">
                      How to use the Bet Tracker
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                      <li>Add accounts (Main/Offshore) to track each book</li>
                      <li>
                        Click a date to enter daily profit/loss per account
                      </li>
                      <li>View totals: Monthly, YTD, and All-time</li>
                      <li>Click an account to see its own calendar</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-text-secondary">
            Track daily P/L across all accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">
              {monthNames[currentDate.getMonth()].toUpperCase()}
            </h2>
            <span className="text-2xl font-light text-text-secondary">
              {currentDate.getFullYear()}
            </span>
            <span
              className={`text-lg font-semibold ${
                monthlyTotal > 0
                  ? "text-profit"
                  : monthlyTotal < 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              {monthlyTotal > 0 ? "+" : ""}
              {formatCurrency(monthlyTotal)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`text-sm font-medium ${
                allTimeTotal > 0
                  ? "text-profit"
                  : allTimeTotal < 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              All-time: {allTimeTotal > 0 ? "+" : ""}
              {formatCurrency(allTimeTotal)}
            </div>
            <div
              className={`text-sm font-medium ${
                yearTotal > 0
                  ? "text-profit"
                  : yearTotal < 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              YTD: {yearTotal > 0 ? "+" : ""}
              {formatCurrency(yearTotal)}
            </div>
            <div className="flex items-center gap-2">
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
        </CardHeader>
        <CardContent>
          {/* Accounts list */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-text-secondary">
                Accounts
              </div>
            </div>
            {accounts.length === 0 ? (
              <div className="text-sm text-text-secondary">
                No accounts yet. Create one to begin tracking.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => (
                  <div key={a.id} className="inline-flex items-center gap-2">
                    <Link
                      to={`/tracker/accounts/${a.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-surface-secondary transition-colors text-sm"
                    >
                      <span className="font-medium">{a.name}</span>
                      <span className="text-xs text-text-secondary capitalize">
                        ({a.kind})
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-text-secondary" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAccount(a);
                        setIsEditAccountOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-lg overflow-hidden border border-border">
            <div className="grid grid-cols-7 border-b border-border bg-surface-secondary">
              {dayNames.map((d) => (
                <div
                  key={d}
                  className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-text-secondary border-r border-border last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((d, idx) => {
                const isRightmost = (idx + 1) % 7 === 0;
                const isBottomRow = idx >= 35;
                const colorBg = d.isCurrentMonth
                  ? d.total !== 0
                    ? d.total > 0
                      ? "bg-profit/10 hover:bg-profit/20"
                      : "bg-loss/10 hover:bg-loss/20"
                    : "bg-surface hover:bg-surface-secondary"
                  : "bg-background";
                return (
                  <div
                    key={d.key}
                    className={`
                      min-w-0 overflow-hidden aspect-square sm:aspect-auto h-16 sm:h-24 w-full p-1 sm:p-2 flex flex-col border-border relative
                      ${!isRightmost ? "border-r" : ""}
                      ${!isBottomRow ? "border-b" : ""}
                      ${colorBg}
                      transition-colors cursor-pointer
                    `}
                    onClick={() => setEditDate(d.key)}
                  >
                    <div
                      className={`text-[10px] sm:text-sm font-medium ${
                        d.isCurrentMonth
                          ? "text-text-primary"
                          : "text-text-secondary opacity-50"
                      }`}
                    >
                      {d.date.getDate()}
                    </div>
                    {d.isCurrentMonth && (
                      <div className="flex-1 flex items-center justify-center">
                        {d.total !== 0 ? (
                          <div
                            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md font-semibold text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis ${
                              d.total > 0
                                ? "bg-profit/15 text-profit"
                                : "bg-loss/15 text-loss"
                            }`}
                          >
                            <span className="sm:hidden">
                              {d.total > 0 ? "+" : ""}
                              {formatCurrencyNoCents(d.total)}
                            </span>
                            <span className="hidden sm:inline">
                              {d.total > 0 ? "+" : ""}
                              {formatCurrency(d.total)}
                            </span>
                          </div>
                        ) : (
                          <div className="hidden sm:flex text-text-secondary text-sm font-bold">
                            {formatCurrency(0)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <CardDescription className="mt-3">
            Click any date to enter or edit per-account daily P/L.
          </CardDescription>
        </CardContent>
      </Card>

      <CreateAccountDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={createAccount}
      />

      <EditDailyPLDialog
        open={!!editDate}
        onOpenChange={(v) => !v && setEditDate(null)}
        date={editDate || ""}
        accounts={accounts}
        valuesForDate={editDate ? byDate[editDate] : undefined}
        onSave={handleSaveDaily}
      />

      <EditAccountDialog
        open={isEditAccountOpen}
        onOpenChange={(v) => {
          setIsEditAccountOpen(v);
          if (!v) setSelectedAccount(null);
        }}
        account={selectedAccount}
        onUpdate={updateAccount}
      />
    </div>
  );
}
