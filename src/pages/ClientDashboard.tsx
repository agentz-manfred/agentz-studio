import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Film, Calendar, CheckCircle2, ChevronRight, Play, MessageSquare, HelpCircle } from "lucide-react";
import { STATUS_LABELS, STATUS_BADGE_STYLES, VIDEO_STATUS_LABELS, STATUS_DESCRIPTIONS, CLIENT_PIPELINE_STEPS, STATUS_COLORS } from "../lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

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
  const { user, token } = useAuth();
  const ideas = useQuery(
    api.ideas.list,
    user?.clientId && token ? { clientId: user.clientId!, token } : "skip"
  );
  const shootDates = useQuery(api.shootDates.list, token ? { token } : "skip");
  const videos = useQuery(
    api.videos.listByClient,
    user?.clientId && token ? { clientId: user.clientId as Id<"clients">, token } : "skip"
  );

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

      {/* Ideas List with Progress Tracker */}
      <div className="px-6 lg:px-8 pb-8">
        <h2 className="text-[16px] font-medium mb-3">Projekte</h2>
        <div className="space-y-3">
          {(ideas || []).map((idea, i) => {
            // Find current step index for progress display
            const stepKeys = CLIENT_PIPELINE_STEPS.map(s => s.key);
            const currentStepIdx = (() => {
              // Map intermediate statuses to their parent step
              const statusMap: Record<string, string> = {
                idee: "idee", skript: "skript", freigabe: "freigabe",
                korrektur: "freigabe", freigegeben: "gedreht",
                gedreht: "gedreht", geschnitten: "review",
                review: "review", "veröffentlicht": "veröffentlicht",
              };
              const mapped = statusMap[idea.status] || idea.status;
              return stepKeys.indexOf(mapped);
            })();
            const needsAction = idea.status === "freigabe" || idea.status === "review";

            return (
              <button
                key={idea._id}
                onClick={() => onNavigate("idea", idea._id)}
                className={`animate-in stagger-${Math.min(i + 1, 4)} w-full text-left bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border overflow-hidden hover:shadow-[var(--shadow-md)] transition-all duration-200 group ${
                  needsAction
                    ? "border-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/20"
                    : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{idea.title}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                        {STATUS_DESCRIPTIONS[idea.status] || STATUS_LABELS[idea.status]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {needsAction && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-warning)] text-white">
                          Aktion nötig
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Mini progress tracker */}
                  <div className="flex items-center gap-1 mt-3">
                    {CLIENT_PIPELINE_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.key} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className="h-1 w-full rounded-full transition-all duration-300"
                              style={{
                                background: isCompleted
                                  ? "var(--color-success)"
                                  : isCurrent
                                    ? (STATUS_COLORS[idea.status] || "var(--color-accent)")
                                    : "var(--color-surface-3)",
                                opacity: isCompleted ? 0.7 : isCurrent ? 1 : 0.4,
                              }}
                            />
                            <span className={`text-[10px] mt-1 ${
                              isCurrent ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-tertiary)]"
                            }`}>
                              {step.icon}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </button>
            );
          })}
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

      {/* Videos Section */}
      {(videos || []).length > 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-medium">Aktuelle Videos</h2>
            <button
              onClick={() => onNavigate("videos")}
              className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] flex items-center gap-0.5 transition-colors"
            >
              Alle ansehen <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(videos || []).slice(0, 4).map((video) => {
              const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
              const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);
              const statusStyle = STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen;
              const needsFeedback = video.status === "review";
              return (
                <button
                  key={video._id}
                  onClick={() => onNavigate("video", video._id)}
                  className={`group text-left bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border overflow-hidden hover:shadow-[var(--shadow-md)] transition-all duration-200 ${
                    needsFeedback ? "border-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/20" : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <div className="relative aspect-video bg-black">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-neutral-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-[#0a0a0a] ml-0.5" />
                      </div>
                    </div>
                    {needsFeedback && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-warning)] text-white text-[11px] font-medium">
                        <MessageSquare className="w-3 h-3" />
                        Feedback gewünscht
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[14px] font-medium truncate">{video.title}</h3>
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {VIDEO_STATUS_LABELS[video.status] || video.status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Help hint for first-time users */}
      {(ideas || []).length > 0 && (videos || []).length === 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="flex items-start gap-3 p-4 bg-[var(--color-accent-surface)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
            <HelpCircle className="w-5 h-5 text-[var(--color-text-tertiary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">So funktioniert's</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
                Sobald Ihr Produktionsteam ein Video hochlädt, erscheint es hier. Sie können dann direkt im Video Kommentare hinterlassen — einfach auf eine Stelle klicken und Ihr Feedback schreiben.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
