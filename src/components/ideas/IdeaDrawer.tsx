import { useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../lib/auth";
import { StatusBadge, StatusSelector, ScriptEditor, CommentSection, VideoSection } from "../../pages/IdeaDetail";
import { X, Clock, Send, Archive, ArchiveRestore } from "lucide-react";
import { RichTextDisplay } from "../ui/RichTextEditor";
import type { Id } from "../../../convex/_generated/dataModel";

interface IdeaDrawerProps {
  ideaId: string | null;
  onClose: () => void;
  onNavigate?: (page: string, id?: string) => void;
}

export function IdeaDrawer({ ideaId, onClose, onNavigate }: IdeaDrawerProps) {
  const { user, token } = useAuth();
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const shootDates = useQuery(api.shootDates.list, token ? { token } : "skip");
  const updateStatus = useMutation(api.ideas.updateStatus);
  const updateIdea = useMutation(api.ideas.update);
  const archiveIdea = useMutation(api.ideas.archive);

  const idea = ideaId ? (ideas || []).find((i) => i._id === ideaId) : null;
  const client = idea && clients ? clients.find((c) => c._id === idea.clientId) : null;
  const ideaShootDates = ideaId ? (shootDates || []).filter((s) =>
    s.ideaIds.includes(ideaId as Id<"ideas">)
  ) : [];

  const isOpen = ideaId !== null;

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !token || !idea) return;
    await updateStatus({
      token,
      ideaId: idea._id as Id<"ideas">,
      status: newStatus,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-[80] h-full w-full sm:w-[480px] bg-[var(--color-surface-0)] border-l border-[var(--color-border-subtle)] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {idea && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={idea.status} />
                {client && (
                  <span className="text-[13px] text-[var(--color-text-tertiary)] truncate">
                    {client.name}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-5 space-y-6">
                {/* Title */}
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] leading-tight">
                  {idea.title}
                </h2>

                {/* Description */}
                {idea.description && (
                  <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
                    <RichTextDisplay content={idea.description} className="text-[var(--color-text-secondary)]" />
                  </div>
                )}

                {/* Admin controls */}
                {user?.role === "admin" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusSelector current={idea.status} onChange={handleStatusChange} />
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">
                      Erstellt am {new Date(idea.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
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
                          if (newState) onClose();
                        }}
                        className="h-7 px-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[12px] hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-1 text-[var(--color-text-tertiary)]"
                        title={idea.archived ? "Wiederherstellen" : "Archivieren"}
                      >
                        {idea.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                        {idea.archived ? "Wiederherstellen" : "Archiv"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Shoot dates */}
                {ideaShootDates.length > 0 && (
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
                )}

                {/* Script */}
                <ScriptEditor
                  ideaId={ideaId!}
                  ideaTitle={idea.title}
                  ideaDescription={idea.description}
                  clientName={client?.name || ""}
                  clientCompany={client?.company}
                  clientContext={client?.context}
                  clientPlatforms={client?.platforms}
                  clientMainPlatform={client?.mainPlatform}
                />

                {/* Videos */}
                <VideoSection ideaId={ideaId!} onNavigate={onNavigate} />

                {/* Comments */}
                <CommentSection ideaId={ideaId!} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
