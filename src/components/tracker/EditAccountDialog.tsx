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
}

export function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onUpdate,
}: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Account["kind"]>("main");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && account) {
      setName(account.name);
      setKind(account.kind);
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

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Type</label>
            <select
              className="w-full border border-border rounded-md bg-background p-2 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as Account["kind"])}
            >
              <option value="main">Main</option>
              <option value="offshore">Offshore</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditAccountDialog;
