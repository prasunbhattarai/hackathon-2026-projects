from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.security import require_doctor
from app.db.deps import get_db
from app.main import app
from app.schemas.enums import CaseStatus, DRStatus, ReportType, UserRole
from app.services import report_service


class _ExecResult:
    def __init__(self, scalar=None, all_items=None):
        self._scalar = scalar
        self._all_items = all_items or []

    def scalar_one_or_none(self):
        return self._scalar

    def scalars(self):
        return self

    def all(self):
        return self._all_items


@pytest.fixture
def doctor_user():
    return SimpleNamespace(
        id=uuid.uuid4(),
        role=UserRole.DOCTOR.value,
        clinic_id=uuid.uuid4(),
    )


@pytest.fixture
def sample_case(doctor_user):
    return SimpleNamespace(
        id=uuid.uuid4(),
        clinic_id=doctor_user.clinic_id,
        patient_id=uuid.uuid4(),
        status=CaseStatus.AWAITING_REVIEW.value,
    )


@pytest.fixture
def sample_patient(sample_case):
    return SimpleNamespace(
        id=sample_case.patient_id,
        full_name="Jane Doe",
        date_of_birth=date(1990, 5, 10),
        gender="female",
    )


@pytest.fixture
def sample_analysis(sample_case):
    return SimpleNamespace(
        id=uuid.uuid4(),
        case_id=sample_case.id,
        dr_status=DRStatus.MODERATE.value,
        dr_confidence=0.81,
        dr_severity_level=DRStatus.MODERATE.value,
        glaucoma_risk="Medium",
        glaucoma_confidence=0.55,
        hr_risk="Low",
        hr_confidence=0.12,
        final_decision="Moderate DR suspected",
        recommendation="Refer to retina clinic within 2 weeks",
        rag_justification="Pattern aligns with microaneurysm clusters.",
        heatmap_url="https://img.example/heatmap.png",
        decision_confidence="Clear diagnosis",
        created_at=datetime.now(UTC),
    )


def _build_db(sample_case, sample_patient, sample_analysis):
    db = MagicMock()

    def _get(model, obj_id):
        name = getattr(model, "__name__", "")
        if name == "Case":
            return sample_case
        if name == "Patient":
            return sample_patient
        return None

    db.get.side_effect = _get
    db.execute.return_value = _ExecResult(scalar=sample_analysis)

    def _refresh(report):
        if getattr(report, "id", None) is None:
            report.id = uuid.uuid4()
        if getattr(report, "created_at", None) is None:
            report.created_at = datetime.now(UTC)

    db.refresh.side_effect = _refresh
    return db


def test_generate_report_doctor_success(monkeypatch, doctor_user, sample_case, sample_patient, sample_analysis):
    db = _build_db(sample_case, sample_patient, sample_analysis)

    monkeypatch.setattr(report_service, "_render_pdf_bytes", lambda *_args, **_kwargs: b"pdf-bytes")
    monkeypatch.setattr(report_service, "upload_pdf", lambda *_args, **_kwargs: {"public_id": "reports/doc-1", "format": "pdf"})
    monkeypatch.setattr(report_service, "build_signed_raw_url", lambda *_args, **_kwargs: "https://signed.example/doc.pdf")

    out = report_service.generate_report(db, doctor_user, str(sample_case.id), ReportType.DOCTOR)

    assert out.reportType == ReportType.DOCTOR
    assert out.reportData.reportType == ReportType.DOCTOR
    assert out.reportData.patient.fullName == "Jane Doe"
    assert out.pdf.url == "https://signed.example/doc.pdf"
    assert out.id


def test_generate_report_patient_success(monkeypatch, doctor_user, sample_case, sample_patient, sample_analysis):
    db = _build_db(sample_case, sample_patient, sample_analysis)

    monkeypatch.setattr(report_service, "_render_pdf_bytes", lambda *_args, **_kwargs: b"pdf-bytes")
    monkeypatch.setattr(report_service, "upload_pdf", lambda *_args, **_kwargs: {"public_id": "reports/pat-1", "format": "pdf"})
    monkeypatch.setattr(report_service, "build_signed_raw_url", lambda *_args, **_kwargs: "https://signed.example/pat.pdf")

    out = report_service.generate_report(db, doctor_user, str(sample_case.id), ReportType.PATIENT)

    assert out.reportType == ReportType.PATIENT
    assert out.reportData.reportType == ReportType.PATIENT
    assert out.reportData.summary == "Moderate DR suspected"


