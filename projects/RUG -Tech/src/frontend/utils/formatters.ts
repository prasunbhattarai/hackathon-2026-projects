import { UserRole } from '@/types/auth.types'

type DateFormat = 'short' | 'long' | 'relative'

function toDate(value: string): Date | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const deltaMs = date.getTime() - now.getTime()
  const deltaSeconds = Math.round(deltaMs / 1000)

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> =
    [
      { amount: 60, unit: 'second' },
      { amount: 60, unit: 'minute' },
      { amount: 24, unit: 'hour' },
      { amount: 7, unit: 'day' },
      { amount: 4.34524, unit: 'week' },
      { amount: 12, unit: 'month' },
      { amount: Number.POSITIVE_INFINITY, unit: 'year' },
    ]

  let duration = deltaSeconds
  let unit: Intl.RelativeTimeFormatUnit = 'second'
  for (const div of divisions) {
    if (Math.abs(duration) < div.amount) break
    duration = Math.round(duration / div.amount)
    unit = div.unit
  }

  return rtf.format(duration, unit)
}

export function formatDate(isoString: string, format: DateFormat = 'short'): string {
  const d = toDate(isoString)
  if (!d) return ''

  if (format === 'relative') return formatRelativeDate(d)

  if (format === 'long') {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d)
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatConfidence(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  const pct = value <= 1 ? value * 100 : value
  const rounded = Math.round(Math.min(100, Math.max(0, pct)))
  return `${rounded}%`
}

export function formatPriorityScore(score: number): string {
  if (!Number.isFinite(score)) return '0.00'
  return score.toFixed(2)
}

export function formatPatientAge(dob: string): number {
  const d = toDate(dob)
  if (!d) return 0

  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return Math.max(0, age)
}

export function formatMedicalId(id: string): string {
  return (id ?? '').trim().toUpperCase()
}

export function formatRole(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin'
    case UserRole.CLINIC_ADMIN:
      return 'Clinic Admin'
    case UserRole.DOCTOR:
      return 'Doctor'
    case UserRole.LAB_ASSISTANT:
      return 'Lab Assistant'
    default:
      return 'User'
  }
}

export function truncateText(text: string, maxLength: number): string {
  const t = text ?? ''
  if (!Number.isFinite(maxLength) || maxLength <= 0) return ''
  if (t.length <= maxLength) return t
  if (maxLength === 1) return '…'
  return `${t.slice(0, maxLength - 1)}…`
}
