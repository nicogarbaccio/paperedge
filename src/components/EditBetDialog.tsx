import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { Label } from "@/components/ui/Label";
import { Loader2, Trash2 } from "lucide-react";
import {
  calculateProfit,
  calculatePayout,
  isValidAmericanOdds,
} from "@/lib/betting";
import { formatCurrency } from "@/lib/utils";
import { CustomColumnsFields } from "@/components/CustomColumnsFields";
import type { CustomColumn } from "@/hooks/useNotebook";

interface Bet {
  id: string;
  date: string;
  description: string;
  odds: number;
  wager_amount: number;
  status: "pending" | "won" | "lost" | "push";
  return_amount: number | null;
}

interface EditBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bet: Bet | null;
  onUpdateBet: (betId: string, updates: Partial<Bet>) => Promise<void>;
  onDeleteBet: (betId: string) => Promise<void>;
  customColumns?: CustomColumn[];
  initialCustomValues?: Record<string, string>;
  onUpsertBetCustomData?: (
    betId: string,
    customValues: Record<string, string>
  ) => Promise<void>;
  // New combined function to update bet and custom data with single refresh
  onUpdateBetWithCustomData?: (
    betId: string,
    updates: Partial<Bet>,
    customValues: Record<string, string>
  ) => Promise<void>;
  // Whether to keep the dialog open after update (useful when editing from day drawer)
  keepOpenAfterUpdate?: boolean;
}

