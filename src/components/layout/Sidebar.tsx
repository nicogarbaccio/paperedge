import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Calculator,
  Settings,
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
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Calculators",
    href: "/calculators",
    icon: Calculator,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:h-full">
      <div className="flex flex-col h-full overflow-y-auto border-r border-border bg-surface">
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
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
      </div>
    </div>
  );
}
