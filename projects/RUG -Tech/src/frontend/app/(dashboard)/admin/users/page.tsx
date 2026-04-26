'use client'

import { PageHeader } from '@/Components/Layout/PageHeader'
import { UserRole, type User } from '@/types/auth.types'
import { RoleGateWrapper } from '@/features/auth/components/RoleGateWrapper'
import { UserManagementTable } from '@/features/admin/components/UserManagementTable'
import type { Clinic } from '@/types/admin.types'
import { ROUTES } from '@/constants/routes'
import { useAdminUsers, useClinics } from '@/features/admin/hooks/useAdminData'

export default function AdminUsersPage() {
  const usersQuery = useAdminUsers()
  const clinicsQuery = useClinics()
  const users = (usersQuery.data?.data ?? []) as User[]
  const clinics = (clinicsQuery.data?.data ?? []) as Clinic[]
  const loading = usersQuery.isLoading || clinicsQuery.isLoading

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
