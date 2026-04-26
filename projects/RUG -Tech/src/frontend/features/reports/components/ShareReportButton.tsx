'use client'

import { useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Modal } from '@/Components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import * as reportService from '@/services/report.service'

export interface ShareReportButtonProps {
  caseId: string
  className?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ShareReportButton({ caseId, className }: ShareReportButtonProps) {
  const { success, error } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)

  const trimmedEmail = useMemo(() => email.trim(), [email])

  const close = () => {
    if (isSending) return
    setIsOpen(false)
    setEmail('')
    setEmailError(undefined)
  }

  const onSubmit = async () => {
    const nextEmail = trimmedEmail
    if (!nextEmail) {
      setEmailError('Email is required.')
      return
    }
    if (!isValidEmail(nextEmail)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailError(undefined)
    setIsSending(true)
    try {
      const res = await reportService.shareReportToPatient(caseId, nextEmail)
      if (!res.success) {
        error('Share failed', res.error?.message ?? 'Unable to send report email.')
        return
      }

      success('Report shared', `Sent to ${nextEmail}`)
      close()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Mail size={14} />}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        Share to patient
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Share report to patient"
        description="Enter the patient's email. The backend will send the report link/PDF."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={close} disabled={isSending}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={onSubmit} loading={isSending}>
              Send email
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input
            label="Patient email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            inputMode="email"
            autoComplete="email"
          />
          <p className="text-xs text-[var(--text-muted)]">
            This only triggers a backend call. No email logic lives in the frontend.
          </p>
        </div>
      </Modal>
    </>
  )
}

