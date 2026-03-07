import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
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

function NewShootDateModal({ onClose, defaultDate }: { onClose: () => void; defaultDate?: string }) {
  const clients = useQuery(api.clients.list);
  const ideas = useQuery(api.ideas.list, {});
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
    if (!clientId || !date) return;
    setSubmitting(true);
    await createShootDate({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-in bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-[480px] mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h3 className="text-[17px] font-semibold">Neuer Drehtermin</h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Kunde *</label>
            <select
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setSelectedIdeas([]); }}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              required
            >
              <option value="">Kunde wählen…</option>
              {(clients || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Datum *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Uhrzeit</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Ort</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="z.B. Pflegedienst Kolbe, Schwerin"
            />
          </div>

          {clientIdeas.length > 0 && (
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Ideen verknüpfen</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {clientIdeas.map((idea) => (
                  <label key={idea._id} className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedIdeas.includes(idea._id)}
                      onChange={() => toggleIdea(idea._id)}
                      className="rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-0"
                    />
                    <span className="text-[13px]">{idea.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text-secondary)] mb-1.5">Notizen</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-0)] text-[14px] focus:border-[var(--color-accent)] focus:outline-none resize-none"
              placeholder="Equipment, Ansprechpartner, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[14px] font-medium hover:bg-[var(--color-surface-2)] transition-colors">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || !clientId || !date}
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

export function CalendarPage() {
  const { user } = useAuth();
  const clients = useQuery(api.clients.list);
  const shootDates = useQuery(api.shootDates.list, {});
  const removeShootDate = useMutation(api.shootDates.remove);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showNewShoot, setShowNewShoot] = useState(false);
  const [newShootDate, setNewShootDate] = useState<string | undefined>();

  const clientMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c }),
    {} as Record<string, any>
  );

  const shootsByDate = useMemo(() => {
    const map: Record<string, typeof shootDates> = {};
    (shootDates || []).forEach((sd) => {
      if (!map[sd.date]) map[sd.date] = [];
      map[sd.date]!.push(sd);
    });
    return map;
  }, [shootDates]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  const today = now.toISOString().split("T")[0];

  // Upcoming shoot dates
  const upcoming = (shootDates || [])
    .filter((sd) => sd.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleDayClick = (dateStr: string) => {
    if (user?.role !== "admin") return;
    setNewShootDate(dateStr);
    setShowNewShoot(true);
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Kalender</h1>
            <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">Drehtermine & Übersicht</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => { setNewShootDate(undefined); setShowNewShoot(true); }}
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-[14px] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Neuer Termin</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-[17px] font-semibold">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border-subtle)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-[var(--color-surface-2)] py-2 text-center text-[12px] font-medium text-[var(--color-text-tertiary)]">
              {d}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-surface-0)] min-h-[80px] sm:min-h-[100px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayShoots = shootsByDate[dateStr] || [];
            const isToday = dateStr === today;
            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr)}
                className={`bg-[var(--color-surface-1)] min-h-[80px] sm:min-h-[100px] p-1.5 ${
                  isToday ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""
                } ${user?.role === "admin" ? "cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors" : ""}`}
              >
                <span className={`text-[12px] tabular-nums ${
                  isToday
                    ? "bg-[var(--color-accent)] text-white w-5 h-5 rounded-full inline-flex items-center justify-center"
                    : "text-[var(--color-text-secondary)]"
                }`}>
                  {day}
                </span>
                {dayShoots.map((sd) => (
                  <div
                    key={sd._id}
                    className="mt-0.5 px-1 py-0.5 rounded text-[10px] sm:text-[11px] truncate border"
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", borderColor: "rgba(139,92,246,0.15)" }}
                    title={`${clientMap[sd.clientId]?.name || "Kunde"} ${sd.time ? `· ${sd.time}` : ""} ${sd.location ? `· ${sd.location}` : ""}`}
                  >
                    🎬 {clientMap[sd.clientId]?.name || "Dreh"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming shoot dates */}
      <div className="px-6 lg:px-8 pb-8">
        <h3 className="text-[15px] font-medium mb-3">Kommende Drehtermine</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((sd) => (
              <div key={sd._id} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.1)" }}>
                    <Calendar className="w-[18px] h-[18px]" style={{ color: "#8b5cf6" }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">
                      {clientMap[sd.clientId]?.name || "Kunde"}
                      {clientMap[sd.clientId]?.company && (
                        <span className="text-[var(--color-text-tertiary)] font-normal"> · {clientMap[sd.clientId].company}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[12px] text-[var(--color-text-secondary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sd.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "long" })}
                        {sd.time && ` · ${sd.time}`}
                      </span>
                      {sd.location && (
                        <span className="text-[12px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sd.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => removeShootDate({ id: sd._id })}
                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-accent-surface)] transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-40" />
            <p className="text-[13px] text-[var(--color-text-tertiary)]">Noch keine Termine geplant</p>
          </div>
        )}
      </div>

      {showNewShoot && <NewShootDateModal onClose={() => setShowNewShoot(false)} defaultDate={newShootDate} />}
    </div>
  );
}
