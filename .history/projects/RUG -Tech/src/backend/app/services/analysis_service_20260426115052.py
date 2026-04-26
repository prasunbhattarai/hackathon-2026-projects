"""
Analysis result service.

Provides read access to AnalysisResult rows (created by the Celery worker).
Doctors and admins can retrieve analysis data once a case reaches AWAITING_REVIEW.
"""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis_result import AnalysisResult
from app.models.case import Case
from app.models.user import User
from app.schemas.analysis import AnalysisResultOut
from app.schemas.enums import CaseStatus, UserRole


def _assert_case_access(user: User, case: Case) -> None:
    if user.role == UserRole.SUPER_ADMIN.value:
        return
    if user.clinic_id != case.clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def get_analysis_result(
    db: Session,
    user: User,
    case_id: str,
) -> AnalysisResultOut:
    """Return the analysis result for a case. Requires the case to be past PROCESSING."""
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    _assert_case_access(user, case)

    if case.status == CaseStatus.PROCESSING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis is still in progress. Poll GET /cases/{id}/status.",
        )

    result = db.execute(
        select(AnalysisResult).where(AnalysisResult.case_id == uuid.UUID(case_id))
    ).scalar_one_or_none()

    if result is None:
        # Case finished processing but no result row (e.g. FAILED / QUALITY_FAILED)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis result available for this case",
        )

    return AnalysisResultOut(
        id=str(result.id),
        caseId=str(result.case_id),
        drStatus=result.dr_status or "",
        drConfidence=result.dr_confidence or 0.0,
        drSeverityLevel=result.dr_severity_level or "",
        glaucomaRisk=result.glaucoma_risk or "",
        glaucomaConfidence=result.glaucoma_confidence or 0.0,
        hrRisk=result.hr_risk or "",
        hrConfidence=result.hr_confidence or 0.0,
        finalDecision=result.final_decision or "",
        recommendation=result.recommendation or "",
        ragJustification=result.rag_justification or "",
        heatmapUrl=result.heatmap_url,
        severityLevel=result.severity_level or "",
        decisionConfidence=result.decision_confidence or "",
        createdAt=result.created_at.isoformat(),
    )
