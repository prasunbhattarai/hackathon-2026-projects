'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  badge?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  badge,
  className,
}: PageHeaderProps) => (
  <div
    className={cn(
      'mb-6 border-b border-[var(--border)] pb-6',
      className,
    )}
  >
    {/* Breadcrumbs */}
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 mb-3"
      >
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                size={12}
                className="text-[var(--text-muted)]"
              />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-xs text-[var(--text-secondary)]">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    )}

    {/* Title row */}
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[1.75rem] leading-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  </div>
)
