import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action = Column(String(100), nullable=False)         # e.g. "case.approved"
    resource_type = Column(String(50), nullable=True)    # e.g. "case", "patient"
    resource_id = Column(String(100), nullable=True)     # UUID as string for flexibility
    ip_address = Column(String(45), nullable=True)       # IPv4 or IPv6
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # relationships
    user = relationship("User", back_populates="audit_logs", lazy="noload")
