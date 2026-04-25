'use client'

import { PageHeader } from '@/Components/Layout/PageHeader'

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader title="Users" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]} />
      <p className="text-sm text-[var(--text-muted)] mt-6">User management coming soon.</p>
    </div>
  )
}
