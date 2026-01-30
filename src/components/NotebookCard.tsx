import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { formatCurrency, formatPercentage, getPLColorClass, cn } from "@/lib/utils";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { Notebook } from "@/hooks/useNotebooks";
import { memo } from "react";

interface NotebookCardProps {
  notebook: Notebook;
  className?: string;
  style?: React.CSSProperties;
}

export const NotebookCard = memo(function NotebookCard({ notebook, className, style }: NotebookCardProps) {
  const colorClasses = getNotebookColorClasses(notebook.color);

  return (
    <Link to={`/notebooks/${notebook.id}`}>
      <Card
        className={cn(
          "relative hover:bg-surface-secondary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full border-l-4 rounded-lg overflow-visible",
          colorClasses.border,
          // Notebook-like styling
          "before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-border/40",
          // Spiral binding holes
          "after:absolute after:left-2 after:top-6 after:bottom-6 after:w-1 after:bg-[length:4px_20px] after:bg-repeat-y",
          "after:bg-[radial-gradient(circle,_var(--border)_2px,_transparent_2px)]",
          className
        )}
        data-testid="notebook-card"
        style={{
          boxShadow:
            "2px 2px 8px rgba(0, 0, 0, 0.1), 4px 4px 12px rgba(0, 0, 0, 0.05)",
          ...style
        }}
      >
        <CardHeader className="pb-3 pl-8">
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  colorClasses.accent
                )}
                data-testid="notebook-card-color"
              />
              <span
                className="truncate"
                data-testid="notebook-card-title"
              >
                {notebook.name}
              </span>
            </div>
            <span
              className={`text-sm font-normal flex-shrink-0 ml-2 ${getPLColorClass(
                notebook.total_pl || 0
              )}`}
            >
              {(notebook.total_pl || 0) > 0 ? "+" : ""}
              {formatCurrency(notebook.total_pl || 0)}
            </span>
          </CardTitle>
          <CardDescription
            className="text-sm"
            data-testid="notebook-card-description"
          >
            {notebook.description}
          </CardDescription>
        </CardHeader>
        <CardContent
          className="pl-8"
          data-testid="notebook-card-stats"
        >
          <div className="space-y-3">
            {/* Bankroll Info */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">
                Bankroll
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(notebook.current_bankroll)}
              </span>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-sm font-medium">
                  {notebook.bet_count || 0}
                </div>
                <div className="text-xs text-text-secondary">
                  Bets
                </div>
              </div>
              <div>
                <div
                  className={`text-sm font-medium ${
                    (notebook.win_rate || 0) >= 55
                      ? "text-profit"
                      : (notebook.win_rate || 0) >= 45
                      ? "text-pending"
                      : "text-loss"
                  }`}
                >
                  {formatPercentage(notebook.win_rate || 0)}
                </div>
                <div className="text-xs text-text-secondary">
                  Win Rate
                </div>
              </div>
              <div>
                <div
                  className={`text-sm font-medium ${getPLColorClass(
                    notebook.roi || 0
                  )}`}
                >
                  {formatPercentage(notebook.roi || 0)}
                </div>
                <div className="text-xs text-text-secondary">ROI</div>
              </div>
              <div>
                <div
                  className={`text-sm font-medium ${getPLColorClass(
                    notebook.units_won || 0
                  )}`}
                >
                  {(notebook.units_won || 0) > 0 ? "+" : ""}
                  {(notebook.units_won || 0).toFixed(1)}u
                </div>
                <div className="text-xs text-text-secondary">Units</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>
                  Starting:{" "}
                  {formatCurrency(notebook.starting_bankroll)}
                </span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${(() => {
                    const percentage =
                      (notebook.current_bankroll /
                        notebook.starting_bankroll) *
                      100;
                    if (percentage >= 100) return "bg-profit"; // Green: Profit
                    if (percentage >= 90) return "bg-yellow-500"; // Yellow: Minor loss
                    if (percentage >= 75) return "bg-orange-500"; // Orange: Moderate loss
                    return "bg-loss"; // Red: Critical loss
                  })()}`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        (notebook.current_bankroll /
                          notebook.starting_bankroll) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-render if only display_order/updated_at changed
  // We care about: name, description, stats, color.
  // Since we are using immutable updates, if the reference is different, we assume change.
  // BUT, we know reorderNotebooks changes reference for ALL items.
  // So we must do a deep check on relevant fields.
  
  return (
    prevProps.notebook.id === nextProps.notebook.id &&
    prevProps.notebook.name === nextProps.notebook.name &&
    prevProps.notebook.description === nextProps.notebook.description &&
    prevProps.notebook.color === nextProps.notebook.color &&
    prevProps.notebook.current_bankroll === nextProps.notebook.current_bankroll &&
    prevProps.notebook.bet_count === nextProps.notebook.bet_count &&
    prevProps.notebook.win_rate === nextProps.notebook.win_rate &&
    prevProps.notebook.total_pl === nextProps.notebook.total_pl &&
    prevProps.notebook.roi === nextProps.notebook.roi &&
    prevProps.notebook.units_won === nextProps.notebook.units_won &&
    prevProps.notebook.starting_bankroll === nextProps.notebook.starting_bankroll
    // display_order and updated_at are IGNORED
  );
});

