"""Database seed helpers for local development.

This module seeds a demo clinic and two users:
- super_admin user
- doctor user linked to the demo clinic

Important: backend authentication is Supabase JWT based. These rows seed local
metadata only, not Supabase Auth passwords/accounts.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.clinic import Clinic
from app.models.user import User
from app.schemas.enums import UserRole


@dataclass(frozen=True)
class SeedConfig:
    clinic_name: str = "CareDevi Demo Eye Clinic"
    clinic_address: str = "Kathmandu, Nepal"
    clinic_phone: str = "+977-1-555-0100"

    admin_email: str = "admin.demo@caredevi.ai"
    admin_full_name: str = "CareDevi Super Admin"

    doctor_email: str = "doctor.demo@caredevi.ai"
    doctor_full_name: str = "CareDevi Demo Doctor"


def _ensure_clinic(db: Session, cfg: SeedConfig) -> Clinic:
    clinic = db.execute(
        select(Clinic).where(Clinic.name == cfg.clinic_name)
    ).scalar_one_or_none()

    if clinic is None:
        clinic = Clinic(
            id=uuid.uuid4(),
            name=cfg.clinic_name,
            address=cfg.clinic_address,
            phone=cfg.clinic_phone,
            is_active=True,
        )
        db.add(clinic)
        db.flush()
    else:
        clinic.address = cfg.clinic_address
        clinic.phone = cfg.clinic_phone
        clinic.is_active = True

    return clinic


def _ensure_user(
    db: Session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
    clinic_id: uuid.UUID | None,
) -> User:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    if user is None:
        user = User(
            id=uuid.uuid4(),
            email=email,
            full_name=full_name,
            role=role.value,
            clinic_id=clinic_id,
            is_active=True,
        )
        db.add(user)
        db.flush()
    else:
        user.full_name = full_name
        user.role = role.value
        user.clinic_id = clinic_id
        user.is_active = True

    return user


def seed_dev_data(db: Session, cfg: SeedConfig | None = None) -> dict[str, str]:
    cfg = cfg or SeedConfig()

    clinic = _ensure_clinic(db, cfg)
    admin = _ensure_user(
        db,
        email=cfg.admin_email,
        full_name=cfg.admin_full_name,
        role=UserRole.SUPER_ADMIN,
        clinic_id=None,
    )
    doctor = _ensure_user(
        db,
        email=cfg.doctor_email,
        full_name=cfg.doctor_full_name,
        role=UserRole.DOCTOR,
        clinic_id=clinic.id,
    )

    db.commit()

    return {
        "clinicId": str(clinic.id),
        "adminUserId": str(admin.id),
        "doctorUserId": str(doctor.id),
        "adminEmail": admin.email,
        "doctorEmail": doctor.email,
    }
