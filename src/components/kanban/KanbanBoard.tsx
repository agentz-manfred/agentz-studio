import { useState, useCallback, useRef, useMemo } from "react";
import {
  Kanban,
  KanbanBoard as KanbanBoardPrimitive,
  KanbanColumn,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "../ui/kanban";
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS, cn } from "../../lib/utils";
import { GripVertical } from "lucide-react";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface Idea {
  _id: string;
  title: string;
  description?: string;
  status: string;
  clientId: string;
}

interface KanbanBoardProps {
  ideas: Idea[];
  onStatusChange: (ideaId: string, newStatus: string) => void;
  clientNames?: Record<string, string>;
  onIdeaClick?: (ideaId: string) => void;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function CardContent({
  idea,
  clientName,
  isDragging,
  onClick,
}: {
  idea: Idea;
  clientName?: string;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const statusColor = STATUS_COLORS[idea.status] || "#a3a3a3";

  return (
    <div
      className={cn(
        "group bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-3",
        "select-none kanban-card-accent",
        isDragging && "shadow-[var(--shadow-lg)] rotate-[2deg]",
        onClick && "cursor-pointer",
      )}
      style={{ '--kanban-accent': statusColor } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-start gap-2">
        <KanbanItemHandle
          className="mt-0.5 p-0.5 rounded text-[var(--color-text-tertiary)] opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </KanbanItemHandle>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium leading-tight truncate group-hover:text-[var(--color-accent)] transition-colors">
            {idea.title}
          </p>
          {idea.description && (
            <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
              {idea.description}
            </p>
          )}
          {clientName && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">
                  {clientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {clientName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ ideas, onStatusChange, clientNames, onIdeaClick }: KanbanBoardProps) {
  // Build column data as Record<status, Idea[]>
  const columns = useMemo(() => {
    const result: Record<string, Idea[]> = {};
    for (const status of STATUS_ORDER) {
      result[status] = ideas.filter((i) => i.status === status);
    }
    return result;
  }, [ideas]);

  // Track columns locally for DnD live updates
  const [localColumns, setLocalColumns] = useState<Record<string, Idea[]> | null>(null);
  const displayColumns = localColumns ?? columns;

  // When ideas change externally, reset local state
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
    // After drop, check what moved and fire onStatusChange
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
      onDragEnd={handleDragEnd}
    >
      <KanbanBoardPrimitive className="flex gap-3 overflow-x-auto pb-4 px-1">
        {STATUS_ORDER.map((status) => {
          const color = STATUS_COLORS[status] || "#a3a3a3";
          const statusIdeas = displayColumns[status] || [];

          return (
            <KanbanColumn
              key={status}
              value={status}
              className="flex-shrink-0 w-[280px]"
            >
              {/* Column Header */}
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-t-[var(--radius-lg)]"
                style={{ background: hexToRgba(color, 0.06) }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 0 2px ${hexToRgba(color, 0.2)}` }}
                  />
                  <span className="text-[13px] font-semibold" style={{ color }}>
                    {STATUS_LABELS[status] || status}
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: hexToRgba(color, 0.12), color }}
                >
                  {statusIdeas.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 px-1.5 pb-2 pt-1.5 space-y-1.5 min-h-[120px]">
                {statusIdeas.map((idea) => (
                  <KanbanItem key={idea._id} value={idea._id}>
                    <CardContent
                      idea={idea}
                      clientName={clientNames?.[idea.clientId]}
                      onClick={onIdeaClick ? () => onIdeaClick(idea._id) : undefined}
                    />
                  </KanbanItem>
                ))}
                {statusIdeas.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] text-[12px] text-[var(--color-text-tertiary)] opacity-40">
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
          if (!idea) return <div className="size-full rounded-md bg-[var(--color-accent)]/10" />;
          return (
            <CardContent
              idea={idea}
              clientName={clientNames?.[idea.clientId]}
              isDragging
            />
          );
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
