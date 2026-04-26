"""
Admin request/response schemas.

Contract ref: CONTRACT.md §9
"""

from pydantic import BaseModel, EmailStr, Field

from app.schemas.enums import UserRole
from app.schemas.auth import UserOut


class ClinicOut(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    isActive: bool
    createdAt: str
    userCount: int | None = None
    caseCount: int | None = None

    model_config = {"from_attributes": True}


class CreateClinicRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=500)
    phone: str = Field(min_length=1, max_length=30)


class CreateUserRequest(BaseModel):
    email: EmailStr
    fullName: str = Field(min_length=1, max_length=200)
    role: UserRole = UserRole.DOCTOR
    clinicId: str | None = None


class UpdateUserStatusRequest(BaseModel):
    isActive: bool


class PlatformStatsOut(BaseModel):
    totalClinics: int
    totalUsers: int
    totalCases: int
    todayCases: int
    criticalCases: int
    avgProcessingTimeMs: float
