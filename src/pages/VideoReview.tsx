import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { VideoPlayer } from "../components/video/VideoPlayer";
import { useState, useMemo } from "react";
import { ArrowLeft, Send, Check, Clock, MessageSquare, Film, ChevronDown, ChevronUp } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimestampBadge({ time, onClick }: { time: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-accent)] text-white text-[11px] font-mono font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      <Clock className="w-3 h-3" />
      {formatTimestamp(time)}
    </button>
  );
}

export function VideoReview({ videoId, onBack }: { videoId: string; onBack: () => void }) {
  const { user } = useAuth();
  const video = useQuery(api.videos.get, { videoId: videoId as Id<"videos"> });
  const comments = useQuery(api.comments.list, { targetType: "video", targetId: videoId });
  const allUsers = useQuery(api.auth.listUsers);
  const createComment = useMutation(api.comments.create);
  const resolveComment = useMutation(api.comments.resolve);

  const [newComment, setNewComment] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [addTimestamp, setAddTimestamp] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    (allUsers || []).forEach((u: any) => { map[u._id] = u.name; });
    return map;
  }, [allUsers]);

  const sortedComments = useMemo(() => {
    const list = (comments || []).filter(c => !c.parentId);
    return [...list].sort((a, b) => {
      // Timestamp comments sorted by time, others by creation
      if (a.timestamp != null && b.timestamp != null) return a.timestamp - b.timestamp;
      if (a.timestamp != null) return -1;
      if (b.timestamp != null) return 1;
      return a.createdAt - b.createdAt;
    });
  }, [comments]);

  const unresolvedComments = sortedComments.filter(c => !c.resolved);
  const resolvedComments = sortedComments.filter(c => c.resolved);

  const markers = useMemo(() => {
    return (comments || [])
      .filter(c => c.timestamp != null)
      .map(c => ({ time: c.timestamp!, resolved: c.resolved || false }));
  }, [comments]);

  const replies = useMemo(() => {
    const map: Record<string, typeof comments> = {};
    (comments || []).filter(c => c.parentId).forEach(c => {
      const key = c.parentId!;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    await createComment({
      targetType: "video",
      targetId: videoId,
      userId: user.userId as Id<"users">,
      content: newComment.trim(),
      timestamp: addTimestamp ? Math.floor(currentTime) : undefined,
    });
    setNewComment("");
  };

  const handleSeek = (time: number) => {
    setSeekTo(time);
    // Reset seekTo after a tick so it can be re-triggered
    setTimeout(() => setSeekTo(null), 100);
  };

  if (!video) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <p className="text-[14px] text-[var(--color-text-tertiary)]">Video wird geladen…</p>
      </div>
    );
  }

  const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;
  const videoSrc = video.bunnyUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/play_720p.mp4` : "");
  const posterSrc = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : "");

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Video area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Film className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <h1 className="text-[16px] font-semibold tracking-[-0.01em] truncate">{video.title}</h1>
          </div>
          <span className={`ml-auto text-[12px] font-medium px-2 py-0.5 rounded-full ${
            video.status === "freigegeben" ? "bg-emerald-50 text-emerald-600" :
            video.status === "review" ? "bg-amber-50 text-amber-600" :
            "bg-neutral-100 text-neutral-600"
          }`}>
            {video.status}
          </span>
        </div>

        {/* Player */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-[var(--color-surface-0)]">
          {videoSrc ? (
            <div className="w-full max-w-4xl">
              <VideoPlayer
                src={videoSrc}
                poster={posterSrc}
                markers={markers}
                onTimeUpdate={setCurrentTime}
                onTimeClick={handleSeek}
                seekToTime={seekTo}
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <Film className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[14px] text-[var(--color-text-tertiary)]">Video wird verarbeitet…</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">Bunny CDN encodiert das Video. Bitte kurz warten.</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments panel */}
      <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-[var(--color-border-subtle)] flex flex-col bg-[var(--color-surface-1)]">
        {/* Panel header */}
        <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-[14px] font-medium">Kommentare</h2>
          <span className="text-[12px] text-[var(--color-text-tertiary)]">
            ({unresolvedComments.length} offen)
          </span>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
          {unresolvedComments.length === 0 && resolvedComments.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)]">Noch keine Kommentare</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
                Klicke auf eine Stelle im Video und schreibe einen Kommentar
              </p>
            </div>
          )}

          {unresolvedComments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              userName={userMap[comment.userId] || "Unbekannt"}
              replies={(replies[comment._id] || []).map(r => ({
                ...r,
                userName: userMap[r.userId] || "Unbekannt",
              }))}
              onSeek={handleSeek}
              onResolve={() => resolveComment({ commentId: comment._id })}
              canResolve={user?.role === "admin"}
            />
          ))}

          {/* Resolved section */}
          {resolvedComments.length > 0 && (
            <div>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors py-2"
              >
                {showResolved ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {resolvedComments.length} erledigt
              </button>
              {showResolved && (
                <div className="space-y-3 opacity-50">
                  {resolvedComments.map((comment) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      userName={userMap[comment.userId] || "Unbekannt"}
                      replies={[]}
                      onSeek={handleSeek}
                      resolved
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t border-[var(--color-border-subtle)] p-4">
          {addTimestamp && (
            <div className="flex items-center gap-2 mb-2">
              <TimestampBadge time={currentTime} />
              <button
                onClick={() => setAddTimestamp(false)}
                className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              >
                Ohne Zeitstempel
              </button>
            </div>
          )}
          {!addTimestamp && (
            <button
              onClick={() => setAddTimestamp(true)}
              className="flex items-center gap-1 mb-2 text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              <Clock className="w-3 h-3" />
              Mit Zeitstempel ({formatTimestamp(currentTime)})
            </button>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="Feedback geben…"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white flex items-center justify-center hover:bg-[var(--color-accent-hover)] disabled:opacity-30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  userName,
  replies,
  onSeek,
  onResolve,
  canResolve,
  resolved,
}: {
  comment: any;
  userName: string;
  replies: (any & { userName: string })[];
  onSeek: (t: number) => void;
  onResolve?: () => void;
  canResolve?: boolean;
  resolved?: boolean;
}) {
  return (
    <div className={`rounded-[var(--radius-md)] border p-3 transition-colors ${
      resolved
        ? "border-[var(--color-border-subtle)] bg-[var(--color-surface-0)]"
        : "border-[var(--color-border-subtle)] bg-white"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-medium">{userName}</span>
            {comment.timestamp != null && (
              <TimestampBadge time={comment.timestamp} onClick={() => onSeek(comment.timestamp)} />
            )}
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{comment.content}</p>
        </div>
        {!resolved && canResolve && onResolve && (
          <button
            onClick={onResolve}
            className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-success)] transition-colors flex-shrink-0"
            title="Als erledigt markieren"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)] space-y-2">
          {replies.map((r) => (
            <div key={r._id} className="pl-3 border-l-2 border-[var(--color-border)]">
              <span className="text-[11px] font-medium">{r.userName}</span>
              <p className="text-[12px] text-[var(--color-text-secondary)]">{r.content}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
        {new Date(comment.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        {resolved && " · ✓ Erledigt"}
      </p>
    </div>
  );
}
