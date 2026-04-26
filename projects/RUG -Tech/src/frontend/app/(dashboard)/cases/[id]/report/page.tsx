import CaseReportPageClient from '@/app/(dashboard)/cases/[id]/report/page.client'

export default async function CaseReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <CaseReportPageClient id={resolvedParams.id} />
}
