import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatPercentage, getPLColorClass } from "@/lib/utils";
import { useNotebooks } from "@/hooks/useNotebooks";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { NotebooksSkeleton } from "@/components/skeletons/NotebooksSkeleton";
import { StaggeredGrid } from "@/components/ui/StaggeredList";

export function NotebooksPage() {
  const { notebooks, loading, error, createNotebook } = useNotebooks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateNotebook = async (data: {
    name: string;
    description?: string;
    starting_bankroll: number;
    color?: string;
  }) => {
    await createNotebook(data);
    toast({
      title: "Notebook created",
      description: `"${data.name}" has been successfully created.`,
      variant: "success",
    });
  };

  if (loading) {
    return <NotebooksSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-loss mb-2">Error loading notebooks</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-text-primary"
            data-testid="notebooks-page-title"
          >
            Notebooks
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your betting strategies and track performance
          </p>
        </div>
        {/* Only show header button when there are existing notebooks */}
        {notebooks.length > 0 && (
          <Button
            className="flex items-center space-x-2 w-full sm:w-auto"
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="create-notebook-button"
          >
            <Plus className="h-4 w-4" />
            <span>New Notebook</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {notebooks.length === 0 ? (
        // Clean empty state with single create button
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-testid="notebooks-empty-state"
        >
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Create Your First Notebook
            </h2>
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              Start tracking your betting strategies and analyze your
              performance with detailed insights.
            </p>
            <Button
              size="lg"
              onClick={() => setIsCreateDialogOpen(true)}
              className="px-8 py-3 text-base"
              data-testid="create-notebook-button"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Notebook
            </Button>
          </div>
        </div>
      ) : (
        // Notebooks grid
        <StaggeredGrid
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="notebooks-grid"
          columns={3}
          staggerDelay={70}
        >
          {notebooks.map((notebook) => {
            const colorClasses = getNotebookColorClasses(notebook.color);
            return (
              <Link key={notebook.id} to={`/notebooks/${notebook.id}`}>
                <Card
                  className={cn(
                    "relative hover:bg-surface-secondary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full border-l-4 rounded-lg overflow-visible",
                    colorClasses.border,
                    // Notebook-like styling
                    "before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-border/40",
                    // Spiral binding holes
                    "after:absolute after:left-2 after:top-6 after:bottom-6 after:w-1 after:bg-[length:4px_20px] after:bg-repeat-y",
                    "after:bg-[radial-gradient(circle,_var(--border)_2px,_transparent_2px)]"
                  )}
                  data-testid="notebook-card"
                  style={{
                    boxShadow:
                      "2px 2px 8px rgba(0, 0, 0, 0.1), 4px 4px 12px rgba(0, 0, 0, 0.05)",
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
                      {notebook.description || "No description"}
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
                      <div className="grid grid-cols-3 gap-4 text-center">
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
          })}
        </StaggeredGrid>
      )}

      {/* Create Notebook Dialog */}
      <CreateNotebookDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateNotebook={handleCreateNotebook}
      />
    </div>
  );
}
