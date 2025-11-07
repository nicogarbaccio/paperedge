import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  calculateProfit,
  calculatePayout,
  isValidAmericanOdds,
} from "@/lib/betting";
import { formatCurrency, getCurrentLocalDate } from "@/lib/utils";
import { CustomColumnsFields } from "@/components/CustomColumnsFields";
import type { CustomColumn } from "@/hooks/useNotebook";

interface CreateBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBet: (
    data: {
      date: string;
      description: string;
      odds: number;
      wager_amount: number;
    },
    customData?: Record<string, string>
  ) => Promise<void>;
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
  customColumns?: CustomColumn[];
  customValues?: Record<string, string>;
  setCustomValues?: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

export function CreateBetDialog({
  open,
  onOpenChange,
  onCreateBet,
  formData,
  setFormData,
  customColumns = [],
  customValues,
  setCustomValues,
}: CreateBetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open) {
      closingRef.current = false;
    }
  }, [open]);

  // Calculate potential profit and total payout for display
  const potentialProfit =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculateProfit(formData.odds, formData.wager_amount)
      : 0;

  const expectedPayout =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculatePayout(formData.odds, formData.wager_amount)
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

      await onCreateBet(
        {
          date: formData.date,
          description: formData.description.trim(),
          odds: formData.odds,
          wager_amount: formData.wager_amount,
        },
        customValues
      );

      // Form reset is handled by parent component
      closingRef.current = true;
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to create bet");
    } finally {
      if (!closingRef.current) setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      // Reset form on explicit cancel
      setFormData({
        date: getCurrentLocalDate(),
        description: "",
        odds: 0,
        wager_amount: 0,
      });
      if (setCustomValues) setCustomValues({});
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
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="create-bet-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add New Bet</DialogTitle>
          <DialogDescription>
            Record a new bet for this strategy notebook.
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
              data-testid="bet-date-input"
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
              data-testid="bet-description-input"
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
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || value === "-") {
                  // Allow empty or negative sign during input
                  setFormData((prev) => ({ ...prev, odds: 0 }));
                } else {
                  const parsedOdds = parseInt(value, 10);
                  setFormData((prev) => ({
                    ...prev,
                    odds: isNaN(parsedOdds) ? 0 : parsedOdds,
                  }));
                }
              }}
              disabled={loading}
              required
              data-testid="bet-odds-input"
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData((prev) => ({ ...prev, wager_amount: 0 }));
                  } else {
                    const parsedAmount = parseFloat(value);
                    setFormData((prev) => ({
                      ...prev,
                      wager_amount: isNaN(parsedAmount) ? 0 : parsedAmount,
                    }));
                  }
                }}
                disabled={loading}
                className="pl-8"
                required
                data-testid="bet-wager-input"
              />
            </div>
            {expectedPayout > 0 && (
              <p
                className="text-xs text-accent"
                data-testid="bet-payout-display"
              >
                Expected profit: {formatCurrency(potentialProfit)}
                <span
                  className="text-text-secondary"
                  data-testid="bet-profit-display"
                >
                  {" "}
                  (total payout: {formatCurrency(expectedPayout)})
                </span>
              </p>
            )}
          </div>

          {customColumns && customValues && setCustomValues && (
            <CustomColumnsFields
              customColumns={customColumns}
              customValues={customValues}
              setCustomValues={setCustomValues}
              loading={loading}
            />
          )}

          {error && (
            <div
              className="text-sm text-loss bg-loss/10 p-3 rounded-md"
              data-testid="bet-dialog-error"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              data-testid="bet-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="bet-save-button"
            >
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
