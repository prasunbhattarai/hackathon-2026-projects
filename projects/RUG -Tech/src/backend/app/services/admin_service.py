"""
Admin service 

Platform-wide operations for super_admin users:
- clinic management
- user management
- aggregate dashboard stats
"""

from __future__ import annotations

import statistics
import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.clinic import Clinic
from app.models.user import User
from app.schemas.admin import ClinicOut, CreateClinicRequest, CreateUserRequest, PlatformStatsOut, UpdateUserStatusRequest
from app.schemas.auth import UserOut
from app.schemas.enums import CaseStatus, PriorityTier, UserRole


def _to_user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        email=user.email,
        role=UserRole(user.role),
        clinicId=str(user.clinic_id) if user.clinic_id else None,
        fullName=user.full_name or "",
        isActive=user.is_active,
        createdAt=user.created_at.isoformat(),
    )


def list_clinics(db: Session) -> list[ClinicOut]:
    clinics = db.execute(
        select(Clinic).order_by(Clinic.created_at.desc())
    ).scalars().all()

    result: list[ClinicOut] = []
    for clinic in clinics:
        user_count = db.execute(
            select(func.count(User.id)).where(User.clinic_id == clinic.id)
        ).scalar_one()
        case_count = db.execute(
            select(func.count(Case.id)).where(Case.clinic_id == clinic.id)
        ).scalar_one()

        created_at = getattr(clinic, "created_at", None)
        result.append(
            ClinicOut(
                id=str(getattr(clinic, "id", "")),
                name=getattr(clinic, "name", ""),
                address=getattr(clinic, "address", "") or "",
                phone=getattr(clinic, "phone", "") or "",
                isActive=getattr(clinic, "is_active", False),
                createdAt=created_at.isoformat() if created_at else "",
                userCount=user_count,
                caseCount=case_count,
            )
        )

    return result


def create_clinic(db: Session, data: CreateClinicRequest) -> ClinicOut:
    clinic = Clinic(
        id=uuid.uuid4(),
        name=data.name,
        address=data.address,
        phone=data.phone,
        is_active=True,
    )
    db.add(clinic)
    db.commit()
    db.refresh(clinic)

    created_at = getattr(clinic, "created_at", None)
    return ClinicOut(
        id=str(getattr(clinic, "id", "")),
        name=getattr(clinic, "name", ""),
        address=getattr(clinic, "address", "") or "",
        phone=getattr(clinic, "phone", "") or "",
        isActive=getattr(clinic, "is_active", False),
        createdAt=created_at.isoformat() if created_at else "",
        userCount=0,
        caseCount=0,
    )


def list_users(db: Session, clinic_id: str | None = None) -> list[UserOut]:
    query = select(User)
    if clinic_id:
        query = query.where(User.clinic_id == uuid.UUID(clinic_id))

    users = db.execute(query.order_by(User.created_at.desc())).scalars().all()
    return [_to_user_out(user) for user in users]


def create_user(db: Session, data: CreateUserRequest) -> UserOut:
    if data.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only doctor accounts can be created from this endpoint",
        )
    if not data.clinicId:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="clinicId is required when creating doctor accounts",
        )

    existing = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    parsed_clinic_id = uuid.UUID(data.clinicId) if data.clinicId else None
    if parsed_clinic_id:
        clinic = db.get(Clinic, parsed_clinic_id)
        if clinic is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clinic not found")

    user = User(
        id=uuid.uuid4(),
        email=str(data.email),
        full_name=data.fullName,
        role=data.role.value,
        clinic_id=parsed_clinic_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _to_user_out(user)


def update_user_status(
    db: Session,
    user_id: str,
    data: UpdateUserStatusRequest,
) -> UserOut:
    user = db.get(User, uuid.UUID(user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = data.isActive
    db.commit()
    db.refresh(user)
    return _to_user_out(user)


def get_platform_stats(db: Session) -> PlatformStatsOut:
    total_clinics = db.execute(select(func.count(Clinic.id))).scalar_one()
    total_users = db.execute(select(func.count(User.id))).scalar_one()
    total_cases = db.execute(select(func.count(Case.id))).scalar_one()

    today = datetime.now(UTC).date()
    all_cases = db.execute(select(Case)).scalars().all()

    today_cases = 0
    critical_cases = 0
    durations_ms: list[float] = []

    for case in all_cases:
        created_at = case.created_at
        updated_at = case.updated_at

        if created_at is not None:
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=UTC)
            if created_at.date() == today:
                today_cases += 1

        if case.priority_tier == PriorityTier.CRITICAL.value:
            critical_cases += 1

        if (
            case.status != CaseStatus.PROCESSING.value
            and created_at is not None
            and updated_at is not None
        ):
            start = created_at if created_at.tzinfo else created_at.replace(tzinfo=UTC)
            end = updated_at if updated_at.tzinfo else updated_at.replace(tzinfo=UTC)
            if end >= start:
                durations_ms.append((end - start).total_seconds() * 1000)

    avg_processing = statistics.fmean(durations_ms) if durations_ms else 0.0

    return PlatformStatsOut(
        totalClinics=total_clinics,
        totalUsers=total_users,
        totalCases=total_cases,
        todayCases=today_cases,
        criticalCases=critical_cases,
        avgProcessingTimeMs=round(avg_processing, 2),
    )
