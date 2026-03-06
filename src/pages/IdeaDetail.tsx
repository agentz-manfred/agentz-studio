import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { STATUS_LABELS, STATUS_ORDER } from "../lib/utils";
import { useState } from "react";
import { ArrowLeft, MessageSquare, Send, Check, ChevronDown } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idee: "bg-neutral-100 text-neutral-600",
    skript: "bg-blue-50 text-blue-600",
    freigabe: "bg-amber-50 text-amber-600",
    korrektur: "bg-orange-50 text-orange-600",
    freigegeben: "bg-emerald-50 text-emerald-600",
    gedreht: "bg-violet-50 text-violet-600",
    geschnitten: "bg-indigo-50 text-indigo-600",
    review: "bg-rose-50 text-rose-600",
    "veröffentlicht": "bg-green-50 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${colors[status] || "bg-neutral-100"}`}>
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
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-md)] z-10 py-1">
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

      {/* Comment list */}
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

      {/* New comment */}
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

export function IdeaDetail({ ideaId, onBack }: { ideaId: string; onBack: () => void }) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const updateStatus = useMutation(api.ideas.updateStatus);

  const idea = (ideas || []).find((i) => i._id === ideaId);
  const client = idea && clients ? clients.find((c) => c._id === idea.clientId) : null;

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
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

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

      {/* Status change (admin only) */}
      {user?.role === "admin" && (
        <div className="animate-in stagger-2 flex items-center gap-3 mb-8">
          <StatusSelector current={idea.status} onChange={handleStatusChange} />
          <span className="text-[12px] text-[var(--color-text-tertiary)]">
            Erstellt am {new Date(idea.createdAt).toLocaleDateString("de-DE")}
          </span>
        </div>
      )}

      {/* Comments */}
      <div className="animate-in stagger-3">
        <CommentSection ideaId={ideaId} />
      </div>
    </div>
  );
}
