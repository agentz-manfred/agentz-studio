import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { useQuery, useMutation } from "convex/react";
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
  X,
  Check,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { Search, Command } from "lucide-react";

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
  { id: "settings", label: "Einstellungen", icon: Settings },
];

const clientNav = [
  { id: "dashboard", label: "Übersicht", icon: LayoutDashboard },
  { id: "videos", label: "Videos", icon: Play },
  { id: "pipeline", label: "Pipeline", icon: Film },
  { id: "calendar", label: "Termine", icon: Calendar },
];

function NotificationPanel({
  userId,
  onClose,
  onNavigate,
}: {
  userId: Id<"users">;
  onClose: () => void;
  onNavigate?: (page: string, id?: string) => void;
}) {
  const notifications = useQuery(api.notifications.list, { userId, limit: 15 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const hasUnread = notifications?.some((n) => !n.read);

  return (
    <div
      ref={panelRef}
      className="absolute left-[240px] top-0 bottom-0 w-[320px] bg-[var(--color-surface-1)] border-r border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] z-50 flex flex-col animate-in"
    >
      <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--color-border-subtle)]">
        <span className="text-[14px] font-semibold">Benachrichtigungen</span>
        <div className="flex items-center gap-1">
          {hasUnread && (
            <button
              onClick={() => markAllRead({ userId })}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface)] transition-colors"
              title="Alle als gelesen markieren"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-tertiary)]">
            <Bell className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-[13px]">Keine Benachrichtigungen</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => {
                  if (!n.read) markRead({ notificationId: n._id });
                  if (n.targetType && n.targetId && onNavigate) {
                    onNavigate(n.targetType, n.targetId);
                    onClose();
                  }
                }}
                className={cn(
                  "w-full text-left px-5 py-3 border-b border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-accent-surface)]",
                  !n.read && "bg-[var(--color-surface-2)]/50"
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{n.title}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1 tabular-nums">
                      {new Date(n.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };
  return (
    <button
      onClick={cycle}
      className="w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-primary)] transition-all duration-150 ease-[var(--ease-out)]"
      title={`Theme: ${theme === "system" ? "System" : theme === "dark" ? "Dunkel" : "Hell"}`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="w-[18px] h-[18px]" strokeWidth={1.75} />
      ) : (
        <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
      )}
      {theme === "system" ? "System" : resolvedTheme === "dark" ? "Dunkel" : "Hell"}
    </button>
  );
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const nav = user?.role === "admin" ? adminNav : clientNav;
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useQuery(
    api.notifications.unreadCount,
    user?.userId ? { userId: user.userId as Id<"users"> } : "skip"
  );

  return (
    <aside className="w-[240px] h-screen flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] relative">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white text-[13px] font-bold leading-none">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            AgentZ Studio
          </span>
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
            document.dispatchEvent(e);
          }}
          className="w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-secondary)] transition-all duration-150 ease-[var(--ease-out)] group border border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/50"
        >
          <Search className="w-[16px] h-[16px]" strokeWidth={1.75} />
          <span className="flex-1 text-left text-[13px]">Suchen…</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 h-5 rounded bg-[var(--color-surface-0)] text-[10px] font-medium border border-[var(--color-border-subtle)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const isActive =
            currentPage === item.id ||
            (item.id === "ideas" && currentPage.startsWith("idea:")) ||
            (item.id === "clients" && currentPage.startsWith("client:")) ||
            (item.id === "videos" && currentPage.startsWith("video:"));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] transition-all duration-150 ease-[var(--ease-out)]",
                isActive
                  ? "bg-[var(--color-accent)] text-white font-medium shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Notifications */}
      <div className="px-3 py-4 border-t border-[var(--color-border-subtle)]">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] transition-all duration-150 ease-[var(--ease-out)] mb-2",
            showNotifications
              ? "bg-[var(--color-accent-surface)] text-[var(--color-text-primary)]"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-primary)]"
          )}
        >
          <div className="relative">
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-[var(--color-error)] text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          Benachrichtigungen
        </button>

        {/* User info */}
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
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && user?.userId && (
        <NotificationPanel
          userId={user.userId as Id<"users">}
          onClose={() => setShowNotifications(false)}
          onNavigate={onNavigate}
        />
      )}
    </aside>
  );
}
