"""
Celery tasks for the FundusAI analysis pipeline.

Task: run_analysis
------------------
Triggered by case_service.upload_case after the image is stored on Cloudinary.

Pipeline stages (executed inside the worker process, not the API process):
    1. Download image bytes from storage URL
    2. Run backend quality gate (when available)
    3. Run AI inference (DR + Glaucoma + HR models)
    4. Persist AnalysisResult + update Case status → AWAITING_REVIEW
    5. Auto-generate doctor/patient reports + PDFs
    6. On any failure → update Case status → FAILED
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from celery import Task
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.analysis_result import AnalysisResult
from app.models.case import Case
from app.services import report_service
from app.services.ai_integration import (
    AIIntegrationError,
    AIQualityRejectedError,
    run_backend_ai_pipeline,
    serialize_for_logs,
)
from app.schemas.enums import (
    CaseStatus,
    DRStatus,
    PriorityTier,
    RiskLevel,
)
from app.worker.celery_app import celery_app

logger = logging.getLogger(__name__)


# ── priority scoring ────────────────────────────────────────────────────────────

_DR_WEIGHT: dict[str, float] = {
    DRStatus.NONE.value: 0.0,
    DRStatus.MILD.value: 0.2,
    DRStatus.MODERATE.value: 0.5,
    DRStatus.SEVERE.value: 0.8,
    DRStatus.PDR.value: 1.0,
}

_RISK_WEIGHT: dict[str, float] = {
    RiskLevel.LOW.value: 0.1,
    RiskLevel.MEDIUM.value: 0.5,
    RiskLevel.HIGH.value: 0.9,
}


def _compute_priority(result: dict[str, Any]) -> tuple[float, str]:
    """
    Weighted priority score in [0, 1].

    priority = 0.5 * dr_weight + 0.3 * glaucoma_weight + 0.2 * hr_weight
    """
    dr = _DR_WEIGHT.get(result.get("dr_status", DRStatus.NONE.value), 0.0)
    glaucoma = _RISK_WEIGHT.get(result.get("glaucoma_risk", RiskLevel.LOW.value), 0.1)
    hr = _RISK_WEIGHT.get(result.get("hr_risk", RiskLevel.LOW.value), 0.1)

    score = round(0.5 * dr + 0.3 * glaucoma + 0.2 * hr, 3)

    if score >= 0.7:
        tier = PriorityTier.CRITICAL.value
    elif score >= 0.45:
        tier = PriorityTier.HIGH.value
    elif score >= 0.2:
        tier = PriorityTier.MEDIUM.value
    else:
        tier = PriorityTier.LOW.value

    return score, tier


# ── celery task ────────────────────────────────────────────────────────────────


@celery_app.task(
    bind=True,
    name="app.worker.tasks.run_analysis",
    max_retries=2,
    default_retry_delay=30,
    queue="analysis",
    acks_late=True,
)
def run_analysis(self: Task, case_id: str) -> dict[str, Any]:
    """
    Run the full AI analysis pipeline for a case.

    Args:
        case_id: UUID string of the Case to analyse.

    Returns:
        A dict summary of the analysis result (logged by Celery result backend).
    """
    logger.info("run_analysis: starting — case_id=%s (attempt %d)", case_id, self.request.retries + 1)

    db: Session = SessionLocal()
    try:
        case = db.get(Case, uuid.UUID(case_id))
        if case is None:
            logger.warning("run_analysis: case %s not found, skipping", case_id)
            return {"status": "skipped", "reason": "case_not_found"}

        if case.status != CaseStatus.PROCESSING.value:
            logger.info("run_analysis: case %s already %s, skipping", case_id, case.status)
            return {"status": "skipped", "reason": f"already_{case.status}"}

        # ── run quality gate + real inference ─────────────────────────────
        try:
            inference = run_backend_ai_pipeline(case.image_url)
        except AIQualityRejectedError as quality_exc:
            case.status = CaseStatus.QUALITY_FAILED.value
            case.image_quality = quality_exc.image_quality
            case.priority_score = 0.0
            case.priority_tier = PriorityTier.LOW.value
            db.commit()
            logger.info(
                "run_analysis: quality rejected — case_id=%s quality=%s reason=%s",
                case_id,
                quality_exc.image_quality,
                quality_exc.reason,
            )
            return {
                "status": "quality_failed",
                "case_id": case_id,
                "image_quality": quality_exc.image_quality,
                "reason": quality_exc.reason,
            }
        except AIIntegrationError:
            raise

        # ── compute priority ───────────────────────────────────────────────
        priority_score, priority_tier = _compute_priority(inference)

        # ── persist AnalysisResult ─────────────────────────────────────────
        analysis = AnalysisResult(
            id=uuid.uuid4(),
            case_id=case.id,
            dr_status=inference["dr_status"],
            dr_confidence=inference["dr_confidence"],
            dr_severity_level=inference["dr_severity_level"],
            glaucoma_risk=inference["glaucoma_risk"],
            glaucoma_confidence=inference["glaucoma_confidence"],
            hr_risk=inference["hr_risk"],
            hr_confidence=inference["hr_confidence"],
            final_decision=inference["final_decision"],
            recommendation=inference["recommendation"],
            rag_justification=inference["rag_justification"],
            heatmap_url=inference.get("heatmap_url"),
            decision_confidence=inference["decision_confidence"],
            severity_level=inference["dr_severity_level"],
        )
        db.add(analysis)

        # ── update case ────────────────────────────────────────────────────
        case.status = CaseStatus.AWAITING_REVIEW.value
        case.image_quality = inference["image_quality"]
        case.priority_score = priority_score
        case.priority_tier = priority_tier

        db.commit()

        # ── auto-generate reports right after successful inference ────────
        try:
            report_service.generate_reports_for_case(
                db,
                str(case.id),
                patient_report_json=inference.get("patient_report_json"),
            )
        except Exception as report_exc:
            # Keep analysis successful even if report generation is temporarily unavailable.
            logger.warning(
                "run_analysis: report generation failed — case_id=%s error=%s",
                case_id,
                report_exc,
            )

        logger.info(
            "run_analysis: complete — case_id=%s priority=%s tier=%s inference=%s",
            case_id,
            priority_score,
            priority_tier,
            serialize_for_logs(inference),
        )
        return {
            "status": "complete",
            "case_id": case_id,
            "priority_score": priority_score,
            "priority_tier": priority_tier,
            "dr_status": inference["dr_status"],
            "image_quality": inference["image_quality"],
        }

    except Exception as exc:
        db.rollback()
        logger.error("run_analysis: error for case %s: %s", case_id, exc, exc_info=True)

        # Mark case as FAILED so the doctor knows something went wrong
        try:
            case = db.get(Case, uuid.UUID(case_id))
            if case and case.status == CaseStatus.PROCESSING.value:
                case.status = CaseStatus.FAILED.value
                db.commit()
        except Exception:
            pass

        raise self.retry(exc=exc)

    finally:
        db.close()
