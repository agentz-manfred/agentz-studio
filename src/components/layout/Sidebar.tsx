import { useState, useRef, useEffect, useCallback } from "react";
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
  Shield,
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
  { id: "audit", label: "Audit Log", icon: Shield },
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
    const mouseHandler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", mouseHandler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", mouseHandler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  const hasUnread = notifications?.some((n) => !n.read);

  return (
    <div
      ref={panelRef}
      className="absolute left-[240px] top-0 bottom-0 w-[320px] bg-[var(--color-surface-0)] border-r-2 border-[var(--color-green)] z-50 flex flex-col"
      style={{ animation: 'slideInLeft 0.25s var(--ease-brutal) both' }}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-green)]" strokeWidth={2} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">Benachrichtigungen</span>
        </div>
        <div className="flex items-center gap-0">
          {hasUnread && (
            <button
              onClick={() => markAllRead({ token })}
              className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-all duration-100"
              title="Alle als gelesen markieren"
            >
              <Check className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all duration-100"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
            <Bell className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-[12px] uppercase tracking-[0.1em]">Keine Benachrichtigungen</p>
          </div>
        ) : (
          <div>
            {notifications.map((n, i) => (
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
                  "w-full text-left px-4 py-3 border-b border-[var(--color-border)] transition-all duration-100 hover:bg-[var(--color-green-subtle)] group",
                  !n.read && "bg-[var(--color-surface-1)]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {!n.read && (
                    <div className="w-2 h-2 bg-[var(--color-green)] mt-1.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate group-hover:text-[var(--color-green)] transition-colors">{n.title}</p>
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 tabular-nums font-mono">
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
      className="w-full flex items-center gap-3 px-3 h-9 text-[13px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-green-subtle)] hover:text-[var(--color-text-secondary)] transition-all duration-100 group"
      title={`Theme: ${theme === "system" ? "System" : theme === "dark" ? "Dunkel" : "Hell"}`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="w-4 h-4 group-hover:text-[var(--color-green)]" strokeWidth={1.75} />
      ) : (
        <Sun className="w-4 h-4 group-hover:text-[var(--color-green)]" strokeWidth={1.75} />
      )}
      <span className="uppercase tracking-[0.06em] text-[12px]">
        {theme === "system" ? "System" : resolvedTheme === "dark" ? "Dunkel" : "Hell"}
      </span>
    </button>
  );
}

function ClientFilterDropdown() {
  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
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
    <div className="px-3 pb-2" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 h-8 text-[12px] uppercase tracking-[0.06em] transition-all duration-100 border",
          selectedClientId
            ? "bg-[var(--color-green-subtle)] text-[var(--color-green)] font-semibold border-[var(--color-border-green)]"
            : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-2)] border-[var(--color-border)]"
        )}
      >
        <Users className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
        <span className="flex-1 text-left truncate">
          {selectedClient ? selectedClient.name : "Alle Kunden"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-100", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 py-1 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] shadow-[var(--shadow-brutal-sm)] max-h-[240px] overflow-auto z-50 relative">
          <button
            onClick={() => { setSelectedClientId(null); setOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-2 text-[12px] uppercase tracking-[0.04em] hover:bg-[var(--color-green-subtle)] transition-colors duration-100",
              !selectedClientId && "text-[var(--color-green)] font-semibold bg-[var(--color-green-subtle)]"
            )}
          >
            Alle Kunden
          </button>
          {(clients || []).map(c => (
            <button
              key={c._id}
              onClick={() => { setSelectedClientId(c._id); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-[12px] hover:bg-[var(--color-green-subtle)] transition-colors duration-100 truncate",
                selectedClientId === c._id && "text-[var(--color-green)] font-semibold bg-[var(--color-green-subtle)]"
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
    <aside className="w-[240px] h-dvh flex flex-col bg-[var(--color-surface-0)] relative overflow-y-auto border-r-2 border-[var(--color-border-strong)]">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 sidebar-texture pointer-events-none" />

      {/* Green edge glow */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] gradient-edge-right z-10 pointer-events-none" />

      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b-2 border-[var(--color-border-strong)] relative z-10 bg-[var(--color-surface-0)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-[var(--color-green)] bg-[var(--color-surface-0)]" style={{
            boxShadow: '3px 3px 0px var(--color-green-dark)',
          }}>
            <span className="text-[15px] font-bold text-[var(--color-green)]" style={{ fontFamily: 'var(--font-display)' }}>A</span>
          </div>
          <div className="flex items-baseline gap-0">
            <span className="text-[15px] font-bold tracking-[-0.02em] uppercase text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>Agent</span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[var(--color-green)] uppercase" style={{ fontFamily: 'var(--font-display)' }}>Z</span>
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] ml-2 tracking-[0.2em] uppercase">Studio</span>
          </div>
        </div>
      </div>

      {/* Search trigger */}
      <div className="px-3 pt-3 pb-1 relative z-10">
        <button
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
            document.dispatchEvent(e);
          }}
          className="w-full flex items-center gap-3 px-3 h-9 text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] transition-all duration-100 group border border-[var(--color-border)] bg-[var(--color-surface-1)]"
        >
          <Search className="w-4 h-4 group-hover:text-[var(--color-green)]" strokeWidth={2} />
          <span className="flex-1 text-left text-[12px] tracking-[0.03em]">Suchen…</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 h-5 bg-[var(--color-surface-0)] text-[10px] font-mono font-medium border border-[var(--color-border)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Client filter (Admin only) */}
      <div className="relative z-10">
        {user?.role === "admin" && <ClientFilterDropdown />}
      </div>

      {/* Section divider */}
      <div className="mx-3 h-[2px] bg-[var(--color-border)] relative z-10">
        <div className="absolute left-0 top-0 w-6 h-full bg-[var(--color-green)] opacity-60" />
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-3 space-y-0.5 relative z-10"
        role="navigation"
        aria-label="Hauptnavigation"
        onKeyDown={(e) => {
          if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
          e.preventDefault();
          const buttons = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>("button[data-nav]")
          );
          const idx = buttons.indexOf(document.activeElement as HTMLElement);
          const next = e.key === "ArrowDown"
            ? (idx + 1) % buttons.length
            : (idx - 1 + buttons.length) % buttons.length;
          buttons[next]?.focus();
        }}
      >
        {nav.map((item) => {
          const isActive =
            currentPage === item.id ||
            (item.id === "ideas" && currentPage.startsWith("idea:")) ||
            (item.id === "clients" && currentPage.startsWith("client:")) ||
            (item.id === "videos" && currentPage.startsWith("video:"));
          return (
            <button
              key={item.id}
              data-nav
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 h-9 text-[13px] transition-all duration-100 relative group",
                isActive
                  ? "bg-[var(--color-green)] text-[#0A0A0A] font-semibold"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-green-subtle)] hover:text-[var(--color-text-primary)]"
              )}
              style={isActive ? { boxShadow: '3px 3px 0px #0A0A0A' } : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0A0A0A]" />
              )}
              {/* Hover indicator bar */}
              {!isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[var(--color-green)] opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
              )}
              <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#0A0A0A]" : "group-hover:text-[var(--color-green)]")} strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="tracking-[0.02em]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section divider */}
      <div className="mx-3 h-[2px] bg-[var(--color-border)] relative z-10">
        <div className="absolute right-0 top-0 w-6 h-full bg-[var(--color-green)] opacity-60" />
      </div>

      {/* Footer: Theme, Notifications, User */}
      <div className="py-2 relative z-10">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-9 text-[13px] transition-all duration-100 group",
            showNotifications
              ? "bg-[var(--color-green-subtle)] text-[var(--color-green)]"
              : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-green-subtle)] hover:text-[var(--color-text-secondary)]"
          )}
        >
          <div className="relative">
            <Bell className={cn("w-4 h-4", showNotifications ? "text-[var(--color-green)]" : "group-hover:text-[var(--color-green)]")} strokeWidth={1.75} />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-[var(--color-error)] text-white text-[9px] font-bold flex items-center justify-center px-0.5"
                style={{ boxShadow: '1px 1px 0px #0A0A0A' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <span className="uppercase tracking-[0.06em] text-[12px]">Benachrichtigungen</span>
        </button>

        {/* User info */}
        <div className="flex items-center justify-between px-3 py-2 mt-1 mx-3 border border-[var(--color-border)] bg-[var(--color-surface-1)]">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate tracking-[0.02em]">{user?.name}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate uppercase tracking-[0.08em]">
              {user?.role === "admin" ? "Admin" : "Kunde"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-3)] transition-all duration-100"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
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
