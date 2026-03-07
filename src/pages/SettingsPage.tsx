import { useAuth } from "../lib/auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "../hooks/useTheme";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Settings, Users, Film, Database, Shield, ExternalLink, Sun, Moon, Monitor, Lock, Check, AlertCircle, BarChart3, Palette, Download, Smartphone, Share, Plus, Sparkles, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function InfoRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="text-[13px] text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-[13px] font-medium ${mono ? "font-mono text-[12px]" : ""}`}>{value}</span>
    </div>
  );
}

function PasswordChangeSection() {
  const changePassword = useMutation(api.auth.changePassword);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("session_token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (newPw !== confirm) {
      setError("Passwörter stimmen nicht überein");
      return;
    }
    if (newPw.length < 6) {
      setError("Mindestens 6 Zeichen");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ token, currentPassword: current, newPassword: newPw });
      setSuccess(true);
      setCurrent("");
      setNewPw("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Fehler");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[var(--color-text-tertiary)] mb-1">Aktuelles Passwort</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-text-tertiary)] mb-1">Neues Passwort</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-text-tertiary)] mb-1">Bestätigen</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-9 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            required
            minLength={6}
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#ef4444" }}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#16a34a" }}>
          <Check className="w-3.5 h-3.5" />
          Passwort geändert
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !current || !newPw || !confirm}
        className="h-8 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors"
      >
        Passwort ändern
      </button>
    </form>
  );
}

function ThemeSection() {
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Hell", icon: Sun },
    { value: "dark", label: "Dunkel", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="px-5 py-4">
      <div className="flex gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${
                active
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PWAInstallSection() {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (isInstalled) return null;

  if (isIOS) {
    return (
      <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
          <Smartphone className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
          <span className="text-[14px] font-semibold">App installieren</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Installiere AgentZ Studio als App auf deinem Home-Bildschirm:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent-surface)] flex items-center justify-center">
                <Share className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium">1. Teilen-Button antippen</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">Das Teilen-Symbol in der Safari-Leiste</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent-surface)] flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium">2. „Zum Home-Bildschirm"</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">Im Menü nach unten scrollen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-accent-surface)] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium">3. „Hinzufügen" bestätigen</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">Die App erscheint auf deinem Home-Bildschirm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canInstall) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  return (
    <div className="animate-in stagger-1 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
        <Download className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        <span className="text-[14px] font-semibold">App installieren</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          Installiere AgentZ Studio als App auf deinem Gerät — schneller Zugriff, Vollbild-Modus, Offline-Support.
        </p>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="h-10 px-5 rounded-[var(--radius-md)] text-white text-[13px] font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}
        >
          <Download className="w-4 h-4" />
          App installieren
        </button>
      </div>
    </div>
  );
}

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
}

function AiModelSection() {
  const { token } = useAuth();
  const currentModel = useQuery(api.settings.get, { key: "ai_model" });
  const setSetting = useMutation(api.settings.set);
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayModel = currentModel || "google/gemini-2.0-flash-001";

  useEffect(() => {
    // Close dropdown on outside click
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchModels = async () => {
    if (models.length > 0) { setOpen(true); return; }
    setLoading(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models");
      const data = await res.json();
      const sorted = (data.data || [])
        .filter((m: any) => m.id && m.name)
        .map((m: any) => ({
          id: m.id,
          name: m.name,
          pricing: {
            prompt: m.pricing?.prompt || "0",
            completion: m.pricing?.completion || "0",
          },
        }))
        .sort((a: OpenRouterModel, b: OpenRouterModel) => a.name.localeCompare(b.name));
      setModels(sorted);
      setOpen(true);
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(
    (m) =>
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectModel = async (modelId: string) => {
    if (!token) return;
    await setSetting({ token, key: "ai_model", value: modelId });
    setOpen(false);
    setSearch("");
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price) * 1_000_000;
    if (num === 0) return "gratis";
    if (num < 0.01) return "<$0.01/M";
    return `$${num.toFixed(2)}/M`;
  };

  return (
    <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
        <Sparkles className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        <span className="text-[14px] font-semibold">KI-Modell</span>
      </div>
      <div className="px-5 py-4" ref={dropdownRef}>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">
          Aktuelles Modell für Skript- und Ideen-Generierung
        </p>
        <button
          onClick={fetchModels}
          disabled={loading}
          className="w-full flex items-center justify-between h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] font-mono hover:border-[var(--color-accent)] transition-colors text-left"
        >
          <span className="truncate">{displayModel}</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-tertiary)]" />
          ) : (
            <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          )}
        </button>

        {open && (
          <div className="mt-2 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-1)] shadow-[var(--shadow-lg)] overflow-hidden">
            <div className="p-2 border-b border-[var(--color-border-subtle)]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Modell suchen…"
                className="w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {filteredModels.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-[var(--color-text-tertiary)]">
                  {search ? "Kein Modell gefunden" : "Modelle werden geladen…"}
                </p>
              ) : (
                filteredModels.slice(0, 100).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectModel(m.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between gap-2 ${
                      m.id === displayModel ? "bg-[var(--color-surface-2)]" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{m.name}</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono truncate">{m.id}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        In: {formatPrice(m.pricing.prompt)}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        Out: {formatPrice(m.pricing.completion)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const AI_PROMPT_KEYS = [
  { key: "ai_prompt_script_system", label: "Skript-Generierung (System-Prompt)", desc: "System-Prompt für alle Skript-Modi (Generieren, Verbessern, Kürzen)" },
  { key: "ai_prompt_ideas", label: "Ideen-Generierung", desc: "Prompt für KI-Ideenvorschläge" },
] as const;

function AiPromptsSection() {
  const { token } = useAuth();
  const setSetting = useMutation(api.settings.set);
  const prompts = AI_PROMPT_KEYS.map(p => ({
    ...p,
    value: useQuery(api.settings.get, { key: p.key }),
  }));
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const startEdit = (key: string, currentValue: string | null) => {
    setEditing(key);
    setDraft(currentValue || "");
  };

  const save = async (key: string) => {
    if (draft.trim()) {
      if (token) await setSetting({ token, key, value: draft.trim() });
    } else {
      // Empty = reset to default (delete)
      if (token) await setSetting({ token, key, value: "" });
    }
    setEditing(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
        <Sparkles className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
        <span className="text-[14px] font-semibold">KI-Prompts</span>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          Globale System-Prompts für die KI-Funktionen. Leer = Standard-Prompt wird verwendet.
        </p>
        {prompts.map(({ key, label, desc, value }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-[13px] font-medium">{label}</span>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{desc}</p>
              </div>
              {editing !== key && (
                <button
                  onClick={() => startEdit(key, value)}
                  className="text-[12px] text-[var(--color-accent)] hover:underline"
                >
                  {value ? "Bearbeiten" : "Anpassen"}
                </button>
              )}
            </div>
            {editing === key ? (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[13px] font-mono resize-y"
                  placeholder="Prompt eingeben… (leer = Standard)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => save(key)}
                    className="h-8 px-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="h-8 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : value ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[12px] font-mono text-[var(--color-text-secondary)] line-clamp-2">
                  {value}
                </div>
                {saved === key && (
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
            ) : (
              <span className="text-[12px] text-[var(--color-text-tertiary)] italic">Standard-Prompt</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user, token } = useAuth();
  const clients = useQuery(api.clients.list);
  const ideas = useQuery(api.ideas.list, {});
  const users = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const videos = useQuery(api.videos.list, {});

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter((i) => !["idee", "veröffentlicht"].includes(i.status)).length;

  return (
    <div className="max-w-[720px] mx-auto pb-12">
      <div className="px-6 lg:px-8 pt-8 pb-6">
        <div className="animate-in">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] title-accent">Einstellungen</h1>
          <p className="text-[13px] text-[var(--color-text-tertiary)] mt-1">Konto, Darstellung & System</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 space-y-5">
        {/* PWA Install */}
        <PWAInstallSection />

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

        {/* Theme */}
        <div className="animate-in stagger-2 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Palette className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Darstellung</span>
          </div>
          <ThemeSection />
        </div>

        {/* Password */}
        <div className="animate-in stagger-3 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Lock className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Passwort ändern</span>
          </div>
          <PasswordChangeSection />
        </div>

        {/* Statistics */}
        <div className="animate-in stagger-4 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <BarChart3 className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">Statistiken</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Kunden" value={(clients || []).length} />
            <InfoRow label="Ideen gesamt" value={(ideas || []).length} />
            <InfoRow label="In Arbeit" value={inProgress} />
            <InfoRow label="Veröffentlicht" value={published} />
            <InfoRow label="Videos" value={(videos || []).length} />
            <InfoRow label="Benutzer-Accounts" value={(users || []).length} />
          </div>
        </div>

        {/* Team */}
        {user?.role === "admin" && (
          <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
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
        )}

        {/* AI Model */}
        {user?.role === "admin" && <AiModelSection />}

        {/* AI Prompts */}
        {user?.role === "admin" && <AiPromptsSection />}

        {/* System */}
        <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
            <Settings className="w-4 h-4 text-[var(--color-text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[14px] font-semibold">System</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Version" value="2.0.0" />
            <InfoRow label="Backend" value="Convex" />
            <InfoRow label="Video CDN" value="Bunny Stream" />
            <InfoRow label="Hosting" value="Vercel" />
          </div>
          {user?.role === "admin" && (
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
          )}
        </div>
      </div>
    </div>
  );
}
