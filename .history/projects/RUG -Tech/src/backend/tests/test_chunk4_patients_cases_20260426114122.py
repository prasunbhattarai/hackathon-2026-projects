"""
Chunk 4 tests: Patients + Cases APIs.

All DB calls are mocked — no live database needed.
Auth is bypassed via FastAPI dependency overrides on `require_doctor`.
"""

import io
import uuid
from datetime import date, datetime, timezone
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ── shared fixtures ────────────────────────────────────────────────────────────


def _make_user(role: str = "doctor", clinic_id: str | None = None) -> MagicMock:
    u = MagicMock()
    u.id = uuid.uuid4()
    u.email = "doc@clinic.test"
    u.full_name = "Dr. Test"
    u.role = role
    u.is_active = True
    u.clinic_id = uuid.UUID(clinic_id) if clinic_id else uuid.uuid4()
    u.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return u


def _make_patient(clinic_id: uuid.UUID | None = None) -> MagicMock:
    p = MagicMock()
    p.id = uuid.uuid4()
    p.clinic_id = clinic_id or uuid.uuid4()
    p.full_name = "Jane Doe"
    p.date_of_birth = date(1990, 5, 15)
    p.gender = "female"
    p.contact_phone = "555-1234"
    p.medical_id = "MED-001"
    p.notes = None
    p.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    p.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return p


def _make_case(
    patient_id: uuid.UUID | None = None,
    clinic_id: uuid.UUID | None = None,
    status: str = "processing",
) -> MagicMock:
    c = MagicMock()
    c.id = uuid.uuid4()
    c.patient_id = patient_id or uuid.uuid4()
    c.clinic_id = clinic_id or uuid.uuid4()
    c.submitted_by = uuid.uuid4()
    c.image_url = "https://res.cloudinary.com/placeholder/test.jpg"
    c.image_quality = "good"
    c.status = status
    c.priority_score = None
    c.priority_tier = None
    c.rejection_reason = None
    c.task_id = str(uuid.uuid4())
    c.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    c.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return c


# ── router registration ────────────────────────────────────────────────────────


def test_patients_router_prefix():
    from app.api.v1.patients import router
    assert router.prefix == "/patients"


def test_patients_router_tags():
    from app.api.v1.patients import router
    assert "patients" in router.tags


def test_patients_routes_registered():
    from app.api.v1.patients import router
    paths = {r.path for r in router.routes}
    assert "/patients" in paths
    assert "/patients/{patient_id}" in paths


def test_cases_router_prefix():
    from app.api.v1.cases import router
    assert router.prefix == "/cases"


def test_cases_routes_registered():
    from app.api.v1.cases import router
    paths = {r.path for r in router.routes}
    assert "/cases/upload" in paths
    assert "/cases" in paths
    assert "/cases/{case_id}" in paths
    assert "/cases/{case_id}/status" in paths
    assert "/cases/{case_id}/approve" in paths
    assert "/cases/{case_id}/reject" in paths


def test_upload_is_post():
    from app.api.v1.cases import router
    route = next(r for r in router.routes if r.path == "/cases/upload")
    assert "POST" in route.methods


def test_approve_and_reject_are_patch():
    from app.api.v1.cases import router
    approve = next(r for r in router.routes if r.path == "/cases/{case_id}/approve")
    reject = next(r for r in router.routes if r.path == "/cases/{case_id}/reject")
    assert "PATCH" in approve.methods
    assert "PATCH" in reject.methods


# ── patient_service unit tests ─────────────────────────────────────────────────


def test_calculate_age():
    from app.services.patient_service import _calculate_age
    from datetime import date

    dob = date(1990, 1, 1)
    age = _calculate_age(dob)
    assert age == 36  # 2026 - 1990


def test_calculate_age_none_returns_zero():
    from app.services.patient_service import _calculate_age
    assert _calculate_age(None) == 0


def test_assert_clinic_raises_when_none():
    from fastapi import HTTPException
    from app.services.patient_service import _assert_clinic

    user = _make_user()
    user.clinic_id = None

    with pytest.raises(HTTPException) as exc:
        _assert_clinic(user)
    assert exc.value.status_code == 400


