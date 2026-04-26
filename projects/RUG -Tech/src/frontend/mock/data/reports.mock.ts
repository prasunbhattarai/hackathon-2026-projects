import { analysisResultsMock } from "@/mock/data/analysis.mock";
import { casesMock } from "@/mock/data/cases.mock";
import { patientsMock } from "@/mock/data/patients.mock";
import { usersMock } from "@/mock/data/users.mock";
import type { ReportBundle } from "@/types/report.types";

function ageFromDob(dateOfBirth: string): number {
  const now = new Date("2026-04-24T00:00:00.000Z");
  const dob = new Date(dateOfBirth);
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

const caseIdsWithAnalysis = Array.from(
  new Set(analysisResultsMock.map((item) => item.caseId)),
);

export const reportBundlesMock: ReportBundle[] = caseIdsWithAnalysis.map(
  (caseId, index) => {
    const caseRecord = casesMock.find((item) => item.id === caseId);
    const analysis = analysisResultsMock.find((item) => item.caseId === caseId);

    if (!caseRecord || !analysis) {
      throw new Error(`Unable to build report bundle for case ${caseId}`);
    }

    const patient = patientsMock.find(
      (item) => item.id === caseRecord.patientId,
    );
    if (!patient) {
      throw new Error(`Patient not found for case ${caseId}`);
    }

    const submitter = usersMock.find(
      (item) => item.id === caseRecord.submittedBy,
    );
    if (!submitter) {
      throw new Error(`Submitter not found for case ${caseId}`);
    }

    const patientCases = casesMock.filter(
      (item) => item.patientId === patient.id,
    );
    const lastCaseDate =
      patientCases
        .map((item) => item.createdAt)
        .sort((a, b) => b.localeCompare(a))[0] ?? caseRecord.createdAt;

    const severityText = analysis.dr.status;
    const urgency =
      analysis.severityLevel >= 4
        ? "Urgent"
        : analysis.severityLevel === 3
          ? "Priority"
          : "Routine";

    return {
      doctor: {
        reportType: "doctor",
        patient: {
          fullName: patient.fullName,
          age: ageFromDob(patient.dateOfBirth),
          gender: patient.gender,
        },
        diagnosis: {
          primary: `Diabetic Retinopathy - ${analysis.dr.status}`,
          severity: severityText,
          confidence: `${Math.round(analysis.dr.confidence * 100)}%`,
        },
        planOfAction:
          analysis.severityLevel >= 4
            ? "Refer to retina specialist and complete intervention workup within 48 hours."
            : "Maintain periodic retinal follow-up with blood pressure and glucose control review.",
        medicationSuggestions:
          analysis.severityLevel >= 3
            ? [
                "Optimize antihypertensive regimen",
                "Tight glycemic management",
                "Schedule specialist review",
              ]
            : [
                "Continue current systemic medications",
                "Lifestyle counseling",
                "Routine ophthalmic monitoring",
              ],
        ragJustification: analysis.ragJustification,
        heatmapUrl: analysis.heatmapUrl ?? `/images/sample_fundus.jpg`,
        generatedAt: analysis.createdAt,
      },
      patient: {
        reportType: "patient",
        summary:
          "Your retinal scan was analyzed using an AI screening model and reviewed for disease risk.",
        whatWasFound: `Findings are most consistent with ${analysis.dr.status} diabetic eye change and ${analysis.glaucoma.risk.toLowerCase()} glaucoma risk.`,
        nextSteps:
          analysis.severityLevel >= 4
            ? "Please visit the retina specialist as soon as possible for detailed treatment planning."
            : "Follow your regular eye check-up schedule and continue your current treatment plan.",
        severityLabel: severityText,
        urgency,
        generatedAt: analysis.createdAt,
      },
      general: {
        ...caseRecord,
        patient: {
          id: patient.id,
          fullName: patient.fullName,
          medicalId: patient.medicalId,
          age: ageFromDob(patient.dateOfBirth),
          lastCaseDate,
          totalCases: patientCases.length,
        },
        submittedByUser: {
          id: submitter.id,
          fullName: submitter.fullName,
        },
        analysisResult: analysis,
      },
    };
  },
);
