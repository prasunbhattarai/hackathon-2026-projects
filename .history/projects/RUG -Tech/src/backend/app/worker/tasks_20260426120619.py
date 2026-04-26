"""
Celery tasks for the FundusAI analysis pipeline.

Task: run_analysis
------------------
Triggered by case_service.upload_case after the image is stored on Cloudinary.

Pipeline stages (executed inside the worker process, not the API process):
  1. Download image bytes from Cloudinary URL
  2. Run AI inference (DR + Glaucoma + HR models)
  3. Compute priority score / tier
  4. Persist AnalysisResult + update Case status → AWAITING_REVIEW
  5. On any failure → update Case status → FAILED

Because the AI inference modules are still being trained, this task ships
with a *simulated* pipeline that produces realistic dummy outputs.
When the real inference module is ready, replace the `_run_inference` call.
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
from app.schemas.enums import (
    CaseStatus,
    DecisionConfidence,
    DRStatus,
    ImageQuality,
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


# ── simulated inference ────────────────────────────────────────────────────────


def _run_inference(image_url: str) -> dict[str, Any]:
    """
    Simulated AI inference — returns realistic but deterministic-ish outputs.
    Replace this function body with real model calls in the AI integration PR.
    """
    # Determinism: hash the URL so the same image always produces the same result
    seed = hash(image_url) % 1000

    dr_options = [DRStatus.NONE, DRStatus.MILD, DRStatus.MODERATE, DRStatus.SEVERE, DRStatus.PDR]
    risk_options = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]

    dr_status = dr_options[seed % len(dr_options)].value
    glaucoma_risk = risk_options[(seed // 5) % len(risk_options)].value
    hr_risk = risk_options[(seed // 7) % len(risk_options)].value

    dr_confidence = round(0.60 + (seed % 40) / 100, 2)
    glaucoma_confidence = round(0.55 + (seed % 45) / 100, 2)
    hr_confidence = round(0.50 + (seed % 50) / 100, 2)

    if dr_status in (DRStatus.SEVERE.value, DRStatus.PDR.value):
        recommendation = "Urgent ophthalmology referral recommended. Proliferative or severe non-proliferative DR detected."
        final_decision = "High risk — immediate specialist review required"
        decision_confidence = DecisionConfidence.CLEAR.value
    elif glaucoma_risk == RiskLevel.HIGH.value:
        recommendation = "Glaucoma screening and intraocular pressure measurement advised."
        final_decision = "Elevated glaucoma risk detected"
        decision_confidence = DecisionConfidence.SUSPICIOUS.value
    elif dr_status == DRStatus.NONE.value and glaucoma_risk == RiskLevel.LOW.value and hr_risk == RiskLevel.LOW.value:
        recommendation = "No significant findings. Routine follow-up in 12 months."
        final_decision = "No significant pathology detected"
        decision_confidence = DecisionConfidence.CLEAR.value
    else:
        recommendation = "Mild abnormalities detected. Follow-up in 6 months recommended."
        final_decision = "Mild findings — monitor and follow up"
        decision_confidence = DecisionConfidence.UNCERTAIN.value

    return {
        "dr_status": dr_status,
        "dr_confidence": dr_confidence,
        "dr_severity_level": dr_status,
        "glaucoma_risk": glaucoma_risk,
        "glaucoma_confidence": glaucoma_confidence,
        "hr_risk": hr_risk,
        "hr_confidence": hr_confidence,
        "final_decision": final_decision,
        "recommendation": recommendation,
        "rag_justification": "Simulated RAG context: clinical guidelines indicate timely referral for DR grade ≥ Severe.",
        "decision_confidence": decision_confidence,
    }


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

        # ── image quality check (simple: always GOOD for now) ──────────────
        image_quality = ImageQuality.GOOD.value

        # ── run inference ──────────────────────────────────────────────────
        inference = _run_inference(case.image_url)

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
            decision_confidence=inference["decision_confidence"],
            severity_level=inference["dr_severity_level"],
        )
        db.add(analysis)

        # ── update case ────────────────────────────────────────────────────
        case.status = CaseStatus.AWAITING_REVIEW.value
        case.image_quality = image_quality
        case.priority_score = priority_score
        case.priority_tier = priority_tier

        db.commit()

        logger.info(
            "run_analysis: complete — case_id=%s priority=%s tier=%s",
            case_id,
            priority_score,
            priority_tier,
        )
        return {
            "status": "complete",
            "case_id": case_id,
            "priority_score": priority_score,
            "priority_tier": priority_tier,
            "dr_status": inference["dr_status"],
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
