import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { useClientFilter } from "../lib/clientFilter";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { PipelineSkeleton } from "../components/ui/Skeleton";
import { IdeaDrawer } from "../components/ideas/IdeaDrawer";
import type { Id } from "../../convex/_generated/dataModel";

export function PipelinePage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void }) {
  const { user, token } = useAuth();
  const { selectedClientId } = useClientFilter();
  const clientFilter = user?.role === "client" && user.clientId ? user.clientId : selectedClientId;
  const ideas = useQuery(api.ideas.list, token ? (clientFilter ? { clientId: clientFilter, token } : { token }) : "skip");
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const updateStatus = useMutation(api.ideas.updateStatus);
  const createIdea = useMutation(api.ideas.create);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [drawerIdeaId, setDrawerIdeaId] = useState<string | null>(null);
  const pipelineCategories = useQuery(
    api.categories.listByClient,
    selectedClient && token ? { clientId: selectedClient as Id<"clients">, token } : "skip"
  );

  const clientNames = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c.name }),
    {} as Record<string, string>
  );

  const clientInfoMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: { name: c.name, avatarColor: c.avatarColor } }),
    {} as Record<string, { name: string; avatarColor?: string }>
  );

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    if (!user || !token) return;
    await updateStatus({
      token,
      ideaId: ideaId as Id<"ideas">,
      status: newStatus,
    });
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClient || !token) return;
    await createIdea({
      token,
      clientId: selectedClient as Id<"clients">,
      title: newTitle,
      description: newDesc || undefined,
      categoryId: selectedCategory ? (selectedCategory as Id<"categories">) : undefined,
    });
    setNewTitle("");
    setNewDesc("");
    setSelectedClient("");
    setSelectedCategory("");
    setShowNewIdea(false);
  };

  if (ideas === undefined) return <PipelineSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[var(--color-border-strong)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
                CONTENT PIPELINE
              </span>
            </div>
            <h1 className="text-[24px] font-bold uppercase tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)' }}>Pipeline</h1>
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 uppercase tracking-[0.04em] font-bold" style={{ fontFamily: 'var(--font-body)' }}>Drag & Drop zum Verschieben</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowNewIdea(true)}
              className="btn-brutal flex items-center gap-2 h-9 px-4 text-[12px] font-bold uppercase tracking-[0.06em]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Neue Idee
            </button>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <KanbanBoard
          ideas={(ideas || []) as any[]}
          onStatusChange={handleStatusChange}
          clientNames={clientNames}
          clientInfoMap={clientInfoMap}
          onIdeaClick={(id) => setDrawerIdeaId(id)}
        />
      </div>

      {/* Idea Drawer (Slide-Over) */}
      <IdeaDrawer
        ideaId={drawerIdeaId}
        onClose={() => setDrawerIdeaId(null)}
        onNavigate={onNavigate}
      />

      {/* New Idea Modal — Brutal */}
      {showNewIdea && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[440px] mx-4 p-6" style={{ borderRadius: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-[16px] bg-[var(--color-green)]" />
                <h3 className="text-[14px] font-bold uppercase tracking-[0.06em]" style={{ fontFamily: 'var(--font-body)' }}>Neue Idee</h3>
              </div>
              <button
                onClick={() => setShowNewIdea(false)}
                className="p-1 border border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                style={{ borderRadius: 0 }}
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Kunde</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all"
                  style={{ borderRadius: 0, fontFamily: 'var(--font-body)' }}
                  required
                >
                  <option value="">Kunde wählen…</option>
                  {(clients || []).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedClient && pipelineCategories && pipelineCategories.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Kategorie</label>
                  <div className="flex flex-wrap gap-0">
                    <button type="button" onClick={() => setSelectedCategory("")}
                      className="h-7 px-3 text-[11px] font-bold uppercase tracking-[0.04em] border-2 transition-all -mr-[2px]"
                      style={{
                        borderRadius: 0,
                        fontFamily: 'var(--font-body)',
                        borderColor: !selectedCategory ? 'var(--color-green)' : 'var(--color-border-strong)',
                        background: !selectedCategory ? 'var(--color-green-subtle)' : 'transparent',
                        color: !selectedCategory ? 'var(--color-green)' : 'var(--color-text-tertiary)',
                      }}>
                      Keine
                    </button>
                    {pipelineCategories.map((cat) => (
                      <button key={cat._id} type="button" onClick={() => setSelectedCategory(cat._id)}
                        className="h-7 px-3 text-[11px] font-bold uppercase tracking-[0.04em] border-2 transition-all flex items-center gap-1.5 -mr-[2px]"
                        style={{
                          borderRadius: 0,
                          fontFamily: 'var(--font-body)',
                          borderColor: selectedCategory === cat._id ? cat.color : 'var(--color-border-strong)',
                          background: selectedCategory === cat._id ? `${cat.color}15` : 'transparent',
                          color: cat.color,
                        }}>
                        <span className="w-[8px] h-[8px]" style={{ background: cat.color, borderRadius: 0 }} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Titel</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all"
                  placeholder="Video-Idee…"
                  style={{ borderRadius: 0, fontFamily: 'var(--font-body)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>Beschreibung</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-24 px-3 py-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] resize-none focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all"
                  placeholder="Optional…"
                  style={{ borderRadius: 0, fontFamily: 'var(--font-body)' }}
                />
              </div>
              <div className="flex gap-0 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewIdea(false)}
                  className="btn-brutal-outline flex-1 h-10 text-[12px] font-bold uppercase tracking-[0.06em] -mr-[2px]"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="btn-brutal flex-1 h-10 text-[12px] font-bold uppercase tracking-[0.06em]"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
