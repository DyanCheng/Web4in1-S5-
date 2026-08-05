import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type PageSkeletonVariant = "list" | "detail" | "form" | "dashboard"

type PageSkeletonProps = {
  variant?: PageSkeletonVariant
  className?: string
  /** When true, skip the top header bar (page already has Header mounted). */
  hideChrome?: boolean
}

function HeaderChrome() {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Skeleton className="h-10 w-28 sm:h-12 sm:w-36" />
        <div className="hidden items-center gap-4 md:flex">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="hidden h-9 w-24 rounded-full sm:block" />
        </div>
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-32" />
      <Skeleton className="mb-6 h-64 w-full rounded-2xl sm:h-80" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-12 sm:px-6">
      <Skeleton className="mx-auto h-12 w-40" />
      <Skeleton className="mx-auto h-6 w-56" />
      <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="mt-2 h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="hidden space-y-2 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const VARIANT_MAP = {
  list: ListSkeleton,
  detail: DetailSkeleton,
  form: FormSkeleton,
  dashboard: DashboardSkeleton,
} as const

export function PageSkeleton({
  variant = "list",
  className,
  hideChrome = false,
}: PageSkeletonProps) {
  const Content = VARIANT_MAP[variant]

  return (
    <div
      className={cn(
        "min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      {!hideChrome && <HeaderChrome />}
      <Content />
    </div>
  )
}

/** Compact inline skeleton for modal / panel loading regions. */
export function PanelSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}
