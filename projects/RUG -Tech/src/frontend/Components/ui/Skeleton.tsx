'use client'

import { cn } from '@/lib/cn'

const shimmerStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
  backgroundSize: '200% 100%',
}

export interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn('bg-[var(--bg-subtle)] rounded-[4px] animate-shimmer', className)}
    style={shimmerStyle}
  />
)

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-3.5', i === lines - 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
)

export interface SkeletonCardProps {
  className?: string
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => (
  <div
    className={cn(
      'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4',
      'flex flex-col gap-3',
      className,
    )}
  >
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={2} />
    <div className="flex items-center gap-2 pt-1">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-12" />
    </div>
  </div>
)

export interface SkeletonTableRowProps {
  columns?: number
  className?: string
}

export const SkeletonTableRow = ({
  columns = 5,
  className,
}: SkeletonTableRowProps) => (
  <tr className={cn('border-b border-[var(--border)]', className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton
          className={cn(
            'h-3.5',
            i === 0 ? 'w-24' : i === columns - 1 ? 'w-16' : 'w-full',
          )}
        />
      </td>
    ))}
  </tr>
)

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const avatarSizes: Record<string, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
}

export const SkeletonAvatar = ({ size = 'md', className }: SkeletonAvatarProps) => (
  <Skeleton className={cn(avatarSizes[size], 'rounded-[4px]', className)} />
)
