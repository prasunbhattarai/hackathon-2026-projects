'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useNotificationStore, type Notification } from '@/store/notificationStore'

/* ---------- Color map ---------- */

const typeColors: Record<Notification['type'], string> = {
  error: 'bg-[var(--sev-critical)]',
  success: 'bg-teal-400',
  warning: 'bg-[var(--sev-high)]',
  info: 'bg-[var(--accent)]',
}

/* ---------- Time formatter ---------- */

function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/* ---------- Component ---------- */

export const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAllRead, markRead } =
    useNotificationStore()

  const close = useCallback(() => setOpen(false), [])
  const panelRef = useClickOutside<HTMLDivElement>(close)

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative p-2 rounded-[4px]',
          'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          'hover:bg-[var(--bg-subtle)] transition-colors duration-150',
          'cursor-pointer',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--sev-critical)] animate-pulse-glow" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              'absolute right-0 top-full mt-2 z-50',
              'w-80 max-h-96',
              'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
              'rounded-[4px] shadow-2xl',
              'flex flex-col overflow-hidden',
            )}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-sans font-medium text-[var(--text-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent)] font-sans cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <Bell size={24} className="text-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)]">
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'w-full flex gap-3 px-4 py-3 text-left',
                      'transition-colors duration-100 cursor-pointer',
                      'hover:bg-[var(--bg-subtle)]',
                      !n.read && 'bg-[var(--bg-subtle)]/50',
                    )}
                  >
                    {/* Color bar */}
                    <div
                      className={cn(
                        'w-1 shrink-0 rounded-full self-stretch',
                        typeColors[n.type],
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-sans font-medium text-[var(--text-primary)] truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
