'use client'

import { cn } from '@/lib/cn'

export interface ReportTabSwitcherProps {
  activeTab: 'doctor' | 'patient'
  onChange: (tab: 'doctor' | 'patient') => void
  className?: string
}

const tabs = [
  { id: 'doctor' as const, label: 'Doctor Report' },
  { id: 'patient' as const, label: 'Patient Report' },
]

export const ReportTabSwitcher = ({
  activeTab,
  onChange,
  className,
}: ReportTabSwitcherProps) => {
  return (
    <div className={cn('flex items-center gap-1 mb-6', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-[4px] text-sm font-medium',
            'transition-all duration-150 cursor-pointer',
            activeTab === tab.id
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
