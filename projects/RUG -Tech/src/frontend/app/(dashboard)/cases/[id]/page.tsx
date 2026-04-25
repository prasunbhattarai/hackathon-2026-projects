import type { Metadata } from 'next'
import { casesMock } from '@/mock/data/cases.mock'
import { patientsMock } from '@/mock/data/patients.mock'
import CaseDetailPageClient from '@/app/(dashboard)/cases/[id]/page.client'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id
  const caseRecord = casesMock.find((c) => c.id === id)
  const patientName = caseRecord
    ? patientsMock.find((p) => p.id === caseRecord.patientId)?.fullName
    : undefined

  return {
    title: `Cases / ${patientName ?? id} — Fundus AI`,
  }
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <CaseDetailPageClient id={resolvedParams.id} />
}
