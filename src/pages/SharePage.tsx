import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { VideoPlayer } from "../components/video/VideoPlayer";
import { useState, useEffect, useMemo } from "react";
import { Film, Lock, Clock, MessageSquare, Eye } from "lucide-react";

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SharePage({ token }: { token: string }) {
  const data = useQuery(api.shareLinks.getByToken, { token });
  const comments = useQuery(
    api.comments.list,
    data?.video ? { targetType: "video" as const, targetId: data.video._id } : "skip"
  );
  const incrementViews = useMutation(api.shareLinks.incrementViews);
  const [viewed, setViewed] = useState(false);
  const [_currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);

  // Increment view count once
  useEffect(() => {
    if (data && !viewed) {
      incrementViews({ token });
      setViewed(true);
    }
  }, [data, viewed, token, incrementViews]);

  const markers = useMemo(() => {
    return (comments || [])
      .filter(c => c.timestamp != null && !c.parentId)
      .map(c => ({ time: c.timestamp!, resolved: c.resolved || false }));
  }, [comments]);

  const handleSeek = (time: number) => {
    setSeekTo(time);
    setTimeout(() => setSeekTo(null), 100);
  };

  // Loading state
  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-white/10" />
          <p className="text-[13px] text-white/40">Laden…</p>
        </div>
      </div>
    );
  }

  // Invalid / expired link
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center px-6">
          <div className="w-14 h-14 bg-white/5 flex items-center justify-center mx-auto mb-4 border-2 border-white/10" style={{ borderRadius: 0 }}>
            <Lock className="w-6 h-6 text-white/30" />
          </div>
          <h1 className="text-[20px] font-semibold text-white mb-2">Link ungültig</h1>
          <p className="text-[14px] text-white/50 max-w-[300px]">
            Dieser Share-Link ist abgelaufen oder wurde deaktiviert.
          </p>
        </div>
      </div>
    );
  }

  const { video, idea, client } = data;
  const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
  const videoSrc = video.bunnyUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/play_720p.mp4` : "");
  const posterSrc = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : "");

  const unresolvedComments = (comments || []).filter(c => !c.parentId && !c.resolved && c.timestamp != null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Minimal header */}
      <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b-2 border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[var(--color-green)] flex items-center justify-center border-2 border-[var(--color-green-dark)]" style={{ borderRadius: 0 }}>
            <span className="text-[#0a0a0a] text-[12px] font-bold">A</span>
          </div>
          <span className="text-[13px] font-bold uppercase text-white/80" style={{ letterSpacing: '0.06em' }}>AgentZ Studio</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/40">
          <Eye className="w-3.5 h-3.5" />
          {data.viewCount + 1} Aufrufe
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Video title + meta */}
        <div className="mb-6">
          <h1 className="text-[22px] sm:text-[28px] font-bold uppercase text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
            {video.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-white/50">
            {client && <span>{client.company || client.name}</span>}
            {idea && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{idea.title}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
              video.status === "freigegeben" ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/30" :
              video.status === "review" ? "bg-amber-500/10 text-amber-400 border-amber-400/30" :
              "bg-white/5 text-white/50 border-white/10"
            }`} style={{ borderRadius: 0, letterSpacing: '0.06em' }}>
              {video.status}
            </span>
          </div>
        </div>

        {/* Player */}
        <div className="overflow-hidden bg-black border-2 border-white/[0.08]" style={{ borderRadius: 0 }}>
          {videoSrc ? (
            <VideoPlayer
              src={videoSrc}
              poster={posterSrc}
              markers={markers}
              onTimeUpdate={setCurrentTime}
              onTimeClick={handleSeek}
              seekToTime={seekTo}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Film className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="text-[14px] text-white/40">Video wird verarbeitet…</p>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp comments (read-only for share) */}
        {unresolvedComments.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-white/40" />
              <h2 className="text-[14px] font-medium text-white/70">
                Feedback ({unresolvedComments.length})
              </h2>
            </div>
            <div className="space-y-2">
              {unresolvedComments.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)).map((comment) => (
                <button
                  key={comment._id}
                  onClick={() => comment.timestamp != null && handleSeek(comment.timestamp)}
                  className="w-full text-left flex items-start gap-3 p-3 bg-white/[0.03] border-2 border-white/[0.08] hover:border-[var(--color-green)]/40 hover:bg-white/[0.05] transition-all"
                  style={{ borderRadius: 0 }}
                >
                  {comment.timestamp != null && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-mono text-white/60">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  )}
                  <p className="text-[13px] text-white/60 leading-relaxed">{comment.content}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-white/[0.08] text-center">
          <p className="text-[11px] text-white/30 uppercase font-bold" style={{ letterSpacing: '0.08em' }}>
            Geteilt über AgentZ Studio · © {new Date().getFullYear()} AgentZ Media
          </p>
        </div>
      </div>
    </div>
  );
}
