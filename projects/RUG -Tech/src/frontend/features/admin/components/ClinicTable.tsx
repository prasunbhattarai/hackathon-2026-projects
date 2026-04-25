'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Pencil, Power } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { Skeleton } from '@/Components/ui/Skeleton'
import type { Clinic } from '@/types/admin.types'

export interface ClinicTableProps {
  clinics: Clinic[]
  loading: boolean
  className?: string
}

export const ClinicTable = ({ clinics, loading, className }: ClinicTableProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {['Clinic Name', 'Location', 'Users', 'Cases', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-3 font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clinics.map((clinic) => (
            <tr
              key={clinic.id}
              className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] transition-colors duration-100"
            >
              <td className="py-3 px-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">{clinic.name}</p>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">{clinic.id}</p>
              </td>
              <td className="py-3 px-3 text-xs text-[var(--text-secondary)] max-w-[200px] truncate">
                {clinic.address}
              </td>
              <td className="py-3 px-3 text-sm font-mono text-[var(--text-primary)]">
                {clinic.userCount ?? 0}
              </td>
              <td className="py-3 px-3 text-sm font-mono text-[var(--text-primary)]">
                {clinic.caseCount ?? 0}
              </td>
              <td className="py-3 px-3">
                <Badge variant={clinic.isActive ? 'success' : 'none'} size="sm">
                  {clinic.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="py-3 px-3">
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === clinic.id ? null : clinic.id)}
                    className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openMenuId === clinic.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[4px] shadow-2xl min-w-[140px] animate-fade-in">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
                        <Eye size={12} /> View Details
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
                        <Pencil size={12} /> Edit
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
                        <Power size={12} /> {clinic.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
