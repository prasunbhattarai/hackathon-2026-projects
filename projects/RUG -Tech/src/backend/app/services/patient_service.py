"""
Patient CRUD service.

Clinic-scoping rules:
  - super_admin: sees all patients across all clinics
  - doctor: restricted to their own clinic_id

All mutations require the user to have a clinic_id (doctors always do;
super_admin with no clinic cannot create patients — they'd use admin APIs).
"""

import math
import uuid
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.patient import Patient
from app.models.user import User
from app.schemas.base import PaginatedResponse
from app.schemas.enums import Gender, UserRole
from app.schemas.patient import (
    CreatePatientRequest,
    PatientDetailOut,
    PatientSummaryOut,
    UpdatePatientRequest,
)


# ── helpers ────────────────────────────────────────────────────────────────────


def _calculate_age(dob: date | None) -> int:
    if dob is None:
        return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _assert_clinic(user: User) -> uuid.UUID:
    """Raise 400 if the user has no clinic_id."""
    if user.clinic_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no associated clinic. Contact an administrator.",
        )
    return user.clinic_id


def _clinic_filter(user: User) -> uuid.UUID | None:
    """Return clinic_id for doctors, None for super_admin (no filter)."""
    if user.role == UserRole.SUPER_ADMIN.value:
        return None
    return _assert_clinic(user)


def _to_summary(patient: Patient, last_case_date: datetime | None, total_cases: int) -> PatientSummaryOut:
    return PatientSummaryOut(
        id=str(patient.id),
        fullName=patient.full_name,
        medicalId=patient.medical_id or "",
        age=_calculate_age(patient.date_of_birth),
        lastCaseDate=last_case_date.isoformat() if last_case_date else None,
        totalCases=total_cases,
    )


def _to_detail(patient: Patient, cases: list[Any]) -> PatientDetailOut:
    return PatientDetailOut(
        id=str(patient.id),
        clinicId=str(patient.clinic_id),
        fullName=patient.full_name,
        dateOfBirth=patient.date_of_birth.isoformat() if patient.date_of_birth else "",
        gender=Gender(patient.gender) if patient.gender else Gender.OTHER,
        contact=patient.contact_phone or "",
        medicalId=patient.medical_id or "",
        createdAt=patient.created_at.isoformat(),
        updatedAt=patient.updated_at.isoformat(),
        cases=cases,
    )


# ── public service functions ───────────────────────────────────────────────────


def create_patient(
    db: Session,
    user: User,
    data: CreatePatientRequest,
) -> PatientDetailOut:
    clinic_id = _assert_clinic(user)

    # Enforce medical_id uniqueness within clinic (global unique is enforced by DB too)
    existing = db.execute(
        select(Patient).where(Patient.medical_id == data.medicalId)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A patient with medical ID '{data.medicalId}' already exists",
        )

    patient = Patient(
        id=uuid.uuid4(),
        clinic_id=clinic_id,
        full_name=data.fullName,
        date_of_birth=data.dateOfBirth,
        gender=data.gender.value,
        contact_phone=data.contact,
        medical_id=data.medicalId,
        created_by=user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return _to_detail(patient, [])


def list_patients(
    db: Session,
    user: User,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
) -> PaginatedResponse[PatientSummaryOut]:
    clinic_id = _clinic_filter(user)

    query = select(Patient)
    if clinic_id:
        query = query.where(Patient.clinic_id == clinic_id)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            Patient.full_name.ilike(pattern) | Patient.medical_id.ilike(pattern)
        )

    total: int = db.execute(
        select(func.count()).select_from(query.subquery())
    ).scalar_one()

    patients = db.execute(
        query.order_by(Patient.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()

    items: list[PatientSummaryOut] = []
    for p in patients:
        # last case date + count
        case_stats = db.execute(
            select(func.max(Case.created_at), func.count(Case.id)).where(
                Case.patient_id == p.id
            )
        ).one()
        items.append(_to_summary(p, case_stats[0], case_stats[1]))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        totalPages=math.ceil(total / limit) if total > 0 else 1,
    )


def get_patient(
    db: Session,
    user: User,
    patient_id: str,
) -> PatientDetailOut:
    clinic_id = _clinic_filter(user)

    patient = db.get(Patient, uuid.UUID(patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if clinic_id and patient.clinic_id != clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Minimal case stubs for detail view (full case list handled by /cases?patient_id=)
    return _to_detail(patient, [])


def update_patient(
    db: Session,
    user: User,
    patient_id: str,
    data: UpdatePatientRequest,
) -> PatientDetailOut:
    clinic_id = _clinic_filter(user)

    patient = db.get(Patient, uuid.UUID(patient_id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    if clinic_id and patient.clinic_id != clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if data.fullName is not None:
        patient.full_name = data.fullName
    if data.dateOfBirth is not None:
        patient.date_of_birth = data.dateOfBirth
    if data.gender is not None:
        patient.gender = data.gender.value
    if data.contact is not None:
        patient.contact_phone = data.contact
    if data.medicalId is not None:
        # check uniqueness if changed
        if data.medicalId != patient.medical_id:
            conflict = db.execute(
                select(Patient).where(Patient.medical_id == data.medicalId)
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A patient with medical ID '{data.medicalId}' already exists",
                )
        patient.medical_id = data.medicalId

    db.commit()
    db.refresh(patient)
    return _to_detail(patient, [])
