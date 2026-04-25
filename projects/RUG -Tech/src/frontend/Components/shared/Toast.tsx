'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Toast as ToastType } from '@/context/ToastContext'

export interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    stripColor: 'rgb(45, 212, 191)', // teal-400
    iconColor: 'text-teal-400',
  },
  error: {
    icon: AlertCircle,
    stripColor: 'var(--sev-critical)',
    iconColor: 'text-[var(--sev-critical)]',
  },
  warning: {
    icon: AlertTriangle,
    stripColor: 'var(--sev-high)',
    iconColor: 'text-[var(--sev-high)]',
  },
  info: {
    icon: Info,
    stripColor: 'var(--accent)',
    iconColor: 'text-[var(--accent)]',
  },
}

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const config = typeConfig[toast.type]
  const Icon = config.icon
  const duration = toast.duration ?? 4000
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'w-[360px] overflow-hidden rounded-[4px]',
        'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
        'shadow-2xl',
      )}
    >
      <div className="flex">
        {/* Left color strip */}
        <div
          className="w-1 shrink-0"
          style={{ backgroundColor: config.stripColor }}
        />

        {/* Content */}
        <div className="flex-1 px-3 py-3">
          <div className="flex items-start gap-2.5">
            <Icon size={16} className={cn(config.iconColor, 'shrink-0 mt-0.5')} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="text-xs text-[var(--accent)] font-medium mt-1.5 hover:underline cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--bg-surface)]">
        <div
          className="h-full transition-none"
          style={{
            width: `${progress}%`,
            backgroundColor: config.stripColor,
            opacity: 0.5,
          }}
        />
      </div>
    </motion.div>
  )
}
