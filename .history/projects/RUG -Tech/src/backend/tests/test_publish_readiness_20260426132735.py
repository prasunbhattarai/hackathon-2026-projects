from __future__ import annotations

import io
import uuid
from datetime import UTC, datetime
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core.security import require_admin, require_doctor
from app.db.deps import get_db
from app.main import app


class _DummyDB:
    def close(self) -> None:
        return None


def _db_override():
    yield _DummyDB()


def _doctor_user() -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        email="doctor@example.com",
        role="doctor",
        clinic_id=uuid.uuid4(),
        full_name="Dr. Ready",
        is_active=True,
        created_at=datetime.now(UTC),
    )


def _admin_user() -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        email="admin@example.com",
        role="super_admin",
        clinic_id=None,
        full_name="Admin Ready",
        is_active=True,
        created_at=datetime.now(UTC),
    )


def _set_common_overrides() -> None:
    app.dependency_overrides[get_db] = _db_override


def _clear_overrides() -> None:
    app.dependency_overrides.clear()


def test_route_contract_presence() -> None:
    client = TestClient(app, raise_server_exceptions=False)
    path_to_methods: dict[str, set[str]] = {}
    for route in client.app.routes:
        if hasattr(route, "methods"):
            existing = path_to_methods.get(route.path, set())
            path_to_methods[route.path] = existing.union(set(route.methods))

    expected = {
        "/api/v1/health": {"GET"},
        "/api/v1/health/ready": {"GET"},
        "/api/v1/auth/login": {"POST"},
        "/api/v1/auth/me": {"GET"},
        "/api/v1/auth/refresh": {"POST"},
        "/api/v1/auth/logout": {"POST"},
        "/api/v1/patients": {"GET", "POST"},
        "/api/v1/patients/{patient_id}": {"GET", "PUT"},
        "/api/v1/cases": {"GET"},
        "/api/v1/cases/upload": {"POST"},
        "/api/v1/cases/{case_id}": {"GET"},
        "/api/v1/cases/{case_id}/status": {"GET"},
        "/api/v1/cases/{case_id}/approve": {"PATCH"},
        "/api/v1/cases/{case_id}/reject": {"PATCH"},
        "/api/v1/analysis/{case_id}": {"GET"},
        "/api/v1/reports": {"GET"},
        "/api/v1/reports/generate": {"POST"},
        "/api/v1/reports/{report_id}": {"GET"},
        "/api/v1/reports/{case_id}/doctor": {"GET"},
        "/api/v1/reports/{case_id}/patient": {"GET"},
        "/api/v1/reports/{case_id}/pdf": {"GET"},
        "/api/v1/admin/clinics": {"GET", "POST"},
        "/api/v1/admin/users": {"GET", "POST"},
        "/api/v1/admin/users/{user_id}/status": {"POST"},
        "/api/v1/admin/stats": {"GET"},
    }

    missing: list[str] = []
    for path, required_methods in expected.items():
        found_methods = path_to_methods.get(path, set())
        if not required_methods.issubset(found_methods):
            missing.append(f"{path} missing {sorted(required_methods - found_methods)}")

    assert not missing, f"Missing route definitions: {missing}"


def test_public_health_endpoints() -> None:
    client = TestClient(app, raise_server_exceptions=False)

    health = client.get("/api/v1/health")
    ready = client.get("/api/v1/health/ready")

    assert health.status_code == 200
    assert health.json()["success"] is True
    assert ready.status_code == 200
    assert ready.json()["success"] is True


