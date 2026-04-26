"""
Auth request/response schemas.

Contract ref: CONTRACT.md §4
"""

from pydantic import BaseModel, EmailStr, Field

from app.schemas.enums import UserRole


class UserOut(BaseModel):
    id: str
    email: str
    role: UserRole
    clinicId: str | None = None
    fullName: str
    isActive: bool
    createdAt: str

    model_config = {"from_attributes": True}


class AuthSession(BaseModel):
    user: UserOut
    accessToken: str
    tokenType: str = "Bearer"
    expiresIn: int = 3600


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RefreshRequest(BaseModel):
    refreshToken: str


class RefreshResponse(BaseModel):
    accessToken: str


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"
