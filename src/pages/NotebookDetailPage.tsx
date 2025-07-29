import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, Loader2, Calendar, History } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useNotebook } from "@/hooks/useNotebook";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getStatusColorClass,
  getCurrentLocalDate,
} from "@/lib/utils";
import { CreateBetDialog } from "@/components/CreateBetDialog";
import { EditBetDialog } from "@/components/EditBetDialog";
import { EditNotebookDialog } from "@/components/EditNotebookDialog";
import { CalendarView } from "@/components/CalendarView";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

export function NotebookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    notebook,
    bets,
    loading,
    error,
    addBet,
    updateBet,
    deleteBet,
    refetch,
  } = useNotebook(id || "");
  const { updateNotebook } = useNotebooks();
  const { toast } = useToast();
  const [isCreateBetDialogOpen, setIsCreateBetDialogOpen] = useState(false);
  const [isEditBetDialogOpen, setIsEditBetDialogOpen] = useState(false);
  const [isEditNotebookDialogOpen, setIsEditNotebookDialogOpen] =
    useState(false);
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [activeView, setActiveView] = useState<"history" | "calendar">(
    "history"
  );

  // Form state for create bet dialog - persists across tab switches
  const [createBetFormData, setCreateBetFormData] = useState({
    date: getCurrentLocalDate(),
    description: "",
    odds: 0,
    wager_amount: 0,
  });

  const handleCreateBet = async (data: {
    date: string;
    description: string;
    odds: number;
    wager_amount: number;
  }) => {
    await addBet(data);
    toast({
      title: "Bet added",
      description: `${data.description} has been added to your notebook.`,
      variant: "success",
    });
    // Reset form after successful creation
    setCreateBetFormData({
      date: getCurrentLocalDate(),
      description: "",
      odds: 0,
      wager_amount: 0,
    });
  };

  const handleEditBet = (bet: any) => {
    setSelectedBet(bet);
    setIsEditBetDialogOpen(true);
  };

  const handleUpdateBet = async (betId: string, updates: any) => {
    await updateBet(betId, updates);
    toast({
      title: "Bet updated",
      description: "Your bet has been successfully updated.",
      variant: "success",
    });
  };

  const handleDeleteBet = async (betId: string) => {
    await deleteBet(betId);
  };

  const handleUpdateNotebook = async (
    id: string,
    updates: { name?: string; description?: string; color?: string }
  ) => {
    await updateNotebook(id, updates);
    toast({
      title: "Notebook updated",
      description: "Your notebook has been successfully updated.",
      variant: "success",
    });
    // Refresh the current notebook data to show the updates
    await refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2 text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading notebook...</span>
        </div>
      </div>
    );
  }

  if (error || !notebook) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-loss mb-2">Error loading notebook</p>
          <p className="text-text-secondary text-sm">
            {error || "Notebook not found"}
          </p>
          <Link to="/notebooks">
            <Button variant="outline" className="mt-4">
              Back to Notebooks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const completedBets = bets.filter((bet) =>
    ["won", "lost", "push"].includes(bet.status)
  );
  const wonBets = bets.filter((bet) => bet.status === "won");
  const winRate =
    completedBets.length > 0
      ? (wonBets.length / completedBets.length) * 100
      : 0;

  const totalPL = bets.reduce((total, bet) => {
    if (bet.status === "won" && bet.return_amount) {
      return total + bet.return_amount;
    } else if (bet.status === "lost") {
      return total - bet.wager_amount;
    }
    return total;
  }, 0);

  const totalWagered = completedBets.reduce(
    (total, bet) => total + bet.wager_amount,
    0
  );
  const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/notebooks">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Notebooks</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-text-primary">
              {notebook.name}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditNotebookDialogOpen(true)}
              className="opacity-70 hover:opacity-100"
            >
              Edit
            </Button>
          </div>
          <p className="text-text-secondary">
            {notebook.description || "No description"}
          </p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() => setIsCreateBetDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Bet</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Bets</p>
                <p className="text-2xl font-bold">{bets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Win Rate</p>
                <p
                  className={`text-2xl font-bold ${
                    winRate >= 55
                      ? "text-profit"
                      : winRate >= 45
                      ? "text-pending"
                      : "text-loss"
                  }`}
                >
                  {formatPercentage(winRate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total P&L</p>
                <p
                  className={`text-2xl font-bold ${
                    totalPL > 0
                      ? "text-profit"
                      : totalPL < 0
                      ? "text-loss"
                      : "text-text-secondary"
                  }`}
                >
                  {totalPL > 0 ? "+" : ""}
                  {formatCurrency(totalPL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">ROI</p>
                <p
                  className={`text-2xl font-bold ${
                    roi > 0
                      ? "text-profit"
                      : roi < 0
                      ? "text-loss"
                      : "text-text-secondary"
                  }`}
                >
                  {formatPercentage(roi)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle Tabs */}
      <div className="flex space-x-1 p-1 bg-surface rounded-lg w-fit">
        <Button
          variant={activeView === "history" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("history")}
          className="flex items-center space-x-2"
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
        <Button
          variant={activeView === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveView("calendar")}
          className="flex items-center space-x-2"
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar</span>
        </Button>
      </div>

      {/* Content based on active view */}
      {activeView === "history" ? (
        /* Bets Table */
        <Card>
          <CardHeader>
            <CardTitle>Betting History</CardTitle>
            <CardDescription>All bets for this notebook</CardDescription>
          </CardHeader>
          <CardContent>
            {bets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">No bets recorded yet</p>
                <Button
                  className="flex items-center space-x-2"
                  onClick={() => setIsCreateBetDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Your First Bet</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    className="border border-border rounded-lg p-4 hover:bg-surface-secondary/30 transition-colors cursor-pointer"
                    onClick={() => handleEditBet(bet)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{bet.description}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${getStatusColorClass(
                            bet.status
                          )}`}
                        >
                          {bet.status.charAt(0).toUpperCase() +
                            bet.status.slice(1)}
                        </span>
                        {bet.status === "pending" && (
                          <span className="text-xs text-text-secondary bg-accent/10 px-2 py-1 rounded">
                            Click to update
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Date: </span>
                        <span>{formatDate(bet.date)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Odds: </span>
                        <span>
                          {bet.odds > 0 ? "+" : ""}
                          {bet.odds}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Wager: </span>
                        <span>{formatCurrency(bet.wager_amount)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Return: </span>
                        <span className={getStatusColorClass(bet.status)}>
                          {bet.status === "won" && bet.return_amount
                            ? `+${formatCurrency(bet.return_amount)}`
                            : bet.status === "lost"
                            ? `-${formatCurrency(bet.wager_amount)}`
                            : bet.status === "push"
                            ? formatCurrency(0)
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Calendar View */
        <CalendarView bets={bets} />
      )}

      {/* Create Bet Dialog */}
      <CreateBetDialog
        open={isCreateBetDialogOpen}
        onOpenChange={setIsCreateBetDialogOpen}
        onCreateBet={handleCreateBet}
        formData={createBetFormData}
        setFormData={setCreateBetFormData}
      />

      {/* Edit Bet Dialog */}
      <EditBetDialog
        open={isEditBetDialogOpen}
        onOpenChange={setIsEditBetDialogOpen}
        bet={selectedBet}
        onUpdateBet={handleUpdateBet}
        onDeleteBet={handleDeleteBet}
      />

      {/* Edit Notebook Dialog */}
      <EditNotebookDialog
        open={isEditNotebookDialogOpen}
        onOpenChange={setIsEditNotebookDialogOpen}
        notebook={notebook}
        onUpdateNotebook={handleUpdateNotebook}
      />
    </div>
  );
}
