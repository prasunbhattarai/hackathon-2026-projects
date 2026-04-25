'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

export interface BadgeProps {
  variant?:
    | 'default'
    | 'critical'
    | 'high'
    | 'medium'
    | 'low'
    | 'none'
    | 'info'
    | 'success'
    | 'outline'
  size?: 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  critical:
    'bg-[var(--sev-critical)]/15 text-[var(--sev-critical)] border border-[var(--sev-critical)]/30',
  high: 'bg-[var(--sev-high)]/15 text-[var(--sev-high)] border border-[var(--sev-high)]/30',
  medium:
    'bg-[var(--sev-medium)]/15 text-[var(--sev-medium)] border border-[var(--sev-medium)]/30',
  low: 'bg-[var(--sev-low)]/15 text-[var(--sev-low)] border border-[var(--sev-low)]/30',
  none: 'bg-[var(--sev-none)]/15 text-[var(--sev-none)]',
  info: 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30',
  success: 'bg-teal-400/15 text-teal-400',
  outline:
    'bg-transparent border border-[var(--border-strong)] text-[var(--text-secondary)]',
  default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
}

const dotColorMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  critical: 'bg-[var(--sev-critical)]',
  high: 'bg-[var(--sev-high)]',
  medium: 'bg-[var(--sev-medium)]',
  low: 'bg-[var(--sev-low)]',
  none: 'bg-[var(--sev-none)]',
  info: 'bg-[var(--accent)]',
  success: 'bg-teal-400',
  outline: 'bg-[var(--text-secondary)]',
  default: 'bg-[var(--text-secondary)]',
}

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export const Badge = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-condensed font-medium',
        'rounded-[4px] whitespace-nowrap',
        'uppercase tracking-[0.08em]',
        mounted && 'animate-scale-in',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColorMap[variant],
            variant === 'critical' && 'animate-pulse-glow',
          )}
        />
      )}
      {children}
    </span>
  )
}
