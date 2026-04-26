"""
Cases endpoints.

Routes:
  POST   /cases/upload            → upload fundus image (multipart)
  GET    /cases                   → list cases (paginated, clinic-scoped)
  GET    /cases/{id}              → case detail
  GET    /cases/{id}/status       → lightweight status poll
  PATCH  /cases/{id}/approve      → mark as APPROVED
  PATCH  /cases/{id}/reject       → mark as REJECTED
"""

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.deps import get_db
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.case import (
    CaseDetailOut,
    CaseStatusOut,
    CaseSummaryOut,
    RejectCaseRequest,
    UploadCaseData,
)
from app.schemas.enums import CaseStatus
from app.services import case_service

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post(
    "/upload",
    response_model=ApiResponse[UploadCaseData],
    status_code=202,
    summary="Upload a fundus image to create a new case",
)
def upload_case(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    # Accept both `patient_id` (canonical) and `patientId` (legacy/FE variants).
    patient_id: str | None = Form(default=None),
    patientId: str | None = Form(default=None),
    # Accept both `image` (canonical) and `file` (legacy/FE variants).
    image: UploadFile | None = File(default=None),
    file: UploadFile | None = File(default=None),
) -> ApiResponse[UploadCaseData]:
    resolved_patient_id = patient_id or patientId
    resolved_image = image or file
    if not resolved_patient_id:
        # Let this remain a validation-style error for clients.
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing required form field 'patient_id'",
        )
    if resolved_image is None:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing required file field 'image'",
        )

    result = case_service.upload_case(db, current_user, resolved_patient_id, resolved_image)
    return ApiResponse.ok(result)


@router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[CaseSummaryOut]],
    summary="List cases (clinic-scoped for doctors)",
)
def list_cases(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status: CaseStatus | None = Query(default=None),
    priority_tier: str | None = Query(default=None, alias="priorityTier"),
    patient_id: str | None = Query(default=None),
) -> ApiResponse[PaginatedResponse[CaseSummaryOut]]:
    result = case_service.list_cases(db, current_user, page, limit, status, priority_tier, patient_id)
    return ApiResponse.ok(result)


@router.get(
    "/{case_id}",
    response_model=ApiResponse[CaseDetailOut],
    summary="Get case detail",
)
def get_case(
    case_id: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[CaseDetailOut]:
    case = case_service.get_case(db, current_user, case_id)
    return ApiResponse.ok(case)


@router.get(
    "/{case_id}/status",
    response_model=ApiResponse[CaseStatusOut],
    summary="Poll case processing status",
)
def get_case_status(
    case_id: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[CaseStatusOut]:
    result = case_service.get_case_status(db, current_user, case_id)
    return ApiResponse.ok(result)


@router.patch(
    "/{case_id}/approve",
    response_model=ApiResponse[CaseStatusOut],
    summary="Approve a case awaiting review",
)
def approve_case(
    case_id: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[CaseStatusOut]:
    result = case_service.approve_case(db, current_user, case_id)
    return ApiResponse.ok(result)


@router.patch(
    "/{case_id}/reject",
    response_model=ApiResponse[CaseStatusOut],
    summary="Reject a case awaiting review",
)
def reject_case(
    case_id: str,
    body: RejectCaseRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[CaseStatusOut]:
    result = case_service.reject_case(db, current_user, case_id, body)
    return ApiResponse.ok(result)

