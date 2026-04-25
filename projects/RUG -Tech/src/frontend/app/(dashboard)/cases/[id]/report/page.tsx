'use client'

import { useState, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Skeleton } from '@/Components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'
import { useReport } from '@/features/reports/hooks/useReport'
import { DoctorReportView } from '@/features/reports/components/DoctorReport'
import { PatientReportView } from '@/features/reports/components/PatientReport'
import { ReportTabSwitcher } from '@/features/reports/components/ReportTabSwitcher'
import { PDFDownloadButton } from '@/features/reports/components/PDFDownloadButton'

export default function CaseReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tab, setTab] = useState<'doctor' | 'patient'>('doctor')
  const { doctorReport, patientReport, isLoading } = useReport(id)

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
        actions={<PDFDownloadButton caseId={id} />}
      />

      <ReportTabSwitcher activeTab={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        {tab === 'doctor' && doctorReport && (
          <motion.div
            key="doctor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DoctorReportView report={doctorReport} caseId={id} />
          </motion.div>
        )}
        {tab === 'patient' && patientReport && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PatientReportView report={patientReport} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, aside, header, .no-print { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  )
}
