'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { UserRole } from '@/types/auth.types'
import { RoleGateWrapper } from '@/features/auth/components/RoleGateWrapper'
import { ClinicTable } from '@/features/admin/components/ClinicTable'
import { CreateClinicForm } from '@/features/admin/components/CreateClinicForm'
import type { Clinic } from '@/types/admin.types'
import { ROUTES } from '@/constants/routes'
import { useClinics } from '@/features/admin/hooks/useAdminData'
import { createClinic } from '@/services/admin.service'
import { useToast } from '@/hooks/useToast'

export default function AdminClinicsPage() {
  const { success, error } = useToast()
  const clinicsQuery = useClinics()
  const clinics = (clinicsQuery.data?.data ?? []) as Clinic[]
  const loading = clinicsQuery.isLoading
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = async (data: { name: string; address: string; phone: string }) => {
    const res = await createClinic(data)
    if (!res.success) {
      error('Create clinic failed', res.error?.message)
      return
    }
    success('Clinic created')
    setShowCreate(false)
    await clinicsQuery.refetch()
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
