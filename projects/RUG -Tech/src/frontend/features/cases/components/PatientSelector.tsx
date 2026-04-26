'use client'

import { useState, useDeferredValue, useMemo, useRef, useEffect } from 'react'
import { Search, X, UserPlus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from '@/Components/ui/Input'
import { Avatar } from '@/Components/ui/Avatar'
import type { Patient } from '@/types/patient.types'
import { usePatients } from '@/features/patients/hooks/usePatients'

export interface PatientSelectorProps {
  selectedPatient: Patient | null
  onSelect: (patient: Patient) => void
  onClear: () => void
  className?: string
}

export const PatientSelector = ({
  selectedPatient,
  onSelect,
  onClear,
  className,
}: PatientSelectorProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const deferredQuery = useDeferredValue(query)
  const containerRef = useRef<HTMLDivElement>(null)

  const patientsQuery = usePatients({
    page: 1,
    limit: 8,
    search: deferredQuery.trim() || undefined,
  })

  const filteredPatients = useMemo(() => {
    const items = patientsQuery.data?.data?.items ?? []
    // PatientSelector needs full Patient object today; backend list only returns summaries.
    // We project what we can; caller typically only uses id/fullName/medicalId.
    return items.map((p) => ({
      id: p.id,
      clinicId: '',
      fullName: p.fullName,
      dateOfBirth: '1900-01-01',
      gender: 'other',
      contact: '',
      medicalId: p.medicalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as unknown as Patient[]
  }, [patientsQuery.data])

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (selectedPatient) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <label className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Selected Patient
        </label>
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5',
            'bg-[var(--bg-elevated)] border border-[var(--accent)]/30',
            'rounded-[4px]',
          )}
        >
          <Avatar name={selectedPatient.fullName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {selectedPatient.fullName}
            </p>
            <p className="text-[11px] font-mono text-[var(--text-muted)]">
              {selectedPatient.medicalId}
            </p>
          </div>
          <button
            onClick={onClear}
            className={cn(
              'p-1 rounded-[4px] text-[var(--text-muted)]',
              'hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
              'transition-colors duration-150',
            )}
            aria-label="Remove patient"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        label="Search Patient"
        placeholder="Search by name or medical ID..."
        leftIcon={<Search size={16} />}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
      />

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 z-20',
            'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
            'rounded-[4px] shadow-2xl',
            'max-h-[280px] overflow-y-auto',
            'animate-fade-in',
          )}
        >
          {filteredPatients.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-[var(--text-muted)]">No patients found</p>
            </div>
          )}

          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5',
                'hover:bg-[var(--bg-subtle)] transition-colors duration-100',
                'text-left cursor-pointer',
                'border-b border-[var(--border)] last:border-b-0',
              )}
              onClick={() => {
                onSelect(patient)
                setIsOpen(false)
                setQuery('')
              }}
            >
              <Avatar name={patient.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {patient.fullName}
                </p>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                  {patient.medicalId}
                </p>
              </div>
            </button>
          ))}

          {/* Create new patient link */}
          <button
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5',
              'text-[var(--accent)] hover:bg-[var(--accent)]/5',
              'transition-colors duration-100 cursor-pointer',
              'border-t border-[var(--border)]',
            )}
            onClick={() => setIsOpen(false)}
          >
            <UserPlus size={14} />
            <span className="text-sm font-medium">Create new patient</span>
          </button>
        </div>
      )}
    </div>
  )
}
