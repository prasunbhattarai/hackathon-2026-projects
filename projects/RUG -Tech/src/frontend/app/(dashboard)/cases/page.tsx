import type { Metadata } from 'next'
import CasesPageClient from '@/app/(dashboard)/cases/page.client'

export const metadata: Metadata = {
  title: 'Triage Queue — Fundus AI',
}

export default function CasesPage() {
  return <CasesPageClient />
}
