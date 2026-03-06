import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

export function CalendarPage() {
  const ideas = useQuery(api.ideas.list, {});
  const clients = useQuery(api.clients.list);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const clientMap = (clients || []).reduce(
    (acc, c) => ({ ...acc, [c._id]: c.name }),
    {} as Record<string, string>
  );

  // Group ideas by creation date (we don't have a dedicated date field yet)
  const ideasByDate = useMemo(() => {
    const map: Record<string, typeof ideas> = {};
    (ideas || []).forEach((idea) => {
      const d = new Date(idea.createdAt).toISOString().split("T")[0];
      if (!map[d]) map[d] = [];
      map[d]!.push(idea);
    });
    return map;
  }, [ideas]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const today = now.toISOString().split("T")[0];

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="px-6 lg:px-8 py-6 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Kalender</h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] mt-0.5">Termine & Übersicht</p>
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
          {/* Weekday headers */}
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-[var(--color-surface-2)] py-2 text-center text-[12px] font-medium text-[var(--color-text-tertiary)]">
              {d}
            </div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-surface-0)] min-h-[80px] sm:min-h-[100px]" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayIdeas = ideasByDate[dateStr] || [];
            const isToday = dateStr === today;

            return (
              <div
                key={day}
                className={`bg-[var(--color-surface-1)] min-h-[80px] sm:min-h-[100px] p-1.5 ${isToday ? "ring-2 ring-inset ring-[var(--color-accent)]" : ""}`}
              >
                <span className={`text-[12px] tabular-nums ${isToday ? "bg-[var(--color-accent)] text-white w-5 h-5 rounded-full inline-flex items-center justify-center" : "text-[var(--color-text-secondary)]"}`}>
                  {day}
                </span>
                {dayIdeas.slice(0, 2).map((idea) => (
                  <div
                    key={idea._id}
                    className="mt-0.5 px-1 py-0.5 rounded text-[10px] sm:text-[11px] truncate bg-[var(--color-accent-surface)] text-[var(--color-text-secondary)]"
                    title={`${idea.title} (${clientMap[idea.clientId] || ""})`}
                  >
                    {idea.title}
                  </div>
                ))}
                {dayIdeas.length > 2 && (
                  <p className="text-[10px] text-[var(--color-text-tertiary)] px-1 mt-0.5">
                    +{dayIdeas.length - 2}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming (placeholder) */}
      <div className="px-6 lg:px-8 pb-8">
        <h3 className="text-[15px] font-medium mb-3">Kommende Drehtermine</h3>
        <div className="text-center py-8 bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)]">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-tertiary)] opacity-40" />
          <p className="text-[13px] text-[var(--color-text-tertiary)]">Noch keine Termine geplant</p>
        </div>
      </div>
    </div>
  );
}
