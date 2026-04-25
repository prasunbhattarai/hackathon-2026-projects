import type { Metadata } from 'next'
import { casesMock } from '@/mock/data/cases.mock'
import { patientsMock } from '@/mock/data/patients.mock'
import CaseDetailPageClient from '@/app/(dashboard)/cases/[id]/page.client'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const id = params.id
  const caseRecord = casesMock.find((c) => c.id === id)
  const patientName = caseRecord
    ? patientsMock.find((p) => p.id === caseRecord.patientId)?.fullName
    : undefined

  return {
    title: `Cases / ${patientName ?? id} — Fundus AI`,
  }
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return <CaseDetailPageClient id={params.id} />
}
