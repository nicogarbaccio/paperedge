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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Copy,
  CheckSquare,
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
  groupBetsByGame,
} from "@/lib/betting";
import { getNotebookColorClasses } from "@/lib/notebookColors";
import { CreateBetDialog } from "@/components/CreateBetDialog";
import { EditBetDialog } from "@/components/EditBetDialog";
import { BulkEditDialog } from "@/components/BulkEditDialog";
import { EditNotebookDialog } from "@/components/EditNotebookDialog";
import { DuplicateNotebookDialog } from "@/components/DuplicateNotebookDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarView } from "@/components/CalendarView";
import { DayDetailsDrawer } from "@/components/DayDetailsDrawer";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/useToast";
import { BetSearch, SearchFilters } from "@/components/BetSearch";
import { useBetSearch } from "@/hooks/useBetSearch";
import { NotebookDetailSkeleton } from "@/components/skeletons/NotebookDetailSkeleton";
import type { Bet } from "@/hooks/useNotebook";

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
    bulkUpdateBets,
    bulkUpsertCustomData,
    refetch,
  } = useNotebook(isValidNotebookId ? id || "" : "");
  const { updateNotebook, deleteNotebook, duplicateNotebook, notebooks } = useNotebooks();

  const [isCreateBetDialogOpen, setIsCreateBetDialogOpen] = useState(false);
  const [isEditBetDialogOpen, setIsEditBetDialogOpen] = useState(false);
  const [isEditNotebookDialogOpen, setIsEditNotebookDialogOpen] =
    useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [activeView, setActiveView] = useState<"history" | "calendar">(
    "history"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGroupedView, setIsGroupedView] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Bulk edit state
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedBetIds, setSelectedBetIds] = useState<Set<string>>(new Set());
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);

  // Day details drawer state
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [selectedDayBets, setSelectedDayBets] = useState<Bet[]>([]);
  const [selectedDayProfit, setSelectedDayProfit] = useState(0);
  const [isEditingFromDayDrawer, setIsEditingFromDayDrawer] = useState(false);
  const [isAddingFromDayDrawer, setIsAddingFromDayDrawer] = useState(false);

  // Sync selectedDayBets when bets change and drawer is open
  useEffect(() => {
    if (isDayDetailsOpen && selectedDayDate) {
      const dayBets = bets.filter(bet => bet.date === selectedDayDate);
      setSelectedDayBets(dayBets);

      // Recalculate profit
      const dayProfit = dayBets.reduce((total, bet) => {
        if (bet.status === "won" && bet.return_amount) {
          return total + bet.return_amount;
        } else if (bet.status === "lost") {
          return total - bet.wager_amount;
        }
        return total;
      }, 0);
      setSelectedDayProfit(Math.round(dayProfit * 100) / 100);
    }
  }, [bets, isDayDetailsOpen, selectedDayDate]);

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

  // Sort order state
  const [sortOrder, setSortOrder] = useState<"date-desc" | "date-asc" | "status" | "wager">("date-desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination when filters, sort order, items per page, or view mode change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters, sortOrder, itemsPerPage, isGroupedView]);

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

  // Reset create form state when dialog closes
  useEffect(() => {
    if (!isCreateBetDialogOpen) {
      // When dialog closes, reset all fields
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
    // Note: selectedDayBets will be synced automatically by the useEffect
  };

  const handleDeleteBet = async (betId: string) => {
    await deleteBet(betId);

    // If we were editing from day drawer and no bets remain, close the drawer
    if (isEditingFromDayDrawer && selectedDayDate) {
      const remainingBets = bets.filter(bet => bet.date === selectedDayDate && bet.id !== betId);
      if (remainingBets.length === 0) {
        setIsEditingFromDayDrawer(false);
        setIsDayDetailsOpen(false);
      }
      // Otherwise, useEffect will sync the updated bets automatically
    }

    toast({
      title: "Bet deleted",
      description: "Your bet has been successfully deleted.",
      variant: "success",
    });
  };

  const handleDuplicateNotebook = async (newName: string) => {
    try {
      const newNotebookId = await duplicateNotebook(id || "", newName);
      toast({
        title: "Notebook duplicated",
        description: "Your notebook has been successfully duplicated.",
        variant: "success",
      });
      navigate(`/notebooks/${newNotebookId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate notebook",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotebook = async (
    id: string,
    updates: { name?: string; description?: string | null; color?: string; unit_size?: number }
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

  // Handle day click from calendar
  const handleDayClick = (dateKey: string, dayBets: Bet[], dayProfit: number) => {
    setSelectedDayDate(dateKey);
    setSelectedDayBets(dayBets);
    setSelectedDayProfit(dayProfit);
    setIsDayDetailsOpen(true);
  };

  // Handle "Add Bet" from day details drawer
  const handleAddBetForDay = (date: string) => {
    setIsAddingFromDayDrawer(true);
    setCreateBetFormData({
      date,
      description: "",
      odds: 0,
      wager_amount: 0,
    });
    setIsCreateBetDialogOpen(true);
  };

  // Handle "Add Bet" for a specific game
  const handleAddBetToGame = (gameName: string, date: string, league?: string) => {
    // Find the game column ID
    const gameColumn = customColumns?.find(col => {
      const name = col.column_name.toLowerCase();
      return name === 'game' || name === 'matchup' || name === 'teams' ||
             name === 'vs' || name === 'match' || name === 'opponent';
    });

    // Find the league column ID
    const leagueColumn = customColumns?.find(col => {
      const name = col.column_name.toLowerCase();
      return name === 'league' || name === 'sport' || name === 'competition';
    });

    // Pre-fill the form with date
    setCreateBetFormData({
      date,
      description: "",
      odds: 0,
      wager_amount: 0,
    });

    // Pre-fill the game and league custom fields if found
    const customValuesToSet: Record<string, string> = {};

    if (gameColumn) {
      customValuesToSet[gameColumn.id] = gameName;
    }

    if (leagueColumn && league) {
      customValuesToSet[leagueColumn.id] = league;
    }

    setCreateBetCustomValues({
      ...createBetCustomValues,
      ...customValuesToSet,
    });

    setIsCreateBetDialogOpen(true);
  };

  // Handle "View in History" from day details drawer
  const handleViewDayInHistory = () => {
    if (selectedDayDate) {
      setActiveView("history");
      setSearchFilters({
        ...searchFilters,
        dateFrom: selectedDayDate,
        dateTo: selectedDayDate,
      });
    }
  };

  // Helper function to get game name from a bet
  const getGameNameFromBet = (bet: Bet | { id: string; date: string; game?: string }): string | null => {
    // If bet already has a game property (BetWithGame), use it
    if ('game' in bet && bet.game) {
      const trimmed = bet.game.trim();
      return trimmed || null;
    }

    // Otherwise, look up from customColumns
    if (!customColumns || !betCustomData[bet.id]) return null;

    // Find the game column
    const gameColumn = customColumns.find(col => {
      const name = col.column_name.toLowerCase();
      return name === 'game' || name === 'matchup' || name === 'teams' ||
             name === 'vs' || name === 'match' || name === 'opponent';
    });

    if (!gameColumn) return null;

    // Get the game value for this bet
    const gameValue = betCustomData[bet.id]?.[gameColumn.id];

    // Check if the value exists and is not just whitespace
    if (!gameValue || !gameValue.trim()) return null;

    return gameValue.trim();
  };

  const getLeagueNameFromBet = (bet: Bet | { id: string; date: string; league?: string }): string | undefined => {
    // If bet already has a league property, use it
    if ('league' in bet && bet.league) {
      const trimmed = bet.league.trim();
      return trimmed || undefined;
    }

    // Otherwise, look up from customColumns
    if (!customColumns || !betCustomData[bet.id]) return undefined;

    // Find the league column
    const leagueColumn = customColumns.find(col => {
      const name = col.column_name.toLowerCase();
      return name === 'league' || name === 'sport' || name === 'competition';
    });

    if (!leagueColumn) return undefined;

    // Get the league value for this bet
    const leagueValue = betCustomData[bet.id]?.[leagueColumn.id];

    // Check if the value exists and is not just whitespace
    if (!leagueValue || !leagueValue.trim()) return undefined;

    return leagueValue.trim();
  };

  // Bulk edit helpers
  const toggleBetSelection = (betId: string) => {
    setSelectedBetIds((prev) => {
      const next = new Set(prev);
      if (next.has(betId)) {
        next.delete(betId);
      } else {
        next.add(betId);
      }
      return next;
    });
  };

  const selectAllFilteredBets = () => {
    setSelectedBetIds(new Set(filteredBets.map((b) => b.id)));
  };

  const deselectAllBets = () => {
    setSelectedBetIds(new Set());
  };

  const handleBulkApplyCustom = async (columnId: string, value: string) => {
    const betIds = Array.from(selectedBetIds);
    await bulkUpsertCustomData(betIds, columnId, value);
    toast({
      title: "Bulk update applied",
      description: `Updated ${betIds.length} ${betIds.length === 1 ? "bet" : "bets"}.`,
      variant: "success",
    });
    setSelectedBetIds(new Set());
    setIsBulkEditMode(false);
  };

  const handleBulkApplyBetSize = async (wagerAmount: number) => {
    const betIds = Array.from(selectedBetIds);
    await bulkUpdateBets(betIds, { wager_amount: wagerAmount });
    toast({
      title: "Bulk update applied",
      description: `Updated bet size for ${betIds.length} ${betIds.length === 1 ? "bet" : "bets"}.`,
      variant: "success",
    });
    setSelectedBetIds(new Set());
    setIsBulkEditMode(false);
  };

  const exitBulkEditMode = () => {
    setIsBulkEditMode(false);
    setSelectedBetIds(new Set());
  };

  // Get filtered and sorted bets using the search hook
  const { filteredBets, totalBets, filteredCount } = useBetSearch(
    bets,
    searchFilters,
    sortOrder
  );

  // Pagination logic
  // Group ALL filtered bets first (before pagination) for grouped view
  const { grouped: allGroupedBets, ungrouped: allUngroupedBets } = useMemo(() => {
    return groupBetsByGame(filteredBets, betCustomData, customColumns || []);
  }, [filteredBets, betCustomData, customColumns]);

  // Create a merged array of groups and individual bets, sorted together
  type MergedItem =
    | { type: 'group'; data: typeof allGroupedBets[0]; sortDate: string }
    | { type: 'bet'; data: typeof allUngroupedBets[0]; sortDate: string };

  const allMergedBetsAndGroups = useMemo(() => {
    const merged: MergedItem[] = [];

    // Add all groups
    allGroupedBets.forEach(group => {
      merged.push({
        type: 'group',
        data: group,
        sortDate: group.date
      });
    });

    // Add all ungrouped bets
    allUngroupedBets.forEach(bet => {
      merged.push({
        type: 'bet',
        data: bet,
        sortDate: bet.date
      });
    });

    // Sort the merged array based on the current sort order
    merged.sort((a, b) => {
      switch (sortOrder) {
        case "date-desc":
          return b.sortDate.localeCompare(a.sortDate);
        case "date-asc":
          return a.sortDate.localeCompare(b.sortDate);
        case "status":
        case "wager":
          // For status and wager sorting, groups come first, then individual bets
          // Both sorted by date within their sections
          if (a.type === 'group' && b.type === 'bet') return -1;
          if (a.type === 'bet' && b.type === 'group') return 1;
          return b.sortDate.localeCompare(a.sortDate);
        default:
          return b.sortDate.localeCompare(a.sortDate);
      }
    });

    return merged;
  }, [allGroupedBets, allUngroupedBets, sortOrder]);

  // Paginate the merged groups and individual bets for grouped view
  const mergedBetsAndGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allMergedBetsAndGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [allMergedBetsAndGroups, currentPage, itemsPerPage]);

  // Paginate filtered bets for flat view
  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBets, currentPage, itemsPerPage]);

  // Calculate total pages based on view mode
  const totalPages = isGroupedView
    ? Math.ceil(allMergedBetsAndGroups.length / itemsPerPage)
    : Math.ceil(filteredBets.length / itemsPerPage);

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

  // Render pagination controls
  const renderPagination = () => {
    if (filteredBets.length === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm text-text-secondary whitespace-nowrap">
            Show:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-8 rounded-md border border-border bg-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-text-secondary whitespace-nowrap">
            per page
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        )}
      </div>
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
  const unitSize = notebook.unit_size || 100;
  const unitsWon = totalPL / unitSize;
  const totalWagered = bets
    .filter((bet) => ["won", "lost"].includes(bet.status))
    .reduce((total, bet) => total + bet.wager_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/notebooks"
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
            data-testid="back-to-notebooks-link"
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
            data-testid="edit-notebook-button"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Notebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDuplicateDialogOpen(true)}
            data-testid="duplicate-notebook-button"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-loss border-loss hover:bg-loss hover:text-white"
            data-testid="delete-notebook-button"
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
              <CardTitle className="text-2xl" data-testid="notebook-detail-title">
                {notebook.name}
              </CardTitle>
              {notebook.description && (
                <CardDescription className="mt-1" data-testid="notebook-detail-description">
                  {notebook.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        {bets.length > 0 && (
          <CardContent data-testid="notebook-detail-stats">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                <p className="text-text-secondary text-sm">Units</p>
                <p
                  className={`text-lg font-semibold ${
                    unitsWon > 0
                      ? "text-profit"
                      : unitsWon < 0
                      ? "text-loss"
                      : "text-text-primary"
                  }`}
                >
                  {unitsWon > 0 ? "+" : ""}
                  {unitsWon.toFixed(1)}u
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
        <div className="flex items-center space-x-2" data-testid="notebook-view-toggle">
          <Button
            variant={activeView === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("history")}
            data-testid="notebook-history-view-button"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant={activeView === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("calendar")}
            data-testid="notebook-calendar-view-button"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
        <Button
          onClick={() => {
            // Reset form to today's date when clicking the main "Add Bet" button
            setCreateBetFormData({
              date: getCurrentLocalDate(),
              description: "",
              odds: 0,
              wager_amount: 0,
            });
            setCreateBetCustomValues({});
            setIsCreateBetDialogOpen(true);
          }}
          data-testid="create-bet-button"
        >
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Betting History</CardTitle>
                  <CardDescription>
                    {hasActiveFilters()
                      ? `Showing ${filteredCount} of ${totalBets} bets`
                      : `All bets for this notebook`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sort Order Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort-order" className="text-sm text-text-secondary whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                      className="select-with-arrow h-9 rounded-md border border-border bg-input pl-3 !pr-12 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      data-testid="sort-order-select"
                    >
                      <option value="date-desc">Date (Newest First)</option>
                      <option value="date-asc">Date (Oldest First)</option>
                      <option value="status">Status</option>
                      <option value="wager">Wager Amount</option>
                    </select>
                  </div>

                  {/* Bulk Edit Toggle */}
                  {filteredBets.length > 0 && (
                    <Button
                      variant={isBulkEditMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isBulkEditMode) {
                          exitBulkEditMode();
                        } else {
                          setIsBulkEditMode(true);
                        }
                      }}
                      className="flex items-center space-x-1"
                      data-testid="bulk-edit-toggle-button"
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {isBulkEditMode ? "Cancel" : "Bulk Edit"}
                      </span>
                    </Button>
                  )}

                  {/* Grouped View Toggle */}
                  {allGroupedBets.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsGroupedView(!isGroupedView)}
                      className="flex items-center space-x-1"
                      data-testid="toggle-grouped-view-button"
                    >
                      {isGroupedView ? (
                        <>
                          <List className="h-4 w-4" />
                          <span className="hidden sm:inline">Flat View</span>
                        </>
                      ) : (
                        <>
                          <Grid3x3 className="h-4 w-4" />
                          <span className="hidden sm:inline">Grouped View</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bulk edit select all bar */}
              {isBulkEditMode && filteredBets.length > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 bg-surface-secondary/50 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBetIds.size === filteredBets.length && filteredBets.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllFilteredBets();
                        } else {
                          deselectAllBets();
                        }
                      }}
                      className="h-4 w-4 rounded border-border accent-accent cursor-pointer"
                      data-testid="bulk-edit-select-all"
                    />
                    <span className="text-sm text-text-secondary">
                      {selectedBetIds.size === 0
                        ? `Select all ${filteredBets.length} bets`
                        : `${selectedBetIds.size} of ${filteredBets.length} selected`}
                    </span>
                  </div>
                  {selectedBetIds.size > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setIsBulkEditDialogOpen(true)}
                      data-testid="bulk-edit-open-dialog-button"
                    >
                      Edit {selectedBetIds.size} {selectedBetIds.size === 1 ? "bet" : "bets"}
                    </Button>
                  )}
                </div>
              )}
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
                  {/* Render merged groups and individual bets */}
                  {isGroupedView && mergedBetsAndGroups.map((item) => {
                    if (item.type === 'group') {
                      const group = item.data;
                    const groupKey = `${group.gameName}|${group.date}`;
                    const isExpanded = expandedGroups.has(groupKey);

                    return (
                      <div key={groupKey} className="space-y-2">
                        {/* Group Header */}
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-surface-secondary/50 border border-border rounded-lg hover:bg-surface-secondary/70 transition-colors gap-3"
                          data-testid="bet-group-header"
                        >
                          <div
                            className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => toggleGroup(groupKey)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-text-secondary flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-text-secondary flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <h4 className="font-semibold text-text-primary text-base sm:text-lg" data-testid="bet-group-name">
                                  {group.gameName}
                                </h4>
                                <span className="text-xs sm:text-sm text-text-secondary" data-testid="bet-group-date">
                                  {formatDate(group.date)}
                                </span>
                                <span className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground rounded-md" data-testid="bet-group-count">
                                  {group.bets.length} bets
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm flex-wrap">
                                <span className="text-text-secondary">
                                  Record: <span className="font-medium text-text-primary">
                                    {group.record.wins}-{group.record.losses}
                                    {group.record.pushes > 0 && `-${group.record.pushes}`}
                                  </span>
                                  {group.record.pending > 0 && <span className="text-text-secondary"> ({group.record.pending} pending)</span>}
                                </span>
                                <span className="text-text-secondary">
                                  Total Wager: <span className="font-medium text-text-primary">{formatCurrency(group.totalWager)}</span>
                                </span>
                                <span className={`font-medium ${group.totalReturn >= 0 ? 'text-profit' : 'text-loss'}`}>
                                  {group.totalReturn >= 0 ? '+' : ''}{formatCurrency(group.totalReturn)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 w-full sm:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddBetToGame(group.gameName, group.date, group.league);
                            }}
                            data-testid="add-bet-to-game-button"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Add Bet to Game</span>
                            <span className="sm:hidden">Add to Game</span>
                          </Button>
                        </div>

                        {/* Group Bets (Collapsible) */}
                        {isExpanded && (
                          <div className="ml-8 space-y-3" data-testid="bet-group-bets">
                            {group.bets.map((bet) => {
                              const betGameName = getGameNameFromBet(bet);
                              return (
                              <div
                                key={bet.id}
                                data-testid="bet-card"
                                className={`flex flex-col space-y-3 p-4 border rounded-lg transition-all cursor-pointer ${
                                  isBulkEditMode && selectedBetIds.has(bet.id)
                                    ? "border-accent bg-accent/5"
                                    : "border-border hover:border-accent/50 hover:bg-surface-secondary/30"
                                }`}
                                onClick={() => {
                                  if (isBulkEditMode) {
                                    toggleBetSelection(bet.id);
                                  } else {
                                    handleEditBet(bet);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {isBulkEditMode && (
                                      <input
                                        type="checkbox"
                                        checked={selectedBetIds.has(bet.id)}
                                        onChange={() => toggleBetSelection(bet.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-4 w-4 mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0"
                                        data-testid="bet-card-checkbox"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                    {betGameName && (
                                      <p className="text-xs text-accent font-medium mb-1">
                                        {betGameName}
                                      </p>
                                    )}
                                    <h3 className="font-medium text-text-primary" data-testid="bet-card-description">
                                      {bet.description}
                                    </h3>
                                  </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColorClass(
                                      bet.status
                                    )} bg-surface-secondary/30`}
                                    data-testid="bet-card-status"
                                  >
                                    {bet.status.charAt(0).toUpperCase() +
                                      bet.status.slice(1)}
                                  </span>
                                </div>

                                {customColumns && customColumns.length > 0 && (
                                  <div className="space-y-2">
                                    {(() => {
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
                                        .filter(
                                          (field) => field.category !== "game"
                                        )
                                        .sort(
                                          (a, b) =>
                                            getCustomFieldPriority(a.category) -
                                            getCustomFieldPriority(b.category)
                                        );

                                      const badgeFields = fieldsWithValues.filter((f) => f.category !== "notes");
                                      const notesFields = fieldsWithValues.filter((f) => f.category === "notes");

                                      if (fieldsWithValues.length === 0) return null;

                                      return (
                                        <>
                                          {badgeFields.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                              {badgeFields.map((field) => (
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
                                          {notesFields.map((field) => (
                                            <p
                                              key={field.id}
                                              className="text-xs text-text-secondary italic leading-relaxed"
                                              title={capitalizeFirst(field.column_name)}
                                            >
                                              {field.value}
                                            </p>
                                          ))}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                                  <div>
                                    <p className="text-text-secondary text-xs">Date</p>
                                    <p className="font-medium" data-testid="bet-card-date">{formatDate(bet.date)}</p>
                                  </div>
                                  <div>
                                    <p className="text-text-secondary text-xs">Odds</p>
                                    <p className="font-medium" data-testid="bet-card-odds">
                                      {bet.odds > 0 ? "+" : ""}
                                      {bet.odds}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-text-secondary text-xs">Wager</p>
                                    <p className="font-medium" data-testid="bet-card-wager">
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
                                      data-testid="bet-card-return"
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
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                    } else {
                      // Render individual bet
                      const bet = item.data;
                        const gameName = getGameNameFromBet(bet);
                        const leagueName = getLeagueNameFromBet(bet);

                        return (
                        <div
                          key={bet.id}
                          data-testid="bet-card"
                          className={`flex flex-col space-y-3 p-4 border rounded-lg transition-all cursor-pointer ${
                            isBulkEditMode && selectedBetIds.has(bet.id)
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50 hover:bg-surface-secondary/30"
                          }`}
                          onClick={() => {
                            if (isBulkEditMode) {
                              toggleBetSelection(bet.id);
                            } else {
                              handleEditBet(bet);
                            }
                          }}
                        >
                          <div
                            className="flex items-start justify-between"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {isBulkEditMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedBetIds.has(bet.id)}
                                  onChange={() => toggleBetSelection(bet.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-4 w-4 mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0"
                                  data-testid="bet-card-checkbox"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                              {gameName && (
                                <p className="text-xs text-accent font-medium mb-1">
                                  {gameName}
                                </p>
                              )}
                              <h3 className="font-medium text-text-primary" data-testid="bet-card-description">
                                {bet.description}
                              </h3>
                            </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColorClass(
                                bet.status
                              )} bg-surface-secondary/30`}
                              data-testid="bet-card-status"
                            >
                              {bet.status.charAt(0).toUpperCase() +
                                bet.status.slice(1)}
                            </span>
                          </div>

                          {customColumns && customColumns.length > 0 && (
                            <div className="space-y-2">
                              {(() => {
                                // Get non-game custom fields with values
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
                                  .filter(
                                    (field) => field.category !== "game"
                                  )
                                  .sort(
                                    (a, b) =>
                                      getCustomFieldPriority(a.category) -
                                      getCustomFieldPriority(b.category)
                                  );

                                const badgeFields = fieldsWithValues.filter((f) => f.category !== "notes");
                                const notesFields = fieldsWithValues.filter((f) => f.category === "notes");

                                if (fieldsWithValues.length === 0) return null;

                                return (
                                  <>
                                    {badgeFields.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {badgeFields.map((field) => (
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
                                    {notesFields.map((field) => (
                                      <p
                                        key={field.id}
                                        className="text-xs text-text-secondary italic leading-relaxed"
                                        title={capitalizeFirst(field.column_name)}
                                      >
                                        {field.value}
                                      </p>
                                    ))}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm flex-1">
                              <div>
                                <p className="text-text-secondary text-xs">Date</p>
                                <p className="font-medium" data-testid="bet-card-date">{formatDate(bet.date)}</p>
                              </div>
                              <div>
                                <p className="text-text-secondary text-xs">Odds</p>
                                <p className="font-medium" data-testid="bet-card-odds">
                                  {bet.odds > 0 ? "+" : ""}
                                  {bet.odds}
                                </p>
                              </div>
                              <div>
                                <p className="text-text-secondary text-xs">Wager</p>
                                <p className="font-medium" data-testid="bet-card-wager">
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
                                  data-testid="bet-card-return"
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

                            {/* Add bet to game button */}
                            {gameName && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full lg:w-auto flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddBetToGame(gameName, bet.date, leagueName);
                                }}
                                data-testid="add-bet-to-game-button"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Add Bet to Game</span>
                                <span className="sm:hidden">Add to Game</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}

                  {/* Flat view - render all bets */}
                  {!isGroupedView && paginatedBets.map((bet) => {
                    const gameName = getGameNameFromBet(bet);
                    const leagueName = getLeagueNameFromBet(bet);

                    return (
                    <div
                      key={bet.id}
                      data-testid="bet-card"
                      className={`flex flex-col space-y-3 p-4 border rounded-lg transition-all cursor-pointer ${
                        isBulkEditMode && selectedBetIds.has(bet.id)
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50 hover:bg-surface-secondary/30"
                      }`}
                      onClick={() => {
                        if (isBulkEditMode) {
                          toggleBetSelection(bet.id);
                        } else {
                          handleEditBet(bet);
                        }
                      }}
                    >
                      <div
                        className="flex items-start justify-between"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {isBulkEditMode && (
                            <input
                              type="checkbox"
                              checked={selectedBetIds.has(bet.id)}
                              onChange={() => toggleBetSelection(bet.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0"
                              data-testid="bet-card-checkbox"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                          {gameName && (
                            <p className="text-xs text-accent font-medium mb-1">
                              {gameName}
                            </p>
                          )}
                          <h3 className="font-medium text-text-primary" data-testid="bet-card-description">
                            {bet.description}
                          </h3>
                        </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColorClass(
                            bet.status
                          )} bg-surface-secondary/30`}
                          data-testid="bet-card-status"
                        >
                          {bet.status.charAt(0).toUpperCase() +
                            bet.status.slice(1)}
                        </span>
                      </div>

                      {customColumns && customColumns.length > 0 && (
                        <div className="space-y-2">
                          {(() => {
                            // Get non-game custom fields with values
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
                              .filter(
                                (field) => field.category !== "game"
                              )
                              .sort(
                                (a, b) =>
                                  getCustomFieldPriority(a.category) -
                                  getCustomFieldPriority(b.category)
                              );

                            const badgeFields = fieldsWithValues.filter((f) => f.category !== "notes");
                            const notesFields = fieldsWithValues.filter((f) => f.category === "notes");

                            if (fieldsWithValues.length === 0) return null;

                            return (
                              <>
                                {badgeFields.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {badgeFields.map((field) => (
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
                                {notesFields.map((field) => (
                                  <p
                                    key={field.id}
                                    className="text-xs text-text-secondary italic leading-relaxed"
                                    title={capitalizeFirst(field.column_name)}
                                  >
                                    {field.value}
                                  </p>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm flex-1">
                          <div>
                            <p className="text-text-secondary text-xs">Date</p>
                            <p className="font-medium" data-testid="bet-card-date">{formatDate(bet.date)}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-xs">Odds</p>
                            <p className="font-medium" data-testid="bet-card-odds">
                              {bet.odds > 0 ? "+" : ""}
                              {bet.odds}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-xs">Wager</p>
                            <p className="font-medium" data-testid="bet-card-wager">
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
                              data-testid="bet-card-return"
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

                        {/* Add bet to game button */}
                        {gameName && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full lg:w-auto flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddBetToGame(gameName, bet.date, leagueName);
                            }}
                            data-testid="add-bet-to-game-button"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Add Bet to Game</span>
                            <span className="sm:hidden">Add to Game</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {renderPagination()}
            </CardContent>
          </Card>
        </div>
      ) : (
        <CalendarView bets={bets} onDayClick={handleDayClick} />
      )}

      {/* Create Bet Dialog */}
      <CreateBetDialog
        open={isCreateBetDialogOpen}
        onOpenChange={(open) => {
          setIsCreateBetDialogOpen(open);
          // If closing the create dialog and we were adding from day drawer, reopen the day drawer after a brief delay
          if (!open && isAddingFromDayDrawer) {
            setIsAddingFromDayDrawer(false);
            setTimeout(() => {
              setIsDayDetailsOpen(true);
            }, 150);
          }
        }}
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
        onOpenChange={(open) => {
          setIsEditBetDialogOpen(open);
          // Reset flag and selected bet when closing
          if (!open) {
            setIsEditingFromDayDrawer(false);
            setSelectedBet(null);
          }
        }}
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

      {/* Duplicate Notebook Dialog */}
      <DuplicateNotebookDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        originalName={notebook.name}
        onDuplicateNotebook={handleDuplicateNotebook}
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
        testId="confirm-dialog"
      />

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={isBulkEditDialogOpen}
        onOpenChange={setIsBulkEditDialogOpen}
        selectedCount={selectedBetIds.size}
        customColumns={customColumns || []}
        onApplyCustom={handleBulkApplyCustom}
        onApplyBetSize={handleBulkApplyBetSize}
      />

      {/* Day Details Drawer */}
      <DayDetailsDrawer
        open={isDayDetailsOpen}
        onOpenChange={setIsDayDetailsOpen}
        date={selectedDayDate}
        bets={selectedDayBets}
        profit={selectedDayProfit}
        onAddBet={handleAddBetForDay}
        onEditBet={(bet) => {
          setIsEditingFromDayDrawer(true);
          handleEditBet(bet);
        }}
        onViewHistory={handleViewDayInHistory}
        customColumns={customColumns || []}
        betCustomData={betCustomData}
      />
    </div>
  );
}