def test_clinic_filter_superadmin_returns_none():
    from app.services.patient_service import _clinic_filter

    admin = _make_user(role="super_admin")
    admin.clinic_id = None
    assert _clinic_filter(admin) is None


def test_clinic_filter_doctor_returns_clinic_id():
    from app.services.patient_service import _clinic_filter

    cid = uuid.uuid4()
    doctor = _make_user()
    doctor.clinic_id = cid
    assert _clinic_filter(doctor) == cid


def test_patient_service_create_conflict():
    from fastapi import HTTPException
    from app.services import patient_service
    from app.schemas.patient import CreatePatientRequest
    from app.schemas.enums import Gender

    db = MagicMock()
    user = _make_user()
    body = CreatePatientRequest(
        fullName="Jane",
        dateOfBirth=date(1990, 1, 1),
        gender=Gender.FEMALE,
        contact="555",
        medicalId="MED-001",
    )

    # Simulate existing patient with same medical_id
    existing = MagicMock()
    db.execute.return_value.scalar_one_or_none.return_value = existing

    with pytest.raises(HTTPException) as exc:
        patient_service.create_patient(db, user, body)
    assert exc.value.status_code == 409


def test_patient_service_get_not_found():
    from fastapi import HTTPException
    from app.services import patient_service

    db = MagicMock()
    db.get.return_value = None
    user = _make_user()

    with pytest.raises(HTTPException) as exc:
        patient_service.get_patient(db, user, str(uuid.uuid4()))
    assert exc.value.status_code == 404


def test_patient_service_get_wrong_clinic():
    from fastapi import HTTPException
    from app.services import patient_service

    user = _make_user()
    patient = _make_patient(clinic_id=uuid.uuid4())  # different clinic

    db = MagicMock()
    db.get.return_value = patient

    with pytest.raises(HTTPException) as exc:
        patient_service.get_patient(db, user, str(patient.id))
    assert exc.value.status_code == 403


def test_patient_service_get_success():
    from app.services import patient_service

    user = _make_user()
    cid = user.clinic_id
    patient = _make_patient(clinic_id=cid)

    db = MagicMock()
    db.get.return_value = patient

    result = patient_service.get_patient(db, user, str(patient.id))
    assert result.id == str(patient.id)
    assert result.fullName == "Jane Doe"


def test_patient_service_update_not_found():
    from fastapi import HTTPException
    from app.services import patient_service
    from app.schemas.patient import UpdatePatientRequest

    db = MagicMock()
    db.get.return_value = None
    user = _make_user()

    with pytest.raises(HTTPException) as exc:
        patient_service.update_patient(db, user, str(uuid.uuid4()), UpdatePatientRequest())
    assert exc.value.status_code == 404


def test_patient_service_update_applies_fields():
    from app.services import patient_service
    from app.schemas.patient import UpdatePatientRequest
    from app.schemas.enums import Gender

    user = _make_user()
    patient = _make_patient(clinic_id=user.clinic_id)

    db = MagicMock()
    db.get.return_value = patient
    db.execute.return_value.scalar_one_or_none.return_value = None  # no conflict

    patient_service.update_patient(
        db, user, str(patient.id), UpdatePatientRequest(fullName="New Name")
    )
    assert patient.full_name == "New Name"


# ── case_service unit tests ────────────────────────────────────────────────────


def test_case_service_upload_patient_not_found():
    from fastapi import HTTPException
    from app.services import case_service

    db = MagicMock()
    db.get.return_value = None
    user = _make_user()
    image = MagicMock()
    image.content_type = "image/jpeg"

    with pytest.raises(HTTPException) as exc:
        case_service.upload_case(db, user, str(uuid.uuid4()), image)
    assert exc.value.status_code == 404


def test_case_service_upload_invalid_mime():
    from fastapi import HTTPException
    from app.services import case_service

    patient = _make_patient()
    db = MagicMock()
    db.get.return_value = patient

    user = _make_user()
    user.clinic_id = patient.clinic_id

    image = MagicMock()
    image.content_type = "application/pdf"

    with pytest.raises(HTTPException) as exc:
        case_service.upload_case(db, user, str(patient.id), image)
    assert exc.value.status_code == 422