def test_auth_endpoints_with_mocks(monkeypatch) -> None:
    from app.schemas.auth import AuthSession, RefreshResponse, UserOut
    from app.services import auth_service

    _set_common_overrides()
    app.dependency_overrides[require_doctor] = _doctor_user

    now_iso = datetime.now(UTC).isoformat()

    monkeypatch.setattr(
        auth_service,
        "login",
        lambda *_args, **_kwargs: AuthSession(
            user=UserOut(
                id=str(uuid.uuid4()),
                email="doctor@example.com",
                role="doctor",
                clinicId=str(uuid.uuid4()),
                fullName="Dr. Ready",
                isActive=True,
                createdAt=now_iso,
            ),
            accessToken="token-abc",
            expiresIn=3600,
        ),
    )
    monkeypatch.setattr(auth_service, "refresh", lambda *_args, **_kwargs: RefreshResponse(accessToken="new-token"))
    monkeypatch.setattr(auth_service, "logout", lambda *_args, **_kwargs: {"message": "Logged out successfully"})

    client = TestClient(app, raise_server_exceptions=False)

    login = client.post("/api/v1/auth/login", json={"email": "doctor@example.com", "password": "secret123"})
    me = client.get("/api/v1/auth/me")
    refresh = client.post("/api/v1/auth/refresh", json={"refreshToken": "rtok"})
    logout = client.post("/api/v1/auth/logout", headers={"Authorization": "Bearer token-abc"})

    _clear_overrides()

    assert login.status_code == 200
    assert me.status_code == 200
    assert refresh.status_code == 200
    assert logout.status_code == 200


def test_patient_endpoints_with_mocks(monkeypatch) -> None:
    from app.services import patient_service

    _set_common_overrides()
    app.dependency_overrides[require_doctor] = _doctor_user

    sample_id = str(uuid.uuid4())
    now_iso = datetime.now(UTC).isoformat()

    patient_detail = {
        "id": sample_id,
        "clinicId": str(uuid.uuid4()),
        "fullName": "John Patient",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "contact": "+233000000",
        "medicalId": "MID-001",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "cases": [],
    }

    monkeypatch.setattr(patient_service, "create_patient", lambda *_args, **_kwargs: patient_detail)
    monkeypatch.setattr(
        patient_service,
        "list_patients",
        lambda *_args, **_kwargs: {
            "items": [{
                "id": sample_id,
                "fullName": "John Patient",
                "medicalId": "MID-001",
                "age": 35,
                "lastCaseDate": None,
                "totalCases": 0,
            }],
            "total": 1,
            "page": 1,
            "limit": 20,
            "totalPages": 1,
        },
    )
    monkeypatch.setattr(patient_service, "get_patient", lambda *_args, **_kwargs: patient_detail)
    monkeypatch.setattr(patient_service, "update_patient", lambda *_args, **_kwargs: patient_detail)

    client = TestClient(app, raise_server_exceptions=False)

    create = client.post(
        "/api/v1/patients",
        json={
            "fullName": "John Patient",
            "dateOfBirth": "1990-01-01",
            "gender": "male",
            "contact": "+233000000",
            "medicalId": "MID-001",
        },
    )
    listing = client.get("/api/v1/patients")
    detail = client.get(f"/api/v1/patients/{sample_id}")
    update = client.put(f"/api/v1/patients/{sample_id}", json={"fullName": "John Patient"})

    _clear_overrides()

    assert create.status_code == 201
    assert listing.status_code == 200
    assert detail.status_code == 200
    assert update.status_code == 200


