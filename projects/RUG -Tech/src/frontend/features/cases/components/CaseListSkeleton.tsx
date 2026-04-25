'use client'

import { Skeleton } from '@/Components/ui/Skeleton'
import { cn } from '@/lib/cn'

export function CaseListSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] border-l-4 border-l-[var(--border)]"
        >
          <Skeleton className="w-[60px] h-[60px] rounded-[4px] shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-20 hidden sm:block" />
          <Skeleton className="h-5 w-16 hidden md:block" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

