'use client'

import { use, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Tabs } from '@/Components/ui/Tabs'
import { Skeleton } from '@/Components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'
import { PatientDetailHeader } from '@/features/patients/components/PatientDetailHeader'
import { PatientCaseHistory } from '@/features/patients/components/PatientCaseHistory'
import { staggerContainer, staggerItem } from '@/animations/page.variants'
import { usePatientDetail } from '@/features/patients/hooks/usePatientDetail'
import type { PatientDetail } from '@/types/patient.types'
import type { CaseSummary } from '@/types/case.types'

interface PatientInfoPanelProps {
  patient: PatientDetail
}

const PatientInfoPanel = ({ patient }: PatientInfoPanelProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    {[
      { label: 'Full Name', value: patient.fullName },
      { label: 'Medical ID', value: patient.medicalId, mono: true },
      { label: 'Date of Birth', value: new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Gender', value: patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) },
      { label: 'Contact', value: patient.contact, mono: true },
      { label: 'Clinic ID', value: patient.clinicId, mono: true },
      { label: 'Registered', value: new Date(patient.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ].map((item) => (
      <div key={item.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-3">
        <span className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {item.label}
        </span>
        <p className={cn('text-sm text-[var(--text-primary)] mt-1', item.mono && 'font-mono text-xs')}>
          {item.value}
        </p>
      </div>
    ))}
  </div>
)

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('history')

  const patientQuery = usePatientDetail(id)
  const isLoading = patientQuery.isLoading
  const patient = patientQuery.data?.data ?? null
  const cases = (patient?.cases ?? []) as CaseSummary[]

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-4">
          <Skeleton className="w-11 h-11" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <p className="text-sm text-[var(--text-muted)]">Patient not found</p>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title={patient.fullName}
          breadcrumbs={[
            { label: 'Patients', href: ROUTES.PATIENTS },
            { label: patient.fullName },
          ]}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <PatientDetailHeader patient={patient} />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-6">
        <Tabs
          tabs={[
            { id: 'history', label: 'Case History', count: cases.length },
            { id: 'info', label: 'Patient Info' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-4">
        {activeTab === 'history' && (
          <PatientCaseHistory cases={cases} />
        )}
        {activeTab === 'info' && <PatientInfoPanel patient={patient} />}
      </motion.div>
    </motion.div>
  )
}
