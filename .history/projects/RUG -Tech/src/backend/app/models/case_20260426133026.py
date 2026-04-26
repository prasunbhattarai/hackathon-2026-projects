import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import CaseStatus, ImageQuality, PriorityTier


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clinics.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # image
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    image_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_quality: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # status
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=CaseStatus.PROCESSING.value,
        index=True,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # priority (computed by AI pipeline)
    priority_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority_tier: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # celery task tracking
    task_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
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
