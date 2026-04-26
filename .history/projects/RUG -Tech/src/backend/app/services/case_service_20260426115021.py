"""
Case CRUD service.

Upload flow (Chunk 4 — Celery dispatch stubbed):
  1. Validate image mime type + size
  2. Store a placeholder image_url (Cloudinary upload wired in Chunk 5)
  3. Create Case row with status=PROCESSING
  4. Return UploadCaseData (task_id is a placeholder UUID until Celery is wired)

Status transitions:
  PROCESSING → QUALITY_FAILED  (AI pipeline, Chunk 5)
  PROCESSING → AWAITING_REVIEW (AI pipeline, Chunk 5)
  AWAITING_REVIEW → APPROVED   (doctor/admin — this chunk)
  AWAITING_REVIEW → REJECTED   (doctor/admin — this chunk)
"""

import logging
import math
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.case import Case
from app.models.patient import Patient
from app.models.user import User
from app.schemas.base import PaginatedResponse
from app.schemas.case import (
    CaseDetailOut,
    CaseStatusOut,
    CaseSummaryOut,
    RejectCaseRequest,
    SubmittedByUserOut,
    UploadCaseData,
)
from app.schemas.enums import (
    CaseStatus,
    ImageQuality,
    PriorityTier,
    UserRole,
)
from app.schemas.patient import PatientSummaryOut

logger = logging.getLogger(__name__)

# Allowed upload MIME types
_ALLOWED_MIME = {"image/jpeg", "image/png"}


# ── helpers ────────────────────────────────────────────────────────────────────


def _clinic_filter(user: User) -> uuid.UUID | None:
    if user.role == UserRole.SUPER_ADMIN.value:
        return None
    if user.clinic_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no associated clinic.",
        )
    return user.clinic_id


def _assert_access(user: User, case: Case) -> None:
    """Raise 403 if doctor cannot access this case."""
    if user.role == UserRole.SUPER_ADMIN.value:
        return
    if user.clinic_id != case.clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _to_summary(case: Case, patient_name: str) -> CaseSummaryOut:
    return CaseSummaryOut(
        id=str(case.id),
        patientName=patient_name,
        status=CaseStatus(case.status),
        priorityTier=PriorityTier(case.priority_tier) if case.priority_tier else PriorityTier.LOW,
        priorityScore=case.priority_score or 0.0,
        imageQuality=ImageQuality(case.image_quality) if case.image_quality else ImageQuality.GOOD,
        drStatus="pending",
        createdAt=case.created_at.isoformat(),
    )


def _to_detail(case: Case, patient: Patient, submitter: User | None) -> CaseDetailOut:
    from app.schemas.enums import Gender
    from datetime import date

    def _age(dob: date | None) -> int:
        if dob is None:
            return 0
        from datetime import date as dt
        today = dt.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    patient_summary = PatientSummaryOut(
        id=str(patient.id),
        fullName=patient.full_name,
        medicalId=patient.medical_id or "",
        age=_age(patient.date_of_birth),
        lastCaseDate=None,
        totalCases=0,
    )
    submitted_by_out = SubmittedByUserOut(
        id=str(submitter.id) if submitter else "",
        fullName=submitter.full_name or "" if submitter else "",
    )
    return CaseDetailOut(
        id=str(case.id),
        patientId=str(case.patient_id),
        clinicId=str(case.clinic_id),
        submittedBy=str(case.submitted_by) if case.submitted_by else "",
        imageUrl=case.image_url,
        imageQuality=ImageQuality(case.image_quality) if case.image_quality else ImageQuality.GOOD,
        status=CaseStatus(case.status),
        priorityScore=case.priority_score or 0.0,
        priorityTier=PriorityTier(case.priority_tier) if case.priority_tier else PriorityTier.LOW,
        createdAt=case.created_at.isoformat(),
        updatedAt=case.updated_at.isoformat(),
        patient=patient_summary,
        submittedByUser=submitted_by_out,
    )


# ── public service functions ───────────────────────────────────────────────────


