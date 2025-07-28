import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getStatusColorClass,
  cn,
} from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { Loader2 } from "lucide-react";

export function DashboardPage() {
  const { stats, recentBets, topNotebooks, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-loss mb-2">Error loading dashboard</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          Overview of your paper trading performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBets}</div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0
                ? "No bets placed yet"
                : "Across all notebooks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.winRate >= 55
                  ? "text-profit"
                  : stats.winRate >= 45
                  ? "text-pending"
                  : stats.winRate > 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              {formatPercentage(stats.winRate)}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0
                ? "Start placing bets to track"
                : "Of completed bets"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalPL > 0
                  ? "text-profit"
                  : stats.totalPL < 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              {stats.totalPL > 0 ? "+" : ""}
              {formatCurrency(stats.totalPL)}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0 ? "No profit/loss yet" : "Net profit/loss"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.roi > 0
                  ? "text-profit"
                  : stats.roi < 0
                  ? "text-loss"
                  : "text-text-secondary"
              }`}
            >
              {formatPercentage(stats.roi)}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0
                ? "No ROI calculated yet"
                : "Return on investment"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Notebooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeNotebooks}</div>
            <p className="text-xs text-text-secondary">
              {stats.activeNotebooks === 0
                ? "Create your first notebook"
                : "Tracking strategies"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pending">
              {stats.pendingBets}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.pendingBets === 0 ? "No pending bets" : "Awaiting results"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bets</CardTitle>
            <CardDescription>Your latest betting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">No recent bets</p>
                <p className="text-xs text-text-secondary mt-1">
                  Start adding bets to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{bet.description}</p>
                      <p className="text-xs text-text-secondary">
                        {bet.odds > 0 ? "+" : ""}
                        {bet.odds} • {formatDate(bet.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${getStatusColorClass(
                          bet.status
                        )}`}
                      >
                        {bet.status.charAt(0).toUpperCase() +
                          bet.status.slice(1)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {bet.status === "won" && bet.return_amount
                          ? `+${formatCurrency(bet.return_amount)}`
                          : bet.status === "lost"
                          ? `-${formatCurrency(bet.wager_amount)}`
                          : formatCurrency(bet.wager_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Notebooks</CardTitle>
            <CardDescription>Your best strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {topNotebooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">
                  No notebooks with bets yet
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Create a notebook and start betting
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topNotebooks.map((notebook) => {
                  const colorClasses = getNotebookColorClasses(notebook.color);
                  return (
                    <div
                      key={notebook.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colorClasses.accent)} />
                        <div>
                          <p className="text-sm font-medium">{notebook.name}</p>
                          <p className="text-xs text-text-secondary">
                            {notebook.bet_count} bets •{" "}
                            {formatPercentage(notebook.win_rate)} win rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            notebook.total_pl > 0
                              ? "text-profit"
                              : notebook.total_pl < 0
                              ? "text-loss"
                              : "text-text-secondary"
                          }`}
                        >
                          {notebook.total_pl > 0 ? "+" : ""}
                          {formatCurrency(notebook.total_pl)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatPercentage(notebook.roi)} ROI
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
