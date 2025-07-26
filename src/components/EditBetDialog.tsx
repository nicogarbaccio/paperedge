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
import { Label } from "@/components/ui/Label";
import { Loader2 } from "lucide-react";
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
}

export function EditBetDialog({
  open,
  onOpenChange,
  bet,
  onUpdateBet,
}: EditBetDialogProps) {
  const [formData, setFormData] = useState({
    status: "pending" as "pending" | "won" | "lost" | "push",
    return_amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate expected return based on odds
  const expectedReturn = bet ? calculateReturn(bet.odds, bet.wager_amount) : 0;

  useEffect(() => {
    if (bet && open) {
      setFormData({
        status: bet.status,
        return_amount: bet.return_amount || 0,
      });
      setError(null);
    }
  }, [bet, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bet) return;

    if (formData.status === "won" && formData.return_amount <= 0) {
      setError("Return amount must be greater than 0 for winning bets");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updates: Partial<Bet> = {
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

  const handleCancel = () => {
    if (!loading && bet) {
      setFormData({
        status: bet.status,
        return_amount: bet.return_amount || 0,
      });
      setError(null);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bet</DialogTitle>
          <DialogDescription>
            Update the status and outcome of your bet.
          </DialogDescription>
        </DialogHeader>

        {/* Bet Info Display */}
        <div className="bg-surface-secondary/50 p-3 rounded-md space-y-1">
          <div className="font-medium">{bet.description}</div>
          <div className="text-sm text-text-secondary">
            {bet.odds > 0 ? "+" : ""}
            {bet.odds} • {formatCurrency(bet.wager_amount)} wager
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    ? "bg-pending hover:bg-pending/90"
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
                  (profit: {formatCurrency(expectedReturn - bet.wager_amount)})
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

          {error && (
            <div className="text-sm text-loss bg-loss/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Bet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
