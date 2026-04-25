import type { AnalysisResult } from "@/types/analysis.types";
import type { CaseDetail } from "@/types/case.types";
import type { Gender } from "@/types/patient.types";

export type ReportType = "doctor" | "patient" | "general";

export interface DoctorReport {
	reportType: "doctor";
	patient: {
		fullName: string;
		age: number;
		gender: Gender;
	};
	diagnosis: {
		primary: string;
		severity: string;
		confidence: string;
	};
	planOfAction: string;
	medicationSuggestions: string[];
	ragJustification: string;
	heatmapUrl: string;
	generatedAt: string;
}

export interface PatientReport {
	reportType: "patient";
	summary: string;
	whatWasFound: string;
	nextSteps: string;
	severityLabel: string;
	urgency: string;
}

export type GeneralReport = CaseDetail & { analysisResult: AnalysisResult };

export interface ReportBundle {
	doctor: DoctorReport;
	patient: PatientReport;
	general: GeneralReport;
}

export interface PDFDownloadUrl {
	url: string;
	expiresAt: string;
}
