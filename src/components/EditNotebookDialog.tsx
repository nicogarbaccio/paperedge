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

interface Notebook {
  id: string;
  name: string;
  description: string | null;
  starting_bankroll: number;
  current_bankroll: number;
}

interface EditNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebook: Notebook | null;
  onUpdateNotebook: (
    id: string,
    updates: { name?: string; description?: string }
  ) => Promise<void>;
}

export function EditNotebookDialog({
  open,
  onOpenChange,
  notebook,
  onUpdateNotebook,
}: EditNotebookDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notebook && open) {
      setFormData({
        name: notebook.name,
        description: notebook.description || "",
      });
      setError(null);
    }
  }, [notebook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notebook) return;

    if (!formData.name.trim()) {
      setError("Notebook name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onUpdateNotebook(notebook.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to update notebook");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading && notebook) {
      setFormData({
        name: notebook.name,
        description: notebook.description || "",
      });
      setError(null);
      onOpenChange(false);
    }
  };

  if (!notebook) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Notebook</DialogTitle>
          <DialogDescription>
            Update your notebook's name and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Notebook Name *</Label>
            <Input
              id="name"
              placeholder="e.g., NBA Player Props"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of your strategy..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

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
                  Updating...
                </>
              ) : (
                "Update Notebook"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
