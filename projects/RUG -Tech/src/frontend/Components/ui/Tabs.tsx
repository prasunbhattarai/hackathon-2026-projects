'use client'

import { cn } from '@/lib/cn'

export interface Tab {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pill'
  className?: string
}

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) => {
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1',
          'bg-[var(--bg-elevated)] rounded-[4px]',
          className,
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                'relative px-3 py-1.5 text-sm font-sans font-medium',
                'rounded-[3px] transition-all duration-150',
                'outline-none select-none',
                isActive
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                tab.disabled && 'opacity-30 cursor-not-allowed',
                !tab.disabled && !isActive && 'cursor-pointer',
              )}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center',
                      'min-w-[18px] h-[18px] px-1',
                      'text-[10px] font-condensed font-medium rounded-[3px]',
                      isActive
                        ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  /* Underline variant (default) */
  return (
    <div
      className={cn('flex items-center border-b border-[var(--border)]', className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-sans font-medium',
              'transition-colors duration-150',
              'outline-none select-none',
              '-mb-px', // overlap border
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              tab.disabled && 'opacity-30 cursor-not-allowed',
              !tab.disabled && !isActive && 'cursor-pointer',
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center',
                    'min-w-[18px] h-[18px] px-1',
                    'text-[10px] font-condensed font-medium rounded-[3px]',
                    isActive
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>

            {/* Active underline indicator */}
            {isActive && (
              <span
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-[2px]',
                  'bg-[var(--accent)]',
                  'transition-all duration-200',
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
