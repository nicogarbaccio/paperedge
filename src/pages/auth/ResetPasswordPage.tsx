import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err: any) {
      setError(err.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession === false && (
            <div
              className="mb-4 text-sm text-loss bg-loss/10 border border-loss/20 rounded-md p-3"
              data-testid="reset-password-invalid-link-message"
            >
              Password reset link is invalid or expired. Please request a new one from Settings.
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div
                className="text-sm text-profit bg-profit/10 border border-profit/20 rounded-md p-3"
                data-testid="reset-password-success-message"
              >
                Password updated successfully. Redirecting to dashboard...
              </div>
              <div className="text-center text-sm">
                <Link
                  to="/dashboard"
                  className="text-accent hover:underline"
                  data-testid="reset-password-go-to-dashboard-link"
                >
                  Go now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="new-password-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="new-password-confirm-input"
                />
              </div>
              {error && (
                <div
                  className="text-sm text-loss bg-loss/10 border border-loss/20 rounded-md p-3"
                  data-testid="reset-password-error-message"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || hasSession === false}
                data-testid="new-password-submit-button"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <div className="mt-2 text-center text-xs text-text-secondary">
                Having trouble? Return to <Link
                  to="/login"
                  className="text-accent hover:underline"
                  data-testid="reset-password-back-to-login-link"
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

