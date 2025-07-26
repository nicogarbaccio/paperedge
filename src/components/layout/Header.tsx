import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-accent-foreground">PE</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">PaperEdge</h1>
            <p className="text-xs text-text-secondary">
              Gain Your Edge Through Paper Trading
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-text-secondary" />
                <span className="text-text-secondary">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