def upload_case(
    db: Session,
    user: User,
    patient_id: str,
    image: UploadFile,
) -> UploadCaseData:
    settings = get_settings()

    # ── validate patient access ────────────────────────────────────────────
    patient = db.get(Patient, uuid.UUID(patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    clinic_id = _clinic_filter(user)
    if clinic_id and patient.clinic_id != clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # ── validate image mime type ────────────────────────────────────────────
    content_type = image.content_type or ""
    if content_type not in _ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid image type '{content_type}'. Allowed: {', '.join(_ALLOWED_MIME)}",
        )

    # ── validate image size ─────────────────────────────────────────────────
    max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    chunk = image.file.read(max_bytes + 1)
    if len(chunk) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image exceeds maximum size of {settings.UPLOAD_MAX_SIZE_MB} MB",
        )
    image.file.seek(0)

    # ── upload to Cloudinary ───────────────────────────────────────────────
    try:
        from app.utils.cloudinary_client import upload_image
        upload_result = upload_image(image, folder="fundusai/fundus")
        image_url = upload_result["secure_url"]
        image_public_id = upload_result.get("public_id")
    except Exception as exc:
        logger.error("Cloudinary upload failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Image storage service unavailable. Please try again.",
        )

    # ── create case row ────────────────────────────────────────────────────
    case_id = uuid.uuid4()

    case = Case(
        id=case_id,
        patient_id=uuid.UUID(patient_id),
        clinic_id=patient.clinic_id,
        submitted_by=user.id,
        image_url=placeholder_url,
        image_quality=ImageQuality.GOOD.value,  # quality check happens in AI pipeline
        status=CaseStatus.PROCESSING.value,
        task_id=task_id,
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    return UploadCaseData(
        caseId=str(case.id),
        status=CaseStatus.PROCESSING,
        qualityCheck=ImageQuality.GOOD,
        taskId=task_id,
        message="Image uploaded and queued for analysis",
    )


def list_cases(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
    status_filter: CaseStatus | None = None,
    patient_id: str | None = None,
) -> PaginatedResponse[CaseSummaryOut]:
    clinic_id = _clinic_filter(user)

    query = select(Case)
    if clinic_id:
        query = query.where(Case.clinic_id == clinic_id)
    if status_filter:
        query = query.where(Case.status == status_filter.value)
    if patient_id:
        query = query.where(Case.patient_id == uuid.UUID(patient_id))

    total: int = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    cases = db.execute(
        query.order_by(Case.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()

    items: list[CaseSummaryOut] = []
    for c in cases:
        patient = db.get(Patient, c.patient_id)
        patient_name = patient.full_name if patient else "Unknown"
        items.append(_to_summary(c, patient_name))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        totalPages=math.ceil(total / limit) if total > 0 else 1,
    )


def get_case(
    db: Session,
    user: User,
    case_id: str,
) -> CaseDetailOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_access(user, case)

    patient = db.get(Patient, case.patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    submitter = db.get(User, case.submitted_by) if case.submitted_by else None
    return _to_detail(case, patient, submitter)


def get_case_status(
    db: Session,
    user: User,
    case_id: str,
) -> CaseStatusOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_access(user, case)

    return CaseStatusOut(
        status=CaseStatus(case.status),
        priorityScore=case.priority_score,
    )


def approve_case(
    db: Session,
    user: User,
    case_id: str,
) -> CaseStatusOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_access(user, case)

    if case.status != CaseStatus.AWAITING_REVIEW.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot approve a case with status '{case.status}'",
        )

    case.status = CaseStatus.APPROVED.value
    db.commit()
    db.refresh(case)
    return CaseStatusOut(status=CaseStatus.APPROVED, priorityScore=case.priority_score)


def reject_case(
    db: Session,
    user: User,
    case_id: str,
    data: RejectCaseRequest,
) -> CaseStatusOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_access(user, case)

    if case.status != CaseStatus.AWAITING_REVIEW.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot reject a case with status '{case.status}'",
        )

    case.status = CaseStatus.REJECTED.value
    case.rejection_reason = data.reason
    db.commit()
    db.refresh(case)
    return CaseStatusOut(status=CaseStatus.REJECTED, priorityScore=case.priority_score)
