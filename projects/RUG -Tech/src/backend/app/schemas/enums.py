"""
All domain enumerations used across the FundusAI backend.

Defined once here and imported by models and schemas to prevent drift.
"""

from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    DOCTOR = "doctor"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class CaseStatus(str, Enum):
    PROCESSING = "processing"
    QUALITY_FAILED = "quality_failed"
    AWAITING_REVIEW = "awaiting_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    FAILED = "failed"


class ImageQuality(str, Enum):
    GOOD = "good"
    BLURRY = "blurry"
    POOR_LIGHTING = "poor_lighting"
    OVEREXPOSED = "overexposed"
    NON_FUNDUS = "non_fundus"


class PriorityTier(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DRStatus(str, Enum):
    NONE = "None"
    MILD = "Mild"
    MODERATE = "Moderate"
    SEVERE = "Severe"
    PDR = "PDR"


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class DecisionConfidence(str, Enum):
    CLEAR = "Clear diagnosis"
    SUSPICIOUS = "Suspicious, review needed"
    UNCERTAIN = "Uncertain, further tests recommended"


class ReportType(str, Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"


class ErrorCode(str, Enum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTH_REQUIRED = "AUTH_REQUIRED"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    UPLOAD_INVALID_TYPE = "UPLOAD_INVALID_TYPE"
    UPLOAD_TOO_LARGE = "UPLOAD_TOO_LARGE"
    UPLOAD_TOO_SMALL = "UPLOAD_TOO_SMALL"
    QUALITY_FAILED = "QUALITY_FAILED"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    INTERNAL_ERROR = "INTERNAL_ERROR"
