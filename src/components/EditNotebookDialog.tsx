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
import { NOTEBOOK_COLORS, DEFAULT_NOTEBOOK_COLOR } from "@/lib/notebookColors";
import { cn } from "@/lib/utils";

interface Notebook {
  id: string;
  name: string;
  description: string | null;
  starting_bankroll: number;
  current_bankroll: number;
  color: string | null;
}

interface EditNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebook: Notebook | null;
  onUpdateNotebook: (
    id: string,
    updates: { name?: string; description?: string | null; color?: string }
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
    color: DEFAULT_NOTEBOOK_COLOR.id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (notebook && open) {
      setFormData({
        name: notebook.name,
        description: notebook.description || "",
        color: notebook.color || DEFAULT_NOTEBOOK_COLOR.id,
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
        description: formData.description.trim() || null,
        color: formData.color,
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
        color: notebook.color || DEFAULT_NOTEBOOK_COLOR.id,
      });
      setError(null);
      onOpenChange(false);
    }
  };

  if (!notebook) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="edit-notebook-dialog">
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
              data-testid="edit-notebook-name-input"
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
              data-testid="edit-notebook-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-9 gap-2" data-testid="edit-notebook-color-picker">
              {NOTEBOOK_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                    color.preview,
                    formData.color === color.id
                      ? "border-text-primary ring-2 ring-accent ring-offset-2"
                      : "border-border hover:border-text-secondary"
                  )}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color: color.id }))
                  }
                  disabled={loading}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                  data-testid={`edit-notebook-color-${color.id}`}
                />
              ))}
            </div>
            <p className="text-xs text-text-secondary">
              Choose a color to help organize your notebooks
            </p>
          </div>

          {error && (
            <div
              className="text-sm text-loss bg-loss/10 p-3 rounded-md"
              data-testid="edit-notebook-dialog-error"
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
              data-testid="edit-notebook-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="edit-notebook-save-button"
            >
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
