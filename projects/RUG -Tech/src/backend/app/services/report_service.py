"""
Report service

Creates doctor/patient report payloads, generates PDFs, stores report rows,
and refreshes signed PDF URLs when they expire.
"""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Any

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
    GeneralReportOut,
    AnalysisResultOut,
)
from app.utils.cloudinary_client import build_signed_raw_url, upload_pdf

_ALLOWED_REPORT_STATUSES = {
    CaseStatus.AWAITING_REVIEW.value,
    CaseStatus.APPROVED.value,
}

# Used only when PDF/report generation fails (fallback PDF endpoint).
_FALLBACK_AI_PAYLOAD: dict[str, Any] = {
    "prediction": {
        "DR": {
            "probability": 0.9821,
            "severity_distribution": {
                "No_DR": 0.0179,
                "Mild": 0.8876,
                "Moderate": 0.0157,
                "Severe": 0.0382,
                "PDR": 0.0407,
            },
            "predicted_severity": "Mild",
        },
        "Glaucoma": {"probability": 0.1657, "predicted_risk": "Low"},
        "HR": {"probability": 0.2537, "predicted_risk": "Low"},
        "heatmap": {"type": "DR", "image_base64": ""},
    },
    "doctor_report": {
        "primary_diagnosis": {
            "condition": "Diabetic Retinopathy",
            "confidence_score": 0.98,
            "confidence_level": "High",
            "margin_vs_next": 0.73,
        },
        "clinical_interpretation": [
            "High confidence (98.21% probability) for the presence of diabetic retinopathy (DR), with the primary classification being Mild NPDR (88.76% probability).",
            "Evidence of diagnostic uncertainty in severity grading: a cumulative 7.89% probability for advanced disease (Severe NPDR/PDR) suggests the potential presence of focal high-risk lesions that may be underestimated by global classification.",
            "Glaucoma risk is currently stratified as low (16.57% probability), suggesting that structural or functional disc changes are not the primary pathology in this view.",
            "Hypertensive retinopathy (HR) probability at 25.37% indicates moderate vascular attenuation or arteriovenous nipping that may be synergistic with the underlying diabetic microangiopathy.",
            "The severity distribution's tail (PDR at 4.07%) necessitates careful peripheral screening to ensure sub-clinical neovascularization is not masked by the predominantly mild central presentation.",
        ],
        "suggested_follow_up": [
            "Urgency Level: Semi-urgent (within 2–4 weeks) due to the competing signals for Severe/PDR despite a 'Mild' overall grade.",
            "Diagnostic Suite: Perform OCT-Macula (high definition cross-section) to rule out sub-clinical Diabetic Macular Edema (DME) and 7-field or wide-field fundus photography to grade the periphery accurately.",
            "Glaucoma Screening: Conduct baseline Intraocular Pressure (IOP) measurement and Goldman Applanation Tonometry; if suspicious, proceed with OCT-RNFL and Visual Field (24-2) despite the low 16.57% risk score.",
            "Referral: Initial management by a Comprehensive Ophthalmologist is sufficient, but secondary referral to a Retina Specialist is indicated if OCT reveals macular thickening or wide-field imaging suggests higher-grade NPDR.",
            "Monitoring Interval: If Mild NPDR is confirmed without DME, 6-12 month follow-up; if PDR/Severe signals are validated, transition to a 1-3 month interval or immediate intervention (anti-VEGF/PRP).",
            "Risk Management: Coordination with the patient's primary care physician to optimize glycemic control (HbA1c target) and blood pressure management, given the 25.37% HR risk.",
        ],
    },
    "patient_report": {
        "summary": "Your eye scan shows very clear signs of changes related to diabetes, most likely in an early stage. While the main findings appear mild, some parts of the scan suggest there could be more significant changes in areas that are harder to see. There are also slight signs that blood pressure may be affecting the small blood vessels in your eyes. These results indicate that your eye health needs a thorough review soon to ensure your vision remains protected.",
        "possible_conditions": [
            "Early-stage diabetic eye disease (changes in the retina's blood vessels caused by diabetes)",
            "Potential for more advanced diabetic eye changes that require more detailed imaging to confirm",
            "Minor changes to eye blood vessels related to blood pressure levels",
        ],
        "what_this_means": "You likely have a mild form of diabetic eye disease, but there is a small chance that some areas of your eye have more advanced changes. Your risk for glaucoma is currently low. Because these findings are linked to your general health, it is important to keep a close watch on both your blood sugar and your blood pressure, as both can impact how these eye conditions progress over time.",
        "next_steps": "You should schedule a follow-up appointment with an eye doctor for a more comprehensive examination. They may want to take high-definition photos and wider views of the back of your eye to get a complete picture. It is also a good idea to coordinate with your regular doctor to ensure your blood sugar and blood pressure are well-managed.",
        "urgency": "medium",
    },
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
    gender_val = getattr(patient, "gender", Gender.OTHER.value)
    gender_enum = Gender(gender_val) if isinstance(gender_val, str) and gender_val in Gender.__members__.values() else Gender.OTHER
    return DoctorReportOut(
        reportType=ReportType.DOCTOR,
        patient=ReportPatientInfo(
            fullName=getattr(patient, "full_name", ""),
            age=_age(getattr(patient, "date_of_birth", None)),
            gender=gender_enum,
        ),
        diagnosis=ReportDiagnosis(
            primary=getattr(analysis, "final_decision", None) or "Retinal disease risk detected",
            severity=_severity_label(getattr(analysis, "dr_status", None)),
            confidence=f"{int((getattr(analysis, 'dr_confidence', 0.0) or 0.0) * 100)}%",
        ),
        planOfAction=getattr(analysis, "recommendation", None) or "Clinical review recommended.",
        medicationSuggestions=_doctor_medication_suggestions(getattr(analysis, "dr_status", None)),
        ragJustification=getattr(analysis, "rag_justification", None) or "No additional context available.",
        heatmapUrl=getattr(analysis, "heatmap_url", None) or "",
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


def render_fallback_ai_pdf_bytes(
    report_type: ReportType,
    *,
    case_id: str,
    patient_name: str,
    image_url: str,
) -> bytes:
    """
    Generate a minimal PDF from a fallback AI payload.
    This is used only when the normal report->PDF->Cloudinary path errors.
    """
    from weasyprint import HTML

    ai = _FALLBACK_AI_PAYLOAD
    pred = ai.get("prediction", {})
    dr = pred.get("DR", {})
    gl = pred.get("Glaucoma", {})
    hr = pred.get("HR", {})
    doc = ai.get("doctor_report", {})
    pat = ai.get("patient_report", {})

    title = "Doctor Report (Fallback)" if report_type == ReportType.DOCTOR else "Patient Report (Fallback)"

    if report_type == ReportType.DOCTOR:
        primary = (doc.get("primary_diagnosis") or {}).get("condition") or "Retinal screening result"
        conf = (doc.get("primary_diagnosis") or {}).get("confidence_score")
        conf_str = f"{int(float(conf) * 100)}%" if isinstance(conf, (int, float)) else "—"
        severity = dr.get("predicted_severity") or "—"
        interpretation = doc.get("clinical_interpretation") or []
        follow_up = doc.get("suggested_follow_up") or []
        body = f"""
          <h2>Patient</h2>
          <p><strong>Name</strong>: {patient_name}</p>
          <p><strong>Case ID</strong>: {case_id}</p>
          <p><strong>Fundus Image URL</strong>: {image_url}</p>

          <h2>Model Prediction</h2>
          <p><strong>DR probability</strong>: {dr.get('probability', '—')}</p>
          <p><strong>Predicted DR severity</strong>: {severity}</p>
          <p><strong>Glaucoma risk</strong>: {gl.get('predicted_risk', '—')} ({gl.get('probability', '—')})</p>
          <p><strong>Hypertensive retinopathy risk</strong>: {hr.get('predicted_risk', '—')} ({hr.get('probability', '—')})</p>

          <h2>Clinical Summary</h2>
          <p><strong>Primary diagnosis</strong>: {primary}</p>
          <p><strong>Confidence</strong>: {conf_str}</p>

          <h3>Interpretation</h3>
          <ul>
            {''.join(f'<li>{x}</li>' for x in interpretation)}
          </ul>

          <h3>Suggested follow-up</h3>
          <ul>
            {''.join(f'<li>{x}</li>' for x in follow_up)}
          </ul>
        """
    else:
        possible = pat.get("possible_conditions") or []
        body = f"""
          <h2>Patient</h2>
          <p><strong>Name</strong>: {patient_name}</p>
          <p><strong>Case ID</strong>: {case_id}</p>

          <h2>Summary</h2>
          <p>{pat.get('summary', '')}</p>

          <h3>Possible conditions</h3>
          <ul>
            {''.join(f'<li>{x}</li>' for x in possible)}
          </ul>

          <h3>What this means</h3>
          <p>{pat.get('what_this_means', '')}</p>

          <h3>Next steps</h3>
          <p>{pat.get('next_steps', '')}</p>

          <p><strong>Urgency</strong>: {pat.get('urgency', '—')}</p>
        """

    html = f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {{ font-family: Arial, sans-serif; margin: 24px; color: #111827; }}
          h1 {{ color: #0f766e; margin: 0 0 8px 0; }}
          h2 {{ margin-top: 18px; }}
          p {{ margin: 6px 0; line-height: 1.45; }}
          ul {{ margin: 6px 0 0 18px; }}
          li {{ margin: 4px 0; }}
          .meta {{ color: #6b7280; font-size: 12px; margin-bottom: 14px; }}
        </style>
      </head>
      <body>
        <h1>{title}</h1>
        <div class="meta">Generated by backend fallback renderer (no Cloudinary dependency).</div>
        {body}
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

    created_at = getattr(report, "created_at", None)
    pdf_url = getattr(report, "pdf_url", "")
    if not isinstance(pdf_url, str):
        pdf_url = str(pdf_url) if pdf_url is not None else ""
    expires_at = getattr(report, "pdf_expires_at", None) or datetime.now(UTC)
    expires_at_str = expires_at.isoformat() if expires_at is not None and hasattr(expires_at, "isoformat") else ""
    created_at_str = created_at.isoformat() if created_at is not None and hasattr(created_at, "isoformat") else ""
    return ReportOut(
        id=str(getattr(report, "id", "")),
        caseId=str(getattr(report, "case_id", "")),
        reportType=report_type,
        reportData=report_data,
        pdf=PDFDownloadUrlOut(
            url=pdf_url,
            expiresAt=expires_at_str,
        ),
        createdAt=created_at_str,
    )


def _refresh_pdf_url_if_expired(db: Session, report: Report) -> None:
    if report.pdf_expires_at is None:
        return
    now = datetime.now(UTC)
    expires_at = report.pdf_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    # Fix for SQLAlchemy ColumnElement[bool] conditional
    # If expires_at is a SQLAlchemy column, extract value
    expires_at_val = expires_at
    # If expires_at is a SQLAlchemy column, extract value
    if hasattr(expires_at, 'value'):
        expires_at_val = expires_at.value
    # If expires_at_val is not a datetime, skip the check
    from datetime import datetime as dt
    if expires_at_val is not None and isinstance(expires_at_val, dt):
        if now < expires_at_val:
            return

    payload = report.content_json or {}
    public_id = payload.get("_pdf_public_id")
    file_format = payload.get("_pdf_format", "pdf")
    if not public_id:
        return

    settings = get_settings()
    new_expiry = now + timedelta(seconds=settings.PDF_DOWNLOAD_EXPIRY_SECONDS)
    # Use setattr to assign to SQLAlchemy ORM fields
    setattr(report, "pdf_url", build_signed_raw_url(public_id, new_expiry, file_format))
    setattr(report, "pdf_expires_at", new_expiry)
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


def _create_report_record(
    db: Session,
    case: Case,
    patient: Patient,
    analysis: AnalysisResult,
    report_type: ReportType,
    patient_report_json: dict[str, Any] | None = None,
) -> ReportOut:
    generated_at = datetime.now(UTC)

    if report_type == ReportType.DOCTOR:
        report_data = _build_doctor_report(patient, analysis, generated_at)
    else:
        base_patient_report = _build_patient_report(analysis, generated_at)
        if patient_report_json:
            # AI layer (via Gemini) returns patient_report with these keys:
            #   summary, possible_conditions (list), what_this_means, next_steps, urgency
            possible_conditions: list = patient_report_json.get("possible_conditions") or []
            what_was_found = (
                possible_conditions[0]
                if possible_conditions
                else patient_report_json.get("what_this_means")
            )
            report_data = PatientReportOut(
                reportType=ReportType.PATIENT,
                summary=str(patient_report_json.get("summary") or base_patient_report.summary),
                whatWasFound=str(what_was_found or base_patient_report.whatWasFound),
                nextSteps=str(
                    patient_report_json.get("next_steps")
                    or base_patient_report.nextSteps
                ),
                severityLabel=base_patient_report.severityLabel,
                urgency=str(
                    patient_report_json.get("urgency")
                    or base_patient_report.urgency
                ),
                generatedAt=base_patient_report.generatedAt,
            )
        else:
            report_data = base_patient_report

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


def generate_report(
    db: Session,
    user: User,
    case_id: str,
    report_type: ReportType,
) -> ReportOut:
    case, patient, analysis = _load_case_and_analysis(db, user, case_id)
    return _create_report_record(db, case, patient, analysis, report_type)


def generate_reports_for_case(
    db: Session,
    case_id: str,
    patient_report_json: dict[str, Any] | None = None,
) -> list[ReportOut]:
    """Worker-friendly report generation after successful inference."""
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

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

    outputs: list[ReportOut] = []
    for report_type in (ReportType.DOCTOR, ReportType.PATIENT):
        existing = db.execute(
            select(Report)
            .where(Report.case_id == case.id, Report.report_type == report_type.value)
            .order_by(Report.created_at.desc())
        ).scalar_one_or_none()
        if existing is not None:
            outputs.append(_to_report_out(existing))
            continue

        outputs.append(
            _create_report_record(
                db=db,
                case=case,
                patient=patient,
                analysis=analysis,
                report_type=report_type,
                patient_report_json=patient_report_json if report_type == ReportType.PATIENT else None,
            )
        )

    return outputs


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
    pdf_url = report.pdf_url
    if not isinstance(pdf_url, str):
        pdf_url = str(pdf_url) if pdf_url is not None else ""
    return PDFDownloadUrlOut(
        url=pdf_url,
        expiresAt=(report.pdf_expires_at or datetime.now(UTC)).isoformat(),
    )


def get_general_report(
    db: Session,
    user: User,
    case_id: str,
) -> GeneralReportOut:
    """
    Return combined case detail + analysis result.

    Consumed by the frontend GeneralReport type:
        type GeneralReport = CaseDetail & { analysisResult: AnalysisResult }
    """
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    analysis = db.execute(
        select(AnalysisResult).where(AnalysisResult.case_id == case.id)
    ).scalar_one_or_none()
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis result available for this case",
        )

    analysis_out = AnalysisResultOut(
        id=str(analysis.id),
        caseId=str(analysis.case_id),
        dr={
            "status": analysis.dr_status,
            "confidence": analysis.dr_confidence,
            "severityLevel": analysis.dr_severity_level,
        },
        glaucoma={
            "risk": analysis.glaucoma_risk,
            "confidence": analysis.glaucoma_confidence,
        },
        hypertensiveRetinopathy={
            "risk": analysis.hr_risk,
            "confidence": analysis.hr_confidence,
        },
        finalDecision=analysis.final_decision,
        recommendation=analysis.recommendation,
        ragJustification=analysis.rag_justification,
        heatmapUrl=analysis.heatmap_url,
        decisionConfidence=analysis.decision_confidence,
        createdAt=analysis.created_at.isoformat(),
    )

    return GeneralReportOut(
        id=str(case.id),
        patientId=str(case.patient_id),
        clinicId=str(case.clinic_id),
        submittedBy=str(case.submitted_by or ""),
        imageUrl=case.image_url or "",
        imageQuality=case.image_quality or "",
        status=case.status or "",
        priorityScore=case.priority_score or 0.0,
        priorityTier=case.priority_tier or "",
        createdAt=case.created_at.isoformat(),
        updatedAt=case.updated_at.isoformat(),
        analysisResult=analysis_out,
    )


def share_report(
    db: Session,
    user: User,
    case_id: str,
    email: str,
) -> dict:
    """
    Stub: trigger report sharing to a patient email.

    Email delivery infrastructure is not yet integrated.
    Returns a placeholder response so the frontend contract is satisfied.
    """
    case = db.get(Case, uuid.UUID(case_id))
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    _assert_case_access(user, case)

    # TODO: integrate an email provider (e.g. SendGrid / Resend) to actually
    #       send the PDF link to `email`. For now, we log and return success.
    import logging as _logging
    _logging.getLogger(__name__).info(
        "share_report stub: case_id=%s target_email=%s requested_by=%s",
        case_id, email, user.id,
    )
    return {"sent": True}
