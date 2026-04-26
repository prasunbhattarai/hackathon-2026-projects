import { apiGet, apiPatch, apiPost, apiUpload } from "@/services/api.client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
  CaseDetail,
  CaseListFilter,
  CaseStatusResponse,
  CaseStatus,
  CaseSummary,
} from "@/types/case.types";

/** Fetch paginated case list with optional status/priority filters */
export async function getCases(
  filter: CaseListFilter = {},
): Promise<ApiResponse<PaginatedResponse<CaseSummary>>> {
  const params: Record<string, string> = {};
  if (filter.page) params.page = String(filter.page);
  if (filter.limit) params.limit = String(filter.limit);
  if (filter.status) params.status = filter.status;
  if (filter.priorityTier) params.priorityTier = filter.priorityTier;
  return apiGet<PaginatedResponse<CaseSummary>>("/cases", params);
}

/** Get full case detail with patient and submitter info */
export async function getCaseDetail(
  id: string,
): Promise<ApiResponse<CaseDetail>> {
  return apiGet<CaseDetail>(`/cases/${id}`);
}

/** Upload a new fundus image for AI processing */
export async function uploadCase(data: {
  patientId: string;
  image: File;
}): Promise<ApiResponse<{ caseId: string; status: string; taskId: string }>> {
  const formData = new FormData();
  formData.append("patientId", data.patientId);
  formData.append("image", data.image);
  return apiUpload<{ caseId: string; status: string; taskId: string }>(
    "/cases/upload",
    formData,
  );
}

/** Poll current processing status for a case */
export async function pollCaseStatus(
  id: string,
): Promise<ApiResponse<{ status: CaseStatus; priorityScore?: number }>> {
  return apiGet<{ status: CaseStatus; priorityScore?: number }>(
    `/cases/${id}/status`,
  );
}

/** Get the triage queue (critical/high priority awaiting review) */
export async function getTriageQueue(
  filter?: CaseListFilter,
): Promise<ApiResponse<PaginatedResponse<CaseSummary>>> {
  return getCases({ ...filter, status: "awaiting_review" as CaseStatus });
}

/** Approve a case after doctor review */
export async function approveCase(
  id: string,
): Promise<ApiResponse<CaseStatusResponse>> {
  return apiPatch<CaseStatusResponse>(`/cases/${id}/approve`, {});
}

/** Reject a case with reason */
export async function rejectCase(
  id: string,
  reason: string,
): Promise<ApiResponse<CaseStatusResponse>> {
  return apiPatch<CaseStatusResponse>(`/cases/${id}/reject`, { reason });
}
