import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Lightbulb, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { STATUS_LABELS } from "../lib/utils";

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

export function IdeasPage({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, user?.role === "client" && user.clientId ? { clientId: user.clientId as any } : {});
  const clients = useQuery(api.clients.list);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Ideen</h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
          {(ideas || []).length} Ideen insgesamt
        </p>
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
    </div>
  );
}
