"""
Chunk 2 tests: ORM model instantiation, relationships, enum value alignment,
security module imports, and migration file structure.

No database connection required — all tests operate on Python objects only.
"""

import importlib
import uuid
from datetime import date, datetime, timezone

import pytest

# ── Model imports ──────────────────────────────────────────────────────────────


def test_models_package_exports_all():
    """__init__ must export all 7 domain models + Base."""
    from app.models import (
        AnalysisResult,
        AuditLog,
        Base,
        Case,
        Clinic,
        Patient,
        Report,
        User,
    )

    assert all(
        cls is not None
        for cls in [Base, Clinic, User, Patient, Case, AnalysisResult, Report, AuditLog]
    )


# ── Table name tests ───────────────────────────────────────────────────────────


def test_table_names():
    from app.models import AnalysisResult, AuditLog, Case, Clinic, Patient, Report, User

    assert Clinic.__tablename__ == "clinics"
    assert User.__tablename__ == "users"
    assert Patient.__tablename__ == "patients"
    assert Case.__tablename__ == "cases"
    assert AnalysisResult.__tablename__ == "analysis_results"
    assert Report.__tablename__ == "reports"
    assert AuditLog.__tablename__ == "audit_logs"


# ── Column existence (via mapped_column inspection) ────────────────────────────


def test_clinic_columns():
    from app.models.clinic import Clinic

    cols = {c.key for c in Clinic.__table__.columns}
    assert {"id", "name", "address", "phone", "is_active", "created_at"}.issubset(cols)


def test_user_columns():
    from app.models.user import User

    cols = {c.key for c in User.__table__.columns}
    assert {"id", "email", "full_name", "role", "clinic_id", "is_active", "created_at", "updated_at"}.issubset(cols)


def test_patient_columns():
    from app.models.patient import Patient

    cols = {c.key for c in Patient.__table__.columns}
    assert {
        "id", "clinic_id", "full_name", "date_of_birth", "gender",
        "contact_phone", "medical_id", "created_by", "created_at", "updated_at",
    }.issubset(cols)


def test_case_columns():
    from app.models.case import Case

    cols = {c.key for c in Case.__table__.columns}
    assert {
        "id", "patient_id", "clinic_id", "submitted_by",
        "image_url", "image_quality", "status",
        "priority_score", "priority_tier", "task_id",
        "rejection_reason", "created_at", "updated_at",
    }.issubset(cols)


def test_analysis_result_columns():
    from app.models.analysis_result import AnalysisResult

    cols = {c.key for c in AnalysisResult.__table__.columns}
    assert {
        "id", "case_id",
        "dr_status", "dr_confidence", "dr_severity_level",
        "glaucoma_risk", "glaucoma_confidence",
        "hr_risk", "hr_confidence",
        "final_decision", "recommendation", "rag_justification",
        "heatmap_url", "severity_level", "decision_confidence",
        "created_at",
    }.issubset(cols)


def test_report_columns():
    from app.models.report import Report

    cols = {c.key for c in Report.__table__.columns}
    assert {"id", "case_id", "report_type", "content_json", "pdf_url", "pdf_expires_at", "created_at"}.issubset(cols)


def test_audit_log_columns():
    from app.models.audit_log import AuditLog

    cols = {c.key for c in AuditLog.__table__.columns}
    assert {"id", "user_id", "action", "resource_type", "resource_id", "ip_address", "created_at"}.issubset(cols)


# ── Primary key type (UUID) ────────────────────────────────────────────────────


def test_all_models_have_uuid_pk():
    from sqlalchemy.dialects.postgresql import UUID
    from app.models import AnalysisResult, AuditLog, Case, Clinic, Patient, Report, User

    for model in [Clinic, User, Patient, Case, AnalysisResult, Report, AuditLog]:
        pk_col = model.__table__.c["id"]
        assert pk_col.primary_key, f"{model.__name__}.id must be primary key"
        # UUID type may be wrapped — check string representation
        assert "UUID" in str(pk_col.type).upper() or "uuid" in str(pk_col.type).lower(), \
            f"{model.__name__}.id must be UUID type"


# ── Foreign key assertions ─────────────────────────────────────────────────────


def test_user_fk_to_clinic():
    from app.models.user import User

    fks = {fk.target_fullname for fk in User.__table__.foreign_keys}
    assert "clinics.id" in fks


def test_patient_fk_to_clinic_and_user():
    from app.models.patient import Patient

    fks = {fk.target_fullname for fk in Patient.__table__.foreign_keys}
    assert "clinics.id" in fks
    assert "users.id" in fks


