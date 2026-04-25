import { patientsMock } from "@/mock/data/patients.mock";
import { casesMock } from "@/mock/data/cases.mock";
import type { Patient, PatientSummary } from "@/types/patient.types";

function computeAge(dateOfBirth: string): number {
	const now = new Date("2026-04-24T00:00:00.000Z");
	const dob = new Date(dateOfBirth);
	let age = now.getUTCFullYear() - dob.getUTCFullYear();
	const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
	if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())) {
		age -= 1;
	}
	return age;
}

function getPatientCaseStats(patientId: string): { totalCases: number; lastCaseDate: string } {
	const patientCases = casesMock.filter((item) => item.patientId === patientId);
	const latest = patientCases.map((item) => item.createdAt).sort((a, b) => b.localeCompare(a))[0] ?? new Date().toISOString();
	return {
		totalCases: patientCases.length,
		lastCaseDate: latest,
	};
}

export function createMockPatient(overrides?: Partial<Patient>): Patient {
	const base = patientsMock[Math.floor(Math.random() * patientsMock.length)];
	return {
		...base,
		id: overrides?.id ?? `patient-generated-${Math.floor(Math.random() * 100000)}`,
		createdAt: overrides?.createdAt ?? new Date().toISOString(),
		updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
		...overrides,
	};
}

export function createMockPatientList(count: number): PatientSummary[] {
	if (count <= 0) return [];

	return Array.from({ length: count }, (_, index) => {
		const patient = patientsMock[index % patientsMock.length];
		const stats = getPatientCaseStats(patient.id);

		return {
			id: patient.id,
			fullName: patient.fullName,
			medicalId: patient.medicalId,
			age: computeAge(patient.dateOfBirth),
			lastCaseDate: stats.lastCaseDate,
			totalCases: stats.totalCases,
		};
	});
}
