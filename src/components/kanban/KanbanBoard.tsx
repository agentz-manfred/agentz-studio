import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { STATUS_LABELS, STATUS_ORDER, STATUS_COLORS, cn } from "../../lib/utils";
import { GripVertical } from "lucide-react";

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

function KanbanColumn({
  status,
  ideas,
  children,
}: {
  status: string;
  ideas: Idea[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-[280px] flex flex-col rounded-[var(--radius-lg)] transition-colors duration-200",
        isOver && "bg-[var(--color-accent-surface)]"
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: STATUS_COLORS[status] || "#a3a3a3" }}
          />
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            {STATUS_LABELS[status] || status}
          </span>
          <span className="text-[12px] text-[var(--color-text-tertiary)] tabular-nums">
            {ideas.length}
          </span>
        </div>
      </div>
      <div className="flex-1 px-1.5 pb-2 space-y-1.5 min-h-[120px]">
        <SortableContext
          items={ideas.map((i) => i._id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
          {ideas.length === 0 && (
            <div className="flex items-center justify-center h-20 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] text-[12px] text-[var(--color-text-tertiary)] opacity-50">
              Hierher ziehen
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function KanbanCard({
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: idea._id, data: { status: idea.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isSortDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[72px] rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-[var(--color-surface-1)] rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] p-3 cursor-default transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]",
        isDragging && "shadow-[var(--shadow-lg)] rotate-[2deg]"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0" onClick={onClick} role={onClick ? "button" : undefined} style={onClick ? { cursor: "pointer" } : undefined}>
          <p className="text-[14px] font-medium leading-tight truncate group-hover:text-[var(--color-accent)] transition-colors">
            {idea.title}
          </p>
          {clientName && (
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              {clientName}
            </p>
          )}
          {idea.description && (
            <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
              {idea.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ ideas, onStatusChange, clientNames, onIdeaClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const columns = STATUS_ORDER.map((status) => ({
    status,
    ideas: ideas.filter((i) => i.status === status),
  }));

  const activeIdea = ideas.find((i) => i._id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdea = ideas.find((i) => i._id === active.id);
    if (!activeIdea) return;

    // Dropped on a column
    const targetStatus = STATUS_ORDER.includes(over.id as string)
      ? (over.id as string)
      : ideas.find((i) => i._id === over.id)?.status;

    if (targetStatus && targetStatus !== activeIdea.status) {
      onStatusChange(activeIdea._id, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 px-1">
        {columns.map(({ status, ideas: columnIdeas }) => (
          <KanbanColumn key={status} status={status} ideas={columnIdeas}>
            {columnIdeas.map((idea) => (
              <KanbanCard
                key={idea._id}
                idea={idea}
                clientName={clientNames?.[idea.clientId]}
                onClick={onIdeaClick ? () => onIdeaClick(idea._id) : undefined}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeIdea && (
          <KanbanCard
            idea={activeIdea}
            clientName={clientNames?.[activeIdea.clientId]}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
