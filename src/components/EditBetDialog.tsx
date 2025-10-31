import { useState, useEffect, useRef } from "react";
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

  // Calculate expected profit and total payout based on current odds and wager
  const expectedProfit =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculateProfit(formData.odds, formData.wager_amount)
      : 0;

  const expectedPayout =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculatePayout(formData.odds, formData.wager_amount)
      : 0;

  // Auto-update return_amount when odds or wager changes (only if user hasn't manually modified it)
  useEffect(() => {
    if (
      formData.status === "won" &&
      !userModifiedReturn &&
      expectedProfit > 0 &&
      open // Only auto-calculate when dialog is open
    ) {
      setFormData((prev) => ({
        ...prev,
        return_amount: expectedProfit, // Store profit only, not total payout
      }));
    }
  }, [
    formData.odds,
    formData.wager_amount,
    expectedProfit,
    userModifiedReturn,
    formData.status,
    open,
  ]);

  // Initialize form data when dialog opens with a new bet
  useEffect(() => {
    if (bet && open) {
      // Update current bet
      setCurrentBet(bet);

      setFormData({
        date: bet.date,
        description: bet.description,
        odds: bet.odds,
        wager_amount: bet.wager_amount,
        status: bet.status,
        return_amount: bet.return_amount || 0,
      });
      setError(null);
      setShowDeleteConfirm(false);
      setCustomValues(initialCustomValues || {});
      // Reset user modification flag when opening dialog
      setUserModifiedReturn(false);
    }
  }, [bet, open, initialCustomValues]);

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

      // Close the modal
      onOpenChange(false);
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

  // Don't render if no bet data
  if (!currentBet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              disabled={loading}
              required
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    odds: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={loading}
                required
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      wager_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={loading}
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Bet Status *</Label>
            <div className="grid grid-cols-2 gap-2">
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
              >
                Push
              </Button>
              <Button
                type="button"
                variant={formData.status === "pending" ? "default" : "outline"}
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || showDeleteConfirm}>
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
