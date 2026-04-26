"""
Auth endpoints — all token management is delegated to Supabase GoTrue.
The backend acts as a relay, syncing local user rows on each sign-in.

Routes:
  POST /auth/login           → exchange credentials for session
  GET  /auth/me              → return profile of the authenticated user
  POST /auth/refresh         → exchange refresh token for new access token
  POST /auth/logout          → revoke session server-side
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import services
from app.core.security import CurrentUser, verify_token
from app.db.deps import get_db
from app.schemas.auth import AuthSession, LoginRequest, LogoutResponse, RefreshRequest, RefreshResponse, UserOut
from app.schemas.base import ApiResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

_bearer = HTTPBearer(auto_error=True)


@router.post(
    "/login",
    response_model=ApiResponse[AuthSession],
    summary="Sign in with email and password",
)
def login(
    body: LoginRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[AuthSession]:
    session = auth_service.login(db, body.email, body.password)
    return ApiResponse(data=session)


@router.get(
    "/me",
    response_model=ApiResponse[UserOut],
    summary="Return the authenticated user's profile",
)
def me(current_user: CurrentUser) -> ApiResponse[UserOut]:
    from app.schemas.enums import UserRole

    out = UserOut(
        id=str(current_user.id),
        email=current_user.email,
        role=UserRole(current_user.role),
        clinicId=str(current_user.clinic_id) if current_user.clinic_id else None,
        fullName=current_user.full_name or "",
        isActive=current_user.is_active,
        createdAt=current_user.created_at.isoformat(),
    )
    return ApiResponse(data=out)


@router.post(
    "/refresh",
    response_model=ApiResponse[RefreshResponse],
    summary="Refresh the access token using a refresh token",
)
def refresh(
    body: RefreshRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[RefreshResponse]:
    result = auth_service.refresh(db, body.refreshToken)
    return ApiResponse(data=result)


@router.post(
    "/logout",
    response_model=ApiResponse[LogoutResponse],
    summary="Revoke the current session",
)
def logout(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(_bearer)],
) -> ApiResponse[LogoutResponse]:
    result = auth_service.logout(credentials.credentials)
    return ApiResponse(data=result)

