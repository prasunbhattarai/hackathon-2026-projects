'use client'

import { Heart, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PatientReport as PatientReportType } from '@/types/report.types'

export interface PatientReportViewProps {
  report: PatientReportType
  className?: string
}

const severityVisual: Record<string, {
  icon: typeof CheckCircle
  color: string
  bgClass: string
  label: string
}> = {
  None: {
    icon: CheckCircle,
    color: 'text-teal-400',
    bgClass: 'bg-teal-400/10 border-teal-400/20',
    label: 'Good',
  },
  Mild: {
    icon: CheckCircle,
    color: 'text-teal-400',
    bgClass: 'bg-teal-400/10 border-teal-400/20',
    label: 'Good',
  },
  Moderate: {
    icon: AlertTriangle,
    color: 'text-[var(--sev-medium)]',
    bgClass: 'bg-[var(--sev-medium)]/10 border-[var(--sev-medium)]/20',
    label: 'Needs Attention',
  },
  Severe: {
    icon: AlertTriangle,
    color: 'text-[var(--sev-high)]',
    bgClass: 'bg-[var(--sev-high)]/10 border-[var(--sev-high)]/20',
    label: 'Urgent',
  },
  PDR: {
    icon: AlertTriangle,
    color: 'text-[var(--sev-critical)]',
    bgClass: 'bg-[var(--sev-critical)]/10 border-[var(--sev-critical)]/20',
    label: 'Urgent',
  },
}

export const PatientReportView = ({
  report,
  className,
}: PatientReportViewProps) => {
  const visual = severityVisual[report.severityLabel] ?? severityVisual['None']
  const Icon = visual.icon

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
        'max-w-3xl mx-auto',
        className,
      )}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={24} className="text-[var(--accent)]" />
          <h1 className="font-display text-2xl text-[var(--text-primary)]">
            Your Eye Health Report
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          This report explains the results of your retinal scan in simple terms.
        </p>
      </div>

      {/* Summary */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">
          Summary
        </h2>
        <p className="text-[0.9375rem] text-[var(--text-secondary)] leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Severity Indicator */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <div className={cn(
          'flex items-center gap-4 p-5 rounded-[4px] border',
          visual.bgClass,
        )}>
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shrink-0',
            visual.bgClass,
          )}>
            <Icon size={28} className={visual.color} />
          </div>
          <div>
            <p className={cn('text-lg font-semibold', visual.color)}>
              {visual.label}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Your results indicate: <strong>{report.severityLabel}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* What We Found */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">
          What We Found
        </h2>
        <p className="text-[0.9375rem] text-[var(--text-secondary)] leading-relaxed">
          {report.whatWasFound}
        </p>
      </div>

      {/* What To Do Next */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">
          What To Do Next
        </h2>
        <div className="flex items-start gap-3 p-4 bg-[var(--bg-elevated)] rounded-[4px] border border-[var(--border)]">
          <ArrowRight size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <p className="text-[0.9375rem] text-[var(--text-primary)] leading-relaxed">
            {report.nextSteps}
          </p>
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="px-8 py-5">
        <div
          className={cn(
            'p-4 rounded-[4px] border text-center',
            report.urgency === 'Urgent'
              ? 'bg-[var(--sev-critical)]/10 border-[var(--sev-critical)]/25'
              : report.urgency === 'Priority'
                ? 'bg-[var(--sev-high)]/10 border-[var(--sev-high)]/25'
                : 'bg-[var(--sev-low)]/10 border-[var(--sev-low)]/25',
          )}
        >
          <p
            className={cn(
              'text-sm font-medium',
              report.urgency === 'Urgent'
                ? 'text-[var(--sev-critical)]'
                : report.urgency === 'Priority'
                  ? 'text-[var(--sev-high)]'
                  : 'text-[var(--sev-low)]',
            )}
          >
            {report.urgency === 'Urgent'
              ? '⚠ Please see a doctor as soon as possible'
              : report.urgency === 'Priority'
                ? '📋 Schedule a follow-up appointment within 2 weeks'
                : '✅ Continue your regular check-up schedule'}
          </p>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] text-center mt-3 italic">
          This report is for informational purposes. Always consult your doctor for medical advice.
        </p>
      </div>
    </div>
  )
}
