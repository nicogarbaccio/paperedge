import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { useFeatureRequests } from "@/hooks/useFeatureRequests";
import { toast } from "@/hooks/useToast";

interface FeatureRequestFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: "nice_to_have" | "important" | "critical";
  related_features: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function FeatureRequestForm({
  onClose,
  onSuccess,
}: FeatureRequestFormProps) {
  const {
    submitFeatureRequest,
    submitting,
    error: submitError,
  } = useFeatureRequests();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priority: "important",
    related_features: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus on first input when form opens
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Close form after successful submission
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose, onSuccess]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await submitFeatureRequest({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      related_features: formData.related_features.trim() || undefined,
    });

    if (result) {
      setIsSubmitted(true);
      toast({
        title: "Feature request submitted",
        description: "Thank you! The community can now vote on your idea.",
        variant: "success",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "important",
        related_features: "",
      });
    } else if (submitError) {
      toast({
        title: "Error submitting feature request",
        description: submitError,
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const priorityOptions = [
    { value: "nice_to_have", label: "Nice to have" },
    { value: "important", label: "Important" },
    { value: "critical", label: "Critical" },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Request a Feature</CardTitle>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors p-1 sm:p-0"
          aria-label="Close feature request form"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info box */}
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs sm:text-sm text-text-secondary">
              💡 <strong>Tip:</strong> Describe what you want to achieve and how
              it would help you. The community will vote on features they want
              most!
            </p>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Feature Title *
            </Label>
            <Input
              ref={titleInputRef}
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Dark mode support"
              value={formData.title}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={255}
              disabled={submitting}
              className={errors.title ? "border-red-500" : ""}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="flex items-center gap-1 text-xs text-red-500"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-text-secondary">
              {formData.title.length}/255
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="Explain what you want and why it would be helpful"
              value={formData.description}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              rows={5}
              disabled={submitting}
              className={`w-full rounded-md border px-3 py-2 text-sm resize-vertical ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-accent"
              } bg-background text-text-primary placeholder-text-secondary focus:outline-none transition-colors`}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
            />
            {errors.description && (
              <p
                id="description-error"
                className="flex items-center gap-1 text-xs text-red-500"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-text-secondary">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Priority Field */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority Level
            </Label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
              aria-label="Priority level"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Related Features Field */}
          <div className="space-y-2">
            <Label htmlFor="related_features" className="text-sm font-medium">
              Related Features (Optional)
            </Label>
            <Input
              id="related_features"
              name="related_features"
              type="text"
              placeholder="e.g., Keyboard shortcuts, custom themes"
              value={formData.related_features}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={255}
              disabled={submitting}
              aria-label="Related features"
            />
            <p className="text-xs text-text-secondary">
              {formData.related_features.length}/255
            </p>
          </div>

          {/* Community Info */}
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs sm:text-sm text-text-secondary">
              🤝 <strong>Community-driven:</strong> Other users can vote up
              features they want. Popular features get prioritized for
              development!
            </p>
          </div>

          {/* Error message */}
          {submitError && (
            <div className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Success message */}
          {isSubmitted && (
            <div className="flex gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
              <p className="text-xs sm:text-sm text-green-600">
                ✨ Feature request submitted! The community can now vote on your
                idea.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || isSubmitted}
              className="w-full gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submitted</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request</span>
                </>
              )}
            </Button>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-text-secondary text-center pt-2">
            💡 Tip: Press <kbd>Ctrl+Enter</kbd> (or <kbd>Cmd+Enter</kbd> on Mac)
            to submit
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default FeatureRequestForm;
