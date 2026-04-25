'use client'

import { use } from 'react'
import { PageHeader } from '@/Components/Layout/PageHeader'

export default function DiseaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  return (
    <div>
      <PageHeader title={slug} breadcrumbs={[{ label: 'Diseases', href: '/diseases' }, { label: slug }]} />
      <p className="text-sm text-[var(--text-muted)] mt-6">Disease detail coming soon.</p>
    </div>
  )
}
