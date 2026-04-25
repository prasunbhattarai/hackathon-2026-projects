'use client'

import { PageHeader } from '@/Components/Layout/PageHeader'

export default function AdminClinicsPage() {
  return (
    <div>
      <PageHeader title="Clinics" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Clinics' }]} />
      <p className="text-sm text-[var(--text-muted)] mt-6">Clinic management coming soon.</p>
    </div>
  )
}
