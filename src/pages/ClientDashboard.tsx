import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Film, Calendar, MessageSquare, CheckCircle2 } from "lucide-react";
import { STATUS_LABELS } from "../lib/utils";
import { Id } from "../../convex/_generated/dataModel";

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ${colors[status] || "bg-neutral-100 text-neutral-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function ClientDashboard() {
  const { user } = useAuth();
  const ideas = useQuery(
    api.ideas.list,
    user?.clientId ? { clientId: user.clientId as Id<"clients"> } : "skip"
  );

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const active = (ideas || []).filter((i) => !["veröffentlicht"].includes(i.status)).length;

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          Meine Videos
        </h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
          Übersicht aller Projekte
        </p>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-3 gap-4">
        <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <Film className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{active}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">In Arbeit</p>
          </div>
        </div>
        <div className="animate-in stagger-2 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <CheckCircle2 className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{published}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">Veröffentlicht</p>
          </div>
        </div>
        <div className="animate-in stagger-3 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <Calendar className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">—</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">Nächster Dreh</p>
          </div>
        </div>
      </div>

      {/* Ideas List */}
      <div className="px-8 pb-8">
        <h2 className="text-[16px] font-medium mb-4">Projekte</h2>
        <div className="space-y-2">
          {(ideas || []).map((idea, i) => (
            <div
              key={idea._id}
              className={`animate-in stagger-${Math.min(i + 1, 4)} bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 flex items-center justify-between hover:shadow-[var(--shadow-xs)] transition-shadow`}
            >
              <div>
                <p className="text-[14px] font-medium">{idea.title}</p>
                {idea.description && (
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                    {idea.description}
                  </p>
                )}
              </div>
              <StatusBadge status={idea.status} />
            </div>
          ))}
          {(ideas || []).length === 0 && (
            <div className="text-center py-12 text-[var(--color-text-tertiary)]">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-[14px]">Noch keine Projekte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
