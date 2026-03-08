import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] bg-[var(--color-surface-2)] animate-pulse",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-[10px]" />
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
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-5 space-y-2">
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3">
      <Skeleton className="w-2 h-2 rounded-full" />
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
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-32" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-32 w-full rounded-[var(--radius-lg)]" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <div className="space-y-2">
              {Array.from({ length: 3 - (i % 2) }).map((_, j) => <CardSkeleton key={j} />)}
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
        <Skeleton className="h-7 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`h${i}`} className="h-4 w-8 mx-auto" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[var(--radius-md)]" />
        ))}
      </div>
    </div>
  );
}

export function LibrarySkeleton() {
  return (
    <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-2.5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-[10px]" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-2.5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] overflow-hidden">
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
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
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
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] p-4 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
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
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 6 }).map((_, i) => <ListItemSkeleton key={i} />)}
      </div>
    </div>
  );
}
