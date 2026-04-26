import { apiGet, apiPost } from '@/services/api.client'
import type { ApiResponse } from '@/types/api.types'
import type {
  DoctorReport,
  GeneralReport,
  PatientReport,
  PDFDownloadUrl,
  ReportType,
} from '@/types/report.types'

/** Get the doctor-facing clinical report for a case */
export async function getDoctorReport(
  caseId: string,
): Promise<ApiResponse<DoctorReport>> {
  return apiGet<DoctorReport>(`/reports/${caseId}/doctor`)
}

/** Get the patient-facing simplified report for a case */
export async function getPatientReport(
  caseId: string,
): Promise<ApiResponse<PatientReport>> {
  return apiGet<PatientReport>(`/reports/${caseId}/patient`)
}

/** Get the general/full report for a case */
export async function getGeneralReport(
  caseId: string,
): Promise<ApiResponse<GeneralReport>> {
  return apiGet<GeneralReport>(`/reports/${caseId}/general`)
}

/** Get a time-limited PDF download URL for a report */
export async function getPDFDownloadUrl(
  caseId: string,
  type: ReportType,
): Promise<ApiResponse<PDFDownloadUrl>> {
  return apiGet<PDFDownloadUrl>(`/reports/${caseId}/pdf`, { type })
}

/** Ask backend to share a case report to a patient email */
export async function shareReportToPatient(
  caseId: string,
  email: string,
): Promise<ApiResponse<{ sent: boolean }>> {
  return apiPost<{ sent: boolean }>(`/reports/${caseId}/share`, { email })
}
