'use client'

import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'

export function AccessDenied({
  title = 'Access denied',
  subtitle = 'You do not have permission to view this page.',
  onBack,
  className,
}: {
  title?: string
  subtitle?: string
  onBack?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center gap-3',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-[6px] bg-[var(--sev-critical)]/10 flex items-center justify-center border border-[var(--sev-critical)]/25">
        <ShieldAlert size={22} className="text-[var(--sev-critical)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
      <p className="text-xs text-[var(--text-muted)] max-w-sm">{subtitle}</p>
      {onBack && (
        <Button variant="primary" size="sm" onClick={onBack} className="mt-2">
          Go back
        </Button>
      )}
    </div>
  )
}

