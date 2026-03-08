import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { VideoPlayer } from "../components/video/VideoPlayer";
import { useState, useMemo } from "react";
import { ArrowLeft, Send, Check, Clock, MessageSquare, Film, ChevronDown, ChevronUp, Share2, Link2, Copy, CheckCheck, Reply, ChevronRight, Lightbulb } from "lucide-react";
import { STATUS_BADGE_STYLES, VIDEO_STATUS_LABELS } from "../lib/utils";
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

export function VideoReview({ videoId, onBack, onNavigate }: { videoId: string; onBack: () => void; onNavigate?: (page: string, id?: string) => void }) {
  const { user, token } = useAuth();
  const video = useQuery(api.videos.get, { videoId: videoId as Id<"videos">, token: token || undefined });
  const linkedIdea = useQuery(api.ideas.get, video?.ideaId ? { ideaId: video.ideaId, token: token || undefined } : "skip");
  const comments = useQuery(api.comments.list, { targetType: "video", targetId: videoId, token: token || undefined });
  const allUsers = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const createComment = useMutation(api.comments.create);
  const resolveComment = useMutation(api.comments.resolve);

  const updateVideoStatus = useMutation(api.videos.updateStatus);
  const shareLinks = useQuery(api.shareLinks.listByVideo, { videoId: videoId as Id<"videos"> });
  const createShareLink = useMutation(api.shareLinks.create);
  const deactivateShareLink = useMutation(api.shareLinks.deactivate);

  const [newComment, setNewComment] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [addTimestamp, setAddTimestamp] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  const handleCreateShareLink = async () => {
    if (!user) return;
    await createShareLink({
      videoId: videoId as Id<"videos">,
      createdBy: user.userId as Id<"users">,
    });
  };

  const handleCopyShareLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user || !token) return;
    await createComment({
      token,
      targetType: "video",
      targetId: videoId,
      content: replyText.trim(),
      parentId: parentId as Id<"comments">,
    });
    setReplyText("");
    setReplyingTo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !token) return;
    await createComment({
      token,
      targetType: "video",
      targetId: videoId,
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
            {linkedIdea && onNavigate && (
              <button
                onClick={() => onNavigate("idea", linkedIdea._id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-accent-surface)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors flex-shrink-0"
              >
                <Lightbulb className="w-3 h-3" />
                {linkedIdea.title}
              </button>
            )}
          </div>
          {/* Video Status - clickable for admin */}
          <div className="ml-auto relative">
            <button
              onClick={() => user?.role === "admin" && setShowStatusMenu(!showStatusMenu)}
              className={`text-[12px] font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 transition-colors ${user?.role === "admin" ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
              style={{
                background: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen).bg,
                color: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen).color,
              }}
            >
              {VIDEO_STATUS_LABELS[video.status] || video.status}
              {user?.role === "admin" && <ChevronDown className="w-3 h-3" />}
            </button>
            {showStatusMenu && user?.role === "admin" && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-50 py-1">
                {["hochgeladen", "review", "korrektur", "freigegeben", "final"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (token) updateVideoStatus({ token, videoId: videoId as Id<"videos">, status: s });
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center gap-2 transition-colors hover:bg-[var(--color-accent-surface)] ${s === video.status ? "font-medium" : ""}`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_BADGE_STYLES[s]?.color || "#737373" }} />
                    {VIDEO_STATUS_LABELS[s] || s}
                    {s === video.status && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {user?.role === "admin" && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowSharePanel(!showSharePanel)}
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                title="Teilen"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {showSharePanel && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-50 p-4">
                  <h3 className="text-[14px] font-medium mb-3">Share-Links</h3>
                  {(shareLinks || []).filter(l => l.active).length === 0 ? (
                    <p className="text-[13px] text-[var(--color-text-tertiary)] mb-3">Noch kein Share-Link erstellt.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {(shareLinks || []).filter(l => l.active).map(link => (
                        <div key={link._id} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)]">
                          <Link2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
                          <span className="text-[12px] text-[var(--color-text-secondary)] flex-1 truncate font-mono">
                            …/share/{link.token.slice(0, 8)}…
                          </span>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">{link.viewCount}×</span>
                          <button
                            onClick={() => handleCopyShareLink(link.token)}
                            className="p-1 rounded hover:bg-[var(--color-surface-3)] transition-colors"
                          >
                            {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />}
                          </button>
                          <button
                            onClick={() => deactivateShareLink({ linkId: link._id })}
                            className="text-[11px] text-[var(--color-error)] hover:underline"
                          >
                            Löschen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleCreateShareLink}
                    className="w-full h-8 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Neuen Link erstellen
                  </button>
                </div>
              )}
            </div>
          )}
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
              onResolve={() => { if (token) resolveComment({ token, commentId: comment._id }); }}
              canResolve={user?.role === "admin"}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyStart={(id) => { setReplyingTo(id); setReplyText(""); }}
              onReplyChange={setReplyText}
              onReplySubmit={handleReply}
              onReplyCancel={() => { setReplyingTo(null); setReplyText(""); }}
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
  replyingTo,
  replyText,
  onReplyStart,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
}: {
  comment: any;
  userName: string;
  replies: (any & { userName: string })[];
  onSeek: (t: number) => void;
  onResolve?: () => void;
  canResolve?: boolean;
  resolved?: boolean;
  replyingTo?: string | null;
  replyText?: string;
  onReplyStart?: (id: string) => void;
  onReplyChange?: (text: string) => void;
  onReplySubmit?: (parentId: string) => void;
  onReplyCancel?: () => void;
}) {
  const isReplying = replyingTo === comment._id;

  return (
    <div className={`rounded-[var(--radius-md)] border p-3 transition-colors ${
      resolved
        ? "border-[var(--color-border-subtle)] bg-[var(--color-surface-0)]"
        : "border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]"
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
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!resolved && onReplyStart && (
            <button
              onClick={() => onReplyStart(comment._id)}
              className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              title="Antworten"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          )}
          {!resolved && canResolve && onResolve && (
            <button
              onClick={onResolve}
              className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-success)] transition-colors"
              title="Als erledigt markieren"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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

      {/* Reply input */}
      {isReplying && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex gap-1.5">
            <input
              value={replyText || ""}
              onChange={(e) => onReplyChange?.(e.target.value)}
              className="flex-1 h-7 px-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[12px] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="Antworten…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onReplySubmit?.(comment._id); }
                if (e.key === "Escape") onReplyCancel?.();
              }}
            />
            <button
              onClick={() => onReplySubmit?.(comment._id)}
              disabled={!(replyText || "").trim()}
              className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white flex items-center justify-center hover:bg-[var(--color-accent-hover)] disabled:opacity-30 transition-all"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
        {new Date(comment.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        {resolved && " · ✓ Erledigt"}
      </p>
    </div>
  );
}
