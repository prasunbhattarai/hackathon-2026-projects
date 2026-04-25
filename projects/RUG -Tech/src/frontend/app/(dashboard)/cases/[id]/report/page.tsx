'use client'

import { PageHeader } from '@/Components/Layout/PageHeader'
import { ROUTES } from '@/constants/routes'

export default function CaseReportPage() {
  return (
    <div>
      <PageHeader
        title="Case Report"
        breadcrumbs={[
          { label: 'Cases', href: ROUTES.CASES },
          { label: 'Report' },
        ]}
      />
      <p className="text-sm text-[var(--text-muted)] mt-6">
        Report view coming soon.
      </p>
    </div>
  )
}
