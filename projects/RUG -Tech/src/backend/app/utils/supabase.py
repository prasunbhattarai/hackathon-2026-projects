"""
Thin httpx wrapper for the Supabase Auth REST API (GoTrue).

Endpoints used:
  POST /auth/v1/token?grant_type=password  → sign in
  POST /auth/v1/token?grant_type=refresh_token → refresh
  POST /auth/v1/logout → sign out (requires access token)

All calls go directly to SUPABASE_URL so the backend is the only party
that touches the Supabase service-role key. The frontend never sees it.
"""

from typing import Any

import httpx

from app.core.config import get_settings


def _headers(*, access_token: str | None = None, use_service_role: bool = False) -> dict[str, str]:
    settings = get_settings()
    key = settings.SUPABASE_SERVICE_ROLE_KEY if use_service_role else settings.SUPABASE_ANON_KEY
    h = {
        "apikey": key,
        "Content-Type": "application/json",
    }
    if access_token:
        h["Authorization"] = f"Bearer {access_token}"
    return h


def supabase_sign_in(email: str, password: str) -> dict[str, Any]:
    """
    Exchange email+password for a Supabase session.
    Returns the raw GoTrue token response or raises httpx.HTTPStatusError.
    """
    settings = get_settings()
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    resp = httpx.post(
        url,
        json={"email": email, "password": password},
        headers=_headers(),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def supabase_refresh(refresh_token: str) -> dict[str, Any]:
    """Exchange a refresh token for a new access token."""
    settings = get_settings()
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token"
    resp = httpx.post(
        url,
        json={"refresh_token": refresh_token},
        headers=_headers(),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def supabase_logout(access_token: str) -> None:
    """Revoke the session server-side."""
    settings = get_settings()
    url = f"{settings.SUPABASE_URL}/auth/v1/logout"
    resp = httpx.post(
        url,
        json={},
        headers=_headers(access_token=access_token),
        timeout=10,
    )
    # 204 = success, 401 = already expired — both are acceptable here
    if resp.status_code not in (200, 204, 401):
        resp.raise_for_status()
