import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { STATUS_BADGE_STYLES } from "../lib/utils";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import { useState, useMemo, useCallback } from "react";
import {
  Users,
  Film,
  Lightbulb,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Calendar,
  Video,
  MapPin,
  Clock,
  ChevronRight,
  Download,
  Share,
  Smartphone,
  X,
  Settings2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

/* ─── Status Config ─── */
const STATUS_LABELS: Record<string, string> = {
  idee: "Idee",
  skript: "Skript",
  freigabe: "Freigabe",
  korrektur: "Korrektur",
  freigegeben: "Freigegeben",
  gedreht: "Gedreht",
  geschnitten: "Geschnitten",
  review: "Review",
  veröffentlicht: "Veröffentlicht",
};

const STATUS_ORDER = [
  "idee", "skript", "freigabe", "korrektur", "freigegeben",
  "gedreht", "geschnitten", "review", "veröffentlicht",
];

const STATUS_COLORS: Record<string, string> = {
  idee: "#888888",
  skript: "#8b5cf6",
  freigabe: "#f59e0b",
  korrektur: "#ef4444",
  freigegeben: "#3b82f6",
  gedreht: "#06b6d4",
  geschnitten: "#8b5cf6",
  review: "#f97316",
  veröffentlicht: "#00DC82",
};

/* ─── Stat Card (Brutalist) ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  onClick,
  isGreen,
}: {
  icon: any;
  label: string;
  value: number | string;
  delay: string;
  onClick?: () => void;
  isGreen?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`animate-in ${delay} group w-full text-left relative overflow-hidden
        bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-5
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-brutal)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        ${isGreen
          ? "hover:shadow-[var(--shadow-brutal)] hover:border-[var(--color-green)]"
          : "hover:shadow-[var(--shadow-brutal-dark)] hover:border-[var(--color-border-green)]"
        }`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ${
          isGreen ? "bg-[var(--color-green)]" : "bg-[var(--color-surface-4)]"
        } group-hover:bg-[var(--color-green)]`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <p
            className={`text-[36px] font-bold tracking-[-0.04em] leading-none tabular-nums font-[var(--font-display)]
              ${isGreen ? "text-[var(--color-green)]" : "text-[var(--color-text-primary)]"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </p>
          <div
            className={`w-8 h-8 flex items-center justify-center border transition-all duration-200
              ${isGreen
                ? "border-[var(--color-green)] bg-[var(--color-green-subtle)]"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface-2)]"
              } group-hover:border-[var(--color-green)] group-hover:bg-[var(--color-green-subtle)]`}
          >
            <Icon
              className={`w-4 h-4 transition-colors duration-200
                ${isGreen ? "text-[var(--color-green)]" : "text-[var(--color-text-tertiary)]"}
                group-hover:text-[var(--color-green)]`}
              strokeWidth={2}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors">
            {label}
          </p>
          <ArrowUpRight className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all duration-200" />
        </div>
      </div>
    </button>
  );
}

/* ─── Quick Action (Brutalist) ─── */
function QuickAction({
  icon: Icon,
  label,
  onClick,
  delay,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  delay: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`animate-in ${delay} flex items-center gap-2 px-4 h-9
        border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)]
        text-[12px] uppercase tracking-[0.06em] font-semibold text-[var(--color-text-secondary)]
        hover:border-[var(--color-green)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)]
        hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)]
        transition-all duration-[var(--duration-fast)] ease-[var(--ease-brutal)]`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}

/* ─── Section Header (Brutalist) ─── */
function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-5 bg-[var(--color-green)]" />
        <h2 className="text-[13px] uppercase tracking-[0.08em] font-bold text-[var(--color-text-primary)]">
          {title}
        </h2>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-text-muted)]
            hover:text-[var(--color-green)] flex items-center gap-1 transition-colors duration-150"
        >
          {actionLabel}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Pipeline Progress (Brutalist) ─── */
