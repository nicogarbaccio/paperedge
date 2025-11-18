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
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StaggeredGrid, StaggeredList } from "@/components/ui/StaggeredList";

export function DashboardPage() {
  const { stats, recentBets, topNotebooks, loading, error } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
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
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold text-text-primary" data-testid="dashboard-page-title">Dashboard</h1>
        <p className="text-text-secondary">
          Track. Analyze. Win.
        </p>
      </div>

      {/* Stats Grid */}
      <StaggeredGrid
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        data-testid="dashboard-stats-grid"
        columns={3}
        staggerDelay={60}
      >
        <Card data-testid="dashboard-total-bets-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="dashboard-total-bets-value">{stats.totalBets}</div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0
                ? "No bets placed yet"
                : "Across all notebooks"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="dashboard-win-rate-card">
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
              data-testid="dashboard-win-rate-value"
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

        <Card data-testid="dashboard-total-pl-card">
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
              data-testid="dashboard-total-pl-value"
            >
              {stats.totalPL > 0 ? "+" : ""}
              {formatCurrency(stats.totalPL)}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.totalBets === 0 ? "No profit/loss yet" : "Net profit/loss"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="dashboard-roi-card">
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
              data-testid="dashboard-roi-value"
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

        <Card data-testid="dashboard-active-notebooks-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Notebooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="dashboard-active-notebooks-value">{stats.activeNotebooks}</div>
            <p className="text-xs text-text-secondary">
              {stats.activeNotebooks === 0
                ? "Create your first notebook"
                : "Tracking strategies"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="dashboard-pending-bets-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pending" data-testid="dashboard-pending-bets-value">
              {stats.pendingBets}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.pendingBets === 0 ? "No pending bets" : "Awaiting results"}
            </p>
          </CardContent>
        </Card>
      </StaggeredGrid>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="dashboard-recent-bets-card">
          <CardHeader>
            <CardTitle>Recent Bets</CardTitle>
            <CardDescription>Your latest betting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBets.length === 0 ? (
              <div className="text-center py-8" data-testid="dashboard-no-recent-bets">
                <p className="text-text-secondary">No recent bets</p>
                <p className="text-xs text-text-secondary mt-1">
                  Start adding bets to see them here
                </p>
              </div>
            ) : (
              <StaggeredList className="space-y-4" data-testid="dashboard-recent-bets-list" staggerDelay={80}>
                {recentBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between"
                    data-testid="dashboard-recent-bet-item"
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
                          ? `+${formatCurrency(bet.return_amount)}` // Show profit only
                          : bet.status === "lost"
                          ? `-${formatCurrency(bet.wager_amount)}`
                          : formatCurrency(bet.wager_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </StaggeredList>
            )}
          </CardContent>
        </Card>

        <Card data-testid="dashboard-top-notebooks-card">
          <CardHeader>
            <CardTitle>Top Performing Notebooks</CardTitle>
            <CardDescription>Your best strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {topNotebooks.length === 0 ? (
              <div className="text-center py-8" data-testid="dashboard-no-top-notebooks">
                <p className="text-text-secondary">
                  No notebooks with bets yet
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Create a notebook and start betting
                </p>
              </div>
            ) : (
              <StaggeredList className="space-y-4" data-testid="dashboard-top-notebooks-list" staggerDelay={80}>
                {topNotebooks.map((notebook) => {
                  const colorClasses = getNotebookColorClasses(notebook.color);
                  return (
                    <Link
                      key={notebook.id}
                      to={`/notebooks/${notebook.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary/30 transition-colors cursor-pointer"
                      data-testid="dashboard-top-notebook-item"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            colorClasses.accent
                          )}
                        />
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
                    </Link>
                  );
                })}
              </StaggeredList>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
