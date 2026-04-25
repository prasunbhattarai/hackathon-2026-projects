import type { CaseRecord, CaseSummary } from "@/types/case.types";
import type { Patient } from "@/types/patient.types";

export function casesToSummaries(cases: CaseRecord[], patients: Patient[]): CaseSummary[] {
	const patientById = new Map(patients.map((patient) => [patient.id, patient]));

	return cases.map((item) => ({
		id: item.id,
		patientName: patientById.get(item.patientId)?.fullName ?? "Unknown Patient",
		status: item.status,
		priorityTier: item.priorityTier,
		priorityScore: item.priorityScore,
		imageQuality: item.imageQuality,
		drStatus: "Unknown",
		createdAt: item.createdAt,
	}));
}
