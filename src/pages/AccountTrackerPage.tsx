import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAccount, useAccounts, getAccountKindLabel } from "@/hooks/useAccounts";
import { useDailyPL } from "@/hooks/useDailyPL";
import { EditDailyPLDialog } from "@/components/tracker/EditDailyPLDialog";
import EditAccountDialog from "@/components/tracker/EditAccountDialog";
import { AccountTrackerSkeleton } from "@/components/skeletons/AccountTrackerSkeleton";
import { useToast } from "@/hooks/useToast";

export function AccountTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    account,
    loading: accountLoading,
    error: accountError,
    refetch,
  } = useAccount(id || null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [editDate, setEditDate] = useState<string | null>(null);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const { updateAccount, deleteAccount } = useAccounts();

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

  const {
    byDate,
    loading: plLoading,
    initialized: plInitialized,
    isFetching: plIsFetching,
    prefetchRange,
    upsertValue,
    fetchAllTimeTotal,
    fetchYearTotal,
  } = useDailyPL(gridStart, gridEnd, id || undefined);
  const [allTimeTotal, setAllTimeTotal] = useState<number>(0);
  const [yearTotal, setYearTotal] = useState<number>(0);

  useEffect(() => {
    if (id) {
      fetchAllTimeTotal(id)
        .then(setAllTimeTotal)
        .catch(() => setAllTimeTotal(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id) {
      const year = currentDate.getFullYear();
      fetchYearTotal(year, id)
        .then(setYearTotal)
        .catch(() => setYearTotal(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentDate.getFullYear()]);

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

  // Prefetch adjacent months when currentDate changes
  useEffect(() => {
    if (!id) return;
    const makeRange = (d: Date) => {
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const firstDayOffset = monthStart.getDay();
      const start = new Date(monthStart);
      start.setDate(start.getDate() - firstDayOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 41);
      return { start, end };
    };
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const { start: prevStart, end: prevEnd } = makeRange(prevDate);
    const { start: nextStart, end: nextEnd } = makeRange(nextDate);
    prefetchRange(prevStart, prevEnd, id);
    prefetchRange(nextStart, nextEnd, id);
  }, [currentDate, id, prefetchRange]);

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
    updates: Array<{
      accountId: string;
      amount: number;
      casinoData?: {
        deposited_usd?: number | null;
        withdrew_usd?: number | null;
        in_casino?: number | null;
        usd_value?: number | null;
        tokens_received?: string | null;
        deposit_method?: string | null;
        casino_name?: string | null;
        note?: string | null;
      };
    }>
  ) {
    if (!editDate || !id) return;
    // Only save for this account id
    const target = updates.find((u) => u.accountId === id);
    if (target) {
      await upsertValue(id, editDate, target.amount, target.casinoData);
      try {
        const [all, ytd] = await Promise.all([
          fetchAllTimeTotal(id),
          fetchYearTotal(currentDate.getFullYear(), id),
        ]);
        setAllTimeTotal(all);
        setYearTotal(ytd);
      } catch {
        // ignore transient errors when refreshing totals
      }
    }
  }

  async function handleDeleteAccount(accountId: string) {
    try {
      await deleteAccount(accountId);
      toast({
        title: "Account deleted",
        description:
          "The account and all associated daily P/L records have been deleted.",
        variant: "success",
      });
      navigate("/tracker");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  }

  if (accountLoading || !plInitialized || plLoading) {
    return <AccountTrackerSkeleton />;
  }
  if (accountError || !account) {
    return <div className="text-loss">Account not found or error loading.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <Link
            to="/tracker"
            className="text-xs text-text-secondary hover:text-text-primary inline-flex items-center"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Link>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary">
              {account.name}
            </h1>
            <span className="text-sm text-text-secondary">
              {getAccountKindLabel(account.kind)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditAccountOpen(true)}
            >
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-1 rounded-md text-sm font-medium border ${
                yearTotal > 0
                  ? "text-profit border-profit/30"
                  : yearTotal < 0
                  ? "text-loss border-loss/30"
                  : "text-text-secondary border-border"
              }`}
            >
              YTD: {yearTotal > 0 ? "+" : ""}
              {formatCurrency(yearTotal)}
            </div>
            <div
              className={`px-2 py-1 rounded-md text-sm font-medium border ${
                allTimeTotal > 0
                  ? "text-profit border-profit/30"
                  : allTimeTotal < 0
                  ? "text-loss border-loss/30"
                  : "text-text-secondary border-border"
              }`}
            >
              All-time: {allTimeTotal > 0 ? "+" : ""}
              {formatCurrency(allTimeTotal)}
            </div>
          </div>
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
              } ${plIsFetching ? "opacity-80" : ""}`}
            >
              {monthlyTotal > 0 ? "+" : ""}
              {formatCurrency(monthlyTotal)}
            </span>
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
            {plIsFetching && (
              <div className="ml-1 inline-flex items-center text-text-secondary text-xs">
                <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-border border-t-transparent" />
                Updating
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Layout - Timeline View */}
          <div
            className={`md:hidden bg-surface rounded-lg border border-border overflow-hidden ${
              plIsFetching ? "opacity-80" : ""
            }`}
          >
            <div className="divide-y divide-border">
              {days
                .filter((d) => d.isCurrentMonth)
                .map((d) => {
                  const valueColor =
                    d.total > 0
                      ? "text-profit"
                      : d.total < 0
                      ? "text-loss"
                      : "text-text-secondary";

                  const bgColor =
                    d.total !== 0
                      ? d.total > 0
                        ? "bg-profit/5"
                        : "bg-loss/5"
                      : "";

                  return (
                    <div
                      key={d.key}
                      className={`p-4 cursor-pointer hover:bg-surface-secondary transition-colors ${bgColor}`}
                      onClick={() => setEditDate(d.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold text-text-primary">
                            {d.date.getDate()}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {d.date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                        </div>
                        <div className={`text-base font-bold ${valueColor}`}>
                          {d.total > 0 ? "+" : ""}
                          {formatCurrency(d.total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Desktop Layout - Calendar Grid */}
          <div
            className={`hidden md:block bg-surface rounded-lg overflow-hidden border border-border ${
              plIsFetching ? "opacity-80" : ""
            }`}
          >
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
                const valueColor =
                  d.total > 0
                    ? "text-profit"
                    : d.total < 0
                    ? "text-loss"
                    : "text-text-secondary";
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
                        <div
                          className={`text-[10px] sm:text-xs md:text-sm lg:text-base font-bold leading-tight ${valueColor}`}
                        >
                          {d.total > 0 ? "+" : ""}
                          {formatCurrency(d.total)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <CardDescription className="mt-3">
            Click any date to enter or edit P/L for this account.
          </CardDescription>
        </CardContent>
      </Card>

      <EditDailyPLDialog
        open={!!editDate}
        onOpenChange={(v) => !v && setEditDate(null)}
        date={editDate || ""}
        accounts={account ? [account] : []}
        valuesForDate={editDate ? byDate[editDate] : undefined}
        onSave={handleSaveDaily}
      />

      <EditAccountDialog
        open={isEditAccountOpen}
        onOpenChange={(v) => setIsEditAccountOpen(v)}
        account={account}
        onUpdate={async (accId, updates) => {
          await updateAccount(accId, updates);
          await refetch();
        }}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}

export default AccountTrackerPage;
