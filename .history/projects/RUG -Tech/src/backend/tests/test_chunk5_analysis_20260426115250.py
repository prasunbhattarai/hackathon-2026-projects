"""
Chunk 5 tests: Celery worker, Cloudinary utility, analysis service + router.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

# ── helpers ────────────────────────────────────────────────────────────────────


def _make_case(status: str = "processing", clinic_id: uuid.UUID | None = None) -> MagicMock:
    c = MagicMock()
    c.id = uuid.uuid4()
    c.clinic_id = clinic_id or uuid.uuid4()
    c.patient_id = uuid.uuid4()
    c.submitted_by = uuid.uuid4()
    c.image_url = "https://res.cloudinary.com/demo/fundusai/test.jpg"
    c.image_quality = "good"
    c.image_public_id = "fundusai/test"
    c.status = status
    c.priority_score = None
    c.priority_tier = None
    c.rejection_reason = None
    c.task_id = str(uuid.uuid4())
    c.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    c.updated_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return c


def _make_analysis_result(case_id: uuid.UUID) -> MagicMock:
    r = MagicMock()
    r.id = uuid.uuid4()
    r.case_id = case_id
    r.dr_status = "Moderate"
    r.dr_confidence = 0.82
    r.dr_severity_level = "Moderate"
    r.glaucoma_risk = "Medium"
    r.glaucoma_confidence = 0.71
    r.hr_risk = "Low"
    r.hr_confidence = 0.63
    r.final_decision = "Moderate DR detected"
    r.recommendation = "Follow-up in 6 months"
    r.rag_justification = "Clinical context from RAG"
    r.heatmap_url = None
    r.severity_level = "Moderate"
    r.decision_confidence = "Suspicious, review needed"
    r.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    return r


def _make_user(role: str = "doctor", clinic_id: uuid.UUID | None = None) -> MagicMock:
    u = MagicMock()
    u.id = uuid.uuid4()
    u.role = role
    u.clinic_id = clinic_id or uuid.uuid4()
    return u


# ── Celery app configuration ───────────────────────────────────────────────────


def test_celery_app_exists():
    from app.worker.celery_app import celery_app
    assert celery_app is not None


def test_celery_app_name():
    from app.worker.celery_app import celery_app
    assert celery_app.main == "fundusai"


def test_celery_task_registered():
    from app.worker.celery_app import celery_app
    from app.worker import tasks  # noqa: F401 — trigger task registration
    assert "app.worker.tasks.run_analysis" in celery_app.tasks


def test_celery_task_uses_analysis_queue():
    from app.worker.celery_app import celery_app
    routes = celery_app.conf.task_routes
    assert routes.get("app.worker.tasks.run_analysis", {}).get("queue") == "analysis"


# ── priority scoring ────────────────────────────────────────────────────────────


def test_compute_priority_critical():
    from app.worker.tasks import _compute_priority
    from app.schemas.enums import PriorityTier, DRStatus, RiskLevel

    result = {
        "dr_status": DRStatus.PDR.value,
        "glaucoma_risk": RiskLevel.HIGH.value,
        "hr_risk": RiskLevel.HIGH.value,
    }
    score, tier = _compute_priority(result)
    assert score >= 0.7
    assert tier == PriorityTier.CRITICAL.value


def test_compute_priority_low():
    from app.worker.tasks import _compute_priority
    from app.schemas.enums import PriorityTier, DRStatus, RiskLevel

    result = {
        "dr_status": DRStatus.NONE.value,
        "glaucoma_risk": RiskLevel.LOW.value,
        "hr_risk": RiskLevel.LOW.value,
    }
    score, tier = _compute_priority(result)
    assert score < 0.2
    assert tier == PriorityTier.LOW.value


def test_compute_priority_medium():
    from app.worker.tasks import _compute_priority
    from app.schemas.enums import PriorityTier, DRStatus, RiskLevel

    result = {
        "dr_status": DRStatus.MILD.value,
        "glaucoma_risk": RiskLevel.MEDIUM.value,
        "hr_risk": RiskLevel.LOW.value,
    }
    score, tier = _compute_priority(result)
    assert 0.2 <= score < 0.45
    assert tier == PriorityTier.MEDIUM.value


def test_compute_priority_high():
    from app.worker.tasks import _compute_priority
    from app.schemas.enums import PriorityTier, DRStatus, RiskLevel

    result = {
        "dr_status": DRStatus.MODERATE.value,
        "glaucoma_risk": RiskLevel.HIGH.value,
        "hr_risk": RiskLevel.MEDIUM.value,
    }
    score, tier = _compute_priority(result)
    assert 0.45 <= score < 0.7
    assert tier == PriorityTier.HIGH.value


# ── inference simulation ────────────────────────────────────────────────────────


def test_run_inference_returns_required_keys():
    from app.worker.tasks import _run_inference

    result = _run_inference("https://test.example/image.jpg")
    required = {
        "dr_status", "dr_confidence", "glaucoma_risk", "glaucoma_confidence",
        "hr_risk", "hr_confidence", "final_decision", "recommendation",
        "decision_confidence",
    }
    assert required.issubset(result.keys())


def test_run_inference_confidence_in_range():
    from app.worker.tasks import _run_inference

    result = _run_inference("https://test.example/image2.jpg")
    assert 0.0 <= result["dr_confidence"] <= 1.0
    assert 0.0 <= result["glaucoma_confidence"] <= 1.0
    assert 0.0 <= result["hr_confidence"] <= 1.0


def test_run_inference_deterministic():
    from app.worker.tasks import _run_inference

    url = "https://res.cloudinary.com/demo/fundusai/consistent.jpg"
    r1 = _run_inference(url)
    r2 = _run_inference(url)
    assert r1 == r2


# ── Celery task logic (unit, no broker) ────────────────────────────────────────


def test_task_skips_nonexistent_case():
    from app.worker.tasks import run_analysis

    db = MagicMock()
    db.get.return_value = None

    with patch("app.worker.tasks.SessionLocal", return_value=db):
        # Call the underlying function directly to bypass Celery broker
        result = run_analysis.run(str(uuid.uuid4()))

    assert result["status"] == "skipped"
    assert result["reason"] == "case_not_found"


def test_task_skips_already_completed_case():
    from app.worker.tasks import run_analysis

    case = _make_case(status="approved")
    db = MagicMock()
    db.get.return_value = case

    with patch("app.worker.tasks.SessionLocal", return_value=db):
        result = run_analysis.run(str(case.id))

    assert result["status"] == "skipped"


def test_task_processes_case_and_commits():
    from app.worker.tasks import run_analysis

    case = _make_case(status="processing")
    db = MagicMock()
    db.get.return_value = case

    with patch("app.worker.tasks.SessionLocal", return_value=db):
        result = run_analysis.run(str(case.id))

    assert result["status"] == "complete"
    assert "priority_score" in result
    assert "priority_tier" in result
    assert db.add.called  # AnalysisResult added
    assert db.commit.called


def test_task_sets_case_status_to_awaiting_review():
    from app.worker.tasks import run_analysis
    from app.schemas.enums import CaseStatus

    case = _make_case(status="processing")
    db = MagicMock()
    db.get.return_value = case

    with patch("app.worker.tasks.SessionLocal", return_value=db):
        run_analysis.run(str(case.id))

    assert case.status == CaseStatus.AWAITING_REVIEW.value


def test_task_marks_failed_on_error():
    from app.worker.tasks import run_analysis
    from app.schemas.enums import CaseStatus

    case = _make_case(status="processing")

    call_count = 0

    def side_effect(model, id):
        nonlocal call_count
        call_count += 1
        return case

    db = MagicMock()
    db.get.side_effect = side_effect
    db.add.side_effect = Exception("DB error")

    with patch("app.worker.tasks.SessionLocal", return_value=db):
        with pytest.raises(Exception):
            run_analysis.run(str(case.id))

    assert case.status == CaseStatus.FAILED.value


# ── Cloudinary client ──────────────────────────────────────────────────────────


def test_cloudinary_configure_called():
    """_configure() should call cloudinary.config exactly once per process."""
    import app.utils.cloudinary_client as cc
    cc._configured = False  # reset for test isolation

    with patch("cloudinary.config") as mock_config, \
         patch("cloudinary.uploader.upload", return_value={"secure_url": "http://x", "public_id": "y"}):
        mock_file = MagicMock()
        mock_file.file.read.return_value = b""
        mock_file.file.seek = MagicMock()
        mock_file.content_type = "image/jpeg"

        cc.upload_image(mock_file)
        assert mock_config.called


def test_upload_image_returns_url():
    import app.utils.cloudinary_client as cc
    cc._configured = True  # skip config step

    expected = {"secure_url": "https://res.cloudinary.com/demo/x.jpg", "public_id": "demo/x"}
    with patch("cloudinary.uploader.upload", return_value=expected):
        mock_file = MagicMock()
        mock_file.file.seek = MagicMock()

        result = cc.upload_image(mock_file)

    assert result["secure_url"] == expected["secure_url"]
    assert result["public_id"] == expected["public_id"]


# ── analysis_service unit tests ────────────────────────────────────────────────


def test_analysis_service_case_not_found():
    from fastapi import HTTPException
    from app.services import analysis_service

    db = MagicMock()
    db.get.return_value = None
    user = _make_user()

    with pytest.raises(HTTPException) as exc:
        analysis_service.get_analysis_result(db, user, str(uuid.uuid4()))
    assert exc.value.status_code == 404


def test_analysis_service_still_processing():
    from fastapi import HTTPException
    from app.services import analysis_service

    user = _make_user()
    case = _make_case(status="processing", clinic_id=user.clinic_id)

    db = MagicMock()
    db.get.return_value = case

    with pytest.raises(HTTPException) as exc:
        analysis_service.get_analysis_result(db, user, str(case.id))
    assert exc.value.status_code == 409


def test_analysis_service_no_result_row():
    from fastapi import HTTPException
    from app.services import analysis_service

    user = _make_user()
    case = _make_case(status="awaiting_review", clinic_id=user.clinic_id)

    db = MagicMock()
    db.get.return_value = case
    db.execute.return_value.scalar_one_or_none.return_value = None

    with pytest.raises(HTTPException) as exc:
        analysis_service.get_analysis_result(db, user, str(case.id))
    assert exc.value.status_code == 404


def test_analysis_service_wrong_clinic():
    from fastapi import HTTPException
    from app.services import analysis_service

    user = _make_user()
    case = _make_case(status="awaiting_review", clinic_id=uuid.uuid4())  # different

    db = MagicMock()
    db.get.return_value = case

    with pytest.raises(HTTPException) as exc:
        analysis_service.get_analysis_result(db, user, str(case.id))
    assert exc.value.status_code == 403


def test_analysis_service_success():
    from app.services import analysis_service
    from app.schemas.enums import DRStatus, RiskLevel

    user = _make_user()
    cid = user.clinic_id
    case = _make_case(status="awaiting_review", clinic_id=cid)
    ar = _make_analysis_result(case.id)

    db = MagicMock()
    db.get.return_value = case
    db.execute.return_value.scalar_one_or_none.return_value = ar

    result = analysis_service.get_analysis_result(db, user, str(case.id))

    assert result.caseId == str(case.id)
    assert result.dr.status == DRStatus.MODERATE
    assert result.glaucoma.risk == RiskLevel.MEDIUM
    assert 1 <= result.severityLevel <= 4


def test_analysis_service_superadmin_bypass():
    """super_admin can access any case regardless of clinic."""
    from app.services import analysis_service

    admin = _make_user(role="super_admin")
    admin.clinic_id = None
    case = _make_case(status="approved", clinic_id=uuid.uuid4())
    ar = _make_analysis_result(case.id)

    db = MagicMock()
    db.get.return_value = case
    db.execute.return_value.scalar_one_or_none.return_value = ar

    result = analysis_service.get_analysis_result(db, admin, str(case.id))
    assert result.id == str(ar.id)


# ── analysis HTTP router ───────────────────────────────────────────────────────


def test_analysis_router_prefix():
    from app.api.v1.analysis import router
    assert router.prefix == "/analysis"


def test_analysis_router_has_get_route():
    from app.api.v1.analysis import router
    paths = {r.path for r in router.routes}
    assert "/analysis/{case_id}" in paths


def test_analysis_http_requires_auth():
    from app.main import app

    app.dependency_overrides.clear()
    from fastapi.testclient import TestClient
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get(f"/api/v1/analysis/{uuid.uuid4()}")
    assert resp.status_code in (401, 403)


def test_analysis_http_case_not_found():
    from fastapi import HTTPException
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.security import require_doctor

    user = _make_user()
    app.dependency_overrides[require_doctor] = lambda: user

    with patch(
        "app.api.v1.analysis.analysis_service.get_analysis_result",
        side_effect=HTTPException(status_code=404, detail="Case not found"),
    ):
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get(f"/api/v1/analysis/{uuid.uuid4()}")

    assert resp.status_code == 404


def test_analysis_http_success():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.security import require_doctor
    from app.schemas.analysis import AnalysisResultOut, DRResultOut, DiseaseResultOut
    from app.schemas.enums import DecisionConfidence, DRStatus, RiskLevel

    user = _make_user()
    app.dependency_overrides[require_doctor] = lambda: user

    mock_result = AnalysisResultOut(
        id=str(uuid.uuid4()),
        caseId=str(uuid.uuid4()),
        dr=DRResultOut(status=DRStatus.MILD, confidence=0.75, severityLevel=2),
        glaucoma=DiseaseResultOut(risk=RiskLevel.LOW, confidence=0.60),
        hypertensiveRetinopathy=DiseaseResultOut(risk=RiskLevel.LOW, confidence=0.55),
        finalDecision="Mild DR detected",
        recommendation="Follow-up in 12 months",
        ragJustification="RAG context",
        severityLevel=2,
        decisionConfidence=DecisionConfidence.SUSPICIOUS,
        createdAt="2026-01-01T00:00:00+00:00",
    )

    with patch(
        "app.api.v1.analysis.analysis_service.get_analysis_result",
        return_value=mock_result,
    ):
        client = TestClient(app, raise_server_exceptions=False)
        resp = client.get(f"/api/v1/analysis/{uuid.uuid4()}")

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["dr"]["status"] == "Mild"


# ── case_service upload integration (Cloudinary + Celery) ─────────────────────


def test_upload_case_calls_cloudinary():
    from app.services import case_service
    from app.schemas.enums import CaseStatus

    patient = MagicMock()
    patient.id = uuid.uuid4()
    patient.clinic_id = uuid.uuid4()

    user = _make_user()
    user.clinic_id = patient.clinic_id

    db = MagicMock()
    db.get.return_value = patient

    image = MagicMock()
    image.content_type = "image/jpeg"
    image.file.read.return_value = b"x" * 1024
    image.file.seek = MagicMock()

    cloudinary_return = {
        "secure_url": "https://res.cloudinary.com/demo/fundusai/test.jpg",
        "public_id": "fundusai/test",
    }

    mock_celery_task = MagicMock()
    mock_celery_task.id = str(uuid.uuid4())

    with patch("app.utils.cloudinary_client.upload_image", return_value=cloudinary_return) as mock_upload, \
         patch("app.worker.tasks.run_analysis") as mock_task:
        mock_task.delay.return_value = mock_celery_task

        result = case_service.upload_case(db, user, str(patient.id), image)

    mock_upload.assert_called_once()
    mock_task.delay.assert_called_once()
    assert result.status == CaseStatus.PROCESSING
    assert result.taskId == mock_celery_task.id


def test_upload_case_502_on_cloudinary_error():
    from fastapi import HTTPException
    from app.services import case_service

    patient = MagicMock()
    patient.id = uuid.uuid4()
    patient.clinic_id = uuid.uuid4()

    user = _make_user()
    user.clinic_id = patient.clinic_id

    db = MagicMock()
    db.get.return_value = patient

    image = MagicMock()
    image.content_type = "image/jpeg"
    image.file.read.return_value = b"x" * 1024
    image.file.seek = MagicMock()

    with patch("app.utils.cloudinary_client.upload_image", side_effect=Exception("network error")):
        with pytest.raises(HTTPException) as exc:
            case_service.upload_case(db, user, str(patient.id), image)

    assert exc.value.status_code == 502
