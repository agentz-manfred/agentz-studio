import { useAuth } from "../lib/auth";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "../hooks/useTheme";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Settings, Users, Film, Database, Shield, ExternalLink, Sun, Moon, Monitor, Lock, Check, AlertCircle, BarChart3, Palette, Download, Smartphone, Share, Plus, Sparkles, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function InfoRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b-2 border-[var(--color-border-subtle)] last:border-0">
      <span className="text-[12px] text-[var(--color-text-secondary)] uppercase font-bold" style={{ letterSpacing: '0.06em' }}>{label}</span>
      <span className={`text-[13px] font-medium ${mono ? "font-mono text-[12px]" : ""}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function PasswordChangeSection() {
  const changePassword = useAction(api.authActions.changePassword);
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
        <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Aktuelles Passwort</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full h-9 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-colors"
          required
          style={{ borderRadius: 0 }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Neues Passwort</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full h-9 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-colors"
            required
            minLength={6}
            style={{ borderRadius: 0 }}
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Bestätigen</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-9 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-colors"
            required
            minLength={6}
            style={{ borderRadius: 0 }}
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase border-l-3 pl-2" style={{ color: "#ef4444", borderLeftColor: "#ef4444", letterSpacing: '0.04em' }}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase border-l-3 pl-2" style={{ color: "var(--color-green)", borderLeftColor: "var(--color-green)", letterSpacing: '0.04em' }}>
          <Check className="w-3.5 h-3.5" />
          Passwort geändert
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !current || !newPw || !confirm}
        className="h-8 px-4 bg-[var(--color-green)] text-[#0A0A0A] text-[12px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] disabled:opacity-40 transition-all"
        style={{ borderRadius: 0, letterSpacing: '0.06em' }}
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
      <div className="flex gap-0">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 h-10 text-[12px] font-bold uppercase border-2 transition-all ${
                active
                  ? "bg-[var(--color-green)] text-[#0A0A0A] border-[var(--color-green-dark)]"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
              }`}
              style={{ borderRadius: 0, letterSpacing: '0.06em', marginLeft: i > 0 ? '-2px' : 0 }}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
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
      <div className="animate-in stagger-1 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
          <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
            <Smartphone className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>App installieren</span>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Installiere AgentZ Studio als App auf deinem Home-Bildschirm:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)]" style={{ borderRadius: 0 }}>
                <Share className="w-3.5 h-3.5 text-[var(--color-green)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium">1. Teilen-Button antippen</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">Das Teilen-Symbol in der Safari-Leiste</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)]" style={{ borderRadius: 0 }}>
                <Plus className="w-3.5 h-3.5 text-[var(--color-green)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium">2. „Zum Home-Bildschirm"</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">Im Menü nach unten scrollen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)]" style={{ borderRadius: 0 }}>
                <Check className="w-3.5 h-3.5 text-[var(--color-green)]" />
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
    <div className="animate-in stagger-1 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
        <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
          <Download className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
        </div>
        <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>App installieren</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          Installiere AgentZ Studio als App auf deinem Gerät — schneller Zugriff, Vollbild-Modus, Offline-Support.
        </p>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="h-10 px-5 bg-[var(--color-green)] text-[#0A0A0A] text-[12px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] disabled:opacity-50 transition-all flex items-center gap-2"
          style={{ borderRadius: 0, letterSpacing: '0.06em' }}
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
    <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
        <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
        </div>
        <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>KI-Modell</span>
      </div>
      <div className="px-5 py-4" ref={dropdownRef}>
        <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold mb-2" style={{ letterSpacing: '0.06em' }}>
          Aktuelles Modell für Skript- und Ideen-Generierung
        </p>
        <button
          onClick={fetchModels}
          disabled={loading}
          className="w-full flex items-center justify-between h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] font-mono hover:border-[var(--color-green)] transition-colors text-left"
          style={{ borderRadius: 0 }}
        >
          <span className="truncate">{displayModel}</span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-tertiary)]" />
          ) : (
            <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          )}
        </button>

        {open && (
          <div className="mt-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] shadow-[var(--shadow-brutal)] overflow-hidden" style={{ borderRadius: 0 }}>
            <div className="p-2 border-b-2 border-[var(--color-border-strong)]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Modell suchen…"
                className="w-full h-8 px-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] font-mono focus:border-[var(--color-green)] focus:outline-none"
                autoFocus
                style={{ borderRadius: 0 }}
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
    <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
        <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
        </div>
        <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>KI-Prompts</span>
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
                  className="w-full px-3 py-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] font-mono resize-y focus:border-[var(--color-green)] focus:outline-none"
                  style={{ borderRadius: 0 }}
                  placeholder="Prompt eingeben… (leer = Standard)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => save(key)}
                    className="h-8 px-3 bg-[var(--color-green)] text-[#0A0A0A] text-[12px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] transition-all"
                    style={{ borderRadius: 0, letterSpacing: '0.06em' }}
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="h-8 px-3 border-2 border-[var(--color-border-strong)] text-[12px] font-bold uppercase hover:bg-[var(--color-surface-2)] transition-colors"
                    style={{ borderRadius: 0, letterSpacing: '0.06em' }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : value ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-[var(--color-surface-2)] border-2 border-[var(--color-border-subtle)] text-[12px] font-mono text-[var(--color-text-secondary)] line-clamp-2" style={{ borderRadius: 0 }}>
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
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const users = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const videos = useQuery(api.videos.list, token ? { token } : "skip");

  const published = (ideas || []).filter((i) => i.status === "veröffentlicht").length;
  const inProgress = (ideas || []).filter((i) => !["idee", "veröffentlicht"].includes(i.status)).length;

  return (
    <div className="max-w-[720px] mx-auto pb-12">
      <div className="px-6 lg:px-8 pt-8 pb-6 border-b-2 border-[var(--color-border-strong)]">
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase" style={{ letterSpacing: '0.12em' }}>Konfiguration</span>
          </div>
          <h1 className="text-[24px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>Einstellungen</h1>
        </div>
      </div>

      <div className="px-6 lg:px-8 pt-6 space-y-5">
        {/* PWA Install */}
        <PWAInstallSection />

        {/* Account */}
        <div className="animate-in stagger-1 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
            <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
              <Shield className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>Account</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Name" value={user?.name || "–"} />
            <InfoRow label="E-Mail" value={user?.email || "–"} />
            <InfoRow label="Rolle" value={user?.role === "admin" ? "Administrator" : "Kunde"} />
          </div>
        </div>

        {/* Theme */}
        <div className="animate-in stagger-2 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
            <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
              <Palette className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>Darstellung</span>
          </div>
          <ThemeSection />
        </div>

        {/* Password */}
        <div className="animate-in stagger-3 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
            <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
              <Lock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>Passwort ändern</span>
          </div>
          <PasswordChangeSection />
        </div>

        {/* Statistics */}
        <div className="animate-in stagger-4 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
            <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
              <BarChart3 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>Statistiken</span>
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
          <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
              <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
                <Users className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>Team & Zugänge</span>
            </div>
            <div className="px-5 py-2">
              {(users || []).map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2.5 border-b-2 border-[var(--color-border-subtle)] last:border-0">
                  <div>
                    <p className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.02em' }}>{u.name}</p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                    u.role === "admin"
                      ? "bg-[var(--color-green)] text-[#0A0A0A] border-[var(--color-green-dark)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)]"
                  }`} style={{ borderRadius: 0, letterSpacing: '0.06em' }}>
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
        <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden" style={{ borderRadius: 0 }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
            <div className="w-7 h-7 flex items-center justify-center border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
              <Settings className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.06em' }}>System</span>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Version" value={__APP_VERSION__} />
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
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-[var(--color-text-tertiary)] hover:text-[var(--color-green)] transition-colors"
                style={{ letterSpacing: '0.06em' }}
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
