import { useAuth } from "../lib/auth";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Settings, Users, Film, Database, Shield, ExternalLink } from "lucide-react";

function InfoRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-[13px] text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-[13px] font-medium ${mono ? "font-mono text-[12px]" : ""}`}>{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const clients = useQuery(api.clients.list);
  const ideas = useQuery(api.ideas.list, {});
  const users = useQuery(api.auth.listUsers);
  const videos = useQuery(api.videos.list, {});

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;

  return (
    <div className="max-w-[720px] mx-auto pb-12">
      <div className="px-6 lg:px-8 pt-8 pb-6">
        <div className="animate-in">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Einstellungen</h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">System-Übersicht & Konfiguration</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 space-y-5">
        {/* Account */}
        <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Shield className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Account</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Name" value={user?.name || "–"} />
            <InfoRow label="E-Mail" value={user?.email || "–"} />
            <InfoRow label="Rolle" value={user?.role === "admin" ? "Administrator" : "Kunde"} />
          </div>
        </div>

        {/* Statistics */}
        <div className="animate-in stagger-2 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Database className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Statistiken</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Kunden" value={(clients || []).length} />
            <InfoRow label="Ideen gesamt" value={(ideas || []).length} />
            <InfoRow label="Veröffentlicht" value={published} />
            <InfoRow label="Videos" value={(videos || []).length} />
            <InfoRow label="Benutzer-Accounts" value={(users || []).length} />
          </div>
        </div>

        {/* Team */}
        <div className="animate-in stagger-3 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Users className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Team & Zugänge</span>
          </div>
          <div className="px-5 py-2">
            {(users || []).map((u) => (
              <div key={u._id} className="flex items-center justify-between py-2.5 border-b border-[var(--color-border-subtle)] last:border-0">
                <div>
                  <p className="text-[13px] font-medium">{u.name}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{u.email}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  u.role === "admin"
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]"
                }`}>
                  {u.role === "admin" ? "Admin" : "Kunde"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System */}
        <div className="animate-in stagger-4 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Settings className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">System</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Backend" value="Convex" />
            <InfoRow label="Video CDN" value="Bunny Stream" />
            <InfoRow label="Hosting" value="Vercel" />
          </div>
          <div className="px-5 pb-4">
            <a
              href="https://dashboard.convex.dev/t/manfred-bellmann/agentz-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Convex Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
