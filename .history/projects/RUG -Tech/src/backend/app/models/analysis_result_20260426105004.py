import uuid

from sqlalchemy import Column, Float, ForeignKey, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import DecisionConfidence, DRStatus, RiskLevel


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # DR findings
    dr_status = Column(String(50), nullable=True)           # DRStatus enum value
    dr_confidence = Column(Float, nullable=True)            # 0.0–1.0
    dr_severity_level = Column(String(50), nullable=True)   # mapped from DRStatus

    # Glaucoma findings
    glaucoma_risk = Column(String(20), nullable=True)       # RiskLevel enum value
    glaucoma_confidence = Column(Float, nullable=True)      # 0.0–1.0

    # Hypertensive Retinopathy findings
    hr_risk = Column(String(20), nullable=True)             # RiskLevel enum value
    hr_confidence = Column(Float, nullable=True)            # 0.0–1.0

    # Overall decision
    final_decision = Column(String(255), nullable=True)
    recommendation = Column(Text, nullable=True)
    rag_justification = Column(Text, nullable=True)         # RAG-sourced clinical context
    heatmap_url = Column(Text, nullable=True)               # Grad-CAM heatmap Cloudinary URL
    severity_level = Column(String(50), nullable=True)
    decision_confidence = Column(String(100), nullable=True)  # DecisionConfidence enum value

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    case = relationship("Case", back_populates="analysis_result", lazy="noload")
