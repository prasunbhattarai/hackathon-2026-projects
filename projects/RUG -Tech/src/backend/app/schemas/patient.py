"""
Patient request/response schemas.

Contract ref: CONTRACT.md
"""

from datetime import date

from pydantic import BaseModel, Field

from app.schemas.enums import Gender


class CreatePatientRequest(BaseModel):
    fullName: str = Field(min_length=1, max_length=200)
    dateOfBirth: date
    gender: Gender
    contact: str = Field(min_length=1, max_length=50)
    medicalId: str = Field(min_length=1, max_length=100)
    clinicId: str | None = Field(default=None, min_length=1, max_length=100)


class UpdatePatientRequest(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=200)
    dateOfBirth: date | None = None
    gender: Gender | None = None
    contact: str | None = Field(default=None, min_length=1, max_length=50)
    medicalId: str | None = Field(default=None, min_length=1, max_length=100)


class PatientSummaryOut(BaseModel):
    id: str
    fullName: str
    medicalId: str
    age: int
    lastCaseDate: str | None = None
    totalCases: int

    model_config = {"from_attributes": True}


class PatientDetailOut(BaseModel):
    id: str
    clinicId: str
    fullName: str
    dateOfBirth: str
    gender: Gender
    contact: str
    medicalId: str
    createdAt: str
    updatedAt: str
    cases: list  # list[CaseSummaryOut] — populated at service layer to avoid circular import

    model_config = {"from_attributes": True}
