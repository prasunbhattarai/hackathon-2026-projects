import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import DecisionConfidence, DRStatus, RiskLevel


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # DR findings
    dr_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dr_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    dr_severity_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Glaucoma findings
    glaucoma_risk: Mapped[str | None] = mapped_column(String(20), nullable=True)
    glaucoma_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Hypertensive Retinopathy findings
    hr_risk: Mapped[str | None] = mapped_column(String(20), nullable=True)
    hr_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Overall decision
    final_decision: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    rag_justification: Mapped[str | None] = mapped_column(Text, nullable=True)
    heatmap_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    severity_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    decision_confidence: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    case = relationship("Case", back_populates="analysis_result", lazy="noload")
