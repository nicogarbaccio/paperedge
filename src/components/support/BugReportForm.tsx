import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBugReports } from "@/hooks/useBugReports";
import { toast } from "@/hooks/useToast";

interface BugReportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface FormErrors {
  title?: string;
  description?: string;
}

function getBrowserInfo(): Record<string, string> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: String(window.screen.width),
    screenHeight: String(window.screen.height),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function BugReportForm({ onClose, onSuccess }: BugReportFormProps) {
  const { submitBugReport, submitting, error: submitError } = useBugReports();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    severity: "medium",
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
    const browserInfo = getBrowserInfo();
    const result = await submitBugReport({
      title: formData.title.trim(),
      description: formData.description.trim(),
      severity: formData.severity,
      browser_info: browserInfo,
    });

    if (result) {
      setIsSubmitted(true);
      toast({
        title: "Bug report submitted",
        description: "Thank you for helping us improve PaperEdge!",
        variant: "success",
      });
      setFormData({ title: "", description: "", severity: "medium" });
    } else if (submitError) {
      toast({
        title: "Error submitting bug report",
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

  const severityOptions = [
    { value: "low", label: "Low - Minor issue" },
    { value: "medium", label: "Medium - Noticeable issue" },
    { value: "high", label: "High - Major issue" },
    { value: "critical", label: "Critical - App breaking" },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Report a Bug</CardTitle>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors p-1 sm:p-0"
          aria-label="Close bug report form"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info box */}
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs sm:text-sm text-text-secondary">
              💡 <strong>Tip:</strong> Include clear steps to reproduce the
              issue and what you expected to happen.
            </p>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Bug Title *
            </Label>
            <Input
              ref={titleInputRef}
              id="title"
              name="title"
              type="text"
              placeholder="Describe the bug briefly"
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
              placeholder="Provide detailed information about the issue, including steps to reproduce"
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

          {/* Severity Field */}
          <div className="space-y-2">
            <Label htmlFor="severity" className="text-sm font-medium">
              Severity Level
            </Label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
              aria-label="Severity level"
            >
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Browser Info Notice */}
          <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <p className="text-xs sm:text-sm text-text-secondary">
              ℹ️ <strong>Browser info will be automatically included</strong>{" "}
              (user agent, platform, language, screen resolution, timezone)
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
                ✨ Bug report submitted successfully! Thank you for your
                feedback.
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
                  <span>Submit Bug Report</span>
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

export default BugReportForm;
