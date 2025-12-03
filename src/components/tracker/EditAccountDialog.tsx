import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Account } from "@/hooks/useAccounts";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account: Account | null;
  onUpdate: (
    id: string,
    updates: { name?: string; kind?: Account["kind"] }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onUpdate,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Account["kind"]>("main");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && account) {
      setName(account.name);
      setKind(account.kind);
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [open, account]);

  async function handleSave() {
    if (!account) return;
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(account.id, { name: name.trim(), kind });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!account) return;
    setIsDeleting(true);
    try {
      await onDelete(account.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="edit-account-dialog">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                kind === "main"
                  ? "e.g., DraftKings, FanDuel, BetMGM..."
                  : "e.g., My Account..."
              }
              data-testid="edit-account-name-input"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Type</label>
            <div className="relative">
              <select
                className="flex h-10 w-full appearance-none rounded-md border border-border bg-input px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={kind}
                onChange={(e) => setKind(e.target.value as Account["kind"])}
                data-testid="edit-account-type-select"
              >
                <option value="main">Sportsbook</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="bg-loss/10 border border-loss/20 p-4 rounded-md space-y-3">
            <div className="text-sm text-loss font-medium">
              Are you sure you want to delete this account?
            </div>
            <div className="text-xs text-text-secondary">
              This will permanently delete the account and all associated daily
              P/L records. This action cannot be undone.
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                data-testid="edit-account-delete-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-loss border-loss hover:bg-loss hover:text-white"
                data-testid="edit-account-delete-confirm-button"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="!flex-row !justify-between items-center !space-y-0 !space-x-0">
          <div className="flex-shrink-0">
            {!showDeleteConfirm && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-loss border-loss hover:bg-loss hover:text-white"
                disabled={isSaving}
                data-testid="edit-account-delete-button"
              >
                Delete Account
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isDeleting}
              data-testid="edit-account-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || !name.trim() || isDeleting || showDeleteConfirm
              }
              data-testid="edit-account-save-button"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditAccountDialog;
