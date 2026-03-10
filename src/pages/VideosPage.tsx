import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Film, Play, Clock, Upload, Search } from "lucide-react";
import { STATUS_BADGE_STYLES, VIDEO_STATUS_LABELS } from "../lib/utils";
import { useClientFilter } from "../lib/clientFilter";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface VideosPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function VideosPage({ onNavigate }: VideosPageProps) {
  const { user, token } = useAuth();
  const { selectedClientId } = useClientFilter();
  const isClient = user?.role === "client";
  const clientFilter = isClient && user?.clientId ? user.clientId : selectedClientId;
  const videos = useQuery(
    clientFilter ? api.videos.listByClient : api.videos.list,
    clientFilter 
      ? { clientId: clientFilter as Id<"clients">, token: token ?? undefined } 
      : (token ? { token } : "skip")
  );
  const ideas = useQuery(api.ideas.list, token ? (clientFilter ? { clientId: clientFilter as Id<"clients">, token } : { token }) : "skip");
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const ideaMap = new Map((ideas || []).map(i => [i._id, i]));
  const clientMap = new Map((clients || []).map(c => [c._id, c]));

  const filteredVideos = (videos || [])
    .filter(v => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const idea = v.ideaId ? ideaMap.get(v.ideaId) : undefined;
        const client = idea ? clientMap.get(idea.clientId) : null;
        return v.title.toLowerCase().includes(q) ||
          idea?.title.toLowerCase().includes(q) ||
          client?.name.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const statusCounts = (videos || []).reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="animate-in mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
              VIDEOVERWALTUNG
            </span>
          </div>
          <h1 className="text-[24px] font-bold uppercase tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)' }}>Videos</h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            {isClient ? "Ihre Videos — klicken Sie auf ein Video um Feedback zu geben" : (
              <span><span className="font-mono tabular-nums font-bold">{(videos || []).length}</span> Videos im Überblick</span>
            )}
          </p>
        </div>
        {user?.role === "admin" && (videos || []).length > 0 && (
          <button
            onClick={() => onNavigate("ideas")}
            className="btn-brutal flex items-center gap-2 h-9 px-4 text-[12px] font-bold uppercase tracking-[0.06em]"
          >
            <Upload className="w-4 h-4" strokeWidth={2} />
            Video hochladen
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {(videos || []).length > 0 && (
        <div className="animate-in stagger-1 flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Videos durchsuchen…"
              className="w-full h-9 pl-9 pr-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all"
              style={{ fontFamily: 'var(--font-mono)', borderRadius: 0 }}
            />
          </div>
          <div className="flex gap-0 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className="h-9 px-3 text-[11px] font-bold uppercase tracking-[0.06em] border-2 transition-all -mr-[2px]"
              style={{
                borderRadius: 0,
                fontFamily: 'var(--font-body)',
                borderColor: statusFilter === "all" ? 'var(--color-green)' : 'var(--color-border-strong)',
                background: statusFilter === "all" ? 'var(--color-green)' : 'var(--color-surface-1)',
                color: statusFilter === "all" ? '#0A0A0A' : 'var(--color-text-secondary)',
              }}
            >
              Alle
            </button>
            {Object.entries(VIDEO_STATUS_LABELS).map(([key, label]) => (
              statusCounts[key] ? (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                  className="h-9 px-3 text-[11px] font-bold uppercase tracking-[0.06em] border-2 transition-all -mr-[2px]"
                  style={{
                    borderRadius: 0,
                    fontFamily: 'var(--font-body)',
                    borderColor: statusFilter === key ? 'var(--color-green)' : 'var(--color-border-strong)',
                    background: statusFilter === key ? 'var(--color-green)' : 'var(--color-surface-1)',
                    color: statusFilter === key ? '#0A0A0A' : 'var(--color-text-secondary)',
                  }}
                >
                  {label} ({statusCounts[key]})
                </button>
              ) : null
            ))}
          </div>
        </div>
      )}

      {(!videos || videos.length === 0) ? (
        /* Empty State */
        <div className="animate-in stagger-1 text-center py-20 border-2 border-dashed border-[var(--color-border-strong)] relative" style={{ borderRadius: 0 }}>
          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-green)]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-green)]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-green)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-green)]" />

          <div className="w-16 h-16 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] flex items-center justify-center mx-auto mb-4" style={{ borderRadius: 0 }}>
            <Film className="w-7 h-7 text-[var(--color-text-tertiary)]" strokeWidth={2} />
          </div>
          <p className="text-[16px] font-bold uppercase tracking-[0.02em]" style={{ fontFamily: 'var(--font-display)' }}>Noch keine Videos</p>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1.5 max-w-[300px] mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
            Lade Videos über die Ideen-Detailseite hoch, um den Review-Prozess zu starten.
          </p>
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("ideas")}
              className="btn-brutal mt-5 inline-flex items-center gap-2 h-9 px-4 text-[12px] font-bold uppercase tracking-[0.06em]"
            >
              <Upload className="w-4 h-4" strokeWidth={2} />
              Zur Ideen-Übersicht
            </button>
          )}
        </div>
      ) : filteredVideos.length === 0 && (searchQuery || statusFilter !== "all") ? (
        <div className="animate-in stagger-1 text-center py-16">
          <Search className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" strokeWidth={2} />
          <p className="text-[13px] text-[var(--color-text-secondary)] uppercase tracking-[0.04em] font-bold" style={{ fontFamily: 'var(--font-body)' }}>Keine Videos gefunden</p>
        </div>
      ) : (
        /* Video Grid — stacked cards */
        <div className="animate-in stagger-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 0 }}>
          {filteredVideos.map((video, index) => {
            const idea = video.ideaId ? ideaMap.get(video.ideaId) : undefined;
            const client = idea ? clientMap.get(idea.clientId) : null;
            const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
            const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);

            return (
              <button
                key={video._id}
                onClick={() => onNavigate("video", video._id)}
                className="group text-left border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] overflow-hidden transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_var(--color-green)] hover:border-[var(--color-green)]"
                style={{
                  borderRadius: 0,
                  marginTop: index >= 3 ? '-2px' : 0,
                  marginLeft: index % 3 !== 0 ? '-2px' : 0,
                }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#000]">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-neutral-600" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-10 h-10 bg-[var(--color-green)] flex items-center justify-center border-2 border-[var(--color-green-dark)]" style={{ borderRadius: 0, boxShadow: '2px 2px 0px #0A0A0A' }}>
                      <Play className="w-5 h-5 text-[#0A0A0A] ml-0.5" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.02em] truncate group-hover:text-[var(--color-green)] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>{video.title}</h3>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 flex-shrink-0 uppercase tracking-[0.04em] border"
                      style={{
                        borderRadius: 0,
                        background: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee).bg,
                        color: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee).color,
                        borderColor: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee).color,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {VIDEO_STATUS_LABELS[video.status] || video.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {client && (
                      <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em]" style={{ fontFamily: 'var(--font-body)' }}>{client.name}</span>
                    )}
                    {idea && (
                      <>
                        <span className="text-[var(--color-text-tertiary)]">·</span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)] truncate" style={{ fontFamily: 'var(--font-body)' }}>{idea.title}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 border-t-2 border-[var(--color-border-subtle)] pt-1.5">
                    <Clock className="w-3 h-3 text-[var(--color-text-tertiary)]" strokeWidth={2} />
                    <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
                      {new Date(video.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
