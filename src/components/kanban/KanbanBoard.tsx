import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  Kanban,
  KanbanBoard as KanbanBoardPrimitive,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "../ui/kanban";
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS, cn } from "../../lib/utils";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface Idea {
  _id: string;
  title: string;
  description?: string;
  status: string;
  clientId: string;
  [key: string]: unknown;
}

interface ClientInfo {
  name: string;
  avatarColor?: string;
}

interface KanbanBoardProps {
  ideas: Idea[];
  onStatusChange: (ideaId: string, newStatus: string) => void;
  clientNames?: Record<string, string>;
  clientInfoMap?: Record<string, ClientInfo>;
  onIdeaClick?: (ideaId: string) => void;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function KanbanBoard({ ideas, onStatusChange, clientNames, clientInfoMap, onIdeaClick }: KanbanBoardProps) {
  const columns = useMemo(() => {
    const result: Record<string, Idea[]> = {};
    for (const status of STATUS_ORDER) {
      result[status] = ideas.filter((i) => i.status === status);
    }
    return result;
  }, [ideas]);

  const [localColumns, setLocalColumns] = useState<Record<string, Idea[]> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const displayColumns = localColumns ?? columns;

  const prevIdeasRef = useRef(ideas);
  if (prevIdeasRef.current !== ideas) {
    prevIdeasRef.current = ideas;
    if (localColumns) setLocalColumns(null);
  }

  const handleValueChange = useCallback(
    (newColumns: Record<UniqueIdentifier, Idea[]>) => {
      setLocalColumns(newColumns as Record<string, Idea[]>);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    if (!localColumns) return;
    for (const [status, statusIdeas] of Object.entries(localColumns)) {
      for (const idea of statusIdeas) {
        if (idea.status !== status) {
          onStatusChange(idea._id, status);
        }
      }
    }
    setLocalColumns(null);
  }, [localColumns, onStatusChange]);

  const findIdea = useCallback(
    (id: UniqueIdentifier) => {
      for (const statusIdeas of Object.values(displayColumns)) {
        const found = statusIdeas.find((i) => i._id === String(id));
        if (found) return found;
      }
      return null;
    },
    [displayColumns],
  );

  return (
    <Kanban
      value={displayColumns}
      onValueChange={handleValueChange}
      getItemValue={(item: Idea) => item._id}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => { setIsDragging(false); handleDragEnd(); }}
      onDragCancel={() => setIsDragging(false)}
    >
      <KanbanBoardPrimitive className="grid auto-cols-[240px] sm:auto-cols-[260px] grid-flow-col gap-0 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none" style={{ touchAction: "auto" }}>
        {STATUS_ORDER.map((status, colIndex) => {
          const color = STATUS_COLORS[status] || "#a3a3a3";
          const statusIdeas = displayColumns[status] || [];

          return (
            <KanbanColumn
              key={status}
              value={status}
              className="!bg-transparent !border-0 !p-0 !rounded-none gap-0 snap-start"
              style={{ marginLeft: colIndex > 0 ? '-2px' : 0 }}
            >
              {/* Column Header — brutal */}
              <div
                className="flex items-center justify-between px-3 py-2.5 mb-0 border-2 border-[var(--color-border-strong)]"
                style={{ borderRadius: 0, borderBottom: '2px solid var(--color-border-strong)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-[10px] h-[10px] flex-shrink-0 border border-[#0A0A0A]"
                    style={{ background: color, borderRadius: 0 }}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 border"
                  style={{
                    borderRadius: 0,
                    background: hexToRgba(color, 0.12),
                    color,
                    borderColor: color,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {statusIdeas.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-0 min-h-[100px]">
                {statusIdeas.map((idea, cardIndex) => {
                  const clientName = clientNames?.[idea.clientId];
                  const clientInfo = clientInfoMap?.[idea.clientId];
                  const avatarBg = clientInfo?.avatarColor || "#00DC82";
                  return (
                    <KanbanItem
                      key={idea._id}
                      value={idea._id}
                      asHandle
                      asChild
                    >
                      <div
                        className={cn(
                          "border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-3",
                          "transition-all duration-200",
                          "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_var(--color-green-dark)] hover:border-[var(--color-green)]",
                          "active:shadow-[4px_4px_0px_var(--color-green)] active:scale-[1.01]",
                        )}
                        style={{
                          borderRadius: 0,
                          marginTop: '-2px',
                        }}
                        onClick={onIdeaClick && !isDragging ? () => onIdeaClick(idea._id) : undefined}
                      >
                        {/* Accent bar top */}
                        <div
                          className="h-[3px] -mx-3 -mt-3 mb-3"
                          style={{ background: color, borderRadius: 0 }}
                        />
                        <p className="text-[12px] font-bold leading-snug line-clamp-2 uppercase tracking-[0.02em] hover:text-[var(--color-green)] transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
                          {idea.title}
                        </p>
                        {idea.description && (
                          <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                            {idea.description}
                          </p>
                        )}
                        {clientName && (
                          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t-2 border-[var(--color-border-subtle)]">
                            <div
                              className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#0A0A0A] border border-[#0A0A0A]"
                              style={{ background: avatarBg, borderRadius: 0 }}
                            >
                              {clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em] font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                              {clientName}
                            </span>
                          </div>
                        )}
                      </div>
                    </KanbanItem>
                  );
                })}
                {statusIdeas.length === 0 && (
                  <div
                    className="flex items-center justify-center h-20 border-2 border-dashed border-[var(--color-border-strong)] text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] opacity-40"
                    style={{ borderRadius: 0, marginTop: '-2px', fontFamily: 'var(--font-body)' }}
                  >
                    Hierher ziehen
                  </div>
                )}
              </div>
            </KanbanColumn>
          );
        })}
      </KanbanBoardPrimitive>

      <KanbanOverlay>
        {({ value }) => {
          const idea = findIdea(value);
          if (!idea) return <div className="size-full bg-[var(--color-green-subtle)] border-2 border-[var(--color-green)]" style={{ borderRadius: 0 }} />;
          const clientName = clientNames?.[idea.clientId];
          const color = STATUS_COLORS[idea.status] || "#a3a3a3";
          const cInfo = clientInfoMap?.[idea.clientId];
          const avatarBg = cInfo?.avatarColor || "#00DC82";
          return (
            <div
              className="border-2 border-[var(--color-green)] bg-[var(--color-surface-1)] p-3 w-[260px]"
              style={{ borderRadius: 0, boxShadow: '4px 4px 0px var(--color-green)', transform: 'rotate(2deg)' }}
            >
              <div
                className="h-[3px] -mx-3 -mt-3 mb-3"
                style={{ background: color, borderRadius: 0 }}
              />
              <p className="text-[12px] font-bold leading-snug line-clamp-2 uppercase tracking-[0.02em]" style={{ fontFamily: 'var(--font-body)' }}>
                {idea.title}
              </p>
              {clientName && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#0A0A0A] border border-[#0A0A0A]"
                    style={{ background: avatarBg, borderRadius: 0 }}
                  >
                    {clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.04em] font-bold" style={{ fontFamily: 'var(--font-body)' }}>
                    {clientName}
                  </span>
                </div>
              )}
            </div>
          );
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
