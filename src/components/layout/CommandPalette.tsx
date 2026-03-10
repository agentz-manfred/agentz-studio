import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../lib/auth";
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
  Shield,
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

  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const videos = useQuery(api.videos.list, token ? { token } : "skip");

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
      { id: "nav-team", label: "Team", icon: Users, page: "team" },
      { id: "nav-audit", label: "Audit Log", icon: Shield, page: "audit" },
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
        className="absolute inset-0"
        onClick={close}
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(8px) saturate(120%)',
          WebkitBackdropFilter: 'blur(8px) saturate(120%)',
          animation: 'cmdFadeIn 150ms var(--ease-out)',
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[560px] mx-4 overflow-hidden"
        style={{
          background: 'var(--color-surface-1)',
          border: '2px solid var(--color-border-strong)',
          boxShadow: 'var(--shadow-brutal)',
          animation: 'cmdSlideDown 200ms var(--ease-brutal)',
        }}
      >
        {/* Green accent bar top */}
        <div style={{ height: '3px', background: 'var(--color-green)' }} />

        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{
            height: '52px',
            borderBottom: '2px solid var(--color-border-strong)',
          }}
        >
          <Search className="flex-shrink-0" style={{ width: '18px', height: '18px', color: 'var(--color-green)' }} strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SUCHEN ODER NAVIGIEREN…"
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.04em',
            }}
          />
          <kbd
            className="hidden sm:flex items-center justify-center"
            style={{
              padding: '2px 8px',
              height: '22px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-strong)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-auto" style={{ maxHeight: '360px', padding: '4px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                KEINE ERGEBNISSE FÜR „{query}"
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([cat, catItems]) => (
              <div key={cat}>
                {/* Category label */}
                <div className="flex items-center gap-2" style={{ padding: '8px 16px 4px' }}>
                  <div style={{ width: '3px', height: '12px', background: 'var(--color-green)' }} />
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {categoryLabels[cat] || cat}
                  </span>
                </div>
                {/* Items */}
                {catItems.map((item) => {
                  const idx = flatIdx++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="w-full flex items-center gap-3 text-left"
                      style={{
                        padding: '0 16px',
                        height: '40px',
                        background: isSelected ? 'var(--color-green)' : 'transparent',
                        color: isSelected ? '#0A0A0A' : 'var(--color-text-primary)',
                        borderLeft: isSelected ? '3px solid var(--color-green-dark)' : '3px solid transparent',
                        transition: 'all 100ms var(--ease-brutal)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <item.icon
                        className="flex-shrink-0"
                        style={{
                          width: '16px',
                          height: '16px',
                          color: isSelected ? '#0A0A0A' : 'var(--color-text-tertiary)',
                        }}
                        strokeWidth={2}
                      />
                      <span className="flex-1 truncate" style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                      }}>
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="truncate" style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: isSelected ? 'rgba(10,10,10,0.6)' : 'var(--color-text-muted)',
                          maxWidth: '120px',
                        }}>
                          {item.sublabel}
                        </span>
                      )}
                      {isSelected && (
                        <ArrowRight className="flex-shrink-0" style={{
                          width: '14px',
                          height: '14px',
                          color: '#0A0A0A',
                        }} strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: '0 16px',
            height: '36px',
            borderTop: '2px solid var(--color-border-strong)',
            background: 'var(--color-surface-0)',
          }}
        >
          <span className="flex items-center gap-1.5" style={{
            fontSize: '10px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            <kbd style={{
              padding: '1px 5px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-strong)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
            }}>↑↓</kbd>
            NAVIGIEREN
          </span>
          <span className="flex items-center gap-1.5" style={{
            fontSize: '10px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            <kbd style={{
              padding: '1px 5px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-strong)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
            }}>↵</kbd>
            ÖFFNEN
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cmdFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cmdSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* Inline trigger button for sidebar */
export function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 group"
      style={{
        padding: '0 12px',
        height: '36px',
        border: '1px solid transparent',
        background: 'transparent',
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        transition: 'all 100ms var(--ease-brutal)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-strong)';
        e.currentTarget.style.background = 'var(--color-green-subtle)';
        e.currentTarget.style.color = 'var(--color-green)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--color-text-tertiary)';
      }}
    >
      <Search style={{ width: '16px', height: '16px' }} strokeWidth={2} />
      <span className="flex-1 text-left">SUCHEN</span>
      <kbd
        className="hidden sm:flex items-center gap-0.5"
        style={{
          padding: '1px 6px',
          height: '20px',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-strong)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
        }}
      >
        <Command style={{ width: '10px', height: '10px' }} />K
      </kbd>
    </button>
  );
}
