import { analysisResultsMock } from "@/mock/data/analysis.mock";
import { reportBundlesMock } from "@/mock/data/reports.mock";
import type { AnalysisResult } from "@/types/analysis.types";
import type { ApiResponse } from "@/types/api.types";
import type { ReportBundle } from "@/types/report.types";

export async function getAnalysisByCaseIdMock(caseId: string): Promise<ApiResponse<AnalysisResult>> {
	const result = analysisResultsMock.find((item) => item.caseId === caseId);

	if (!result) {
		return {
			success: false,
			data: null as unknown as AnalysisResult,
			error: {
				code: "ANALYSIS_NOT_FOUND",
				message: "No analysis result found for this case.",
			},
		};
	}

	return {
		success: true,
		data: result,
		error: null,
	};
}

export async function getReportBundleByCaseIdMock(caseId: string): Promise<ApiResponse<ReportBundle>> {
	const result = reportBundlesMock.find((item) => item.general.id === caseId);

	if (!result) {
		return {
			success: false,
			data: null as unknown as ReportBundle,
			error: {
				code: "REPORT_NOT_FOUND",
				message: "No report bundle found for this case.",
			},
		};
	}

	return {
		success: true,
		data: result,
		error: null,
	};
}
