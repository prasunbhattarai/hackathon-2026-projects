'use client'

import { useQuery } from '@tanstack/react-query'
import * as caseService from '@/services/case.service'
import * as analysisService from '@/services/analysis.service'

export function useCaseDetail(caseId: string) {
  const caseQuery = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => caseService.getCaseDetail(caseId),
    enabled: !!caseId,
  })

  const analysisQuery = useQuery({
    queryKey: ['analysis', caseId],
    queryFn: () => analysisService.getAnalysisResult(caseId),
    enabled: !!caseId,
  })

  return {
    caseData: caseQuery.data?.data ?? null,
    analysis: analysisQuery.data?.data ?? null,
    isLoading: caseQuery.isLoading || analysisQuery.isLoading,
    isError: caseQuery.isError || analysisQuery.isError,
  }
}
