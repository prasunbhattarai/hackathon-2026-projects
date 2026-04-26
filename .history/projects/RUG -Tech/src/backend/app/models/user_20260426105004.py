import uuid

from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import UserRole


class User(Base):
    """
    Mirror of Supabase auth.users. Supabase manages passwords/MFA;
    we store profile data and role here. The `id` must match the
    Supabase Auth user UUID so JWT sub == users.id.
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default=UserRole.DOCTOR.value)
    clinic_id = Column(
        UUID(as_uuid=True),
        ForeignKey("clinics.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # relationships
    clinic = relationship("Clinic", back_populates="users", lazy="noload")
    created_patients = relationship(
        "Patient", back_populates="created_by_user", lazy="noload"
    )
    submitted_cases = relationship("Case", back_populates="submitted_by_user", lazy="noload")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="noload")
