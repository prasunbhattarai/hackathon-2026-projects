'use client'

import { cn } from '@/lib/cn'
import { Spinner } from '@/Components/ui/Spinner'

export interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingOverlay = ({
  isLoading,
  message,
  fullScreen = false,
  className,
}: LoadingOverlayProps) => {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3',
        'bg-[var(--bg-base)]/80 backdrop-blur-sm z-40',
        fullScreen
          ? 'fixed inset-0'
          : 'absolute inset-0 rounded-[4px]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="accent" />
        {message && (
          <p className="text-sm text-[var(--text-muted)]">{message}</p>
        )}
      </div>
    </div>
  )
}
