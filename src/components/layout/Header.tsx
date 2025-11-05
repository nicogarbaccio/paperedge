import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { useState, useRef, useEffect } from "react";
import { useAdminRole } from "@/hooks/useAdminRole";

export function Header() {
  const { user } = useAuthStore();
  const { isAdmin } = useAdminRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center">
          <div className="md:hidden mr-4">
            <MobileNav />
          </div>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            data-testid="header-dashboard-link"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-surface-secondary flex items-center justify-center">
              <span className="text-base sm:text-lg">📊</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                PaperEdge
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                Your practice ground for profits
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-sm cursor-pointer hover:text-text-primary transition-colors px-3 py-2 rounded-md hover:bg-surface-secondary"
                data-testid="header-user-menu-button"
              >
                <User className="h-4 w-4 text-text-secondary" />
                <span className="text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
                  {user.email}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg z-50"
                  data-testid="header-user-menu"
                >
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                      data-testid="header-settings-link"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
                        data-testid="header-admin-link"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-loss/10 hover:text-loss transition-colors text-left"
                      data-testid="header-logout-button"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
