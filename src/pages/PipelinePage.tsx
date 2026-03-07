import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export function PipelinePage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, user?.role === "client" && user.clientId ? { clientId: user.clientId as any } : {});
  const clients = useQuery(api.clients.list);
  const updateStatus = useMutation(api.ideas.updateStatus);
  const createIdea = useMutation(api.ideas.create);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const pipelineCategories = useQuery(
    api.categories.listByClient,
    selectedClient ? { clientId: selectedClient as Id<"clients"> } : "skip"
  );

  const clientNames = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c.name }),
    {} as Record<string, string>
  );

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    if (!user) return;
    await updateStatus({
      ideaId: ideaId as Id<"ideas">,
      status: newStatus,
      userId: user.userId as Id<"users">,
    });
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClient) return;
    await createIdea({
      clientId: selectedClient as Id<"clients">,
      title: newTitle,
      description: newDesc || undefined,
      categoryId: selectedCategory ? (selectedCategory as Id<"categories">) : undefined,
      createdBy: user.userId as Id<"users">,
    });
    setNewTitle("");
    setNewDesc("");
    setSelectedClient("");
    setSelectedCategory("");
    setShowNewIdea(false);
  };

  return (
    <div>
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] title-accent">Pipeline</h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">Drag & Drop zum Verschieben</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowNewIdea(true)}
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Neue Idee
            </button>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <KanbanBoard
          ideas={(ideas || []) as any}
          onStatusChange={handleStatusChange}
          clientNames={clientNames}
          onIdeaClick={onNavigate ? (id) => onNavigate("idea", id) : undefined}
        />
      </div>

      {/* New Idea Modal */}
      {showNewIdea && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[440px] mx-4 p-6">
            <h3 className="text-[18px] font-semibold mb-5">Neue Idee</h3>
            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kunde</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px]"
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
                  <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kategorie</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setSelectedCategory("")}
                      className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-colors ${!selectedCategory ? "bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-text-primary)]" : "border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border)]"}`}>
                      Keine
                    </button>
                    {pipelineCategories.map((cat) => (
                      <button key={cat._id} type="button" onClick={() => setSelectedCategory(cat._id)}
                        className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-colors flex items-center gap-1.5 ${selectedCategory === cat._id ? "border-current" : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"}`}
                        style={{ color: cat.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Titel</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px]"
                  placeholder="Video-Idee…"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Beschreibung</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-24 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] resize-none"
                  placeholder="Optional…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewIdea(false)} className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">
                  Abbrechen
                </button>
                <button type="submit" className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
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
