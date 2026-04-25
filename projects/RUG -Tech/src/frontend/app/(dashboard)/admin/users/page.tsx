'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { UserRole, type User } from '@/types/auth.types'
import { RoleGateWrapper } from '@/features/auth/components/RoleGateWrapper'
import { UserManagementTable } from '@/features/admin/components/UserManagementTable'
import { usersMock } from '@/mock/data/users.mock'
import { clinicsMock } from '@/mock/data/clinics.mock'
import type { Clinic } from '@/types/admin.types'
import { ROUTES } from '@/constants/routes'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(usersMock)
      setClinics(clinicsMock)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <RoleGateWrapper allowedRoles={[UserRole.SUPER_ADMIN]}>
      <PageHeader
        title="Users"
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN },
          { label: 'Users' },
        ]}
      />

      <UserManagementTable
        users={users}
        clinics={clinics}
        loading={loading}
        className="mt-4"
      />
    </RoleGateWrapper>
  )
}
