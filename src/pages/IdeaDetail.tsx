import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { STATUS_LABELS, STATUS_ORDER, STATUS_BADGE_STYLES } from "../lib/utils";
import { useState } from "react";
import { ArrowLeft, MessageSquare, Send, Check, ChevronDown, FileText, Plus, Save, Clock, Film, Play, ChevronRight } from "lucide-react";
import { VideoUpload } from "../components/video/VideoUpload";
import type { Id } from "../../convex/_generated/dataModel";

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_STYLES[status] || { bg: "rgba(163,163,163,0.12)", color: "#737373" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusSelector({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
      >
        Status ändern
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-md)] z-20 py-1">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 ${
                  s === current ? "font-medium text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
                }`}
              >
                {s === current && <Check className="w-3 h-3" />}
                <span className={s === current ? "" : "ml-5"}>{STATUS_LABELS[s]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ScriptEditor({ ideaId }: { ideaId: string }) {
  const { user } = useAuth();
  const scripts = useQuery(api.scripts.listByIdea, { ideaId: ideaId as Id<"ideas"> });
  const createScript = useMutation(api.scripts.create);
  const updateScript = useMutation(api.scripts.update);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const latestScript = scripts && scripts.length > 0
    ? [...scripts].sort((a, b) => b.version - a.version)[0]
    : null;

  const handleStartEdit = () => {
    setContent(latestScript?.content || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    if (latestScript) {
      await updateScript({ id: latestScript._id, content: content.trim() });
    } else {
      await createScript({
        ideaId: ideaId as Id<"ideas">,
        content: content.trim(),
        createdBy: user.userId as Id<"users">,
      });
    }
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h3 className="text-[14px] font-medium">Skript</h3>
          {latestScript && (
            <span className="text-[12px] text-[var(--color-text-tertiary)]">
              v{latestScript.version}
            </span>
          )}
        </div>
        {user?.role === "admin" && !editing && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            {latestScript ? "Bearbeiten" : <><Plus className="w-3 h-3" /> Skript erstellen</>}
          </button>
        )}
      </div>

      {editing ? (
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] leading-relaxed font-[var(--font-body)] focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-y"
            placeholder="Skript hier eingeben…&#10;&#10;Szene 1: Intro&#10;[Kamera: Frontal, Halbnah]&#10;Text: ..."
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setEditing(false)}
              className="h-8 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1.5 h-8 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Speichern
            </button>
          </div>
        </div>
      ) : latestScript ? (
        <div className="p-4">
          <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
            {latestScript.content}
          </p>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-3">
            Zuletzt bearbeitet: {new Date(latestScript.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <FileText className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-40" />
          <p className="text-[13px] text-[var(--color-text-tertiary)]">Noch kein Skript vorhanden</p>
        </div>
      )}
    </div>
  );
}

function CommentSection({ ideaId }: { ideaId: string }) {
  const { user } = useAuth();
  const comments = useQuery(api.comments.list, { targetType: "idea", targetId: ideaId });
  const createComment = useMutation(api.comments.create);
  const resolveComment = useMutation(api.comments.resolve);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    await createComment({
      targetType: "idea",
      targetId: ideaId,
      userId: user.userId as Id<"users">,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  return (
    <div>
      <h3 className="text-[15px] font-medium mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Kommentare
        {(comments || []).length > 0 && (
          <span className="text-[12px] text-[var(--color-text-tertiary)] font-normal">
            ({comments!.length})
          </span>
        )}
      </h3>

      <div className="space-y-3 mb-4">
        {(comments || []).filter(c => !c.parentId).map((comment) => (
          <div
            key={comment._id}
            className={`rounded-[var(--radius-md)] border p-3 transition-colors ${
              comment.resolved
                ? "border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] opacity-60"
                : "border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] leading-relaxed">{comment.content}</p>
              {!comment.resolved && user?.role === "admin" && (
                <button
                  onClick={() => resolveComment({ commentId: comment._id })}
                  className="p-1 rounded hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-success)] transition-colors flex-shrink-0"
                  title="Erledigt"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
              {new Date(comment.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              {comment.resolved && " · ✓ Erledigt"}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          placeholder="Kommentar schreiben…"
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
  );
}

function VideoSection({ ideaId, onNavigate }: { ideaId: string; onNavigate?: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const videos = useQuery(api.videos.list, { ideaId: ideaId as Id<"ideas"> });
  const cdnHost = import.meta.env.VITE_BUNNY_CDN_HOSTNAME;

  return (
    <div>
      <h3 className="text-[15px] font-medium mb-4 flex items-center gap-2">
        <Film className="w-4 h-4" />
        Videos
        {(videos || []).length > 0 && (
          <span className="text-[12px] text-[var(--color-text-tertiary)] font-normal">
            ({videos!.length})
          </span>
        )}
      </h3>

      {/* Video list */}
      {(videos || []).length > 0 && (
        <div className="space-y-2 mb-4">
          {(videos || []).map((video) => {
            const thumb = video.thumbnailUrl || (video.bunnyVideoId && cdnHost ? `https://${cdnHost}/${video.bunnyVideoId}/thumbnail.jpg` : null);
            return (
              <button
                key={video._id}
                onClick={() => onNavigate?.("video", video._id)}
                className="w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-xs)] transition-all text-left group"
              >
                <div className="relative w-20 h-12 rounded-[var(--radius-sm)] overflow-hidden bg-black flex-shrink-0">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-5 h-5 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium truncate">{video.title}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">
                    {new Date(video.createdAt).toLocaleDateString("de-DE")} · {video.status}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Upload (admin only) */}
      {user?.role === "admin" && (
        <VideoUpload ideaId={ideaId} />
      )}
    </div>
  );
}

export function IdeaDetail({ ideaId, onBack, onNavigate }: { ideaId: string; onBack: () => void; onNavigate?: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const shootDates = useQuery(api.shootDates.list, {});
  const updateStatus = useMutation(api.ideas.updateStatus);

  const idea = (ideas || []).find((i) => i._id === ideaId);
  const client = idea && clients ? clients.find((c) => c._id === idea.clientId) : null;
  const ideaShootDates = (shootDates || []).filter((s) =>
    s.ideaIds.includes(ideaId as Id<"ideas">)
  );

  if (!idea) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <p className="text-[14px] text-[var(--color-text-tertiary)]">Idee wird geladen…</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;
    await updateStatus({
      ideaId: idea._id as Id<"ideas">,
      status: newStatus,
      userId: user.userId as Id<"users">,
    });
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[13px] mb-6 animate-in">
        <button
          onClick={() => onNavigate?.("dashboard")}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)]" />
        <button
          onClick={onBack}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Ideen
        </button>
        <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)]" />
        <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[200px]">
          {idea.title}
        </span>
      </nav>

      {/* Header */}
      <div className="animate-in flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] leading-tight">
            {idea.title}
          </h1>
          {client && (
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">{client.name}{client.company ? ` · ${client.company}` : ""}</p>
          )}
        </div>
        <StatusBadge status={idea.status} />
      </div>

      {/* Description */}
      {idea.description && (
        <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 mb-6">
          <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            {idea.description}
          </p>
        </div>
      )}

      {/* Status change + meta (admin only) */}
      {user?.role === "admin" && (
        <div className="animate-in stagger-2 flex items-center gap-3 mb-6">
          <StatusSelector current={idea.status} onChange={handleStatusChange} />
          <span className="text-[12px] text-[var(--color-text-tertiary)]">
            Erstellt am {new Date(idea.createdAt).toLocaleDateString("de-DE")}
          </span>
        </div>
      )}

      {/* Shoot dates */}
      {ideaShootDates.length > 0 && (
        <div className="animate-in stagger-2 mb-6">
          <div className="space-y-2">
            {ideaShootDates.map((sd) => (
              <div key={sd._id} className="flex items-center gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3">
                <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                <div>
                  <p className="text-[14px] font-medium">
                    {new Date(sd.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}
                    {sd.time && ` · ${sd.time}`}
                  </p>
                  {sd.location && (
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{sd.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Editor */}
      <div className="animate-in stagger-3 mb-8">
        <ScriptEditor ideaId={ideaId} />
      </div>

      {/* Videos */}
      <div className="animate-in stagger-4 mb-8">
        <VideoSection ideaId={ideaId} onNavigate={onNavigate} />
      </div>

      {/* Comments */}
      <div className="animate-in stagger-4">
        <CommentSection ideaId={ideaId} />
      </div>
    </div>
  );
}
