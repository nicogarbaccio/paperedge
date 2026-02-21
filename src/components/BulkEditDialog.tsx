import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import type { CustomColumn } from "@/hooks/useNotebook";

const BET_SIZE_FIELD_ID = "__bet_size__";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  customColumns: CustomColumn[];
  onApplyCustom: (columnId: string, value: string) => Promise<void>;
  onApplyBetSize: (wagerAmount: number) => Promise<void>;
}

const BULK_EDITABLE_FIELDS = ["unit size", "market", "league"];

function filterOtherOptions(options: string[]): string[] {
  return options.filter((opt) => {
    const o = `${opt}`.trim().toLowerCase();
    return o !== "other" && o !== "other..." && o !== "other…";
  });
}

export function BulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  customColumns,
  onApplyCustom,
  onApplyBetSize,
}: BulkEditDialogProps) {
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [value, setValue] = useState("");
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const editableColumns = useMemo(() => {
    return customColumns.filter((col) =>
      BULK_EDITABLE_FIELDS.includes(col.column_name.toLowerCase())
    );
  }, [customColumns]);

  const isBetSizeSelected = selectedFieldId === BET_SIZE_FIELD_ID;

  const selectedColumn = useMemo(() => {
    if (isBetSizeSelected) return null;
    return editableColumns.find((col) => col.id === selectedFieldId) ?? null;
  }, [editableColumns, selectedFieldId, isBetSizeSelected]);

  const filteredOptions = useMemo(() => {
    if (!selectedColumn?.select_options) return [];
    return filterOtherOptions(selectedColumn.select_options);
  }, [selectedColumn]);

  function handleFieldChange(fieldId: string) {
    setSelectedFieldId(fieldId);
    setValue("");
    setIsOtherMode(false);
  }

  function handleSelectChange(val: string) {
    if (val === "__OTHER__") {
      setIsOtherMode(true);
      setValue("");
    } else {
      setIsOtherMode(false);
      setValue(val);
    }
  }

  async function handleApply() {
    if (!selectedFieldId || !value.trim()) return;
    setIsApplying(true);
    try {
      if (isBetSizeSelected) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) return;
        await onApplyBetSize(numValue);
      } else {
        await onApplyCustom(selectedFieldId, value.trim());
      }
      onOpenChange(false);
      resetState();
    } finally {
      setIsApplying(false);
    }
  }

  function resetState() {
    setSelectedFieldId("");
    setValue("");
    setIsOtherMode(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  }

  const isSelectType = selectedColumn?.column_type === "select";
  const hasValue = isBetSizeSelected
    ? !!value.trim() && !isNaN(parseFloat(value)) && parseFloat(value) > 0
    : !!value.trim();
  const canApply = !!selectedFieldId && hasValue && !isApplying;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Edit</DialogTitle>
          <DialogDescription>
            Apply a value to {selectedCount} selected{" "}
            {selectedCount === 1 ? "bet" : "bets"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Field selector */}
          <div className="space-y-1">
            <Label htmlFor="bulk-edit-field">Field</Label>
            <select
              id="bulk-edit-field"
              className="select-with-arrow w-full h-10 rounded-md border border-border bg-input pl-3 !pr-12 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              value={selectedFieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
              data-testid="bulk-edit-field-select"
            >
              <option value="">Select a field...</option>
              <option value={BET_SIZE_FIELD_ID}>Bet Size</option>
              {editableColumns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.column_name.charAt(0).toUpperCase() +
                    col.column_name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Value input - Bet Size (core field) */}
          {isBetSizeSelected && (
            <div className="space-y-1">
              <Label htmlFor="bulk-edit-value">Wager Amount ($)</Label>
              <Input
                id="bulk-edit-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter wager amount"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                data-testid="bulk-edit-value-input"
              />
            </div>
          )}

          {/* Value input - Custom column */}
          {selectedColumn && (
            <div className="space-y-1">
              <Label htmlFor="bulk-edit-value">Value</Label>
              {isSelectType && !isOtherMode ? (
                <select
                  id="bulk-edit-value"
                  className="select-with-arrow w-full h-10 rounded-md border border-border bg-input pl-3 !pr-12 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                  value={value}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  data-testid="bulk-edit-value-select"
                >
                  <option value="">Select...</option>
                  {filteredOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="__OTHER__">Other...</option>
                </select>
              ) : (
                <Input
                  id="bulk-edit-value"
                  type={selectedColumn.column_type === "number" ? "number" : "text"}
                  placeholder={`Enter ${selectedColumn.column_name}`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  data-testid="bulk-edit-value-input"
                />
              )}
              {isSelectType && isOtherMode && (
                <button
                  type="button"
                  className="text-xs text-accent underline mt-1"
                  onClick={() => {
                    setIsOtherMode(false);
                    setValue("");
                  }}
                >
                  Back to options
                </button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!canApply}
            data-testid="bulk-edit-apply-button"
          >
            {isApplying
              ? "Applying..."
              : `Apply to ${selectedCount} ${selectedCount === 1 ? "bet" : "bets"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
