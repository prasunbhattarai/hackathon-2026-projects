'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Input } from '@/Components/ui/Input'
import { Button } from '@/Components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { useCreatePatient } from '@/features/patients/hooks/useCreatePatient'
import { useAuthStore } from '@/store/authStore'

function validateName(v: string) {
  return v.trim().length < 2 ? 'Name must be at least 2 characters' : null
}
function validateDob(v: string) {
  if (!v) return 'Date of birth is required'
  const age =
    (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  if (age < 0 || age > 120) return 'Age must be between 0 and 120'
  return null
}
function validateContact(v: string) {
  if (!v.trim()) return 'Contact is required'
  if (!/^\+977-\d{7,10}$/.test(v)) return 'Format: +977-XXXXXXXXX'
  return null
}
function validateMedicalId(v: string) {
  return v.trim().length < 3 ? 'Medical ID is required' : null
}

export const PatientCreateForm = () => {
  const router = useRouter()
  const { mutate, isPending } = useCreatePatient()
  const user = useAuthStore((s) => s.user)

  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [contact, setContact] = useState('+977-')
  const [medicalId, setMedicalId] = useState('')

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const hasClinicAccess = Boolean(user?.clinicId)

  const setFieldError = (field: string, val: string | null) =>
    setErrors((p) => ({ ...p, [field]: val }))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = {
      fullName: validateName(fullName),
      dateOfBirth: validateDob(dateOfBirth),
      contact: validateContact(contact),
      medicalId: validateMedicalId(medicalId),
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return
    if (!hasClinicAccess) return

    mutate({ fullName, dateOfBirth, gender, contact, medicalId })
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => setFieldError('fullName', validateName(fullName))}
            error={errors.fullName ?? undefined}
            placeholder="Ram Bahadur Shrestha"
          />
        </div>

        <Input
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          onBlur={() => setFieldError('dateOfBirth', validateDob(dateOfBirth))}
          error={errors.dateOfBirth ?? undefined}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as typeof gender)}
            className={cn(
              'h-9 px-3 text-sm font-sans',
              'bg-[var(--bg-elevated)] border border-[var(--border)]',
              'text-[var(--text-primary)] rounded-[4px]',
              'outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30',
            )}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          label="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onBlur={() => setFieldError('contact', validateContact(contact))}
          error={errors.contact ?? undefined}
          placeholder="+977-9812345678"
        />

        <Input
          label="Medical ID"
          value={medicalId}
          onChange={(e) => setMedicalId(e.target.value)}
          onBlur={() => setFieldError('medicalId', validateMedicalId(medicalId))}
          error={errors.medicalId ?? undefined}
          placeholder="KEC-00001"
        />
      </div>

      <div className="flex items-center gap-3 mt-8">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          disabled={!hasClinicAccess}
        >
          Register Patient
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.push(ROUTES.PATIENTS)}
        >
          Cancel
        </Button>
      </div>
      {!hasClinicAccess && (
        <p className="mt-4 text-sm text-[var(--sev-warning)]">
          Your account is not linked to a clinic yet, so patient registration is disabled.
          Contact an administrator to assign your clinic.
        </p>
      )}
    </form>
  )
}