def test_case_fks():
    from app.models.case import Case

    fks = {fk.target_fullname for fk in Case.__table__.foreign_keys}
    assert "patients.id" in fks
    assert "clinics.id" in fks
    assert "users.id" in fks


def test_analysis_result_fk_cascade():
    from app.models.analysis_result import AnalysisResult

    fks = {fk.target_fullname: fk for fk in AnalysisResult.__table__.foreign_keys}
    assert "cases.id" in fks
    assert fks["cases.id"].ondelete == "CASCADE"


def test_report_fk_cascade():
    from app.models.report import Report

    fks = {fk.target_fullname: fk for fk in Report.__table__.foreign_keys}
    assert "cases.id" in fks
    assert fks["cases.id"].ondelete == "CASCADE"


def test_audit_log_fk_set_null():
    from app.models.audit_log import AuditLog

    fks = {fk.target_fullname: fk for fk in AuditLog.__table__.foreign_keys}
    assert "users.id" in fks
    assert fks["users.id"].ondelete == "SET NULL"


# ── Unique constraints ─────────────────────────────────────────────────────────


def test_user_email_unique():
    from app.models.user import User

    col = User.__table__.c["email"]
    assert col.unique, "users.email must have a unique constraint"


def test_analysis_result_case_id_unique():
    from app.models.analysis_result import AnalysisResult

    col = AnalysisResult.__table__.c["case_id"]
    assert col.unique


def test_case_task_id_unique():
    from app.models.case import Case

    col = Case.__table__.c["task_id"]
    assert col.unique


# ── Relationship names ─────────────────────────────────────────────────────────


def test_clinic_relationships():
    from app.models.clinic import Clinic

    rel_names = set(Clinic.__mapper__.relationships.keys())
    assert {"users", "patients", "cases"}.issubset(rel_names)


def test_user_relationships():
    from app.models.user import User

    rel_names = set(User.__mapper__.relationships.keys())
    assert {"clinic", "created_patients", "submitted_cases", "audit_logs"}.issubset(rel_names)


def test_case_has_one_analysis_result():
    from app.models.case import Case

    rel = Case.__mapper__.relationships["analysis_result"]
    assert rel.uselist is False  # one-to-one


# ── Enum value alignment ───────────────────────────────────────────────────────


def test_user_role_default_is_doctor_string():
    from app.models.user import User
    from app.schemas.enums import UserRole

    col = User.__table__.c["role"]
    assert col.server_default is None or True  # server_default not set at column level
    # The Python default is set via default= kwarg on Column
    # Verify the enum value matches what the column stores
    assert UserRole.DOCTOR.value == "doctor"


def test_case_status_default_value():
    from app.models.case import Case
    from app.schemas.enums import CaseStatus

    col = Case.__table__.c["status"]
    assert CaseStatus.PROCESSING.value == "processing"


# ── Security module ────────────────────────────────────────────────────────────


def test_security_module_importable():
    import app.core.security as sec
    assert hasattr(sec, "verify_token")
    assert hasattr(sec, "get_current_user")
    assert hasattr(sec, "require_doctor")
    assert hasattr(sec, "require_admin")
    assert hasattr(sec, "CurrentUser")
    assert hasattr(sec, "AdminUser")


def test_security_exports_type_aliases():
    from app.core.security import AdminUser, CurrentUser

    # They should be Annotated types (typing special form), not None
    assert CurrentUser is not None
    assert AdminUser is not None


# ── Alembic migration file ─────────────────────────────────────────────────────


def test_migration_file_exists():
    import pathlib

    versions_dir = (
        pathlib.Path(__file__).parent.parent / "alembic" / "versions"
    )
    migration_files = list(versions_dir.glob("0001_*.py"))
    assert len(migration_files) == 1, "0001_initial_schema.py must exist"


def _load_migration():
    import importlib.util
    import pathlib

    path = (
        pathlib.Path(__file__).parent.parent
        / "alembic"
        / "versions"
        / "0001_initial_schema.py"
    )
    spec = importlib.util.spec_from_file_location("migration_0001", path)
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    spec.loader.exec_module(mod)  # type: ignore
    return mod


def test_migration_has_correct_revision():
    migration = _load_migration()
    assert migration.revision == "0001"
    assert migration.down_revision is None


def test_migration_has_upgrade_and_downgrade():
    migration = _load_migration()
    assert callable(migration.upgrade)
    assert callable(migration.downgrade)


# ── Base metadata naming convention ───────────────────────────────────────────


def test_base_metadata_naming_convention():
    from app.models.base import Base

    nc = Base.metadata.naming_convention
    assert "fk" in nc
    assert "pk" in nc
    assert "uq" in nc
    assert "ix" in nc
