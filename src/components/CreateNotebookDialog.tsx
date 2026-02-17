import { useState } from "react";
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

interface CreateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNotebook: (data: {
    name: string;
    description?: string;
    starting_bankroll: number;
    color?: string;
    unit_size: number;
  }) => Promise<void>;
}

export function CreateNotebookDialog({
  open,
  onOpenChange,
  onCreateNotebook,
}: CreateNotebookDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    starting_bankroll: 1000,
    color: DEFAULT_NOTEBOOK_COLOR.id,
    unit_size: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Notebook name is required");
      return;
    }

    if (formData.starting_bankroll <= 0) {
      setError("Starting bankroll must be greater than 0");
      return;
    }

    if (formData.unit_size <= 0) {
      setError("Unit size must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onCreateNotebook({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        starting_bankroll: formData.starting_bankroll,
        color: formData.color,
        unit_size: formData.unit_size,
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        starting_bankroll: 1000,
        color: DEFAULT_NOTEBOOK_COLOR.id,
        unit_size: 100,
      });
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to create notebook");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        starting_bankroll: 1000,
        color: DEFAULT_NOTEBOOK_COLOR.id,
        unit_size: 100,
      });
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        data-testid="create-notebook-dialog"
      >
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
          <DialogDescription>
            Create a new betting strategy notebook to track your performance.
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
              data-testid="notebook-name-input"
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
              data-testid="notebook-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starting_bankroll">Starting Bankroll *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <Input
                  id="starting_bankroll"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="1000.00"
                  value={formData.starting_bankroll}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      starting_bankroll: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={loading}
                  className="pl-8"
                  required
                  data-testid="notebook-starting-bankroll-input"
                />
              </div>
              <p className="text-xs text-text-secondary">
                Your initial bankroll amount.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_size">Unit Size *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <Input
                  id="unit_size"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.unit_size}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit_size: parseFloat(e.target.value) || 0,
                    }))
                  }
                  disabled={loading}
                  className="pl-8"
                  required
                  data-testid="notebook-unit-size-input"
                />
              </div>
              <p className="text-xs text-text-secondary">
                Your standard bet size.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div
              className="grid grid-cols-9 gap-2"
              data-testid="notebook-color-picker"
            >
              {NOTEBOOK_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
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
                  data-testid={`notebook-color-${color.id}`}
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
              data-testid="notebook-dialog-error"
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
              data-testid="notebook-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              data-testid="notebook-save-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Notebook"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
