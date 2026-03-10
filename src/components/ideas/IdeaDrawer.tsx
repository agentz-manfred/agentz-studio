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
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(8px) saturate(120%)',
          WebkitBackdropFilter: 'blur(8px) saturate(120%)',
        }}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-[80] h-full w-full sm:w-[480px] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: 'var(--color-surface-0)',
          borderLeft: '2px solid var(--color-border-strong)',
          boxShadow: '-6px 0 0 var(--color-green)',
          transitionTimingFunction: 'var(--ease-brutal)',
        }}
      >
        {idea && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                borderBottom: '2px solid var(--color-border-strong)',
                background: 'var(--color-surface-1)',
              }}
            >
              {/* Green accent bar */}
              <div className="flex items-center gap-3 min-w-0">
                <div style={{ width: '3px', height: '20px', background: 'var(--color-green)' }} />
                <StatusBadge status={idea.status} />
                {client && (
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }} className="truncate">
                    {client.name}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid var(--color-border-strong)',
                  background: 'transparent',
                  color: 'var(--color-text-tertiary)',
                  transition: 'all 100ms var(--ease-brutal)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-error)';
                  e.currentTarget.style.color = 'var(--color-error)';
                  e.currentTarget.style.background = 'rgba(255, 51, 51, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-5 space-y-6">
                {/* Title */}
                <h2 style={{
                  fontSize: '20px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                  color: 'var(--color-text-primary)',
                }}>
                  {idea.title}
                </h2>

                {/* Description */}
                {idea.description && (
                  <div style={{
                    background: 'var(--color-surface-1)',
                    border: '2px solid var(--color-border-strong)',
                    padding: '16px',
                  }}>
                    <RichTextDisplay content={idea.description} className="text-[var(--color-text-secondary)]" />
                  </div>
                )}

                {/* Admin controls */}
                {user?.role === "admin" && (
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusSelector current={idea.status} onChange={handleStatusChange} />
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {new Date(idea.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <Send style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} strokeWidth={2} />
                      <input
                        type="date"
                        value={idea.scheduledPublishDate || ""}
                        onChange={(e) => { if (token) updateIdea({ token, ideaId: idea._id as Id<"ideas">, scheduledPublishDate: e.target.value || undefined }); }}
                        style={{
                          height: '28px',
                          padding: '0 8px',
                          border: '2px solid var(--color-border-strong)',
                          background: 'var(--color-surface-0)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-secondary)',
                        }}
                        className="focus:border-[var(--color-green)] focus:outline-none"
                        title="Geplante Veröffentlichung"
                      />
                      <button
                        onClick={async () => {
                          if (!token) return;
                          const newState = !idea.archived;
                          await archiveIdea({ token, ideaId: idea._id as Id<"ideas">, archived: newState });
                          if (newState) onClose();
                        }}
                        className="flex items-center gap-1"
                        style={{
                          height: '28px',
                          padding: '0 10px',
                          border: '2px solid var(--color-border-strong)',
                          background: 'transparent',
                          fontSize: '11px',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                          color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          transition: 'all 100ms var(--ease-brutal)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-green)';
                          e.currentTarget.style.color = 'var(--color-green)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                          e.currentTarget.style.color = 'var(--color-text-tertiary)';
                        }}
                        title={idea.archived ? "Wiederherstellen" : "Archivieren"}
                      >
                        {idea.archived ? <ArchiveRestore style={{ width: '12px', height: '12px' }} strokeWidth={2} /> : <Archive style={{ width: '12px', height: '12px' }} strokeWidth={2} />}
                        {idea.archived ? "RESTORE" : "ARCHIV"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Shoot dates */}
                {ideaShootDates.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {ideaShootDates.map((sd, i) => (
                      <div
                        key={sd._id}
                        className="flex items-center gap-3"
                        style={{
                          background: 'var(--color-surface-1)',
                          border: '2px solid var(--color-border-strong)',
                          padding: '12px 16px',
                          marginTop: i > 0 ? '-2px' : '0',
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--color-border-strong)',
                          background: 'var(--color-surface-0)',
                        }}>
                          <Clock style={{ width: '14px', height: '14px', color: 'var(--color-green)' }} strokeWidth={2} />
                        </div>
                        <div>
                          <p style={{
                            fontSize: '13px',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                          }}>
                            {new Date(sd.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}
                            {sd.time && (
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-green)', marginLeft: '8px' }}>
                                {sd.time}
                              </span>
                            )}
                          </p>
                          {sd.location && (
                            <p style={{
                              fontSize: '11px',
                              color: 'var(--color-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              marginTop: '2px',
                            }}>
                              {sd.location}
                            </p>
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
