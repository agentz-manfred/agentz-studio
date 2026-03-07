/**
 * Kanban primitives — adapted from @diceui/kanban
 * https://www.diceui.com/docs/components/radix/kanban
 */

import {
  type Announcements,
  type CollisionDetection,
  closestCenter,
  closestCorners,
  DndContext,
  type DndContextProps,
  type DragCancelEvent,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  type DroppableContainer,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  type AnimateLayoutChanges,
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  type SortableContextProps,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { useComposedRefs } from "../../lib/compose-refs";
import { cn } from "../../lib/utils";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const coordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, droppableRects, droppableContainers, collisionRect } = context;

  if (directions.includes(event.code)) {
    event.preventDefault();
    if (!active || !collisionRect) return;

    const filteredContainers: DroppableContainer[] = [];
    for (const entry of droppableContainers.getEnabled()) {
      if (!entry || entry?.disabled) return;
      const rect = droppableRects.get(entry.id);
      if (!rect) return;
      const data = entry.data.current;
      if (data) {
        const { type, children } = data;
        if (type === "container" && children?.length > 0) {
          if (active.data.current?.type !== "container") return;
        }
      }
      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) filteredContainers.push(entry);
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) filteredContainers.push(entry);
          break;
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) filteredContainers.push(entry);
          break;
        case KeyboardCode.Right:
          if (collisionRect.left + collisionRect.width <= rect.left) filteredContainers.push(entry);
          break;
      }
    }

    const collisions = closestCorners({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });
    const closestId = getFirstCollision(collisions, "id");
    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;
      if (newNode && newRect) {
        if (newDroppable.id === "placeholder") {
          return {
            x: newRect.left + (newRect.width - collisionRect.width) / 2,
            y: newRect.top + (newRect.height - collisionRect.height) / 2,
          };
        }
        if (newDroppable.data.current?.type === "container") {
          return { x: newRect.left + 20, y: newRect.top + 74 };
        }
        return { x: newRect.left, y: newRect.top };
      }
    }
  }
  return undefined;
};

// --- Context ---

interface KanbanContextValue<T> {
  id: string;
  items: Record<UniqueIdentifier, T[]>;
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  orientation: "horizontal" | "vertical";
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  getItemValue: (item: T) => UniqueIdentifier;
  flatCursor: boolean;
}

const KanbanContext = React.createContext<KanbanContextValue<unknown> | null>(null);

function useKanbanContext(name: string) {
  const ctx = React.useContext(KanbanContext);
  if (!ctx) throw new Error(`\`${name}\` must be used within \`Kanban\``);
  return ctx;
}

// --- Root ---

interface GetItemValue<T> {
  getItemValue: (item: T) => UniqueIdentifier;
}

type KanbanProps<T> = Omit<DndContextProps, "collisionDetection"> &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: Record<UniqueIdentifier, T[]>;
    onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
    onMove?: (event: DragEndEvent & { activeIndex: number; overIndex: number }) => void;
    strategy?: SortableContextProps["strategy"];
    orientation?: "horizontal" | "vertical";
    flatCursor?: boolean;
  };

