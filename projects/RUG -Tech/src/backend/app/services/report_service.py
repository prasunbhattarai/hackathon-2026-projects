"""
Report service (Chunk 6).

Creates doctor/patient report payloads, generates PDFs, stores report rows,
and refreshes signed PDF URLs when they expire.
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.analysis_result import AnalysisResult
from app.models.case import Case
from app.models.patient import Patient
from app.models.report import Report
from app.models.user import User
from app.schemas.enums import CaseStatus, DRStatus, Gender, ReportType, UserRole
from app.schemas.report import (
    DoctorReportOut,
    PDFDownloadUrlOut,
    PatientReportOut,
    ReportDiagnosis,
    ReportOut,
    ReportPatientInfo,
)
from app.utils.cloudinary_client import build_signed_raw_url, upload_pdf

_ALLOWED_REPORT_STATUSES = {
    CaseStatus.AWAITING_REVIEW.value,
    CaseStatus.APPROVED.value,
}


def _assert_case_access(user: User, case: Case) -> None:
    if user.role == UserRole.SUPER_ADMIN.value:
        return
    if user.clinic_id != case.clinic_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _age(dob: date | None) -> int:
    if dob is None:
        return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _severity_label(dr_status: str | None) -> str:
    if not dr_status:
        return "No DR findings"
    try:
        mapped = DRStatus(dr_status)
        return mapped.value
    except Exception:
        return dr_status


def _doctor_medication_suggestions(dr_status: str | None) -> list[str]:
    if dr_status in {DRStatus.SEVERE.value, DRStatus.PDR.value}:
        return [
            "Urgent retina specialist referral for advanced DR management.",
            "Consider anti-VEGF pathway evaluation based on full clinical exam.",
        ]
    return [
        "Optimize glycemic and blood pressure control in coordination with PCP.",
        "Continue regular retinal monitoring and risk-factor counseling.",
    ]


def _build_doctor_report(
    patient: Patient,
    analysis: AnalysisResult,
    generated_at: datetime,
) -> DoctorReportOut:
    return DoctorReportOut(
        reportType=ReportType.DOCTOR,
        patient=ReportPatientInfo(
            fullName=patient.full_name,
            age=_age(patient.date_of_birth),
            gender=patient.gender or Gender.OTHER.value,
        ),
        diagnosis=ReportDiagnosis(
            primary=analysis.final_decision or "Retinal disease risk detected",
            severity=_severity_label(analysis.dr_status),
            confidence=f"{int((analysis.dr_confidence or 0.0) * 100)}%",
        ),
        planOfAction=analysis.recommendation or "Clinical review recommended.",
        medicationSuggestions=_doctor_medication_suggestions(analysis.dr_status),
        ragJustification=analysis.rag_justification or "No additional context available.",
        heatmapUrl=analysis.heatmap_url or "",
        generatedAt=generated_at.isoformat(),
    )


def _build_patient_report(
    analysis: AnalysisResult,
    generated_at: datetime,
) -> PatientReportOut:
    severity = _severity_label(analysis.dr_status)
    urgency = "See an eye doctor soon" if severity in {"Severe", "PDR"} else "Routine follow-up"
    return PatientReportOut(
        reportType=ReportType.PATIENT,
        summary=analysis.final_decision or "Your eye scan has been reviewed.",
        whatWasFound=severity,
        nextSteps=analysis.recommendation or "Please follow your doctor instructions.",
        severityLabel=severity,
        urgency=urgency,
        generatedAt=generated_at.isoformat(),
    )


def _render_pdf_bytes(report_type: ReportType, report_payload: dict) -> bytes:
    from weasyprint import HTML

    title = "Doctor Report" if report_type == ReportType.DOCTOR else "Patient Report"
    body_lines = []
    for key, value in report_payload.items():
        body_lines.append(f"<p><strong>{key}</strong>: {value}</p>")
    html = f"""
    <html>
      <head>
        <meta charset=\"utf-8\" />
        <style>
          body {{ font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }}
          h1 {{ color: #0f766e; margin-bottom: 16px; }}
          p {{ margin: 6px 0; }}
        </style>
      </head>
      <body>
        <h1>{title}</h1>
        {''.join(body_lines)}
      </body>
    </html>
    """
    return HTML(string=html).write_pdf()


def _to_report_out(report: Report) -> ReportOut:
    payload = report.content_json or {}
    report_type = ReportType(report.report_type)

    if report_type == ReportType.DOCTOR:
        report_data = DoctorReportOut.model_validate(payload)
    else:
        report_data = PatientReportOut.model_validate(payload)

    return ReportOut(
        id=str(report.id),
        caseId=str(report.case_id),
        reportType=report_type,
        reportData=report_data,
        pdf=PDFDownloadUrlOut(
            url=report.pdf_url or "",
            expiresAt=(report.pdf_expires_at or datetime.now(UTC)).isoformat(),
        ),
        createdAt=report.created_at.isoformat(),
    )


def _refresh_pdf_url_if_expired(db: Session, report: Report) -> None:
    if report.pdf_expires_at is None:
        return
    now = datetime.now(UTC)
    expires_at = report.pdf_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if now < expires_at:
        return

    payload = report.content_json or {}
    public_id = payload.get("_pdf_public_id")
    file_format = payload.get("_pdf_format", "pdf")
    if not public_id:
        return

    settings = get_settings()
    new_expiry = now + timedelta(seconds=settings.PDF_DOWNLOAD_EXPIRY_SECONDS)
    report.pdf_url = build_signed_raw_url(public_id, new_expiry, file_format)
    report.pdf_expires_at = new_expiry
    db.commit()
    db.refresh(report)


def _load_case_and_analysis(db: Session, user: User, case_id: str) -> tuple[Case, Patient, AnalysisResult]:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    if case.status not in _ALLOWED_REPORT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Report is only available after case review starts.",
        )

    patient = db.get(Patient, case.patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    analysis = db.execute(
        select(AnalysisResult).where(AnalysisResult.case_id == case.id)
    ).scalar_one_or_none()
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis result available for this case",
        )

    return case, patient, analysis


def generate_report(
    db: Session,
    user: User,
    case_id: str,
    report_type: ReportType,
) -> ReportOut:
    case, patient, analysis = _load_case_and_analysis(db, user, case_id)
    generated_at = datetime.now(UTC)

    if report_type == ReportType.DOCTOR:
        report_data = _build_doctor_report(patient, analysis, generated_at)
    else:
        report_data = _build_patient_report(analysis, generated_at)

    payload = report_data.model_dump()
    pdf_bytes = _render_pdf_bytes(report_type, payload)

    public_id = f"fundusai/reports/{case.id}/{report_type.value}-{uuid.uuid4().hex[:8]}"
    upload_result = upload_pdf(pdf_bytes, public_id=public_id)
    effective_public_id = upload_result.get("public_id", public_id)
    file_format = upload_result.get("format", "pdf")

    settings = get_settings()
    expires_at = generated_at + timedelta(seconds=settings.PDF_DOWNLOAD_EXPIRY_SECONDS)
    signed_url = build_signed_raw_url(effective_public_id, expires_at, file_format)

    content_json = {
        **payload,
        "_pdf_public_id": effective_public_id,
        "_pdf_format": file_format,
    }

    report = Report(
        case_id=case.id,
        report_type=report_type.value,
        content_json=content_json,
        pdf_url=signed_url,
        pdf_expires_at=expires_at,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return _to_report_out(report)


def get_report(
    db: Session,
    user: User,
    report_id: str,
) -> ReportOut:
    report = db.get(Report, uuid.UUID(report_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    case = db.get(Case, report.case_id)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    _refresh_pdf_url_if_expired(db, report)
    return _to_report_out(report)


def list_reports(
    db: Session,
    user: User,
    case_id: str,
) -> list[ReportOut]:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    reports = db.execute(
        select(Report)
        .where(Report.case_id == case.id)
        .order_by(Report.created_at.desc())
    ).scalars().all()

    output: list[ReportOut] = []
    for report in reports:
        _refresh_pdf_url_if_expired(db, report)
        output.append(_to_report_out(report))

    return output


def get_case_report_json(
    db: Session,
    user: User,
    case_id: str,
    report_type: ReportType,
) -> DoctorReportOut | PatientReportOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    existing = db.execute(
        select(Report)
        .where(Report.case_id == case.id, Report.report_type == report_type.value)
        .order_by(Report.created_at.desc())
    ).scalar_one_or_none()

    if existing is None:
        generated = generate_report(db, user, case_id, report_type)
        return generated.reportData

    payload = existing.content_json or {}
    if report_type == ReportType.DOCTOR:
        return DoctorReportOut.model_validate(payload)
    return PatientReportOut.model_validate(payload)


def get_case_pdf_url(
    db: Session,
    user: User,
    case_id: str,
    report_type: ReportType,
) -> PDFDownloadUrlOut:
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    report = db.execute(
        select(Report)
        .where(Report.case_id == case.id, Report.report_type == report_type.value)
        .order_by(Report.created_at.desc())
    ).scalar_one_or_none()

    if report is None:
        generated = generate_report(db, user, case_id, report_type)
        return generated.pdf

    _refresh_pdf_url_if_expired(db, report)
    return PDFDownloadUrlOut(
        url=report.pdf_url or "",
        expiresAt=(report.pdf_expires_at or datetime.now(UTC)).isoformat(),
    )
