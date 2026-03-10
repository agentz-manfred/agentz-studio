import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Plus, Users, Building2, Mail, Phone, X, Search, UserPlus, Check, Link2, Copy, CheckCheck, Lightbulb, Film } from "lucide-react";
import { ClientsSkeleton } from "../components/ui/Skeleton";
import type { Id } from "../../convex/_generated/dataModel";

function CreateClientModal({ onClose }: { onClose: () => void }) {
  const { token } = useAuth();
  const createClient = useMutation(api.clients.create);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    await createClient({
      token,
      name,
      company: company || undefined,
      email,
      phone: phone || undefined,
    });
    onClose();
  };

  const labelClass = "block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em] mb-1.5";
  const inputClass = "w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[14px] font-[var(--font-body)] text-[var(--color-text-primary)] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[480px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--color-border-strong)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-5 bg-[var(--color-green)]" />
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em]">Neuen Kunden anlegen</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[var(--color-border-strong)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Max Mustermann" required />
          </div>
          <div>
            <label className={labelClass}>Unternehmen</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="Firma GmbH" />
          </div>
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="mail@firma.de" required />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+49 123 456789" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-brutal-outline flex-1 h-10 !py-0 text-[13px]">
              Abbrechen
            </button>
            <button type="submit" disabled={submitting} className="btn-brutal flex-1 h-10 !py-0 text-[13px] disabled:opacity-50">
              Anlegen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateLoginModal({ client, onClose }: { client: any; onClose: () => void }) {
  const register = useAction(api.authActions.register);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const sessionToken = localStorage.getItem("session_token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register({
        email: client.email,
        password,
        name: client.name,
        role: "client",
        clientId: client._id as Id<"clients">,
        adminToken: sessionToken,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
        <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-green)] shadow-[var(--shadow-brutal)] w-full max-w-[400px] mx-4 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)]">
            <Check className="w-6 h-6 text-[var(--color-green)]" strokeWidth={2.5} />
          </div>
          <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] mb-2">Zugang erstellt</h3>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-1 font-mono">{client.email}</p>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-6">
            Der Kunde kann sich jetzt mit diesen Daten einloggen.
          </p>
          <button onClick={onClose} className="btn-brutal w-full h-10 !py-0 text-[13px]">
            Schliessen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[400px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--color-border-strong)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-5 bg-[var(--color-green)]" />
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em]">Kundenzugang erstellen</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[var(--color-border-strong)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em] mb-1">Kunde</label>
            <p className="text-[14px] font-semibold">{client.name}{client.company ? ` · ${client.company}` : ""}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em] mb-1">E-Mail</label>
            <p className="text-[14px] text-[var(--color-text-secondary)] font-mono">{client.email}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em] mb-1.5">Passwort *</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[14px] font-mono focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all"
              placeholder="Passwort für den Kunden"
              required
              minLength={6}
            />
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-[0.04em]">Mindestens 6 Zeichen.</p>
          </div>
          {error && (
            <div className="px-3 py-2 border-l-3 border-[var(--color-error)] bg-[rgba(255,51,51,0.08)] text-[13px] text-[var(--color-error)]">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-brutal-outline flex-1 h-10 !py-0 text-[13px]">
              Abbrechen
            </button>
            <button type="submit" disabled={submitting || password.length < 6} className="btn-brutal flex-1 h-10 !py-0 text-[13px] disabled:opacity-50">
              Zugang erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteLinkModal({ client, onClose }: { client: any; onClose: () => void }) {
  const createInvite = useMutation(api.invites.create);
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const sessionToken = localStorage.getItem("session_token") || "";

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await createInvite({
        clientId: client._id as Id<"clients">,
        adminToken: sessionToken,
        expiresInDays: 7,
      });
      const url = `${window.location.origin}${window.location.pathname}#/invite/${result.token}`;
      setInviteUrl(url);
    } catch (err: any) {
      setError(err.message || "Fehler beim Erstellen");
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--color-border-strong)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-5 bg-[var(--color-green)]" />
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em]">Einladungslink</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[var(--color-border-strong)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <div className="p-6">
          {/* Client info */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b-2 border-[var(--color-border-strong)]">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-white text-[13px] font-bold"
              style={{ background: client.avatarColor || '#00DC82', border: `2px solid ${client.avatarColor || '#00DC82'}` }}
            >
              {initials}
            </div>
            <div>
              <p className="text-[14px] font-semibold">{client.name}</p>
              {client.company && <p className="text-[12px] text-[var(--color-text-secondary)]">{client.company}</p>}
              <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{client.email}</p>
            </div>
          </div>

          {!inviteUrl ? (
            <>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
                Erstelle einen Einladungslink, den du dem Kunden per E-Mail oder WhatsApp senden kannst.
                Der Kunde kann damit selbst ein Passwort setzen und sich anmelden.
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mb-5 uppercase tracking-[0.04em]">
                7 Tage gültig · Einmalig verwendbar
              </p>
              {error && (
                <div className="px-3 py-2 border-l-3 border-[var(--color-error)] bg-[rgba(255,51,51,0.08)] text-[13px] text-[var(--color-error)] mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-brutal-outline flex-1 h-10 !py-0 text-[13px]">
                  Abbrechen
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="btn-brutal flex-1 h-10 !py-0 text-[13px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Link erstellen
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
                Einladungslink erstellt! Kopieren und an den Kunden senden:
              </p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[11px] font-mono flex items-center overflow-hidden">
                  <span className="truncate text-[var(--color-text-secondary)]">{inviteUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-2)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors flex items-center gap-1.5"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-[var(--color-green)]" /> : <Copy className="w-4 h-4 text-[var(--color-text-tertiary)]" />}
                  <span className="text-[12px] uppercase tracking-[0.04em] font-semibold">{copied ? "Kopiert" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-5 font-mono tabular-nums">
                Gültig bis {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("de-DE")} · Einmalig verwendbar
              </p>
              <button onClick={onClose} className="btn-brutal w-full h-10 !py-0 text-[13px]">
                Fertig
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClientsPage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void }) {
  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const users = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const videos = useQuery(api.videos.list, token ? { token } : "skip");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [loginClient, setLoginClient] = useState<any>(null);
  const [inviteClient, setInviteClient] = useState<any>(null);

  // Check which clients have user accounts
  const clientsWithLogin = new Set(
    (users || []).filter((u) => u.clientId).map((u) => u.clientId)
  );

  // Stats per client
  const ideaCountByClient = (ideas || []).reduce((acc, i) => {
    acc[i.clientId] = (acc[i.clientId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const videoCountByClient = (videos || []).reduce((acc, v) => {
    if (v.clientId) acc[v.clientId] = (acc[v.clientId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = (clients || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  if (clients === undefined) return <ClientsSkeleton />;

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[var(--color-border-strong)]">
        <div className="flex items-center justify-between">
          <div>
            {/* Green accent bar */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-3 h-5 bg-[var(--color-green)]" />
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.12em]">Kundenverwaltung</span>
            </div>
            <h1 className="text-[24px] font-bold tracking-[-0.02em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              Kunden
            </h1>
            <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1 font-mono tabular-nums">
              {(clients || []).length} {(clients || []).length === 1 ? "Kunde" : "Kunden"} gesamt
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-brutal flex items-center gap-2 h-10 !py-0 text-[13px]"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Neuer Kunde</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 lg:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] text-[14px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all font-mono"
            placeholder="Suchen…"
          />
        </div>
      </div>

      {/* Client cards grid */}
      <div className="px-6 lg:px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-0">
        {filtered.map((client, i) => {
          const hasLogin = clientsWithLogin.has(client._id);
          const initials = client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          const ideaCount = ideaCountByClient[client._id] || 0;
          const videoCount = videoCountByClient[client._id] || 0;
          return (
            <div
              key={client._id}
              onClick={() => onNavigate?.("client", client._id)}
              className={`animate-in stagger-${Math.min(i + 1, 4)} bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-5 cursor-pointer group transition-all duration-150`}
              style={{
                marginTop: i >= 2 ? "-2px" : "0",
                marginLeft: i % 2 === 1 ? "-2px" : "0",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translate(-2px, -2px)";
                el.style.boxShadow = "4px 4px 0px #00DC82";
                el.style.borderColor = "rgba(0, 220, 130, 0.3)";
                el.style.zIndex = "10";
                el.style.position = "relative";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "";
                el.style.boxShadow = "";
                el.style.borderColor = "";
                el.style.zIndex = "";
                el.style.position = "";
              }}
            >
              {/* Top: Avatar + Name + Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 flex items-center justify-center flex-shrink-0 text-white text-[13px] font-bold"
                    style={{
                      background: client.avatarColor || '#00DC82',
                      border: `2px solid ${client.avatarColor || '#00DC82'}`,
                      boxShadow: "2px 2px 0px var(--color-surface-0)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold truncate group-hover:text-[var(--color-green)] transition-colors uppercase tracking-[0.02em]">{client.name}</p>
                    {client.company && (
                      <p className="text-[12px] text-[var(--color-text-secondary)] truncate flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 flex-shrink-0 text-[var(--color-text-muted)]" strokeWidth={2} />
                        {client.company}
                      </p>
                    )}
                  </div>
                </div>
                {hasLogin ? (
                  <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] bg-[var(--color-green-subtle)] text-[var(--color-green)] border border-[var(--color-border-green)]">
                    Aktiv
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setInviteClient(client); }}
                      className="w-7 h-7 flex items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:border-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-colors"
                      title="Einladungslink"
                    >
                      <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setLoginClient(client); }}
                      className="w-7 h-7 flex items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] hover:border-[var(--color-green)] hover:bg-[var(--color-green-subtle)] transition-colors"
                      title="Login erstellen"
                    >
                      <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={2} />
                  <span className="text-[14px] font-bold tabular-nums font-mono">{ideaCount}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.04em]">Ideen</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={2} />
                  <span className="text-[14px] font-bold tabular-nums font-mono">{videoCount}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.04em]">Videos</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-3 border-t-2 border-[var(--color-border-strong)] flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[var(--color-text-muted)]" strokeWidth={2} />
                  <span className="text-[11px] text-[var(--color-text-secondary)] truncate font-mono">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[var(--color-text-muted)]" strokeWidth={2} />
                    <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">{client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 border-2 border-dashed border-[var(--color-border-strong)] p-16 text-center relative">
            {/* Corner marks */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-green)]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-green)]" />
            <div className="w-12 h-12 mx-auto mb-3 border-2 border-[var(--color-border-strong)] flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em]">
              {search ? "Keine Kunden gefunden" : "Noch keine Kunden angelegt"}
            </p>
          </div>
        )}
      </div>

      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} />}
      {loginClient && <CreateLoginModal client={loginClient} onClose={() => setLoginClient(null)} />}
      {inviteClient && <InviteLinkModal client={inviteClient} onClose={() => setInviteClient(null)} />}
    </div>
  );
}
