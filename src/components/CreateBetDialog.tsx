import { useMemo, useState } from "react";
import { capitalizeFirst } from "@/lib/utils";
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
  calculateReturn,
  calculatePayout,
  isValidAmericanOdds,
} from "@/lib/betting";
import { formatCurrency, getCurrentLocalDate } from "@/lib/utils";

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
  customColumns?: Array<{
    id: string;
    column_name: string;
    column_type: "text" | "number" | "select";
    select_options: string[] | null;
  }>;
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
  const [showAdditional, setShowAdditional] = useState(false);
  const [otherMode, setOtherMode] = useState<Record<string, boolean>>({});

  // Calculate potential return and profit for display
  const potentialProfit =
    formData.wager_amount > 0 && isValidAmericanOdds(formData.odds)
      ? calculateReturn(formData.odds, formData.wager_amount)
      : 0;

  const expectedReturn =
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bet</DialogTitle>
          <DialogDescription>
            Record a new bet for this strategy notebook.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
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
            {expectedReturn > 0 && (
              <p className="text-xs text-accent">
                Expected return: {formatCurrency(expectedReturn)}
                <span className="text-text-secondary">
                  {" "}
                  (profit: {formatCurrency(potentialProfit)})
                </span>
              </p>
            )}
          </div>

          {customColumns?.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                className="text-sm text-accent underline"
                onClick={() => setShowAdditional((s) => !s)}
              >
                {showAdditional ? "Hide" : "Show"} additional fields
              </button>
              {showAdditional && (
                <div className="space-y-3">
                  {customColumns
                    .filter(
                      (col, idx, arr) =>
                        arr.findIndex(
                          (c) =>
                            c.column_name.toLowerCase() ===
                            col.column_name.toLowerCase()
                        ) === idx
                    )
                    .map((col) => {
                      const options = col.select_options || [];
                      const currentVal = customValues?.[col.id] ?? "";
                      const isInOptions = options.includes(currentVal);
                      const isOtherSelected =
                        otherMode[col.id] || (!!currentVal && !isInOptions);
                      const selectValue = isOtherSelected
                        ? "__OTHER__"
                        : currentVal;

                      return (
                        <div key={col.id} className="space-y-1">
                          <Label htmlFor={`col-${col.id}`}>
                            {capitalizeFirst(col.column_name)}
                          </Label>
                          {col.column_type === "select" ? (
                            <>
                              <select
                                id={`col-${col.id}`}
                                className="w-full rounded-md border border-border bg-surface p-2 text-sm"
                                disabled={loading}
                                value={selectValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "__OTHER__") {
                                    setOtherMode((prev) => ({
                                      ...prev,
                                      [col.id]: true,
                                    }));
                                    // Keep existing text if any; otherwise empty string
                                    setCustomValues?.((prev) => ({
                                      ...(prev || {}),
                                      [col.id]: prev?.[col.id] ?? "",
                                    }));
                                  } else {
                                    setOtherMode((prev) => ({
                                      ...prev,
                                      [col.id]: false,
                                    }));
                                    setCustomValues?.((prev) => ({
                                      ...(prev || {}),
                                      [col.id]: value,
                                    }));
                                  }
                                }}
                              >
                                <option value="">Select...</option>
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                                <option value="__OTHER__">Other…</option>
                              </select>
                              {isOtherSelected && (
                                <Input
                                  id={`col-${col.id}-other`}
                                  placeholder={`Enter ${col.column_name}`}
                                  value={currentVal}
                                  onChange={(e) =>
                                    setCustomValues?.((prev) => ({
                                      ...(prev || {}),
                                      [col.id]: e.target.value,
                                    }))
                                  }
                                  disabled={loading}
                                  className="mt-2"
                                />
                              )}
                            </>
                          ) : (
                            <Input
                              id={`col-${col.id}`}
                              type={
                                col.column_type === "number" ? "number" : "text"
                              }
                              value={currentVal}
                              onChange={(e) =>
                                setCustomValues?.((prev) => ({
                                  ...(prev || {}),
                                  [col.id]: e.target.value,
                                }))
                              }
                              disabled={loading}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
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
