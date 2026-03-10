import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface-2)] skeleton-shimmer",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-5 space-y-3 relative">
      {/* Left accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[var(--color-surface-4)]" />
      <div className="flex items-center justify-between pl-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="w-8 h-8" />
      </div>
      <Skeleton className="h-3 w-20 ml-2" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3 -mt-[2px] first:mt-0">
      <Skeleton className="w-[10px] h-[10px]" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-4 h-4" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-[3px] w-12 bg-[var(--color-green-muted)]" />
      </div>
      {/* Stat cards — stacked */}
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="-ml-[2px] first:ml-0 -mt-[2px] first:mt-0 sm:mt-0">
            <StatSkeleton />
          </div>
        ))}
      </div>
      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 -mt-[2px]">
        <div className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-[3px] h-5 bg-[var(--color-green-muted)]" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-[12px] w-full" />
        </div>
        <div className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-5 space-y-3 -ml-[2px]">
          <div className="flex items-center gap-2">
            <Skeleton className="w-[3px] h-5 bg-[var(--color-green-muted)]" />
            <Skeleton className="h-4 w-32" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 -mt-[2px] first:mt-0 border-2 border-[var(--color-border-strong)] p-3">
              <Skeleton className="w-12 h-12" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-2 border-[var(--color-border-strong)] -ml-[2px] first:ml-0">
            {/* Column header */}
            <div className="p-3 border-b-2 border-[var(--color-border-strong)] flex items-center gap-2">
              <Skeleton className="w-[10px] h-[10px]" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-5 ml-auto" />
            </div>
            {/* Cards */}
            <div className="p-2 space-y-0">
              {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
                <div key={j} className="border-2 border-[var(--color-border-strong)] p-3 -mt-[2px] first:mt-0 space-y-2">
                  <Skeleton className="h-[3px] w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex gap-0">
          <Skeleton className="h-9 w-9 border-2 border-[var(--color-border-strong)]" />
          <Skeleton className="h-9 w-24 border-2 border-[var(--color-border-strong)] -ml-[2px]" />
          <Skeleton className="h-9 w-9 border-2 border-[var(--color-border-strong)] -ml-[2px]" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 border-2 border-[var(--color-border-strong)]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`h${i}`} className="p-2 border-b-2 border-[var(--color-border-strong)] flex justify-center">
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-20 border border-[var(--color-border)] p-1.5">
            <Skeleton className="h-3 w-5 mb-1" />
            {i % 7 === 2 && <Skeleton className="h-2.5 w-full bg-[var(--color-green-subtle)]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LibrarySkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-0">
        <Skeleton className="h-9 flex-1 border-2 border-[var(--color-border-strong)]" />
        <Skeleton className="h-9 w-24 border-2 border-[var(--color-border-strong)] -ml-[2px]" />
        <Skeleton className="h-9 w-20 border-2 border-[var(--color-border-strong)] -ml-[2px]" />
      </div>
      {/* Folders */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Skeleton className="w-[3px] h-4 bg-[var(--color-green-muted)]" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3 -ml-[2px] first:ml-0">
              <Skeleton className="w-10 h-10" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Videos */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Skeleton className="w-[3px] h-4 bg-[var(--color-green-muted)]" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] overflow-hidden -ml-[2px] first:ml-0 -mt-[2px] [&:nth-child(-n+3)]:mt-0">
              <Skeleton className="aspect-video w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClientsSkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-5 space-y-3 -ml-[2px] first:ml-0 -mt-[2px] [&:nth-child(-n+3)]:mt-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="border-t-2 border-[var(--color-border-strong)] pt-2">
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-full border-2 border-[var(--color-border-strong)]" />
      <div className="space-y-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3 -mt-[2px] first:mt-0">
            <Skeleton className="w-9 h-9" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16 border border-[var(--color-border-strong)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IdeasListSkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-0">
        <Skeleton className="h-9 flex-1 border-2 border-[var(--color-border-strong)]" />
        <Skeleton className="h-9 w-28 border-2 border-[var(--color-border-strong)] -ml-[2px]" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => <ListItemSkeleton key={i} />)}
      </div>
    </div>
  );
}
