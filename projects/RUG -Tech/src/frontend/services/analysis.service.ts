import { apiGet } from '@/services/api.client'
import type { ApiResponse } from '@/types/api.types'
import type { AnalysisResult } from '@/types/analysis.types'

/** Get AI analysis result for a specific case */
export async function getAnalysisResult(
  caseId: string,
): Promise<ApiResponse<AnalysisResult>> {
  return apiGet<AnalysisResult>(`/analysis/${caseId}`)
}
