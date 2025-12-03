import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Account } from "@/hooks/useAccounts";
import { getAccountKindLabel } from "@/hooks/useAccounts";
import type { DailyPLByDate } from "@/hooks/useDailyPL";
import { formatDate } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string;
  accounts: Account[];
  valuesForDate: DailyPLByDate[string] | undefined;
  onSave: (
    updates: Array<{
      accountId: string;
      amount: number;
    }>
  ) => Promise<void>;
}

export function EditDailyPLDialog({
  open,
  onOpenChange,
  date,
  accounts,
  valuesForDate,
  onSave,
}: Props) {
  const initial = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of accounts) {
      const amt = valuesForDate?.byAccount[a.id]?.amount ?? 0;
      map[a.id] = String(amt);
    }
    return map;
  }, [accounts, valuesForDate]);

  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updates = accounts.map((a) => ({
        accountId: a.id,
        amount: Number(draft[a.id] || 0),
      }));
      await onSave(updates);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void handleSave();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-daily-pl-dialog">
        <DialogHeader>
          <DialogTitle>Edit P/L - {formatDate(date)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="contents">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {accounts.length === 0 ? (
              <div className="text-sm text-text-secondary">
                No accounts yet.
              </div>
            ) : (
              accounts.map((a) => (
                <div
                  key={a.id}
                  className="border border-border rounded-lg p-3"
                  data-testid="daily-pl-account-row"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-text-secondary">
                        {getAccountKindLabel(a.kind)}
                      </div>
                    </div>
                    <div className="w-32">
                      <label className="text-xs text-text-secondary block mb-1">
                        P/L
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={draft[a.id] ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [a.id]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        data-testid={`daily-pl-amount-input-${a.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              data-testid="daily-pl-cancel-button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} data-testid="daily-pl-save-button">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
