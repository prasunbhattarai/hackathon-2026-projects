from __future__ import annotations

import importlib
import json
import logging
import sys
import tempfile
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import urlopen

from app.core.config import get_settings
from app.schemas.enums import DecisionConfidence, DRStatus, ImageQuality, RiskLevel

logger = logging.getLogger(__name__)

_ALLOWED_QUALITY_VALUES = {
    ImageQuality.GOOD.value,
    ImageQuality.BLURRY.value,
    ImageQuality.POOR_LIGHTING.value,
    ImageQuality.OVEREXPOSED.value,
    ImageQuality.NON_FUNDUS.value,
}

_DR_SEVERITY_MAP = {
    "no_dr": DRStatus.NONE.value,
    "none": DRStatus.NONE.value,
    "mild": DRStatus.MILD.value,
    "moderate": DRStatus.MODERATE.value,
    "severe": DRStatus.SEVERE.value,
    "pdr": DRStatus.PDR.value,
}


class AIIntegrationError(RuntimeError):
    """Raised when backend cannot execute AI pipeline."""


class AIQualityRejectedError(RuntimeError):
    """Raised when quality gate rejects an uploaded image."""

    def __init__(self, image_quality: str, reason: str | None = None) -> None:
        self.image_quality = image_quality
        self.reason = reason or "Image failed quality gate"
        super().__init__(self.reason)


def _add_ai_paths() -> None:
    """Make AI layer importable from backend worker process."""
    src_root = Path(__file__).resolve().parents[3]
    ai_root = src_root / "ai"
    for path in (src_root, ai_root):
        as_str = str(path)
        if as_str not in sys.path:
            sys.path.insert(0, as_str)


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _normalize_risk(value: Any) -> str:
    raw = str(value or RiskLevel.LOW.value).strip().lower()
    if raw == "high":
        return RiskLevel.HIGH.value
    if raw == "medium":
        return RiskLevel.MEDIUM.value
    return RiskLevel.LOW.value


def _normalize_dr_status(value: Any) -> str:
    raw = str(value or "No_DR").strip().replace("-", "_").replace(" ", "_").lower()
    return _DR_SEVERITY_MAP.get(raw, DRStatus.NONE.value)


def _quality_result_from_raw(raw: Any) -> tuple[bool, str, str | None]:
    """
    Normalize output from quality gate callable.

    Supported shapes:
      - bool
      - dict with keys like accepted/is_valid/is_fundus + image_quality + reason
      - string image_quality
    """
    if isinstance(raw, bool):
        return raw, (ImageQuality.GOOD.value if raw else ImageQuality.BLURRY.value), None

    if isinstance(raw, str):
        quality = raw.strip().lower()
        if quality not in _ALLOWED_QUALITY_VALUES:
            quality = ImageQuality.BLURRY.value
        return quality == ImageQuality.GOOD.value, quality, None

    if isinstance(raw, dict):
        accepted = bool(
            raw.get("accepted", raw.get("is_valid", raw.get("is_fundus", True)))
        )
        quality = str(
            raw.get("image_quality", raw.get("quality", ImageQuality.GOOD.value if accepted else ImageQuality.BLURRY.value))
        ).strip().lower()
        if quality not in _ALLOWED_QUALITY_VALUES:
            quality = ImageQuality.GOOD.value if accepted else ImageQuality.BLURRY.value
        reason = raw.get("reason") or raw.get("message")
        reason_text = str(reason) if reason else None
        return accepted, quality, reason_text

    return True, ImageQuality.GOOD.value, None


def _run_quality_gate(image_path: Path) -> tuple[bool, str, str | None]:
    settings = get_settings()
    if not settings.AI_ENABLE_QUALITY_GATE:
        return True, ImageQuality.GOOD.value, None

    module_name = settings.AI_QUALITY_GATE_MODULE.strip()
    function_name = settings.AI_QUALITY_GATE_FUNCTION.strip()
    if not module_name or not function_name:
        return True, ImageQuality.GOOD.value, None

    _add_ai_paths()

    module = None
    import_errors: list[str] = []
    for name in (module_name, f"ai.{module_name}"):
        try:
            module = importlib.import_module(name)
            break
        except Exception as exc:  # pragma: no cover - import diagnostics
            import_errors.append(f"{name}: {exc}")

    if module is None:
        logger.info(
            "Quality gate not available yet (%s). Falling back to accept-all.",
            " | ".join(import_errors),
        )
        return True, ImageQuality.GOOD.value, None

    checker = getattr(module, function_name, None)
    if checker is None:
        logger.info(
            "Quality gate function %s.%s not found yet. Falling back to accept-all.",
            module.__name__,
            function_name,
        )
        return True, ImageQuality.GOOD.value, None

    raw_result = checker(image_path)
    return _quality_result_from_raw(raw_result)


