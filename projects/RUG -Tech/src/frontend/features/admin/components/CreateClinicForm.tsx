'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Modal } from '@/Components/ui/Modal'

export interface CreateClinicFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; address: string; phone: string }) => void
}

export const CreateClinicForm = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateClinicFormProps) => {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), address: address.trim(), phone: phone.trim() })
    setName('')
    setAddress('')
    setPhone('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Clinic" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Clinic Name"
          placeholder="Enter clinic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] block mb-1.5">
            Address
          </label>
          <textarea
            placeholder="Full clinic address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-[4px]',
              'bg-[var(--bg-elevated)] border border-[var(--border)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-[var(--accent)]',
              'resize-none',
            )}
          />
        </div>

        <Input
          label="Phone"
          placeholder="+977-..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="flex items-center gap-2 justify-end pt-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={!name.trim()}>
            Create Clinic
          </Button>
        </div>
      </form>
    </Modal>
  )
}
