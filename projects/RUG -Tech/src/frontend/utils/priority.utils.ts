import type { DRStatus } from '@/types/analysis.types'
import type { PriorityTier } from '@/types/case.types'

export function priorityScoreToTier(score: number): PriorityTier {
  const s = Number.isFinite(score) ? score : 0
  if (s >= 0.85) return 'critical'
  if (s >= 0.65) return 'high'
  if (s >= 0.4) return 'medium'
  return 'low'
}

export function tierToDisplayLabel(tier: PriorityTier): string {
  switch (tier) {
    case 'critical':
      return 'Critical'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'Unknown'
  }
}

export function tierToColor(tier: PriorityTier): string {
  switch (tier) {
    case 'critical':
      return 'var(--priority-critical)'
    case 'high':
      return 'var(--priority-high)'
    case 'medium':
      return 'var(--priority-medium)'
    case 'low':
      return 'var(--priority-low)'
    default:
      return 'var(--priority-low)'
  }
}

export function drStatusToTier(status: DRStatus): PriorityTier {
  switch (status) {
    case 'PDR':
    case 'Severe':
      return 'critical'
    case 'Moderate':
      return 'high'
    case 'Mild':
      return 'medium'
    case 'None':
    default:
      return 'low'
  }
}

function normalize01(v: number): number {
  if (!Number.isFinite(v)) return 0
  const x = v > 1 ? v / 100 : v
  return Math.min(1, Math.max(0, x))
}

/**
 * Computes an overall priority score in [0, 1].
 * - drSeverity: expected 1-4 (or 0-4)
 * - glaucomaConf/hrConf: expected 0-1 (or 0-100)
 */
export function computePriorityScore(
  drSeverity: number,
  glaucomaConf: number,
  hrConf: number,
): number {
  const sev = Number.isFinite(drSeverity) ? drSeverity : 0
  const sev01 = Math.min(1, Math.max(0, sev / 4))
  const g = normalize01(glaucomaConf)
  const h = normalize01(hrConf)

  const score = sev01 * 0.6 + g * 0.2 + h * 0.2
  return Math.min(1, Math.max(0, score))
}
