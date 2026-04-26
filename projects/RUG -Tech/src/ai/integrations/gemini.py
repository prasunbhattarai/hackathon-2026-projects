import json
import os
import re

import google.generativeai as genai


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3-flash-preview"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class GeminiJSONClient:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model = genai.GenerativeModel(model_name)

    @staticmethod
    def _clean_output(text: str):
        cleaned = re.sub(r"```json|```", "", text).strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "error": "Invalid JSON from model",
                "raw_output": text,
            }

    def generate_json(self, prompt: str):
        if not GEMINI_API_KEY:
            return {"error": "Missing GEMINI_API_KEY environment variable"}

        response = self.model.generate_content(prompt)
        return self._clean_output(response.text)
    