def _download_image_to_temp(image_url: str) -> Path:
    parsed = urlparse(image_url)
    suffix = Path(parsed.path).suffix or ".jpg"

    with urlopen(image_url, timeout=30) as response:
        payload = response.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(payload)
        return Path(temp_file.name)


def _run_prediction(image_path: Path) -> dict[str, Any]:
    _add_ai_paths()
    try:
        from inference.predict import run_prediction
    except Exception as exc:  # pragma: no cover - import error path
        raise AIIntegrationError(f"Could not import AI prediction entrypoint: {exc}") from exc

    try:
        result = run_prediction(image_path)
    except Exception as exc:
        raise AIIntegrationError(f"AI prediction failed: {exc}") from exc

    if not isinstance(result, dict):
        raise AIIntegrationError("AI prediction returned invalid payload")

    return result


def _generate_patient_json(raw_inference: dict[str, Any]) -> dict[str, Any] | None:
    """Optional Gemini narrative enhancement (falls back gracefully)."""
    settings = get_settings()
    if not settings.AI_ENABLE_GEMINI_REPORT:
        return None

    _add_ai_paths()
    try:
        from postprocessing.report import generate_report_json
    except Exception as exc:  # pragma: no cover - import error path
        logger.warning("Gemini postprocessing module unavailable: %s", exc)
        return None

    dr_probability = _safe_float(raw_inference.get("DR", {}).get("probability"), 0.0)
    input_payload = {
        "disease": "retinal_screening",
        "probability": dr_probability,
        "details": raw_inference,
    }

    try:
        response = generate_report_json(input_payload)
    except Exception as exc:
        logger.warning("Gemini report generation failed: %s", exc)
        return None

    if not isinstance(response, dict):
        return None
    if "error" in response:
        logger.info("Gemini report generation returned error payload: %s", response.get("error"))
        return None
    return response


def _choose_decision_confidence(dr_conf: float, glaucoma_conf: float, hr_conf: float) -> str:
    confidence = max(dr_conf, glaucoma_conf, hr_conf)
    if confidence >= 0.8:
        return DecisionConfidence.CLEAR.value
    if confidence >= 0.6:
        return DecisionConfidence.SUSPICIOUS.value
    return DecisionConfidence.UNCERTAIN.value


def _default_decision(dr_status: str, glaucoma_risk: str, hr_risk: str) -> tuple[str, str]:
    if dr_status in (DRStatus.SEVERE.value, DRStatus.PDR.value):
        return (
            "High risk - immediate specialist review required",
            "Urgent ophthalmology referral recommended due to advanced DR findings.",
        )
    if glaucoma_risk == RiskLevel.HIGH.value:
        return (
            "Elevated glaucoma risk detected",
            "Glaucoma screening and intraocular pressure measurement are advised.",
        )
    if hr_risk == RiskLevel.HIGH.value:
        return (
            "Elevated hypertensive retinopathy risk detected",
            "Systemic blood pressure review and retina follow-up are advised.",
        )
    return (
        "No severe pathology detected",
        "Routine clinical follow-up is recommended.",
    )


