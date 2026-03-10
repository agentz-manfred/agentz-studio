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
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
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
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[var(--color-border-strong)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-5 bg-[var(--color-green)]" />
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.12em]">Dashboard</span>
        </div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Willkommen, {user?.name?.split(" ")[0] || "zurück"}
        </h1>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
          Aktueller Stand aller Video-Projekte.
        </p>
        <div className="w-12 h-[3px] bg-[var(--color-green)] mt-3" />
      </div>

      {/* Stats */}
      <div className="px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-0">
        {[
          { icon: Film, label: "In Arbeit", value: active, isGreen: false, stagger: 1 },
          { icon: CheckCircle2, label: "Veröffentlicht", value: published, isGreen: true, stagger: 2 },
          { icon: Calendar, label: "Nächster Dreh", value: nextShootLabel, isGreen: false, stagger: 3 },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`animate-in stagger-${stat.stagger} bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-5 flex items-center gap-3 relative transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px]`}
            style={{ marginLeft: idx > 0 ? "-2px" : "0" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = stat.isGreen ? "4px 4px 0px #00DC82" : "4px 4px 0px #0A0A0A";
              el.style.borderColor = stat.isGreen ? "#00DC82" : "rgba(0, 220, 130, 0.3)";
              el.style.zIndex = "10";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = "";
              el.style.borderColor = "";
              el.style.zIndex = "";
            }}
          >
            {/* Left accent */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px]" style={{ background: stat.isGreen ? "var(--color-green)" : "var(--color-surface-4)" }} />
            <div
              className="w-9 h-9 flex items-center justify-center border flex-shrink-0"
              style={{
                background: stat.isGreen ? "var(--color-green-subtle)" : "var(--color-surface-2)",
                borderColor: stat.isGreen ? "var(--color-border-green)" : "var(--color-border-strong)",
              }}
            >
              <stat.icon className="w-[18px] h-[18px]" style={{ color: stat.isGreen ? "var(--color-green)" : "var(--color-text-tertiary)" }} strokeWidth={2} />
            </div>
            <div>
              <p
                className="text-[24px] font-bold tracking-[-0.02em] leading-none tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  color: stat.isGreen ? "var(--color-green)" : "var(--color-text-primary)",
                }}
              >
                {stat.value}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-[0.08em] font-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ideas List with Progress Tracker */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em]">Projekte</h2>
        </div>
        <div className="space-y-0">
          {(ideas || []).map((idea, i) => {
            // Find current step index for progress display
            const stepKeys = CLIENT_PIPELINE_STEPS.map(s => s.key);
            const currentStepIdx = (() => {
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
                className={`animate-in stagger-${Math.min(i + 1, 4)} w-full text-left bg-[var(--color-surface-1)] border-2 overflow-hidden group transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                  needsAction
                    ? "border-[var(--color-warning)]"
                    : "border-[var(--color-border-strong)] hover:border-[var(--color-border-green)]"
                }`}
                style={{
                  marginTop: i > 0 ? "-2px" : "0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = needsAction ? "4px 4px 0px #FFB800" : "4px 4px 0px #0A0A0A";
                  e.currentTarget.style.zIndex = "10";
                  e.currentTarget.style.position = "relative";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.zIndex = "";
                  e.currentTarget.style.position = "";
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold group-hover:text-[var(--color-green)] transition-colors">{idea.title}</p>
                      <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">
                        {STATUS_DESCRIPTIONS[idea.status] || STATUS_LABELS[idea.status]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {needsAction && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--color-warning)] text-[#0A0A0A] uppercase tracking-[0.04em]">
                          Aktion nötig
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
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
                              className="h-2 w-full transition-all duration-300"
                              style={{
                                background: isCompleted
                                  ? "var(--color-green)"
                                  : isCurrent
                                    ? (STATUS_COLORS[idea.status] || "var(--color-green)")
                                    : "var(--color-surface-3)",
                                opacity: isCompleted ? 0.7 : isCurrent ? 1 : 0.4,
                              }}
                            />
                            <span className={`text-[10px] mt-1 ${
                              isCurrent ? "text-[var(--color-text-primary)] font-semibold" : "text-[var(--color-text-muted)]"
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
            <div className="border-2 border-dashed border-[var(--color-border-strong)] p-16 text-center relative">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-green)]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-green)]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-green)]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-green)]" />
              <div className="w-12 h-12 mx-auto mb-3 border-2 border-[var(--color-border-strong)] flex items-center justify-center">
                <Film className="w-6 h-6 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-[0.02em]">Noch keine Projekte</p>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1.5 max-w-sm mx-auto">
                Sobald Ihr Produktionsteam ein Video-Projekt startet, erscheint es hier.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Videos Section */}
      {(videos || []).length > 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
              <h2 className="text-[13px] font-bold uppercase tracking-[0.08em]">Aktuelle Videos</h2>
            </div>
            <button
              onClick={() => onNavigate("videos")}
              className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-green)] flex items-center gap-0.5 transition-colors"
            >
              Alle ansehen <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {(videos || []).slice(0, 4).map((video, idx) => {
              const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
              const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);
              const statusStyle = STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen;
              const needsFeedback = video.status === "review";
              return (
                <button
                  key={video._id}
                  onClick={() => onNavigate("video", video._id)}
                  className={`group text-left bg-[var(--color-surface-1)] border-2 overflow-hidden transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                    needsFeedback ? "border-[var(--color-warning)]" : "border-[var(--color-border-strong)] hover:border-[var(--color-border-green)]"
                  }`}
                  style={{
                    marginTop: idx >= 2 ? "-2px" : "0",
                    marginLeft: idx % 2 === 1 ? "-2px" : "0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "4px 4px 0px #0A0A0A";
                    e.currentTarget.style.zIndex = "10";
                    e.currentTarget.style.position = "relative";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.zIndex = "";
                    e.currentTarget.style.position = "";
                  }}
                >
                  <div className="relative aspect-video bg-black">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-neutral-600" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-10 h-10 bg-[var(--color-green)] flex items-center justify-center">
                        <Play className="w-4 h-4 text-[#0A0A0A] ml-0.5" strokeWidth={2.5} />
                      </div>
                    </div>
                    {needsFeedback && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-[var(--color-warning)] text-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.04em]">
                        <MessageSquare className="w-3 h-3" strokeWidth={2} />
                        Feedback
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[13px] font-semibold truncate group-hover:text-[var(--color-green)] transition-colors">{video.title}</h3>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 flex-shrink-0 uppercase tracking-[0.04em]"
                        style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}30` }}
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

      {/* Help hint */}
      {(ideas || []).length > 0 && (videos || []).length === 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="flex items-start gap-3 p-4 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)]">
            <div className="w-8 h-8 flex items-center justify-center border border-[var(--color-border-strong)] flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.06em]">So funktioniert's</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">
                Sobald Ihr Produktionsteam ein Video hochlädt, erscheint es hier. Sie können dann direkt im Video Kommentare hinterlassen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
