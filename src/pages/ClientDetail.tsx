import { useQuery, useMutation } from "convex/react";
import { useAuth } from "../lib/auth";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useCallback } from "react";
import { AiSuggestModal } from "./IdeasPage";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Lightbulb,
  Video,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
  Sparkles,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  FileText,
  Tag,
  Globe,
  CalendarDays,
  Hash,
  Activity,
  MessageSquare,
  Upload,
  ArrowRight,
  Filter,
} from "lucide-react";
import { RichTextEditor, RichTextDisplay } from "../components/ui/RichTextEditor";
import { openMonthlyReport } from "../lib/export";
import { STATUS_LABELS } from "../lib/utils";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  idee: { bg: "rgba(107,114,128,0.1)", text: "#6b7280", border: "rgba(107,114,128,0.3)" },
  skript: { bg: "rgba(139,92,246,0.1)", text: "#8b5cf6", border: "rgba(139,92,246,0.3)" },
  freigabe: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  korrektur: { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  freigegeben: { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.3)" },
  gedreht: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.3)" },
  geschnitten: { bg: "rgba(99,102,241,0.1)", text: "#6366f1", border: "rgba(99,102,241,0.3)" },
  review: { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
  "veröffentlicht": { bg: "rgba(0,220,130,0.1)", text: "#00DC82", border: "rgba(0,220,130,0.3)" },
};

