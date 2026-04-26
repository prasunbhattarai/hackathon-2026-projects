import { apiGet, apiPost, apiPut } from "@/services/api.client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  CreatePatientRequest,
  Patient,
  PatientDetail,
  PatientSummary,
} from "@/types/patient.types";

/** Fetch paginated patient list with optional filters */
export async function getPatients(filter: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<PaginatedResponse<PatientSummary>>> {
  const params: Record<string, string> = {};
  if (filter.page) params.page = String(filter.page);
  if (filter.limit) params.limit = String(filter.limit);
  if (filter.search) params.search = filter.search;
  return apiGet<PaginatedResponse<PatientSummary>>("/patients", params);
}

/** Get full patient detail including case history */
export async function getPatientDetail(
  id: string,
): Promise<ApiResponse<PatientDetail>> {
  return apiGet<PatientDetail>(`/patients/${id}`);
}

/** Create a new patient record */
export async function createPatient(
  data: CreatePatientRequest,
): Promise<ApiResponse<Patient>> {
  return apiPost<Patient>("/patients", data);
}

/** Update an existing patient's information */
export async function updatePatient(
  id: string,
  data: Partial<CreatePatientRequest>,
): Promise<ApiResponse<Patient>> {
  return apiPut<Patient>(`/patients/${id}`, data);
}