def test_case_service_upload_oversized():
    from fastapi import HTTPException
    from app.services import case_service

    patient = _make_patient()
    db = MagicMock()
    db.get.return_value = patient

    user = _make_user()
    user.clinic_id = patient.clinic_id

    image = MagicMock()
    image.content_type = "image/jpeg"
    # 11 MB chunk — over the 10 MB limit
    image.file.read.return_value = b"x" * (11 * 1024 * 1024)

    with pytest.raises(HTTPException) as exc:
        case_service.upload_case(db, user, str(patient.id), image)
    assert exc.value.status_code == 422


def test_case_service_upload_success():
    from app.services import case_service
    from app.schemas.enums import CaseStatus

    patient = _make_patient()
    db = MagicMock()
    db.get.return_value = patient

    user = _make_user()
    user.clinic_id = patient.clinic_id

    image = MagicMock()
    image.content_type = "image/jpeg"
    # Valid 1 KB chunk
    image.file.read.return_value = b"x" * 1024
    image.file.seek = MagicMock()

    result = case_service.upload_case(db, user, str(patient.id), image)

    assert result.status == CaseStatus.PROCESSING
    assert result.taskId  # non-empty UUID
    assert db.add.called
    assert db.commit.called


def test_case_service_get_not_found():
    from fastapi import HTTPException
    from app.services import case_service

    db = MagicMock()
    db.get.return_value = None
    user = _make_user()

    with pytest.raises(HTTPException) as exc:
        case_service.get_case(db, user, str(uuid.uuid4()))
    assert exc.value.status_code == 404


def test_case_service_get_wrong_clinic():
    from fastapi import HTTPException
    from app.services import case_service

    user = _make_user()
    case = _make_case(clinic_id=uuid.uuid4())  # different clinic

    db = MagicMock()
    db.get.side_effect = lambda model, id: case

    with pytest.raises(HTTPException) as exc:
        case_service.get_case(db, user, str(case.id))
    assert exc.value.status_code == 403


def test_case_service_approve_wrong_status():
    from fastapi import HTTPException
    from app.services import case_service

    user = _make_user()
    cid = user.clinic_id
    case = _make_case(clinic_id=cid, status="processing")

    db = MagicMock()
    db.get.return_value = case

    with pytest.raises(HTTPException) as exc:
        case_service.approve_case(db, user, str(case.id))
    assert exc.value.status_code == 409


def test_case_service_approve_success():
    from app.services import case_service
    from app.schemas.enums import CaseStatus

    user = _make_user()
    cid = user.clinic_id
    case = _make_case(clinic_id=cid, status="awaiting_review")

    db = MagicMock()
    db.get.return_value = case

    result = case_service.approve_case(db, user, str(case.id))
    assert case.status == CaseStatus.APPROVED.value
    assert db.commit.called


def test_case_service_reject_success():
    from app.services import case_service
    from app.schemas.case import RejectCaseRequest
    from app.schemas.enums import CaseStatus

    user = _make_user()
    cid = user.clinic_id
    case = _make_case(clinic_id=cid, status="awaiting_review")

    db = MagicMock()
    db.get.return_value = case

    result = case_service.reject_case(
        db, user, str(case.id), RejectCaseRequest(reason="Image too blurry")
    )
    assert case.status == CaseStatus.REJECTED.value
    assert case.rejection_reason == "Image too blurry"


def test_case_service_status_poll():
    from app.services import case_service
    from app.schemas.enums import CaseStatus

    user = _make_user()
    cid = user.clinic_id
    case = _make_case(clinic_id=cid, status="processing")

    db = MagicMock()
    db.get.return_value = case

    result = case_service.get_case_status(db, user, str(case.id))
    assert result.status == CaseStatus.PROCESSING


# ── HTTP integration tests (TestClient + dependency override) ─────────────────


def _make_client(user: MagicMock) -> TestClient:
    """Return a test client with auth bypassed."""
    from app.main import app
    from app.core.security import require_doctor

    app.dependency_overrides[require_doctor] = lambda: user
    client = TestClient(app, raise_server_exceptions=False)
    return client


def test_http_patients_list_requires_auth():
    from app.main import app

    app.dependency_overrides.clear()
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/api/v1/patients")
    assert resp.status_code in (401, 403)