def test_case_analysis_report_endpoints_with_mocks(monkeypatch) -> None:
    from app.services import analysis_service, case_service, report_service

    _set_common_overrides()
    app.dependency_overrides[require_doctor] = _doctor_user

    case_id = str(uuid.uuid4())
    report_id = str(uuid.uuid4())
    now_iso = datetime.now(UTC).isoformat()

    monkeypatch.setattr(
        case_service,
        "upload_case",
        lambda *_args, **_kwargs: {
            "caseId": case_id,
            "status": "processing",
            "qualityCheck": "good",
            "taskId": str(uuid.uuid4()),
            "message": "Image uploaded and queued for analysis",
        },
    )
    monkeypatch.setattr(
        case_service,
        "list_cases",
        lambda *_args, **_kwargs: {"items": [], "total": 0, "page": 1, "limit": 20, "totalPages": 1},
    )
    monkeypatch.setattr(
        case_service,
        "get_case",
        lambda *_args, **_kwargs: {
            "id": case_id,
            "patientId": str(uuid.uuid4()),
            "clinicId": str(uuid.uuid4()),
            "submittedBy": str(uuid.uuid4()),
            "imageUrl": "https://img.example/f.jpg",
            "imageQuality": "good",
            "status": "awaiting_review",
            "priorityScore": 0.7,
            "priorityTier": "critical",
            "createdAt": now_iso,
            "updatedAt": now_iso,
            "patient": {
                "id": str(uuid.uuid4()),
                "fullName": "John Patient",
                "medicalId": "MID-001",
                "age": 35,
                "lastCaseDate": None,
                "totalCases": 0,
            },
            "submittedByUser": {"id": str(uuid.uuid4()), "fullName": "Dr. Ready"},
        },
    )
    monkeypatch.setattr(case_service, "get_case_status", lambda *_args, **_kwargs: {"status": "awaiting_review", "priorityScore": 0.7})
    monkeypatch.setattr(case_service, "approve_case", lambda *_args, **_kwargs: {"status": "approved", "priorityScore": 0.7})
    monkeypatch.setattr(case_service, "reject_case", lambda *_args, **_kwargs: {"status": "rejected", "priorityScore": 0.7})

    monkeypatch.setattr(
        analysis_service,
        "get_analysis_result",
        lambda *_args, **_kwargs: {
            "id": str(uuid.uuid4()),
            "caseId": case_id,
            "dr": {"status": "Moderate", "confidence": 0.8, "severityLevel": 3},
            "glaucoma": {"risk": "Medium", "confidence": 0.6},
            "hypertensiveRetinopathy": {"risk": "Low", "confidence": 0.3},
            "finalDecision": "Moderate DR suspected",
            "recommendation": "Follow up",
            "ragJustification": "context",
            "heatmapUrl": None,
            "severityLevel": 3,
            "decisionConfidence": "Suspicious, review needed",
            "createdAt": now_iso,
        },
    )

    doctor_report_data = {
        "reportType": "doctor",
        "patient": {"fullName": "John Patient", "age": 35, "gender": "male"},
        "diagnosis": {"primary": "x", "severity": "Moderate", "confidence": "80%"},
        "planOfAction": "y",
        "medicationSuggestions": ["z"],
        "ragJustification": "r",
        "heatmapUrl": "h",
        "disclaimer": "d",
        "generatedAt": now_iso,
    }
    patient_report_data = {
        "reportType": "patient",
        "summary": "Summary",
        "whatWasFound": "Moderate",
        "nextSteps": "Follow-up",
        "severityLabel": "Moderate",
        "urgency": "Routine follow-up",
        "disclaimer": "d",
        "generatedAt": now_iso,
    }

    common_report = {
        "id": report_id,
        "caseId": case_id,
        "reportType": "doctor",
        "reportData": doctor_report_data,
        "pdf": {"url": "https://signed.example/report.pdf", "expiresAt": now_iso},
        "createdAt": now_iso,
    }

    monkeypatch.setattr(report_service, "generate_report", lambda *_args, **_kwargs: common_report)
    monkeypatch.setattr(report_service, "list_reports", lambda *_args, **_kwargs: [common_report])
    monkeypatch.setattr(report_service, "get_report", lambda *_args, **_kwargs: common_report)

    def _mock_case_report_json(*args, **kwargs):
        report_type = kwargs.get("report_type")
        if report_type is None and len(args) >= 4:
            report_type = args[3]
        return patient_report_data if str(report_type).endswith("PATIENT") or str(report_type).endswith("patient") else doctor_report_data

    monkeypatch.setattr(report_service, "get_case_report_json", _mock_case_report_json)
    monkeypatch.setattr(report_service, "get_case_pdf_url", lambda *_args, **_kwargs: common_report["pdf"])

    client = TestClient(app, raise_server_exceptions=False)

    upload = client.post(
        "/api/v1/cases/upload",
        data={"patient_id": str(uuid.uuid4())},
        files={"image": ("fundus.jpg", io.BytesIO(b"fakeimage"), "image/jpeg")},
    )
    list_cases = client.get("/api/v1/cases")
    get_case = client.get(f"/api/v1/cases/{case_id}")
    status_case = client.get(f"/api/v1/cases/{case_id}/status")
    approve = client.patch(f"/api/v1/cases/{case_id}/approve")
    reject = client.patch(f"/api/v1/cases/{case_id}/reject", json={"reason": "Insufficient clarity"})

    analysis = client.get(f"/api/v1/analysis/{case_id}")

    report_generate = client.post("/api/v1/reports/generate", json={"caseId": case_id, "reportType": "doctor"})
    report_list = client.get(f"/api/v1/reports?case_id={case_id}")
    report_get = client.get(f"/api/v1/reports/{report_id}")
    report_doc = client.get(f"/api/v1/reports/{case_id}/doctor")
    report_patient = client.get(f"/api/v1/reports/{case_id}/patient")
    report_pdf = client.get(f"/api/v1/reports/{case_id}/pdf?type=doctor")

    _clear_overrides()

    for response in [
        upload,
        list_cases,
        get_case,
        status_case,
        approve,
        reject,
        analysis,
        report_generate,
        report_list,
        report_get,
        report_doc,
        report_patient,
        report_pdf,
    ]:
        assert response.status_code in (200, 202)
        body = response.json()
        assert body["success"] is True


