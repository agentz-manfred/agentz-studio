import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Users, Film, Lightbulb, TrendingUp, ArrowUpRight } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  onClick,
}: {
  icon: any;
  label: string;
  value: number | string;
  delay: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`animate-in ${delay} bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5 text-left hover:shadow-[var(--shadow-sm)] transition-shadow group w-full`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
            <Icon className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[24px] font-semibold tracking-[-0.02em] leading-none">{value}</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">{label}</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

function RecentActivity({ ideas }: { ideas: any[] }) {
  const recent = [...ideas].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="animate-in stagger-4">
      <h2 className="text-[16px] font-medium mb-3">Letzte Aktivität</h2>
      <div className="space-y-1.5">
        {recent.map((idea) => (
          <div key={idea._id} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 flex items-center justify-between">
            <p className="text-[14px] font-medium truncate">{idea.title}</p>
            <span className="text-[12px] text-[var(--color-text-tertiary)] flex-shrink-0 ml-3">
              {new Date(idea.updatedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const { user } = useAuth();
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter(
    (i) => !["idee", "veröffentlicht"].includes(i.status)
  ).length;

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Dashboard</h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
          Willkommen, {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Kunden" value={(clients || []).length} delay="stagger-1" onClick={() => onNavigate("clients")} />
          <StatCard icon={Lightbulb} label="Ideen" value={(ideas || []).length} delay="stagger-2" onClick={() => onNavigate("ideas")} />
          <StatCard icon={TrendingUp} label="In Arbeit" value={inProgress} delay="stagger-3" onClick={() => onNavigate("pipeline")} />
          <StatCard icon={Film} label="Veröffentlicht" value={published} delay="stagger-4" onClick={() => onNavigate("pipeline")} />
        </div>
      </div>

      {/* Recent */}
      <div className="px-6 lg:px-8 pb-8">
        <RecentActivity ideas={ideas || []} />
      </div>
    </div>
  );
}
