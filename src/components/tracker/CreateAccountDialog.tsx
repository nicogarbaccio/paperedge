import { useState } from "react";
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

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (input: { name: string; kind: Account["kind"] }) => Promise<void>;
}

export function CreateAccountDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Account["kind"]>("main");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onCreate({ name: name.trim(), kind });
      setName("");
      setKind("main");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
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
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
