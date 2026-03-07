import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { STATUS_BADGE_STYLES } from "../lib/utils";
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
  idee: "#a3a3a3",
  skript: "#8b5cf6",
  freigabe: "#f59e0b",
  korrektur: "#ef4444",
  freigegeben: "#3b82f6",
  gedreht: "#06b6d4",
  geschnitten: "#8b5cf6",
  review: "#f97316",
  veröffentlicht: "#16a34a",
};

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  onClick,
  accent,
  gradient,
}: {
  icon: any;
  label: string;
  value: number | string;
  delay: string;
  onClick?: () => void;
  accent?: string;
  gradient?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`animate-in ${delay} stat-card accent-top bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 text-left group w-full relative overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border)]`}
    >
      {/* Subtle gradient background */}
      {gradient && (
        <div className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300" style={{ background: gradient }} />
      )}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shadow-sm"
            style={{ background: accent || "var(--color-surface-2)" }}
          >
            <Icon
              className="w-[18px] h-[18px]"
              strokeWidth={1.75}
              style={{ color: accent ? "#fff" : "var(--color-text-secondary)" }}
            />
          </div>
          <div>
            <p className="text-[28px] font-semibold tracking-[-0.03em] leading-none tabular-nums">
              {value}
            </p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">{label}</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
      </div>
    </button>
  );
}

/* ─── Quick Action ─── */
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
      className={`animate-in ${delay} flex items-center gap-2.5 px-4 h-10 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] text-[13px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface)] transition-all duration-200 ease-[var(--ease-out)]`}
    >
      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}

/* ─── Pipeline Progress ─── */
function PipelineProgress({ ideas }: { ideas: any[] }) {
  if (ideas.length === 0) return null;

  const statusCounts: Record<string, number> = {};
  ideas.forEach((i) => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  const activeStatuses = STATUS_ORDER.filter((s) => statusCounts[s]);

  return (
    <div className="animate-in stagger-3">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] mb-3">Pipeline</h2>
      <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5">
        {/* Bar */}
        <div className="flex h-2 rounded-full overflow-hidden bg-[var(--color-surface-2)] mb-4">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            const pct = (count / ideas.length) * 100;
            const isPublished = status === "veröffentlicht";
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
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {activeStatuses.map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: STATUS_COLORS[status] || "var(--color-accent)" }}
              />
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {STATUS_LABELS[status]} ({statusCounts[status]})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Upcoming Shoots ─── */
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Nächste Drehtermine</h2>
        <button
          onClick={() => onNavigate("calendar")}
          className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-0.5 transition-colors"
        >
          Alle <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-2">
        {upcoming.map((shoot) => {
          const client = clientMap.get(shoot.clientId);
          const d = new Date(shoot.date + "T00:00:00");
          const isToday = shoot.date === today;
          return (
            <div
              key={shoot._id}
              className={`bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border px-4 py-3 flex items-center gap-3 transition-colors ${
                isToday
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]"
                  : "border-[var(--color-border-subtle)]"
              }`}
            >
              <div className="w-11 h-11 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase leading-none">
                  {d.toLocaleDateString("de-DE", { month: "short" })}
                </span>
                <span className="text-[18px] font-semibold leading-none tracking-[-0.02em]">
                  {d.getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium truncate">
                  {client?.company || client?.name || "Unbekannt"}
                  {isToday && (
                    <span className="ml-2 text-[11px] font-medium text-[var(--color-accent)] uppercase tracking-wide">
                      Heute
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {shoot.time && (
                    <span className="text-[12px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {shoot.time}
                    </span>
                  )}
                  {shoot.location && (
                    <span className="text-[12px] text-[var(--color-text-tertiary)] flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
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

/* ─── Recent Activity ─── */
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Letzte Aktivität</h2>
        <button
          onClick={() => onNavigate("ideas")}
          className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-0.5 transition-colors"
        >
          Alle <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-1">
        {recent.map((idea) => {
          const client = clientMap.get(idea.clientId);
          return (
            <button
              key={idea._id}
              onClick={() => onNavigate("idea", idea._id)}
              className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 flex items-center justify-between hover:shadow-[var(--shadow-xs)] hover:border-[var(--color-border)] transition-all duration-150 group text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium truncate group-hover:text-[var(--color-accent)]">
                  {idea.title}
                </p>
                <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
                  {client?.company || client?.name}
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                {(() => {
                  const s = STATUS_BADGE_STYLES[idea.status] || { bg: "rgba(163,163,163,0.12)", color: "#737373" };
                  return (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {STATUS_LABELS[idea.status] || idea.status}
                    </span>
                  );
                })()}
                <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
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

/* ─── Main Dashboard ─── */
export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const shoots = useQuery(api.shootDates.list, {});

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter(
    (i) => !["idee", "veröffentlicht"].includes(i.status)
  ).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      {/* Header with hero gradient */}
      <div className="px-6 lg:px-8 pt-8 pb-6 hero-gradient rounded-b-[24px]">
        <div className="animate-in">
          <p className="text-[13px] text-[var(--color-text-tertiary)] mb-1">{greeting}</p>
          <h1 className="text-[28px] font-bold tracking-[-0.04em]">{user?.name}</h1>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-5">
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

      {/* Stats */}
      <div className="px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Kunden"
            value={(clients || []).length}
            delay="stagger-1"
            onClick={() => onNavigate("clients")}
            accent="#6366f1"
            gradient="linear-gradient(135deg, #6366f1 0%, transparent 100%)"
          />
          <StatCard
            icon={Lightbulb}
            label="Ideen"
            value={(ideas || []).length}
            delay="stagger-2"
            onClick={() => onNavigate("ideas")}
            accent="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b 0%, transparent 100%)"
          />
          <StatCard
            icon={TrendingUp}
            label="In Arbeit"
            value={inProgress}
            delay="stagger-3"
            onClick={() => onNavigate("pipeline")}
            accent="#3b82f6"
            gradient="linear-gradient(135deg, #3b82f6 0%, transparent 100%)"
          />
          <StatCard
            icon={Film}
            label="Veröffentlicht"
            value={published}
            delay="stagger-4"
            onClick={() => onNavigate("pipeline")}
            accent="#16a34a"
            gradient="linear-gradient(135deg, #16a34a 0%, transparent 100%)"
          />
        </div>
      </div>

      {/* Content area */}
      {(ideas || []).length === 0 && (shoots || []).length === 0 ? (
        /* Empty state / Onboarding */
        <div className="px-6 lg:px-8 animate-in stagger-3">
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-[var(--color-text-tertiary)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] mb-1">Bereit loszulegen</h2>
            <p className="text-[14px] text-[var(--color-text-tertiary)] max-w-md mx-auto mb-6">
              Erstelle deinen ersten Kunden und lege die erste Video-Idee an. Von hier aus steuerst du die komplette Production Pipeline.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("clients")}
                className="flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Users className="w-4 h-4" />
                Ersten Kunden anlegen
              </button>
              <button
                onClick={() => onNavigate("ideas")}
                className="flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Erste Idee erstellen
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Two-column layout for larger screens */
        <div className="px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PipelineProgress ideas={ideas || []} />
            <UpcomingShoots
              shoots={shoots || []}
              clients={clients || []}
              onNavigate={onNavigate}
            />
          </div>
          <div>
            <RecentActivity
              ideas={ideas || []}
              clients={clients || []}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
