import { useState, useEffect } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import type { CustomColumn } from "@/hooks/useNotebook";

interface CustomColumnsFieldsProps {
  customColumns: CustomColumn[];
  customValues: Record<string, string>;
  setCustomValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading?: boolean;
  autoExpand?: boolean;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Filter out "other" options (case-insensitive, handles various unicode ellipses)
 */
function filterOtherOptions(options: string[]): string[] {
  return options.filter((opt) => {
    const o = `${opt}`.trim().toLowerCase();
    return o !== "other" && o !== "other..." && o !== "other…";
  });
}

/**
 * Deduplicate custom columns by column_name (case-insensitive)
 */
function deduplicateColumns(columns: CustomColumn[]): CustomColumn[] {
  return columns.filter(
    (col, idx, arr) =>
      arr.findIndex(
        (c) => c.column_name.toLowerCase() === col.column_name.toLowerCase()
      ) === idx
  );
}

export function CustomColumnsFields({
  customColumns,
  customValues,
  setCustomValues,
  loading = false,
  autoExpand = false,
}: CustomColumnsFieldsProps) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [otherMode, setOtherMode] = useState<Record<string, boolean>>({});

  // Auto-expand if autoExpand prop is true or if there are pre-filled values
  useEffect(() => {
    if (autoExpand || (customValues && Object.keys(customValues).length > 0)) {
      setShowAdditional(true);
    }
  }, [autoExpand, customValues]);

  if (!customColumns || customColumns.length === 0) {
    return null;
  }

  const dedupedColumns = deduplicateColumns(customColumns);

  return (
    <div className="space-y-2" data-testid="custom-fields-container">
      <button
        type="button"
        className="text-sm text-accent underline"
        onClick={() => setShowAdditional((s) => !s)}
        data-testid="custom-fields-toggle-button"
      >
        {showAdditional ? "Hide" : "Show"} additional fields
      </button>
      {showAdditional && (
        <div className="space-y-3" data-testid="custom-fields-panel">
          {dedupedColumns.map((col) => {
            const options = col.select_options || [];
            const filteredOptions = filterOtherOptions(options);
            const currentVal = customValues[col.id] ?? "";
            const isInOptions = filteredOptions.includes(currentVal);
            const isOtherSelected =
              otherMode[col.id] || (!!currentVal && !isInOptions);
            const selectValue = isOtherSelected ? "__OTHER__" : currentVal;

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
                          setCustomValues((prev) => ({
                            ...prev,
                            [col.id]: prev[col.id] ?? "",
                          }));
                        } else {
                          setOtherMode((prev) => ({
                            ...prev,
                            [col.id]: false,
                          }));
                          setCustomValues((prev) => ({
                            ...prev,
                            [col.id]: value,
                          }));
                        }
                      }}
                      data-testid={`custom-field-select-${col.column_name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <option value="">Select...</option>
                      {filteredOptions.map((opt) => (
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
                          setCustomValues((prev) => ({
                            ...prev,
                            [col.id]: e.target.value,
                          }))
                        }
                        disabled={loading}
                        className="mt-2"
                        data-testid={`custom-field-other-input-${col.column_name.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                    )}
                  </>
                ) : (
                  <Input
                    id={`col-${col.id}`}
                    type={col.column_type === "number" ? "number" : "text"}
                    value={currentVal}
                    onChange={(e) =>
                      setCustomValues((prev) => ({
                        ...prev,
                        [col.id]: e.target.value,
                      }))
                    }
                    disabled={loading}
                    data-testid={`custom-field-input-${col.column_name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
