import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Lightbulb,
  Video,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  idea: "Idee",
  script: "Skript",
  review: "Zur Freigabe",
  correction: "Korrektur",
  approved: "Freigegeben",
  filmed: "Gedreht",
  editing: "Geschnitten",
  edit_correction: "Korrektur",
  published: "Veröffentlicht",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  script: { bg: "rgba(139,92,246,0.1)", text: "#8b5cf6" },
  review: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  correction: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  approved: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
  filmed: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  editing: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
  edit_correction: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  published: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ClientDetail({
  clientId,
  onBack,
  onNavigate,
}: {
  clientId: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}) {
  const client = useQuery(api.clients.get, {
    id: clientId as Id<"clients">,
  });
  const ideas = useQuery(api.ideas.list, {
    clientId: clientId as Id<"clients">,
  });
  const shoots = useQuery(api.shootDates.list, {
    clientId: clientId as Id<"clients">,
  });
  const users = useQuery(api.auth.listUsers);

  const hasLogin = (users || []).some((u) => u.clientId === clientId);

  if (client === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-text-tertiary)]">Kunde nicht gefunden</p>
        <button onClick={onBack} className="mt-4 text-[var(--color-accent)] text-[14px]">
          Zurück
        </button>
      </div>
    );
  }

  // Stats
  const totalIdeas = (ideas || []).length;
  const inProgress = (ideas || []).filter(
    (i) => !["idea", "published"].includes(i.status)
  ).length;
  const published = (ideas || []).filter((i) => i.status === "published").length;

  const upcomingShoots = (shoots || [])
    .filter((s) => new Date(s.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kunden
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center text-white text-[20px] font-semibold">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {client.company && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    <Building2 className="w-3.5 h-3.5" />
                    {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                  <Mail className="w-3.5 h-3.5" />
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    <Phone className="w-3.5 h-3.5" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            {hasLogin ? (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  color: "#16a34a",
                }}
              >
                Login aktiv
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium"
                style={{
                  background: "rgba(107,114,128,0.1)",
                  color: "#6b7280",
                }}
              >
                Kein Login
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                Ideen
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {totalIdeas}
            </p>
          </div>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                In Arbeit
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {inProgress}
            </p>
          </div>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-green-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                Veröffentlicht
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {published}
            </p>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="px-6 lg:px-8 pb-8 space-y-6">
        {/* Ideas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold">Ideen</h2>
            <button
              onClick={() => onNavigate("ideas")}
              className="text-[12px] text-[var(--color-accent)] hover:underline"
            >
              Alle anzeigen
            </button>
          </div>

          {(ideas || []).length === 0 ? (
            <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-8 text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                Noch keine Ideen für diesen Kunden
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(ideas || []).slice(0, 8).map((idea) => {
                const sc = STATUS_COLORS[idea.status] || STATUS_COLORS.idea;
                return (
                  <button
                    key={idea._id}
                    onClick={() => onNavigate("idea", idea._id)}
                    className="w-full flex items-center justify-between gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 hover:shadow-[var(--shadow-sm)] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABELS[idea.status] || idea.status}
                      </span>
                      <span className="text-[14px] truncate">
                        {idea.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming Shoots */}
        <section>
          <h2 className="text-[15px] font-semibold mb-3">
            Nächste Drehtermine
          </h2>

          {upcomingShoots.length === 0 ? (
            <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                Keine anstehenden Drehtermine
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingShoots.slice(0, 5).map((shoot) => (
                <div
                  key={shoot._id}
                  className="flex items-center gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3"
                >
                  <div
                    className="w-10 h-10 rounded-[var(--radius-md)] flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.08)",
                    }}
                  >
                    <span className="text-[11px] font-semibold text-blue-500 leading-none">
                      {new Date(shoot.date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                      })}
                    </span>
                    <span className="text-[9px] text-blue-400 uppercase">
                      {new Date(shoot.date).toLocaleDateString("de-DE", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">
                      {shoot.title || "Drehtermin"}
                    </p>
                    {shoot.location && (
                      <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                        {shoot.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)]">
                    <Clock className="w-3 h-3" />
                    {formatDate(new Date(shoot.date).getTime())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
