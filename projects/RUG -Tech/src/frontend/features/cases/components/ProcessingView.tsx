'use client'

import { Check, Loader2, Circle } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ProcessingStep {
  label: string
  status: 'pending' | 'active' | 'done'
}

export interface ProcessingViewProps {
  caseId: string | null
  steps: ProcessingStep[]
  isComplete: boolean
  className?: string
}

export const ProcessingView = ({
  caseId,
  steps,
  isComplete,
  className,
}: ProcessingViewProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-8 py-8', className)}>
      {/* Orbital ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2',
            isComplete
              ? 'border-teal-400/40'
              : 'border-[var(--accent)]/30 animate-pulse-ring',
          )}
        />
        {/* Spinning orbital */}
        {!isComplete && (
          <div className="absolute inset-[-4px] animate-orbital-spin">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
          </div>
        )}
        {/* Inner ring */}
        <div
          className={cn(
            'absolute inset-3 rounded-full border',
            isComplete
              ? 'border-teal-400/20'
              : 'border-[var(--accent)]/15',
          )}
        />
        {/* Center content */}
        <div className="text-center z-10">
          {isComplete ? (
            <Check size={28} className="text-teal-400 mx-auto" />
          ) : (
            <span className="font-mono text-lg text-[var(--accent)] font-medium">
              {caseId ? caseId.split('-').pop() : '...'}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className={cn(
          'text-sm font-medium',
          isComplete ? 'text-teal-400' : 'text-[var(--text-primary)]',
        )}>
          {isComplete
            ? 'Analysis complete!'
            : 'AI analysis in progress...'}
        </p>
        {!isComplete && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            This may take a few moments
          </p>
        )}
        {isComplete && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Redirecting to case details...
          </p>
        )}
      </div>

      {/* Step tracker */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === 'done' && (
              <Check size={16} className="text-teal-400 shrink-0" />
            )}
            {step.status === 'active' && (
              <Loader2 size={16} className="text-[var(--accent)] animate-spin shrink-0" />
            )}
            {step.status === 'pending' && (
              <Circle size={16} className="text-[var(--text-muted)] shrink-0" />
            )}
            <span
              className={cn(
                'text-sm',
                step.status === 'done' && 'text-[var(--text-secondary)]',
                step.status === 'active' && 'text-[var(--text-primary)] font-medium',
                step.status === 'pending' && 'text-[var(--text-muted)]',
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
