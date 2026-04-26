'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Skeleton } from '@/Components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'
import { ReportTabSwitcher } from '@/features/reports/components/ReportTabSwitcher'
import { PDFDownloadButton } from '@/features/reports/components/PDFDownloadButton'
import { ShareReportButton } from '@/features/reports/components/ShareReportButton'
import { useReportPdf } from '@/features/reports/hooks/useReportPdf'
import { PDFInlineViewer } from '@/features/reports/components/PDFInlineViewer'
import type { ReportType } from '@/types/report.types'

export default function CaseReportPageClient({ id }: { id: string }) {
  const [tab, setTab] = useState<'doctor' | 'patient'>('doctor')
  const pdfType = useMemo<ReportType>(() => (tab === 'doctor' ? 'doctor' : 'patient'), [tab])
  const { url, isLoading } = useReportPdf(id, pdfType)

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Clinical Report"
          breadcrumbs={[
            { label: 'Cases', href: ROUTES.CASES },
            { label: id, href: ROUTES.CASE_DETAIL(id) },
            { label: 'Report' },
          ]}
        />
        <div className="max-w-3xl mx-auto flex flex-col gap-4 mt-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Clinical Report"
        breadcrumbs={[
          { label: 'Cases', href: ROUTES.CASES },
          { label: id, href: ROUTES.CASE_DETAIL(id) },
          { label: 'Report' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <PDFDownloadButton caseId={id} />
            <ShareReportButton caseId={id} />
          </div>
        }
      />

      <ReportTabSwitcher activeTab={tab} onChange={setTab} />

      {url ? (
        <PDFInlineViewer
          src={url}
          title={tab === 'doctor' ? 'Doctor Report (PDF)' : 'Patient Report (PDF)'}
        />
      ) : (
        <div className="max-w-3xl mx-auto text-sm text-[var(--text-muted)]">
          Report PDF is not available for this case.
        </div>
      )}

      <style jsx global>{`
        @media print {
          nav,
          aside,
          header,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}

