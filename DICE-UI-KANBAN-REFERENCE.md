# Dice UI Kanban — Referenz für Implementierung

DIESE DATEI ENTHÄLT DEN EXAKTEN CODE VON https://www.diceui.com/docs/components/radix/kanban
KOPIERE DIESEN CODE 1:1. NICHT UMSCHREIBEN. NICHT "ANPASSEN". NICHT "NACHBAUEN".

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @dnd-kit/utilities @radix-ui/react-slot
```

Oder via shadcn CLI:
```bash
npx shadcn@latest add @diceui/kanban
```

## 1. lib/compose-refs.ts

```ts
/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/compose-refs.tsx
 */

import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });

    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to memoize by all values
  return React.useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
```

## 2. components/ui/kanban.tsx — DER KOMPLETTE KOMPONENTEN-CODE

```tsx
"use client";

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
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const coordinateGetter: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, droppableRects, droppableContainers, collisionRect } =
    context;

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
          if (active.data.current?.type !== "container") {
            return;
          }
        }
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left + collisionRect.width <= rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    }

    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
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
          return {
            x: newRect.left + 20,
            y: newRect.top + 74,
          };
        }

        return {
          x: newRect.left,
          y: newRect.top,
        };
      }
    }
  }

  return undefined;
};

const ROOT_NAME = "Kanban";
const BOARD_NAME = "KanbanBoard";
const COLUMN_NAME = "KanbanColumn";
const COLUMN_HANDLE_NAME = "KanbanColumnHandle";
const ITEM_NAME = "KanbanItem";
const ITEM_HANDLE_NAME = "KanbanItemHandle";
const OVERLAY_NAME = "KanbanOverlay";

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

const KanbanContext = React.createContext<KanbanContextValue<unknown> | null>(
  null,
);

function useKanbanContext(consumerName: string) {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface GetItemValue<T> {
  getItemValue: (item: T) => UniqueIdentifier;
}

type KanbanProps<T> = Omit<DndContextProps, "collisionDetection"> &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: Record<UniqueIdentifier, T[]>;
    onValueChange?: (columns: Record<UniqueIdentifier, T[]>) => void;
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number },
    ) => void;
    strategy?: SortableContextProps["strategy"];
    orientation?: "horizontal" | "vertical";
    flatCursor?: boolean;
  };

