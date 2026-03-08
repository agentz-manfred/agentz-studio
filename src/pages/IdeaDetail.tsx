import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { STATUS_LABELS, STATUS_ORDER, STATUS_BADGE_STYLES } from "../lib/utils";
import { useState } from "react";
import { RichTextEditor, RichTextDisplay } from "../components/ui/RichTextEditor";
import { ArrowLeft, MessageSquare, Send, Check, ChevronDown, FileText, Plus, Save, Clock, Film, Play, ChevronRight, Sparkles, Wand2, Scissors, Archive, ArchiveRestore } from "lucide-react";
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

function ScriptEditor({ ideaId, ideaTitle, ideaDescription, clientName, clientCompany, clientContext, clientPlatforms, clientMainPlatform }: { ideaId: string; ideaTitle: string; ideaDescription?: string; clientName: string; clientCompany?: string; clientContext?: string; clientPlatforms?: string[]; clientMainPlatform?: string }) {
  const { user, token } = useAuth();
  const scripts = useQuery(api.scripts.listByIdea, { ideaId: ideaId as Id<"ideas"> });
  const createScript = useMutation(api.scripts.create);
  const updateScript = useMutation(api.scripts.update);
  const generateScript = useAction(api.ai.generateScript);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<string | null>(null);

  const latestScript = scripts && scripts.length > 0
    ? [...scripts].sort((a, b) => b.version - a.version)[0]
    : null;

  const handleStartEdit = () => {
    setContent(latestScript?.content || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user || !content.trim() || !token) return;
    setSaving(true);
    if (latestScript) {
      await updateScript({ token, id: latestScript._id, content: content.trim() });
    } else {
      await createScript({
        token,
        ideaId: ideaId as Id<"ideas">,
        content: content.trim(),
      });
    }
    setSaving(false);
    setEditing(false);
  };

  const handleAI = async (mode: "generate" | "improve" | "shorten") => {
    setAiLoading(true);
    setAiMode(mode);
    try {
      const result = await generateScript({
        ideaTitle,
        ideaDescription,
        clientName,
        clientCompany,
        clientContext,
        clientPlatforms,
        clientMainPlatform,
        existingScript: content || latestScript?.content || undefined,
        mode,
      });
      setContent(result);
      if (!editing) setEditing(true);
    } catch (err) {
      console.error("AI error:", err);
      alert("KI-Fehler: " + (err instanceof Error ? err.message : "Unbekannt"));
    } finally {
      setAiLoading(false);
      setAiMode(null);
    }
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
        <div className="flex items-center gap-1.5">
          {user?.role === "admin" && !editing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {latestScript ? "Bearbeiten" : <><Plus className="w-3 h-3" /> Skript erstellen</>}
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="p-4">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Skript hier eingeben… Szene 1: Intro [Kamera: Frontal, Halbnah] Text: ..."
          />
          {/* AI Buttons */}
          {user?.role === "admin" && (
            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-[var(--color-border-subtle)]">
              <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">KI</span>
              <button
                onClick={() => handleAI("generate")}
                disabled={aiLoading}
                className="flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 dark:text-violet-300 hover:from-violet-500/20 hover:to-indigo-500/20 border border-violet-200/50 dark:border-violet-500/20 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 ${aiMode === "generate" ? "animate-spin" : ""}`} />
                {aiMode === "generate" ? "Generiert…" : "Generieren"}
              </button>
              {content.trim() && (
                <>
                  <button
                    onClick={() => handleAI("improve")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-200/50 dark:border-amber-500/20 transition-all disabled:opacity-50"
                  >
                    <Wand2 className={`w-3 h-3 ${aiMode === "improve" ? "animate-spin" : ""}`} />
                    {aiMode === "improve" ? "Verbessert…" : "Verbessern"}
                  </button>
                  <button
                    onClick={() => handleAI("shorten")}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-200/50 dark:border-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Scissors className={`w-3 h-3 ${aiMode === "shorten" ? "animate-spin" : ""}`} />
                    {aiMode === "shorten" ? "Kürzt…" : "Kürzen"}
                  </button>
                </>
              )}
            </div>
          )}
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
          <RichTextDisplay content={latestScript.content} className="text-[var(--color-text-secondary)]" />
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-3">
            Zuletzt bearbeitet: {new Date(latestScript.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <FileText className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-40" />
          <p className="text-[13px] text-[var(--color-text-tertiary)]">Noch kein Skript vorhanden</p>
          {user?.role === "admin" && (
            <button
              onClick={() => handleAI("generate")}
              disabled={aiLoading}
              className="mt-3 inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-medium bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 dark:text-violet-300 hover:from-violet-500/20 hover:to-indigo-500/20 border border-violet-200/50 dark:border-violet-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
              {aiLoading ? "KI generiert Skript…" : "Mit KI generieren"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CommentSection({ ideaId }: { ideaId: string }) {
  const { user, token } = useAuth();
  const comments = useQuery(api.comments.list, { targetType: "idea", targetId: ideaId });
  const createComment = useMutation(api.comments.create);
  const resolveComment = useMutation(api.comments.resolve);
  const [newComment, setNewComment] = useState("");
  const [pendingComments, setPendingComments] = useState<{ id: string; content: string; createdAt: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !token) return;
    const content = newComment.trim();
    const tempId = `pending-${Date.now()}`;
    setPendingComments((p) => [...p, { id: tempId, content, createdAt: Date.now() }]);
    setNewComment("");
    try {
      await createComment({
        token,
        targetType: "idea",
        targetId: ideaId,
        content,
      });
    } finally {
      setPendingComments((p) => p.filter((c) => c.id !== tempId));
    }
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
        {pendingComments.map((pc) => (
          <div
            key={pc.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/20 bg-[var(--color-accent-surface)] p-3 animate-pulse"
          >
            <p className="text-[14px] leading-relaxed">{pc.content}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">Wird gesendet…</p>
          </div>
        ))}
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
                  onClick={() => { if (token) resolveComment({ token, commentId: comment._id }); }}
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
  const { user, token } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const shootDates = useQuery(api.shootDates.list, { token: token || "" });
  const updateStatus = useMutation(api.ideas.updateStatus);
  const updateIdea = useMutation(api.ideas.update);
  const archiveIdea = useMutation(api.ideas.archive);

  const idea = (ideas || []).find((i) => i._id === ideaId);
  const client = idea && clients ? clients.find((c) => c._id === idea.clientId) : null;
  const ideaShootDates = (shootDates || []).filter((s) =>
    s.ideaIds.includes(ideaId as Id<"ideas">)
  );

  if (!idea) {
    const isLoading = ideas === undefined;
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </button>
        <p className="text-[14px] text-[var(--color-text-tertiary)]">
          {isLoading ? "Idee wird geladen…" : "Idee nicht gefunden"}
        </p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !token) return;
    await updateStatus({
      token,
      ideaId: idea._id as Id<"ideas">,
      status: newStatus,
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
          <RichTextDisplay content={idea.description} className="text-[var(--color-text-secondary)]" />
        </div>
      )}

      {/* Status change + meta (admin only) */}
      {user?.role === "admin" && (
        <div className="animate-in stagger-2 flex items-center gap-3 mb-6">
          <StatusSelector current={idea.status} onChange={handleStatusChange} />
          <span className="text-[12px] text-[var(--color-text-tertiary)]">
            Erstellt am {new Date(idea.createdAt).toLocaleDateString("de-DE")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            <input
              type="date"
              value={idea.scheduledPublishDate || ""}
              onChange={(e) => { if (token) updateIdea({ token, ideaId: idea._id as Id<"ideas">, scheduledPublishDate: e.target.value || undefined }); }}
              className="h-7 px-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[12px] focus:border-[var(--color-accent)] focus:outline-none"
              title="Geplante Veröffentlichung"
            />
            <button
              onClick={async () => {
                if (!token) return;
                const newState = !idea.archived;
                await archiveIdea({ token, ideaId: idea._id as Id<"ideas">, archived: newState });
                if (newState) onBack();
              }}
              className="h-7 px-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[12px] hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-1 text-[var(--color-text-tertiary)]"
              title={idea.archived ? "Wiederherstellen" : "Archivieren"}
            >
              {idea.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
              {idea.archived ? "Wiederherstellen" : "Archivieren"}
            </button>
          </div>
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
        <ScriptEditor
          ideaId={ideaId}
          ideaTitle={idea.title}
          ideaDescription={idea.description}
          clientName={client?.name || ""}
          clientCompany={client?.company}
          clientContext={(client as any)?.context}
          clientPlatforms={(client as any)?.platforms}
          clientMainPlatform={(client as any)?.mainPlatform}
        />
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
