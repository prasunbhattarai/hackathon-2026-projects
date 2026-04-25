'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

/* ---------- Variant Styles ---------- */

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
  elevated:
    'bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[4px]',
  interactive: [
    'bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[4px]',
    'cursor-pointer select-none',
    'transition-all duration-150',
    'hover:border-[var(--accent)]/30 hover:scale-[1.001]',
  ].join(' '),
  flush: '',
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/* ---------- Card ---------- */

export interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive' | 'flush'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', className, children, onClick },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(variantStyles[variant], paddingStyles[padding], className)}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

/* ---------- Sub-components ---------- */

export interface CardSectionProps {
  className?: string
  children: React.ReactNode
}

export const CardHeader = ({ className, children }: CardSectionProps) => (
  <div
    className={cn(
      'px-4 py-3 border-b border-[var(--border)]',
      'flex items-center justify-between gap-3',
      className,
    )}
  >
    {children}
  </div>
)

export const CardContent = ({ className, children }: CardSectionProps) => (
  <div className={cn('px-4 py-4', className)}>{children}</div>
)

export const CardFooter = ({ className, children }: CardSectionProps) => (
  <div
    className={cn(
      'px-4 py-3 border-t border-[var(--border)]',
      'flex items-center justify-end gap-2',
      className,
    )}
  >
    {children}
  </div>
)
