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
      <KanbanBoardPrimitive className="grid auto-cols-[240px] sm:auto-cols-[260px] grid-flow-col gap-2 sm:gap-3 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none" style={{ touchAction: "pan-y" }}>
        {STATUS_ORDER.map((status) => {
          const color = STATUS_COLORS[status] || "#a3a3a3";
          const statusIdeas = displayColumns[status] || [];

          return (
            <KanbanColumn
              key={status}
              value={status}
              className="!bg-transparent !border-0 !p-0 !rounded-none gap-0 snap-start"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span
                  className="text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-md"
                  style={{ background: hexToRgba(color, 0.1), color }}
                >
                  {statusIdeas.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-[100px]">
                {statusIdeas.map((idea) => {
                  const clientName = clientNames?.[idea.clientId];
                  const clientInfo = clientInfoMap?.[idea.clientId];
                  const avatarBg = clientInfo?.avatarColor || "#4F46E5";
                  return (
                    <KanbanItem
                      key={idea._id}
                      value={idea._id}
                      asHandle
                      asChild
                    >
                      <div
                        className={cn(
                          "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-3 shadow-sm",
                          "transition-shadow hover:shadow-md",
                          "active:shadow-lg active:scale-[1.02]",
                        )}
                        onClick={onIdeaClick && !isDragging ? () => onIdeaClick(idea._id) : undefined}
                      >
                        {/* Accent bar top */}
                        <div
                          className="h-0.5 -mx-3 -mt-3 mb-3 rounded-t-lg"
                          style={{ background: color }}
                        />
                        <p className="text-[13px] font-medium leading-snug line-clamp-2">
                          {idea.title}
                        </p>
                        {idea.description && (
                          <p className="mt-1.5 text-[12px] text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed">
                            {idea.description}
                          </p>
                        )}
                        {clientName && (
                          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
                              style={{ background: avatarBg }}
                            >
                              {clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[11px] text-[var(--color-text-tertiary)]">
                              {clientName}
                            </span>
                          </div>
                        )}
                      </div>
                    </KanbanItem>
                  );
                })}
                {statusIdeas.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] opacity-30">
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
          if (!idea) return <div className="size-full rounded-lg bg-[var(--color-accent)]/10" />;
          const clientName = clientNames?.[idea.clientId];
          const color = STATUS_COLORS[idea.status] || "#a3a3a3";
          const cInfo = clientInfoMap?.[idea.clientId];
          const avatarBg = cInfo?.avatarColor || "#4F46E5";
          return (
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-3 shadow-xl rotate-[2deg] w-[260px]">
              <div
                className="h-0.5 -mx-3 -mt-3 mb-3 rounded-t-lg"
                style={{ background: color }}
              />
              <p className="text-[13px] font-medium leading-snug line-clamp-2">
                {idea.title}
              </p>
              {clientName && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white"
                    style={{ background: avatarBg }}
                  >
                    {clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
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
