import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Lightbulb, ChevronRight, Search, Plus, X, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { STATUS_LABELS } from "../lib/utils";
import { useClientFilter } from "../lib/clientFilter";
import type { Id } from "../../convex/_generated/dataModel";

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    idee: "bg-neutral-400",
    skript: "bg-blue-500",
    freigabe: "bg-amber-500",
    korrektur: "bg-orange-500",
    freigegeben: "bg-emerald-500",
    gedreht: "bg-violet-500",
    geschnitten: "bg-indigo-500",
    review: "bg-rose-500",
    "veröffentlicht": "bg-green-600",
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status] || "bg-neutral-400"}`} />;
}

function NewIdeaModal({ onClose }: { onClose: () => void }) {
  const { user, token } = useAuth();
  const clients = useQuery(api.clients.list);
  const createIdea = useMutation(api.ideas.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const categories = useQuery(
    api.categories.listByClient,
    clientId ? { clientId: clientId as Id<"clients"> } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clientId || !token) return;
    setSubmitting(true);
    await createIdea({
      token,
      clientId: clientId as Id<"clients">,
      title,
      description: description || undefined,
      categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[440px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-[17px] font-semibold">Neue Idee</h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kunde *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              required
            >
              <option value="">Kunde wählen…</option>
              {(clients || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
              ))}
            </select>
          </div>
          {clientId && categories && categories.length > 0 && (
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kategorie</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryId("")}
                  className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-colors ${
                    !categoryId
                      ? "bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:border-[var(--color-border)]"
                  }`}
                >
                  Keine
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`h-7 px-3 rounded-full text-[12px] font-medium border transition-colors flex items-center gap-1.5 ${
                      categoryId === cat._id
                        ? "border-current"
                        : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                    }`}
                    style={{ color: cat.color }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Titel *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="Video-Idee…"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none"
              placeholder="Worum geht's?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !clientId || !title}
              className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function AiSuggestModal({ onClose, onAccept, preselectedClientId }: { onClose: () => void; onAccept: (title: string, description: string, clientId: string, category?: string) => void; preselectedClientId?: string }) {
  const clients = useQuery(api.clients.list);
  const ideas = useQuery(api.ideas.list, {});
  const suggestIdeas = useAction(api.ai.suggestIdeas);
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [suggestions, setSuggestions] = useState<Array<{ title: string; description: string; category?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  const selectedClient = (clients || []).find(c => c._id === clientId);
  const categories = useQuery(api.categories.listByClient, clientId ? { clientId: clientId as Id<"clients"> } : "skip");

  const videosPerMonth = (selectedClient as any)?.videosPerMonth || 5;

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-");
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  })();

  const handleGenerate = async () => {
    if (!selectedClient) return;
    setLoading(true);
    try {
      const existingIdeas = (ideas || [])
        .filter(i => i.clientId === clientId)
        .map(i => i.title);
      const categoryNames = (categories || []).map(c => c.name);
      const result = await suggestIdeas({
        clientName: selectedClient.name,
        clientCompany: selectedClient.company,
        clientContext: (selectedClient as any).context || undefined,
        clientPlatforms: (selectedClient as any).platforms || undefined,
        clientMainPlatform: (selectedClient as any).mainPlatform || undefined,
        existingIdeas,
        categoryNames: categoryNames.length > 0 ? categoryNames : undefined,
        count: videosPerMonth,
        month: monthLabel,
      });
      setSuggestions(result);
    } catch (err) {
      console.error(err);
      alert("KI-Fehler: " + (err instanceof Error ? err.message : "Unbekannt"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[520px] mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h3 className="text-[17px] font-semibold">KI-Ideen Vorschläge</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kunde</label>
              <select
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setSuggestions([]); }}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              >
                <option value="">Kunde wählen…</option>
                {(clients || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Monat</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
                />
              </div>
              <div className="w-24">
                <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Anzahl</label>
                <div className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] flex items-center text-[var(--color-text-secondary)]">
                  {videosPerMonth}
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!clientId || loading}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-[var(--radius-md)] bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[14px] font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generiert Ideen…" : `${videosPerMonth} Ideen für ${monthLabel} generieren`}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-[var(--color-surface-0)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 group hover:border-[var(--color-border)] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{s.title}</p>
                      {s.category && (
                        <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)]">{s.category}</span>
                      )}
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{s.description}</p>
                    </div>
                    <button
                      onClick={() => onAccept(s.title, s.description, clientId, s.category)}
                      className="flex-shrink-0 flex items-center gap-1 h-7 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Übernehmen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && suggestions.length === 0 && clientId && (
            <p className="text-center text-[13px] text-[var(--color-text-tertiary)] py-8">
              Klicke auf "Generieren" für KI-Vorschläge
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function IdeasPage({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const { user, token } = useAuth();
  const { selectedClientId } = useClientFilter();
  const clientFilter = user?.role === "client" && user.clientId ? user.clientId : selectedClientId;
  const ideas = useQuery(api.ideas.list, clientFilter ? { clientId: clientFilter as any } : {});
  const clients = useQuery(api.clients.list);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const createIdea = useMutation(api.ideas.create);

  const clientMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c }),
    {} as Record<string, any>
  );

  const filtered = (ideas || []).filter((idea) => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    if (search && !idea.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statuses = ["all", ...Object.keys(STATUS_LABELS)];

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] title-accent">Ideen</h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
              {(ideas || []).length} Ideen insgesamt
            </p>
          </div>
          {user?.role === "admin" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAiSuggest(true)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/20 text-[14px] font-medium hover:from-violet-500/20 hover:to-indigo-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">KI-Ideen</span>
              </button>
              <button
                onClick={() => setShowNewIdea(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Neue Idee</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            placeholder="Suchen…"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Alle Status" : STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Idea list */}
      <div className="px-6 lg:px-8 pb-8 space-y-1.5">
        {filtered.map((idea, i) => (
          <button
            key={idea._id}
            onClick={() => onNavigate("idea", idea._id)}
            className={`animate-in stagger-${Math.min(i + 1, 4)} w-full text-left bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 hover:shadow-[var(--shadow-sm)] transition-all group`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <StatusDot status={idea.status} />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium truncate">{idea.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">
                      {STATUS_LABELS[idea.status]}
                    </span>
                    {clientMap[idea.clientId] && (
                      <>
                        <span className="text-[var(--color-text-tertiary)]">·</span>
                        <span className="text-[12px] text-[var(--color-text-tertiary)]">
                          {clientMap[idea.clientId].name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-40" />
            <p className="text-[14px] text-[var(--color-text-tertiary)]">
              {search || statusFilter !== "all" ? "Keine Ideen gefunden" : "Noch keine Ideen"}
            </p>
          </div>
        )}
      </div>

      {showNewIdea && <NewIdeaModal onClose={() => setShowNewIdea(false)} />}
      {showAiSuggest && (
        <AiSuggestModal
          onClose={() => setShowAiSuggest(false)}
          onAccept={async (title, description, clientId, _category) => {
            if (!user || !token) return;
            await createIdea({
              token,
              clientId: clientId as Id<"clients">,
              title,
              description,
            });
          }}
        />
      )}
    </div>
  );
}
