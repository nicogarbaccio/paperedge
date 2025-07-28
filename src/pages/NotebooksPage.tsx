import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatPercentage, getPLColorClass } from "@/lib/utils";
import { useNotebooks } from "@/hooks/useNotebooks";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading notebooks...</span>
        </div>
      </div>
    );
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Notebooks</h1>
          <p className="text-text-secondary">
            Manage your betting strategies and track performance
          </p>
        </div>
        {/* Only show header button when there are existing notebooks */}
        {notebooks.length > 0 && (
          <Button
            className="flex items-center space-x-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Notebook</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {notebooks.length === 0 ? (
        // Clean empty state with single create button
        <div className="flex flex-col items-center justify-center py-20 text-center">
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
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Notebook
            </Button>
          </div>
        </div>
      ) : (
        // Notebooks grid with add button
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => {
            const colorClasses = getNotebookColorClasses(notebook.color);
            return (
              <Link key={notebook.id} to={`/notebooks/${notebook.id}`}>
                <Card className={cn(
                  "hover:bg-surface-secondary/50 transition-colors cursor-pointer h-full border-l-4",
                  colorClasses.border
                )}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", colorClasses.accent)} />
                        <span>{notebook.name}</span>
                      </div>
                      <span
                        className={`text-sm font-normal ${getPLColorClass(
                          notebook.total_pl || 0
                        )}`}
                      >
                        {(notebook.total_pl || 0) > 0 ? "+" : ""}
                        {formatCurrency(notebook.total_pl || 0)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {notebook.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                <CardContent>
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
                        <div className="text-xs text-text-secondary">Bets</div>
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
                          Starting: {formatCurrency(notebook.starting_bankroll)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            notebook.current_bankroll >
                            notebook.starting_bankroll
                              ? "bg-profit"
                              : "bg-loss"
                          }`}
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

          {/* Add New Notebook Card */}
          <Card
            className="border-dashed border-2 border-border hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] space-y-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-accent" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Create New Notebook
                </h3>
                <p className="text-text-secondary text-sm">
                  Start tracking a new strategy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
