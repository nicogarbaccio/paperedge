import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/Label";
import { Loader2 } from "lucide-react";

interface DuplicateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalName: string;
  onDuplicateNotebook: (newName: string) => Promise<void>;
}

export function DuplicateNotebookDialog({
  open,
  onOpenChange,
  originalName,
  onDuplicateNotebook,
}: DuplicateNotebookDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(`Copy of ${originalName}`);
      setError(null);
    }
  }, [open, originalName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Notebook name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onDuplicateNotebook(name.trim());

      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to duplicate notebook");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="duplicate-notebook-dialog"
      >
        <DialogHeader>
          <DialogTitle>Duplicate Notebook</DialogTitle>
          <DialogDescription>
            Create a copy of <strong>{originalName}</strong> including all its bets and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duplicate-name">New Notebook Name *</Label>
            <Input
              id="duplicate-name"
              placeholder="e.g., Copy of NBA Player Props"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              data-testid="duplicate-notebook-name-input"
            />
          </div>

          {error && (
            <div
              className="text-sm text-loss bg-loss/10 p-3 rounded-md"
              data-testid="duplicate-notebook-dialog-error"
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
              data-testid="duplicate-notebook-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="duplicate-notebook-confirm-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                "Duplicate Notebook"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
