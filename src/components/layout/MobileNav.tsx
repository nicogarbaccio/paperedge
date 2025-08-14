import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Calendar,
  Settings,
  Menu,
  X,
  HelpCircle,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Notebooks",
    href: "/notebooks",
    icon: BookOpen,
  },
  {
    name: "Tracker",
    href: "/tracker",
    icon: Calendar,
  },
  {
    name: "Calculators",
    href: "/calculators",
    icon: Calculator,
  },
  {
    name: "FAQs",
    href: "/faqs",
    icon: HelpCircle,
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
    } catch (_) {}
  }

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Body scroll lock + focus handling + esc to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
      // focus close button on open
      setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-text-primary hover:bg-surface-secondary rounded-md"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 left-0 w-[84vw] max-w-sm bg-surface border-r border-border pt-[calc(env(safe-area-inset-top)+8px)] pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 transform transition-transform duration-200 ease-in-out z-50 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            ref={closeBtnRef}
            className="p-2 text-text-primary hover:bg-surface-secondary rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-80px)] flex-col">
          {/* Profile section */}
          {user && (
            <div className="mb-4 flex items-center gap-3 rounded-md border border-border bg-surface-secondary/40 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold uppercase">
                {(user.email || "?").slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user.email}</div>
                <Link
                  to="/settings"
                  className="text-xs text-accent hover:underline"
                >
                  View settings
                </Link>
              </div>
            </div>
          )}

          {/* Main navigation */}
          <nav className="space-y-1 overflow-y-auto pr-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-3 text-base font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6 flex-shrink-0",
                      isActive
                        ? "text-accent-foreground"
                        : "text-text-secondary group-hover:text-text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="mt-4 border-t border-border pt-3">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3 py-3 text-base font-medium rounded-md text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            >
              <Settings className="mr-3 h-6 w-6" />
              Settings
            </Link>

            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-1 flex w-full items-center px-3 py-3 text-left text-base font-medium rounded-md text-loss hover:bg-loss/10"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-1 flex items-center px-3 py-3 text-base font-medium rounded-md text-accent hover:bg-accent/10"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
