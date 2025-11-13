import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Plus, ExternalLink, X } from "lucide-react";
import { formatCurrency, formatDate, getStatusColorClass } from "@/lib/utils";
import type { Bet } from "@/hooks/useNotebook";

interface DayDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  bets: Bet[];
  profit: number;
  onAddBet: (date: string) => void;
  onEditBet: (bet: Bet) => void;
  onViewHistory: () => void;
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
}: DayDetailsDrawerProps) {
  if (!date) return null;

  const formattedDate = formatDate(date);
  const betCount = bets.length;

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
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="p-4 border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer bg-surface"
                  onClick={() => onEditBet(bet)}
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
