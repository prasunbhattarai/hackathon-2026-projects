'use client'

import { cn } from '@/lib/cn'
import { SkeletonTableRow } from './Skeleton'

/* ---------- Types ---------- */

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  mono?: boolean
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  keyExtractor: (row: T) => string
  stickyHeader?: boolean
  className?: string
}

/* ---------- Table ---------- */

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  keyExtractor,
  stickyHeader = false,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr
            className={cn(
              'bg-[var(--bg-elevated)] border-b border-[var(--border)]',
              stickyHeader && 'sticky top-0 z-10',
            )}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-2.5',
                  'font-condensed font-medium text-[11px]',
                  'uppercase tracking-[0.08em]',
                  'text-[var(--text-muted)] text-left',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={`skel-${i}`} columns={columns.length} />
            ))}

          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-[4px] bg-[var(--bg-subtle)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-[var(--border)]',
                  'transition-colors duration-100',
                  onRowClick &&
                    'cursor-pointer hover:bg-[var(--bg-subtle)]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-[var(--text-primary)]',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.mono && 'font-mono text-xs',
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
