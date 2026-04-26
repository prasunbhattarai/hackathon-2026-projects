"""
Security utilities: Supabase JWT verification + RBAC FastAPI dependencies.

JWT flow:
  1. Client sends `Authorization: Bearer <supabase_access_token>`
  2. `verify_token()` decodes it using SUPABASE_JWT_SECRET (HS256)
  3. Returns the decoded claims dict (sub = user UUID, email, role claim, etc.)
  4. `get_current_user()` looks up the User row from the DB (creates on first-login optional)
  5. Role-based guards (`require_doctor`, `require_admin`) wrap `get_current_user`

RBAC matrix (CONTRACT.md):
  Endpoint group        | super_admin | doctor
  ─────────────────────────────────────────────
  POST /patients        |     ✓       |   ✓
  GET /patients         |     ✓       |   ✓  (own clinic only for doctor)
  POST /cases           |     ✓       |   ✓
  GET /cases            |     ✓       |   ✓  (own clinic only for doctor)
  GET /analysis         |     ✓       |   ✓
  POST /reports         |     ✓       |   ✓
  GET /admin/*          |     ✓       |   ✗
"""

from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.deps import get_db
from app.models.user import User
from app.schemas.enums import UserRole

_bearer = HTTPBearer(auto_error=True)


def verify_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(_bearer)],
) -> dict:
    """
    Decode and verify a Supabase-issued JWT (HS256).
    Returns the full claims payload on success.
    Raises HTTP 401 on invalid/expired tokens.
    """
    settings = get_settings()
    token = credentials.credentials

    try:
        payload: dict = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase tokens have 'authenticated' audience
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_current_user(
    payload: Annotated[dict, Depends(verify_token)],
    db: Session = Depends(get_db),
) -> User:
    """
    Resolves the authenticated Supabase user to a local User row.
    The `sub` claim is the Supabase Auth UUID, which must match `users.id`.
    """
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Contact your administrator.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


# ── Role guards ────────────────────────────────────────────────────────────────

def require_doctor(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Allows both doctors and super_admins (any authenticated user)."""
    return current_user


def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Restricts to super_admin role only."""
    if current_user.role != UserRole.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


CurrentUser = Annotated[User, Depends(require_doctor)]
AdminUser = Annotated[User, Depends(require_admin)]
