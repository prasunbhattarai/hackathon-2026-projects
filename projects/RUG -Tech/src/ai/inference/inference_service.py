from pathlib import Path
from typing import Dict
import json

from pipeline.predict_pipeline import TEST_IMAGE, predict_image
from .report import (
    get_primary_diagnosis,
    generate_doctor_sections,
    generate_patient_report
)


def run_full_pipeline(image_path: Path) -> Dict:
    # Step 1: Prediction
    prediction = predict_image(image_path)

    # Step 2: Primary diagnosis
    primary, primary_prob, margin, confidence = get_primary_diagnosis(prediction)

    # Step 3: Doctor report (LLM)
    doctor_output = generate_doctor_sections(prediction)

    doctor_report = {
        "primary_diagnosis": {
            "condition": primary,
            "confidence_score": round(primary_prob, 2),
            "confidence_level": confidence,
            "margin_vs_next": round(margin, 2),
        },
        "clinical_interpretation": doctor_output["clinical_interpretation"],
        "suggested_follow_up": doctor_output["follow_up"],
    }

    # Step 4: Patient report (LLM)
    patient_report = generate_patient_report(prediction, doctor_output)

    return {
        "prediction": prediction,
        "doctor_report": doctor_report,
        "patient_report": patient_report,
    }


if __name__ == "__main__":
	result = run_full_pipeline(TEST_IMAGE)
	print(json.dumps(result, indent=2))
