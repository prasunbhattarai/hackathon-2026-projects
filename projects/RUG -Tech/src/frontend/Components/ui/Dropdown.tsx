'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useClickOutside } from '@/hooks/useClickOutside'

export interface DropdownItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  divider?: boolean
  disabled?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown = ({
  trigger,
  items,
  align = 'left',
  className,
}: DropdownProps) => {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])
  const containerRef = useClickOutside<HTMLDivElement>(close)

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      {/* Trigger */}
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              'absolute z-50 top-full mt-1',
              'min-w-48 py-1',
              'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
              'rounded-[4px] shadow-2xl',
              'overflow-hidden',
              align === 'right' ? 'right-0' : 'left-0',
            )}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {items.map((item, i) => (
              <div key={i}>
                {item.divider && (
                  <div className="my-1 h-px bg-[var(--border)]" />
                )}
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick()
                      close()
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full h-9 px-3 text-sm font-sans',
                    'flex items-center gap-2',
                    'transition-colors duration-100',
                    'outline-none text-left',
                    item.variant === 'danger'
                      ? [
                          'text-[var(--sev-critical)]',
                          'hover:bg-[var(--sev-critical)]/10',
                        ].join(' ')
                      : [
                          'text-[var(--text-primary)]',
                          'hover:bg-[var(--bg-subtle)]',
                        ].join(' '),
                    item.disabled && 'opacity-40 cursor-not-allowed',
                    !item.disabled && 'cursor-pointer',
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4 text-[var(--text-muted)]">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
