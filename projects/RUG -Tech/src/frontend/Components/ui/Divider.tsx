'use client'

import { cn } from '@/lib/cn'

export interface DividerProps {
  label?: string
  className?: string
}

export const Divider = ({ label, className }: DividerProps) => {
  if (label) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 my-4',
          className,
        )}
        role="separator"
      >
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] shrink-0">
          {label}
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
    )
  }

  return (
    <hr
      className={cn(
        'border-none h-px bg-[var(--border)] my-4',
        className,
      )}
    />
  )
}
