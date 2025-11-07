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

        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DraftKings, Offshore A..."
              data-testid="edit-account-name-input"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Type</label>
            <select
              className="w-full border border-border rounded-md bg-background p-2 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as Account["kind"])}
              data-testid="edit-account-type-select"
            >
              <option value="main">Main</option>
              <option value="offshore">Offshore</option>
              <option value="other">Other</option>
            </select>
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

        <DialogFooter className="flex justify-between items-center">
          {!showDeleteConfirm && (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-loss hover:text-loss hover:bg-loss/10"
              disabled={isSaving}
              data-testid="edit-account-delete-button"
            >
              Delete Account
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="ghost"
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