def test_generate_report_forbidden_for_other_clinic(monkeypatch, doctor_user, sample_case, sample_patient, sample_analysis):
    other_case = SimpleNamespace(
        id=sample_case.id,
        clinic_id=uuid.uuid4(),
        patient_id=sample_case.patient_id,
        status=CaseStatus.AWAITING_REVIEW.value,
    )
    db = _build_db(other_case, sample_patient, sample_analysis)

    with pytest.raises(Exception) as exc:
        report_service.generate_report(db, doctor_user, str(sample_case.id), ReportType.DOCTOR)

    assert "403" in str(exc.value) or "Access denied" in str(exc.value)


def test_generate_report_case_status_conflict(monkeypatch, doctor_user, sample_case, sample_patient, sample_analysis):
    blocked_case = SimpleNamespace(
        id=sample_case.id,
        clinic_id=sample_case.clinic_id,
        patient_id=sample_case.patient_id,
        status=CaseStatus.PROCESSING.value,
    )
    db = _build_db(blocked_case, sample_patient, sample_analysis)

    with pytest.raises(Exception) as exc:
        report_service.generate_report(db, doctor_user, str(sample_case.id), ReportType.DOCTOR)

    assert "409" in str(exc.value)


def test_get_report_refreshes_expired_url(monkeypatch, doctor_user, sample_case):
    report_id = uuid.uuid4()
    old_expiry = datetime.now(UTC) - timedelta(minutes=1)
    report_row = SimpleNamespace(
        id=report_id,
        case_id=sample_case.id,
        report_type=ReportType.DOCTOR.value,
        content_json={
            "reportType": "doctor",
            "patient": {"fullName": "Jane Doe", "age": 34, "gender": "female"},
            "diagnosis": {"primary": "x", "severity": "Moderate", "confidence": "80%"},
            "planOfAction": "y",
            "medicationSuggestions": ["z"],
            "ragJustification": "r",
            "heatmapUrl": "h",
            "disclaimer": "d",
            "generatedAt": datetime.now(UTC).isoformat(),
            "_pdf_public_id": "reports/doc-expired",
            "_pdf_format": "pdf",
        },
        pdf_url="https://expired.example/doc.pdf",
        pdf_expires_at=old_expiry,
        created_at=datetime.now(UTC),
    )

    db = MagicMock()

    def _get(model, obj_id):
        name = getattr(model, "__name__", "")
        if name == "Report":
            return report_row
        if name == "Case":
            return sample_case
        return None

    db.get.side_effect = _get
    monkeypatch.setattr(report_service, "build_signed_raw_url", lambda *_args, **_kwargs: "https://signed.example/new.pdf")

    out = report_service.get_report(db, doctor_user, str(report_id))

    assert out.pdf.url == "https://signed.example/new.pdf"
    assert db.commit.called


def test_list_reports_for_case(monkeypatch, doctor_user, sample_case):
    report_row = SimpleNamespace(
        id=uuid.uuid4(),
        case_id=sample_case.id,
        report_type=ReportType.PATIENT.value,
        content_json={
            "reportType": "patient",
            "summary": "Summary",
            "whatWasFound": "Mild",
            "nextSteps": "Follow-up",
            "severityLabel": "Mild",
            "urgency": "Routine follow-up",
            "disclaimer": "d",
            "generatedAt": datetime.now(UTC).isoformat(),
            "_pdf_public_id": "reports/p1",
        },
        pdf_url="https://signed.example/p1.pdf",
        pdf_expires_at=datetime.now(UTC) + timedelta(minutes=10),
        created_at=datetime.now(UTC),
    )

    db = MagicMock()

    def _get(model, obj_id):
        if getattr(model, "__name__", "") == "Case":
            return sample_case
        return None

    db.get.side_effect = _get
    db.execute.return_value = _ExecResult(all_items=[report_row])

    out = report_service.list_reports(db, doctor_user, str(sample_case.id))

    assert len(out) == 1
    assert out[0].reportType == ReportType.PATIENT


