import type { ApiResponse } from "@/types/api.types";
import type { User } from "@/types/auth.types";
import type { PatientSummary } from "@/types/patient.types";

export const enum CaseStatus {
  PROCESSING = "processing",
  QUALITY_FAILED = "quality_failed",
  AWAITING_REVIEW = "awaiting_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  FAILED = "failed",
}

export type ImageQuality = "good" | "blurry" | "poor_lighting" | "overexposed";
export type PriorityTier = "critical" | "high" | "medium" | "low";

export interface CaseRecord {
  id: string;
  patientId: string;
  clinicId: string;
  submittedBy: string;
  imageUrl: string;
  imageQuality: ImageQuality;
  status: CaseStatus;
  priorityScore: number;
  priorityTier: PriorityTier;
  createdAt: string;
  updatedAt: string;
}

export interface CaseSummary {
  id: string;
  patientName: string;
  status: CaseStatus;
  priorityTier: PriorityTier;
  priorityScore: number;
  imageQuality: ImageQuality;
  drStatus: string;
  createdAt: string;
}

export type CaseDetail = CaseRecord & {
  patient: PatientSummary;
  submittedByUser: Pick<User, "id" | "fullName">;
};

export interface UploadCaseRequest {
  patientId: string;
  image: File;
}

export type UploadCaseResponse = ApiResponse<{
  caseId: string;
  status: CaseStatus;
  qualityCheck: ImageQuality;
  taskId: string;
  message: string;
}>;

export interface CaseListFilter {
  status?: CaseStatus;
  priorityTier?: PriorityTier;
  page?: number;
  limit?: number;
}

export interface WebSocketCaseEvent {
  type: "status_update" | "report_ready" | "quality_failed";
  caseId: string;
  status: CaseStatus;
  timestamp: string;
}

export interface CaseStatusResponse {
  status: CaseStatus;
  priorityScore?: number;
}
