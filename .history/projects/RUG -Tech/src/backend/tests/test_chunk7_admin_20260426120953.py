from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.core.security import require_admin
from app.db.deps import get_db
from app.main import app
from app.schemas.admin import CreateClinicRequest, CreateUserRequest, UpdateUserStatusRequest
from app.schemas.enums import CaseStatus, PriorityTier, UserRole
from app.services import admin_service


class _ExecResult:
    def __init__(self, scalar=None, all_items=None):
        self._scalar = scalar
        self._all_items = all_items or []

    def scalar_one(self):
        return self._scalar

    def scalar_one_or_none(self):
        return self._scalar

    def scalars(self):
        return self

    def all(self):
        return self._all_items


@pytest.fixture
def admin_user():
    return SimpleNamespace(
        id=uuid.uuid4(),
        role=UserRole.SUPER_ADMIN.value,
        clinic_id=None,
        email="admin@example.com",
        full_name="Platform Admin",
        is_active=True,
        created_at=datetime.now(UTC),
    )


def _doctor_row(email: str = "doctor@example.com"):
    return SimpleNamespace(
        id=uuid.uuid4(),
        email=email,
        full_name="Dr. Jane",
        role=UserRole.DOCTOR.value,
        clinic_id=uuid.uuid4(),
        is_active=True,
        created_at=datetime.now(UTC),
    )


def test_create_clinic_success():
    db = MagicMock()

    created = SimpleNamespace(
        id=uuid.uuid4(),
        name="CareDevi West",
        address="123 Main St",
        phone="+1 555 1234",
        is_active=True,
        created_at=datetime.now(UTC),
    )

    db.refresh.side_effect = lambda _obj: None

    # ensure service returns object with created fields
    db.add.side_effect = lambda obj: None
    db.commit.side_effect = lambda: None

    # emulate SQLAlchemy refresh by mutating the same object
    def _refresh(obj):
        obj.id = created.id
        obj.created_at = created.created_at

    db.refresh.side_effect = _refresh

    out = admin_service.create_clinic(
        db,
        CreateClinicRequest(name=created.name, address=created.address, phone=created.phone),
    )

    assert out.name == "CareDevi West"
    assert out.userCount == 0
    assert out.caseCount == 0


def test_list_clinics_includes_counts():
    clinic = SimpleNamespace(
        id=uuid.uuid4(),
        name="Clinic A",
        address="Addr",
        phone="555",
        is_active=True,
        created_at=datetime.now(UTC),
    )

    db = MagicMock()
    db.execute.side_effect = [
        _ExecResult(all_items=[clinic]),
        _ExecResult(scalar=3),
        _ExecResult(scalar=8),
    ]

    out = admin_service.list_clinics(db)

    assert len(out) == 1
    assert out[0].userCount == 3
    assert out[0].caseCount == 8


def test_list_users_success():
    user = _doctor_row()
    db = MagicMock()
    db.execute.return_value = _ExecResult(all_items=[user])

    out = admin_service.list_users(db)

    assert len(out) == 1
    assert out[0].email == user.email
    assert out[0].role == UserRole.DOCTOR


def test_create_user_rejects_non_doctor():
    db = MagicMock()
    with pytest.raises(HTTPException) as exc:
        admin_service.create_user(
            db,
            CreateUserRequest(
                email="new@example.com",
                fullName="Admin Two",
                role=UserRole.SUPER_ADMIN,
                clinicId=None,
            ),
        )
    assert exc.value.status_code == 422


def test_create_user_conflict_on_existing_email():
    db = MagicMock()
    db.execute.return_value = _ExecResult(scalar=_doctor_row())

    with pytest.raises(HTTPException) as exc:
        admin_service.create_user(
            db,
            CreateUserRequest(
                email="doctor@example.com",
                fullName="Dr. Existing",
                role=UserRole.DOCTOR,
                clinicId=None,
            ),
        )
    assert exc.value.status_code == 409


def test_update_user_status_success():
    user = _doctor_row()
    db = MagicMock()
    db.get.return_value = user

    out = admin_service.update_user_status(db, str(user.id), UpdateUserStatusRequest(isActive=False))

    assert out.isActive is False
    assert db.commit.called


