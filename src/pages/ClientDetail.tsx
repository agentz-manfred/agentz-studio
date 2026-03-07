import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useCallback } from "react";
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
} from "lucide-react";
import { RichTextEditor, RichTextDisplay } from "../components/ui/RichTextEditor";

const STATUS_LABELS: Record<string, string> = {
  idea: "Idee",
  script: "Skript",
  review: "Zur Freigabe",
  correction: "Korrektur",
  approved: "Freigegeben",
  filmed: "Gedreht",
  editing: "Geschnitten",
  edit_correction: "Korrektur",
  published: "Veröffentlicht",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  script: { bg: "rgba(139,92,246,0.1)", text: "#8b5cf6" },
  review: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  correction: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  approved: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
  filmed: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6" },
  editing: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
  edit_correction: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  published: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
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

/* ─── Profile Edit Section ─── */
function ProfileEditor({
  client,
  onClose,
}: {
  client: any;
  onClose: () => void;
}) {
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
    videosPerMonth: client.videosPerMonth ?? "",
    context: client.context || "",
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
      await updateClient({
        id: client._id as Id<"clients">,
        name: form.name,
        company: form.company || undefined,
        email: form.email,
        phone: form.phone || undefined,
        contractStart: form.contractStart || undefined,
        contractEnd: form.contractEnd || undefined,
        platforms: form.platforms.length ? form.platforms : undefined,
        mainPlatform: form.mainPlatform || undefined,
        videosPerMonth: form.videosPerMonth
          ? Number(form.videosPerMonth)
          : undefined,
        context: form.context || undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const inputClass =
    "w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none transition-colors";
  const labelClass =
    "block text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5";

  return (
    <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
        <h3 className="text-[15px] font-semibold flex items-center gap-2">
          <Pencil className="w-4 h-4 text-[var(--color-accent)]" />
          Profil bearbeiten
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Unternehmen</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>E-Mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
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
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Beginn
              </span>
              <input
                type="date"
                value={form.contractStart}
                onChange={(e) =>
                  setForm({ ...form, contractStart: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Ende
              </span>
              <input
                type="date"
                value={form.contractEnd}
                onChange={(e) =>
                  setForm({ ...form, contractEnd: e.target.value })
                }
                className={inputClass}
              />
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
                  onDoubleClick={() =>
                    setForm((f) => ({ ...f, mainPlatform: p.id }))
                  }
                  className="relative px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all"
                  style={{
                    borderColor: active
                      ? "var(--color-accent)"
                      : "var(--color-border)",
                    background: active
                      ? "rgba(59,130,246,0.08)"
                      : "transparent",
                    color: active
                      ? "var(--color-accent)"
                      : "var(--color-text-tertiary)",
                  }}
                  title={
                    active
                      ? "Doppelklick = Hauptplattform"
                      : "Klick zum Hinzufügen"
                  }
                >
                  {p.icon} {p.label}
                  {isMain && (
                    <span className="ml-1 text-[10px] font-bold opacity-70">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5">
            Klick = Auswählen · Doppelklick = Hauptplattform (★)
          </p>
        </div>

        {/* Videos per month */}
        <div>
          <label className={labelClass}>
            <Hash className="w-3.5 h-3.5 inline mr-1" />
            Videos pro Monat
          </label>
          <input
            type="number"
            min="1"
            value={form.videosPerMonth}
            onChange={(e) =>
              setForm({ ...form, videosPerMonth: e.target.value })
            }
            placeholder="z.B. 30"
            className={inputClass + " max-w-[160px]"}
          />
        </div>

        {/* Context / WYSIWYG */}
        <div>
          <label className={labelClass}>
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Kundenkontext (wird bei KI-Generierung mitgegeben)
          </label>
          <RichTextEditor
            content={form.context}
            onChange={(html) => setForm({ ...form, context: html })}
            placeholder="Tonalität, Do's & Don'ts, Zielgruppe, Besonderheiten, Referenz-Videos, Branche… Markdown einfügen funktioniert!"
          />
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[13px] font-medium hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.email}
            className="h-9 px-5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[13px] font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors flex items-center gap-1.5"
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
  const categories = useQuery(api.categories.listByClient, {
    clientId: clientId as Id<"clients">,
  });
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
    await createCategory({
      clientId: clientId as Id<"clients">,
      name: newName.trim(),
      color: newColor,
    });
    setNewName("");
    setAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateCategory({
      id: id as Id<"categories">,
      name: editName.trim(),
      color: editColor,
    });
    setEditId(null);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Kategorie löschen?")) return;
    await removeCategory({ id: id as Id<"categories"> });
  };

  const sorted = [...(categories || [])].sort((a, b) => a.order - b.order);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          Kategorien
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="text-[12px] text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Neue Kategorie
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sorted.map((cat) => {
          if (editId === cat._id) {
            return (
              <div
                key={cat._id}
                className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-full pl-1 pr-2 py-0.5"
              >
                <div className="flex gap-0.5 ml-1">
                  {CATEGORY_COLORS.slice(0, 7).map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-4 h-4 rounded-full border-2 transition-all"
                      style={{
                        background: c,
                        borderColor:
                          editColor === c
                            ? "var(--color-text-primary)"
                            : "transparent",
                      }}
                    />
                  ))}
                </div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-20 h-6 px-1.5 text-[12px] bg-transparent border-b border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(cat._id);
                    if (e.key === "Escape") setEditId(null);
                  }}
                />
                <button
                  onClick={() => handleUpdate(cat._id)}
                  className="p-0.5 text-[var(--color-accent)]"
                >
                  <Save className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={cat._id}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium cursor-default transition-all"
              style={{
                background: cat.color + "18",
                color: cat.color,
                border: `1px solid ${cat.color}30`,
              }}
              onClick={() => {
                setEditId(cat._id);
                setEditName(cat.name);
                setEditColor(cat.color);
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              {cat.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(cat._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[var(--color-error)] transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Add inline */}
        {adding && (
          <div className="flex items-center gap-1.5 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-full pl-1 pr-2 py-0.5">
            <div className="flex gap-0.5 ml-1">
              {CATEGORY_COLORS.slice(0, 7).map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-4 h-4 rounded-full border-2 transition-all"
                  style={{
                    background: c,
                    borderColor:
                      newColor === c
                        ? "var(--color-text-primary)"
                        : "transparent",
                  }}
                />
              ))}
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name…"
              className="w-20 h-6 px-1.5 text-[12px] bg-transparent border-b border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="p-0.5 text-[var(--color-accent)] disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAdding(false)}
              className="p-0.5 text-[var(--color-text-tertiary)]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {sorted.length === 0 && !adding && (
          <p className="text-[13px] text-[var(--color-text-tertiary)] italic">
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
    !client.videosPerMonth &&
    !client.context
  ) {
    return null;
  }

  return (
    <section className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
        {/* Contract */}
        {(client.contractStart || client.contractEnd) && (
          <div>
            <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
              Vertrag
            </span>
            <p className="mt-0.5 font-medium">
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
            <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
              Plattformen
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {client.platforms.map((p: string) => {
                const opt = PLATFORM_OPTIONS.find((o) => o.id === p);
                const isMain = client.mainPlatform === p;
                return (
                  <span
                    key={p}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: isMain
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(107,114,128,0.08)",
                      color: isMain ? "#3b82f6" : "var(--color-text-secondary)",
                      fontWeight: isMain ? 600 : 500,
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

        {/* Videos/month */}
        {client.videosPerMonth && (
          <div>
            <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
              Videos / Monat
            </span>
            <p className="mt-0.5 font-semibold text-[16px]">
              {client.videosPerMonth}
            </p>
          </div>
        )}
      </div>

      {/* Context */}
      {client.context && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" />
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
  const client = useQuery(api.clients.get, {
    id: clientId as Id<"clients">,
  });
  const ideas = useQuery(api.ideas.list, {
    clientId: clientId as Id<"clients">,
  });
  const shoots = useQuery(api.shootDates.list, {
    clientId: clientId as Id<"clients">,
  });
  const users = useQuery(api.auth.listUsers);
  const categories = useQuery(api.categories.listByClient, {
    clientId: clientId as Id<"clients">,
  });

  const [editing, setEditing] = useState(false);

  const hasLogin = (users || []).some((u) => u.clientId === clientId);

  // Category lookup
  const categoryMap = Object.fromEntries(
    (categories || []).map((c) => [c._id, c])
  );

  if (client === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-text-tertiary)]">
          Kunde nicht gefunden
        </p>
        <button
          onClick={onBack}
          className="mt-4 text-[var(--color-accent)] text-[14px]"
        >
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
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kunden
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center text-white text-[20px] font-semibold">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {client.company && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    <Building2 className="w-3.5 h-3.5" />
                    {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                  <Mail className="w-3.5 h-3.5" />
                  {client.email}
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    <Phone className="w-3.5 h-3.5" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="h-8 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[12px] font-medium hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-1.5"
            >
              <Pencil className="w-3 h-3" />
              Bearbeiten
            </button>
            {hasLogin ? (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  color: "#16a34a",
                }}
              >
                Login aktiv
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium"
                style={{
                  background: "rgba(107,114,128,0.1)",
                  color: "#6b7280",
                }}
              >
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
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                Ideen
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {totalIdeas}
            </p>
          </div>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                In Arbeit
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {inProgress}
            </p>
          </div>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-green-500" />
              <span className="text-[12px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                Veröffentlicht
              </span>
            </div>
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {published}
            </p>
          </div>
        </div>

        {/* Categories */}
        <CategoryManager clientId={clientId} />

        {/* Ideas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold">Ideen</h2>
            <button
              onClick={() => onNavigate("ideas")}
              className="text-[12px] text-[var(--color-accent)] hover:underline"
            >
              Alle anzeigen
            </button>
          </div>

          {(ideas || []).length === 0 ? (
            <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-8 text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                Noch keine Ideen für diesen Kunden
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(ideas || []).slice(0, 8).map((idea) => {
                const sc = STATUS_COLORS[idea.status] || STATUS_COLORS.idea;
                const cat = idea.categoryId
                  ? categoryMap[idea.categoryId]
                  : null;
                return (
                  <button
                    key={idea._id}
                    onClick={() => onNavigate("idea", idea._id)}
                    className="w-full flex items-center justify-between gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 hover:shadow-[var(--shadow-sm)] transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABELS[idea.status] || idea.status}
                      </span>
                      {cat && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
                          style={{
                            background: cat.color + "18",
                            color: cat.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: cat.color }}
                          />
                          {cat.name}
                        </span>
                      )}
                      <span className="text-[14px] truncate">
                        {idea.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming Shoots */}
        <section>
          <h2 className="text-[15px] font-semibold mb-3">
            Nächste Drehtermine
          </h2>

          {upcomingShoots.length === 0 ? (
            <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)]">
                Keine anstehenden Drehtermine
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {upcomingShoots.slice(0, 5).map((shoot) => (
                <div
                  key={shoot._id}
                  className="flex items-center gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3"
                >
                  <div
                    className="w-10 h-10 rounded-[var(--radius-md)] flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.08)",
                    }}
                  >
                    <span className="text-[11px] font-semibold text-blue-500 leading-none">
                      {new Date(shoot.date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                      })}
                    </span>
                    <span className="text-[9px] text-blue-400 uppercase">
                      {new Date(shoot.date).toLocaleDateString("de-DE", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">
                      {shoot.title || "Drehtermin"}
                    </p>
                    {shoot.location && (
                      <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                        {shoot.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)]">
                    <Clock className="w-3 h-3" />
                    {formatDate(new Date(shoot.date).getTime())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