def test_get_case_report_json_uses_existing_row(monkeypatch, doctor_user, sample_case):
    report_row = SimpleNamespace(
        id=uuid.uuid4(),
        case_id=sample_case.id,
        report_type=ReportType.DOCTOR.value,
        content_json={
            "reportType": "doctor",
            "patient": {"fullName": "Jane Doe", "age": 34, "gender": "female"},
            "diagnosis": {"primary": "x", "severity": "Moderate", "confidence": "80%"},
            "planOfAction": "y",
            "medicationSuggestions": ["z"],
            "ragJustification": "r",
            "heatmapUrl": "h",
            "disclaimer": "d",
            "generatedAt": datetime.now(UTC).isoformat(),
        },
        pdf_url="https://signed.example/doc.pdf",
        pdf_expires_at=datetime.now(UTC) + timedelta(minutes=10),
        created_at=datetime.now(UTC),
    )

    db = MagicMock()

    def _get(model, obj_id):
        if getattr(model, "__name__", "") == "Case":
            return sample_case
        return None

    db.get.side_effect = _get
    db.execute.return_value = _ExecResult(scalar=report_row)

    out = report_service.get_case_report_json(db, doctor_user, str(sample_case.id), ReportType.DOCTOR)

    assert out.reportType == ReportType.DOCTOR
    assert out.patient.fullName == "Jane Doe"


def test_get_case_pdf_url_generates_if_missing(monkeypatch, doctor_user, sample_case):
    generated = SimpleNamespace(
        pdf=SimpleNamespace(url="https://signed.example/generated.pdf", expiresAt=datetime.now(UTC).isoformat())
    )

    db = MagicMock()

    def _get(model, obj_id):
        if getattr(model, "__name__", "") == "Case":
            return sample_case
        return None

    db.get.side_effect = _get
    db.execute.return_value = _ExecResult(scalar=None)
    monkeypatch.setattr(report_service, "generate_report", lambda *_args, **_kwargs: generated)

    out = report_service.get_case_pdf_url(db, doctor_user, str(sample_case.id), ReportType.DOCTOR)

    assert out.url == "https://signed.example/generated.pdf"


def test_reports_router_generate_endpoint(monkeypatch, doctor_user):
    fake_db = object()
    fake_output = {
        "id": str(uuid.uuid4()),
        "caseId": str(uuid.uuid4()),
        "reportType": "doctor",
        "reportData": {
            "reportType": "doctor",
            "patient": {"fullName": "Jane Doe", "age": 34, "gender": "female"},
            "diagnosis": {"primary": "x", "severity": "Moderate", "confidence": "80%"},
            "planOfAction": "y",
            "medicationSuggestions": ["z"],
            "ragJustification": "r",
            "heatmapUrl": "h",
            "disclaimer": "d",
            "generatedAt": datetime.now(UTC).isoformat(),
        },
        "pdf": {"url": "https://signed.example/doc.pdf", "expiresAt": datetime.now(UTC).isoformat()},
        "createdAt": datetime.now(UTC).isoformat(),
    }

    monkeypatch.setattr(report_service, "generate_report", lambda *_args, **_kwargs: fake_output)

    app.dependency_overrides[require_doctor] = lambda: doctor_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    response = client.post(
        "/api/v1/reports/generate",
        json={"caseId": str(uuid.uuid4()), "reportType": "doctor"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["reportType"] == "doctor"


def test_reports_router_list_endpoint(monkeypatch, doctor_user):
    fake_db = object()
    monkeypatch.setattr(report_service, "list_reports", lambda *_args, **_kwargs: [])

    app.dependency_overrides[require_doctor] = lambda: doctor_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    response = client.get(f"/api/v1/reports?case_id={uuid.uuid4()}")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["data"] == []


def test_reports_router_contract_paths(monkeypatch, doctor_user):
    fake_db = object()

    monkeypatch.setattr(report_service, "get_case_report_json", lambda *_args, **_kwargs: {
        "reportType": "patient",
        "summary": "ok",
        "whatWasFound": "Mild",
        "nextSteps": "follow-up",
        "severityLabel": "Mild",
        "urgency": "Routine follow-up",
        "disclaimer": "d",
        "generatedAt": datetime.now(UTC).isoformat(),
    })
    monkeypatch.setattr(report_service, "get_case_pdf_url", lambda *_args, **_kwargs: {
        "url": "https://signed.example/patient.pdf",
        "expiresAt": datetime.now(UTC).isoformat(),
    })

    app.dependency_overrides[require_doctor] = lambda: doctor_user
    app.dependency_overrides[get_db] = lambda: iter([fake_db])

    client = TestClient(app)
    case_id = str(uuid.uuid4())

    patient_res = client.get(f"/api/v1/reports/{case_id}/patient")
    pdf_res = client.get(f"/api/v1/reports/{case_id}/pdf?type=patient")

    app.dependency_overrides.clear()

    assert patient_res.status_code == 200
    assert patient_res.json()["data"]["reportType"] == "patient"
    assert pdf_res.status_code == 200
    assert "url" in pdf_res.json()["data"]