def test_admin_endpoints_with_mocks(monkeypatch) -> None:
    from app.services import admin_service

    _set_common_overrides()
    app.dependency_overrides[require_admin] = _admin_user

    now_iso = datetime.now(UTC).isoformat()
    uid = str(uuid.uuid4())

    monkeypatch.setattr(admin_service, "list_clinics", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(
        admin_service,
        "create_clinic",
        lambda *_args, **_kwargs: {
            "id": str(uuid.uuid4()),
            "name": "Clinic",
            "address": "Address",
            "phone": "555",
            "isActive": True,
            "createdAt": now_iso,
            "userCount": 0,
            "caseCount": 0,
        },
    )
    monkeypatch.setattr(
        admin_service,
        "list_users",
        lambda *_args, **_kwargs: [{
            "id": uid,
            "email": "doctor@example.com",
            "role": "doctor",
            "clinicId": None,
            "fullName": "Dr. Ready",
            "isActive": True,
            "createdAt": now_iso,
        }],
    )
    monkeypatch.setattr(
        admin_service,
        "create_user",
        lambda *_args, **_kwargs: {
            "id": uid,
            "email": "doctor@example.com",
            "role": "doctor",
            "clinicId": None,
            "fullName": "Dr. Ready",
            "isActive": True,
            "createdAt": now_iso,
        },
    )
    monkeypatch.setattr(
        admin_service,
        "update_user_status",
        lambda *_args, **_kwargs: {
            "id": uid,
            "email": "doctor@example.com",
            "role": "doctor",
            "clinicId": None,
            "fullName": "Dr. Ready",
            "isActive": False,
            "createdAt": now_iso,
        },
    )
    monkeypatch.setattr(
        admin_service,
        "get_platform_stats",
        lambda *_args, **_kwargs: {
            "totalClinics": 1,
            "totalUsers": 2,
            "totalCases": 3,
            "todayCases": 1,
            "criticalCases": 0,
            "avgProcessingTimeMs": 123.4,
        },
    )

    client = TestClient(app, raise_server_exceptions=False)

    clinics = client.get("/api/v1/admin/clinics")
    create_clinic = client.post("/api/v1/admin/clinics", json={"name": "Clinic", "address": "Address", "phone": "555"})
    users = client.get("/api/v1/admin/users")
    create_user = client.post(
        "/api/v1/admin/users",
        json={"email": "doctor@example.com", "fullName": "Dr. Ready", "role": "doctor", "clinicId": None},
    )
    update_user = client.post(f"/api/v1/admin/users/{uid}/status", json={"isActive": False})
    stats = client.get("/api/v1/admin/stats")

    _clear_overrides()

    for response in [clinics, create_clinic, users, create_user, update_user, stats]:
        assert response.status_code == 200
        assert response.json()["success"] is True


def test_security_headers_and_error_envelope() -> None:
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    assert response.headers.get("X-Process-Time-MS")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"

    not_found = client.get("/api/v1/does-not-exist")
    assert not_found.status_code == 404
    body = not_found.json()
    assert body["success"] is False
    assert body["error"]["code"] == "NOT_FOUND"
