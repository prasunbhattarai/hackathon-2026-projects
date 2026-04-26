import type { Gender } from "@/types/patient.types";

export type ReportType = "doctor" | "patient";

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
  disclaimer?: string;
}

export interface PatientReport {
  reportType: "patient";
  summary: string;
  whatWasFound: string;
  nextSteps: string;
  severityLabel: string;
  urgency: string;
  disclaimer?: string;
  generatedAt: string;
}

export interface GeneralReport {
  id: string;
  patientId: string;
  clinicId: string;
  submittedBy: string;
  imageUrl: string;
  imageQuality: string;
  status: string;
  priorityScore: number;
  priorityTier: string;
  createdAt: string;
  updatedAt: string;
  analysisResult: {
    id: string;
    caseId: string;
    dr: Record<string, unknown>;
    glaucoma: Record<string, unknown>;
    hypertensiveRetinopathy: Record<string, unknown>;
    finalDecision: string | null;
    recommendation: string | null;
    ragJustification: string | null;
    heatmapUrl: string | null;
    decisionConfidence: string | null;
    createdAt: string;
  };
}

export interface ReportBundle {
  doctor: DoctorReport;
  patient: PatientReport;
  general: GeneralReport;
}

export interface PDFDownloadUrl {
  url: string;
  expiresAt: string;
}
