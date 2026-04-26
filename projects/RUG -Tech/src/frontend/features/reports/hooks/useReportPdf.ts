'use client'

import { useQuery } from '@tanstack/react-query'
import { getPDFDownloadUrl } from '@/services/report.service'
import type { ReportType } from '@/types/report.types'

export function useReportPdf(caseId: string, type: ReportType) {
  const q = useQuery({
    queryKey: ['report-pdf', caseId, type],
    queryFn: () => getPDFDownloadUrl(caseId, type),
    enabled: !!caseId && !!type,
  })

  return {
    url: q.data?.data?.url ?? null,
    expiresAt: q.data?.data?.expiresAt ?? null,
    isLoading: q.isLoading,
    isError: q.isError,
  }
}