function Kanban<T>(props: KanbanProps<T>) {
  const {
    value, onValueChange, modifiers,
    strategy = verticalListSortingStrategy,
    orientation = "horizontal",
    onMove, getItemValue: getItemValueProp,
    accessibility, flatCursor = false,
    ...kanbanProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const hasMovedRef = React.useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter }),
  );

  const getItemValue = React.useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error("`getItemValue` is required when using array of objects");
      }
      return getItemValueProp ? getItemValueProp(item) : (item as UniqueIdentifier);
    },
    [getItemValueProp],
  );

  const getColumn = React.useCallback(
    (id: UniqueIdentifier) => {
      if (id in value) return id;
      for (const [columnId, items] of Object.entries(value)) {
        if (items.some((item) => getItemValue(item) === id)) return columnId;
      }
      return null;
    },
    [value, getItemValue],
  );

  const collisionDetection: CollisionDetection = React.useCallback(
    (args) => {
      if (activeId && activeId in value) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) => c.id in value),
        });
      }
      const pointerIntersections = pointerWithin(args);
      const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");
      if (!overId) {
        if (hasMovedRef.current) lastOverIdRef.current = activeId;
        return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : [];
      }
      if (overId in value) {
        const containerItems = value[overId];
        if (containerItems && containerItems.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (c) => c.id !== overId && containerItems.some((item) => getItemValue(item) === c.id),
            ),
          });
          if (closestItem.length > 0) overId = closestItem[0]?.id ?? overId;
        }
      }
      lastOverIdRef.current = overId;
      return [{ id: overId }];
    },
    [activeId, value, getItemValue],
  );

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      kanbanProps.onDragStart?.(event);
      if (event.activatorEvent.defaultPrevented) return;
      setActiveId(event.active.id);
    },
    [kanbanProps.onDragStart],
  );

  const onDragOver = React.useCallback(
    (event: DragOverEvent) => {
      kanbanProps.onDragOver?.(event);
      if (event.activatorEvent.defaultPrevented) return;
      const { active, over } = event;
      if (!over) return;
      const activeColumn = getColumn(active.id);
      const overColumn = getColumn(over.id);
      if (!activeColumn || !overColumn) return;

      if (activeColumn === overColumn) {
        const items = value[activeColumn];
        if (!items) return;
        const activeIndex = items.findIndex((item) => getItemValue(item) === active.id);
        const overIndex = items.findIndex((item) => getItemValue(item) === over.id);
        if (activeIndex !== overIndex) {
          const newColumns = { ...value };
          newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
          onValueChange?.(newColumns);
        }
      } else {
        const activeItems = value[activeColumn];
        const overItems = value[overColumn];
        if (!activeItems || !overItems) return;
        const activeIndex = activeItems.findIndex((item) => getItemValue(item) === active.id);
        if (activeIndex === -1) return;
        const activeItem = activeItems[activeIndex];
        if (!activeItem) return;
        const updatedItems = {
          ...value,
          [activeColumn]: activeItems.filter((item) => getItemValue(item) !== active.id),
          [overColumn]: [...overItems, activeItem],
        };
        onValueChange?.(updatedItems);
        hasMovedRef.current = true;
      }
    },
    [value, getColumn, getItemValue, onValueChange, kanbanProps.onDragOver],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      kanbanProps.onDragEnd?.(event);
      if (event.activatorEvent.defaultPrevented) return;
      const { active, over } = event;
      if (!over) { setActiveId(null); return; }

      if (active.id in value && over.id in value) {
        const activeIndex = Object.keys(value).indexOf(active.id as string);
        const overIndex = Object.keys(value).indexOf(over.id as string);
        if (activeIndex !== overIndex) {
          const orderedColumns = Object.keys(value);
          const newOrder = arrayMove(orderedColumns, activeIndex, overIndex);
          const newColumns: Record<UniqueIdentifier, T[]> = {};
          for (const key of newOrder) {
            const items = value[key];
            if (items) newColumns[key] = items;
          }
          if (onMove) onMove({ ...event, activeIndex, overIndex });
          else onValueChange?.(newColumns);
        }
      } else {
        const activeColumn = getColumn(active.id);
        const overColumn = getColumn(over.id);
        if (!activeColumn || !overColumn) { setActiveId(null); return; }
        if (activeColumn === overColumn) {
          const items = value[activeColumn];
          if (!items) { setActiveId(null); return; }
          const activeIndex = items.findIndex((item) => getItemValue(item) === active.id);
          const overIndex = items.findIndex((item) => getItemValue(item) === over.id);
          if (activeIndex !== overIndex) {
            const newColumns = { ...value };
            newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
            if (onMove) onMove({ ...event, activeIndex, overIndex });
            else onValueChange?.(newColumns);
          }
        }
      }
      setActiveId(null);
      hasMovedRef.current = false;
    },
    [value, getColumn, getItemValue, onValueChange, onMove, kanbanProps.onDragEnd],
  );

  const onDragCancel = React.useCallback(
    (event: DragCancelEvent) => {
      kanbanProps.onDragCancel?.(event);
      if (event.activatorEvent.defaultPrevented) return;
      setActiveId(null);
      hasMovedRef.current = false;
    },
    [kanbanProps.onDragCancel],
  );

  const announcements: Announcements = React.useMemo(() => ({
    onDragStart({ active }) {
      const isColumn = active.id in value;
      return `Picked up ${isColumn ? "column" : "item"}`;
    },
    onDragOver({ active, over }) {
      if (!over) return;
      return `Item moved`;
    },
    onDragEnd({ active, over }) {
      if (!over) return;
      return `Item dropped`;
    },
    onDragCancel() {
      return `Dragging cancelled`;
    },
  }), [value]);

  const contextValue = React.useMemo<KanbanContextValue<T>>(
    () => ({ id, items: value, modifiers, strategy, orientation, activeId, setActiveId, getItemValue, flatCursor }),
    [id, value, activeId, modifiers, strategy, orientation, getItemValue, flatCursor],
  );

  return (
    <KanbanContext.Provider value={contextValue as KanbanContextValue<unknown>}>
      <DndContext
        collisionDetection={collisionDetection}
        modifiers={modifiers}
        sensors={sensors}
        {...kanbanProps}
        id={id}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: "Press space or enter to pick up. Use arrow keys to move. Press space or enter to drop, or escape to cancel.",
          },
          ...accessibility,
        }}
      />
    </KanbanContext.Provider>
  );
}

// --- Board ---

const KanbanBoardContext = React.createContext<boolean>(false);

interface KanbanBoardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

