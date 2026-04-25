'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export const StepIndicator = ({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {steps.map((label, index) => {
        const isDone = index < currentStep
        const isActive = index === currentStep
        const isFuture = index > currentStep

        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'text-xs font-mono font-medium',
                  'transition-all duration-300',
                  isDone && 'bg-[var(--accent)] text-white',
                  isActive && 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/20',
                  isFuture && 'bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-muted)]',
                )}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : index + 1}
              </div>
              <span
                className={cn(
                  'mt-2 text-[10px] font-condensed uppercase tracking-wider whitespace-nowrap',
                  isDone && 'text-[var(--accent)]',
                  isActive && 'text-[var(--text-primary)]',
                  isFuture && 'text-[var(--text-muted)]',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-px mx-2 mb-6 transition-colors duration-300',
                  index < currentStep ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
