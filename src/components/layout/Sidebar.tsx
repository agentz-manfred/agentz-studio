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
  FolderOpen,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useClientFilter } from "../../lib/clientFilter";
import { cn } from "../../lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { Search, Command, ChevronDown } from "lucide-react";

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
  { id: "library", label: "Mediathek", icon: FolderOpen },
  { id: "calendar", label: "Kalender", icon: Calendar },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Einstellungen", icon: Settings },
];

const clientNav = [
  { id: "dashboard", label: "Übersicht", icon: LayoutDashboard },
  { id: "videos", label: "Videos", icon: Play },
  { id: "pipeline", label: "Pipeline", icon: Film },
  { id: "calendar", label: "Termine", icon: Calendar },
];

function NotificationPanel({
  token,
  onClose,
  onNavigate,
}: {
  token: string;
  onClose: () => void;
  onNavigate?: (page: string, id?: string) => void;
}) {
  const notifications = useQuery(api.notifications.list, { token, limit: 15 });
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
              onClick={() => markAllRead({ token })}
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
                  if (!n.read) markRead({ token, notificationId: n._id });
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

function ClientFilterDropdown() {
  const clients = useQuery(api.clients.list);
  const { selectedClientId, setSelectedClientId } = useClientFilter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedClient = (clients || []).find(c => c._id === selectedClientId);

  return (
    <div className="px-3 pb-1" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-3 h-8 rounded-[var(--radius-sm)] text-[13px] transition-all duration-150",
          selectedClientId
            ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium border border-[var(--color-accent)]/20"
            : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-surface)] border border-transparent"
        )}
      >
        <Users className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left truncate">
          {selectedClient ? selectedClient.name : "Alle Kunden"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 py-1 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] shadow-[var(--shadow-lg)] max-h-[240px] overflow-auto z-50 relative">
          <button
            onClick={() => { setSelectedClientId(null); setOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-1.5 text-[13px] hover:bg-[var(--color-accent-surface)] transition-colors",
              !selectedClientId && "text-[var(--color-accent)] font-medium"
            )}
          >
            Alle Kunden
          </button>
          {(clients || []).map(c => (
            <button
              key={c._id}
              onClick={() => { setSelectedClientId(c._id); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[13px] hover:bg-[var(--color-accent-surface)] transition-colors truncate",
                selectedClientId === c._id && "text-[var(--color-accent)] font-medium"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, token, logout } = useAuth();
  const nav = user?.role === "admin" ? adminNav : clientNav;
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useQuery(
    api.notifications.unreadCount,
    token ? { token } : "skip"
  );

  return (
    <aside className="w-[240px] h-dvh flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] relative overflow-y-auto sidebar-texture gradient-edge-right">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)] relative overflow-hidden">
        {/* Subtle brand gradient glow */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, transparent 60%)' }} />
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center p-[4px]" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
            <img src="/agentz-logo.svg" alt="AgentZ" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-baseline gap-0">
            <span className="text-[15px] font-semibold tracking-[-0.02em]">agent</span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[var(--color-accent)]">Z</span>
            <span className="text-[13px] font-medium text-[var(--color-text-tertiary)] ml-1.5 tracking-wide uppercase">Studio</span>
          </div>
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

      {/* Client filter (Admin only) */}
      {user?.role === "admin" && <ClientFilterDropdown />}

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
                  ? "nav-item-active text-white font-medium"
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
      {showNotifications && token && (
        <NotificationPanel
          token={token}
          onClose={() => setShowNotifications(false)}
          onNavigate={onNavigate}
        />
      )}
    </aside>
  );
}