function KanbanBoard({ className, ref, children, ...props }: KanbanBoardProps) {
  const context = useKanbanContext("KanbanBoard");
  const columns = React.useMemo(() => Object.keys(context.items), [context.items]);

  return (
    <KanbanBoardContext.Provider value={true}>
      <SortableContext
        items={columns}
        strategy={context.orientation === "horizontal" ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        <div
          data-slot="kanban-board"
          {...props}
          ref={ref}
          className={cn(
            "flex size-full gap-3",
            context.orientation === "horizontal" ? "flex-row" : "flex-col",
            className,
          )}
        >
          {children}
        </div>
      </SortableContext>
    </KanbanBoardContext.Provider>
  );
}

// --- Column ---

interface KanbanColumnContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanColumnContext = React.createContext<KanbanColumnContextValue | null>(null);

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

interface KanbanColumnProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  children: React.ReactNode;
  disabled?: boolean;
}

function KanbanColumn({ value, disabled, className, style, ref, children, ...props }: KanbanColumnProps) {
  const id = React.useId();
  const context = useKanbanContext("KanbanColumn");

  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: value, disabled, animateLayoutChanges });

  const composedRef = useComposedRefs(ref, (node: HTMLElement | null) => {
    if (!disabled) setNodeRef(node);
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  }), [transform, transition, style]);

  const items = React.useMemo(() => {
    const items = context.items[value] ?? [];
    return items.map((item) => context.getItemValue(item));
  }, [context.items, value, context.getItemValue]);

  const columnContext = React.useMemo<KanbanColumnContextValue>(
    () => ({ id, attributes, listeners, setActivatorNodeRef, isDragging, disabled }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
  );

  return (
    <KanbanColumnContext.Provider value={columnContext}>
      <SortableContext items={items} strategy={context.strategy}>
        <div
          id={id}
          data-slot="kanban-column"
          data-dragging={isDragging ? "" : undefined}
          {...props}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "flex flex-col gap-1.5 rounded-[var(--radius-lg)]",
            isDragging && "opacity-50",
            disabled && "pointer-events-none opacity-50",
            className,
          )}
        >
          {children}
        </div>
      </SortableContext>
    </KanbanColumnContext.Provider>
  );
}

// --- Item ---

interface KanbanItemContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue | null>(null);

interface KanbanItemProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  asHandle?: boolean;
  disabled?: boolean;
}

function KanbanItem({ value, style, asHandle, disabled, className, ref, children, ...props }: KanbanItemProps) {
  const id = React.useId();
  const context = useKanbanContext("KanbanItem");

  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: value, disabled });

  const composedRef = useComposedRefs(ref, (node: HTMLElement | null) => {
    if (!disabled) setNodeRef(node);
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  }), [transform, transition, style]);

  const itemContext = React.useMemo<KanbanItemContextValue>(
    () => ({ id, attributes, listeners, setActivatorNodeRef, isDragging, disabled }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
  );

  return (
    <KanbanItemContext.Provider value={itemContext}>
      <div
        id={id}
        data-slot="kanban-item"
        data-dragging={isDragging ? "" : undefined}
        {...props}
        {...(asHandle && !disabled ? attributes : {})}
        {...(asHandle && !disabled ? listeners : {})}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]",
          asHandle && "touch-none select-none",
          !isDragging && asHandle && !context.flatCursor && "cursor-grab",
          isDragging && "opacity-50",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        {children}
      </div>
    </KanbanItemContext.Provider>
  );
}

// --- Item Handle ---

function useKanbanItemContext(name: string) {
  const ctx = React.useContext(KanbanItemContext);
  if (!ctx) throw new Error(`\`${name}\` must be used within \`KanbanItem\``);
  return ctx;
}

interface KanbanItemHandleProps extends React.ComponentProps<"button"> {}

function KanbanItemHandle({ disabled, className, ref, ...props }: KanbanItemHandleProps) {
  const context = useKanbanContext("KanbanItemHandle");
  const itemContext = useKanbanItemContext("KanbanItemHandle");
  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(ref, (node: HTMLElement | null) => {
    if (!isDisabled) itemContext.setActivatorNodeRef(node);
  });

  return (
    <button
      type="button"
      aria-controls={itemContext.id}
      data-dragging={itemContext.isDragging ? "" : undefined}
      {...props}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      className={cn(
        "select-none",
        context.flatCursor ? "cursor-default" : "cursor-grab data-[dragging]:cursor-grabbing",
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

// --- Overlay ---

const KanbanOverlayContext = React.createContext(false);

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

interface KanbanOverlayProps extends Omit<React.ComponentProps<typeof DragOverlay>, "children"> {
  children?: React.ReactNode | ((params: { value: UniqueIdentifier; variant: "column" | "item" }) => React.ReactNode);
}

function KanbanOverlay({ children, ...props }: KanbanOverlayProps) {
  const context = useKanbanContext("KanbanOverlay");
  const [mounted, setMounted] = React.useState(false);
  React.useLayoutEffect(() => setMounted(true), []);

  const container = mounted ? globalThis.document?.body : null;
  if (!container) return null;

  const variant = context.activeId && context.activeId in context.items ? "column" : "item";

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...props}
    >
      <KanbanOverlayContext.Provider value={true}>
        {context.activeId && children
          ? typeof children === "function"
            ? children({ value: context.activeId, variant })
            : children
          : null}
      </KanbanOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

export {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanProps,
};
