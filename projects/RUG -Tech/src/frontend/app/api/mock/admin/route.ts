import { NextResponse } from "next/server";
import { casesMock } from "@/mock/data/cases.mock";
import { clinicsMock } from "@/mock/data/clinics.mock";
import { usersMock } from "@/mock/data/users.mock";
import type { PlatformStats } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

function calculateStats(): PlatformStats {
	const todayDate = "2026-04-24";
	return {
		totalClinics: clinicsMock.length,
		totalUsers: usersMock.length,
		totalCases: casesMock.length,
		todayCases: casesMock.filter((item) => item.createdAt.startsWith(todayDate)).length,
		criticalCases: casesMock.filter((item) => item.priorityTier === "critical").length,
		avgProcessingTimeMs: 142500,
	};
}

export async function GET() {
	const response: ApiResponse<{ clinics: typeof clinicsMock; stats: PlatformStats }> = {
		success: true,
		data: {
			clinics: clinicsMock,
			stats: calculateStats(),
		},
		error: null,
	};

	return NextResponse.json(response);
}
