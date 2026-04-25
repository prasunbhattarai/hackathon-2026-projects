'use client'

import { Menu, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/Components/ui/Avatar'
import { useNotificationStore } from '@/store/notificationStore'
import { Badge } from '@/Components/ui/Badge'

import { ThemeToggle } from '@/Components/ui/ThemeToggle'

export interface MobileTopbarProps {
  onMenuClick: () => void
  className?: string
}

export const MobileTopbar = ({ onMenuClick, className }: MobileTopbarProps) => {
  const user = useAuthStore((s) => s.user)
  const unreadCount = useNotificationStore((s) =>
    s.notifications.filter((n) => !n.read).length,
  )

  return (
    <div
      className={cn(
        'h-14 px-4 flex items-center justify-between shrink-0',
        'bg-[var(--bg-surface)] border-b border-[var(--border)]',
        className,
      )}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <span className="font-display text-base text-[var(--text-primary)]">
        Fundus AI
      </span>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative p-2 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--sev-critical)]" />
          )}
        </button>
        <Avatar name={user?.fullName ?? 'User'} size="sm" role={user?.role} />
      </div>
    </div>
  )
}
