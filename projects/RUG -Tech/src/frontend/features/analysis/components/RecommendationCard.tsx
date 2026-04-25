'use client'

import { AlertCircle, Clock, CalendarCheck, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import type { SeverityLevel } from '@/types/analysis.types'

export type UrgencyLevel = 'immediate' | 'urgent' | 'routine'

export interface RecommendationCardProps {
  recommendation: string
  severityLevel: SeverityLevel
  className?: string
}

const urgencyConfig: Record<UrgencyLevel, {
  label: string
  badge: string
  variant: 'critical' | 'high' | 'low'
  icon: typeof AlertCircle
  color: string
}> = {
  immediate: {
    label: 'Immediate Action Required',
    badge: 'Immediate',
    variant: 'critical',
    icon: AlertCircle,
    color: 'var(--sev-critical)',
  },
  urgent: {
    label: 'Within 2 Weeks',
    badge: 'Urgent',
    variant: 'high',
    icon: Clock,
    color: 'var(--sev-high)',
  },
  routine: {
    label: 'Routine Follow-up',
    badge: 'Routine',
    variant: 'low',
    icon: CalendarCheck,
    color: 'var(--sev-low)',
  },
}

function severityToUrgency(level: SeverityLevel): UrgencyLevel {
  if (level >= 4) return 'immediate'
  if (level >= 3) return 'urgent'
  return 'routine'
}

function parseActions(text: string): string[] {
  // Split on numbered items or dash items
  const lines = text.split(/(?:\d+\.\s+|-\s+)/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) {
    // Try splitting on sentence boundaries for single-block text
    return text
      .split(/\.\s+/)
      .filter((s) => s.trim().length > 5)
      .map((s) => s.trim().replace(/\.$/, ''))
  }
  return lines.map((l) => l.trim().replace(/\.$/, ''))
}

export const RecommendationCard = ({
  recommendation,
  severityLevel,
  className,
}: RecommendationCardProps) => {
  const urgency = severityToUrgency(severityLevel)
  const config = urgencyConfig[urgency]
  const Icon = config.icon
  const actions = parseActions(recommendation)

  return (
    <div
      className={cn(
        'bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[4px]',
        'overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Clinical Recommendation
        </span>
        <Badge variant={config.variant} size="sm" dot>
          {config.label}
        </Badge>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {/* Urgency indicator */}
        <div
          className="flex items-center gap-2 mb-4 p-2.5 rounded-[4px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${config.color} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${config.color} 20%, transparent)`,
          }}
        >
          <Icon size={16} style={{ color: config.color }} />
          <span className="text-xs font-medium" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        {/* Recommendation text */}
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          {recommendation}
        </p>

        {/* Suggested actions */}
        {actions.length > 1 && (
          <div>
            <p className="font-condensed font-medium text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
              Suggested Actions
            </p>
            <ul className="flex flex-col gap-2">
              {actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckSquare
                    size={14}
                    className="text-[var(--text-muted)] shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