def run_backend_ai_pipeline(image_url: str) -> dict[str, Any]:
    """
    Run full backend-side AI orchestration.

    Returns normalized payload for AnalysisResult persistence and report generation.
    """
    temp_path = _download_image_to_temp(image_url)
    try:
        accepted, image_quality, quality_reason = _run_quality_gate(temp_path)
        if not accepted:
            raise AIQualityRejectedError(image_quality=image_quality, reason=quality_reason)

        raw = _run_prediction(temp_path)
        dr_section = raw.get("DR", {})
        glaucoma_section = raw.get("Glaucoma", {})
        hr_section = raw.get("HR", {})

        dr_status = _normalize_dr_status(dr_section.get("predicted_severity"))
        dr_conf = _clamp01(_safe_float(dr_section.get("probability"), 0.0))

        glaucoma_risk = _normalize_risk(glaucoma_section.get("predicted_risk"))
        glaucoma_conf = _clamp01(_safe_float(glaucoma_section.get("probability"), 0.0))

        hr_risk = _normalize_risk(hr_section.get("predicted_risk"))
        hr_conf = _clamp01(_safe_float(hr_section.get("probability"), 0.0))

        # ── Post-prediction non-fundus gate ──────────────────────────────────
        # If every disease probability is below the configured threshold the
        # image is almost certainly not a retinal fundus image (e.g. a car photo
        # will score near-zero on all three classifiers).
        threshold = settings.AI_NON_FUNDUS_THRESHOLD
        if dr_conf < threshold and glaucoma_conf < threshold and hr_conf < threshold:
            raise AIQualityRejectedError(
                image_quality=ImageQuality.NON_FUNDUS.value,
                reason=(
                    f"Non-fundus image detected: all disease probabilities below "
                    f"{threshold:.0%} (DR={dr_conf:.3f}, Glaucoma={glaucoma_conf:.3f}, "
                    f"HR={hr_conf:.3f})"
                ),
            )

        ai_patient_json = _generate_patient_json(raw)
        fallback_decision, fallback_recommendation = _default_decision(dr_status, glaucoma_risk, hr_risk)

        final_decision = str((ai_patient_json or {}).get("summary") or fallback_decision)
        recommendation = str((ai_patient_json or {}).get("recommendation") or fallback_recommendation)
        rag_justification = str(
            (ai_patient_json or {}).get("report")
            or "Model-based assessment generated from DR, glaucoma, and HR classifiers."
        )

        # ── Heatmap: AI saves to src/images/, backend uploads to Cloudinary ──
        # AI layer returns heatmap_path (local file path in src/images/).
        # Backend uploads it, keeps the Cloudinary URL, then deletes the local file.
        heatmap_url: str | None = None
        raw_heatmap_path = raw.get("heatmap_path") or raw.get("heatmapPath")
        if raw_heatmap_path:
            heatmap_local = Path(raw_heatmap_path)
            if heatmap_local.is_file():
                try:
                    from app.utils.cloudinary_client import upload_local_file
                    upload_result = upload_local_file(heatmap_local, folder="fundusai/heatmaps")
                    heatmap_url = upload_result.get("secure_url")
                except Exception as hm_exc:
                    logger.warning("Heatmap Cloudinary upload failed: %s", hm_exc)
                finally:
                    try:
                        heatmap_local.unlink(missing_ok=True)
                    except Exception:
                        logger.warning("Could not remove heatmap file: %s", heatmap_local)
            else:
                logger.warning("AI returned heatmap_path %s but file not found", raw_heatmap_path)
        else:
            # Fallback: old base64-style or direct URL in result dict
            raw_heatmap_url = raw.get("heatmapUrl") or raw.get("heatmap_url")
            if raw_heatmap_url and not str(raw_heatmap_url).startswith("data:"):
                heatmap_url = str(raw_heatmap_url)

        return {
            "image_quality": image_quality,
            "dr_status": dr_status,
            "dr_confidence": dr_conf,
            "dr_severity_level": dr_status,
            "glaucoma_risk": glaucoma_risk,
            "glaucoma_confidence": glaucoma_conf,
            "hr_risk": hr_risk,
            "hr_confidence": hr_conf,
            "final_decision": final_decision,
            "recommendation": recommendation,
            "rag_justification": rag_justification,
            "decision_confidence": _choose_decision_confidence(dr_conf, glaucoma_conf, hr_conf),
            "heatmap_url": str(heatmap_url) if heatmap_url else None,
            "raw_ai_output": raw,
            "patient_report_json": ai_patient_json,
        }
    except AIQualityRejectedError:
        raise
    except AIIntegrationError:
        raise
    except Exception as exc:
        raise AIIntegrationError(f"Unexpected AI pipeline failure: {exc}") from exc
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            logger.warning("Could not remove temp inference file: %s", temp_path)


def serialize_for_logs(payload: dict[str, Any]) -> str:
    safe_payload = {k: v for k, v in payload.items() if k not in {"raw_ai_output"}}
    return json.dumps(safe_payload, default=str)
