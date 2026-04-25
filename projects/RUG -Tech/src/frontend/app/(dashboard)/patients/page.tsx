import type { Metadata } from 'next'
import PatientsPageClient from '@/app/(dashboard)/patients/page.client'

export const metadata: Metadata = {
  title: 'Patient Management — Fundus AI',
}

export default function PatientsPage() {
  return <PatientsPageClient />
}