function Kanban<T>(props: KanbanProps<T>) {
  const {
    value,
    onValueChange,
    modifiers,
    strategy = verticalListSortingStrategy,
    orientation = "horizontal",
    onMove,
    getItemValue: getItemValueProp,
    accessibility,
    flatCursor = false,
    ...kanbanProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const lastOverIdRef = React.useRef<UniqueIdentifier | null>(null);
  const hasMovedRef = React.useRef(false);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const getItemValue = React.useCallback(
    (item: T): UniqueIdentifier => {
      if (typeof item === "object" && !getItemValueProp) {
        throw new Error(
          "`getItemValue` is required when using array of objects",
        );
      }
      return getItemValueProp
        ? getItemValueProp(item)
        : (item as UniqueIdentifier);
    },
    [getItemValueProp],
  );

  const getColumn = React.useCallback(
    (id: UniqueIdentifier) => {
      if (id in value) return id;

      for (const [columnId, items] of Object.entries(value)) {
        if (items.some((item) => getItemValue(item) === id)) {
          return columnId;
        }
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
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in value,
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (!overId) {
        if (hasMovedRef.current) {
          lastOverIdRef.current = activeId;
        }
        return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : [];
      }

      if (overId in value) {
        const containerItems = value[overId];
        if (containerItems && containerItems.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                containerItems.some(
                  (item) => getItemValue(item) === container.id,
                ),
            ),
          });

          if (closestItem.length > 0) {
            overId = closestItem[0]?.id ?? overId;
          }
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

        const activeIndex = items.findIndex(
          (item) => getItemValue(item) === active.id,
        );
        const overIndex = items.findIndex(
          (item) => getItemValue(item) === over.id,
        );

        if (activeIndex !== overIndex) {
          const newColumns = { ...value };
          newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
          onValueChange?.(newColumns);
        }
      } else {
        const activeItems = value[activeColumn];
        const overItems = value[overColumn];

        if (!activeItems || !overItems) return;

        const activeIndex = activeItems.findIndex(
          (item) => getItemValue(item) === active.id,
        );

        if (activeIndex === -1) return;

        const activeItem = activeItems[activeIndex];
        if (!activeItem) return;

        const updatedItems = {
          ...value,
          [activeColumn]: activeItems.filter(
            (item) => getItemValue(item) !== active.id,
          ),
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

      if (!over) {
        setActiveId(null);
        return;
      }

      if (active.id in value && over.id in value) {
        const activeIndex = Object.keys(value).indexOf(active.id as string);
        const overIndex = Object.keys(value).indexOf(over.id as string);

        if (activeIndex !== overIndex) {
          const orderedColumns = Object.keys(value);
          const newOrder = arrayMove(orderedColumns, activeIndex, overIndex);

          const newColumns: Record<UniqueIdentifier, T[]> = {};
          for (const key of newOrder) {
            const items = value[key];
            if (items) {
              newColumns[key] = items;
            }
          }

          if (onMove) {
            onMove({ ...event, activeIndex, overIndex });
          } else {
            onValueChange?.(newColumns);
          }
        }
      } else {
        const activeColumn = getColumn(active.id);
        const overColumn = getColumn(over.id);

        if (!activeColumn || !overColumn) {
          setActiveId(null);
          return;
        }

        if (activeColumn === overColumn) {
          const items = value[activeColumn];
          if (!items) {
            setActiveId(null);
            return;
          }

          const activeIndex = items.findIndex(
            (item) => getItemValue(item) === active.id,
          );
          const overIndex = items.findIndex(
            (item) => getItemValue(item) === over.id,
          );

          if (activeIndex !== overIndex) {
            const newColumns = { ...value };
            newColumns[activeColumn] = arrayMove(items, activeIndex, overIndex);
            if (onMove) {
              onMove({
                ...event,
                activeIndex,
                overIndex,
              });
            } else {
              onValueChange?.(newColumns);
            }
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

  const announcements: Announcements = React.useMemo(
    () => ({
      onDragStart({ active }) {
        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(active.id as string) + 1
          : (() => {
              const column = getColumn(active.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === active.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(active.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        return `Picked up ${itemType} at position ${position} of ${total}`;
      },
      onDragOver({ active, over }) {
        if (!over) return;

        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        const overColumn = getColumn(over.id);
        const activeColumn = getColumn(active.id);

        if (isColumn) {
          return `${itemType} is now at position ${position} of ${total}`;
        }

        if (activeColumn !== overColumn) {
          return `${itemType} is now at position ${position} of ${total} in ${overColumn}`;
        }

        return `${itemType} is now at position ${position} of ${total}`;
      },
      onDragEnd({ active, over }) {
        if (!over) return;

        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        const position = isColumn
          ? Object.keys(value).indexOf(over.id as string) + 1
          : (() => {
              const column = getColumn(over.id);
              if (!column || !value[column]) return 1;
              return (
                value[column].findIndex(
                  (item) => getItemValue(item) === over.id,
                ) + 1
              );
            })();
        const total = isColumn
          ? Object.keys(value).length
          : (() => {
              const column = getColumn(over.id);
              return column ? (value[column]?.length ?? 0) : 0;
            })();

        const overColumn = getColumn(over.id);
        const activeColumn = getColumn(active.id);

        if (isColumn) {
          return `${itemType} was dropped at position ${position} of ${total}`;
        }

        if (activeColumn !== overColumn) {
          return `${itemType} was dropped at position ${position} of ${total} in ${overColumn}`;
        }

        return `${itemType} was dropped at position ${position} of ${total}`;
      },
      onDragCancel({ active }) {
        const isColumn = active.id in value;
        const itemType = isColumn ? "column" : "item";
        return `Dragging was cancelled. ${itemType} was dropped.`;
      },
    }),
    [value, getColumn, getItemValue],
  );

  const contextValue = React.useMemo<KanbanContextValue<T>>(
    () => ({
      id,
      items: value,
      modifiers,
      strategy,
      orientation,
      activeId,
      setActiveId,
      getItemValue,
      flatCursor,
    }),
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
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: `
            To pick up a kanban item or column, press space or enter.
            While dragging, use the arrow keys to move the item.
            Press space or enter again to drop the item in its new position, or press escape to cancel.
            `,
          },
          ...accessibility,
        }}
      />
    </KanbanContext.Provider>
  );
}

const KanbanBoardContext = React.createContext<boolean>(false);

interface KanbanBoardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  asChild?: boolean;
}

function KanbanBoard(props: KanbanBoardProps) {
  const { asChild, className, ref, ...boardProps } = props;

  const context = useKanbanContext(BOARD_NAME);

  const columns = React.useMemo(() => {
    return Object.keys(context.items);
  }, [context.items]);

  const BoardPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <KanbanBoardContext.Provider value={true}>
      <SortableContext
        items={columns}
        strategy={
          context.orientation === "horizontal"
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy
        }
      >
        <BoardPrimitive
          aria-orientation={context.orientation}
          data-orientation={context.orientation}
          data-slot="kanban-board"
          {...boardProps}
          ref={ref}
          className={cn(
            "flex size-full gap-4",
            context.orientation === "horizontal" ? "flex-row" : "flex-col",
            className,
          )}
        />
      </SortableContext>
    </KanbanBoardContext.Provider>
  );
}

interface KanbanColumnContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanColumnContext =
  React.createContext<KanbanColumnContextValue | null>(null);

function useKanbanColumnContext(consumerName: string) {
  const context = React.useContext(KanbanColumnContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${COLUMN_NAME}\``,
    );
  }
  return context;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

interface KanbanColumnProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  children: React.ReactNode;
  asChild?: boolean;
  asHandle?: boolean;
  disabled?: boolean;
}

function KanbanColumn(props: KanbanColumnProps) {
  const {
    value,
    asChild,
    asHandle,
    disabled,
    className,
    style,
    ref,
    ...columnProps
  } = props;

  const id = React.useId();
  const context = useKanbanContext(COLUMN_NAME);
  const inBoard = React.useContext(KanbanBoardContext);
  const inOverlay = React.useContext(KanbanOverlayContext);

  if (!inBoard && !inOverlay) {
    throw new Error(
      `\`${COLUMN_NAME}\` must be used within \`${BOARD_NAME}\` or \`${OVERLAY_NAME}\``,
    );
  }

  if (value === "") {
    throw new Error(`\`${COLUMN_NAME}\` value cannot be an empty string`);
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: value,
    disabled,
    animateLayoutChanges,
  });

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return;
    setNodeRef(node);
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style,
    };
  }, [transform, transition, style]);

  const items = React.useMemo(() => {
    const items = context.items[value] ?? [];
    return items.map((item) => context.getItemValue(item));
  }, [context.items, value, context.getItemValue]);

  const columnContext = React.useMemo<KanbanColumnContextValue>(
    () => ({
      id,
      attributes,
      listeners,
      setActivatorNodeRef,
      isDragging,
      disabled,
    }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
  );

  const ColumnPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <KanbanColumnContext.Provider value={columnContext}>
      <SortableContext
        items={items}
        strategy={
          context.orientation === "horizontal"
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy
        }
      >
        <ColumnPrimitive
          id={id}
          data-disabled={disabled}
          data-dragging={isDragging ? "" : undefined}
          data-slot="kanban-column"
          {...columnProps}
          {...(asHandle && !disabled ? attributes : {})}
          {...(asHandle && !disabled ? listeners : {})}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            "flex size-full flex-col gap-2 rounded-lg border bg-zinc-100 p-2.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-zinc-900",
            {
              "touch-none select-none": asHandle,
              "cursor-default": context.flatCursor,
              "data-dragging:cursor-grabbing": !context.flatCursor,
              "cursor-grab": !isDragging && asHandle && !context.flatCursor,
              "opacity-50": isDragging,
              "pointer-events-none opacity-50": disabled,
            },
            className,
          )}
        />
      </SortableContext>
    </KanbanColumnContext.Provider>
  );
}

