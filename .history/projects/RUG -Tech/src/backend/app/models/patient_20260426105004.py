import uuid

from sqlalchemy import Column, Date, ForeignKey, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import Gender


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(
        UUID(as_uuid=True),
        ForeignKey("clinics.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)  # Gender enum value
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    medical_id = Column(String(100), nullable=True, unique=True, index=True)
    notes = Column(Text, nullable=True)
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # relationships
    clinic = relationship("Clinic", back_populates="patients", lazy="noload")
    created_by_user = relationship("User", back_populates="created_patients", lazy="noload")
    cases = relationship("Case", back_populates="patient", lazy="noload")
