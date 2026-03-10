import { useQuery, useMutation } from "convex/react";
import { useClientFilter } from "../lib/clientFilter";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Trash2, FileText, Pencil, Video, Send } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { CalendarSkeleton } from "../components/ui/Skeleton";
import type { Id } from "../../convex/_generated/dataModel";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

type CalendarEvent = {
  type: "shoot" | "publish";
  id: string;
  date: string;
  clientId: string;
  label: string;
  data: any;
};

function EventPopover({ event, client, onClose, onDelete, onNavigate, isAdmin }: {
  event: CalendarEvent;
  client: any;
  onClose: () => void;
  onDelete?: () => void;
  onNavigate?: (page: string, id?: string) => void;
  isAdmin?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(event.data.date || event.data.scheduledPublishDate || "");
  const [editTime, setEditTime] = useState(event.data.time || "");
  const [editLocation, setEditLocation] = useState(event.data.location || "");
  const [editNotes, setEditNotes] = useState(event.data.notes || "");
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();
  const updateShootDate = useMutation(api.shootDates.update);
  const updateIdea = useMutation(api.ideas.update);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isShoot = event.type === "shoot";
  const Icon = isShoot ? Calendar : Send;

  const handleSave = async () => {
    setSaving(true);
    if (isShoot) {
      if (token) await updateShootDate({
        token,
        id: event.data._id,
        date: editDate,
        time: editTime || undefined,
        location: editLocation || undefined,
        notes: editNotes || undefined,
      });
    } else {
      if (token) await updateIdea({
        token,
        ideaId: event.data._id,
        scheduledPublishDate: editDate,
      });
    }
    setSaving(false);
    setEditing(false);
    onClose();
  };

  const dateObj = new Date(event.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div ref={ref} className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[420px] mx-4" style={{ borderRadius: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-2"
              style={{
                borderColor: isShoot ? 'var(--color-green)' : 'var(--color-green-dark)',
                background: 'var(--color-green-subtle)',
                borderRadius: 0,
              }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--color-green)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold uppercase" style={{ letterSpacing: '0.02em' }}>{client?.name || event.label}</p>
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 border"
                  style={{
                    letterSpacing: '0.06em',
                    borderRadius: 0,
                    background: 'var(--color-green-subtle)',
                    color: 'var(--color-green)',
                    borderColor: 'var(--color-green)',
                  }}
                >
                  {isShoot ? "DREH" : "PUBLISH"}
                </span>
              </div>
              {isShoot && client?.company && (
                <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase" style={{ letterSpacing: '0.04em' }}>{client.company}</p>
              )}
              {!isShoot && (
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{event.data.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && !editing && (
              <button onClick={() => setEditing(true)} className="p-1.5 border border-transparent hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderRadius: 0 }}>
                <Pencil className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 border border-transparent hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors" style={{ borderRadius: 0 }}>
              <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="p-4 space-y-3">
            <div className={isShoot ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Datum</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                  className="w-full h-9 px-2.5 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none" style={{ borderRadius: 0 }} />
              </div>
              {isShoot && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Uhrzeit</label>
                  <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)}
                    className="w-full h-9 px-2.5 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none" style={{ borderRadius: 0 }} />
                </div>
              )}
            </div>
            {isShoot && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Ort</label>
                  <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-9 px-2.5 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none"
                    placeholder="z.B. Pflegedienst Kolbe" style={{ borderRadius: 0 }} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1" style={{ letterSpacing: '0.08em' }}>Notizen</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full h-16 px-2.5 py-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none resize-none"
                    placeholder="Equipment, Ansprechpartner..." style={{ borderRadius: 0 }} />
                </div>
              </>
            )}
            <div className="flex gap-0 pt-1" style={{ marginLeft: '-2px' }}>
              <button onClick={() => setEditing(false)}
                className="flex-1 h-8 border-2 border-[var(--color-border-strong)] text-[12px] font-bold uppercase hover:bg-[var(--color-surface-2)] transition-colors"
                style={{ borderRadius: 0, letterSpacing: '0.06em' }}>
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={saving || !editDate}
                className="flex-1 h-8 bg-[var(--color-green)] text-[#0A0A0A] text-[12px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] disabled:opacity-50 transition-all"
                style={{ borderRadius: 0, letterSpacing: '0.06em', marginLeft: '-2px' }}>
                {saving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-[13px]">
                <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{dateStr}{isShoot && event.data.time ? ` · ${event.data.time} Uhr` : ""}</span>
              </div>
              {isShoot && event.data.location && (
                <div className="flex items-center gap-2.5 text-[13px]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  <span className="text-[var(--color-text-secondary)]">{event.data.location}</span>
                </div>
              )}
              {isShoot && event.data.notes && (
                <div className="flex items-start gap-2.5 text-[13px]">
                  <FileText className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] mt-0.5" />
                  <span className="text-[var(--color-text-secondary)]">{event.data.notes}</span>
                </div>
              )}
              {!isShoot && (
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Video className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                  <span className="text-[var(--color-text-secondary)] uppercase text-[11px] font-bold" style={{ letterSpacing: '0.06em' }}>Status: {event.data.status}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-0 p-4 pt-2 border-t-2 border-[var(--color-border-strong)]">
              {isShoot && client && onNavigate && (
                <button
                  onClick={() => { onClose(); onNavigate("client", client._id); }}
                  className="flex-1 h-8 border-2 border-[var(--color-border-strong)] text-[11px] font-bold uppercase bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-all"
                  style={{ borderRadius: 0, letterSpacing: '0.06em' }}
                >
                  Zum Kunden
                </button>
              )}
              {!isShoot && onNavigate && (
                <button
                  onClick={() => { onClose(); onNavigate("idea", event.data._id); }}
                  className="flex-1 h-8 border-2 border-[var(--color-border-strong)] text-[11px] font-bold uppercase bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-all"
                  style={{ borderRadius: 0, letterSpacing: '0.06em' }}
                >
                  Zur Idee
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(); onClose(); }}
                  className="h-8 px-3 border-2 border-[var(--color-border-strong)] text-[11px] font-bold uppercase hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[rgba(255,51,51,0.08)] transition-all flex items-center gap-1.5"
                  style={{ borderRadius: 0, letterSpacing: '0.06em', marginLeft: '-2px' }}
                >
                  <Trash2 className="w-3 h-3" />
                  {isShoot ? "Löschen" : "Entfernen"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewShootDateModal({ onClose, defaultDate }: { onClose: () => void; defaultDate?: string }) {
  const { token } = useAuth();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const ideas = useQuery(api.ideas.list, token ? { token } : "skip");
  const createShootDate = useMutation(api.shootDates.create);
  const [clientId, setClientId] = useState("");
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clientIdeas = clientId
    ? (ideas || []).filter((i) => i.clientId === clientId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !date || !token) return;
    setSubmitting(true);
    await createShootDate({
      token,
      clientId: clientId as Id<"clients">,
      ideaIds: selectedIdeas as Id<"ideas">[],
      date,
      time: time || undefined,
      location: location || undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  const toggleIdea = (ideaId: string) => {
    setSelectedIdeas((prev) =>
      prev.includes(ideaId) ? prev.filter((id) => id !== ideaId) : [...prev, ideaId]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="animate-in bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] shadow-[var(--shadow-brutal)] w-full max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto" style={{ borderRadius: 0 }}>
        {/* Header with green accent bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--color-border-strong)]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
            <h3 className="text-[14px] font-bold uppercase" style={{ letterSpacing: '0.08em' }}>Neuer Drehtermin</h3>
          </div>
          <button onClick={onClose} className="p-1 border border-transparent hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors" style={{ borderRadius: 0 }}>
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Kunde *</label>
            <select
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setSelectedIdeas([]); }}
              className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none"
              required
              style={{ borderRadius: 0 }}
            >
              <option value="">Kunde wählen…</option>
              {(clients || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Datum *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none" required style={{ borderRadius: 0 }} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Uhrzeit</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none" style={{ borderRadius: 0 }} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Ort</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none"
              placeholder="z.B. Pflegedienst Kolbe, Schwerin" style={{ borderRadius: 0 }} />
          </div>

          {clientIdeas.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Ideen verknüpfen</label>
              <div className="space-y-0 max-h-32 overflow-y-auto border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
                {clientIdeas.map((idea) => (
                  <label key={idea._id} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-green-subtle)] cursor-pointer transition-colors border-b border-[var(--color-border-subtle)] last:border-0">
                    <input type="checkbox" checked={selectedIdeas.includes(idea._id)} onChange={() => toggleIdea(idea._id)}
                      className="border-[var(--color-border-strong)] text-[var(--color-green)] focus:ring-0" style={{ borderRadius: 0 }} />
                    <span className="text-[12px] uppercase font-medium" style={{ letterSpacing: '0.02em' }}>{idea.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>Notizen</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 px-3 py-2 border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-0)] text-[13px] focus:border-[var(--color-green)] focus:shadow-[var(--shadow-brutal-sm)] focus:outline-none resize-none"
              placeholder="Equipment, Ansprechpartner, etc." style={{ borderRadius: 0 }} />
          </div>

          <div className="flex gap-0 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 border-2 border-[var(--color-border-strong)] text-[13px] font-bold uppercase hover:bg-[var(--color-surface-2)] transition-colors"
              style={{ borderRadius: 0, letterSpacing: '0.06em' }}>
              Abbrechen
            </button>
            <button type="submit" disabled={submitting || !clientId || !date}
              className="flex-1 h-10 bg-[var(--color-green)] text-[#0A0A0A] text-[13px] font-bold uppercase border-2 border-[var(--color-green-dark)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[var(--shadow-brutal-sm)] disabled:opacity-50 transition-all"
              style={{ borderRadius: 0, letterSpacing: '0.06em', marginLeft: '-2px' }}>
              Anlegen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[10px] uppercase font-bold" style={{ letterSpacing: '0.08em' }}>
      <div className="flex items-center gap-1.5">
        <div className="w-[10px] h-[10px] border border-[#0A0A0A]" style={{ background: "var(--color-green)", borderRadius: 0 }} />
        <span className="text-[var(--color-text-tertiary)]">Drehtermin</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-[10px] h-[10px] border border-[#0A0A0A]" style={{ background: "var(--color-green-dark)", borderRadius: 0 }} />
        <span className="text-[var(--color-text-tertiary)]">Veröffentlichung</span>
      </div>
    </div>
  );
}

export function CalendarPage({ onNavigate }: { onNavigate?: (page: string, id?: string) => void } = {}) {
  const { user, token } = useAuth();
  const { selectedClientId } = useClientFilter();
  const clients = useQuery(api.clients.list, token ? { token } : "skip");
  const allShootDates = useQuery(api.shootDates.list, token ? { token } : "skip");
  const allIdeasWithPublishDates = useQuery(api.ideas.withPublishDates);
  const shootDates = selectedClientId
    ? (allShootDates || []).filter(s => s.clientId === selectedClientId)
    : allShootDates;
  const ideasWithPublish = selectedClientId
    ? (allIdeasWithPublishDates || []).filter(i => i.clientId === selectedClientId)
    : allIdeasWithPublishDates;
  const removeShootDate = useMutation(api.shootDates.remove);
  const updateIdea = useMutation(api.ideas.update);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showNewShoot, setShowNewShoot] = useState(false);
  const [newShootDate, setNewShootDate] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<"all" | "shoot" | "publish">("all");

  const clientMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c }),
    {} as Record<string, any>
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const addEvent = (evt: CalendarEvent) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date]!.push(evt);
    };

    if (filterType !== "publish") {
      (shootDates || []).forEach((sd) => {
        addEvent({
          type: "shoot",
          id: sd._id,
          date: sd.date,
          clientId: sd.clientId,
          label: clientMap[sd.clientId]?.name || "Dreh",
          data: sd,
        });
      });
    }

    if (filterType !== "shoot") {
      (ideasWithPublish || []).forEach((idea) => {
        if (idea.scheduledPublishDate) {
          addEvent({
            type: "publish",
            id: idea._id,
            date: idea.scheduledPublishDate,
            clientId: idea.clientId,
            label: idea.title,
            data: idea,
          });
        }
      });
    }

    return map;
  }, [shootDates, ideasWithPublish, clientMap, filterType]);

  const allEvents = useMemo(() => {
    return Object.values(eventsByDate).flat();
  }, [eventsByDate]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const upcoming = allEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const handleDayClick = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
    } else if (user?.role === "admin") {
      setNewShootDate(dateStr);
      setShowNewShoot(true);
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    if (selectedEvent.type === "shoot") {
      if (token) removeShootDate({ token, id: selectedEvent.data._id });
    } else {
      if (token) updateIdea({ token, ideaId: selectedEvent.data._id, scheduledPublishDate: "" });
    }
  };

  if (allShootDates === undefined && allIdeasWithPublishDates === undefined) return <CalendarSkeleton />;

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-[var(--color-border-strong)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
              <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase" style={{ letterSpacing: '0.12em' }}>Terminplanung</span>
            </div>
            <h1 className="text-[24px] font-bold uppercase font-[var(--font-display)]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>Kalender</h1>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => { setNewShootDate(undefined); setShowNewShoot(true); }}
              className="btn-brutal flex items-center gap-2 h-9 px-4 text-[12px] font-bold uppercase"
              style={{ letterSpacing: '0.06em' }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Neuer Termin</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {/* Filter + Legend */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-0">
            {(["all", "shoot", "publish"] as const).map((f, i) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`h-7 px-3 text-[10px] font-bold uppercase border-2 transition-all ${
                  filterType === f
                    ? "bg-[var(--color-green)] text-[#0A0A0A] border-[var(--color-green-dark)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] border-[var(--color-border-strong)] hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                }`}
                style={{ borderRadius: 0, letterSpacing: '0.06em', marginLeft: i > 0 ? '-2px' : 0 }}
              >
                {f === "all" ? "Alle" : f === "shoot" ? "🎬 Drehs" : "📤 Publish"}
              </button>
            ))}
          </div>
          <Legend />
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 border-2 border-[var(--color-border-strong)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors" style={{ borderRadius: 0 }}>
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <h2 className="text-[15px] font-bold uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{MONTHS[month]} {year}</h2>
          <button onClick={next} className="p-2 border-2 border-[var(--color-border-strong)] hover:border-[var(--color-green)] hover:text-[var(--color-green)] transition-colors" style={{ borderRadius: 0 }}>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 border-2 border-[var(--color-border-strong)]" style={{ borderRadius: 0 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-[var(--color-surface-2)] py-2 text-center text-[10px] font-bold uppercase text-[var(--color-text-tertiary)] border-b-2 border-[var(--color-border-strong)]" style={{ letterSpacing: '0.08em' }}>
              {d}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-surface-0)] min-h-[80px] sm:min-h-[100px] border-b border-r border-[var(--color-border-subtle)]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr)}
                className={`bg-[var(--color-surface-1)] min-h-[80px] sm:min-h-[100px] p-1.5 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors border-b border-r border-[var(--color-border-subtle)] ${
                  isToday ? "ring-2 ring-inset ring-[var(--color-green)]" : ""
                } ${isPast ? "opacity-60" : ""}`}
              >
                <span className={`text-[12px] font-mono font-bold ${
                  isToday
                    ? "bg-[var(--color-green)] text-[#0A0A0A] w-5 h-5 inline-flex items-center justify-center"
                    : "text-[var(--color-text-secondary)]"
                }`} style={{ fontVariantNumeric: 'tabular-nums', borderRadius: 0 }}>
                  {day}
                </span>
                {dayEvents.slice(0, 3).map((evt) => {
                  const isShoot = evt.type === "shoot";
                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                      className="mt-0.5 px-1.5 py-0.5 text-[10px] sm:text-[11px] truncate border w-full text-left hover:border-[var(--color-green)] transition-all font-bold uppercase"
                      style={{
                        borderRadius: 0,
                        letterSpacing: '0.02em',
                        background: 'var(--color-green-subtle)',
                        color: isShoot ? 'var(--color-green)' : 'var(--color-green-dark)',
                        borderColor: isShoot ? 'rgba(0,220,130,0.3)' : 'rgba(0,186,107,0.3)',
                      }}
                    >
                      {isShoot ? "🎬" : "📤"} {evt.label}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 block font-mono">+{dayEvents.length - 3}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-6 lg:px-8 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[3px] h-[20px] bg-[var(--color-green)]" />
          <h3 className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.08em' }}>Kommende Termine</h3>
        </div>
        {upcoming.length > 0 ? (
          <div className="space-y-0">
            {upcoming.map((evt, i) => {
              const isShoot = evt.type === "shoot";
              const Icon = isShoot ? Calendar : Send;
              const client = clientMap[evt.clientId];
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="w-full bg-[var(--color-surface-1)] border-2 border-[var(--color-border-strong)] px-4 py-3 flex items-center justify-between hover:border-[var(--color-green)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[var(--shadow-brutal-sm)] transition-all text-left"
                  style={{ borderRadius: 0, marginTop: i > 0 ? '-2px' : 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-2"
                      style={{
                        borderColor: 'var(--color-green)',
                        background: 'var(--color-green-subtle)',
                        borderRadius: 0,
                      }}
                    >
                      <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--color-green)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.02em' }}>
                          {isShoot ? (client?.name || "Kunde") : evt.label}
                          {isShoot && client?.company && (
                            <span className="text-[var(--color-text-tertiary)] font-normal normal-case"> · {client.company}</span>
                          )}
                        </p>
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 border"
                          style={{
                            borderRadius: 0,
                            letterSpacing: '0.06em',
                            background: 'var(--color-green-subtle)',
                            color: 'var(--color-green)',
                            borderColor: 'var(--color-green)',
                          }}
                        >
                          {isShoot ? "Dreh" : "Publish"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          <Clock className="w-3 h-3" />
                          {new Date(evt.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "long" })}
                          {isShoot && evt.data.time && ` · ${evt.data.time}`}
                        </span>
                        {isShoot && evt.data.location && (
                          <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {evt.data.location}
                          </span>
                        )}
                        {!isShoot && client && (
                          <span className="text-[11px] text-[var(--color-text-tertiary)] uppercase" style={{ letterSpacing: '0.04em' }}>
                            {client.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--color-surface-1)] border-2 border-dashed border-[var(--color-border-strong)] relative" style={{ borderRadius: 0 }}>
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-green)]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-green)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-green)]" />
            <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-40" />
            <p className="text-[12px] text-[var(--color-text-tertiary)] uppercase font-bold" style={{ letterSpacing: '0.06em' }}>Noch keine Termine geplant</p>
          </div>
        )}
      </div>

      {showNewShoot && <NewShootDateModal onClose={() => setShowNewShoot(false)} defaultDate={newShootDate} />}
      {selectedEvent && (
        <EventPopover
          event={selectedEvent}
          client={clientMap[selectedEvent.clientId]}
          onClose={() => setSelectedEvent(null)}
          onDelete={user?.role === "admin" ? handleDeleteEvent : undefined}
          onNavigate={onNavigate}
          isAdmin={user?.role === "admin"}
        />
      )}
    </div>
  );
}
