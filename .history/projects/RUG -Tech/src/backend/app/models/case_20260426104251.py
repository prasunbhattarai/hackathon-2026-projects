import uuid

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import CaseStatus, ImageQuality, PriorityTier


class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    clinic_id = Column(
        UUID(as_uuid=True),
        ForeignKey("clinics.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    submitted_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # image
    image_url = Column(Text, nullable=False)
    image_public_id = Column(String(255), nullable=True)  # Cloudinary public_id
    image_quality = Column(String(50), nullable=True)  # ImageQuality enum value

    # status
    status = Column(
        String(50),
        nullable=False,
        default=CaseStatus.PROCESSING.value,
        index=True,
    )
    rejection_reason = Column(Text, nullable=True)

    # priority (computed by AI pipeline)
    priority_score = Column(Float, nullable=True)
    priority_tier = Column(String(20), nullable=True)  # PriorityTier enum value

    # celery task tracking
    task_id = Column(String(255), nullable=True, unique=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # relationships
    patient = relationship("Patient", back_populates="cases", lazy="noload")
    clinic = relationship("Clinic", back_populates="cases", lazy="noload")
    submitted_by_user = relationship("User", back_populates="submitted_cases", lazy="noload")
    analysis_result = relationship(
        "AnalysisResult",
        back_populates="case",
        uselist=False,
        lazy="noload",
    )
    reports = relationship("Report", back_populates="case", lazy="noload")
