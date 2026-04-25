'use client'

import { Search, Command } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/Components/ui/Avatar'
import { Badge } from '@/Components/ui/Badge'
import { NotificationBell } from '@/Components/shared/NotificationBell'

export interface TopbarProps {
  title?: string
  className?: string
}

export const Topbar = ({ title, className }: TopbarProps) => {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      className={cn(
        'h-14 shrink-0 px-4 md:px-6',
        'bg-[var(--bg-surface)]/80 backdrop-blur-md',
        'border-b border-[var(--border)]',
        'flex items-center justify-between gap-4',
        'sticky top-0 z-30',
        className,
      )}
    >
      {/* Left — Page title */}
      <div className="flex items-center gap-3 min-w-0">
        {title && (
          <h2 className="text-sm font-sans font-medium text-[var(--text-primary)] truncate">
            {title}
          </h2>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search trigger (Cmd+K) */}
        <button
          className={cn(
            'h-8 px-3 flex items-center gap-2',
            'bg-[var(--bg-elevated)] border border-[var(--border)]',
            'rounded-[4px] text-[var(--text-muted)]',
            'hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]',
            'transition-colors duration-150 cursor-pointer',
          )}
          aria-label="Search"
        >
          <Search size={14} />
          <span className="text-xs font-sans hidden sm:inline">Search…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 text-[10px] font-mono text-[var(--text-muted)]">
            <Command size={10} />K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User */}
        <div className="flex items-center gap-2.5 ml-2 pl-2 border-l border-[var(--border)]">
          <Avatar name={user?.fullName ?? 'User'} size="sm" />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-sans text-[var(--text-primary)] leading-tight">
              {user?.fullName ?? 'User'}
            </span>
            <Badge variant="outline" size="sm" className="mt-0.5 w-fit">
              {user?.role?.replace('_', ' ') ?? 'Doctor'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
