'use client'

import { cn } from '@/lib/cn'

export interface LiveIndicatorProps {
  isLive: boolean
  label?: string
  className?: string
}

export const LiveIndicator = ({
  isLive,
  label,
  className,
}: LiveIndicatorProps) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            isLive ? 'bg-teal-400' : 'bg-[var(--text-muted)]',
          )}
        />
      </span>
      <span
        className={cn(
          'text-[10px] font-condensed font-medium uppercase tracking-wider',
          isLive ? 'text-teal-400' : 'text-[var(--text-muted)]',
        )}
      >
        {label ?? (isLive ? 'Live' : 'Paused')}
      </span>
    </div>
  )
}
