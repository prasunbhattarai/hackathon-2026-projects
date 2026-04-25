'use client'

import { useRouter } from 'next/navigation'
import { Upload, Pencil, User, Phone, Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Avatar } from '@/Components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import type { Patient } from '@/types/patient.types'

interface PatientDetailHeaderProps {
  patient: Patient
  className?: string
}

function computeAge(dob: string): number {
  const now = new Date()
  const d = new Date(dob)
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

export const PatientDetailHeader = ({
  patient,
  className,
}: PatientDetailHeaderProps) => {
  const router = useRouter()
  const age = computeAge(patient.dateOfBirth)

  return (
    <div className={cn('flex items-start justify-between gap-6', className)}>
      <div className="flex items-start gap-4">
        <Avatar name={patient.fullName} size="lg" />

        <div>
          <h1 className="font-display text-[1.75rem] leading-tight text-[var(--text-primary)]">
            {patient.fullName}
          </h1>

          <p className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
            {patient.medicalId}
          </p>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { icon: <Calendar size={12} />, text: `${age} years` },
              {
                icon: <User size={12} />,
                text: patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1),
              },
              { icon: <Phone size={12} />, text: patient.contact },
            ].map((chip) => (
              <span
                key={chip.text}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1',
                  'text-xs text-[var(--text-secondary)]',
                  'bg-[var(--bg-elevated)] rounded-[4px]',
                )}
              >
                <span className="text-[var(--text-muted)]">{chip.icon}</span>
                {chip.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="primary"
          size="md"
          leftIcon={<Upload size={14} />}
          onClick={() => router.push(ROUTES.CASE_NEW)}
        >
          Upload New Case
        </Button>
        <Button variant="secondary" size="md" leftIcon={<Pencil size={14} />}>
          Edit
        </Button>
      </div>
    </div>
  )
}
