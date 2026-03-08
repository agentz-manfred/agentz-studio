import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import {
  Users, Plus, X, Pencil, Trash2, Shield, Eye, KeyRound,
  UserCheck, UserX, Mail, Search,
} from "lucide-react";
import { TeamSkeleton } from "../components/ui/Skeleton";
import type { Id } from "../../convex/_generated/dataModel";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Betrachter",
  client: "Kunde",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Vollzugriff auf alle Bereiche",
  editor: "Inhalte bearbeiten, keine Benutzerverwaltung",
  viewer: "Nur lesen",
  client: "Kundenansicht mit eingeschränktem Zugriff",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  editor: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
  viewer: { bg: "rgba(163,163,163,0.12)", color: "#737373" },
  client: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
};

function UserModal({
  mode,
  user,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  user?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const clients = useQuery(api.clients.list);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "editor");
  const [clientId, setClientId] = useState(user?.clientId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name, email, password, role,
        clientId: role === "client" && clientId ? clientId : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Fehler");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border-subtle)] w-full max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-[17px] font-semibold">
            {mode === "create" ? "Neuer Benutzer" : "Benutzer bearbeiten"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-[13px] text-red-500 bg-red-500/10 rounded-[var(--radius-md)] px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="Max Mustermann" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">E-Mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="max@beispiel.de" />
          </div>
          {mode === "create" && (
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Passwort *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
                placeholder="Mindestens 6 Zeichen" />
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Rolle *</label>
            <div className="grid grid-cols-2 gap-2">
              {(["admin", "editor", "viewer", "client"] as const).map((r) => {
                const rc = ROLE_COLORS[r];
                return (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`p-3 rounded-[var(--radius-md)] border text-left transition-all ${
                      role === r ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]" : "border-[var(--color-border-subtle)] hover:border-[var(--color-border)]"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: rc.bg, color: rc.color }}>
                        {ROLE_LABELS[r]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">{ROLE_DESCRIPTIONS[r]}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {role === "client" && (
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kundenzuordnung</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none">
                <option value="">Kein Kunde zugeordnet</option>
                {(clients || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={saving || !name || !email || (mode === "create" && !password)}
              className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
              {saving ? "Speichern…" : mode === "create" ? "Anlegen" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose }: { user: any; onClose: () => void }) {
  const { token } = useAuth();
  const resetPassword = useMutation(api.auth.resetPassword);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!token) return;
    setSaving(true);
    await resetPassword({ token, userId: user._id as Id<"users">, newPassword: password });
    setSaving(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border-subtle)] w-full max-w-[400px] mx-4 p-6">
        <h3 className="text-[17px] font-semibold mb-1">Passwort zurücksetzen</h3>
        <p className="text-[13px] text-[var(--color-text-tertiary)] mb-4">für {user.name} ({user.email})</p>
        {done ? (
          <div className="text-center py-4">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-[14px] font-medium">Passwort wurde zurückgesetzt</p>
            <button onClick={onClose} className="mt-4 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium">OK</button>
          </div>
        ) : (
          <>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Neues Passwort (min. 6 Zeichen)" minLength={6}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">Abbrechen</button>
              <button onClick={handleReset} disabled={saving || password.length < 6}
                className="flex-1 h-9 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
                {saving ? "Setze zurück…" : "Zurücksetzen"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TeamPage() {
  const { user: currentUser, token } = useAuth();
  const users = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const clients = useQuery(api.clients.list);
  const registerUser = useMutation(api.auth.register);
  const updateUser = useMutation(api.auth.updateUser);
  const deleteUser = useMutation(api.auth.deleteUser);

  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetUser, setResetUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const clientMap = (clients || []).reduce((acc, c) => ({ ...acc, [c._id]: c }), {} as Record<string, any>);

  const filteredUsers = (users || [])
    .filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const roleOrder = { admin: 0, editor: 1, viewer: 2, client: 3 };
      const ra = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
      const rb = roleOrder[b.role as keyof typeof roleOrder] ?? 4;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });

  const handleCreate = async (data: any) => {
    await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      clientId: data.clientId as Id<"clients"> | undefined,
      adminToken: token || "",
    });
  };

  const handleEdit = async (data: any) => {
    if (!editingUser || !token) return;
    await updateUser({
      token,
      userId: editingUser._id as Id<"users">,
      name: data.name,
      email: data.email,
      role: data.role,
      clientId: data.clientId as Id<"clients"> | undefined,
    });
  };

  const handleDelete = async (userId: string) => {
    if (!token) return;
    if (!confirm("Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    await deleteUser({ token, userId: userId as Id<"users"> });
  };

  const roleCounts = (users || []).reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (users === undefined) return <TeamSkeleton />;

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] title-accent">Team</h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
              {(users || []).length} Benutzer verwalten
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Benutzer</span>
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5">
        {/* Role stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {(["admin", "editor", "viewer", "client"] as const).map((r) => {
            const rc = ROLE_COLORS[r];
            return (
              <button key={r}
                onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
                className={`p-3 rounded-[var(--radius-md)] border transition-all text-left ${
                  roleFilter === r ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]" : "border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] hover:border-[var(--color-border)]"
                }`}>
                <p className="text-[20px] font-semibold tabular-nums">{roleCounts[r] || 0}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: rc.color }}>{ROLE_LABELS[r]}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Benutzer suchen…"
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[13px] focus:border-[var(--color-border)] focus:outline-none transition-colors" />
        </div>

        {/* User list */}
        <div className="space-y-2">
          {filteredUsers.map((u) => {
            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.viewer;
            const client = u.clientId ? clientMap[u.clientId] : null;
            const isCurrentUser = u._id === currentUser?.userId;
            return (
              <div key={u._id}
                className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 flex items-center gap-4 hover:shadow-[var(--shadow-sm)] transition-shadow group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[15px] font-semibold" style={{ background: rc.bg, color: rc.color }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium truncate">{u.name}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: rc.bg, color: rc.color }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">(Du)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[12px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {u.email}
                    </span>
                    {client && (
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        → {client.name}
                      </span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingUser(u)} title="Bearbeiten"
                    className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  </button>
                  <button onClick={() => setResetUser(u)} title="Passwort zurücksetzen"
                    className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
                    <KeyRound className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  </button>
                  {!isCurrentUser && (
                    <button onClick={() => handleDelete(u._id)} title="Löschen"
                      className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-30" />
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              {search ? `Keine Benutzer für „${search}"` : "Noch keine Benutzer"}
            </p>
          </div>
        )}
      </div>

      {showCreate && (
        <UserModal mode="create" onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editingUser && (
        <UserModal mode="edit" user={editingUser} onClose={() => setEditingUser(null)} onSave={handleEdit} />
      )}
      {resetUser && (
        <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />
      )}
    </div>
  );
}
