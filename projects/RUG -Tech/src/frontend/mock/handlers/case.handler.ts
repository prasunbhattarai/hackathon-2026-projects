import { caseSummariesMock, casesMock } from "@/mock/data/cases.mock";
import { patientsMock } from "@/mock/data/patients.mock";
import { usersMock } from "@/mock/data/users.mock";
import { CaseStatus, type CaseDetail, type CaseListFilter, type UploadCaseResponse } from "@/types/case.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

function getAge(dateOfBirth: string): number {
	const now = new Date("2026-04-24T00:00:00.000Z");
	const dob = new Date(dateOfBirth);
	let age = now.getUTCFullYear() - dob.getUTCFullYear();
	const m = now.getUTCMonth() - dob.getUTCMonth();
	if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) {
		age -= 1;
	}
	return age;
}

export async function listCasesMock(
	clinicId: string,
	filter: CaseListFilter = {},
): Promise<ApiResponse<PaginatedResponse<(typeof caseSummariesMock)[number]>>> {
	const page = filter.page ?? 1;
	const limit = filter.limit ?? 10;

	const scopedIds = new Set(casesMock.filter((item) => item.clinicId === clinicId).map((item) => item.id));

	let items = caseSummariesMock.filter((item) => scopedIds.has(item.id));

	if (filter.status) {
		items = items.filter((item) => item.status === filter.status);
	}

	if (filter.priorityTier) {
		items = items.filter((item) => item.priorityTier === filter.priorityTier);
	}

	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const start = (page - 1) * limit;

	return {
		success: true,
		data: {
			items: items.slice(start, start + limit),
			total,
			page,
			limit,
			totalPages,
		},
		error: null,
	};
}

export async function getCaseDetailMock(caseId: string): Promise<ApiResponse<CaseDetail>> {
	const caseRecord = casesMock.find((item) => item.id === caseId);
	if (!caseRecord) {
		return {
			success: false,
			data: null as unknown as CaseDetail,
			error: {
				code: "CASE_NOT_FOUND",
				message: "Requested case does not exist.",
			},
		};
	}

	const patient = patientsMock.find((item) => item.id === caseRecord.patientId);
	const submitter = usersMock.find((item) => item.id === caseRecord.submittedBy);

	if (!patient || !submitter) {
		return {
			success: false,
			data: null as unknown as CaseDetail,
			error: {
				code: "CASE_DATA_INTEGRITY",
				message: "Case references missing patient or submitter.",
			},
		};
	}

	const patientCases = casesMock.filter((item) => item.patientId === patient.id);
	const lastCaseDate = patientCases
		.map((item) => item.createdAt)
		.sort((a, b) => b.localeCompare(a))[0] ?? caseRecord.createdAt;

	return {
		success: true,
		data: {
			...caseRecord,
			patient: {
				id: patient.id,
				fullName: patient.fullName,
				medicalId: patient.medicalId,
				age: getAge(patient.dateOfBirth),
				lastCaseDate,
				totalCases: patientCases.length,
			},
			submittedByUser: {
				id: submitter.id,
				fullName: submitter.fullName,
			},
		},
		error: null,
	};
}

export async function uploadCaseMock(patientId: string): Promise<UploadCaseResponse> {
	const patient = patientsMock.find((item) => item.id === patientId);
	if (!patient) {
		return {
			success: false,
			data: null as unknown as UploadCaseResponse["data"],
			error: {
				code: "PATIENT_NOT_FOUND",
				message: "Patient not found for upload.",
			},
		};
	}

	const caseId = `case-${String(casesMock.length + 1).padStart(3, "0")}`;
	const taskId = `task-${String(Date.now()).slice(-8)}`;

	return {
		success: true,
		data: {
			caseId,
			status: CaseStatus.PROCESSING,
			qualityCheck: "good",
			taskId,
			message: "Upload accepted and queued for AI processing.",
		},
		error: null,
	};
}
