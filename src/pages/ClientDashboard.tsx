import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Film, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { STATUS_LABELS, STATUS_BADGE_STYLES } from "../lib/utils";

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_STYLES[status] || { bg: "rgba(163,163,163,0.12)", color: "#737373" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function ClientDashboard({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const ideas = useQuery(
    api.ideas.list,
    user?.clientId ? { clientId: user.clientId as any } : "skip"
  );
  const shootDates = useQuery(api.shootDates.list, {});

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const active = (ideas || []).filter((i) => !["veröffentlicht"].includes(i.status)).length;

  // Find next upcoming shoot for this client
  const today = new Date().toISOString().split("T")[0];
  const nextShoot = (shootDates || [])
    .filter(s => s.clientId === user?.clientId && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextShootLabel = nextShoot
    ? new Date(nextShoot.date + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
    : "—";

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Willkommen, {user?.name?.split(" ")[0] || "zurück"}</h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
          Hier sehen Sie den aktuellen Stand aller Ihrer Video-Projekte.
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <Film className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{active}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">In Arbeit</p>
          </div>
        </div>
        <div className="animate-in stagger-2 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <CheckCircle2 className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{published}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">Veröffentlicht</p>
          </div>
        </div>
        <div className="animate-in stagger-3 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <Calendar className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{nextShootLabel}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">Nächster Dreh</p>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="px-6 lg:px-8 pb-8">
        <h2 className="text-[16px] font-medium mb-3">Projekte</h2>
        <div className="space-y-1.5">
          {(ideas || []).map((idea, i) => (
            <button
              key={idea._id}
              onClick={() => onNavigate("idea", idea._id)}
              className={`animate-in stagger-${Math.min(i + 1, 4)} w-full text-left bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 flex items-center justify-between hover:shadow-[var(--shadow-sm)] transition-shadow group`}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium">{idea.title}</p>
                {idea.description && (
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{idea.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <StatusBadge status={idea.status} />
                <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
          {(ideas || []).length === 0 && (
            <div className="text-center py-16 text-[var(--color-text-tertiary)]">
              <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[15px] font-medium text-[var(--color-text-secondary)]">Noch keine Projekte angelegt</p>
              <p className="text-[13px] mt-1.5 max-w-sm mx-auto">
                Sobald Ihr Produktionsteam ein Video-Projekt für Sie startet, erscheint es hier. Sie können dann den Fortschritt verfolgen und Feedback geben.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
