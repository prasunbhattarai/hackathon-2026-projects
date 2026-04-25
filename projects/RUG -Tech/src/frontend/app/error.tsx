'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/Components/ui/Button'
import { ROUTES } from '@/constants/routes'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, var(--sev-critical), transparent 50%), radial-gradient(ellipse at 70% 80%, var(--accent), transparent 50%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--sev-critical)]/10 flex items-center justify-center">
          <AlertTriangle size={40} className="text-[var(--sev-critical)]" />
        </div>

        <h1 className="font-display text-2xl text-[var(--text-primary)]">
          Something went wrong
        </h1>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {isDev
            ? error.message
            : 'An unexpected error occurred. Our team has been notified and is working on a fix.'}
        </p>

        {isDev && error.digest && (
          <p className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-[4px] border border-[var(--border)]">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<RotateCcw size={14} />}
            onClick={reset}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Home size={14} />}
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
