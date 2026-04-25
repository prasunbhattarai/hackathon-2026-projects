export { formatDate } from '@/utils/formatters'

function toDate(value: string): Date | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isToday(date: string): boolean {
  const d = toDate(date)
  if (!d) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function isThisWeek(date: string): boolean {
  const d = toDate(date)
  if (!d) return false
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() - now.getDay())

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return d >= start && d < end
}

export function getDaysBetween(start: string, end: string): number {
  const s = toDate(start)
  const e = toDate(end)
  if (!s || !e) return 0
  const ms = e.getTime() - s.getTime()
  return Math.floor(Math.abs(ms) / (1000 * 60 * 60 * 24))
}
