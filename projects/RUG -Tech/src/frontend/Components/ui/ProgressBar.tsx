'use client'

import { cn } from '@/lib/cn'
import { motion } from 'framer-motion'

export interface ProgressBarProps {
  value: number
  variant?: 'accent' | 'critical' | 'high' | 'medium' | 'low'
  label?: string
  showValue?: boolean
  animate?: boolean
  className?: string
}

const variantColors: Record<NonNullable<ProgressBarProps['variant']>, string> = {
  accent: 'bg-[var(--accent)]',
  critical: 'bg-[var(--sev-critical)]',
  high: 'bg-[var(--sev-high)]',
  medium: 'bg-[var(--sev-medium)]',
  low: 'bg-[var(--sev-low)]',
}

export const ProgressBar = ({
  value,
  variant = 'accent',
  label,
  showValue = false,
  animate = true,
  className,
}: ProgressBarProps) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      <div
        className="w-full h-1.5 bg-[var(--bg-elevated)] overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {animate ? (
          <motion.div
            className={cn('h-full', variantColors[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ) : (
          <div
            className={cn(
              'h-full transition-all duration-300',
              variantColors[variant],
            )}
            style={{ width: `${clampedValue}%` }}
          />
        )}
      </div>
    </div>
  )
}
