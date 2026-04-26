from __future__ import annotations

from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core.security import require_doctor
from app.db.deps import get_db
from app.main import app


class _DummyDB:
    def close(self):
        return None


def test_not_found_uses_api_envelope():
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/definitely-missing")

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"]["code"] == "NOT_FOUND"


def test_validation_error_uses_api_envelope():
    app.dependency_overrides[require_doctor] = lambda: SimpleNamespace()
    app.dependency_overrides[get_db] = lambda: iter([_DummyDB()])

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/reports/not-a-uuid/pdf?type=not-valid")

    app.dependency_overrides.clear()

    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert isinstance(body["error"]["details"], dict)


def test_unhandled_error_uses_api_envelope():
    crash_router = APIRouter()

    @crash_router.get("/chunk8-crash")
    def crash() -> dict:
        raise RuntimeError("boom")

    app.include_router(crash_router, prefix="/api/v1", tags=["chunk8-tests"])

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/chunk8-crash", headers={"x-request-id": "req-chunk8"})

    assert response.status_code == 500
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INTERNAL_ERROR"
    assert "requestId=req-chunk8" in body["error"]["message"]


def test_response_has_security_and_request_headers():
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    assert response.headers.get("X-Process-Time-MS")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "no-referrer"
    assert response.headers.get("Cache-Control") == "no-store"


def test_readiness_endpoint_available():
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/health/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
