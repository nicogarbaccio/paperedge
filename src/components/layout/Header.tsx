import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-6">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">PaperEdge</h1>
            <p className="text-xs text-text-secondary">
              Gain Your Edge Through Paper Trading
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link
                to="/settings"
                className="flex items-center space-x-2 text-sm cursor-pointer hover:text-text-primary transition-colors"
              >
                <User className="h-4 w-4 text-text-secondary" />
                <span className="text-text-secondary hover:text-text-primary transition-colors">
                  {user.email}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 hover:bg-loss/10 hover:text-loss transition-colors"
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
