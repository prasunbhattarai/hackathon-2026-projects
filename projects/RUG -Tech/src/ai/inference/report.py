import os
import json
from pathlib import Path
from google import genai
from dotenv import load_dotenv
from datetime import datetime
# Load environment variables
load_dotenv()



# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Path to prediction JSON
PREDICTION_FILE = "integrations/prediction.json"




def load_prediction():
    if not os.path.exists(PREDICTION_FILE):
        raise FileNotFoundError(f"Prediction file not found: {PREDICTION_FILE}")
    
    with open(PREDICTION_FILE, "r") as f:
        return json.load(f)



def get_primary_diagnosis(data):
    scores = {
        "Diabetic Retinopathy": data["DR"]["probability"],
        "Glaucoma": data["Glaucoma"]["probability"],
        "Hypertensive Retinopathy": data["HR"]["probability"]
    }

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    primary, primary_prob = sorted_scores[0]
    next_prob = sorted_scores[1][1]

    margin = primary_prob - next_prob

    if primary_prob > 0.8:
        confidence = "High"
    elif primary_prob > 0.6:
        confidence = "Moderate"
    else:
        confidence = "Low"

    return primary, primary_prob, margin, confidence

def generate_doctor_sections(data):
    prompt = f"""
You are a retinal specialist.

Analyze this EXACT case and generate DOCTOR-LEVEL output.

DATA:
{json.dumps(data, indent=2)}

RULES:

1. CLINICAL INTERPRETATION
- 4–6 bullet points
- MUST reference exact numbers (probabilities, margins, severity distribution)
- Highlight ambiguity, co-morbidity risk, or competing signals
- No generic phrases

2. SUGGESTED FOLLOW-UP (IMPORTANT)
- This is for clinicians, NOT patients
- Must be detailed and actionable
- Include:
  • urgency level (routine / semi-urgent / urgent)
  • specific diagnostic tests (OCT, fundus photography, visual field, IOP, etc.)
  • referral type (retina specialist, glaucoma specialist, etc.)
  • monitoring interval
  • risk-based reasoning (based on THIS data)
- No vague statements like "monitor closely"
- No disclaimers

STYLE:
- Bullet points only
- Dense, clinical, decision-oriented

OUTPUT FORMAT (STRICT JSON):
{{
  "clinical_interpretation": ["...", "..."],
  "follow_up": ["...", "..."]
}}
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    return json.loads(response.text)



def generate_report_json():
    data = load_prediction()

    primary, primary_prob, margin, confidence = get_primary_diagnosis(data)

    gemini_output = generate_doctor_sections(data)

    final_output = {
        "case_info": {
            "image_id": "IMG_1023",
            "scan_date": str(datetime.now().date()),
            "system_version": "v1.2.0"
        },
        "primary_diagnosis": {
            "condition": primary,
            "confidence_score": round(primary_prob, 2),
            "confidence_level": confidence,
            "margin_vs_next": round(margin, 2)
        },
        "model_outputs": data,
        "clinical_interpretation": gemini_output["clinical_interpretation"],
        "suggested_follow_up": gemini_output["follow_up"]
    }

    print(json.dumps(final_output, indent=2))
    

def generate_patient_report(data, doctor_output):
    prompt = f"""
You are a medical communication assistant specialized in converting clinical ophthalmology reports into patient-friendly language.

Your job is to translate doctor-level findings into a clear, calm, and easy-to-understand explanation for patients.

You must preserve medical accuracy but completely remove clinical jargon.

---

INPUT DATA:
{json.dumps(data, indent=2)}

DOCTOR INSIGHTS (CLINICAL LEVEL):
{json.dumps(doctor_output, indent=2)}

---

RULES:

1. LANGUAGE RULES
- Use simple everyday language
- Avoid medical jargon (or explain it in very simple terms if unavoidable)
- Never mention AI, models, systems, or probability models
- Avoid technical ophthalmology terms unless explained simply
- Do NOT include treatment instructions or prescriptions

2. MEDICAL ACCURACY RULES
- Preserve clinical meaning from doctor insights
- If risk or probability is mentioned, translate it into:
  "low chance", "moderate chance", or "high chance"
  OR "X out of 100 people" if necessary
- Do NOT exaggerate or downplay risk

3. TONE RULES
- Calm, supportive, and neutral
- No fear-inducing language
- No false reassurance (avoid “nothing to worry about”)

4. STRUCTURE ALIGNMENT (INSPIRED BY CLINICAL FLOW)
- Your output MUST follow this logical flow:
  a) What the scan/report suggests (interpretation → simplified)
  b) What conditions may be present (simplified list)
  c) What this means for the patient (severity + risk in simple terms)
  d) What should be done next (general guidance only, no treatment)
  e) Urgency level (low / medium / high)

---

OUTPUT FORMAT (STRICT JSON):

{{
  "summary": "4–6 lines explaining what the eye scan/report suggests in simple terms",
  
  "possible_conditions": [
    "Condition 1 explained in simple words",
    "Condition 2 explained in simple words"
  ],
  
  "what_this_means": "Simple explanation of severity, risk level, and what it implies in daily life",
  
  "next_steps": "General next steps such as visiting a doctor or getting further checks, explained simply without medical instructions",
  
  "urgency": "low / medium / high"
}}
"""
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    return json.loads(response.text)



if __name__ == "__main__":
    generate_report_json()