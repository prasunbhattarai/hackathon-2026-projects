'use client'

import { Skeleton } from '@/Components/ui/Skeleton'

export const CaseDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Header */}
    <div className="border-b border-[var(--border)] pb-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>

    {/* Two-panel layout */}
    <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
      {/* Left — Image placeholder */}
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border)]">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      {/* Right — Analysis */}
      <div className="flex flex-col gap-4">
        {/* Final decision */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4">
          <Skeleton className="h-3 w-24 mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-48 flex-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        {/* Severity gauge */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4">
          <Skeleton className="h-3 w-24 mb-4" />
          <div className="flex justify-center">
            <Skeleton className="h-28 w-48" />
          </div>
        </div>

        {/* Disease blocks */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  </div>
)
