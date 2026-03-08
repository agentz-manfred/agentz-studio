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
  const { user } = useAuth();
  const { selectedClientId } = useClientFilter();
  const isClient = user?.role === "client";
  const clientFilter = isClient && user?.clientId ? user.clientId : selectedClientId;
  const videos = useQuery(
    clientFilter ? api.videos.listByClient : api.videos.list,
    clientFilter ? { clientId: clientFilter as Id<"clients"> } : (isClient ? "skip" : {})
  );
  const ideas = useQuery(api.ideas.list, clientFilter ? { clientId: clientFilter as Id<"clients"> } : {});
  const clients = useQuery(api.clients.list);
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
      <div className="animate-in mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] title-accent">Videos</h1>
          <p className="text-[14px] text-[var(--color-text-tertiary)] mt-1">
            {isClient ? "Ihre Videos — klicken Sie auf ein Video um Feedback zu geben" : `${(videos || []).length} Videos im Überblick`}
          </p>
        </div>
        {user?.role === "admin" && (videos || []).length > 0 && (
          <button
            onClick={() => {
              // Navigate to ideas page where videos can be uploaded per idea
              onNavigate("ideas");
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Upload className="w-4 h-4" />
            Video hochladen
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {(videos || []).length > 0 && (
        <div className="animate-in stagger-1 flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Videos durchsuchen…"
              className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-border)] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`h-9 px-3 rounded-[var(--radius-md)] text-[12px] font-medium transition-colors ${statusFilter === "all" ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"}`}
            >
              Alle
            </button>
            {Object.entries(VIDEO_STATUS_LABELS).map(([key, label]) => (
              statusCounts[key] ? (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                  className={`h-9 px-3 rounded-[var(--radius-md)] text-[12px] font-medium transition-colors ${statusFilter === key ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"}`}
                >
                  {label} ({statusCounts[key]})
                </button>
              ) : null
            ))}
          </div>
        </div>
      )}

      {(!videos || videos.length === 0) ? (
        <div className="animate-in stagger-1 text-center py-20 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center mx-auto mb-4">
            <Film className="w-7 h-7 text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-[16px] font-semibold text-[var(--color-text-primary)]">Noch keine Videos</p>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1.5 max-w-[300px] mx-auto">
            Lade Videos über die Ideen-Detailseite hoch, um den Review-Prozess zu starten.
          </p>
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("ideas")}
              className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Upload className="w-4 h-4" />
              Zur Ideen-Übersicht
            </button>
          )}
        </div>
      ) : filteredVideos.length === 0 && (searchQuery || statusFilter !== "all") ? (
        <div className="animate-in stagger-1 text-center py-16">
          <Search className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
          <p className="text-[14px] text-[var(--color-text-secondary)]">Keine Videos gefunden</p>
        </div>
      ) : (
        <div className="animate-in stagger-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVideos.map((video) => {
            const idea = video.ideaId ? ideaMap.get(video.ideaId) : undefined;
            const client = idea ? clientMap.get(idea.clientId) : null;
            const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
            const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);

            return (
              <button
                key={video._id}
                onClick={() => onNavigate("video", video._id)}
                className="group text-left bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border)] transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-[#0a0a0a] ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-medium truncate">{video.title}</h3>
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee).bg,
                        color: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.idee).color,
                      }}
                    >
                      {VIDEO_STATUS_LABELS[video.status] || video.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {client && (
                      <span className="text-[12px] text-[var(--color-text-tertiary)]">{client.name}</span>
                    )}
                    {idea && (
                      <>
                        <span className="text-[var(--color-text-tertiary)]">·</span>
                        <span className="text-[12px] text-[var(--color-text-tertiary)] truncate">{idea.title}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
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
