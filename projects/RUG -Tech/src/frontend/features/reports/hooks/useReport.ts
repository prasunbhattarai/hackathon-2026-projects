'use client'

import { useQuery } from '@tanstack/react-query'
import * as reportService from '@/services/report.service'

export function useReport(caseId: string) {
  const doctorReport = useQuery({
    queryKey: ['report-doctor', caseId],
    queryFn: () => reportService.getDoctorReport(caseId),
    enabled: !!caseId,
  })

  const patientReport = useQuery({
    queryKey: ['report-patient', caseId],
    queryFn: () => reportService.getPatientReport(caseId),
    enabled: !!caseId,
  })

  return {
    doctorReport: doctorReport.data?.data ?? null,
    patientReport: patientReport.data?.data ?? null,
    isLoading: doctorReport.isLoading || patientReport.isLoading,
    isError: doctorReport.isError || patientReport.isError,
  }
}
