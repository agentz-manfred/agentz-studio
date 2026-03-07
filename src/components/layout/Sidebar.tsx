import { useAuth } from "../../lib/auth";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  Users,
  Film,
  Calendar,
  LogOut,
  Lightbulb,
  Play,
  Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Pipeline", icon: Film },
  { id: "clients", label: "Kunden", icon: Users },
  { id: "ideas", label: "Ideen", icon: Lightbulb },
  { id: "videos", label: "Videos", icon: Play },
  { id: "calendar", label: "Kalender", icon: Calendar },
];

const clientNav = [
  { id: "dashboard", label: "Übersicht", icon: LayoutDashboard },
  { id: "pipeline", label: "Meine Videos", icon: Film },
  { id: "calendar", label: "Termine", icon: Calendar },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const nav = user?.role === "admin" ? adminNav : clientNav;
  const unreadCount = useQuery(
    api.notifications.unreadCount,
    user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  return (
    <aside className="w-[240px] h-screen flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)]">
        <span className="text-[16px] font-semibold tracking-[-0.01em]">
          AgentZ Studio
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] transition-all duration-150 ease-[var(--ease-out)]",
              currentPage === item.id || (item.id === "ideas" && currentPage.startsWith("idea:")) || (item.id === "videos" && currentPage.startsWith("video:"))
                ? "bg-[var(--color-accent)] text-white font-medium"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <item.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between px-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">{user?.name}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">
              {user?.role === "admin" ? "Admin" : "Kunde"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
