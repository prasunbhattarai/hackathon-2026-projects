"""
Analysis result schemas.

Contract ref: CONTRACT.md §7
"""

from pydantic import BaseModel, Field

from app.schemas.enums import DecisionConfidence, DRStatus, RiskLevel


class DRResultOut(BaseModel):
    status: DRStatus
    confidence: float = Field(ge=0.0, le=1.0)
    severityLevel: int = Field(ge=1, le=4)


class DiseaseResultOut(BaseModel):
    risk: RiskLevel
    confidence: float = Field(ge=0.0, le=1.0)


class AnalysisResultOut(BaseModel):
    id: str
    caseId: str
    dr: DRResultOut
    glaucoma: DiseaseResultOut
    hypertensiveRetinopathy: DiseaseResultOut
    finalDecision: str
    recommendation: str
    ragJustification: str
    heatmapUrl: str | None = None
    severityLevel: int = Field(ge=1, le=4)
    decisionConfidence: DecisionConfidence
    createdAt: str

    model_config = {"from_attributes": True}
