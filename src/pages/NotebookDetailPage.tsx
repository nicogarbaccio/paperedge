import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Plus,
  Calendar,
  History,
  Trash2,
  Pencil,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useNotebook } from "@/hooks/useNotebook";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getStatusColorClass,
  getCurrentLocalDate,
  categorizeCustomField,
  getCustomFieldStyles,
  getCustomFieldPriority,
  capitalizeFirst,
} from "@/lib/utils";
import {
  calculateTotalPL,
  calculateWinRate,
  calculateROI,
} from "@/lib/betting";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { CreateBetDialog } from "@/components/CreateBetDialog";
import { EditBetDialog } from "@/components/EditBetDialog";
import { EditNotebookDialog } from "@/components/EditNotebookDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarView } from "@/components/CalendarView";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/useToast";
import { BetSearch, SearchFilters } from "@/components/BetSearch";
import { useBetSearch } from "@/hooks/useBetSearch";
import { NotebookDetailSkeleton } from "@/components/skeletons/NotebookDetailSkeleton";

export function NotebookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Validate notebook ID format
  const isValidNotebookId = useMemo(() => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }, [id]);

  // Redirect if notebook ID is invalid
  useEffect(() => {
    if (id && !isValidNotebookId) {
      toast({
        title: "Invalid Notebook ID",
        description: "The notebook ID in the URL is not valid.",
        variant: "destructive",
      });
      navigate("/notebooks");
    }
  }, [id, isValidNotebookId, navigate, toast]);

  const {
    notebook,
    bets,
    customColumns,
    betCustomData,
    loading,
    error,
    addBet,
    updateBet,
    deleteBet,
    upsertBetCustomData,
    updateBetWithCustomData,
    refetch,
  } = useNotebook(isValidNotebookId ? id || "" : "");
  const { updateNotebook, deleteNotebook, notebooks } = useNotebooks();

  const [isCreateBetDialogOpen, setIsCreateBetDialogOpen] = useState(false);
  const [isEditBetDialogOpen, setIsEditBetDialogOpen] = useState(false);
  const [isEditNotebookDialogOpen, setIsEditNotebookDialogOpen] =
    useState(false);
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [activeView, setActiveView] = useState<"history" | "calendar">(
    "history"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle unauthorized access or notebook not found
  useEffect(() => {
    if (error && !loading) {
      if (
        error.includes("Access denied") ||
        error.includes("Notebook not found")
      ) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this notebook.",
          variant: "destructive",
        });
        navigate("/notebooks");
      }
    }
  }, [error, loading, navigate, toast]);

  // Check if user has any notebooks
  useEffect(() => {
    if (!loading && notebooks.length === 0) {
      toast({
        title: "No Notebooks",
        description:
          "You don't have any notebooks yet. Create one to get started!",
        variant: "default",
      });
      navigate("/notebooks");
    }
  }, [notebooks.length, loading, navigate, toast]);

  // Search filters state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    oddsMin: null,
    oddsMax: null,
    wagerMin: null,
    wagerMax: null,
  });

  // Form state for create bet dialog - persists across tab switches
  const [createBetFormData, setCreateBetFormData] = useState({
    date: getCurrentLocalDate(),
    description: "",
    odds: 0,
    wager_amount: 0,
  });
  const [createBetCustomValues, setCreateBetCustomValues] = useState<
    Record<string, string>
  >({});

  const handleCreateBet = async (data: {
    date: string;
    description: string;
    odds: number;
    wager_amount: number;
  }) => {
    await addBet(data, createBetCustomValues);
    toast({
      title: "Bet added",
      description: `${data.description} has been added to your notebook.`,
      variant: "success",
    });
  };

  // Reset create form state only after the dialog has closed to avoid flicker
  useEffect(() => {
    if (!isCreateBetDialogOpen) {
      setCreateBetFormData({
        date: getCurrentLocalDate(),
        description: "",
        odds: 0,
        wager_amount: 0,
      });
      setCreateBetCustomValues({});
    }
  }, [isCreateBetDialogOpen]);

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

  // Combined handler for updating bet with custom data in a single operation
  const handleUpdateBetWithCustomData = async (
    betId: string,
    updates: any,
    customValues: Record<string, string>
  ) => {
    await updateBetWithCustomData(betId, updates, customValues);
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

  const handleDeleteNotebook = async () => {
    try {
      await deleteNotebook(id || "");
      toast({
        title: "Notebook deleted",
        description: "Your notebook has been successfully deleted.",
        variant: "success",
      });
      navigate("/notebooks");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notebook",
        variant: "destructive",
      });
    }
  };

  // Get filtered bets using the search hook
  const { filteredBets, totalBets, filteredCount } = useBetSearch(
    bets,
    searchFilters
  );

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchFilters.query ||
      searchFilters.status ||
      searchFilters.dateFrom ||
      searchFilters.dateTo ||
      searchFilters.oddsMin !== null ||
      searchFilters.oddsMax !== null ||
      searchFilters.wagerMin !== null ||
      searchFilters.wagerMax !== null
    );
  };

  if (loading) {
    return <NotebookDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-primary mb-2">Error loading notebook</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-primary mb-2">Notebook not found</p>
          <p className="text-text-secondary text-sm">
            The requested notebook could not be found.
          </p>
        </div>
      </div>
    );
  }

  const notebookColorClasses = getNotebookColorClasses(notebook.color);

  // Calculate notebook statistics
  const totalPL = calculateTotalPL(bets);
  const winRate = calculateWinRate(bets);
  const roi = calculateROI(bets);
  const totalWagered = bets
    .filter((bet) => ["won", "lost"].includes(bet.status))
    .reduce((total, bet) => total + bet.wager_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/notebooks"
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Notebooks
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditNotebookDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Notebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-loss border-loss hover:bg-loss hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Notebook Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div
              className={`h-4 w-4 rounded-full ${notebookColorClasses.bg}`}
            />
            <div>
              <CardTitle className="text-2xl">{notebook.name}</CardTitle>
              {notebook.description && (
                <CardDescription className="mt-1">
                  {notebook.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {bets.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-text-secondary text-sm">Total P&L</p>
                <p
                  className={`text-lg font-semibold ${
                    totalPL > 0
                      ? "text-profit"
                      : totalPL < 0
                      ? "text-loss"
                      : "text-text-primary"
                  }`}
                >
                  {totalPL > 0 ? "+" : ""}
                  {formatCurrency(totalPL)}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Win Rate</p>
                <p className="text-lg font-semibold">
                  {formatPercentage(winRate)}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">ROI</p>
                <p
                  className={`text-lg font-semibold ${
                    roi > 0
                      ? "text-profit"
                      : roi < 0
                      ? "text-loss"
                      : "text-text-primary"
                  }`}
                >
                  {roi > 0 ? "+" : ""}
                  {formatPercentage(roi)}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total Wagered</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalWagered)}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* View Toggle and Add Bet Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("history")}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant={activeView === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
        <Button onClick={() => setIsCreateBetDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bet
        </Button>
      </div>

      {/* Content based on active view */}
      {activeView === "history" ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <BetSearch
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            totalBets={totalBets}
            filteredCount={filteredCount}
          />

          {/* Betting History */}
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
              <CardDescription>
                {hasActiveFilters()
                  ? `Showing ${filteredCount} of ${totalBets} bets`
                  : `All bets for this notebook`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary">
                    {hasActiveFilters()
                      ? "No bets match your search criteria"
                      : "No bets in this notebook yet"}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {hasActiveFilters()
                      ? "Try adjusting your filters"
                      : "Add your first bet to get started"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBets.map((bet) => (
                    <div
                      key={bet.id}
                      data-testid="bet-card"
                      className="flex flex-col space-y-3 p-4 border border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleEditBet(bet)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary">
                            {bet.description}
                          </h3>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColorClass(
                            bet.status
                          )} bg-surface-secondary/30`}
                        >
                          {bet.status.charAt(0).toUpperCase() +
                            bet.status.slice(1)}
                        </span>
                      </div>

                      {customColumns && customColumns.length > 0 && (
                        <div className="space-y-2">
                          {(() => {
                            // Get all custom fields with values
                            const fieldsWithValues = customColumns
                              .filter(
                                (col, idx, arr) =>
                                  arr.findIndex(
                                    (c) =>
                                      c.column_name.toLowerCase() ===
                                      col.column_name.toLowerCase()
                                  ) === idx
                              )
                              .map((col) => {
                                const value = betCustomData[bet.id]?.[col.id];
                                if (!value) return null;
                                return {
                                  ...col,
                                  value,
                                  category: categorizeCustomField(
                                    col.column_name
                                  ),
                                };
                              })
                              .filter(
                                (field): field is NonNullable<typeof field> =>
                                  field !== null
                              )
                              .sort(
                                (a, b) =>
                                  getCustomFieldPriority(a.category) -
                                  getCustomFieldPriority(b.category)
                              );

                            if (fieldsWithValues.length === 0) return null;

                            // Separate primary (game) fields from others
                            const primaryFields = fieldsWithValues.filter(
                              (field) => field.category === "game"
                            );
                            const secondaryFields = fieldsWithValues.filter(
                              (field) => field.category !== "game"
                            );

                            return (
                              <div className="space-y-2">
                                {/* Primary fields (games) - larger and more prominent */}
                                {primaryFields.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {primaryFields.map((field) => (
                                      <span
                                        key={field.id}
                                        className={getCustomFieldStyles(
                                          field.category,
                                          true
                                        )}
                                      >
                                        {field.value}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Secondary fields - smaller, organized by category */}
                                {secondaryFields.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {secondaryFields.map((field) => (
                                      <span
                                        key={field.id}
                                        className={getCustomFieldStyles(
                                          field.category,
                                          false
                                        )}
                                        title={`${capitalizeFirst(
                                          field.column_name
                                        )}: ${field.value}`}
                                      >
                                        {field.value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                        <div>
                          <p className="text-text-secondary text-xs">Date</p>
                          <p className="font-medium">{formatDate(bet.date)}</p>
                        </div>
                        <div>
                          <p className="text-text-secondary text-xs">Odds</p>
                          <p className="font-medium">
                            {bet.odds > 0 ? "+" : ""}
                            {bet.odds}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary text-xs">Wager</p>
                          <p className="font-medium">
                            {formatCurrency(bet.wager_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary text-xs">Return</p>
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
                              ? formatCurrency(bet.return_amount) // Show profit only
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
            </CardContent>
          </Card>
        </div>
      ) : (
        <CalendarView bets={filteredBets} />
      )}

      {/* Create Bet Dialog */}
      <CreateBetDialog
        open={isCreateBetDialogOpen}
        onOpenChange={setIsCreateBetDialogOpen}
        onCreateBet={handleCreateBet}
        formData={createBetFormData}
        setFormData={setCreateBetFormData}
        customColumns={customColumns}
        customValues={createBetCustomValues}
        setCustomValues={setCreateBetCustomValues}
      />

      {/* Edit Bet Dialog */}
      <EditBetDialog
        open={isEditBetDialogOpen}
        onOpenChange={setIsEditBetDialogOpen}
        bet={selectedBet}
        onUpdateBet={handleUpdateBet}
        onDeleteBet={handleDeleteBet}
        customColumns={customColumns}
        initialCustomValues={
          selectedBet ? betCustomData[selectedBet.id] || {} : {}
        }
        onUpsertBetCustomData={upsertBetCustomData}
        onUpdateBetWithCustomData={handleUpdateBetWithCustomData}
      />

      {/* Edit Notebook Dialog */}
      <EditNotebookDialog
        open={isEditNotebookDialogOpen}
        onOpenChange={setIsEditNotebookDialogOpen}
        notebook={notebook}
        onUpdateNotebook={handleUpdateNotebook}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Notebook"
        description="Are you sure you want to delete this notebook? This action cannot be undone and all associated bets will be permanently deleted."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteNotebook}
      />
    </div>
  );
}
