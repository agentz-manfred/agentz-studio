import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Search,
  Users,
  Lightbulb,
  Play,
  Calendar,
  LayoutDashboard,
  Film,
  Settings,
  ArrowRight,
  Command,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: any;
  category: "navigation" | "kunden" | "ideen" | "videos";
  action: () => void;
}

export function CommandPalette({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const clients = useQuery(api.clients.list);
  const ideas = useQuery(api.ideas.list, {});
  const videos = useQuery(api.videos.list, {});

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const items = useMemo(() => {
    const all: CommandItem[] = [];

    // Navigation items
    const navItems = [
      { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
      { id: "nav-pipeline", label: "Pipeline", icon: Film, page: "pipeline" },
      { id: "nav-clients", label: "Kunden", icon: Users, page: "clients" },
      { id: "nav-ideas", label: "Ideen", icon: Lightbulb, page: "ideas" },
      { id: "nav-videos", label: "Videos", icon: Play, page: "videos" },
      { id: "nav-calendar", label: "Kalender", icon: Calendar, page: "calendar" },
      { id: "nav-settings", label: "Einstellungen", icon: Settings, page: "settings" },
    ];
    navItems.forEach((n) =>
      all.push({
        ...n,
        category: "navigation",
        action: () => {
          onNavigate(n.page);
          close();
        },
      })
    );

    // Clients
    (clients || []).forEach((c) =>
      all.push({
        id: `client-${c._id}`,
        label: c.company || c.name,
        sublabel: c.company ? c.name : c.email,
        icon: Users,
        category: "kunden",
        action: () => {
          onNavigate("clients");
          close();
        },
      })
    );

    // Ideas
    (ideas || []).forEach((i) =>
      all.push({
        id: `idea-${i._id}`,
        label: i.title,
        sublabel: i.status,
        icon: Lightbulb,
        category: "ideen",
        action: () => {
          onNavigate("idea", i._id);
          close();
        },
      })
    );

    // Videos
    (videos || []).forEach((v) =>
      all.push({
        id: `video-${v._id}`,
        label: v.title,
        sublabel: v.status,
        icon: Play,
        category: "videos",
        action: () => {
          onNavigate("video", v._id);
          close();
        },
      })
    );

    return all;
  }, [clients, ideas, videos, onNavigate, close]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 12);
    const q = query.toLowerCase();
    return items
      .filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.sublabel?.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [items, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!open) return null;

  // Group by category
  const grouped = new Map<string, CommandItem[]>();
  filtered.forEach((item) => {
    const arr = grouped.get(item.category) || [];
    arr.push(item);
    grouped.set(item.category, arr);
  });

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    kunden: "Kunden",
    ideen: "Ideen",
    videos: "Videos",
  };

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[min(20vh,160px)]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        style={{ animation: "fadeInBg 150ms ease-out" }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[560px] mx-4 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border-subtle)] overflow-hidden"
        style={{ animation: "slideUp 200ms var(--ease-out)" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-[52px] border-b border-[var(--color-border-subtle)]">
          <Search className="w-[18px] h-[18px] text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Suchen oder navigieren…"
            className="flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 h-5 rounded bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-tertiary)] font-medium border border-[var(--color-border-subtle)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] text-[var(--color-text-tertiary)]">
                Keine Ergebnisse für „{query}"
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([cat, catItems]) => (
              <div key={cat}>
                <div className="px-4 pt-2 pb-1">
                  <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-[0.05em]">
                    {categoryLabels[cat] || cat}
                  </span>
                </div>
                {catItems.map((item) => {
                  const idx = flatIdx++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 h-10 text-left transition-colors",
                        isSelected
                          ? "bg-[var(--color-accent-surface)]"
                          : "hover:bg-[var(--color-accent-surface)]"
                      )}
                    >
                      <item.icon
                        className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0"
                        strokeWidth={1.75}
                      />
                      <span className="flex-1 text-[14px] truncate">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="text-[12px] text-[var(--color-text-tertiary)] truncate max-w-[120px]">
                          {item.sublabel}
                        </span>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 h-9 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]/50">
          <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-2)] text-[10px] border border-[var(--color-border-subtle)]">↑↓</kbd>
            Navigieren
          </span>
          <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-2)] text-[10px] border border-[var(--color-border-subtle)]">↵</kbd>
            Öffnen
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

/* Inline trigger button for sidebar */
export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 h-9 rounded-[var(--radius-sm)] text-[14px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-accent-surface)] hover:text-[var(--color-text-secondary)] transition-all duration-150 ease-[var(--ease-out)] group"
    >
      <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
      <span className="flex-1 text-left">Suchen</span>
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 h-5 rounded bg-[var(--color-surface-2)] text-[10px] font-medium border border-[var(--color-border-subtle)] group-hover:border-[var(--color-border)]">
        <Command className="w-2.5 h-2.5" />K
      </kbd>
    </button>
  );
}
