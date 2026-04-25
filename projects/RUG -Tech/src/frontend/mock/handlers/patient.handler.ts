import { casesToSummaries } from "@/mock/factories/case.factory";
import { casesMock } from "@/mock/data/cases.mock";
import { patientsMock } from "@/mock/data/patients.mock";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { CreatePatientRequest, Patient, PatientDetail, PatientSummary } from "@/types/patient.types";

function computeAge(dateOfBirth: string): number {
	const now = new Date("2026-04-24T00:00:00.000Z");
	const dob = new Date(dateOfBirth);
	let age = now.getUTCFullYear() - dob.getUTCFullYear();
	const m = now.getUTCMonth() - dob.getUTCMonth();
	if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) {
		age -= 1;
	}
	return age;
}

function toSummary(patient: Patient): PatientSummary {
	const patientCases = casesMock.filter((item) => item.patientId === patient.id);
	const lastCaseDate = patientCases.map((item) => item.createdAt).sort((a, b) => b.localeCompare(a))[0] ?? patient.createdAt;

	return {
		id: patient.id,
		fullName: patient.fullName,
		medicalId: patient.medicalId,
		age: computeAge(patient.dateOfBirth),
		lastCaseDate,
		totalCases: patientCases.length,
	};
}

export async function listPatientsMock(
	clinicId: string,
	page = 1,
	limit = 10,
): Promise<ApiResponse<PaginatedResponse<PatientSummary>>> {
	const scoped = patientsMock.filter((item) => item.clinicId === clinicId);
	const start = (page - 1) * limit;
	const items = scoped.slice(start, start + limit).map(toSummary);
	const totalPages = Math.max(1, Math.ceil(scoped.length / limit));

	return {
		success: true,
		data: {
			items,
			total: scoped.length,
			page,
			limit,
			totalPages,
		},
		error: null,
	};
}

export async function getPatientDetailMock(patientId: string): Promise<ApiResponse<PatientDetail>> {
	const patient = patientsMock.find((item) => item.id === patientId);
	if (!patient) {
		return {
			success: false,
			data: null as unknown as PatientDetail,
			error: {
				code: "PATIENT_NOT_FOUND",
				message: "Requested patient does not exist.",
			},
		};
	}

	const patientCases = casesMock.filter((item) => item.patientId === patient.id);
	const summaries = casesToSummaries(patientCases, patientsMock);

	return {
		success: true,
		data: {
			...patient,
			cases: summaries,
		},
		error: null,
	};
}

export async function createPatientMock(
	clinicId: string,
	request: CreatePatientRequest,
): Promise<ApiResponse<Patient>> {
	const now = new Date().toISOString();
	const created: Patient = {
		id: `patient-${String(patientsMock.length + 1).padStart(3, "0")}`,
		clinicId,
		fullName: request.fullName,
		dateOfBirth: request.dateOfBirth,
		gender: request.gender,
		contact: request.contact,
		medicalId: request.medicalId,
		createdAt: now,
		updatedAt: now,
	};

	patientsMock.push(created);

	return {
		success: true,
		data: created,
		error: null,
	};
}
