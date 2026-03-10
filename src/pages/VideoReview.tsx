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
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--color-green)] text-[#0A0A0A] text-[11px] font-bold hover:bg-[var(--color-green-dark)] transition-colors border border-[var(--color-green-dark)]"
      style={{ fontFamily: 'var(--font-mono)', borderRadius: 0 }}
    >
      <Clock className="w-3 h-3" strokeWidth={2.5} />
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
  const [pendingComments, setPendingComments] = useState<{ id: string; content: string; timestamp?: number; createdAt: number }[]>([]);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    (allUsers || []).forEach((u: any) => { map[u._id] = u.name; });
    return map;
  }, [allUsers]);

  const sortedComments = useMemo(() => {
    const list = (comments || []).filter(c => !c.parentId);
    return [...list].sort((a, b) => {
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
      token: token!,
      videoId: videoId as Id<"videos">,
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
    const content = newComment.trim();
    const ts = addTimestamp ? Math.floor(currentTime) : undefined;
    const tempId = `pending-${Date.now()}`;
    setPendingComments((p) => [...p, { id: tempId, content, timestamp: ts, createdAt: Date.now() }]);
    setNewComment("");
    try {
      await createComment({
        token,
        targetType: "video",
        targetId: videoId,
        content,
        timestamp: ts,
      });
    } finally {
      setPendingComments((p) => p.filter((c) => c.id !== tempId));
    }
  };

  const handleSeek = (time: number) => {
    setSeekTo(time);
    setTimeout(() => setSeekTo(null), 100);
  };

  if (video === undefined) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Zurück
        </button>
        <p className="text-[14px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>Video wird geladen…</p>
      </div>
    );
  }
  if (!video) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Zurück
        </button>
        <p className="text-[14px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>Video nicht gefunden</p>
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
        <div className="px-6 py-4 border-b-2 border-[var(--color-border-strong)] flex items-center gap-3 bg-[var(--color-surface-0)]">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-colors border border-transparent hover:border-[var(--color-green)]"
            style={{ borderRadius: 0 }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Film className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={2} />
            <h1 className="text-[14px] font-bold uppercase tracking-[0.02em] truncate" style={{ fontFamily: 'var(--font-body)' }}>{video.title}</h1>
            {linkedIdea && onNavigate && (
              <button
                onClick={() => onNavigate("idea", linkedIdea._id)}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] bg-[var(--color-green-subtle)] text-[var(--color-green)] hover:bg-[var(--color-green-muted)] transition-colors border border-[var(--color-green)] flex-shrink-0"
                style={{ borderRadius: 0, fontFamily: 'var(--font-body)' }}
              >
                <Lightbulb className="w-3 h-3" strokeWidth={2} />
                {linkedIdea.title}
              </button>
            )}
          </div>
          {/* Video Status */}
          <div className="ml-auto relative">
            <button
              onClick={() => user?.role === "admin" && setShowStatusMenu(!showStatusMenu)}
              className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-[0.04em] inline-flex items-center gap-1 transition-colors border"
              style={{
                borderRadius: 0,
                fontFamily: 'var(--font-body)',
                background: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen).bg,
                color: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen).color,
                borderColor: (STATUS_BADGE_STYLES[video.status] || STATUS_BADGE_STYLES.hochgeladen).color,
                cursor: user?.role === "admin" ? "pointer" : "default",
              }}
            >
              {VIDEO_STATUS_LABELS[video.status] || video.status}
              {user?.role === "admin" && <ChevronDown className="w-3 h-3" strokeWidth={2} />}
            </button>
            {showStatusMenu && user?.role === "admin" && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] z-50 py-1" style={{ borderRadius: 0 }}>
                {["hochgeladen", "review", "korrektur", "freigegeben", "final"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (token) updateVideoStatus({ token, videoId: videoId as Id<"videos">, status: s });
                      setShowStatusMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] uppercase tracking-[0.04em] font-bold flex items-center gap-2 transition-colors hover:bg-[var(--color-green-subtle)] hover:text-[var(--color-green)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <span className="w-[8px] h-[8px] flex-shrink-0" style={{ background: STATUS_BADGE_STYLES[s]?.color || "#737373", borderRadius: 0 }} />
                    {VIDEO_STATUS_LABELS[s] || s}
                    {s === video.status && <Check className="w-3.5 h-3.5 ml-auto text-[var(--color-green)]" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {user?.role === "admin" && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowSharePanel(!showSharePanel)}
                className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-colors border border-transparent hover:border-[var(--color-green)]"
                title="Teilen"
                style={{ borderRadius: 0 }}
              >
                <Share2 className="w-4 h-4" strokeWidth={2} />
              </button>
              {showSharePanel && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] z-50 p-4" style={{ borderRadius: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-[3px] h-[14px] bg-[var(--color-green)]" />
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>Share-Links</h3>
                  </div>
                  {(shareLinks || []).filter(l => l.active).length === 0 ? (
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mb-3" style={{ fontFamily: 'var(--font-body)' }}>Noch kein Share-Link erstellt.</p>
                  ) : (
                    <div className="mb-3">
                      {(shareLinks || []).filter(l => l.active).map((link, i) => (
                        <div key={link._id} className="flex items-center gap-2 p-2 bg-[var(--color-surface-0)] border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0, marginTop: i > 0 ? '-2px' : 0 }}>
                          <Link2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" strokeWidth={2} />
                          <span className="text-[11px] text-[var(--color-text-secondary)] flex-1 truncate" style={{ fontFamily: 'var(--font-mono)' }}>
                            …/share/{link.token.slice(0, 8)}…
                          </span>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{link.viewCount}×</span>
                          <button
                            onClick={() => handleCopyShareLink(link.token)}
                            className="p-1 hover:bg-[var(--color-green-subtle)] transition-colors border border-transparent hover:border-[var(--color-green)]"
                            style={{ borderRadius: 0 }}
                          >
                            {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-[var(--color-success)]" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />}
                          </button>
                          <button
                            onClick={() => deactivateShareLink({ token: token!, linkId: link._id })}
                            className="text-[10px] font-bold uppercase text-[var(--color-error)] hover:underline"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Löschen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleCreateShareLink}
                    className="btn-brutal w-full h-8 text-[11px] font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
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
              <div className="w-12 h-12 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] flex items-center justify-center mx-auto mb-3" style={{ borderRadius: 0 }}>
                <Film className="w-6 h-6 text-[var(--color-text-tertiary)]" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>Video wird verarbeitet…</p>
              <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1" style={{ fontFamily: 'var(--font-body)' }}>Bunny CDN encodiert das Video. Bitte kurz warten.</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments panel */}
      <div className="w-full lg:w-[380px] border-t-2 lg:border-t-0 lg:border-l-2 border-[var(--color-border-strong)] flex flex-col bg-[var(--color-surface-1)]">
        {/* Panel header */}
        <div className="px-4 py-3 border-b-2 border-[var(--color-border-strong)] flex items-center gap-2">
          <div className="w-[3px] h-[14px] bg-[var(--color-green)]" />
          <MessageSquare className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={2} />
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>Kommentare</h2>
          <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
            ({unresolvedComments.length} offen)
          </span>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-auto px-4 py-3">
          {unresolvedComments.length === 0 && resolvedComments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] flex items-center justify-center mx-auto mb-2" style={{ borderRadius: 0 }}>
                <MessageSquare className="w-5 h-5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>Noch keine Kommentare</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                Klicke auf eine Stelle im Video und schreibe einen Kommentar
              </p>
            </div>
          )}

          {unresolvedComments.map((comment, i) => (
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
              isFirst={i === 0}
            />
          ))}

          {/* Optimistic pending comments */}
          {pendingComments.map((pc, i) => (
            <div key={pc.id} className="border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)] p-3 opacity-70 animate-in" style={{ borderRadius: 0, marginTop: (unresolvedComments.length > 0 || i > 0) ? '-2px' : 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.04em]" style={{ fontFamily: 'var(--font-body)' }}>{user?.name}</span>
                {pc.timestamp != null && <TimestampBadge time={pc.timestamp} />}
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>{pc.content}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 uppercase tracking-[0.06em] font-bold" style={{ fontFamily: 'var(--font-body)' }}>Wird gesendet…</p>
            </div>
          ))}

          {/* Resolved section */}
          {resolvedComments.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] transition-colors py-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {showResolved ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} /> : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />}
                {resolvedComments.length} erledigt
              </button>
              {showResolved && (
                <div className="opacity-50">
                  {resolvedComments.map((comment, i) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      userName={userMap[comment.userId] || "Unbekannt"}
                      replies={[]}
                      onSeek={handleSeek}
                      resolved
                      isFirst={i === 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="border-t-2 border-[var(--color-border-strong)] p-4">
          {addTimestamp && (
            <div className="flex items-center gap-2 mb-2">
              <TimestampBadge time={currentTime} />
              <button
                onClick={() => setAddTimestamp(false)}
                className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Ohne Zeitstempel
              </button>
            </div>
          )}
          {!addTimestamp && (
            <button
              onClick={() => setAddTimestamp(true)}
              className="flex items-center gap-1 mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)] hover:text-[var(--color-green)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Clock className="w-3 h-3" strokeWidth={2} />
              Mit Zeitstempel ({formatTimestamp(currentTime)})
            </button>
          )}
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 h-9 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all -mr-[2px]"
              placeholder="Feedback geben…"
              style={{ fontFamily: 'var(--font-body)', borderRadius: 0 }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="h-9 w-9 bg-[var(--color-green)] text-[#0A0A0A] flex items-center justify-center hover:bg-[var(--color-green-dark)] disabled:opacity-30 transition-all border-2 border-[var(--color-green-dark)]"
              style={{ borderRadius: 0 }}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
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
  isFirst,
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
  isFirst?: boolean;
}) {
  const isReplying = replyingTo === comment._id;

  return (
    <div
      className="border-2 p-3 transition-all hover:border-[var(--color-green)]"
      style={{
        borderRadius: 0,
        marginTop: isFirst ? 0 : '-2px',
        borderColor: resolved ? 'var(--color-border-subtle)' : 'var(--color-border-strong)',
        background: resolved ? 'var(--color-surface-0)' : 'var(--color-surface-1)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em]" style={{ fontFamily: 'var(--font-body)' }}>{userName}</span>
            {comment.timestamp != null && (
              <TimestampBadge time={comment.timestamp} onClick={() => onSeek(comment.timestamp)} />
            )}
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>{comment.content}</p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!resolved && onReplyStart && (
            <button
              onClick={() => onReplyStart(comment._id)}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-colors border border-transparent hover:border-[var(--color-green)]"
              title="Antworten"
              style={{ borderRadius: 0 }}
            >
              <Reply className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
          {!resolved && canResolve && onResolve && (
            <button
              onClick={onResolve}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-success)] hover:bg-[rgba(22,163,74,0.08)] transition-colors border border-transparent hover:border-[var(--color-success)]"
              title="Als erledigt markieren"
              style={{ borderRadius: 0 }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-2 pt-2 border-t-2 border-[var(--color-border-subtle)] space-y-2">
          {replies.map((r) => (
            <div key={r._id} className="pl-3 border-l-2 border-[var(--color-green)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.04em]" style={{ fontFamily: 'var(--font-body)' }}>{r.userName}</span>
              <p className="text-[12px] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>{r.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {isReplying && (
        <div className="mt-2 pt-2 border-t-2 border-[var(--color-border-subtle)]">
          <div className="flex gap-0">
            <input
              value={replyText || ""}
              onChange={(e) => onReplyChange?.(e.target.value)}
              className="flex-1 h-7 px-2.5 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[12px] focus:border-[var(--color-green)] focus:outline-none -mr-[2px]"
              placeholder="Antworten…"
              autoFocus
              style={{ fontFamily: 'var(--font-body)', borderRadius: 0 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onReplySubmit?.(comment._id); }
                if (e.key === "Escape") onReplyCancel?.();
              }}
            />
            <button
              onClick={() => onReplySubmit?.(comment._id)}
              disabled={!(replyText || "").trim()}
              className="h-7 w-7 bg-[var(--color-green)] text-[#0A0A0A] flex items-center justify-center hover:bg-[var(--color-green-dark)] disabled:opacity-30 transition-all border-2 border-[var(--color-green-dark)]"
              style={{ borderRadius: 0 }}
            >
              <Send className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
        {new Date(comment.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        {resolved && " · ✓ ERLEDIGT"}
      </p>
    </div>
  );
}
