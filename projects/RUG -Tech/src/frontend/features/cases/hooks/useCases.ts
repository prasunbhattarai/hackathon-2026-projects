'use client'

import { useQuery } from '@tanstack/react-query'
import * as caseService from '@/services/case.service'
import type { CaseListFilter } from '@/types/case.types'

export function useCases(filter: CaseListFilter) {
  return useQuery({
    queryKey: ['cases', filter],
    queryFn: () => caseService.getCases(filter),
    refetchInterval: 10000, // poll every 10s for processing cases
  })
}
