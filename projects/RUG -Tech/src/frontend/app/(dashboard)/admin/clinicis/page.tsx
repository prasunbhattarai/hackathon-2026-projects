'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { UserRole } from '@/types/auth.types'
import { RoleGateWrapper } from '@/features/auth/components/RoleGateWrapper'
import { ClinicTable } from '@/features/admin/components/ClinicTable'
import { CreateClinicForm } from '@/features/admin/components/CreateClinicForm'
import { clinicsMock } from '@/mock/data/clinics.mock'
import type { Clinic } from '@/types/admin.types'
import { ROUTES } from '@/constants/routes'

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setClinics(clinicsMock)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const handleCreate = (data: { name: string; address: string; phone: string }) => {
    const newClinic: Clinic = {
      id: `clinic-new-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      userCount: 0,
      caseCount: 0,
    }
    setClinics((prev) => [...prev, newClinic])
  }

  return (
    <RoleGateWrapper allowedRoles={[UserRole.SUPER_ADMIN]}>
      <PageHeader
        title="Clinics"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN },
          { label: 'Clinics' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowCreate(true)}
          >
            Create Clinic
          </Button>
        }
      />

      <ClinicTable clinics={clinics} loading={loading} className="mt-4" />

      <CreateClinicForm
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </RoleGateWrapper>
  )
}