def test_http_patients_create_requires_body():
    user = _make_user()
    client = _make_client(user)

    with patch("app.services.patient_service.create_patient"):
        resp = client.post("/api/v1/patients", json={})

    assert resp.status_code == 422  # validation error


def test_http_patients_get_not_found():
    from fastapi import HTTPException
    user = _make_user()
    client = _make_client(user)

    with patch(
        "app.api.v1.patients.patient_service.get_patient",
        side_effect=HTTPException(status_code=404, detail="Patient not found"),
    ):
        resp = client.get(f"/api/v1/patients/{uuid.uuid4()}")

    assert resp.status_code == 404


def test_http_cases_upload_requires_form():
    user = _make_user()
    client = _make_client(user)

    # No form data sent
    resp = client.post("/api/v1/cases/upload")
    assert resp.status_code == 422


def test_http_cases_upload_invalid_mime():
    from app.services.case_service import upload_case
    from fastapi import HTTPException

    user = _make_user()
    client = _make_client(user)

    with patch(
        "app.api.v1.cases.case_service.upload_case",
        side_effect=HTTPException(status_code=422, detail="Invalid image type"),
    ):
        resp = client.post(
            "/api/v1/cases/upload",
            data={"patient_id": str(uuid.uuid4())},
            files={"image": ("test.pdf", b"%PDF", "application/pdf")},
        )
    assert resp.status_code == 422


def test_http_cases_list_with_status_filter():
    user = _make_user()
    client = _make_client(user)

    from app.schemas.base import PaginatedResponse
    from app.schemas.case import CaseSummaryOut

    mock_result = PaginatedResponse(
        items=[], total=0, page=1, limit=20, totalPages=1
    )

    with patch(
        "app.api.v1.cases.case_service.list_cases",
        return_value=mock_result,
    ):
        resp = client.get("/api/v1/cases?status=processing&page=1&limit=10")

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["total"] == 0


def test_http_cases_approve_not_found():
    from fastapi import HTTPException

    user = _make_user()
    client = _make_client(user)

    with patch(
        "app.api.v1.cases.case_service.approve_case",
        side_effect=HTTPException(status_code=404, detail="Case not found"),
    ):
        resp = client.patch(f"/api/v1/cases/{uuid.uuid4()}/approve")

    assert resp.status_code == 404


def test_http_cases_reject_requires_body():
    user = _make_user()
    client = _make_client(user)

    resp = client.patch(f"/api/v1/cases/{uuid.uuid4()}/reject", json={})
    assert resp.status_code == 422  # missing reason field


def test_http_cases_reject_valid():
    from app.schemas.case import CaseStatusOut
    from app.schemas.enums import CaseStatus

    user = _make_user()
    client = _make_client(user)

    mock_result = CaseStatusOut(status=CaseStatus.REJECTED, priorityScore=None)

    with patch(
        "app.api.v1.cases.case_service.reject_case",
        return_value=mock_result,
    ):
        resp = client.patch(
            f"/api/v1/cases/{uuid.uuid4()}/reject",
            json={"reason": "Image too dark"},
        )

    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "rejected"


# ── ApiResponse envelope correctness ──────────────────────────────────────────


def test_api_response_ok_sets_success_true():
    from app.schemas.base import ApiResponse

    r = ApiResponse.ok("hello")
    assert r.success is True
    assert r.data == "hello"
    assert r.error is None


def test_api_response_fail_sets_success_false():
    from app.schemas.base import ApiResponse

    r = ApiResponse.fail("NOT_FOUND", "Not found")
    assert r.success is False
    assert r.data is None
    assert r.error.code == "NOT_FOUND"


# ── Patient schema validation ─────────────────────────────────────────────────


def test_create_patient_request_min_length():
    from pydantic import ValidationError
    from app.schemas.patient import CreatePatientRequest
    from app.schemas.enums import Gender

    with pytest.raises(ValidationError):
        CreatePatientRequest(
            fullName="",
            dateOfBirth=date(1990, 1, 1),
            gender=Gender.FEMALE,
            contact="",
            medicalId="",
        )


def test_reject_case_request_min_length():
    from pydantic import ValidationError
    from app.schemas.case import RejectCaseRequest

    with pytest.raises(ValidationError):
        RejectCaseRequest(reason="")