def test_platform_stats_success():
    now = datetime.now(UTC)
    case_completed_1 = SimpleNamespace(
        created_at=now - timedelta(minutes=30),
        updated_at=now - timedelta(minutes=25),
        status=CaseStatus.APPROVED.value,
        priority_tier=PriorityTier.CRITICAL.value,
    )
    case_completed_2 = SimpleNamespace(
        created_at=now - timedelta(minutes=20),
        updated_at=now - timedelta(minutes=19),
        status=CaseStatus.AWAITING_REVIEW.value,
        priority_tier=PriorityTier.HIGH.value,
    )
    case_processing = SimpleNamespace(
        created_at=now,
        updated_at=now,
        status=CaseStatus.PROCESSING.value,
        priority_tier=PriorityTier.LOW.value,
    )

    db = MagicMock()
    db.execute.side_effect = [
        _ExecResult(scalar=2),
        _ExecResult(scalar=11),
        _ExecResult(scalar=20),
        _ExecResult(all_items=[case_completed_1, case_completed_2, case_processing]),
    ]

    out = admin_service.get_platform_stats(db)

    assert out.totalClinics == 2
    assert out.totalUsers == 11
    assert out.totalCases == 20
    assert out.criticalCases == 1
    assert out.todayCases >= 1
    assert out.avgProcessingTimeMs > 0


def test_admin_router_requires_admin_auth():
    app.dependency_overrides.clear()

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/api/v1/admin/stats")

    assert response.status_code in (401, 403)


def test_admin_router_clinics_get(monkeypatch, admin_user):
    fake_db = object()
    monkeypatch.setattr(admin_service, "list_clinics", lambda *_args, **_kwargs: [])

    app.dependency_overrides[require_admin] = lambda: admin_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    response = client.get("/api/v1/admin/clinics")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []


def test_admin_router_clinics_post(monkeypatch, admin_user):
    fake_db = object()
    clinic_id = str(uuid.uuid4())

    monkeypatch.setattr(
        admin_service,
        "create_clinic",
        lambda *_args, **_kwargs: {
            "id": clinic_id,
            "name": "New Clinic",
            "address": "Addr",
            "phone": "555",
            "isActive": True,
            "createdAt": datetime.now(UTC).isoformat(),
            "userCount": 0,
            "caseCount": 0,
        },
    )

    app.dependency_overrides[require_admin] = lambda: admin_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    response = client.post(
        "/api/v1/admin/clinics",
        json={"name": "New Clinic", "address": "Addr", "phone": "555"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["data"]["id"] == clinic_id


def test_admin_router_users_endpoints(monkeypatch, admin_user):
    fake_db = object()
    user_id = str(uuid.uuid4())

    monkeypatch.setattr(
        admin_service,
        "list_users",
        lambda *_args, **_kwargs: [
            {
                "id": user_id,
                "email": "doctor@example.com",
                "role": "doctor",
                "clinicId": None,
                "fullName": "Dr. Jane",
                "isActive": True,
                "createdAt": datetime.now(UTC).isoformat(),
            }
        ],
    )
    monkeypatch.setattr(
        admin_service,
        "create_user",
        lambda *_args, **_kwargs: {
            "id": user_id,
            "email": "doctor@example.com",
            "role": "doctor",
            "clinicId": None,
            "fullName": "Dr. Jane",
            "isActive": True,
            "createdAt": datetime.now(UTC).isoformat(),
        },
    )
    monkeypatch.setattr(
        admin_service,
        "update_user_status",
        lambda *_args, **_kwargs: {
            "id": user_id,
            "email": "doctor@example.com",
            "role": "doctor",
            "clinicId": None,
            "fullName": "Dr. Jane",
            "isActive": False,
            "createdAt": datetime.now(UTC).isoformat(),
        },
    )

    app.dependency_overrides[require_admin] = lambda: admin_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)

    list_res = client.get("/api/v1/admin/users")
    create_res = client.post(
        "/api/v1/admin/users",
        json={
            "email": "doctor@example.com",
            "fullName": "Dr. Jane",
            "role": "doctor",
            "clinicId": None,
        },
    )
    status_res = client.post(f"/api/v1/admin/users/{user_id}/status", json={"isActive": False})

    app.dependency_overrides.clear()

    assert list_res.status_code == 200
    assert create_res.status_code == 200
    assert status_res.status_code == 200
    assert status_res.json()["data"]["isActive"] is False


def test_admin_router_stats_endpoint(monkeypatch, admin_user):
    fake_db = object()

    monkeypatch.setattr(
        admin_service,
        "get_platform_stats",
        lambda *_args, **_kwargs: {
            "totalClinics": 3,
            "totalUsers": 12,
            "totalCases": 44,
            "todayCases": 2,
            "criticalCases": 1,
            "avgProcessingTimeMs": 5312.5,
        },
    )

    app.dependency_overrides[require_admin] = lambda: admin_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    response = client.get("/api/v1/admin/stats")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["data"]["totalCases"] == 44
