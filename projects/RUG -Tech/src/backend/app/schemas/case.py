"""
Case request/response schemas.

Contract ref: CONTRACT.md §6
"""

from pydantic import BaseModel, Field

from app.schemas.enums import CaseStatus, ImageQuality, PriorityTier
from app.schemas.patient import PatientSummaryOut


class UploadCaseData(BaseModel):
    caseId: str
    status: CaseStatus = CaseStatus.PROCESSING
    qualityCheck: ImageQuality
    taskId: str
    message: str = "Image uploaded and queued for analysis"


class CaseStatusOut(BaseModel):
    status: CaseStatus
    priorityScore: float | None = None


class CaseSummaryOut(BaseModel):
    id: str
    patientName: str
    status: CaseStatus
    priorityTier: PriorityTier
    priorityScore: float
    imageQuality: ImageQuality
    drStatus: str
    createdAt: str

    model_config = {"from_attributes": True}


class SubmittedByUserOut(BaseModel):
    id: str
    fullName: str


class CaseDetailOut(BaseModel):
    id: str
    patientId: str
    clinicId: str
    submittedBy: str
    imageUrl: str
    imageQuality: ImageQuality
    status: CaseStatus
    priorityScore: float
    priorityTier: PriorityTier
    createdAt: str
    updatedAt: str
    patient: PatientSummaryOut
    submittedByUser: SubmittedByUserOut

    model_config = {"from_attributes": True}


class RejectCaseRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=500)
