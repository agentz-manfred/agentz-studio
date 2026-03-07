import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Film, Play, Clock } from "lucide-react";
import { STATUS_BADGE_STYLES, VIDEO_STATUS_LABELS } from "../lib/utils";

interface VideosPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function VideosPage({ onNavigate }: VideosPageProps) {
  const videos = useQuery(api.videos.list, {});
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);

  const ideaMap = new Map((ideas || []).map(i => [i._id, i]));
  const clientMap = new Map((clients || []).map(c => [c._id, c]));

  // Status colors now handled via STATUS_BADGE_STYLES

  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6">
      <div className="animate-in mb-6">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Videos</h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-1">Alle Videos im Überblick</p>
      </div>

      {(!videos || videos.length === 0) ? (
        <div className="animate-in stagger-1 text-center py-20 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
          <Film className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
          <p className="text-[15px] font-medium text-[var(--color-text-secondary)]">Noch keine Videos</p>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">
            Videos werden über die Ideen-Detailseite hochgeladen
          </p>
        </div>
      ) : (
        <div className="animate-in stagger-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(videos || []).sort((a, b) => b.createdAt - a.createdAt).map((video) => {
            const idea = ideaMap.get(video.ideaId);
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
