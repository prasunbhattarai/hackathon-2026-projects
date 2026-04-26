import type { Metadata } from 'next'
import CaseDetailPageClient from '@/app/(dashboard)/cases/[id]/page.client'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id

  return {
    title: `Cases / ${id} — Fundus AI`,
  }
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <CaseDetailPageClient id={resolvedParams.id} />
}
