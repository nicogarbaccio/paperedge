import { useState, useEffect } from "react";
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
import { calculateReturn, isValidAmericanOdds } from "@/lib/betting";
import { formatCurrency } from "@/lib/utils";

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
}

export function EditBetDialog({
  open,
  onOpenChange,
  bet,
  onUpdateBet,
  onDeleteBet,
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

  // Calculate expected return based on current odds and wager
  const expectedReturn =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculateReturn(formData.odds, formData.wager_amount)
      : 0;

  useEffect(() => {
    if (bet && open) {
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
    }
  }, [bet, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bet) return;

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

      await onUpdateBet(bet.id, updates);
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to update bet");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bet) return;

    try {
      setLoading(true);
      setError(null);
      await onDeleteBet(bet.id);
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to delete bet");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading && bet) {
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
          ? expectedReturn
          : status === "lost"
          ? 0
          : status === "push"
          ? 0
          : prev.return_amount,
    }));
  };

  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bet</DialogTitle>
          <DialogDescription>
            Update bet details, status, and outcome.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    setFormData((prev) => ({
                      ...prev,
                      return_amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={loading}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-xs text-text-secondary">
                Expected return: {formatCurrency(expectedReturn)}
                <span className="text-accent">
                  {" "}
                  (profit:{" "}
                  {formatCurrency(expectedReturn - formData.wager_amount)})
                </span>
              </p>
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

          {expectedReturn > 0 && formData.status === "pending" && (
            <div className="text-xs text-accent bg-accent/10 p-3 rounded-md">
              Potential return: {formatCurrency(expectedReturn)}
              <span className="text-text-secondary">
                {" "}
                (profit:{" "}
                {formatCurrency(expectedReturn - formData.wager_amount)})
              </span>
            </div>
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
