"""
Chunk 0 contract tests.

Tests that every schema can be instantiated, serialized, and round-tripped, and
that the health endpoint returns data wrapped in ApiResponse.

Run with:
    cd projects/RUG -Tech/src/backend
    pip install fastapi pydantic pydantic-settings pydantic[email] httpx pytest
    pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.admin import (
    ClinicOut,
    CreateClinicRequest,
    CreateUserRequest,
    PlatformStatsOut,
    UpdateUserStatusRequest,
)
from app.schemas.analysis import AnalysisResultOut, DiseaseResultOut, DRResultOut
from app.schemas.auth import AuthSession, LoginRequest, LogoutResponse, RefreshRequest, RefreshResponse, UserOut
from app.schemas.base import ApiError, ApiResponse, PaginatedResponse
from app.schemas.case import (
    CaseDetailOut,
    CaseSummaryOut,
    CaseStatusOut,
    RejectCaseRequest,
    SubmittedByUserOut,
    UploadCaseData,
)
from app.schemas.enums import (
    CaseStatus,
    DecisionConfidence,
    DRStatus,
    ErrorCode,
    Gender,
    ImageQuality,
    PriorityTier,
    ReportType,
    RiskLevel,
    UserRole,
)
from app.schemas.health import HealthData
from app.schemas.patient import CreatePatientRequest, PatientDetailOut, PatientSummaryOut, UpdatePatientRequest
from app.schemas.report import DoctorReportOut, PatientReportOut, PDFDownloadUrlOut, ReportDiagnosis, ReportPatientInfo


client = TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Enums
# ─────────────────────────────────────────────────────────────────────────────

class TestEnums:
    def test_user_role_values(self):
        assert UserRole.SUPER_ADMIN == "super_admin"
        assert UserRole.DOCTOR == "doctor"
        # Only 2 roles in MVP
        assert len(list(UserRole)) == 2

    def test_case_status_values(self):
        expected = {"processing", "quality_failed", "awaiting_review", "approved", "rejected", "failed"}
        assert {s.value for s in CaseStatus} == expected

    def test_image_quality_values(self):
        assert ImageQuality.GOOD == "good"
        assert ImageQuality.BLURRY == "blurry"

    def test_dr_status_values(self):
        assert DRStatus.NONE == "None"
        assert DRStatus.PDR == "PDR"

    def test_risk_level_values(self):
        assert {r.value for r in RiskLevel} == {"Low", "Medium", "High"}

    def test_priority_tier_values(self):
        assert {p.value for p in PriorityTier} == {"critical", "high", "medium", "low"}

    def test_error_code_has_required_codes(self):
        required = {
            "VALIDATION_ERROR", "AUTH_REQUIRED", "TOKEN_EXPIRED", "FORBIDDEN",
            "NOT_FOUND", "CONFLICT", "UPLOAD_INVALID_TYPE", "UPLOAD_TOO_LARGE",
            "UPLOAD_TOO_SMALL", "QUALITY_FAILED", "INFERENCE_FAILED", "INTERNAL_ERROR",
        }
        assert required == {e.value for e in ErrorCode}

    def test_decision_confidence_values(self):
        assert DecisionConfidence.CLEAR == "Clear diagnosis"

    def test_report_type_values(self):
        assert ReportType.DOCTOR == "doctor"
        assert ReportType.PATIENT == "patient"


# ─────────────────────────────────────────────────────────────────────────────
# 2. Base envelope
# ─────────────────────────────────────────────────────────────────────────────

class TestApiResponse:
    def test_ok_wraps_data(self):
        resp = ApiResponse.ok({"key": "value"})
        assert resp.success is True
        assert resp.data == {"key": "value"}
        assert resp.error is None

    def test_fail_sets_error(self):
        resp = ApiResponse.fail("NOT_FOUND", "Resource not found")
        assert resp.success is False
        assert resp.data is None
        assert resp.error is not None
        assert resp.error.code == "NOT_FOUND"
        assert resp.error.message == "Resource not found"
        assert resp.error.details is None

    def test_fail_with_details(self):
        details = {"email": ["Not a valid email"]}
        resp = ApiResponse.fail("VALIDATION_ERROR", "Invalid input", details)
        assert resp.error.details == details

    def test_serialisation_round_trip(self):
        data = {"foo": "bar"}
        resp = ApiResponse.ok(data)
        dumped = resp.model_dump()
        assert dumped["success"] is True
        assert dumped["data"] == data
        assert dumped["error"] is None

    def test_api_error_schema(self):
        err = ApiError(code="FORBIDDEN", message="Not allowed", details={"field": ["err"]})
        assert err.code == "FORBIDDEN"
        assert err.details == {"field": ["err"]}


class TestPaginatedResponse:
    def test_creates_correctly(self):
        items = [{"id": str(i)} for i in range(3)]
        page = PaginatedResponse(items=items, total=3, page=1, limit=10, totalPages=1)
        assert page.total == 3
        assert len(page.items) == 3

    def test_wrapped_in_api_response(self):
        items = [1, 2, 3]
        paged = PaginatedResponse(items=items, total=3, page=1, limit=10, totalPages=1)
        resp = ApiResponse.ok(paged)
        assert resp.success is True
        assert resp.data.total == 3


# ─────────────────────────────────────────────────────────────────────────────
# 3. Auth schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestAuthSchemas:
    def _user(self):
        return UserOut(
            id="user-1",
            email="doc@clinic.com",
            role=UserRole.DOCTOR,
            clinicId="clinic-1",
            fullName="Dr. Smith",
            isActive=True,
            createdAt="2026-01-01T00:00:00Z",
        )

    def test_user_out(self):
        u = self._user()
        assert u.role == UserRole.DOCTOR
        assert u.tokenType if hasattr(u, "tokenType") else True  # optional

    def test_auth_session(self):
        sess = AuthSession(
            user=self._user(),
            accessToken="tok.abc.def",
            tokenType="Bearer",
            expiresIn=3600,
        )
        assert sess.tokenType == "Bearer"
        assert sess.expiresIn == 3600

    def test_login_request_requires_valid_email(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            LoginRequest(email="not-an-email", password="secret1")

    def test_login_request_password_min_length(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            LoginRequest(email="a@b.com", password="123")

    def test_login_request_valid(self):
        req = LoginRequest(email="doc@clinic.com", password="fundus-demo-123")
        assert req.email == "doc@clinic.com"

    def test_refresh_request(self):
        r = RefreshRequest(refreshToken="tok.xyz")
        assert r.refreshToken == "tok.xyz"

    def test_refresh_response(self):
        r = RefreshResponse(accessToken="new.tok")
        assert r.accessToken == "new.tok"

    def test_logout_response(self):
        r = LogoutResponse()
        assert "Logged out" in r.message


# ─────────────────────────────────────────────────────────────────────────────
# 4. Patient schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestPatientSchemas:
    def test_create_patient_request_valid(self):
        req = CreatePatientRequest(
            fullName="Jane Doe",
            dateOfBirth="1990-05-15",
            gender=Gender.FEMALE,
            contact="+1234567890",
            medicalId="MED-001",
        )
        assert req.gender == Gender.FEMALE

    def test_create_patient_requires_full_name(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CreatePatientRequest(
                fullName="",
                dateOfBirth="1990-05-15",
                gender=Gender.MALE,
                contact="123",
                medicalId="X",
            )

    def test_update_patient_all_optional(self):
        req = UpdatePatientRequest()
        assert req.fullName is None
        assert req.gender is None

    def test_patient_summary_out(self):
        s = PatientSummaryOut(
            id="p-1",
            fullName="Jane",
            medicalId="MED-001",
            age=34,
            lastCaseDate=None,
            totalCases=0,
        )
        assert s.age == 34
        assert s.lastCaseDate is None

    def test_patient_detail_out(self):
        d = PatientDetailOut(
            id="p-1",
            clinicId="c-1",
            fullName="Jane Doe",
            dateOfBirth="1990-05-15",
            gender=Gender.FEMALE,
            contact="+1234567890",
            medicalId="MED-001",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
            cases=[],
        )
        assert d.cases == []


# ─────────────────────────────────────────────────────────────────────────────
# 5. Case schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestCaseSchemas:
    def test_upload_case_data_defaults(self):
        u = UploadCaseData(
            caseId="case-1",
            qualityCheck=ImageQuality.GOOD,
            taskId="task-1",
        )
        assert u.status == CaseStatus.PROCESSING
        assert "queued" in u.message.lower()

    def test_case_status_out(self):
        s = CaseStatusOut(status=CaseStatus.AWAITING_REVIEW, priorityScore=0.75)
        assert s.status == CaseStatus.AWAITING_REVIEW

    def test_case_summary_out(self):
        s = CaseSummaryOut(
            id="case-1",
            patientName="Jane",
            status=CaseStatus.APPROVED,
            priorityTier=PriorityTier.HIGH,
            priorityScore=0.9,
            imageQuality=ImageQuality.GOOD,
            drStatus="Mild",
            createdAt="2026-01-01T00:00:00Z",
        )
        assert s.priorityTier == PriorityTier.HIGH

    def test_case_detail_out(self):
        patient = PatientSummaryOut(
            id="p-1", fullName="Jane", medicalId="MED-001",
            age=34, lastCaseDate=None, totalCases=1,
        )
        d = CaseDetailOut(
            id="case-1",
            patientId="p-1",
            clinicId="c-1",
            submittedBy="user-1",
            imageUrl="https://cdn.example.com/img.jpg",
            imageQuality=ImageQuality.GOOD,
            status=CaseStatus.AWAITING_REVIEW,
            priorityScore=0.8,
            priorityTier=PriorityTier.HIGH,
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
            patient=patient,
            submittedByUser=SubmittedByUserOut(id="user-1", fullName="Dr. Smith"),
        )
        assert d.patient.id == "p-1"

    def test_reject_case_request_requires_reason(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            RejectCaseRequest(reason="")


# ─────────────────────────────────────────────────────────────────────────────
# 6. Analysis schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestAnalysisSchemas:
    def test_dr_result_out(self):
        dr = DRResultOut(status=DRStatus.MODERATE, confidence=0.87, severityLevel=2)
        assert dr.status == DRStatus.MODERATE
        assert dr.severityLevel == 2

    def test_confidence_range_validated(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            DRResultOut(status=DRStatus.NONE, confidence=1.5, severityLevel=1)

    def test_disease_result_out(self):
        d = DiseaseResultOut(risk=RiskLevel.HIGH, confidence=0.72)
        assert d.risk == RiskLevel.HIGH

    def test_analysis_result_out(self):
        r = AnalysisResultOut(
            id="ar-1",
            caseId="case-1",
            dr=DRResultOut(status=DRStatus.MILD, confidence=0.87, severityLevel=1),
            glaucoma=DiseaseResultOut(risk=RiskLevel.LOW, confidence=0.91),
            hypertensiveRetinopathy=DiseaseResultOut(risk=RiskLevel.MEDIUM, confidence=0.65),
            finalDecision="Mild DR detected",
            recommendation="Follow up in 6 months",
            ragJustification="Evidence-based reasoning...",
            heatmapUrl=None,
            severityLevel=1,
            decisionConfidence=DecisionConfidence.CLEAR,
            createdAt="2026-01-01T00:00:00Z",
        )
        assert r.decisionConfidence == DecisionConfidence.CLEAR


# ─────────────────────────────────────────────────────────────────────────────
# 7. Report schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestReportSchemas:
    def test_doctor_report_has_disclaimer(self):
        r = DoctorReportOut(
            patient=ReportPatientInfo(fullName="Jane", age=34, gender=Gender.FEMALE),
            diagnosis=ReportDiagnosis(primary="Diabetic Retinopathy", severity="Mild", confidence="87%"),
            planOfAction="Refer to ophthalmologist",
            medicationSuggestions=["Metformin adjustment"],
            ragJustification="...",
            heatmapUrl="https://cdn.example.com/heatmap.jpg",
            generatedAt="2026-01-01T00:00:00Z",
        )
        assert "not a medical diagnostic system" in r.disclaimer
        assert r.reportType == ReportType.DOCTOR

    def test_patient_report_has_disclaimer(self):
        r = PatientReportOut(
            summary="Mild changes detected",
            whatWasFound="Early signs of diabetic retinopathy",
            nextSteps="See your doctor within 2 weeks",
            severityLabel="Mild",
            urgency="Moderate",
            generatedAt="2026-01-01T00:00:00Z",
        )
        assert "not a medical diagnostic system" in r.disclaimer
        assert r.reportType == ReportType.PATIENT

    def test_pdf_download_url_out(self):
        p = PDFDownloadUrlOut(url="https://cdn.example.com/report.pdf", expiresAt="2026-01-02T00:00:00Z")
        assert p.url.startswith("https://")


# ─────────────────────────────────────────────────────────────────────────────
# 8. Admin schemas
# ─────────────────────────────────────────────────────────────────────────────

class TestAdminSchemas:
    def test_create_clinic_request(self):
        req = CreateClinicRequest(name="City Eye Clinic", address="123 Main St", phone="+1234567890")
        assert req.name == "City Eye Clinic"

    def test_create_user_request_default_role(self):
        req = CreateUserRequest(email="doc@clinic.com", fullName="Dr. Jones")
        assert req.role == UserRole.DOCTOR

    def test_create_user_request_invalid_email(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            CreateUserRequest(email="bad-email", fullName="Dr. Jones")

    def test_update_user_status(self):
        req = UpdateUserStatusRequest(isActive=False)
        assert req.isActive is False

    def test_platform_stats_out(self):
        s = PlatformStatsOut(
            totalClinics=5,
            totalUsers=20,
            totalCases=100,
            todayCases=8,
            criticalCases=2,
            avgProcessingTimeMs=1200.5,
        )
        assert s.criticalCases == 2


# ─────────────────────────────────────────────────────────────────────────────
# 9. Health endpoint (HTTP)
# ─────────────────────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_returns_200(self):
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200

    def test_response_uses_envelope(self):
        body = client.get("/api/v1/health").json()
        assert body["success"] is True
        assert body["error"] is None
        assert "data" in body

    def test_data_has_status_and_message(self):
        data = client.get("/api/v1/health").json()["data"]
        assert data["status"] == "ok"
        assert isinstance(data["message"], str)

    def test_content_type_is_json(self):
        resp = client.get("/api/v1/health")
        assert "application/json" in resp.headers["content-type"]


# ─────────────────────────────────────────────────────────────────────────────
# 10. Settings smoke test
# ─────────────────────────────────────────────────────────────────────────────

class TestSettings:
    def test_settings_load_without_error(self):
        from app.core.config import settings
        assert settings.APP_NAME == "FundusAI Backend"
        assert settings.API_V1_PREFIX == "/api/v1"

    def test_upload_defaults_are_sane(self):
        from app.core.config import settings
        assert settings.UPLOAD_MAX_SIZE_MB > 0
        assert settings.UPLOAD_MIN_DIMENSION_PX >= 224
        assert "image/jpeg" in settings.UPLOAD_ALLOWED_MIME_TYPES
        assert "image/png" in settings.UPLOAD_ALLOWED_MIME_TYPES

    def test_pdf_expiry_is_positive(self):
        from app.core.config import settings
        assert settings.PDF_DOWNLOAD_EXPIRY_SECONDS > 0