const PLATFORM_OPTIONS = [
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "facebook", label: "Facebook", icon: "📘" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "twitter", label: "X / Twitter", icon: "𝕏" },
];

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─── Section Header ─── */
function SectionHeader({ title, icon: Icon, action, onAction }: { title: string; icon: any; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] flex items-center gap-2">
        <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
        <Icon className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={2} />
        {title}
      </h2>
      {action && onAction && (
        <button onClick={onAction} className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors flex items-center gap-1">
          {action} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Profile Edit Section ─── */
function ProfileEditor({
  client,
  onClose,
}: {
  client: any;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const updateClient = useMutation(api.clients.update);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: client.name || "",
    company: client.company || "",
    email: client.email || "",
    phone: client.phone || "",
    contractStart: client.contractStart || "",
    contractEnd: client.contractEnd || "",
    platforms: client.platforms || [],
    mainPlatform: client.mainPlatform || "",
    videosPerWeek: client.videosPerWeek ?? "",
    context: client.context || "",
    avatarColor: client.avatarColor || "#00DC82",
  });

  const togglePlatform = (id: string) => {
    setForm((f) => {
      const has = f.platforms.includes(id);
      const platforms = has
        ? f.platforms.filter((p: string) => p !== id)
        : [...f.platforms, id];
      const mainPlatform =
        !has && platforms.length === 1
          ? id
          : has && f.mainPlatform === id
            ? platforms[0] || ""
            : f.mainPlatform;
      return { ...f, platforms, mainPlatform };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!token) return;
      await updateClient({
        token,
        id: client._id as Id<"clients">,
        name: form.name,
        company: form.company || undefined,
        email: form.email,
        phone: form.phone || undefined,
        contractStart: form.contractStart || undefined,
        contractEnd: form.contractEnd || undefined,
        platforms: form.platforms.length ? form.platforms : undefined,
        mainPlatform: form.mainPlatform || undefined,
        videosPerWeek: form.videosPerWeek
          ? Number(form.videosPerWeek)
          : undefined,
        context: form.context || undefined,
        avatarColor: form.avatarColor || undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const inputClass = "w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none transition-all";
  const labelClass = "block text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.08em] mb-1.5";

  return (
    <div className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[var(--color-border-strong)]">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] flex items-center gap-2">
          <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
          <Pencil className="w-4 h-4 text-[var(--color-green)]" strokeWidth={2} />
          Profil bearbeiten
        </h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-[var(--color-border-strong)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors">
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unternehmen</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-Mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
        </div>

        {/* Avatar Color */}
        <div>
          <label className={labelClass}>Avatar-Farbe</label>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {["#00DC82", "#7C3AED", "#2563EB", "#0891B2", "#059669", "#D97706", "#DC2626", "#DB2777", "#4338CA", "#0D9488", "#CA8A04", "#9333EA"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, avatarColor: c })}
                  className="w-7 h-7 border-2 transition-all"
                  style={{
                    background: c,
                    borderColor: form.avatarColor === c ? "var(--color-text-primary)" : "transparent",
                    transform: form.avatarColor === c ? "translate(-1px, -1px)" : "",
                    boxShadow: form.avatarColor === c ? "2px 2px 0px var(--color-surface-4)" : "",
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={form.avatarColor}
              onChange={(e) => setForm({ ...form, avatarColor: e.target.value })}
              className="w-7 h-7 cursor-pointer border-2 border-[var(--color-border-strong)] p-0"
              title="Eigene Farbe wählen"
            />
          </div>
        </div>

        {/* Contract */}
        <div>
          <label className={labelClass}>
            <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
            Vertragslaufzeit
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.06em]">Beginn</span>
              <input type="date" value={form.contractStart} onChange={(e) => setForm({ ...form, contractStart: e.target.value })} className={inputClass} />
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.06em]">Ende</span>
              <input type="date" value={form.contractEnd} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label className={labelClass}>
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Plattformen
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((p) => {
              const active = form.platforms.includes(p.id);
              const isMain = form.mainPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  onDoubleClick={() => setForm((f) => ({ ...f, mainPlatform: p.id }))}
                  className="px-3 py-1.5 text-[12px] font-semibold border-2 transition-all uppercase tracking-[0.04em]"
                  style={{
                    borderColor: active ? "var(--color-green)" : "var(--color-border-strong)",
                    background: active ? "var(--color-green-subtle)" : "transparent",
                    color: active ? "var(--color-green)" : "var(--color-text-tertiary)",
                    transform: active ? "translate(-1px, -1px)" : "",
                    boxShadow: active ? "2px 2px 0px var(--color-surface-4)" : "",
                  }}
                  title={active ? "Doppelklick = Hauptplattform" : "Klick zum Hinzufügen"}
                >
                  {p.icon} {p.label}
                  {isMain && <span className="ml-1 text-[10px] font-bold">★</span>}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 uppercase tracking-[0.04em]">
            Klick = Auswählen · Doppelklick = Hauptplattform (★)
          </p>
        </div>

        {/* Videos per week */}
        <div>
          <label className={labelClass}>
            <Hash className="w-3.5 h-3.5 inline mr-1" />
            Videos pro Woche
          </label>
          <input
            type="number"
            min="1"
            value={form.videosPerWeek}
            onChange={(e) => setForm({ ...form, videosPerWeek: e.target.value })}
            placeholder="z.B. 7"
            className={inputClass + " max-w-[160px]"}
          />
          {form.videosPerWeek && Number(form.videosPerWeek) > 0 && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono tabular-nums">
              ≈ {Math.round(Number(form.videosPerWeek) * 4.33)} Videos/Monat
            </p>
          )}
        </div>

        {/* Context / WYSIWYG */}
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Kundenkontext (KI-Generierung)
          </label>
          <RichTextEditor
            content={form.context}
            onChange={(html) => setForm({ ...form, context: html })}
            placeholder="Tonalität, Do's & Don'ts, Zielgruppe, Besonderheiten…"
          />
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-brutal-outline h-9 !py-0 text-[12px]">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.email}
            className="btn-brutal h-9 !py-0 text-[12px] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Category Manager ─── */
function CategoryManager({ clientId }: { clientId: string }) {
  const { token } = useAuth();
  const categories = useQuery(api.categories.listByClient, token ? {
    clientId: clientId as Id<"clients">, token,
  } : "skip");
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    if (!token) return;
    await createCategory({
      token,
      clientId: clientId as Id<"clients">,
      name: newName.trim(),
      color: newColor,
    });
    setNewName("");
    setAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    if (!token) return;
    await updateCategory({
      token,
      id: id as Id<"categories">,
      name: editName.trim(),
      color: editColor,
    });
    setEditId(null);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Kategorie löschen?")) return;
    if (token) await removeCategory({ token, id: id as Id<"categories"> });
  };

  const sorted = [...(categories || [])].sort((a, b) => a.order - b.order);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] flex items-center gap-2">
          <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
          <Tag className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={2} />
          Kategorien
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Neue Kategorie
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sorted.map((cat) => {
          if (editId === cat._id) {
            return (
              <div key={cat._id} className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] pl-1 pr-2 py-0.5">
                <div className="flex gap-0.5 ml-1">
                  {CATEGORY_COLORS.slice(0, 7).map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-4 h-4 border-2 transition-all"
                      style={{ background: c, borderColor: editColor === c ? "var(--color-text-primary)" : "transparent" }}
                    />
                  ))}
                </div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-20 h-6 px-1.5 text-[12px] bg-transparent border-b-2 border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-green)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(cat._id);
                    if (e.key === "Escape") setEditId(null);
                  }}
                />
                <button onClick={() => handleUpdate(cat._id)} className="p-0.5 text-[var(--color-green)]">
                  <Save className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={cat._id}
              className="group flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold cursor-default transition-all uppercase tracking-[0.04em]"
              style={{
                background: cat.color + "18",
                color: cat.color,
                border: `2px solid ${cat.color}30`,
              }}
              onClick={() => {
                setEditId(cat._id);
                setEditName(cat.name);
                setEditColor(cat.color);
              }}
            >
              <span className="w-2.5 h-2.5 flex-shrink-0" style={{ background: cat.color }} />
              {cat.name}
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(cat._id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[var(--color-error)] transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Add inline */}
        {adding && (
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] pl-1 pr-2 py-0.5">
            <div className="flex gap-0.5 ml-1">
              {CATEGORY_COLORS.slice(0, 7).map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-4 h-4 border-2 transition-all"
                  style={{ background: c, borderColor: newColor === c ? "var(--color-text-primary)" : "transparent" }}
                />
              ))}
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name…"
              className="w-20 h-6 px-1.5 text-[12px] bg-transparent border-b-2 border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-green)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <button onClick={handleAdd} disabled={!newName.trim()} className="p-0.5 text-[var(--color-green)] disabled:opacity-30">
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={() => setAdding(false)} className="p-0.5 text-[var(--color-text-tertiary)]">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {sorted.length === 0 && !adding && (
          <p className="text-[12px] text-[var(--color-text-muted)] italic">
            Keine Kategorien — erstelle z.B. "Real Talk", "Comedy", "Sketch"
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── Profile Info Display ─── */
function ProfileInfo({ client }: { client: any }) {
  if (
    !client.contractStart &&
    !client.platforms?.length &&
    !client.videosPerWeek &&
    !client.context
  ) {
    return null;
  }

  return (
    <section className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
        {/* Contract */}
        {(client.contractStart || client.contractEnd) && (
          <div>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.08em] font-bold">
              Vertrag
            </span>
            <p className="mt-1 font-semibold font-mono tabular-nums">
              {client.contractStart
                ? new Date(client.contractStart).toLocaleDateString("de-DE")
                : "—"}{" "}
              →{" "}
              {client.contractEnd
                ? new Date(client.contractEnd).toLocaleDateString("de-DE")
                : "offen"}
            </p>
          </div>
        )}

        {/* Platforms */}
        {client.platforms?.length > 0 && (
          <div>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.08em] font-bold">
              Plattformen
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {client.platforms.map((p: string) => {
                const opt = PLATFORM_OPTIONS.find((o) => o.id === p);
                const isMain = client.mainPlatform === p;
                return (
                  <span
                    key={p}
                    className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]"
                    style={{
                      background: isMain ? "var(--color-green-subtle)" : "rgba(107,114,128,0.08)",
                      color: isMain ? "var(--color-green)" : "var(--color-text-secondary)",
                      border: `1px solid ${isMain ? "var(--color-border-green)" : "var(--color-border)"}`,
                    }}
                  >
                    {opt?.icon} {opt?.label || p}
                    {isMain && " ★"}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos/week */}
        {client.videosPerWeek && (
          <div>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.08em] font-bold">
              Videos / Woche
            </span>
            <p className="mt-1 font-bold text-[20px]" style={{ fontFamily: "var(--font-display)" }}>
              {client.videosPerWeek}
              <span className="text-[11px] font-normal text-[var(--color-text-muted)] ml-1.5 font-mono">
                ≈ {Math.round(client.videosPerWeek * 4.33)}/mo
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Context */}
      {client.context && (
        <div className="mt-4 pt-4 border-t-2 border-[var(--color-border-strong)]">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.08em] font-bold flex items-center gap-1">
            <FileText className="w-3 h-3" strokeWidth={2} />
            Kundenkontext
          </span>
          <div className="mt-2 max-h-[200px] overflow-y-auto">
            <RichTextDisplay content={client.context} className="text-[13px] text-[var(--color-text-secondary)]" />
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Activity Timeline ─── */
function ActivityTimeline({
  clientId,
  onNavigate,
}: {
  clientId: string;
  onNavigate: (page: string, id?: string) => void;
}) {
  const { token } = useAuth();
  const activity = useQuery(api.activity.listByClient, {
    clientId: clientId as Id<"clients">,
    token: token || undefined,
    limit: 30,
  });
  const [filter, setFilter] = useState<"all" | "status" | "comment" | "upload">("all");

  const filtered = (activity || []).filter(
    (a) => filter === "all" || a.type === filter
  );

  const filterButtons: { key: typeof filter; label: string; icon: any }[] = [
    { key: "all", label: "Alle", icon: Activity },
    { key: "status", label: "Status", icon: ArrowRight },
    { key: "comment", label: "Kommentare", icon: MessageSquare },
    { key: "upload", label: "Uploads", icon: Upload },
  ];

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / 3600000;
    if (diffH < 1) return `vor ${Math.max(1, Math.round(diffMs / 60000))} Min.`;
    if (diffH < 24) return `vor ${Math.round(diffH)} Std.`;
    if (diffH < 48) return "Gestern";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] flex items-center gap-2">
          <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
          <Activity className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={2} />
          Aktivität
        </h2>
        <div className="flex items-center gap-1">
          {filterButtons.map((fb) => (
            <button
              key={fb.key}
              onClick={() => setFilter(fb.key)}
              className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] transition-all border"
              style={{
                borderColor: filter === fb.key ? "var(--color-green)" : "var(--color-border)",
                background: filter === fb.key ? "var(--color-green-subtle)" : "transparent",
                color: filter === fb.key ? "var(--color-green)" : "var(--color-text-muted)",
              }}
            >
              {fb.label}
            </button>
          ))}
        </div>
      </div>

      {!activity ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-4 h-4 border-2 border-[var(--color-green)] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--color-surface-1)] border-2 border-dashed border-[var(--color-border-strong)] p-8 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-[0.04em]">
            Noch keine Aktivitäten
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-[var(--color-border-strong)]" />

          <div className="space-y-0">
            {filtered.map((item, i) => {
              let icon: any;
              let color: string;
              let title: string;
              let detail: string | null = null;
              let clickTarget: { page: string; id?: string } | null = null;

              if (item.type === "status") {
                icon = ArrowRight;
                color = "#3b82f6";
                const fromLabel = STATUS_LABELS[item.fromStatus] || item.fromStatus;
                const toLabel = STATUS_LABELS[item.toStatus] || item.toStatus;
                title = `${fromLabel} → ${toLabel}`;
                detail = item.ideaTitle;
                clickTarget = { page: "idea", id: item.ideaId };
              } else if (item.type === "comment") {
                icon = MessageSquare;
                color = "#8b5cf6";
                title = `Kommentar zu ${item.targetTitle}`;
                detail = item.content.length > 80 ? item.content.slice(0, 80) + "…" : item.content;
                clickTarget = item.targetType === "idea"
                  ? { page: "idea", id: item.targetId }
                  : { page: "video", id: item.targetId };
              } else {
                icon = Upload;
                color = "#00DC82";
                title = `Video hochgeladen`;
                detail = item.title;
              }

              const Icon = icon;

              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => clickTarget && onNavigate(clickTarget.page, clickTarget.id)}
                  disabled={!clickTarget}
                  className="w-full flex items-start gap-3 pl-0 pr-4 py-2.5 text-left hover:bg-[var(--color-green-subtle)] transition-colors group relative"
                  style={{ marginTop: i > 0 ? "-2px" : "0" }}
                >
                  {/* Icon dot */}
                  <div
                    className="w-[30px] h-[30px] flex items-center justify-center flex-shrink-0 relative z-10 border"
                    style={{ background: color + "15", borderColor: color + "30" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold truncate group-hover:text-[var(--color-green)] transition-colors">{title}</span>
                      <span className="text-[11px] text-[var(--color-text-muted)] font-mono tabular-nums flex-shrink-0">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    {detail && (
                      <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{detail}</p>
                    )}
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 uppercase tracking-[0.06em]">{item.userName}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Main ClientDetail ─── */
export function ClientDetail({
  clientId,
  onBack,
  onNavigate,
}: {
  clientId: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}) {
  const { user, token } = useAuth();
  const client = useQuery(api.clients.get, {
    id: clientId as Id<"clients">,
    token: token || undefined,
  });
  const ideas = useQuery(api.ideas.list, {
    clientId: clientId as Id<"clients">,
    token: token || undefined,
  });
  const shoots = useQuery(api.shootDates.list, {
    clientId: clientId as Id<"clients">,
    token: token || undefined,
  });
  const users = useQuery(api.auth.listUsers, token ? { token } : "skip");
  const categories = useQuery(api.categories.listByClient, token ? {
    clientId: clientId as Id<"clients">, token,
  } : "skip");

  const [editing, setEditing] = useState(false);
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const createIdea = useMutation(api.ideas.create);

  const hasLogin = (users || []).some((u) => u.clientId === clientId);

  // Category lookup
  const categoryMap = Object.fromEntries(
    (categories || []).map((c) => [c._id, c])
  );

  if (client === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[var(--color-green)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-[var(--color-border-strong)]">
        <p className="text-[var(--color-text-muted)] uppercase tracking-[0.04em]">Kunde nicht gefunden</p>
        <button onClick={onBack} className="mt-4 text-[var(--color-green)] text-[13px] uppercase tracking-[0.04em] font-semibold hover:underline">
          Zurück
        </button>
      </div>
    );
  }

  const totalIdeas = (ideas || []).length;
  const inProgress = (ideas || []).filter(
    (i) => !["idea", "published"].includes(i.status)
  ).length;
  const published = (ideas || []).filter(
    (i) => i.status === "published"
  ).length;

  const upcomingShoots = (shoots || [])
    .filter((s) => new Date(s.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const initials = client.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[var(--color-border-strong)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-green)] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Kunden
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center text-white text-[18px] font-bold"
              style={{
                background: client.avatarColor || '#00DC82',
                border: `2px solid ${client.avatarColor || '#00DC82'}`,
                boxShadow: "3px 3px 0px var(--color-surface-0)",
                letterSpacing: "0.05em",
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-[24px] font-bold tracking-[-0.02em] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {client.company && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)]">
                    <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                    {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)] font-mono">
                  <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)] font-mono">
                    <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                    {client.phone}
                  </span>
                )}
              </div>
              {/* Green accent bar */}
              <div className="w-12 h-[3px] bg-[var(--color-green)] mt-3" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!ideas) return;
                const now = new Date();
                const monthLabel = now.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
                const byStatus: Record<string, number> = {};
                for (const i of ideas) {
                  byStatus[i.status] = (byStatus[i.status] || 0) + 1;
                }
                openMonthlyReport({
                  clientName: client.name,
                  month: monthLabel,
                  totalIdeas: ideas.length,
                  byStatus,
                  published: ideas
                    .filter((i) => i.status === "veröffentlicht")
                    .map((i) => ({
                      title: i.title,
                      date: new Date(i.updatedAt).toLocaleDateString("de-DE"),
                    })),
                  inProgress: ideas
                    .filter((i) => !["idee", "veröffentlicht"].includes(i.status))
                    .map((i) => ({ title: i.title, status: i.status })),
                });
              }}
              className="h-8 px-3 border-2 border-[var(--color-border-strong)] text-[11px] font-semibold uppercase tracking-[0.04em] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors flex items-center gap-1.5"
              title="Monatsbericht"
            >
              <FileText className="w-3 h-3" strokeWidth={2} />
              Bericht
            </button>
            <button
              onClick={() => setShowAiSuggest(true)}
              className="h-8 px-3 border-2 border-[var(--color-green)] bg-[var(--color-green-subtle)] text-[var(--color-green)] text-[11px] font-semibold uppercase tracking-[0.04em] hover:bg-[var(--color-green-muted)] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              KI-Ideen
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="h-8 px-3 border-2 border-[var(--color-border-strong)] text-[11px] font-semibold uppercase tracking-[0.04em] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors flex items-center gap-1.5"
            >
              <Pencil className="w-3 h-3" strokeWidth={2} />
              Edit
            </button>
            {hasLogin ? (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] bg-[var(--color-green-subtle)] text-[var(--color-green)] border border-[var(--color-border-green)]">
                Login aktiv
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] bg-[rgba(107,114,128,0.08)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                Kein Login
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form or profile info */}
      <div className="px-6 lg:px-8 py-6 space-y-6">
        {editing ? (
          <ProfileEditor client={client} onClose={() => setEditing(false)} />
        ) : (
          <ProfileInfo client={client} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0">
          {[
            { icon: Lightbulb, label: "Ideen", value: totalIdeas, isGreen: false },
            { icon: TrendingUp, label: "In Arbeit", value: inProgress, isGreen: false },
            { icon: Video, label: "Veröffentlicht", value: published, isGreen: true },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] p-4 relative transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                marginLeft: idx > 0 ? "-2px" : "0",
                zIndex: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = stat.isGreen ? "4px 4px 0px #00DC82" : "4px 4px 0px #0A0A0A";
                el.style.borderColor = stat.isGreen ? "#00DC82" : "rgba(0, 220, 130, 0.3)";
                el.style.zIndex = "10";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = "";
                el.style.borderColor = "";
                el.style.zIndex = "0";
              }}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px]"
                style={{ background: stat.isGreen ? "var(--color-green)" : "var(--color-surface-4)" }}
              />
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 flex items-center justify-center border"
                  style={{
                    background: stat.isGreen ? "var(--color-green-subtle)" : "var(--color-surface-2)",
                    borderColor: stat.isGreen ? "var(--color-border-green)" : "var(--color-border-strong)",
                  }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.isGreen ? "var(--color-green)" : "var(--color-text-tertiary)" }} strokeWidth={2} />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.08em] font-bold">
                  {stat.label}
                </span>
              </div>
              <p
                className="text-[32px] font-bold tracking-[-0.03em] tabular-nums ml-10"
                style={{
                  fontFamily: "var(--font-display)",
                  color: stat.isGreen ? "var(--color-green)" : "var(--color-text-primary)",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <CategoryManager clientId={clientId} />

        {/* Ideas */}
        <section>
          <SectionHeader title="Ideen" icon={Lightbulb} action="Alle anzeigen" onAction={() => onNavigate("ideas")} />

          {(ideas || []).length === 0 ? (
            <div className="bg-[var(--color-surface-1)] border-2 border-dashed border-[var(--color-border-strong)] p-8 text-center relative">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--color-green)]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--color-green)]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--color-green)]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--color-green)]" />
              <div className="w-10 h-10 mx-auto mb-2 border-2 border-[var(--color-border-strong)] flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              </div>
              <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-[0.04em]">
                Noch keine Ideen für diesen Kunden
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {(ideas || []).slice(0, 8).map((idea, idx) => {
                const sc = STATUS_COLORS[idea.status] || STATUS_COLORS.idee;
                const cat = idea.categoryId ? categoryMap[idea.categoryId] : null;
                return (
                  <button
                    key={idea._id}
                    onClick={() => onNavigate("idea", idea._id)}
                    className="w-full flex items-center justify-between gap-3 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] px-4 py-3 text-left group transition-all duration-150 hover:border-[var(--color-border-green)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_var(--color-surface-4)]"
                    style={{ marginTop: idx > 0 ? "-2px" : "0" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        {STATUS_LABELS[idea.status] || idea.status}
                      </span>
                      {cat && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold flex-shrink-0"
                          style={{ background: cat.color + "18", color: cat.color, border: `1px solid ${cat.color}30` }}
                        >
                          <span className="w-1.5 h-1.5" style={{ background: cat.color }} />
                          {cat.name}
                        </span>
                      )}
                      <span className="text-[13px] truncate group-hover:text-[var(--color-green)] transition-colors">{idea.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming Shoots */}
        <section>
          <SectionHeader title="Nächste Drehtermine" icon={Calendar} />

          {upcomingShoots.length === 0 ? (
            <div className="bg-[var(--color-surface-1)] border-2 border-dashed border-[var(--color-border-strong)] p-8 text-center">
              <div className="w-10 h-10 mx-auto mb-2 border-2 border-[var(--color-border-strong)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              </div>
              <p className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-[0.04em]">
                Keine anstehenden Drehtermine
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {upcomingShoots.slice(0, 5).map((shoot, idx) => {
                const isToday = new Date(shoot.date).toDateString() === new Date().toDateString();
                return (
                  <div
                    key={shoot._id}
                    className="flex items-center gap-3 bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] px-4 py-3 transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_var(--color-surface-4)]"
                    style={{
                      marginTop: idx > 0 ? "-2px" : "0",
                      borderColor: isToday ? "var(--color-green)" : "",
                    }}
                  >
                    <div
                      className="w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 border-2"
                      style={{
                        background: isToday ? "var(--color-green)" : "var(--color-surface-2)",
                        borderColor: isToday ? "var(--color-green)" : "var(--color-border-strong)",
                        color: isToday ? "#0A0A0A" : "var(--color-text-secondary)",
                      }}
                    >
                      <span className="text-[14px] font-bold leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {new Date(shoot.date).toLocaleDateString("de-DE", { day: "2-digit" })}
                      </span>
                      <span className="text-[9px] uppercase font-semibold tracking-[0.06em] opacity-80">
                        {new Date(shoot.date).toLocaleDateString("de-DE", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold truncate">{shoot.title || "Drehtermin"}</p>
                        {isToday && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 bg-[var(--color-green-subtle)] text-[var(--color-green)] border border-[var(--color-border-green)]">
                            Heute
                          </span>
                        )}
                      </div>
                      {shoot.location && (
                        <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">{shoot.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono tabular-nums">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      {formatDate(new Date(shoot.date).getTime())}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Activity Timeline */}
        <ActivityTimeline clientId={clientId} onNavigate={onNavigate} />
      </div>

      {showAiSuggest && (
        <AiSuggestModal
          preselectedClientId={clientId}
          onClose={() => setShowAiSuggest(false)}
          onAccept={async (title, description, cId) => {
            if (!user || !token) return;
            await createIdea({
              token,
              clientId: cId as Id<"clients">,
              title,
              description,
            });
          }}
        />
      )}
    </div>
  );
}
