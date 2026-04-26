"""
Patients endpoints.

Routes:
  POST   /patients            → create patient (any authenticated user in a clinic)
  GET    /patients            → list patients (paginated, clinic-scoped for doctors)
  GET    /patients/{id}       → patient detail
  PUT    /patients/{id}       → update patient
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import CurrentUser
from app.db.deps import get_db
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.patient import (
    CreatePatientRequest,
    PatientDetailOut,
    PatientSummaryOut,
    UpdatePatientRequest,
)
from app.services import patient_service

router = APIRouter(prefix="/patients", tags=["patients"])


@router.post(
    "",
    response_model=ApiResponse[PatientDetailOut],
    status_code=201,
    summary="Create a new patient",
)
def create_patient(
    body: CreatePatientRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[PatientDetailOut]:
    patient = patient_service.create_patient(db, current_user, body)
    return ApiResponse.ok(patient)


@router.get(
    "",
    response_model=ApiResponse[PaginatedResponse[PatientSummaryOut]],
    summary="List patients (clinic-scoped for doctors)",
)
def list_patients(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
) -> ApiResponse[PaginatedResponse[PatientSummaryOut]]:
    result = patient_service.list_patients(db, current_user, page, limit, search)
    return ApiResponse.ok(result)


@router.get(
    "/{patient_id}",
    response_model=ApiResponse[PatientDetailOut],
    summary="Get patient detail",
)
def get_patient(
    patient_id: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[PatientDetailOut]:
    patient = patient_service.get_patient(db, current_user, patient_id)
    return ApiResponse.ok(patient)


@router.put(
    "/{patient_id}",
    response_model=ApiResponse[PatientDetailOut],
    summary="Update patient",
)
def update_patient(
    patient_id: str,
    body: UpdatePatientRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> ApiResponse[PatientDetailOut]:
    patient = patient_service.update_patient(db, current_user, patient_id, body)
    return ApiResponse.ok(patient)

