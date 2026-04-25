'use client'

import { cn } from '@/lib/cn'

export interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  role?: string
  className?: string
}

const sizeStyles: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
}

/**
 * Deterministic background color from name hash.
 * Uses the severity/accent palette for clinical consistency.
 */
const palette = [
  'var(--accent)',
  'var(--sev-medium)',
  'var(--sev-low)',
  '#6C7A89',
  '#8B5CF6',
  '#14B8A6',
  '#F59E0B',
  '#EC4899',
] as const

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const Avatar = ({
  name,
  size = 'md',
  role,
  className,
}: AvatarProps) => {
  const initials = getInitials(name)
  const bg = palette[hashName(name) % palette.length]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-[4px] shrink-0',
        'font-condensed font-medium text-white',
        'select-none',
        sizeStyles[size],
        className,
      )}
      style={{ backgroundColor: bg }}
      title={role ? `${name} — ${role}` : name}
      aria-label={name}
      role="img"
    >
      {initials}
    </div>
  )
}
