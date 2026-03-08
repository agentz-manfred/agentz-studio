import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { useState } from "react";
import { Shield, Clock, User, FileText, Film, Folder, Users, Settings, Archive, ArrowRight, Lightbulb } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  create: "Erstellt",
  update: "Bearbeitet",
  delete: "Gelöscht",
  archive: "Archiviert",
  unarchive: "Wiederhergestellt",
  status_change: "Status geändert",
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-600 bg-emerald-500/10",
  update: "text-blue-600 bg-blue-500/10",
  delete: "text-red-600 bg-red-500/10",
  archive: "text-amber-600 bg-amber-500/10",
  unarchive: "text-violet-600 bg-violet-500/10",
  status_change: "text-indigo-600 bg-indigo-500/10",
};

const ENTITY_ICONS: Record<string, typeof FileText> = {
  idea: Lightbulb,
  video: Film,
  folder: Folder,
  client: Users,
  user: User,
  settings: Settings,
};

const ENTITY_LABELS: Record<string, string> = {
  idea: "Idee",
  video: "Video",
  folder: "Ordner",
  client: "Kunde",
  user: "Benutzer",
  settings: "Einstellungen",
};

export function AuditLogPage() {
  const { token } = useAuth();
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const logs = useQuery(api.auditLog.list, token ? {
    token,
    limit,
    ...(entityFilter !== "all" ? { entityType: entityFilter } : {}),
  } : "skip");

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Gerade eben";
    if (diffMin < 60) return `vor ${diffMin} Min`;
    if (diffHr < 24) return `vor ${diffHr} Std`;
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) + " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] title-accent">Audit Log</h1>
              <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">Wer hat was wann geändert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 lg:px-8 py-4 flex gap-3">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="all">Alle Typen</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value={25}>25 Einträge</option>
          <option value={50}>50 Einträge</option>
          <option value={100}>100 Einträge</option>
          <option value={200}>200 Einträge</option>
        </select>
      </div>

      {/* Log entries */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="space-y-1">
          {(logs || []).map((entry, i) => {
            const Icon = ENTITY_ICONS[entry.entityType] || FileText;
            const actionColor = ACTION_COLORS[entry.action] || "text-neutral-600 bg-neutral-500/10";

            return (
              <div
                key={entry._id}
                className={`animate-in stagger-${Math.min(i + 1, 4)} flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-1)] transition-colors group`}
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center ${actionColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{entry.userName}</span>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${actionColor}`}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">
                      {ENTITY_LABELS[entry.entityType] || entry.entityType}
                    </span>
                  </div>
                  {entry.entityName && (
                    <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                      „{entry.entityName}"
                    </p>
                  )}
                  {entry.details && (
                    <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {entry.details}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="flex-shrink-0 flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.createdAt)}
                </div>
              </div>
            );
          })}
        </div>

        {logs && logs.length === 0 && (
          <div className="text-center py-16">
            <Shield className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
            <p className="text-[14px] text-[var(--color-text-tertiary)]">Noch keine Einträge</p>
          </div>
        )}
      </div>
    </div>
  );
}
