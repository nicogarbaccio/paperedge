import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuthStore } from "@/stores/authStore";
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
import { User, Mail, Shield, Database, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function SettingsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: getAuthRedirectUrl("/reset-password"),
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password reset email sent! Check your inbox.",
      });
      toast({
        title: "Password reset email sent",
        description:
          "Check your inbox for instructions to reset your password.",
        variant: "success",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    setMessage({
      type: "success",
      text: "Data export feature coming soon!",
    });
  };

  const handleImportData = () => {
    setMessage({
      type: "success",
      text: "Data import feature coming soon!",
    });
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold text-text-primary" data-testid="settings-page-title">Settings</h1>
        <p className="text-text-secondary">
          Manage your account and data
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md border ${
            message.type === "success"
              ? "bg-profit/10 border-profit/20 text-profit"
              : "bg-loss/10 border-loss/20 text-loss"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-surface-secondary"
              />
              <p className="text-xs text-text-secondary">
                Email address cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Unknown"
                }
                disabled
                className="bg-surface-secondary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-text-secondary">
                    Reset your account password
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="flex items-center space-x-2"
                  data-testid="settings-reset-password-button"
                >
                  <Mail className="h-4 w-4" />
                  <span>{loading ? "Sending..." : "Reset"}</span>
                </Button>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-text-secondary">
                      Additional security for your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Import, export, and manage your betting data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-text-secondary">
                    Download all your betting data as CSV
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm text-text-secondary">
                      Upload CSV file to import bets
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportData}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone (moved up) */}
        <Card className="border-loss/20">
          <CardHeader>
            <CardTitle className="text-loss">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-loss">Delete Account</h4>
                <p className="text-sm text-text-secondary">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
