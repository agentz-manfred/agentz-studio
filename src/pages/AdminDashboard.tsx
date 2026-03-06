import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Plus, Users, Film, Lightbulb, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: any;
  label: string;
  value: number | string;
  delay: string;
}) {
  return (
    <div className={`animate-in ${delay} bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{value}</p>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const updateStatus = useMutation(api.ideas.updateStatus);
  const createIdea = useMutation(api.ideas.create);
  const createClient = useMutation(api.clients.create);

  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

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
      createdBy: user.userId as Id<"users">,
    });
    setNewTitle("");
    setNewDesc("");
    setShowNewIdea(false);
  };

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter(
    (i) => !["idee", "veröffentlicht"].includes(i.status)
  ).length;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
              Dashboard
            </h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
              Willkommen, {user?.name}
            </p>
          </div>
          <button
            onClick={() => setShowNewIdea(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium transition-all duration-200 hover:bg-[var(--color-accent-hover)]"
          >
            <Plus className="w-4 h-4" />
            Neue Idee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Users} label="Kunden" value={(clients || []).length} delay="stagger-1" />
          <StatCard icon={Lightbulb} label="Ideen" value={(ideas || []).length} delay="stagger-2" />
          <StatCard icon={TrendingUp} label="In Arbeit" value={inProgress} delay="stagger-3" />
          <StatCard icon={Film} label="Veröffentlicht" value={published} delay="stagger-4" />
        </div>
      </div>

      {/* Kanban */}
      <div className="px-8 pb-8">
        <h2 className="text-[16px] font-medium mb-4">Pipeline</h2>
        <KanbanBoard
          ideas={(ideas || []) as any}
          onStatusChange={handleStatusChange}
          clientNames={clientNames}
        />
      </div>

      {/* New Idea Modal */}
      {showNewIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[440px] p-6">
            <h3 className="text-[18px] font-semibold mb-5">Neue Idee</h3>
            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Kunde
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px]"
                  required
                >
                  <option value="">Kunde wählen...</option>
                  {(clients || []).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Titel
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px]"
                  placeholder="Idee für das nächste Video..."
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Beschreibung
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-24 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] resize-none"
                  placeholder="Optional: Details zur Idee..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewIdea(false)}
                  className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
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
