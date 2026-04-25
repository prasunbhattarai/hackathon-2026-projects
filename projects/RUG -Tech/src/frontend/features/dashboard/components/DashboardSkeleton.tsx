'use client'

import { Skeleton } from '@/Components/ui/Skeleton'

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4"
        >
          <Skeleton className="h-3 w-16 mb-3" />
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>

    {/* Table */}
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4">
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="flex flex-col gap-2">
        {/* Header row */}
        <div className="flex gap-3 pb-2 border-b border-[var(--border)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)