export function EditBetDialog({
  open,
  onOpenChange,
  bet,
  onUpdateBet,
  onDeleteBet,
  customColumns = [],
  initialCustomValues = {},
  onUpsertBetCustomData,
  onUpdateBetWithCustomData,
  keepOpenAfterUpdate = false,
}: EditBetDialogProps) {
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    odds: 0,
    wager_amount: 0,
    status: "pending" as "pending" | "won" | "lost" | "push",
    return_amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customValues, setCustomValues] =
    useState<Record<string, string>>(initialCustomValues);
  // Track whether user has manually modified return_amount
  const [userModifiedReturn, setUserModifiedReturn] = useState(false);
  // Store the current bet locally to prevent flickering when dialog closes
  const [currentBet, setCurrentBet] = useState<Bet | null>(bet);

  // Use a ref to track if we're in the initialization phase
  // This prevents any auto-calculations from running during mount
  const isInitializing = useRef(false);

  // Snapshot the bet data when dialog first opens
  // This prevents the dialog from reacting to parent data changes
  const betSnapshot = useRef<Bet | null>(null);
  const dialogOpenedRef = useRef(false);

  // Calculate expected profit and total payout based on current odds and wager
  // Using useMemo to avoid unnecessary recalculations
  const expectedProfit = useMemo(
    () =>
      formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
        ? calculateProfit(formData.odds, formData.wager_amount)
        : 0,
    [formData.odds, formData.wager_amount]
  );

  const expectedPayout = useMemo(
    () =>
      formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
        ? calculatePayout(formData.odds, formData.wager_amount)
        : 0,
    [formData.odds, formData.wager_amount]
  );

  // Track when dialog transitions from closed to open OR when bet changes while open
  useLayoutEffect(() => {
    // Dialog is opening (transition from false to true) OR bet changed while dialog is open
    if (open && bet) {
      const isBetChanged = betSnapshot.current && betSnapshot.current.id !== bet.id;
      const isOpening = !dialogOpenedRef.current;

      if (isOpening || isBetChanged) {
        dialogOpenedRef.current = true;

        // Take a snapshot of the bet data - this will never change until dialog closes or bet changes
        betSnapshot.current = { ...bet };

        // Mark as initializing to block any auto-calculations
        isInitializing.current = true;

        // Update current bet with snapshot
        setCurrentBet(betSnapshot.current);

        // Initialize form data from the snapshot
        setFormData({
          date: betSnapshot.current.date,
          description: betSnapshot.current.description,
          odds: betSnapshot.current.odds,
          wager_amount: betSnapshot.current.wager_amount,
          status: betSnapshot.current.status,
          return_amount: betSnapshot.current.return_amount || 0,
        });
        setError(null);
        setShowDeleteConfirm(false);
        setCustomValues(initialCustomValues || {});
        setUserModifiedReturn(false);

        // Unblock after a single frame
        requestAnimationFrame(() => {
          isInitializing.current = false;
        });
      }
    }

    // Dialog is closing (transition from true to false)
    if (!open && dialogOpenedRef.current) {
      dialogOpenedRef.current = false;
      betSnapshot.current = null;
    }
  }, [open, bet, initialCustomValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBet) return;

    // Validation
    if (!formData.description.trim()) {
      setError("Bet description is required");
      return;
    }

    if (!isValidAmericanOdds(formData.odds)) {
      setError("Please enter valid American odds (e.g., +150, -110)");
      return;
    }

    if (formData.wager_amount <= 0) {
      setError("Wager amount must be greater than 0");
      return;
    }

    if (!formData.date) {
      setError("Date is required");
      return;
    }

    if (formData.status === "won" && formData.return_amount <= 0) {
      setError("Return amount must be greater than 0 for winning bets");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updates: Partial<Bet> = {
        date: formData.date,
        description: formData.description.trim(),
        odds: formData.odds,
        wager_amount: formData.wager_amount,
        status: formData.status,
      };

      // Set return_amount based on status
      if (formData.status === "won") {
        updates.return_amount = formData.return_amount;
      } else if (formData.status === "lost") {
        updates.return_amount = 0;
      } else if (formData.status === "push") {
        updates.return_amount = 0;
      } else {
        updates.return_amount = null;
      }

      // Use combined function if available to prevent multiple refreshes
      if (onUpdateBetWithCustomData) {
        await onUpdateBetWithCustomData(currentBet.id, updates, customValues);
      } else {
        // Fallback to separate operations
        await onUpdateBet(currentBet.id, updates);
        if (onUpsertBetCustomData) {
          await onUpsertBetCustomData(currentBet.id, customValues);
        }
      }

      // Close the modal only if not configured to keep open
      if (!keepOpenAfterUpdate) {
        onOpenChange(false);
      }
    } catch (error: any) {
      setError(error.message || "Failed to update bet");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentBet) return;

    try {
      setLoading(true);
      setError(null);
      await onDeleteBet(currentBet.id);

      // Close the modal
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to delete bet");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading && currentBet) {
      setFormData({
        date: currentBet.date,
        description: currentBet.description,
        odds: currentBet.odds,
        wager_amount: currentBet.wager_amount,
        status: currentBet.status,
        return_amount: currentBet.return_amount || 0,
      });
      setError(null);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const handleStatusChange = (status: "pending" | "won" | "lost" | "push") => {
    setFormData((prev) => ({
      ...prev,
      status,
      // Auto-set return amount based on status
      return_amount:
        status === "won"
          ? expectedProfit > 0
            ? expectedProfit // Store profit only, not total payout
            : prev.return_amount
          : status === "lost"
          ? 0
          : status === "push"
          ? 0
          : prev.return_amount,
    }));
    // Reset user modification flag when status changes
    setUserModifiedReturn(false);
  };

  // Handle manual return_amount changes
  const handleReturnAmountChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      return_amount: value,
    }));
    // Mark that user has manually modified the return amount
    setUserModifiedReturn(true);
  };

  return (
    <Dialog open={open && !!currentBet} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="edit-bet-dialog">
        <DialogHeader>
          <DialogTitle>Edit Bet</DialogTitle>
          <DialogDescription>
            Update bet details, status, and outcome.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto overflow-x-visible px-3 sm:px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <DateInput
              id="date"
              value={formData.date}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, date: value }))
              }
              disabled={loading}
              required
              data-testid="edit-bet-date-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Bet Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Lakers vs Warriors - Lakers +5.5"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={loading}
              required
              data-testid="edit-bet-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odds">American Odds *</Label>
              <Input
                id="odds"
                type="number"
                placeholder="e.g., +150 or -110"
                value={formData.odds || ""}
                onChange={(e) => {
                  const newOdds = parseInt(e.target.value) || 0;
                  setFormData((prev) => {
                    const updates: any = { ...prev, odds: newOdds };
                    // Auto-update return_amount if status is won and user hasn't manually modified it
                    // BUT only if we're not in the initialization phase
                    if (
                      prev.status === "won" &&
                      !userModifiedReturn &&
                      !isInitializing.current &&
                      newOdds !== 0
                    ) {
                      const newProfit =
                        isValidAmericanOdds(newOdds) && prev.wager_amount > 0
                          ? calculateProfit(newOdds, prev.wager_amount)
                          : 0;
                      if (newProfit > 0) {
                        updates.return_amount = newProfit;
                      }
                    }
                    return updates;
                  });
                }}
                disabled={loading}
                required
                data-testid="edit-bet-odds-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wager_amount">Wager Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <Input
                  id="wager_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.wager_amount || ""}
                  onChange={(e) => {
                    const newWager = parseFloat(e.target.value) || 0;
                    setFormData((prev) => {
                      const updates: any = { ...prev, wager_amount: newWager };
                      // Auto-update return_amount if status is won and user hasn't manually modified it
                      // BUT only if we're not in the initialization phase
                      if (
                        prev.status === "won" &&
                        !userModifiedReturn &&
                        !isInitializing.current &&
                        newWager > 0
                      ) {
                        const newProfit = isValidAmericanOdds(prev.odds)
                          ? calculateProfit(prev.odds, newWager)
                          : 0;
                        if (newProfit > 0) {
                          updates.return_amount = newProfit;
                        }
                      }
                      return updates;
                    });
                  }}
                  disabled={loading}
                  className="pl-8"
                  required
                  data-testid="edit-bet-wager-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Bet Status *</Label>
            <div
              className="grid grid-cols-2 gap-2"
              data-testid="edit-bet-status-select"
            >
              <Button
                type="button"
                variant={formData.status === "won" ? "default" : "outline"}
                onClick={() => handleStatusChange("won")}
                disabled={loading}
                className={
                  formData.status === "won"
                    ? "bg-profit hover:bg-profit/90"
                    : ""
                }
                data-testid="bet-status-won-button"
              >
                Won
              </Button>
              <Button
                type="button"
                variant={formData.status === "lost" ? "default" : "outline"}
                onClick={() => handleStatusChange("lost")}
                disabled={loading}
                className={
                  formData.status === "lost" ? "bg-loss hover:bg-loss/90" : ""
                }
                data-testid="bet-status-lost-button"
              >
                Lost
              </Button>
              <Button
                type="button"
                variant={formData.status === "push" ? "default" : "outline"}
                onClick={() => handleStatusChange("push")}
                disabled={loading}
                className={
                  formData.status === "push"
                    ? "bg-gray-500 hover:bg-gray-500/90"
                    : ""
                }
                data-testid="bet-status-push-button"
              >
                Push
              </Button>
              <Button
                type="button"
                variant={formData.status === "pending" ? "default" : "outline"}
                data-testid="bet-status-pending-button"
                onClick={() => handleStatusChange("pending")}
                disabled={loading}
                className={
                  formData.status === "pending"
                    ? "bg-orange-500 hover:bg-orange-500/90 text-white"
                    : ""
                }
              >
                Pending
              </Button>
            </div>
          </div>

          {formData.status === "won" && (
            <div className="space-y-2">
              <Label htmlFor="return_amount">Return Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <Input
                  id="return_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.return_amount || ""}
                  onChange={(e) =>
                    handleReturnAmountChange(parseFloat(e.target.value) || 0)
                  }
                  disabled={loading}
                  className="pl-8"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-text-secondary">
                  Expected profit: {formatCurrency(expectedProfit)}
                  <span className="text-accent">
                    {" "}
                    (total payout: {formatCurrency(expectedPayout)})
                  </span>
                </p>
                {!userModifiedReturn && expectedProfit > 0 && (
                  <span className="text-green-600 text-xs">
                    Auto-calculated
                  </span>
                )}
              </div>
              {userModifiedReturn &&
                expectedProfit > 0 &&
                Math.abs(formData.return_amount - expectedProfit) > 0.01 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        return_amount: expectedProfit,
                      }));
                      setUserModifiedReturn(false);
                    }}
                    className="text-xs text-accent underline hover:no-underline"
                  >
                    Use expected profit ({formatCurrency(expectedProfit)})
                  </button>
                )}
            </div>
          )}

          {formData.status !== "pending" && formData.status !== "won" && (
            <div className="text-sm text-text-secondary bg-surface-secondary/30 p-3 rounded-md">
              {formData.status === "lost" &&
                "This bet will be marked as a loss with no return."}
              {formData.status === "push" &&
                "This bet will be marked as a push (tie) with your wager returned."}
            </div>
          )}

          {expectedProfit > 0 && formData.status === "pending" && (
            <div className="text-xs text-accent bg-accent/10 p-3 rounded-md">
              Expected profit: {formatCurrency(expectedProfit)}
              <span className="text-text-secondary">
                {" "}
                (total payout: {formatCurrency(expectedPayout)})
              </span>
            </div>
          )}

          {customColumns && customColumns.length > 0 && (
            <CustomColumnsFields
              customColumns={customColumns}
              customValues={customValues}
              setCustomValues={setCustomValues}
              loading={loading}
            />
          )}

          {error && (
            <div className="text-sm text-loss bg-loss/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {showDeleteConfirm && (
            <div className="bg-loss/10 border border-loss/20 p-4 rounded-md space-y-3">
              <div className="text-sm text-loss font-medium">
                Are you sure you want to delete this bet?
              </div>
              <div className="text-xs text-text-secondary">
                This action cannot be undone. The bet will be permanently
                removed from your notebook.
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  data-testid="edit-bet-cancel-delete-button"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-loss border-loss hover:bg-loss hover:text-white"
                  data-testid="edit-bet-confirm-delete-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Bet"
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || showDeleteConfirm}
              className="text-loss border-loss hover:bg-loss hover:text-white order-last sm:order-first"
              data-testid="edit-bet-delete-button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Bet
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                data-testid="edit-bet-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || showDeleteConfirm}
                data-testid="edit-bet-save-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Bet"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
