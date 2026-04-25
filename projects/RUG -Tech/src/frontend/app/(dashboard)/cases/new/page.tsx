'use client'

import { PageHeader } from '@/Components/Layout/PageHeader'

export default function CaseNewPage() {
  return (
    <div>
      <PageHeader title="Upload New Case" breadcrumbs={[{ label: 'Cases', href: '/cases' }, { label: 'Upload' }]} />
      <p className="text-sm text-[var(--text-muted)] mt-6">Upload form coming soon.</p>
    </div>
  )
}
