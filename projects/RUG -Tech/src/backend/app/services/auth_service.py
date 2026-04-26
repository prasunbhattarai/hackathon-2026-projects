"""
Auth service: bridges Supabase GoTrue responses to local User rows.

Responsibilities:
- Call Supabase Auth for sign-in / refresh / logout
- Upsert the local `users` row on first login (sync email + role from JWT)
- Map GoTrue token payload → AuthSession schema
"""

import uuid
from typing import Any

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import AuthSession, LogoutResponse, RefreshResponse, UserOut
from app.schemas.enums import UserRole
from app.utils.supabase import supabase_logout, supabase_refresh, supabase_sign_in


def _map_user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        email=user.email,
        role=UserRole(user.role),
        clinicId=str(user.clinic_id) if user.clinic_id else None,
        fullName=user.full_name or "",
        isActive=user.is_active,
        createdAt=user.created_at.isoformat(),
    )


def _upsert_user(db: Session, supabase_user: dict[str, Any]) -> User:
    """
    Ensure a local User row exists that mirrors the Supabase auth user.
    Creates or updates: email, full_name.
    Role is set from `app_metadata.role` if present, otherwise defaults to 'doctor'.
    """
    user_id = uuid.UUID(supabase_user["id"])
    email: str = supabase_user.get("email", "")
    full_name: str = (supabase_user.get("user_metadata") or {}).get("full_name", "")

    # Role stored in app_metadata (set by super_admin via Supabase dashboard / admin API)
    app_meta: dict = supabase_user.get("app_metadata") or {}
    raw_role = app_meta.get("role", UserRole.DOCTOR.value)
    # Validate role; fall back to doctor if unknown value
    try:
        role = UserRole(raw_role).value
    except ValueError:
        role = UserRole.DOCTOR.value

    user = db.get(User, user_id)
    if user is None:
        user = User(
            id=user_id,
            email=email,
            full_name=full_name or None,
            role=role,
        )
        db.add(user)
    else:
        # Keep email in sync; don't overwrite role if already set in DB
        user.email = email
        if full_name:
            user.full_name = full_name

    db.commit()
    db.refresh(user)
    return user


def login(db: Session, email: str, password: str) -> AuthSession:
    """Sign in via Supabase and sync local user row."""
    try:
        token_data = supabase_sign_in(email, password)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (400, 422):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service unavailable",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach authentication service",
        )

    supabase_user: dict = token_data.get("user") or {}
    user = _upsert_user(db, supabase_user)

    return AuthSession(
        user=_map_user_out(user),
        accessToken=token_data["access_token"],
        tokenType="Bearer",
        expiresIn=token_data.get("expires_in", 3600),
    )


def refresh(db: Session, refresh_token: str) -> RefreshResponse:
    """Exchange refresh token for a new access token."""
    try:
        token_data = supabase_refresh(refresh_token)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (400, 401, 422):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid or expired",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service unavailable",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach authentication service",
        )

    # Sync local user on refresh (role may have changed)
    supabase_user: dict = token_data.get("user") or {}
    if supabase_user:
        _upsert_user(db, supabase_user)

    return RefreshResponse(accessToken=token_data["access_token"])


def logout(access_token: str) -> LogoutResponse:
    """Revoke session server-side. Best-effort — never raises to the client."""
    try:
        supabase_logout(access_token)
    except Exception:
        pass  # token may already be expired; logout is always successful client-side
    return LogoutResponse()
