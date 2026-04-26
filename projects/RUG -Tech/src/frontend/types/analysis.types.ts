export type DRStatus = "None" | "Mild" | "Moderate" | "Severe" | "PDR";
export type RiskLevel = "Low" | "Medium" | "High";
export type SeverityLevel = 1 | 2 | 3 | 4;
export type DecisionConfidence =
	| "Clear diagnosis"
	| "Suspicious, review needed"
	| "Uncertain, further tests recommended";

export interface DRResult {
	status: DRStatus;
	confidence: number;
	severityLevel?: SeverityLevel;
}

export interface DiseaseResult {
	risk: RiskLevel;
	confidence: number;
}

export interface AnalysisResult {
	id: string;
	caseId: string;
	dr: DRResult | Record<string, unknown>;
	glaucoma: DiseaseResult | Record<string, unknown>;
	hypertensiveRetinopathy: DiseaseResult | Record<string, unknown>;
	finalDecision: string | null;
	recommendation: string | null;
	ragJustification: string | null;
	heatmapUrl: string | null;
	severityLevel?: SeverityLevel;
	decisionConfidence: DecisionConfidence | string | null;
	createdAt: string;
}
