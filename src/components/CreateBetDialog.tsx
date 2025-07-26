import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { calculateReturn, isValidAmericanOdds } from "@/lib/betting";
import { formatCurrency } from "@/lib/utils";

interface CreateBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBet: (data: {
    date: string;
    description: string;
    odds: number;
    wager_amount: number;
  }) => Promise<void>;
  formData: {
    date: string;
    description: string;
    odds: number;
    wager_amount: number;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      date: string;
      description: string;
      odds: number;
      wager_amount: number;
    }>
  >;
}

export function CreateBetDialog({
  open,
  onOpenChange,
  onCreateBet,
  formData,
  setFormData,
}: CreateBetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate potential return for display
  const potentialReturn =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculateReturn(formData.odds, formData.wager_amount)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      setLoading(true);
      setError(null);

      await onCreateBet({
        date: formData.date,
        description: formData.description.trim(),
        odds: formData.odds,
        wager_amount: formData.wager_amount,
      });

      // Form reset is handled by parent component
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to create bet");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      // Reset form on explicit cancel
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        odds: 0,
        wager_amount: 0,
      });
      setError(null);
      onOpenChange(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !loading) {
      // Don't reset form data when dialog closes (tab switch, etc.)
      // Only clear errors
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bet</DialogTitle>
          <DialogDescription>
            Record a new bet for this strategy notebook.
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
              autoFocus
              required
            />
            <p className="text-xs text-text-secondary">
              Describe the bet (team, spread, total, etc.)
            </p>
          </div>

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
            <p className="text-xs text-text-secondary">
              Enter American odds (positive for underdogs, negative for
              favorites)
            </p>
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
            {potentialReturn > 0 && (
              <p className="text-xs text-accent">
                Potential return: {formatCurrency(potentialReturn)}
                <span className="text-text-secondary">
                  {" "}
                  (profit:{" "}
                  {formatCurrency(potentialReturn - formData.wager_amount)})
                </span>
              </p>
            )}
          </div>

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
                  Adding Bet...
                </>
              ) : (
                "Add Bet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
