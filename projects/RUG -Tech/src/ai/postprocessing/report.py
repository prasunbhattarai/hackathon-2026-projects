from typing import Any, Mapping

from ai.integrations.gemini import GeminiJSONClient


def build_patient_prompt(data: Any) -> str:
	disease = getattr(data, "disease", "")
	probability = getattr(data, "probability", "")
	details = getattr(data, "details", {})

	# Support dict-like inputs in addition to Pydantic objects.
	if isinstance(data, Mapping):
		disease = data.get("disease", disease)
		probability = data.get("probability", probability)
		details = data.get("details", details)

	return f"""
You are a patient communication assistant.

Generate a patient-friendly explanation that is simple, calm, and easy to understand.
Avoid clinical jargon and do not sound alarming.

Generate:
1. A clear patient report in plain language
2. A short summary for the patient
3. A risk level using simple terms
4. Practical next-step recommendation for the patient

Prediction Data:
Disease: {disease}
Probability: {probability}
Details: {details}

Output JSON format:

{{
\"report\": \"...\",
\"summary\": \"...\",
\"risk\": \"...\",
\"recommendation\": \"...\"
}}
"""


def generate_report_json(data: Any, client: GeminiJSONClient | None = None) -> dict:
	prompt = build_patient_prompt(data)
	gemini_client = client or GeminiJSONClient()
	return gemini_client.generate_json(prompt)
