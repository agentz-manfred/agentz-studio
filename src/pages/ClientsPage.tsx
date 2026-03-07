import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Plus, Users, Building2, Mail, Phone, X, Search, UserPlus, Check } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

function CreateClientModal({ onClose }: { onClose: () => void }) {
  const createClient = useMutation(api.clients.create);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await createClient({
      name,
      company: company || undefined,
      email,
      phone: phone || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[480px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-[17px] font-semibold">Neuen Kunden anlegen</h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="Max Mustermann"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Unternehmen</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="Firma GmbH"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">E-Mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="mail@firma.de"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Telefon</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              placeholder="+49 123 456789"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              Anlegen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateLoginModal({ client, onClose }: { client: any; onClose: () => void }) {
  const register = useMutation(api.auth.register);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[400px] mx-4 p-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(22,163,74,0.1)" }}>
            <Check className="w-6 h-6" style={{ color: "#16a34a" }} />
          </div>
          <h3 className="text-[17px] font-semibold mb-2">Zugang erstellt</h3>
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-1">{client.email}</p>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mb-6">
            Der Kunde kann sich jetzt mit diesen Daten einloggen.
          </p>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[400px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-[17px] font-semibold">Kundenzugang erstellen</h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kunde</label>
            <p className="text-[14px]">{client.name}{client.company ? ` · ${client.company}` : ""}</p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">E-Mail</label>
            <p className="text-[14px] text-[var(--color-text-secondary)]">{client.email}</p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Passwort *</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors font-mono"
              placeholder="Passwort für den Kunden"
              required
              minLength={6}
            />
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">Mindestens 6 Zeichen. Sichtbar, damit Sie es dem Kunden mitteilen können.</p>
          </div>
          {error && <p className="text-[13px] text-[var(--color-error)]">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || password.length < 6}
              className="flex-1 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              Zugang erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientsPage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void }) {
  const clients = useQuery(api.clients.list);
  const users = useQuery(api.auth.listUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [loginClient, setLoginClient] = useState<any>(null);

  // Check which clients have user accounts
  const clientsWithLogin = new Set(
    (users || []).filter((u) => u.clientId).map((u) => u.clientId)
  );

  const filtered = (clients || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Kunden</h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">
              {(clients || []).length} {(clients || []).length === 1 ? "Kunde" : "Kunden"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Kunde</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 lg:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            placeholder="Suchen…"
          />
        </div>
      </div>

      {/* Client list */}
      <div className="px-6 lg:px-8 pb-8 space-y-2">
        {filtered.map((client, i) => {
          const hasLogin = clientsWithLogin.has(client._id);
          return (
            <div
              key={client._id}
              onClick={() => onNavigate?.("client", client._id)}
              className={`animate-in stagger-${Math.min(i + 1, 4)} bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4 hover:shadow-[var(--shadow-sm)] transition-shadow cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0">
                    <Users className="w-[18px] h-[18px] text-[var(--color-text-tertiary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium truncate">{client.name}</p>
                      {hasLogin && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
                          Login aktiv
                        </span>
                      )}
                    </div>
                    {client.company && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                        <p className="text-[13px] text-[var(--color-text-secondary)] truncate">{client.company}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                      <span className="text-[12px] text-[var(--color-text-secondary)]">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                        <span className="text-[12px] text-[var(--color-text-secondary)]">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  {!hasLogin && (
                    <button
                      onClick={() => setLoginClient(client)}
                      className="p-2 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-surface)] transition-colors"
                      title="Kundenzugang erstellen"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-tertiary)] opacity-40" />
            <p className="text-[14px] text-[var(--color-text-tertiary)]">
              {search ? "Keine Kunden gefunden" : "Noch keine Kunden angelegt"}
            </p>
          </div>
        )}
      </div>

      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} />}
      {loginClient && <CreateLoginModal client={loginClient} onClose={() => setLoginClient(null)} />}
    </div>
  );
}
