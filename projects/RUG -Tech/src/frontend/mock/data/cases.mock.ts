import { casesToSummaries } from "@/mock/factories/case.factory";
import { patientsMock } from "@/mock/data/patients.mock";
import { usersMock } from "@/mock/data/users.mock";
import {
  CaseStatus,
  type CaseRecord,
  type ImageQuality,
} from "@/types/case.types";

const CASE_STATUSES: CaseStatus[] = [
  ...Array.from({ length: 5 }, () => CaseStatus.PROCESSING),
  ...Array.from({ length: 3 }, () => CaseStatus.QUALITY_FAILED),
  ...Array.from({ length: 30 }, () => CaseStatus.AWAITING_REVIEW),
  ...Array.from({ length: 5 }, () => CaseStatus.APPROVED),
  ...Array.from({ length: 2 }, () => CaseStatus.REJECTED),
  ...Array.from({ length: 5 }, () => CaseStatus.FAILED),
];

const IMAGE_QUALITIES: ImageQuality[] = [
  ...Array.from({ length: 40 }, () => "good" as const),
  ...Array.from({ length: 5 }, () => "blurry" as const),
  ...Array.from({ length: 5 }, () => "poor_lighting" as const),
];

const submitterIds = usersMock
  .filter((user) => user.role === "doctor")
  .map((user) => user.id);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToTier(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function getBaseScore(status: CaseStatus): number {
  switch (status) {
    case CaseStatus.PROCESSING:
      return 0.56;
    case CaseStatus.QUALITY_FAILED:
      return 0.38;
    case CaseStatus.AWAITING_REVIEW:
      return 0.71;
    case CaseStatus.APPROVED:
      return 0.48;
    case CaseStatus.REJECTED:
      return 0.67;
    case CaseStatus.FAILED:
      return 0.33;
    default:
      return 0.5;
  }
}

function drStatusFromScore(score: number): string {
  if (score >= 0.9) return "PDR";
  if (score >= 0.78) return "Severe";
  if (score >= 0.62) return "Moderate";
  if (score >= 0.48) return "Mild";
  return "None";
}

export const casesMock: CaseRecord[] = Array.from(
  { length: 50 },
  (_, index) => {
    const status = CASE_STATUSES[index];
    const imageQuality = IMAGE_QUALITIES[index];
    const patient = patientsMock[index % patientsMock.length];
    const score = clamp(
      Number((getBaseScore(status) + ((index % 11) - 5) * 0.045).toFixed(2)),
      0.01,
      0.99,
    );

    const createdAt = new Date("2026-01-01T03:00:00.000Z");
    createdAt.setUTCDate(createdAt.getUTCDate() + index);

    const updatedAt = new Date(createdAt);
    updatedAt.setUTCHours(updatedAt.getUTCHours() + ((index % 9) + 1));

    return {
      id: `case-${String(index + 1).padStart(3, "0")}`,
      patientId: patient.id,
      clinicId: patient.clinicId,
      submittedBy: submitterIds[index % submitterIds.length],
      imageUrl: `/images/sample_fundus.jpg`,
      imageQuality,
      status,
      priorityScore: score,
      priorityTier: scoreToTier(score),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  },
);

export const caseSummariesMock = casesToSummaries(casesMock, patientsMock).map(
  (summary, index) => ({
    ...summary,
    drStatus: drStatusFromScore(casesMock[index].priorityScore),
  }),
);
