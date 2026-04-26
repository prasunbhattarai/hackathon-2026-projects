import uuid

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base
from app.schemas.enums import ReportType


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    report_type = Column(String(20), nullable=False)  # ReportType enum value
    content_json = Column(JSONB, nullable=True)        # structured report data
    pdf_url = Column(Text, nullable=True)              # Cloudinary signed URL
    pdf_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relationships
    case = relationship("Case", back_populates="reports", lazy="noload")
