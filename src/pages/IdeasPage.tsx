import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Lightbulb, ChevronRight, Search, Plus, X, Sparkles, Check, CheckSquare, Square, Download, Archive, ArchiveRestore } from "lucide-react";
import { exportIdeasCSV } from "../lib/export";
import { useState } from "react";
import { STATUS_LABELS } from "../lib/utils";
import { useClientFilter } from "../lib/clientFilter";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useToast } from "../components/ui/Toast";
import { IdeasListSkeleton } from "../components/ui/Skeleton";
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
  return (
    <div
      className={`w-2.5 h-2.5 flex-shrink-0 border border-current ${colors[status] || "bg-neutral-400"}`}
      style={{ borderRadius: 0 }}
    />
  );
}

function NewIdeaModal({ onClose }: { onClose: () => void }) {
  const { user, token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const createIdea = useMutation(api.ideas.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
  const categories = useQuery(
    api.categories.listByClient,
    clientId && token ? { clientId: clientId as Id<"clients">, token } : "skip"
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div
        ref={trapRef}
        className="animate-in bg-[#111111] w-full max-w-[440px] mx-4 border-2 border-[#3A3A3A]"
        style={{ boxShadow: "4px 4px 0px #00DC82" }}
      >
        {/* Modal header with green accent bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#3A3A3A]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
            <h3 className="text-[15px] font-bold uppercase tracking-[0.08em]">Neue Idee</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-transparent hover:border-red-500 transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Kunde *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] focus:border-[#00DC82] focus:outline-none transition-colors"
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
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Kategorie</label>
              <div className="flex flex-wrap gap-0">
                <button
                  type="button"
                  onClick={() => setCategoryId("")}
                  className={`h-7 px-3 text-[12px] font-medium border-2 transition-colors -mr-[2px] ${
                    !categoryId
                      ? "border-[#00DC82] bg-[#00DC82] text-[#0A0A0A]"
                      : "border-[#3A3A3A] text-[var(--color-text-tertiary)] hover:border-[#00DC82]"
                  }`}
                >
                  Keine
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`h-7 px-3 text-[12px] font-medium border-2 transition-colors flex items-center gap-1.5 -mr-[2px] ${
                      categoryId === cat._id
                        ? "border-current bg-[#1A1A1A]"
                        : "border-[#3A3A3A] hover:border-[#00DC82]"
                    }`}
                    style={{ color: cat.color }}
                  >
                    <span className="w-2 h-2" style={{ background: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Titel *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] focus:border-[#00DC82] focus:outline-none transition-colors font-mono placeholder:font-sans"
              placeholder="Video-Idee…"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] focus:border-[#00DC82] focus:outline-none transition-colors resize-none"
              placeholder="Worum geht's?"
            />
          </div>
          <div className="flex gap-0 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border-2 border-[#3A3A3A] text-[14px] font-bold uppercase tracking-[0.08em] hover:border-[#00DC82] transition-colors -mr-[2px]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !clientId || !title}
              className="flex-1 h-10 border-2 border-[#00DC82] bg-[#00DC82] text-[#0A0A0A] text-[14px] font-bold uppercase tracking-[0.08em] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 transition-all"
              style={{ "--tw-shadow": "4px 4px 0px #0A0A0A" } as any}
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
  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const suggestIdeas = useAction(api.ai.suggestIdeas);
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
  const [suggestions, setSuggestions] = useState<Array<{ title: string; description: string; category?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  const selectedClient = (clients || []).find(c => c._id === clientId);
  const categories = useQuery(api.categories.listByClient, clientId && token ? { clientId: clientId as Id<"clients">, token } : "skip");

  const videosPerWeek = selectedClient?.videosPerWeek || 5;
  const videosPerMonth = Math.round(videosPerWeek * 4.33);

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
        clientContext: selectedClient.context || undefined,
        clientPlatforms: selectedClient.platforms || undefined,
        clientMainPlatform: selectedClient.mainPlatform || undefined,
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div
        ref={trapRef}
        className="animate-in bg-[#111111] w-full max-w-[520px] mx-4 max-h-[80vh] overflow-hidden flex flex-col border-2 border-[#3A3A3A]"
        style={{ boxShadow: "4px 4px 0px #00DC82" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#3A3A3A]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-[15px] font-bold uppercase tracking-[0.08em]">KI-Ideen Vorschläge</h3>
          </div>
          <button onClick={onClose} className="p-1 border-2 border-transparent hover:border-red-500 transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Kunde</label>
              <select
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setSuggestions([]); }}
                className="w-full h-10 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] focus:border-[#00DC82] focus:outline-none"
              >
                <option value="">Kunde wählen…</option>
                {(clients || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-0">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Monat</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] focus:border-[#00DC82] focus:outline-none -mr-[2px]"
                />
              </div>
              <div className="w-28">
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#00DC82] mb-1.5">Anzahl</label>
                <div className="h-10 px-3 border-2 border-[#3A3A3A] bg-[#0A0A0A] text-[14px] flex items-center text-[var(--color-text-secondary)] font-mono">
                  {videosPerMonth}
                </div>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 font-mono">{videosPerWeek}/Wo × ~4.33</p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!clientId || loading}
              className="flex items-center justify-center gap-2 w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[14px] font-bold uppercase tracking-[0.08em] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50 transition-all border-2 border-violet-500"
              style={{ boxShadow: loading ? "none" : "2px 2px 0px #0A0A0A" }}
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generiert Ideen…" : `${videosPerMonth} Ideen für ${monthLabel} generieren`}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-0">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="bg-[#0A0A0A] border-2 border-[#3A3A3A] p-4 group hover:border-[#00DC82] transition-all -mb-[2px] last:mb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{s.title}</p>
                      {s.category && (
                        <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 border border-[#3A3A3A] text-[var(--color-text-tertiary)]">{s.category}</span>
                      )}
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{s.description}</p>
                    </div>
                    <button
                      onClick={() => onAccept(s.title, s.description, clientId, s.category)}
                      className="flex-shrink-0 flex items-center gap-1 h-7 px-3 text-[12px] font-bold uppercase tracking-[0.08em] bg-[#00DC82] text-[#0A0A0A] border-2 border-[#00DC82] opacity-0 group-hover:opacity-100 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
            <p className="text-center text-[13px] text-[var(--color-text-tertiary)] py-8 font-mono">
              → Klicke auf "Generieren" für KI-Vorschläge
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
  const ideas = useQuery(api.ideas.list, token ? (clientFilter ? { clientId: clientFilter, token } : { token }) : "skip");
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const createIdea = useMutation(api.ideas.create);
  const updateStatus = useMutation(api.ideas.updateStatus);
  const archiveIdea = useMutation(api.ideas.archive);
  const archivedIdeas = useQuery(api.ideas.listArchived, showArchived && token ? (clientFilter ? { clientId: clientFilter, token } : { token }) : "skip");
  const { toast } = useToast();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((i) => i._id)));
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || !token || selectedIds.size === 0) return;
    const count = selectedIds.size;
    const promises = [...selectedIds].map((id) =>
      updateStatus({ token, ideaId: id as Id<"ideas">, status: bulkStatus })
    );
    await Promise.all(promises);
    toast(`${count} Idee${count > 1 ? "n" : ""} auf "${STATUS_LABELS[bulkStatus]}" gesetzt`);
    setSelectedIds(new Set());
    setBulkStatus("");
  };

  const clientMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c }),
    {} as Record<string, any>
  );

  const filtered = (ideas || []).filter((idea) => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!idea.title.toLowerCase().includes(q) && !(idea.description || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const statuses = ["all", ...Object.keys(STATUS_LABELS)];

  if (ideas === undefined) return <IdeasListSkeleton />;

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[#3A3A3A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 bg-[#00DC82] flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00DC82]">IDEENVERWALTUNG</p>
              <h1 className="text-[22px] font-bold uppercase tracking-[-0.01em]">Ideen</h1>
            </div>
          </div>
          <div className="flex items-center gap-0">
            <p className="text-[12px] font-mono text-[var(--color-text-tertiary)] mr-4">
              {(ideas || []).length} TOTAL
            </p>
            {user?.role === "admin" && (
              <>
                <button
                  onClick={() => setShowAiSuggest(true)}
                  className="flex items-center gap-1.5 h-9 px-4 border-2 border-violet-500 bg-violet-500/10 text-violet-300 text-[13px] font-bold uppercase tracking-[0.06em] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-violet-500/20 transition-all -mr-[2px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">KI-Ideen</span>
                </button>
                <button
                  onClick={() => setShowNewIdea(true)}
                  className="btn-brutal flex items-center gap-2 h-9 px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Neue Idee</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 border-2 border-[#3A3A3A] bg-[#111111] text-[14px] focus:border-[#00DC82] focus:outline-none transition-colors font-mono placeholder:text-[var(--color-text-tertiary)] sm:-mr-[2px]"
            placeholder="SUCHEN…"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 border-2 border-[#3A3A3A] bg-[#111111] text-[13px] focus:border-[#00DC82] focus:outline-none uppercase tracking-[0.04em] -mr-[2px]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "ALLE STATUS" : STATUS_LABELS[s].toUpperCase()}
            </option>
          ))}
        </select>
        {user?.role === "admin" && (
          <button
            onClick={() =>
              exportIdeasCSV(
                filtered.map((i) => ({
                  ...i,
                  clientName: clientMap[i.clientId]?.name,
                }))
              )
            }
            className="h-9 px-3 border-2 border-[#3A3A3A] bg-[#111111] text-[13px] font-bold uppercase tracking-[0.06em] hover:border-[#00DC82] transition-colors flex items-center gap-1.5 -mr-[2px]"
            title="Als CSV exportieren"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        )}
        {user?.role === "admin" && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`h-9 px-3 border-2 text-[13px] font-bold uppercase tracking-[0.06em] transition-all flex items-center gap-1.5 ${
              showArchived
                ? "border-[#00DC82] bg-[#00DC82] text-[#0A0A0A]"
                : "border-[#3A3A3A] bg-[#111111] hover:border-[#00DC82]"
            }`}
            title="Archiv anzeigen"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archiv</span>
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && user?.role === "admin" && (
        <div className="px-6 lg:px-8 pb-2">
          <div className="flex items-center gap-3 px-4 py-2.5 border-2 border-[#00DC82] bg-[#0A0A0A]">
            <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#00DC82]">
              {selectedIds.size} AUSGEWÄHLT
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="h-7 px-2 border-2 border-[#3A3A3A] bg-[#111111] text-[12px] focus:outline-none uppercase"
            >
              <option value="">STATUS ÄNDERN…</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStatusChange}
              disabled={!bulkStatus}
              className="h-7 px-3 bg-[#00DC82] text-[#0A0A0A] text-[12px] font-bold uppercase tracking-[0.08em] border-2 border-[#00DC82] disabled:opacity-40 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              Anwenden
            </button>
            <button
              onClick={async () => {
                if (!token) return;
                const count = selectedIds.size;
                await Promise.all([...selectedIds].map((id) => archiveIdea({ token, ideaId: id as Id<"ideas">, archived: true })));
                toast(`${count} Idee${count > 1 ? "n" : ""} archiviert`);
                setSelectedIds(new Set());
              }}
              className="h-7 px-3 border-2 border-[#3A3A3A] text-[12px] font-bold uppercase tracking-[0.06em] hover:border-[#00DC82] transition-colors flex items-center gap-1"
            >
              <Archive className="w-3 h-3" />
              Archivieren
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-[12px] font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              aufheben
            </button>
          </div>
        </div>
      )}

      {/* Idea list */}
      <div className="px-6 lg:px-8 pb-8">
        {user?.role === "admin" && filtered.length > 0 && (
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] hover:text-[#00DC82] mb-2 px-1 transition-colors"
          >
            {selectedIds.size === filtered.length ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#00DC82]" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            Alle auswählen
          </button>
        )}
        <div className="flex flex-col">
          {filtered.map((idea, i) => {
            const isSelected = selectedIds.has(idea._id);
            return (
              <div
                key={idea._id}
                className={`animate-in stagger-${Math.min(i + 1, 4)} flex items-center gap-2 -mb-[2px] last:mb-0`}
              >
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(idea._id); }}
                    className="flex-shrink-0 p-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#00DC82]" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => onNavigate("idea", idea._id)}
                  className={`flex-1 text-left bg-[#111111] border-2 p-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group ${
                    isSelected
                      ? "border-[#00DC82] bg-[#0A0A0A]"
                      : "border-[#3A3A3A] hover:border-[#00DC82] hover:shadow-[4px_4px_0px_#00DC82]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusDot status={idea.status} />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium truncate">{idea.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
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
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[#00DC82] transition-colors flex-shrink-0" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="relative text-center py-16 border-2 border-dashed border-[#3A3A3A] mt-4">
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00DC82] -translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00DC82] translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00DC82] -translate-x-[2px] translate-y-[2px]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00DC82] translate-x-[2px] translate-y-[2px]" />
            <Lightbulb className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-40" />
            <p className="text-[13px] font-mono text-[var(--color-text-tertiary)]">
              {search || statusFilter !== "all" ? "KEINE IDEEN GEFUNDEN" : "NOCH KEINE IDEEN"}
            </p>
          </div>
        )}
      </div>

      {/* Archived ideas */}
      {showArchived && archivedIdeas && archivedIdeas.length > 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="border-t-2 border-[#3A3A3A] pt-6 mt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-[3px] h-5 bg-[#00DC82] flex-shrink-0" />
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em] flex items-center gap-1.5">
                <Archive className="w-3 h-3" />
                Archiv ({archivedIdeas.length})
              </p>
            </div>
            <div className="flex flex-col">
              {archivedIdeas.map((idea) => (
                <div key={idea._id} className="flex items-center gap-2 -mb-[2px] last:mb-0">
                  <button
                    onClick={() => onNavigate("idea", idea._id)}
                    className="flex-1 text-left bg-[#111111] border-2 border-[#3A3A3A] p-4 hover:border-[#00DC82] hover:shadow-[4px_4px_0px_#00DC82] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group opacity-60 hover:opacity-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusDot status={idea.status} />
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium truncate">{idea.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                              {STATUS_LABELS[idea.status]}
                            </span>
                            {idea.archivedAt && (
                              <>
                                <span className="text-[var(--color-text-tertiary)]">·</span>
                                <span className="text-[12px] font-mono text-[var(--color-text-tertiary)]">
                                  Archiviert {new Date(idea.archivedAt).toLocaleDateString("de-DE")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!token) return;
                          await archiveIdea({ token, ideaId: idea._id as Id<"ideas">, archived: false });
                          toast("Idee wiederhergestellt");
                        }}
                        className="flex-shrink-0 p-2 border-2 border-transparent hover:border-[#00DC82] text-[var(--color-text-tertiary)] hover:text-[#00DC82] transition-all"
                        title="Wiederherstellen"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
