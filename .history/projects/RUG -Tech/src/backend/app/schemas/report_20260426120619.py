"""
Report schemas.

Contract ref: CONTRACT.md §8
"""

from pydantic import BaseModel

from app.schemas.enums import Gender, ReportType

DISCLAIMER = (
    "This tool is not a medical diagnostic system. "
    "Final decisions must be made by a qualified medical professional."
)


class ReportPatientInfo(BaseModel):
    fullName: str
    age: int
    gender: Gender


class ReportDiagnosis(BaseModel):
    primary: str
    severity: str
    confidence: str


class DoctorReportOut(BaseModel):
    reportType: ReportType = ReportType.DOCTOR
    patient: ReportPatientInfo
    diagnosis: ReportDiagnosis
    planOfAction: str
    medicationSuggestions: list[str]
    ragJustification: str
    heatmapUrl: str
    disclaimer: str = DISCLAIMER
    generatedAt: str


class PatientReportOut(BaseModel):
    reportType: ReportType = ReportType.PATIENT
    summary: str
    whatWasFound: str
    nextSteps: str
    severityLabel: str
    urgency: str
    disclaimer: str = DISCLAIMER
    generatedAt: str


class PDFDownloadUrlOut(BaseModel):
    url: str
    expiresAt: str


class GenerateReportRequest(BaseModel):
    caseId: str
    reportType: ReportType = ReportType.DOCTOR


class ReportOut(BaseModel):
    id: str
    caseId: str
    reportType: ReportType
    reportData: DoctorReportOut | PatientReportOut
    pdf: PDFDownloadUrlOut
    createdAt: str