interface KanbanColumnHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KanbanColumnHandle(props: KanbanColumnHandleProps) {
  const { asChild, disabled, className, ref, ...columnHandleProps } = props;

  const context = useKanbanContext(COLUMN_NAME);
  const columnContext = useKanbanColumnContext(COLUMN_HANDLE_NAME);

  const isDisabled = disabled ?? columnContext.disabled;

  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return;
    columnContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={columnContext.id}
      data-disabled={isDisabled}
      data-dragging={columnContext.isDragging ? "" : undefined}
      data-slot="kanban-column-handle"
      {...columnHandleProps}
      {...(isDisabled ? {} : columnContext.attributes)}
      {...(isDisabled ? {} : columnContext.listeners)}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

interface KanbanItemContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

const KanbanItemContext = React.createContext<KanbanItemContextValue | null>(
  null,
);

function useKanbanItemContext(consumerName: string) {
  const context = React.useContext(KanbanItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface KanbanItemProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  asHandle?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

function KanbanItem(props: KanbanItemProps) {
  const {
    value,
    style,
    asHandle,
    asChild,
    disabled,
    className,
    ref,
    ...itemProps
  } = props;

  const id = React.useId();
  const context = useKanbanContext(ITEM_NAME);
  const inBoard = React.useContext(KanbanBoardContext);
  const inOverlay = React.useContext(KanbanOverlayContext);

  if (!inBoard && !inOverlay) {
    throw new Error(`\`${ITEM_NAME}\` must be used within \`${BOARD_NAME}\``);
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value, disabled });

  if (value === "") {
    throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`);
  }

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return;
    setNodeRef(node);
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      transform: CSS.Transform.toString(transform),
      transition,
      ...style,
    };
  }, [transform, transition, style]);

  const itemContext = React.useMemo<KanbanItemContextValue>(
    () => ({
      id,
      attributes,
      listeners,
      setActivatorNodeRef,
      isDragging,
      disabled,
    }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging, disabled],
  );

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <KanbanItemContext.Provider value={itemContext}>
      <ItemPrimitive
        id={id}
        data-disabled={disabled}
        data-dragging={isDragging ? "" : undefined}
        data-slot="kanban-item"
        {...itemProps}
        {...(asHandle && !disabled ? attributes : {})}
        {...(asHandle && !disabled ? listeners : {})}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          {
            "touch-none select-none": asHandle,
            "cursor-default": context.flatCursor,
            "data-dragging:cursor-grabbing": !context.flatCursor,
            "cursor-grab": !isDragging && asHandle && !context.flatCursor,
            "opacity-50": isDragging,
            "pointer-events-none opacity-50": disabled,
          },
          className,
        )}
      />
    </KanbanItemContext.Provider>
  );
}

interface KanbanItemHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function KanbanItemHandle(props: KanbanItemHandleProps) {
  const { asChild, disabled, className, ref, ...itemHandleProps } = props;

  const context = useKanbanContext(ITEM_HANDLE_NAME);
  const itemContext = useKanbanItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(ref, (node) => {
    if (isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-disabled={isDisabled}
      data-dragging={itemContext.isDragging ? "" : undefined}
      data-slot="kanban-item-handle"
      {...itemHandleProps}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

const KanbanOverlayContext = React.createContext(false);

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface KanbanOverlayProps
  extends Omit<React.ComponentProps<typeof DragOverlay>, "children"> {
  container?: Element | DocumentFragment | null;
  children?:
    | React.ReactNode
    | ((params: {
        value: UniqueIdentifier;
        variant: "column" | "item";
      }) => React.ReactNode);
}

function KanbanOverlay(props: KanbanOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props;

  const context = useKanbanContext(OVERLAY_NAME);

  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => setMounted(true), []);

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  const variant =
    context.activeId && context.activeId in context.items ? "column" : "item";

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      <KanbanOverlayContext.Provider value={true}>
        {context.activeId && children
          ? typeof children === "function"
            ? children({
                value: context.activeId,
                variant,
              })
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
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanProps,
};
```

## 3. Demo-Code (KanbanDemo) — so wird die Komponente VERWENDET

```tsx
"use client";

import { GripVertical } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanOverlay,
} from "@/components/ui/kanban";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
}

const COLUMN_TITLES: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In Progress",
  done: "Done",
};

export function KanbanDemo() {
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    backlog: [
      { id: "1", title: "Add authentication", priority: "high", assignee: "John Doe", dueDate: "2024-04-01" },
      { id: "2", title: "Create API endpoints", priority: "medium", assignee: "Jane Smith", dueDate: "2024-04-05" },
      { id: "3", title: "Write documentation", priority: "low", assignee: "Bob Johnson", dueDate: "2024-04-10" },
    ],
    inProgress: [
      { id: "4", title: "Design system updates", priority: "high", assignee: "Alice Brown", dueDate: "2024-03-28" },
      { id: "5", title: "Implement dark mode", priority: "medium", assignee: "Charlie Wilson", dueDate: "2024-04-02" },
    ],
    done: [
      { id: "7", title: "Setup project", priority: "high", assignee: "Eve Davis", dueDate: "2024-03-25" },
      { id: "8", title: "Initial commit", priority: "low", assignee: "Frank White", dueDate: "2024-03-24" },
    ],
  });

  return (
    <Kanban
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
    >
      <KanbanBoard className="grid auto-rows-fr sm:grid-cols-3">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <KanbanColumn key={columnValue} value={columnValue}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {COLUMN_TITLES[columnValue]}
                </span>
                <Badge variant="secondary" className="pointer-events-none rounded-sm">
                  {tasks.length}
                </Badge>
              </div>
              <KanbanColumnHandle asChild>
                <Button variant="ghost" size="icon">
                  <GripVertical className="h-4 w-4" />
                </Button>
              </KanbanColumnHandle>
            </div>
            <div className="flex flex-col gap-2 p-0.5">
              {tasks.map((task) => (
                <KanbanItem key={task.id} value={task.id} asHandle asChild>
                  <div className="rounded-md border bg-card p-3 shadow-xs">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="line-clamp-1 font-medium text-sm">
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-xs">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <div className="size-2 rounded-full bg-primary/20" />
                            <span className="line-clamp-1">{task.assignee}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <time className="text-[10px] tabular-nums">
                            {task.dueDate}
                          </time>
                        )}
                      </div>
                    </div>
                  </div>
                </KanbanItem>
              ))}
            </div>
          </KanbanColumn>
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        <div className="size-full rounded-md bg-primary/10" />
      </KanbanOverlay>
    </Kanban>
  );
}
```

## WICHTIG für die Implementierung in AgentZ Studio:
- `KanbanItem` mit `asHandle asChild` = ganze Karte ist Drag-Handle (TOUCH FUNKTIONIERT!)
- Columns = unsere Status-Pipeline (Idee, Skript, Zur Freigabe, Korrektur, Freigegeben, Gedreht, Geschnitten, Veröffentlicht)
- `onValueChange` = Status-Update via Convex Mutation
- `getItemValue` = `(item) => item._id`
- Dependency: `radix-ui` package (für `Slot`). Falls nicht installiert: `npm install radix-ui`
