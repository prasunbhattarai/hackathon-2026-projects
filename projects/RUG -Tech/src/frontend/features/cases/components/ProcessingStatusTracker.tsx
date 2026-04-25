'use client'

import { useMemo, useEffect, useState } from 'react'
import { Check, Loader2, Circle, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CaseStatus } from '@/types/case.types'

export interface ProcessingStep {
  label: string
  status: 'complete' | 'active' | 'pending' | 'failed'
  timeOffset?: string
}

export interface ProcessingStatusTrackerProps {
  caseId: string
  currentStatus: CaseStatus
  className?: string
}

const initialSteps: ProcessingStep[] = [
  { label: 'Image Uploaded', status: 'pending' },
  { label: 'Quality Assessment', status: 'pending' },
  { label: 'AI Model Inference', status: 'pending' },
  { label: 'Heatmap Generation', status: 'pending' },
  { label: 'RAG Justification', status: 'pending' },
  { label: 'Report Ready', status: 'pending' },
]

function getTimeLabel(index: number): string {
  const offsets = ['0s', '1.2s', '3.8s', '6.1s', '8.4s', '10.2s']
  return offsets[index] ?? ''
}

export const ProcessingStatusTracker = ({
  caseId,
  currentStatus,
  className,
}: ProcessingStatusTrackerProps) => {
  const [tick, setTick] = useState(0)

  // Simulate processing progression
  useEffect(() => {
    if (currentStatus !== CaseStatus.PROCESSING) return

    let step = 1
    const interval = setInterval(() => {
      setTick(step)
      step += 1
      if (step >= initialSteps.length) clearInterval(interval)
    }, 2000)

    return () => clearInterval(interval)
  }, [currentStatus])

  const steps = useMemo<ProcessingStep[]>(() => {
    if (
      currentStatus === CaseStatus.AWAITING_REVIEW ||
      currentStatus === CaseStatus.APPROVED
    ) {
      return initialSteps.map((s, i) => ({
        ...s,
        status: 'complete',
        timeOffset: getTimeLabel(i),
      }))
    }

    if (currentStatus !== CaseStatus.PROCESSING) return initialSteps

    return initialSteps.map((s, i) => {
      if (i === 0) return { ...s, status: 'complete', timeOffset: getTimeLabel(0) }
      if (i <= tick) return { ...s, status: 'complete', timeOffset: getTimeLabel(i) }
      if (i === tick + 1) return { ...s, status: 'active' }
      return { ...s, status: 'pending' }
    })
  }, [currentStatus, tick])

  const statusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return <Check size={14} className="text-[var(--success)]" strokeWidth={3} />
      case 'active':
        return <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
      case 'failed':
        return <X size={14} className="text-[var(--sev-critical)]" />
      default:
        return <Circle size={14} className="text-[var(--text-muted)]" />
    }
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
        Processing Progress
      </p>

      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={i} className="flex items-stretch gap-3">
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                  'border transition-all duration-300',
                  step.status === 'complete' && 'bg-[var(--success)]/10 border-[var(--success)]/30',
                  step.status === 'active' && 'bg-[var(--accent)]/10 border-[var(--accent)]/30 shadow-[0_0_8px_var(--accent)/20]',
                  step.status === 'failed' && 'bg-[var(--sev-critical)]/10 border-[var(--sev-critical)]/30',
                  step.status === 'pending' && 'bg-[var(--bg-elevated)] border-[var(--border)]',
                )}
              >
                {statusIcon(step.status)}
              </div>

              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="w-px flex-1 min-h-[20px] my-1">
                  <div
                    className={cn(
                      'w-full h-full transition-colors duration-500',
                      step.status === 'complete' ? 'bg-[var(--success)]/40' : 'bg-[var(--border)]',
                    )}
                  />
                </div>
              )}
            </div>

            {/* Label */}
            <div className="pb-4 flex items-start gap-2 pt-1">
              <span
                className={cn(
                  'text-sm transition-colors duration-300',
                  step.status === 'complete' && 'text-[var(--text-secondary)]',
                  step.status === 'active' && 'text-[var(--text-primary)] font-medium',
                  step.status === 'failed' && 'text-[var(--sev-critical)]',
                  step.status === 'pending' && 'text-[var(--text-muted)]',
                )}
              >
                {step.label}
              </span>
              {step.timeOffset && (
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  +{step.timeOffset}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
