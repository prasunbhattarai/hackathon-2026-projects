import type { PaginatedResponse } from "@/types/api.types";
import type { CaseSummary } from "@/types/case.types";

export type Gender = "male" | "female" | "other";

export interface Patient {
	id: string;
	clinicId: string;
	fullName: string;
	dateOfBirth: string;
	gender: Gender;
	contact: string;
	medicalId: string;
	createdAt: string;
	updatedAt: string;
}

export interface PatientSummary {
	id: string;
	fullName: string;
	medicalId: string;
	age: number;
	lastCaseDate: string | null;
	totalCases: number;
}

export type PatientDetail = Patient & { cases: CaseSummary[] };

export interface CreatePatientRequest {
	fullName: string;
	dateOfBirth: string;
	gender: Gender;
	contact: string;
	medicalId: string;
	clinicId?: string;
}

export type PatientListResponse = PaginatedResponse<PatientSummary>;