function PipelineProgress({ ideas }: { ideas: any[] }) {
  if (ideas.length === 0) return null;

  const statusCounts: Record<string, number> = {};
  ideas.forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  const activeStatuses = STATUS_ORDER.filter((s) => statusCounts[s]);

  return (
    <div className="animate-in stagger-3">
      <SectionHeader title="Pipeline" />
      <div className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-5">
        {/* Bar — square, no border-radius */}
        <div className="flex h-3 overflow-hidden bg-[var(--color-surface-0)] border border-[var(--color-border)] mb-5">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            const pct = (count / ideas.length) * 100;
            return (
              <div
                key={status}
                className="transition-all duration-500 ease-[var(--ease-out)]"
                style={{
                  width: `${pct}%`,
                  background: STATUS_COLORS[status] || "var(--color-accent)",
                }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {activeStatuses.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5"
                style={{ background: STATUS_COLORS[status] || "var(--color-accent)" }}
              />
              <span className="text-[11px] uppercase tracking-[0.04em] font-medium text-[var(--color-text-tertiary)]">
                {STATUS_LABELS[status]}
              </span>
              <span className="text-[11px] font-bold text-[var(--color-text-secondary)] tabular-nums">
                {statusCounts[status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Upcoming Shoots (Brutalist) ─── */
function UpcomingShoots({
  shoots,
  clients,
  onNavigate,
}: {
  shoots: any[];
  clients: any[];
  onNavigate: (page: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = shoots
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  const clientMap = new Map(clients.map((c) => [c._id, c]));

  return (
    <div className="animate-in stagger-4">
      <SectionHeader title="Nächste Drehtermine" actionLabel="Alle" onAction={() => onNavigate("calendar")} />
      <div className="space-y-0">
        {upcoming.map((shoot, idx) => {
          const client = clientMap.get(shoot.clientId);
          const d = new Date(shoot.date + "T00:00:00");
          const isToday = shoot.date === today;
          return (
            <div
              key={shoot._id}
              className={`bg-[var(--color-surface-1)] border-2 px-4 py-3 flex items-center gap-4
                transition-all duration-[var(--duration-fast)] ease-[var(--ease-brutal)]
                hover:translate-x-[-1px] hover:translate-y-[-1px]
                ${idx > 0 ? "-mt-[2px]" : ""}
                ${isToday
                  ? "border-[var(--color-green)] hover:shadow-[var(--shadow-brutal)]"
                  : "border-[var(--color-border-strong)] hover:shadow-[var(--shadow-brutal-sm)] hover:border-[var(--color-border-green)]"
                }`}
            >
              {/* Date block */}
              <div className={`w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 border
                ${isToday
                  ? "bg-[var(--color-green)] border-[var(--color-green-dark)] text-[#0A0A0A]"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                }`}
              >
                <span className={`text-[9px] font-bold uppercase tracking-[0.1em] leading-none
                  ${isToday ? "" : "text-[var(--color-text-tertiary)]"}`}
                >
                  {d.toLocaleDateString("de-DE", { month: "short" })}
                </span>
                <span className={`text-[20px] font-bold leading-none tracking-[-0.02em]
                  ${isToday ? "" : ""}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate">
                  {client?.company || client?.name || "Unbekannt"}
                  {isToday && (
                    <span className="ml-2 text-[10px] font-bold text-[var(--color-green)] uppercase tracking-[0.1em]
                      bg-[var(--color-green-subtle)] px-2 py-0.5 border border-[var(--color-border-green)]">
                      Heute
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {shoot.time && (
                    <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {shoot.time}
                    </span>
                  )}
                  {shoot.location && (
                    <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" strokeWidth={2} />
                      {shoot.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Recent Activity (Brutalist) ─── */
function RecentActivity({
  ideas,
  clients,
  onNavigate,
}: {
  ideas: any[];
  clients: any[];
  onNavigate: (page: string, id?: string) => void;
}) {
  const recent = [...ideas].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);
  if (recent.length === 0) return null;

  const clientMap = new Map(clients.map((c) => [c._id, c]));

  return (
    <div className="animate-in stagger-4">
      <SectionHeader title="Letzte Aktivität" actionLabel="Alle" onAction={() => onNavigate("ideas")} />
      <div className="space-y-0">
        {recent.map((idea, idx) => {
          const client = clientMap.get(idea.clientId);
          return (
            <button
              key={idea._id}
              onClick={() => onNavigate("idea", idea._id)}
              className={`w-full bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)]
                px-4 py-3 flex items-center justify-between
                hover:border-[var(--color-border-green)] hover:translate-x-[-1px] hover:translate-y-[-1px]
                hover:shadow-[var(--shadow-brutal-sm)]
                transition-all duration-[var(--duration-fast)] ease-[var(--ease-brutal)] group text-left
                ${idx > 0 ? "-mt-[2px]" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold truncate group-hover:text-[var(--color-green)] transition-colors">
                  {idea.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate uppercase tracking-[0.04em]">
                  {client?.company || client?.name}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                {(() => {
                  const statusColor = STATUS_COLORS[idea.status] || "#888888";
                  return (
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 border"
                      style={{
                        background: `${statusColor}15`,
                        color: statusColor,
                        borderColor: `${statusColor}40`,
                      }}
                    >
                      {STATUS_LABELS[idea.status] || idea.status}
                    </span>
                  );
                })()}
                <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums font-mono">
                  {new Date(idea.updatedAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PWA Install Banner (Brutalist) ─── */
function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <div className="animate-in stagger-1 bg-[var(--color-surface-1)] border-2 border-[var(--color-green)]
      p-4 flex items-center gap-4 relative overflow-hidden mb-4">
      {/* Green glow top-right */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(0,220,130,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-10 h-10 bg-[var(--color-green-subtle)] border-2 border-[var(--color-green)]
        flex items-center justify-center flex-shrink-0">
        <Smartphone className="w-5 h-5 text-[var(--color-green)]" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold uppercase tracking-[0.04em]">App installieren</p>
        {isIOS ? (
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
            Tippe auf <Share className="w-3 h-3 inline -mt-0.5" /> Teilen → „Zum Home-Bildschirm"
          </p>
        ) : (
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
            AgentZ Studio als App auf deinem Gerät nutzen
          </p>
        )}
      </div>
      {canInstall && (
        <button
          onClick={async () => {
            setInstalling(true);
            await install();
            setInstalling(false);
          }}
          disabled={installing}
          className="btn-brutal flex-shrink-0 flex items-center gap-1.5 px-4 h-8 text-[12px] disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {installing ? "…" : "Installieren"}
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1.5 border border-[var(--color-border-strong)]
          hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors"
      >
        <X className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
      </button>
    </div>
  );
}

/* ─── Widget Config ─── */
const WIDGET_DEFS = [
  { id: "pipeline", label: "Pipeline" },
  { id: "shoots", label: "Drehtermine" },
  { id: "activity", label: "Letzte Aktivität" },
] as const;

type WidgetId = (typeof WIDGET_DEFS)[number]["id"];

interface WidgetConfig {
  order: WidgetId[];
  hidden: WidgetId[];
}

function getWidgetConfig(): WidgetConfig {
  try {
    const stored = localStorage.getItem("agentz-dashboard-widgets");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { order: WIDGET_DEFS.map((w) => w.id), hidden: [] };
}

function saveWidgetConfig(config: WidgetConfig) {
  localStorage.setItem("agentz-dashboard-widgets", JSON.stringify(config));
}

function WidgetConfigurator({
  config,
  onChange,
  onClose,
}: {
  config: WidgetConfig;
  onChange: (c: WidgetConfig) => void;
  onClose: () => void;
}) {
  const toggleWidget = (id: WidgetId) => {
    const hidden = config.hidden.includes(id)
      ? config.hidden.filter((h) => h !== id)
      : [...config.hidden, id];
    const next = { ...config, hidden };
    saveWidgetConfig(next);
    onChange(next);
  };

  const moveWidget = (id: WidgetId, dir: -1 | 1) => {
    const order = [...config.order];
    const idx = order.indexOf(id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= order.length) return;
    [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
    const next = { ...config, order };
    saveWidgetConfig(next);
    onChange(next);
  };

  return (
    <div className="bg-[var(--color-surface-1)] border-2 border-[var(--color-green)] p-4 shadow-[var(--shadow-brutal)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-[var(--color-green)]" />
          <h3 className="text-[12px] uppercase tracking-[0.08em] font-bold">Widgets</h3>
        </div>
        <button onClick={onClose} className="p-1 border border-[var(--color-border-strong)]
          hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors">
          <X className="w-3 h-3 text-[var(--color-text-tertiary)]" />
        </button>
      </div>
      <div className="space-y-1">
        {config.order.map((id, idx) => {
          const def = WIDGET_DEFS.find((w) => w.id === id);
          if (!def) return null;
          const isHidden = config.hidden.includes(id);
          return (
            <div
              key={id}
              className="flex items-center gap-2 px-2 py-2 hover:bg-[var(--color-surface-2)] transition-colors
                border border-transparent hover:border-[var(--color-border)]"
            >
              <button
                onClick={() => toggleWidget(id)}
                className="p-0.5"
                title={isHidden ? "Einblenden" : "Ausblenden"}
              >
                {isHidden ? (
                  <EyeOff className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={2} />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-[var(--color-green)]" strokeWidth={2} />
                )}
              </button>
              <span className={`flex-1 text-[12px] uppercase tracking-[0.04em] font-medium
                ${isHidden ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text-secondary)]"}`}>
                {def.label}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveWidget(id, -1)}
                  disabled={idx === 0}
                  className="p-0.5 disabled:opacity-20 hover:text-[var(--color-green)] transition-colors"
                >
                  <ArrowUp className="w-3 h-3 text-[var(--color-text-tertiary)]" strokeWidth={2} />
                </button>
                <button
                  onClick={() => moveWidget(id, 1)}
                  disabled={idx === config.order.length - 1}
                  className="p-0.5 disabled:opacity-20 hover:text-[var(--color-green)] transition-colors"
                >
                  <ArrowDown className="w-3 h-3 text-[var(--color-text-tertiary)]" strokeWidth={2} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const { user, token } = useAuth();
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const shoots = useQuery(api.shootDates.list, token ? { token } : "skip");
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(getWidgetConfig);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter(
    (i) => !["idee", "veröffentlicht"].includes(i.status)
  ).length;

  const isWidgetVisible = useCallback(
    (id: WidgetId) => !widgetConfig.hidden.includes(id),
    [widgetConfig.hidden]
  );

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  if (ideas === undefined && clients === undefined) return <DashboardSkeleton />;

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      {/* ═══ Header — Brutalist Hero ═══ */}
      <div className="px-6 lg:px-8 pt-8 pb-6 relative">
        {/* Subtle green glow top-left */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[radial-gradient(circle,rgba(0,220,130,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="animate-in relative">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-text-muted)] mb-2">
            {greeting}
          </p>
          <h1 className="text-[32px] font-bold tracking-[-0.04em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
            {user?.name}
          </h1>
          {/* Green accent line under name */}
          <div className="w-12 h-[3px] bg-[var(--color-green)] mt-2" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-6 relative">
          <QuickAction
            icon={Lightbulb}
            label="Neue Idee"
            onClick={() => onNavigate("ideas")}
            delay="stagger-1"
          />
          <QuickAction
            icon={Users}
            label="Neuer Kunde"
            onClick={() => onNavigate("clients")}
            delay="stagger-2"
          />
          <QuickAction
            icon={Calendar}
            label="Drehtermin"
            onClick={() => onNavigate("calendar")}
            delay="stagger-3"
          />
          <QuickAction
            icon={Video}
            label="Video hochladen"
            onClick={() => onNavigate("videos")}
            delay="stagger-4"
          />
        </div>
      </div>

      {/* ═══ PWA Install Banner ═══ */}
      <div className="px-6 lg:px-8 pb-2">
        <PWAInstallBanner />
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          <StatCard
            icon={Users}
            label="Kunden"
            value={(clients || []).length}
            delay="stagger-1"
            onClick={() => onNavigate("clients")}
          />
          <StatCard
            icon={Lightbulb}
            label="Ideen"
            value={(ideas || []).length}
            delay="stagger-2"
            onClick={() => onNavigate("ideas")}
          />
          <StatCard
            icon={TrendingUp}
            label="In Arbeit"
            value={inProgress}
            delay="stagger-3"
            onClick={() => onNavigate("pipeline")}
          />
          <StatCard
            icon={Film}
            label="Veröffentlicht"
            value={published}
            delay="stagger-4"
            onClick={() => onNavigate("pipeline")}
            isGreen
          />
        </div>
      </div>

      {/* ═══ Content Area ═══ */}
      {(ideas || []).length === 0 && (shoots || []).length === 0 ? (
        /* Empty state — Brutalist onboarding */
        <div className="px-6 lg:px-8 animate-in stagger-3">
          <div className="bg-[var(--color-surface-1)] border-2 border-dashed border-[var(--color-border-strong)] p-8 text-center relative">
            {/* Decorative corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-green)]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-green)]" />

            <div className="w-14 h-14 mx-auto mb-4 bg-[var(--color-surface-2)] border-2 border-[var(--color-border-strong)]
              flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-[var(--color-green)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[16px] font-bold uppercase tracking-[0.04em] mb-2"
              style={{ fontFamily: "var(--font-display)" }}>
              Bereit loszulegen
            </h2>
            <p className="text-[13px] text-[var(--color-text-tertiary)] max-w-md mx-auto mb-6">
              Erstelle deinen ersten Kunden und lege die erste Video-Idee an. Von hier aus steuerst du die komplette Production Pipeline.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("clients")}
                className="btn-brutal flex items-center gap-2 h-10 px-5"
              >
                <Users className="w-4 h-4" />
                Ersten Kunden anlegen
              </button>
              <button
                onClick={() => onNavigate("ideas")}
                className="btn-brutal-outline flex items-center gap-2 h-10 px-5"
              >
                <Lightbulb className="w-4 h-4" />
                Erste Idee erstellen
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Widgets area */
        <div className="px-6 lg:px-8">
          {/* Widget config toggle */}
          <div className="flex justify-end mb-4 relative">
            <button
              onClick={() => setShowWidgetConfig(!showWidgetConfig)}
              className={`p-2 border-2 transition-all duration-[var(--duration-fast)] ease-[var(--ease-brutal)]
                ${showWidgetConfig
                  ? "border-[var(--color-green)] text-[var(--color-green)] bg-[var(--color-green-subtle)]"
                  : "border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                }`}
              title="Widgets anpassen"
            >
              <Settings2 className="w-4 h-4" strokeWidth={2} />
            </button>
            {showWidgetConfig && (
              <div className="absolute right-0 top-10 z-20 w-[240px]">
                <WidgetConfigurator
                  config={widgetConfig}
                  onChange={setWidgetConfig}
                  onClose={() => setShowWidgetConfig(false)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgetConfig.order.map((widgetId) => {
              if (widgetConfig.hidden.includes(widgetId)) return null;
              switch (widgetId) {
                case "pipeline":
                  return <PipelineProgress key={widgetId} ideas={ideas || []} />;
                case "shoots":
                  return (
                    <UpcomingShoots
                      key={widgetId}
                      shoots={shoots || []}
                      clients={clients || []}
                      onNavigate={onNavigate}
                    />
                  );
                case "activity":
                  return (
                    <RecentActivity
                      key={widgetId}
                      ideas={ideas || []}
                      clients={clients || []}
                      onNavigate={onNavigate}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}
