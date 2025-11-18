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

interface CasinoTransactionData {
  deposited_usd?: number | null;
  withdrew_usd?: number | null;
  in_casino?: number | null;
  usd_value?: number | null;
  tokens_received?: string | null;
  deposit_method?: string | null;
  note?: string | null;
}

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
      casinoData?: CasinoTransactionData;
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

  const initialCasino = useMemo(() => {
    const map: Record<string, CasinoTransactionData> = {};
    for (const a of accounts) {
      const data = valuesForDate?.byAccount[a.id];
      map[a.id] = {
        deposited_usd: data?.deposited_usd ?? null,
        withdrew_usd: data?.withdrew_usd ?? null,
        in_casino: data?.in_casino ?? null,
        usd_value: data?.usd_value ?? null,
        tokens_received: data?.tokens_received ?? null,
        deposit_method: data?.deposit_method ?? null,
        note: data?.note ?? null,
      };
    }
    return map;
  }, [accounts, valuesForDate]);

  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [casinoDraft, setCasinoDraft] = useState<Record<string, CasinoTransactionData>>(initialCasino);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(initial);
    setCasinoDraft(initialCasino);
  }, [initial, initialCasino]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updates = accounts.map((a) => ({
        accountId: a.id,
        amount: Number(draft[a.id] || 0),
        casinoData: a.kind === 'casino' ? casinoDraft[a.id] : undefined,
      }));
      await onSave(updates);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function updateCasinoField(
    accountId: string,
    field: keyof CasinoTransactionData,
    value: string | number | null
  ) {
    setCasinoDraft((prev) => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [field]: value,
      },
    }));
  }

  // Auto-calculate NET from deposits/withdrawals for casino accounts
  function handleCasinoAmountChange(accountId: string, field: 'deposited_usd' | 'withdrew_usd', value: string) {
    const numValue = value ? Number(value) : null;
    updateCasinoField(accountId, field, numValue);

    // Auto-calculate NET
    const currentData = casinoDraft[accountId] || {};
    const deposited = field === 'deposited_usd' ? (numValue || 0) : (currentData.deposited_usd || 0);
    const withdrew = field === 'withdrew_usd' ? (numValue || 0) : (currentData.withdrew_usd || 0);
    const net = withdrew - deposited;

    setDraft((prev) => ({
      ...prev,
      [accountId]: String(net),
    }));
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
              accounts.map((a) => {
                const isCasino = a.kind === 'casino';
                const casinoData = casinoDraft[a.id] || {};

                return (
                  <div
                    key={a.id}
                    className="border border-border rounded-lg p-3 space-y-3"
                    data-testid="daily-pl-account-row"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{a.name}</div>
                        <div className="text-xs text-text-secondary">
                          {getAccountKindLabel(a.kind)}
                        </div>
                      </div>
                      {!isCasino && (
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
                      )}
                    </div>

                    {isCasino && (
                      <div className="space-y-3 bg-surface-secondary/30 rounded-md p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Deposited USD
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={casinoData.deposited_usd ?? ""}
                              onChange={(e) =>
                                handleCasinoAmountChange(a.id, 'deposited_usd', e.target.value)
                              }
                              placeholder="0.00"
                              data-testid={`casino-deposited-${a.id}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Withdrew USD
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={casinoData.withdrew_usd ?? ""}
                              onChange={(e) =>
                                handleCasinoAmountChange(a.id, 'withdrew_usd', e.target.value)
                              }
                              placeholder="0.00"
                              data-testid={`casino-withdrew-${a.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              In Casino
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={casinoData.in_casino ?? ""}
                              onChange={(e) =>
                                updateCasinoField(a.id, 'in_casino', e.target.value ? Number(e.target.value) : null)
                              }
                              placeholder="0.00"
                              data-testid={`casino-balance-${a.id}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              NET (Auto)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={draft[a.id] ?? ""}
                              readOnly
                              className="bg-surface-secondary"
                              data-testid={`casino-net-${a.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Promo Value USD
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={casinoData.usd_value ?? ""}
                              onChange={(e) =>
                                updateCasinoField(a.id, 'usd_value', e.target.value ? Number(e.target.value) : null)
                              }
                              placeholder="0.00"
                              data-testid={`casino-promo-${a.id}`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary block mb-1">
                              Tokens Received
                            </label>
                            <Input
                              type="text"
                              value={casinoData.tokens_received ?? ""}
                              onChange={(e) =>
                                updateCasinoField(a.id, 'tokens_received', e.target.value || null)
                              }
                              placeholder="1000 points"
                              data-testid={`casino-tokens-${a.id}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-text-secondary block mb-1">
                            Deposit Method
                          </label>
                          <Input
                            type="text"
                            value={casinoData.deposit_method ?? ""}
                            onChange={(e) =>
                              updateCasinoField(a.id, 'deposit_method', e.target.value || null)
                            }
                            placeholder="Credit Card, Crypto, etc."
                            data-testid={`casino-method-${a.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-text-secondary block mb-1">
                            Notes
                          </label>
                          <Input
                            type="text"
                            value={casinoData.note ?? ""}
                            onChange={(e) =>
                              updateCasinoField(a.id, 'note', e.target.value || null)
                            }
                            placeholder="Promo code, observations..."
                            data-testid={`casino-note-${a.id}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
