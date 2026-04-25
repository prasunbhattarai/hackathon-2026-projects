'use client'

import { Skeleton } from '@/Components/ui/Skeleton'

export const PatientListSkeleton = () => (
  <div className="flex flex-col gap-4">
    {/* Search bar */}
    <Skeleton className="h-9 w-full max-w-sm" />

    {/* Table */}
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex gap-3 pb-2 border-b border-[var(--border)]">
        {['w-8', 'w-36', 'w-24', 'w-16', 'w-20', 'w-24', 'w-16'].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w}`} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  </div>
)
