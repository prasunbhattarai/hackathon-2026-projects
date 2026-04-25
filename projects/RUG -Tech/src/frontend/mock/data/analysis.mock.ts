import { casesMock } from "@/mock/data/cases.mock";
import { CaseStatus } from "@/types/case.types";
import type {
	AnalysisResult,
	DecisionConfidence,
	DRStatus,
	RiskLevel,
	SeverityLevel,
} from "@/types/analysis.types";

const ragJustifications = [
	"Lesion clusters in the temporal quadrant and microaneurysm concentration suggest diabetic retinopathy progression.",
	"Cup-to-disc asymmetry with vessel attenuation indicates elevated glaucoma risk requiring specialist review.",
	"Arteriolar narrowing with flame-shaped hemorrhage pattern is consistent with hypertensive retinal changes.",
];

const drCycle: DRStatus[] = ["None", "Mild", "Moderate", "Severe", "PDR"];

function drToSeverity(status: DRStatus): SeverityLevel {
	switch (status) {
		case "None":
			return 1;
		case "Mild":
			return 2;
		case "Moderate":
			return 3;
		case "Severe":
		case "PDR":
			return 4;
		default:
			return 1;
	}
}

function confidenceAt(index: number, min = 0.45, max = 0.95): number {
	const span = max - min;
	const value = min + ((index * 37) % 100) / 100 * span;
	return Number(value.toFixed(2));
}

function riskFromSeverity(severity: SeverityLevel): RiskLevel {
	if (severity >= 4) return "High";
	if (severity === 3) return "Medium";
	return "Low";
}

function decisionConfidenceFromSeverity(severity: SeverityLevel): DecisionConfidence {
	if (severity >= 4) return "Suspicious, review needed";
	if (severity === 3) return "Uncertain, further tests recommended";
	return "Clear diagnosis";
}

const eligibleCases = casesMock.filter(
	(item) => item.status === CaseStatus.AWAITING_REVIEW || item.status === CaseStatus.APPROVED,
);

export const analysisResultsMock: AnalysisResult[] = Array.from({ length: 42 }, (_, index) => {
	const baseCase = eligibleCases[index % eligibleCases.length];
	const drStatus = drCycle[index % drCycle.length];
	const severityLevel = drToSeverity(drStatus);
	const drConfidence = confidenceAt(index, 0.5, 0.95);

	const glaucomaConfidence = confidenceAt(index + 11, 0.45, 0.9);
	const hrConfidence = confidenceAt(index + 19, 0.45, 0.88);

	const glaucomaRisk = glaucomaConfidence > 0.78 ? "High" : glaucomaConfidence > 0.62 ? "Medium" : "Low";
	const hrRisk = hrConfidence > 0.74 ? "High" : hrConfidence > 0.6 ? "Medium" : "Low";

	const createdAt = new Date(baseCase.updatedAt);
	createdAt.setUTCMinutes(createdAt.getUTCMinutes() + (index % 13) + 1);

	return {
		id: `analysis-${String(index + 1).padStart(3, "0")}`,
		caseId: baseCase.id,
		dr: {
			status: drStatus,
			confidence: drConfidence,
			severityLevel,
		},
		glaucoma: {
			risk: glaucomaRisk,
			confidence: glaucomaConfidence,
		},
		hypertensiveRetinopathy: {
			risk: hrRisk,
			confidence: hrConfidence,
		},
		finalDecision:
			severityLevel >= 4
				? "Immediate retina specialist review advised"
				: severityLevel === 3
					? "Detailed ophthalmic evaluation recommended within one week"
					: "Routine follow-up and monitoring advised",
		recommendation:
			riskFromSeverity(severityLevel) === "High"
				? "Prioritize in critical queue and perform OCT/IOP confirmation tests."
				: "Continue scheduled follow-up with glycemic and blood pressure control counseling.",
		ragJustification: ragJustifications[index % ragJustifications.length],
		heatmapUrl: severityLevel >= 3 ? `https://picsum.photos/seed/heatmap-${index + 1}/512/512` : null,
		severityLevel,
		decisionConfidence: decisionConfidenceFromSeverity(severityLevel),
		createdAt: createdAt.toISOString(),
	};
});
