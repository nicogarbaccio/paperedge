import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Plus, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, getStatusColorClass } from "@/lib/utils";
import { groupBetsByGame, calculateTotalPL } from "@/lib/betting";
import type { Bet, CustomColumn } from "@/hooks/useNotebook";
import { useMemo, useState } from "react";

interface DayDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  bets: Bet[];
  profit: number;
  onAddBet: (date: string) => void;
  onEditBet: (bet: Bet) => void;
  onViewHistory: () => void;
  customColumns?: CustomColumn[];
  betCustomData?: Record<string, Record<string, string>>;
}

export function DayDetailsDrawer({
  open,
  onOpenChange,
  date,
  bets,
  profit,
  onAddBet,
  onEditBet,
  onViewHistory,
  customColumns = [],
  betCustomData = {},
}: DayDetailsDrawerProps) {
  if (!date) return null;

  const formattedDate = formatDate(date);
  const betCount = bets.length;

  // Group bets by game
  const { grouped: groupedBets, ungrouped: ungroupedBets } = useMemo(() => {
    return groupBetsByGame(bets, betCustomData, customColumns);
  }, [bets, betCustomData, customColumns]);

  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] flex flex-col"
        data-testid="day-details-drawer"
      >
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div className="flex-1">
              <DialogTitle className="text-xl" data-testid="day-details-title">
                {formattedDate}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {betCount} {betCount === 1 ? "bet" : "bets"} on this day
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-secondary mb-1">Daily P&L</div>
              <div
                className={`text-xl font-bold ${
                  profit > 0
                    ? "text-profit"
                    : profit < 0
                    ? "text-loss"
                    : "text-text-secondary"
                }`}
                data-testid="day-details-profit"
              >
                {profit > 0 ? "+" : ""}
                {formatCurrency(profit)}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable bet list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {bets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No bets on this day</p>
              <p className="text-xs text-text-secondary mt-1">
                Add a bet to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Grouped bets */}
              {groupedBets.map((group) => {
                const groupKey = `${group.gameName}|${group.date}`;
                const isExpanded = expandedGroups.has(groupKey);

                return (
                  <div key={groupKey} className="space-y-2">
                    {/* Group header */}
                    <div
                      className="flex items-center justify-between p-3 bg-surface-secondary/50 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary/70 transition-colors"
                      onClick={() => toggleGroup(groupKey)}
                      data-testid="day-details-bet-group"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-text-secondary flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-secondary flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-text-primary text-sm">
                              {group.gameName}
                            </h4>
                            <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent-foreground rounded">
                              {group.bets.length} bets
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                            <span>
                              {group.record.wins}-{group.record.losses}
                              {group.record.pushes > 0 && `-${group.record.pushes}`}
                            </span>
                            <span className={`font-medium ${group.totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {group.totalReturn >= 0 ? '+' : ''}{formatCurrency(group.totalReturn)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Group bets (collapsible) */}
                    {isExpanded && (
                      <div className="ml-6 space-y-2">
                        {group.bets.map((bet) => (
                          <div
                            key={bet.id}
                            className="p-3 border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer bg-surface"
                            onClick={() => onEditBet(bet as Bet)}
                            data-testid="day-details-bet-card"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text-primary text-sm">
                                  {bet.description}
                                </h4>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md ml-2 ${getStatusColorClass(
                                  bet.status
                                )} bg-surface-secondary/30`}
                              >
                                {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-text-secondary">Odds</p>
                                <p className="font-medium">
                                  {bet.odds > 0 ? "+" : ""}
                                  {bet.odds}
                                </p>
                              </div>
                              <div>
                                <p className="text-text-secondary">Wager</p>
                                <p className="font-medium">
                                  {formatCurrency(bet.wager_amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-text-secondary">Return</p>
                                <p
                                  className={`font-medium ${
                                    bet.status === "won"
                                      ? "text-profit"
                                      : bet.status === "lost"
                                      ? "text-loss"
                                      : "text-text-secondary"
                                  }`}
                                >
                                  {bet.status === "pending"
                                    ? "Pending"
                                    : bet.status === "push"
                                    ? "Push"
                                    : bet.status === "won" && bet.return_amount
                                    ? formatCurrency(bet.return_amount)
                                    : bet.status === "lost"
                                    ? `-${formatCurrency(bet.wager_amount)}`
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped bets */}
              {ungroupedBets.length > 0 && (
                <>
                  {groupedBets.length > 0 && (
                    <div className="border-t border-border pt-3 mt-4">
                      <h5 className="text-xs font-medium text-text-secondary mb-2">Individual Bets</h5>
                    </div>
                  )}
                  {ungroupedBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="p-4 border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer bg-surface"
                      onClick={() => onEditBet(bet as Bet)}
                      data-testid="day-details-bet-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary text-sm">
                            {bet.description}
                          </h4>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md ml-2 ${getStatusColorClass(
                            bet.status
                          )} bg-surface-secondary/30`}
                        >
                          {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-text-secondary">Odds</p>
                          <p className="font-medium">
                            {bet.odds > 0 ? "+" : ""}
                            {bet.odds}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary">Wager</p>
                          <p className="font-medium">
                            {formatCurrency(bet.wager_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary">Return</p>
                          <p
                            className={`font-medium ${
                              bet.status === "won"
                                ? "text-profit"
                                : bet.status === "lost"
                                ? "text-loss"
                                : "text-text-secondary"
                            }`}
                          >
                            {bet.status === "pending"
                              ? "Pending"
                              : bet.status === "push"
                              ? "Push"
                              : bet.status === "won" && bet.return_amount
                              ? formatCurrency(bet.return_amount)
                              : bet.status === "lost"
                              ? `-${formatCurrency(bet.wager_amount)}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              onAddBet(date);
              onOpenChange(false);
            }}
            className="flex-1"
            data-testid="day-details-add-bet-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bet for This Day
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onViewHistory();
              onOpenChange(false);
            }}
            className="flex-1"
            data-testid="day-details-view-history-button"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View in History
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
